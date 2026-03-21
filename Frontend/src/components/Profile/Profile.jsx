import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as api from "../../api";
import Post from "../Posts/Post/Post";

export default function Profile() {
  const { id: routeId } = useParams();
  const auth = useSelector((state) => state.auth.authData);
  const history = useHistory();

  const currentUserId = auth?.result?._id || auth?.result?.googleId || null;
  const userId = routeId || currentUserId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!userId) {
      toast.error("You must be logged in to view a profile.");
      history.push("/auth");
      return;
    }

    let isMounted = true;
    setLoading(true);

    api
      .fetchUserProfile(userId)
      .then(({ data }) => {
        if (!isMounted) return;
        setProfile(data.user);
        setPosts(data.posts || []);
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        toast.error("Failed to load profile.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, history]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-off-white">
        <div className="w-10 h-10 rounded-full border-4 border-off-white border-t-dark-green animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <p className="text-text-gray">Profile not found.</p>
      </div>
    );
  }

  const isOwnProfile = currentUserId && String(currentUserId) === String(profile._id);

  return (
    <div className="min-h-screen bg-off-white py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Profile header */}
        <div className="bg-white border border-light-green rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="w-24 h-24 rounded-full bg-accent-green text-white flex items-center justify-center text-3xl font-bold overflow-hidden shrink-0">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span>{profile.name?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-text-dark mb-1 truncate">{profile.name}</h1>
            <p className="text-xs text-text-gray mb-1 truncate">{profile.email}</p>
            {profile.location && (
              <p className="text-sm text-text-gray mb-2">
                <strong>{profile.name}</strong> is located at {profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="text-sm text-text-dark whitespace-pre-line mb-2">{profile.bio}</p>
            )}
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => history.push("/settings")}
                className="mt-1 inline-flex items-center px-4 py-1.5 rounded-full border border-dark-green/40 text-dark-green text-xs font-semibold hover:bg-dark-green/5 transition-colors"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* User posts */}
        <div className="bg-off-white">
          <h2 className="text-lg font-bold text-text-dark mb-3">
            {isOwnProfile ? "Your posts" : "Posts"}
          </h2>
          {posts.length === 0 ? (
            <p className="text-sm text-text-gray">No posts yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {posts.map((post) => (
                <Post key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
