import PostMessage from "../models/postMessage.js";
import User from "../models/users.js";
import Notification from "../models/notification.js";
import PostReport from "../models/postReport.js";
import mongoose from "mongoose";
import recommendationService from "../services/recommendationService.js";
import fetch from "node-fetch";
import stringSimilarity from "string-similarity";

export const getPosts = async (req, res) => {
  const { page, summary } = req.query;

  try {
    const LIMIT = 8;
    const pageNumber = Number(page) || 1;
    const startIndex = (pageNumber - 1) * LIMIT;

    // Use estimated count for faster count when no filter is applied
    const total = await PostMessage.estimatedDocumentCount();

    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    // If caller requested a lightweight summary (e.g., main feed/dashboard),
    // trim heavy fields so the response is much smaller for hosted clients.
    if (summary === "true") {
      const summarized = posts.map((p) => {
        const obj = p.toObject();

        const commentsCount = Array.isArray(obj.comments)
          ? obj.comments.length
          : 0;

        // Keep selectedFile as-is so feed cards can navigate through
        // multiple images using left/right controls.
        const normalizedSelectedFile = Array.isArray(obj.selectedFile)
          ? obj.selectedFile
          : obj.selectedFile
            ? [obj.selectedFile]
            : [];

        return {
          _id: obj._id,
          title: obj.title,
          message: obj.message,
          name: obj.name,
          creator: obj.creator,
          tags: obj.tags,
          selectedFile: normalizedSelectedFile,
          likes: obj.likes,
          commentsCount,
          createdAt: obj.createdAt,
          authorImage: obj.authorImage,
          locationName: obj.locationName,
          location: obj.location,
        };
      });

      return res.status(200).json({
        data: summarized,
        currentPage: pageNumber,
        numberOfPages: Math.ceil(total / LIMIT),
      });
    }

    res.status(200).json({
      data: posts,
      currentPage: pageNumber,
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPublicPostStats = async (_req, res) => {
  try {
    const [totalPosts, totalUsers] = await Promise.all([
      PostMessage.countDocuments(),
      User.countDocuments(),
    ]);

    const locationNames = await PostMessage.distinct("locationName", {
      locationName: { $exists: true, $type: "string", $ne: "" },
    });

    const normalize = (value = "") =>
      value
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const countries = new Set();
    const places = new Set();

    // Build a canonical country-name set from built-in Intl data (no extra dependency).
    // This avoids incorrectly treating district/city names as countries.
    const countryNames = (() => {
      try {
        const displayNames = new Intl.DisplayNames(["en"], {
          type: "region",
        });
        const regionCodes = Intl.supportedValuesOf("region");
        return new Set(
          regionCodes
            .map((code) => displayNames.of(code))
            .filter(Boolean)
            .map((name) => normalize(name))
        );
      } catch (_error) {
        // Safe fallback for environments that do not support Intl region values.
        return new Set(["nepal", "india", "china", "united states"]);
      }
    })();

    const extractCountry = (locationName) => {
      const cleaned = String(locationName || "").trim();
      if (!cleaned) return null;

      // Fast-path for common Nepal representations.
      const normalizedFull = normalize(cleaned);
      if (normalizedFull.includes("nepal") || cleaned.includes("नेपाल")) {
        return "nepal";
      }

      const parts = cleaned
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      for (let i = parts.length - 1; i >= 0; i -= 1) {
        const candidate = normalize(parts[i]);
        if (countryNames.has(candidate)) {
          return candidate;
        }
      }

      return null;
    };

    locationNames.forEach((rawName) => {
      const cleaned = String(rawName || "").trim();
      if (!cleaned) return;

      places.add(normalize(cleaned));

      const country = extractCountry(cleaned);
      if (country) {
        countries.add(country);
      }
    });

    return res.status(200).json({
      totalPosts,
      totalUsers,
      totalPlaces: places.size,
      totalCountries: countries.size,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load public stats" });
  }
};


export const getPostsBySearch = async (req, res) => {
  const { search, tags, lat, lng, radius } = req.query;

  try {
    // Treat "none" or empty as no text search (frontend sends "none" when only tags are used)
    const hasSearch = search && search !== "none";
    // Frontend sends "none" when there is no tag filter, so treat that as empty
    const hasTags = tags && tags.trim().length > 0 && tags !== "none";
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    const hasLocationFilter =
      Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
    const radiusMeters = Number.isFinite(Number(radius))
      ? Math.max(1000, Number(radius))
      : 50000;

    // If no filters at all, just return latest posts (defensive fallback)
    if (!hasSearch && !hasTags && !hasLocationFilter) {
      const posts = await PostMessage.find().sort({ _id: -1 }).limit(20);
      return res.status(200).json(posts);
    }

    const haversineDistanceMeters = (lat1, lng1, lat2, lng2) => {
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371000;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let words = [];
    let tagArray = [];
    const andConditions = [];

    if (hasSearch) {
      // Split search into words and require **all** words to be present
      words = search.trim().split(/\s+/).filter(Boolean);

      words.forEach((word) => {
        const safe = escapeRegExp(word);
        // Match whole words in title/message and also check tags
        const regex = new RegExp(`\\b${safe}\\b`, "i");
        andConditions.push({
          $or: [
            { title: regex },
            { message: regex },
            { locationName: regex },
            { tags: { $in: [word.toLowerCase()] } },
          ],
        });
      });
    }

    if (hasTags) {
      tagArray = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t && t !== "none");

      if (tagArray.length > 0) {
        andConditions.push({ tags: { $in: tagArray } });
      }
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    let posts = await PostMessage.find(query).sort({ _id: -1 });

    // Re-rank by relevance when doing a text search so that
    // posts with the place/title/message match appear first.
    if (hasSearch && words.length > 0 && posts.length > 1) {
      const lowerWords = words.map((w) => w.toLowerCase());

      posts = posts
        .map((post) => {
          let score = 0;
          const title = (post.title || "").toLowerCase();
          const message = (post.message || "").toLowerCase();
          const locationName = (post.locationName || "").toLowerCase();
          const tags = Array.isArray(post.tags)
            ? post.tags.map((t) => (t || "").toLowerCase())
            : [];

          lowerWords.forEach((word) => {
            const inLocation = locationName.includes(word);
            const inTitle = title.includes(word);
            const inMessage = message.includes(word);
            const inTags = tags.includes(word);

            if (inLocation) score += 6; // strongest signal for place searches
            if (inTitle) score += 5;
            if (inTags) score += 4;
            if (inMessage) score += 2;
          });

          return { post, score };
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          // tie-breaker: newer posts first
          return (
            new Date(b.post.createdAt).getTime() -
            new Date(a.post.createdAt).getTime()
          );
        })
        .map((entry) => entry.post);
    }

    // Fuzzy fallback: if strict search returns no results, try approximate matching
    // so that small typos like "butwall" still surface "Butwal" posts.
    if (hasSearch && posts.length === 0) {
      const lowerSearch = search.toLowerCase().trim();
      // Limit to a reasonable number of recent candidates, optionally filtered by tags
      const baseQuery =
        tagArray && tagArray.length > 0 ? { tags: { $in: tagArray } } : {};

      const candidates = await PostMessage.find(baseQuery)
        .sort({ _id: -1 })
        .limit(200);

      const scored = candidates
        .map((post) => {
          const pieces = [];
          if (post.locationName) pieces.push(post.locationName);
          if (post.title) pieces.push(post.title);
          if (post.message) pieces.push(post.message);
          if (Array.isArray(post.tags)) pieces.push(...post.tags);

          const tokens = pieces
            .join(" ")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(Boolean);

          let maxScore = 0;
          tokens.forEach((token) => {
            const s = stringSimilarity.compareTwoStrings(lowerSearch, token);
            if (s > maxScore) maxScore = s;
          });

          return { post, score: maxScore };
        })
        // Require a minimum similarity on some token so we don't return completely unrelated posts
        .filter((entry) => entry.score >= 0.7)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (
            new Date(b.post.createdAt).getTime() -
            new Date(a.post.createdAt).getTime()
          );
        });

      posts = scored.map((entry) => entry.post);
    }

    if (hasLocationFilter) {
      const postsWithDistance = posts
        .map((post) => {
          const coords = post?.location?.coordinates;
          if (!Array.isArray(coords) || coords.length < 2) return null;

          const [postLng, postLat] = coords;
          if (!Number.isFinite(postLat) || !Number.isFinite(postLng)) {
            return null;
          }

          const distanceMeters = haversineDistanceMeters(
            parsedLat,
            parsedLng,
            postLat,
            postLng,
          );

          if (distanceMeters > radiusMeters) {
            return null;
          }

          return {
            ...post.toObject(),
            distanceMeters,
            distanceKm: Number((distanceMeters / 1000).toFixed(2)),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distanceMeters - b.distanceMeters);

      return res.status(200).json(postsWithDistance);
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "No post with that id" });
  }

  const post = await PostMessage.findById(id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Also load the latest report for this post (if any) so the
  // frontend can show context like a rejected review banner.
  const latestReport = await PostReport.findOne({ post: id })
    .sort({ createdAt: -1 })
    .select("status adminNote createdAt reason");

  res.status(200).json({
    ...post.toObject(),
    latestReport,
  });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};


export const createPost = async (req, res) => {
  const post = req.body;
  let location = undefined;
  if (post.location && post.location.lat && post.location.lng) {
    location = {
      type: 'Point',
      coordinates: [post.location.lng, post.location.lat],
    };
  }
  const newPost = new PostMessage({
    ...post,
    location,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    const messageText = String(error?.message || "");
    const isDocTooLarge =
      messageText.includes("BSON") ||
      messageText.toLowerCase().includes("document") &&
        messageText.toLowerCase().includes("too large");

    if (isDocTooLarge) {
      return res.status(413).json({
        message:
          "Post data is too large (images exceed limit). Please upload smaller or compressed images.",
      });
    }

    res.status(409).json({ message: messageText || "Failed to create post." });
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("No post with that id");

    const updatedPost = await PostMessage.findByIdAndUpdate(
      _id,
      { ...post, _id },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    const messageText = String(error?.message || "");
    const isDocTooLarge =
      messageText.includes("BSON") ||
      messageText.toLowerCase().includes("document") &&
        messageText.toLowerCase().includes("too large");

    if (isDocTooLarge) {
      return res.status(413).json({
        message:
          "Updated post is too large (images exceed limit). Please use smaller/compressed images.",
      });
    }

    res.status(409).json({ message: messageText || "Failed to update post." });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: "No post with that id" });

    // Find the post first
    const post = await PostMessage.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the user to check if they are admin
    const user = await User.findById(req.userId);
    
    const postCreatorStr = String(post.creator);
    const userIdStr = String(req.userId);
    const isCreator = postCreatorStr === userIdStr;
    const isAdmin = user && user.isAdmin;

    // Check authorization: allow if user is creator OR admin
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ 
        message: "Unauthorized to delete this post" 
      });
    }

    // Delete the post
    try {
      await Notification.deleteMany({ post: id });
    } catch (notifyError) {
      console.error("Failed to clear notifications for deleted post:", notifyError);
    }
    await PostMessage.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(409).json({ message: error.message || "Error deleting post" });
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.userId) return res.status(404).send("Unauthenticated");
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No post with that id");

    const post = await PostMessage.findById(id);
    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) {
      post.likes.push(req.userId);
      // Update user preferences for recommendation system when user likes a post
      await recommendationService.updateUserPreferences(req.userId, id, "like");

      // Create notification for post owner (if not liking own post)
      const isOwner = String(post.creator) === String(req.userId);
      if (!isOwner) {
        try {
          const existingUnreadLike = await Notification.findOne({
            user: post.creator,
            fromUser: req.userId,
            post: post._id,
            type: "like",
            read: false,
          });

          if (!existingUnreadLike) {
            await Notification.create({
              user: post.creator,
              fromUser: req.userId,
              post: post._id,
              type: "like",
            });
          }
        } catch (notifyError) {
          console.error("Failed to create like notification:", notifyError);
        }
      }
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.userId));

      // If user unlikes, remove all like alerts for this post.
      try {
        await Notification.deleteMany({
          user: post.creator,
          fromUser: req.userId,
          post: post._id,
          type: "like",
        });
      } catch (notifyError) {
        console.error("Failed to clear like notification on unlike:", notifyError);
      }
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error });
  }
};

