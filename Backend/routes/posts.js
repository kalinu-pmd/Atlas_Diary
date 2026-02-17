import express from "express";
import {
  getPosts,
  getPostsBySearch,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostById,
  commentPost,
  getRecommendations,
  getSimilarPosts,
  trackPostView,
} 
from "../controllers/posts.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// http://localhost:5000/posts
router.get("/", getPosts);
router.get("/search", getPostsBySearch);
router.get("/recommendations", auth, getRecommendations);
router.get("/:id", getPostById);
router.get("/:id/similar", getSimilarPosts);

router.post("/", auth, createPost);
router.post("/:id/view", auth, trackPostView);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.patch("/:id/likePost", auth, likePost);
router.post("/:id/commentPost", auth, commentPost);

export default router;
