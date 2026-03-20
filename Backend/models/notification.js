import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // actor
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    type: {
      type: String,
      enum: ["like", "comment"],
      required: true,
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
