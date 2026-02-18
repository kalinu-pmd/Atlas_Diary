import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  title: String,
  message: String,
  creator: String,
  name: String,
  tags: [String],
  selectedFile: {
    type: mongoose.Schema.Types.Mixed, // Can be String or Array
    default: [],
  },
  likes: {
    type: [String],
    default: [],
  },
  comments: { type: [String], default: [] },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});
// Add indexes to speed up common queries (filtering, sorting, text search)
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ title: "text", message: "text", tags: "text" });

const PostMessage = mongoose.model("Post", postSchema);
export default PostMessage;
