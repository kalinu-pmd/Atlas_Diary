
import PostMessage from "../models/postMessage.js";
import User from "../models/users.js";
import natural from "natural";
import stringSimilarity from "string-similarity";

const TfIdf = natural.TfIdf;
const tokenizer = natural.WordTokenizer;
const stemmer = natural.PorterStemmer;

class RecommendationService {
  constructor() {
    this.tfidf = new TfIdf();
    this.tokenizer = new tokenizer();
  }

  // Get posts near a given location
  // radius is in meters; default is 50km
  async getNearbyPosts({ lng, lat }, radius = 50000, limit = 10) {
    // radius in meters
    try {
      const posts = await PostMessage.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radius,
          },
        },
      })
        .limit(limit)
        .populate("creator", "name");
      return posts;
    } catch (error) {
      console.error("Error getting nearby posts:", error);
      return [];
    }
  }


  // Clean and preprocess text (porter stemming)
  preprocessText(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(" ")
      .map((word) => stemmer.stem(word))
      .join(" ");
  }

  // Calculate TF-IDF similarity between two posts
  calculateContentSimilarity(post1, post2) {
    const text1 = this.preprocessText(
      `${post1.title} ${post1.message} ${post1.tags.join(" ")}`
    );
    const text2 = this.preprocessText(
      `${post2.title} ${post2.message} ${post2.tags.join(" ")}`
    );

    return stringSimilarity.compareTwoStrings(text1, text2);
  }

  // Calculate tag similarity using Jaccard coefficient
  calculateTagSimilarity(tags1, tags2) {
    if (!tags1.length || !tags2.length) return 0;

    const set1 = new Set(tags1.map((tag) => tag.toLowerCase()));
    const set2 = new Set(tags2.map((tag) => tag.toLowerCase()));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  // Build user profile based on their interactions
  async buildUserProfile(userId) {
    try {
      const user = await User.findById(userId)
        .populate("likedPosts")
        .populate("viewedPosts")
        .populate("commentedPosts");

      if (!user) return null;

      // Get all posts user has interacted with
      const interactedPosts = [
        ...user.likedPosts,
        ...user.viewedPosts,
        ...user.commentedPosts,
      ];

      // Remove duplicates
      const uniquePosts = interactedPosts.filter(
        (post, index, self) =>
          index ===
          self.findIndex((p) => p._id.toString() === post._id.toString())
      );

      // Extract preferred tags with weights
      const tagFrequency = {};
      uniquePosts.forEach((post) => {
        post.tags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          tagFrequency[lowerTag] = (tagFrequency[lowerTag] || 0) + 1;
        
          // Give more weight to liked posts.
          if (
            user.likedPosts.some(
              (likedPost) =>
                likedPost._id.toString() === post._id.toString()
            )
          ) {
            tagFrequency[lowerTag] += 2;
          }

          // Give more weight to commented posts
          if (
            user.commentedPosts.some(
              (commentedPost) =>
                commentedPost._id.toString() === post._id.toString()
            )
          ) {
            tagFrequency[lowerTag] += 1;
          }
        });
      });

      // Build content profile
      const contentProfile = uniquePosts.map((post) => ({
        title: post.title,
        message: post.message,
        tags: post.tags,
      }));

      return {
        user,
        tagFrequency,
        contentProfile,
        interactedPostIds: uniquePosts.map((post) => post._id.toString()),
      };
    } catch (error) {
      console.error("Error building user profile:", error);
      return null;
    }
  }

  // Calculate recommendation score for a post
  calculateRecommendationScore(post, userProfile, locationRadius = 50000) {
    let score = 0;

    // Tag similarity score (15% weight)
    const postTags = post.tags.map((tag) => tag.toLowerCase());
    let tagScore = 0;
    postTags.forEach((tag) => {
      if (userProfile.tagFrequency[tag]) {
        tagScore += userProfile.tagFrequency[tag];
      }
    });
    score +=
      (tagScore / Math.max(1, Object.keys(userProfile.tagFrequency).length)) *
      0.15;

    // Content similarity score (35% weight)
    let maxContentSimilarity = 0;
    userProfile.contentProfile.forEach((userPost) => {
      const similarity = this.calculateContentSimilarity(post, userPost);
      maxContentSimilarity = Math.max(maxContentSimilarity, similarity);
    });
    score += maxContentSimilarity * 0.35;

    // Popularity score (15% weight) - based on likes and comments
    const popularityScore = (post.likes.length + post.comments.length) / 100;
    score += Math.min(popularityScore, 1) * 0.15;

    // Recency score (10% weight) - newer posts get slight boost
    const daysSinceCreated =
      (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSinceCreated / 30); // Boost for posts within 30 days
    score += recencyScore * 0.1;

    // Location proximity score (25% weight)
    // If userProfile.location and post.location exist, calculate distance and score
    let locationScore = 0;
    let locationDistanceMeters = null;
    if (userProfile.location && post.location && Array.isArray(post.location.coordinates)) {
      const userLoc = userProfile.location;
      const postLoc = post.location.coordinates;
      // Haversine formula for distance in meters
      function toRad(x) { return (x * Math.PI) / 180; }
      const R = 6371000; // Earth radius in meters
      const dLat = toRad(postLoc[1] - userLoc.lat);
      const dLon = toRad(postLoc[0] - userLoc.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLoc.lat)) *
        Math.cos(toRad(postLoc[1])) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      locationDistanceMeters = distance;

      // Score by request radius so posts within 50km still get meaningful boost.
      const effectiveRadius = Math.max(1000, Number(locationRadius) || 50000);
      if (distance <= 1000) {
        locationScore = 1;
      } else if (distance >= effectiveRadius) {
        locationScore = 0;
      } else {
        locationScore = 1 - (distance - 1000) / (effectiveRadius - 1000);
      }
    }
    score += locationScore * 0.25;

    return { score, locationScore, locationDistanceMeters };
  }

  // Get content-based or location-based recommendations for a user
  // When location is provided, radius (in meters) controls the nearby search; default is 50km
  async getRecommendations(userId, limit = 10, location = null, radius = 50000) {
    try {
      const userProfile = await this.buildUserProfile(userId);
      const recommendationFilter = { creator: { $ne: String(userId) } };
      const hasLocation = Boolean(location && location.lng && location.lat);
      const nearbyLimit = Math.max(limit * 3, limit);
      const nearbyPosts = hasLocation
        ? await this.getNearbyPosts(location, radius, nearbyLimit)
        : [];
      const nearbyIds = new Set(nearbyPosts.map((post) => post._id.toString()));

      if (!userProfile || userProfile.contentProfile.length === 0) {
        // If no user profile, prefer nearby posts first and then fall back to popular posts.
        const fallbackPosts = await PostMessage.find({
          ...recommendationFilter,
          _id: { $nin: [...nearbyIds] },
        })
          .sort({ likes: -1, createdAt: -1 })
          .limit(Math.max(limit * 3, limit))
          .populate("creator", "name");

        const combined = [...nearbyPosts, ...fallbackPosts]
          .filter((post, index, self) => {
            const id = post._id.toString();
            return index === self.findIndex((item) => item._id.toString() === id);
          })
          .slice(0, limit);

        return combined.map((post) => ({
          ...post.toObject(),
          recommendationScore: 0,
          locationScore: 0,
          distanceMeters: null,
          isNearby: nearbyIds.has(post._id.toString()),
        }));
      }

      // If we have a location from the caller, attach it to the
      // user profile so the scoring function can include a
      // location-proximity component (20% weight).
      if (location && location.lng && location.lat) {
        userProfile.location = {
          lng: Number(location.lng),
          lat: Number(location.lat),
        };
      }

      // Get a limited window of recent posts excluding ones user has already interacted with
      // to avoid scanning the entire collection on every recommendations request.
      const SCAN_LIMIT = 300;
      const allPosts = await PostMessage.find({
        ...recommendationFilter,
        _id: { $nin: [...userProfile.interactedPostIds, ...nearbyIds] },
      })
        .sort({ createdAt: -1 })
        .limit(SCAN_LIMIT)
        .populate("creator", "name");

      // Calculate recommendation scores
      const scoredNearbyPosts = nearbyPosts.map((post) => {
        const scored = this.calculateRecommendationScore(post, userProfile, radius);
        return {
          post,
          score: scored.score,
          locationScore: scored.locationScore,
          locationDistanceMeters: scored.locationDistanceMeters,
          isNearby: true,
        };
      });

      const scoredPosts = allPosts.map((post) => {
        const scored = this.calculateRecommendationScore(post, userProfile, radius);
        return {
          post,
          score: scored.score,
          locationScore: scored.locationScore,
          locationDistanceMeters: scored.locationDistanceMeters,
          isNearby:
            typeof scored.locationDistanceMeters === "number" &&
            scored.locationDistanceMeters <= radius,
        };
      });

      // Ordering rule:
      // 1) High match posts (50% to 100%) in descending score
      // 2) Remaining nearby posts by closest distance first
      // 3) Remaining non-nearby posts in descending score
      const HIGH_MATCH_THRESHOLD = 0.5;
      const combinedScored = [...scoredNearbyPosts, ...scoredPosts];

      const highMatchPosts = combinedScored
        .filter((item) => item.score >= HIGH_MATCH_THRESHOLD)
        .sort((a, b) => b.score - a.score);

      const remainingPosts = combinedScored.filter(
        (item) => item.score < HIGH_MATCH_THRESHOLD,
      );

      const nearbyRemainingPosts = remainingPosts
        .filter((item) => item.isNearby)
        .sort((a, b) => {
          const aDistance =
            typeof a.locationDistanceMeters === "number"
              ? a.locationDistanceMeters
              : Number.MAX_SAFE_INTEGER;
          const bDistance =
            typeof b.locationDistanceMeters === "number"
              ? b.locationDistanceMeters
              : Number.MAX_SAFE_INTEGER;

          if (aDistance !== bDistance) return aDistance - bDistance;
          return b.score - a.score;
        });

      const otherRemainingPosts = remainingPosts
        .filter((item) => !item.isNearby)
        .sort((a, b) => b.score - a.score);

      const recommendations = [
        ...highMatchPosts,
        ...nearbyRemainingPosts,
        ...otherRemainingPosts,
      ]
        .slice(0, limit)
        .map((item) => ({
          ...item.post.toObject(),
          recommendationScore: item.score,
          locationScore: item.locationScore,
          distanceMeters: item.locationDistanceMeters,
          isNearby: item.isNearby,
        }));

      return recommendations;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }

  // Get similar posts based on a specific post
  async getSimilarPosts(postId, limit = 5, userId = null) {
    try {
      const targetPost = await PostMessage.findById(postId);
      if (!targetPost) return [];

      // Limit the number of posts scanned for similarity to improve performance.
      // Sort by recency so we compare against recent posts first.
      const SCAN_LIMIT = 200;
      const similarFilter = {
        _id: { $ne: postId },
      };
      if (userId) {
        similarFilter.creator = { $ne: String(userId) };
      }

      const allPosts = await PostMessage.find(similarFilter)
        .sort({ createdAt: -1 })
        .limit(SCAN_LIMIT)
        .populate("creator", "name");

      const similarPosts = allPosts.map((post) => ({
        post,
        similarity:
          this.calculateContentSimilarity(targetPost, post) +
          this.calculateTagSimilarity(targetPost.tags, post.tags),
      }));

      return similarPosts
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map((item) => ({
          ...item.post.toObject(),
          similarityScore: item.similarity,
        }));
    } catch (error) {
      console.error("Error getting similar posts:", error);
      return [];
    }
  }

  // Update user preferences based on interaction
  async updateUserPreferences(userId, postId, interactionType) {
  try {
    const user = await User.findById(userId);
    const post = await PostMessage.findById(postId);

    if (!user || !post) return;

    const alreadyExists = (arr) =>
      arr.some((id) => id.toString() === postId);

    switch (interactionType) {
      case "like":
        if (!alreadyExists(user.likedPosts))
          user.likedPosts.push(postId);
        break;
      case "view":
        if (!alreadyExists(user.viewedPosts))
          user.viewedPosts.push(postId);
        break;
      case "comment":
        if (!alreadyExists(user.commentedPosts))
          user.commentedPosts.push(postId);
        break;
    }

    post.tags.forEach((tag) => {
      const existingTagIndex = user.preferredTags.findIndex(
        (pt) => pt.tag === tag.toLowerCase()
      );

      if (existingTagIndex >= 0)
        user.preferredTags[existingTagIndex].score += 1;
      else
        user.preferredTags.push({ tag: tag.toLowerCase(), score: 1 });
    });

    await user.save();
  } catch (error) {
    console.error(error);
  }
}

}

export default new RecommendationService();
