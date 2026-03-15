
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
  async getNearbyPosts({ lng, lat }, radius = 5000, limit = 10) {
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


  // Clean and preprocess text
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
  calculateRecommendationScore(post, userProfile) {
    let score = 0;

    // Tag similarity score (30% weight)
    const postTags = post.tags.map((tag) => tag.toLowerCase());
    let tagScore = 0;
    postTags.forEach((tag) => {
      if (userProfile.tagFrequency[tag]) {
        tagScore += userProfile.tagFrequency[tag];
      }
    });
    score +=
      (tagScore / Math.max(1, Object.keys(userProfile.tagFrequency).length)) *
      0.3;

    // Content similarity score (30% weight)
    let maxContentSimilarity = 0;
    userProfile.contentProfile.forEach((userPost) => {
      const similarity = this.calculateContentSimilarity(post, userPost);
      maxContentSimilarity = Math.max(maxContentSimilarity, similarity);
    });
    score += maxContentSimilarity * 0.3;

    // Popularity score (10% weight) - based on likes and comments
    const popularityScore = (post.likes.length + post.comments.length) / 100;
    score += Math.min(popularityScore, 1) * 0.1;

    // Recency score (10% weight) - newer posts get slight boost
    const daysSinceCreated =
      (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSinceCreated / 30); // Boost for posts within 30 days
    score += recencyScore * 0.1;

    // Location proximity score (20% weight)
    // If userProfile.location and post.location exist, calculate distance and score
    let locationScore = 0;
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
      // Score: 1 if within 1km, 0 if farther than 10km, linear in between
      if (distance <= 1000) locationScore = 1;
      else if (distance >= 10000) locationScore = 0;
      else locationScore = 1 - (distance - 1000) / 9000;
    }
    score += locationScore * 0.2;

    return score;
  }

  // Get content-based recommendations for a user
  async getRecommendations(userId, limit = 10, location = null, radius = 5000) {
    try {
      // If location is provided, return nearby posts
      if (location && location.lng && location.lat) {
        return await this.getNearbyPosts(location, radius, limit);
      }
      const userProfile = await this.buildUserProfile(userId);

      if (!userProfile || userProfile.contentProfile.length === 0) {
        // If no user profile, return popular posts
        return await PostMessage.find()
          .sort({ likes: -1, createdAt: -1 })
          .limit(limit)
          .populate("creator", "name");
      }

      // Get all posts excluding ones user has already interacted with
      const allPosts = await PostMessage.find({
        _id: { $nin: userProfile.interactedPostIds },
      }).populate("creator", "name");

      // Calculate recommendation scores
      const scoredPosts = allPosts.map((post) => ({
        post,
        score: this.calculateRecommendationScore(post, userProfile),
      }));

      // Sort by score and return top recommendations
      const recommendations = scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => ({
          ...item.post.toObject(),
          recommendationScore: item.score,
        }));

      return recommendations;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }

  // Get similar posts based on a specific post
  async getSimilarPosts(postId, limit = 5) {
    try {
      const targetPost = await PostMessage.findById(postId);
      if (!targetPost) return [];

      // Limit the number of posts scanned for similarity to improve performance.
      // Sort by recency so we compare against recent posts first.
      const SCAN_LIMIT = 200;
      const allPosts = await PostMessage.find({
        _id: { $ne: postId },
      })
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