const parseStoredComment = (rawComment) => {
  const extractCommentText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const extracted = extractCommentText(item);
        if (extracted) return extracted;
      }
      return "";
    }

    if (typeof value === "object") {
      for (const key of ["text", "comment", "body", "message", "value"]) {
        const extracted = extractCommentText(value[key]);
        if (extracted) return extracted;
      }
    }

    return "";
  };

  if (typeof rawComment !== "string") {
    return {
      userName: "User",
      userId: "",
      userAvatar: "",
      text: extractCommentText(rawComment),
      createdAt: null,
      editedAt: null,
    };
  }

  const trimmed = rawComment.trim();
  if (!trimmed) {
    return {
      userName: "User",
      userId: "",
      userAvatar: "",
      text: "",
      createdAt: null,
      editedAt: null,
    };
  }

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        return {
          userName: String(parsed.userName || "User"),
          userId: String(parsed.userId || ""),
          userAvatar: String(parsed.userAvatar || ""),
          text: extractCommentText(parsed),
          createdAt: parsed.createdAt || null,
          editedAt: parsed.editedAt || null,
        };
      }
    } catch (_error) {
      // fall through to legacy parser
    }
  }

  const [userName, ...commentParts] = trimmed.split(": ");
  return {
    userName: String(userName || "User"),
    userId: "",
    userAvatar: "",
    text: String(commentParts.join(": ") || ""),
    createdAt: null,
    editedAt: null,
  };
};

