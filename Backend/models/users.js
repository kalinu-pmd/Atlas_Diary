import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
 email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  id: { type: String },
  isAdmin: { type: Boolean, default: false },
  // Add recommendation-related fields
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  viewedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  commentedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  preferredTags: [{ tag: String, score: { type: Number, default: 1 } }],
  lastRecommendationUpdate: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
