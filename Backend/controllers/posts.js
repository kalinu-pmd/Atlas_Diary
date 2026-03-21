import PostMessage from "../models/postMessage.js";
import User from "../models/users.js";
import Notification from "../models/notification.js";
import mongoose from "mongoose";
import recommendationService from "../services/recommendationService.js";
import fetch from "node-fetch";

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
    const title = new RegExp(search, "i");
    const posts = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(",") } }],
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const posts = await PostMessage.findById(id);
    res.status(200).json(posts);
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

  const radiusKm = 20;
  const { lat, lng } = location;

  // Approximate bounding box for 20km radius
  const earthRadiusKm = 6371;
  const latDelta = (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lonDelta =
    (radiusKm / (earthRadiusKm * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lonDelta;
  const maxLng = lng + lonDelta;

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&bounded=1&viewbox=${minLng},${maxLat},${maxLng},${minLat}`;

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        // Please replace with your own project/app identifier if you fork this project
        "User-Agent": "atlas-diary/1.0 (+https://example.com)",
      },
    });

    if (response.status === 403) {
      // Upstream geocoding service blocked the request (e.g. rate limit or bad User-Agent).
      // Treat this as "service unavailable" so the frontend can still show a hint
      // and allow posting with the user's selected pin.
      return res.status(200).json({
        status: "service-unavailable",
        verified: false,
        message: "Geocoding service returned 403 (forbidden).",
      });
    }

    if (!response.ok) {
      throw new Error(`Geocoding request failed with status ${response.status}`);
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      // No place found near the selected point matching the text
      return res.status(200).json({ status: "no-match", verified: false });
    }

    const best = results[0];
    const placeLat = parseFloat(best.lat);
    const placeLng = parseFloat(best.lon);

    const distanceMeters = haversineDistanceMeters(lat, lng, placeLat, placeLng);

    if (distanceMeters <= radiusKm * 1000) {
      // Place exists within 20km radius — snap coordinates to this place
      return res.status(200).json({
        status: "within-radius",
        verified: true,
        newLocation: { lat: placeLat, lng: placeLng },
        placeName: best.display_name,
        distanceMeters,
      });
    }

    // Place found but it's outside the allowed radius
    return res.status(200).json({
      status: "outside-radius",
      verified: false,
      bestMatch: {
        lat: placeLat,
        lng: placeLng,
        placeName: best.display_name,
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