const serializeComment = (commentObject) => JSON.stringify(commentObject);

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { comment, userName, userAvatar } = req.body;
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "No post with that id" });
    }

    const post = await PostMessage.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const normalizedInput =
      typeof comment === "object" && comment !== null ? comment : { comment };
    const text = parseStoredComment(normalizedInput).text.trim();
    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const commenter = await User.findById(req.userId).select("name profileImage");
    const normalizedComment = {
      userName: String(
        userName || normalizedInput.userName || commenter?.name || "User",
      ).trim(),
      userId: String(req.userId),
      userAvatar: String(
        userAvatar || normalizedInput.userAvatar || commenter?.profileImage || "",
      ),
      text,
      createdAt: new Date().toISOString(),
      editedAt: null,
    };

    post.comments.push(serializeComment(normalizedComment));
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    });

    // Update user preferences for recommendation system
    if (req.userId) {
      await recommendationService.updateUserPreferences(
        req.userId,
        id,
        "comment"
      );

      // Create notification for post owner (if not commenting on own post)
      const isOwner = String(post.creator) === String(req.userId);
      if (!isOwner) {
        try {
          await Notification.create({
            user: post.creator,
            fromUser: req.userId,
            post: post._id,
            type: "comment",
          });
        } catch (notifyError) {
          console.error("Failed to create comment notification:", notifyError);
        }
      }
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error });
  }
};

