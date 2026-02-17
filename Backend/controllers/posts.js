import PostMessage from "../models/postMessage.js";
import mongoose from "mongoose";
import recommendationService from "../services/recommendationService.js";

export const getPosts = async (req, res) => {
  const { page } = req.query;

  try {
    const LIMIT = 8;
    const pageNumber = Number(page) || 1;
    const startIndex = (pageNumber - 1) * LIMIT;

    const total = await PostMessage.countDocuments({});
    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

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
  const newPost = new PostMessage({
    ...post,
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
      return res.status(404).send("No post with that id");
    await PostMessage.findByIdAndRemove(id);
    res.status(200).json({ message: "Post deleted sucessfully" });
  } catch (error) {
    res.status(409).json({ message: error });
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
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error });
  }
};

// Get content-based recommendations for the current user
export const getRecommendations = async (req, res) => {
  try {
    if (!req.userId)
      return res.status(401).json({ message: "Unauthenticated" });

    const { limit = 10 } = req.query;
    const recommendations = await recommendationService.getRecommendations(
      req.userId,
      parseInt(limit)
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
