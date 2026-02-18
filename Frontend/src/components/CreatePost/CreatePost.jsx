import React from "react";
import Form from "../Form/Form";

export default function CreatePost() {
  return (
    <div className="min-h-screen bg-off-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white/5 border border-light-green rounded-2xl p-6 shadow-lg">
          <h1 className="text-2xl font-extrabold text-text-dark mb-3">Create a New Post</h1>
          <p className="text-text-gray text-sm mb-6">Share your latest adventure with the community — upload photos, add tags and tell your story.</p>
          <Form />
        </div>
      </div>
    </div>
  );
}
