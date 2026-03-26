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

    // If caller requested a lightweight summary (e.g., dashboard), remove heavy fields
    if (summary === "true") {
      const summarized = posts.map((p) => {
        const obj = p.toObject();
        obj.commentsCount = Array.isArray(p.comments) ? p.comments.length : 0;
        delete obj.comments;
        delete obj.message;
        delete obj.selectedFile;
        return obj;
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


export const getPostsBySearch = async (req, res) => {
  const { search, tags } = req.query;

  try {
    // Treat "none" or empty as no text search (frontend sends "none" when only tags are used)
    const hasSearch = search && search !== "none";
    // Frontend sends "none" when there is no tag filter, so treat that as empty
    const hasTags = tags && tags.trim().length > 0 && tags !== "none";

    // If no filters at all, just return latest posts (defensive fallback)
    if (!hasSearch && !hasTags) {
      const posts = await PostMessage.find().sort({ _id: -1 }).limit(20);
      return res.status(200).json(posts);
    }

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
    res.status(409).json({ message: error });
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
    res.status(409).json({ message: error });
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
          await Notification.create({
            user: post.creator,
            fromUser: req.userId,
            post: post._id,
            type: "like",
          });
        } catch (notifyError) {
          console.error("Failed to create like notification:", notifyError);
        }
      }
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error });
  }
};

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    const post = await PostMessage.findById(id);

    post.comments.push(comment);
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
      parseInt(limit)
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

// Verify that the place mentioned in title/message exists near the selected map point
// and, if found within a 20km radius, snap the coordinates to that exact place.
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

  // We search within 50km, but only accept posts when the mentioned
  // place is within 20km of the selected pin.
  const searchRadiusKm = 50;
  const acceptRadiusKm = 20;
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
      // Place exists within 20km radius — snap the coordinates to this place
      return res.status(200).json({
        status: "within-radius",
        verified: true,
        newLocation: { lat: placeLat, lng: placeLng },
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