export const editComment = async (req, res) => {
  const { id, commentIndex } = req.params;
  const { text } = req.body || {};

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "No post with that id" });
    }

    const index = Number(commentIndex);
    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: "Invalid comment index" });
    }

    const post = await PostMessage.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!Array.isArray(post.comments) || index >= post.comments.length) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const nextText = String(text || "").trim();
    if (!nextText) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const requester = await User.findById(req.userId).select("isAdmin name");
    const parsedComment = parseStoredComment(post.comments[index]);

    const isOwnerById =
      parsedComment.userId &&
      String(parsedComment.userId) === String(req.userId);
    const isOwnerByName =
      !parsedComment.userId &&
      requester?.name &&
      String(parsedComment.userName) === String(requester.name);
    const isAdmin = Boolean(requester?.isAdmin);

    if (!isOwnerById && !isOwnerByName && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized to edit comment" });
    }

    const updatedComment = {
      ...parsedComment,
      text: nextText,
      editedAt: new Date().toISOString(),
    };
    post.comments[index] = serializeComment(updatedComment);

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    });

    return res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(409).json({ message: error.message || String(error) });
  }
};

export const deleteComment = async (req, res) => {
  const { id, commentIndex } = req.params;

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "No post with that id" });
    }

    const index = Number(commentIndex);
    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: "Invalid comment index" });
    }

    const post = await PostMessage.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!Array.isArray(post.comments) || index >= post.comments.length) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const requester = await User.findById(req.userId).select("isAdmin name");
    const parsedComment = parseStoredComment(post.comments[index]);

    const isOwnerById =
      parsedComment.userId &&
      String(parsedComment.userId) === String(req.userId);
    const isOwnerByName =
      !parsedComment.userId &&
      requester?.name &&
      String(parsedComment.userName) === String(requester.name);
    const isAdmin = Boolean(requester?.isAdmin);

    if (!isOwnerById && !isOwnerByName && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized to delete comment" });
    }

    post.comments.splice(index, 1);

    // Remove the comment alert(s) that were created for this comment author.
    try {
      await Notification.deleteMany({
        user: post.creator,
        fromUser: parsedComment.userId || req.userId,
        post: post._id,
        type: "comment",
      });
    } catch (notifyError) {
      console.error("Failed to clear comment notification on delete:", notifyError);
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    });

    return res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(409).json({ message: error.message || String(error) });
  }
};

