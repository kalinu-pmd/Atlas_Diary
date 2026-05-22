import mongoose from "mongoose";

const contactMessageSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Valid email is required"],
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [20, "Message must be at least 20 characters"],
    },
    resolutionType: {
      type: String,
      enum: ["closed", "deleted"],
      default: null,
    },
    resolutionMessage: {
      type: String,
      default: null,
    },
    resolutionReason: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Optional attachment (data URL or image link)
    attachment: {
      type: String,
      default: null,
    },
    isReadByAdmin: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    replies: [
      {
        sender: {
          type: String,
          enum: ["user", "admin"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        channels: {
          email: { type: Boolean, default: false },
          push: { type: Boolean, default: false },
        },
        attachment: {
          type: String,
          default: null,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    emailConfirmationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
