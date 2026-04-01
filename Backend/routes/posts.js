import express from "express";
import {
  getPosts,
  getPublicPostStats,
  getPostsBySearch,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostById,
  commentPost,
  editComment,
  deleteComment,
  getRecommendations,
  getSimilarPosts,
  trackPostView,
  verifyPostLocation,
  // Reporting & review
  reportPost,
  getPostReports,
  adminActOnReport,
  sendPostForReview,
} from "../controllers/posts.js";
import auth from "../middleware/auth.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// http://localhost:5000/posts
router.get("/", getPosts);
router.get("/stats/public", getPublicPostStats);
router.get("/search", getPostsBySearch);
router.get("/recommendations", auth, getRecommendations);
// Admin-only report management (placed before dynamic :id routes)
router.get("/reports", auth, getPostReports);
router.patch("/reports/:id/admin-action", auth, adminActOnReport);
router.get("/:id", getPostById);
router.get("/:id/similar", optionalAuth, getSimilarPosts);

router.post("/", auth, createPost);
router.post("/verify-location", auth, verifyPostLocation);
router.post("/:id/view", auth, trackPostView);
router.post("/:id/report", auth, reportPost);
router.post("/:id/send-for-review", auth, sendPostForReview);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.patch("/:id/likePost", auth, likePost);
router.post("/:id/commentPost", auth, commentPost);
router.patch("/:id/comments/:commentIndex", auth, editComment);
router.delete("/:id/comments/:commentIndex", auth, deleteComment);

export default router;