// Get content-based or location-based recommendations for the current user
export const getRecommendations = async (req, res) => {
  try {
    if (!req.userId)
      return res.status(401).json({ message: "Unauthenticated" });

    // radius is in meters; default is 50km for nearby recommendations
    const { limit = 10, lng, lat, radius = 50000 } = req.query;
    let location = null;
    if (lng && lat) {
      location = { lng: parseFloat(lng), lat: parseFloat(lat) };
    }
    const recommendations = await recommendationService.getRecommendations(
      req.userId,
      parseInt(limit),
      location,
      parseInt(radius)
    );

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get similar posts based on a specific post
export const getSimilarPosts = async (req, res) => {
  const { id } = req.params;
  try {
    const { limit = 5 } = req.query;
    const similarPosts = await recommendationService.getSimilarPosts(
      id,
      parseInt(limit),
      req.userId
    );

    res.status(200).json(similarPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Track post view for recommendation system
export const trackPostView = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.userId) {
      await recommendationService.updateUserPreferences(req.userId, id, "view");
    }
    res.status(200).json({ message: "View tracked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Post reporting & review workflow
// ─────────────────────────────────────────────────────────────────────────────

// Helper to pick the important, comparable fields from a post document
function buildPostSnapshot(postDoc) {
  if (!postDoc) return null;
  return {
    title: postDoc.title,
    message: postDoc.message,
    tags: Array.isArray(postDoc.tags) ? [...postDoc.tags] : postDoc.tags,
    selectedFile: postDoc.selectedFile,
    locationName: postDoc.locationName,
    location: postDoc.location,
    createdAt: postDoc.createdAt,
    creator: postDoc.creator,
  };
}

// User reports a post as potentially fake / misleading
export const reportPost = async (req, res) => {
  const { id } = req.params;
  const { reason, details } = req.body || {};

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid post id" });
    }

    if (!reason) {
      return res.status(400).json({ message: "Report reason is required" });
    }

    const post = await PostMessage.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Prevent the post owner from reporting their own content
    if (String(post.creator) === String(req.userId)) {
      return res
        .status(400)
        .json({ message: "You cannot report your own post" });
    }

    // Avoid duplicate open reports by the same user on the same post
    const existingOpen = await PostReport.findOne({
      post: id,
      reporter: req.userId,
      status: { $in: ["open", "alerted", "under_review"] },
    });

    if (existingOpen) {
      return res.status(409).json({
        message: "You have already reported this post. It is under review.",
      });
    }

    const snapshot = buildPostSnapshot(post);

    const report = await PostReport.create({
      post: post._id,
      reporter: req.userId,
      reason,
      details,
      originalPostSnapshot: snapshot,
    });

    return res.status(201).json({
      message: "Thank you. Your report has been submitted for review.",
      report,
    });
  } catch (error) {
    console.error("reportPost error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to submit report" });
  }
};

// Admin: list reports. Optionally filter by status.
export const getPostReports = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const adminUser = await User.findById(req.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.query || {};
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const reports = await PostReport.find(filter)
      .sort({ createdAt: -1 })
      .populate("post", "title creator locationName selectedFile")
      .populate("reporter", "name email");

    return res.status(200).json({ reports });
  } catch (error) {
    console.error("getPostReports error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to load reports" });
  }
};

// Admin: perform an action on a report (mark genuine, alert user, delete post, accept/reject review)
export const adminActOnReport = async (req, res) => {
  const { id } = req.params; // report id
  const { action, note } = req.body || {};

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const adminUser = await User.findById(req.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid report id" });
    }

    const report = await PostReport.findById(id).populate("post");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const post = report.post;

    switch (action) {
      case "mark_genuine": {
        report.status = "genuine";
        report.adminNote = note;
        report.handledBy = adminUser._id;
        await report.save();

    // Notify post owner that the place was confirmed as genuine
    if (post) {
      try {
        await Notification.create({
          user: post.creator,
          fromUser: adminUser._id,
          post: post._id,
          type: "report_genuine",
        });
      } catch (notifyError) {
        console.error("Failed to create report genuine notification:", notifyError);
      }
    }
        break;
      }
      case "alert_user": {
        if (!post) {
          return res
            .status(404)
            .json({ message: "Cannot alert user. Post not found" });
        }

        report.status = "alerted";
        report.adminNote = note;
        report.handledBy = adminUser._id;
        await report.save();

        // Notify the post owner that their post was reported
        try {
          await Notification.create({
            user: post.creator,
            fromUser: adminUser._id,
            post: post._id,
            type: "report_alert",
          });
        } catch (notifyError) {
          console.error(
            "Failed to create report alert notification:",
            notifyError
          );
        }

        break;
      }
      case "delete_post": {
        if (!post) {
          return res
            .status(404)
            .json({ message: "Post already deleted" });
        }

        await PostMessage.findByIdAndDelete(post._id);
        report.status = "deleted";
        report.adminNote = note;
        report.handledBy = adminUser._id;
        await report.save();

    // Notify the post owner that their post was deleted due to a report
    try {
      await Notification.create({
        user: post.creator,
        fromUser: adminUser._id,
        post: post._id,
        type: "report_deleted",
      });
    } catch (notifyError) {
      console.error("Failed to create report deleted notification:", notifyError);
    }
        break;
      }
      case "accept_review": {
        // Post already contains the user edits. Just mark resolved.
        report.status = "resolved";
        report.adminNote = note;
        report.handledBy = adminUser._id;
        await report.save();

        // Optional: notify the post owner that the review was accepted
        if (post) {
          try {
            await Notification.create({
              user: post.creator,
              fromUser: adminUser._id,
              post: post._id,
              type: "report_resolved",
            });
          } catch (notifyError) {
            console.error(
              "Failed to create report resolved notification:",
              notifyError
            );
          }
        }

        break;
      }
      case "reject_review": {
        // Optionally revert the post back to the original snapshot
        if (post && report.originalPostSnapshot) {
          const snap = report.originalPostSnapshot;
          await PostMessage.findByIdAndUpdate(
            post._id,
            {
              title: snap.title,
              message: snap.message,
              tags: snap.tags,
              selectedFile: snap.selectedFile,
              locationName: snap.locationName,
              location: snap.location,
            },
            { new: true }
          );
        }

        report.status = "rejected";
        report.adminNote = note;
        report.handledBy = adminUser._id;
        await report.save();

    // Notify the post owner that their proposed changes were rejected
    if (post) {
      try {
        await Notification.create({
          user: post.creator,
          fromUser: adminUser._id,
          post: post._id,
          type: "report_rejected",
        });
      } catch (notifyError) {
        console.error("Failed to create report rejected notification:", notifyError);
      }
    }
        break;
      }
      default: {
        return res.status(400).json({ message: "Unknown admin action" });
      }
    }

    return res.status(200).json({ report });
  } catch (error) {
    console.error("adminActOnReport error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to update report" });
  }
};

