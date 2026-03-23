import mongoose from "mongoose";

const postReportSchema = mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: [
        "not_real_place",
        "description_mismatch",
        "photo_mismatch",
        "spam_or_advertisement",
        "other",
      ],
      required: true,
    },
    details: { type: String },
    status: {
      type: String,
      enum: [
        "open", // freshly reported
        "genuine", // admin confirmed the place is genuine
        "alerted", // admin alerted the post owner
        "under_review", // user has submitted changes for review
        "resolved", // review accepted and closed
        "rejected", // review rejected
        "deleted", // post deleted due to this report
      ],
      default: "open",
    },
    adminNote: { type: String },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Snapshot of the post when the report was first created
    originalPostSnapshot: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Snapshot of the post after the user edits and sends for review
    reviewSnapshot: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

postReportSchema.index({ status: 1, createdAt: -1 });
postReportSchema.index({ post: 1, status: 1 });

const PostReport = mongoose.model("PostReport", postReportSchema);

export default PostReport;
