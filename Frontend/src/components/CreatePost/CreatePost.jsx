import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Form from "../Form/Form";

export default function CreatePost() {
  const selectedPost = useSelector((state) => state.selectedPost);
  const isEditing = Boolean(selectedPost);
  const location = useLocation();
  const requiresLocationFix = Boolean(location.state?.requiresLocationFix);
  const sendForReviewAfterUpdate = Boolean(
    location.state?.sendForReviewAfterUpdate,
  );
  const reportId = location.state?.reportId || null;

  return (
    <div className="min-h-screen bg-off-white py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white/90 border border-light-green/60 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_18px_40px_rgba(12,52,44,0.12)]">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-dark mb-3">
            {isEditing ? "Update Your Post" : "Create a New Post"}
          </h1>
          <p className="text-text-gray text-base mb-8 max-w-2xl">
            {isEditing
              ? "Edit your existing diary entry — adjust the text, tags, photos and location before resubmitting."
              : "Share your latest adventure with the community — upload photos, add tags and tell your story."}
          </p>
          <Form
            requiresLocationFix={requiresLocationFix}
            sendForReviewAfterUpdate={sendForReviewAfterUpdate}
            reportId={reportId}
          />
        </div>
      </div>
    </div>
  );
}
