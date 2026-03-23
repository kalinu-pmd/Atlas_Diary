import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // actor
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    type: {
      type: String,
      enum: [
        "like",
        "comment",
        // Admin alerted the post owner that their post was reported
        "report_alert",
        // Admin resolved a report (accepted changes)
        "report_resolved",
        // Admin rejected the proposed changes for a report
        "report_rejected",
        // Admin deleted the post because of a report
        "report_deleted",
        // Admin marked the place as genuine
        "report_genuine",
      ],
      required: true,
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