// Post owner: after editing the post following an alert, submit it for admin review
export const sendPostForReview = async (req, res) => {
  const { id } = req.params; // post id
  const { reportId } = req.body || {};

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid post id" });
    }

    const post = await PostMessage.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.creator) !== String(req.userId)) {
      return res
        .status(403)
        .json({ message: "Only the post owner can send for review" });
    }

    let report;
    if (reportId && mongoose.Types.ObjectId.isValid(reportId)) {
      report = await PostReport.findOne({ _id: reportId, post: id });
    } else {
      // Use the most recent relevant report for this post
      report = await PostReport.findOne({
        post: id,
        status: { $in: ["open", "alerted"] },
      }).sort({ createdAt: -1 });
    }

    if (!report) {
      return res.status(404).json({
        message:
          "No active report found for this post. Nothing to send for review.",
      });
    }

    report.reviewSnapshot = buildPostSnapshot(post);
    report.status = "under_review";
    await report.save();

    return res.status(200).json({
      message: "Your changes have been sent to the admins for review.",
      report,
    });
  } catch (error) {
    console.error("sendPostForReview error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to send for review" });
  }
};

// Utility: compute distance between two coordinates in meters
function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // metres
  const toRad = (deg) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lng2 - lng1);

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(dLambda / 2) * Math.sin(dLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Verify that the place mentioned in title/message exists near the selected map point.
// Pin handling rule:
// - If matched place is within 10km of current pin: keep user's pin unchanged.
// - If matched place is beyond 10km (but within 20km accept radius): auto-snap to matched place.
export const verifyPostLocation = async (req, res) => {
  const { title, message, location } = req.body || {};

  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return res.status(400).json({ message: "Invalid or missing location for verification." });
  }

  // For now, only use the title text for place verification
  const query = `${title || ""}`.trim();
  if (!query) {
    // Nothing to search for; allow client to decide how to handle
    return res.status(200).json({ status: "no-text", verified: false });
  }

  // We search within 50km, and accept when within 20km of the selected pin.
  // For accepted matches, only snap pin when distance is greater than 10km.
  const searchRadiusKm = 50;
  const acceptRadiusKm = 20;
  const snapThresholdKm = 10;
  const { lat, lng } = location;

  // Approximate bounding box for 50km search radius
  const earthRadiusKm = 6371;
  const latDelta = (searchRadiusKm / earthRadiusKm) * (180 / Math.PI);
  const lonDelta =
    (searchRadiusKm / (earthRadiusKm * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lonDelta;
  const maxLng = lng + lonDelta;

  try {
    // First, try a bounded search around the selected pin
    const boundedUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&bounded=1&viewbox=${minLng},${maxLat},${maxLng},${minLat}`;

    const commonHeaders = {
      // Please replace with your own project/app identifier if you fork this project
      "User-Agent": "atlas-diary/1.0 (+https://example.com)",
    };

    const boundedResponse = await fetch(boundedUrl, { headers: commonHeaders });

    if (boundedResponse.status === 403) {
      // Upstream geocoding service blocked the request (e.g. rate limit or bad User-Agent).
      // Treat this as "service unavailable" so the frontend can still show a hint
      // and allow posting with the user's selected pin.
      return res.status(200).json({
        status: "service-unavailable",
        verified: false,
        message: "Geocoding service returned 403 (forbidden).",
      });
    }

    if (!boundedResponse.ok) {
      throw new Error(`Geocoding request failed with status ${boundedResponse.status}`);
    }

    let results = await boundedResponse.json();

    // If the bounded search didn't find anything, fall back to a global search
    if (!Array.isArray(results) || results.length === 0) {
      const globalUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`;

      const globalResponse = await fetch(globalUrl, { headers: commonHeaders });

      if (globalResponse.ok) {
        results = await globalResponse.json();
      } else {
        // If even the global search fails, treat as no match
        return res.status(200).json({ status: "no-match", verified: false });
      }
    }

    if (!Array.isArray(results) || results.length === 0) {
      // Still no place found matching the text
      return res.status(200).json({ status: "no-match", verified: false });
    }

    // Instead of aggressively filtering by class/type, pick the
    // nearest geocoding result to the selected pin and use that
    // to decide if the place is close enough.
    const candidates = results
      .map((p) => {
        const placeLat = parseFloat(p.lat);
        const placeLng = parseFloat(p.lon);
        if (Number.isNaN(placeLat) || Number.isNaN(placeLng)) return null;

        const distanceMeters = haversineDistanceMeters(lat, lng, placeLat, placeLng);
        return { place: p, placeLat, placeLng, distanceMeters };
      })
      .filter(Boolean);

    if (!candidates.length) {
      return res.status(200).json({ status: "no-match", verified: false });
    }

    const nearest = candidates.reduce((best, current) =>
      current.distanceMeters < best.distanceMeters ? current : best
    );

    const { place: validPlace, placeLat, placeLng, distanceMeters } = nearest;

    if (distanceMeters <= acceptRadiusKm * 1000) {
      const shouldSnapToMatch = distanceMeters > snapThresholdKm * 1000;

      // Keep user's pin if already close (<=10km); otherwise snap to matched place.
      return res.status(200).json({
        status: "within-radius",
        verified: true,
        pinHandling: shouldSnapToMatch ? "snapped-to-match" : "kept-user-pin",
        newLocation: shouldSnapToMatch ? { lat: placeLat, lng: placeLng } : null,
        currentLocation: { lat, lng },
        placeName: validPlace.display_name,
        distanceMeters,
      });
    }

    if (distanceMeters <= searchRadiusKm * 1000) {
      // Within 50km search radius but further than 20km — close but not valid
      return res.status(200).json({
        status: "within-search-radius",
        verified: false,
        placeName: validPlace.display_name,
        distanceMeters,
      });
    }

    // Place found but it's outside the 50km search radius
    return res.status(200).json({
      status: "outside-radius",
      verified: false,
      bestMatch: {
        lat: placeLat,
        lng: placeLng,
        placeName: validPlace.display_name,
      },
      distanceMeters,
    });
  } catch (error) {
    console.error("Error verifying post location:", error);
    return res.status(500).json({
      message: "Location verification failed. Please try again later.",
    });
  }
};
