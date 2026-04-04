import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/users.js";
import PostMessage from "../models/postMessage.js";

dotenv.config();

const syncUserNames = async () => {
  const uri = process.env.CONNECTION_URL;
  if (!uri) {
    throw new Error("Missing CONNECTION_URL in Backend/.env");
  }

  await mongoose.connect(uri);

  const users = await User.find({}, "_id name").lean();
  const userNameById = new Map(
    users
      .map((user) => [String(user._id), String(user.name || "").trim()])
      .filter(([, name]) => Boolean(name)),
  );

  let postMatchedCount = 0;
  let postModifiedCount = 0;

  for (const [userId, userName] of userNameById.entries()) {
    const updateRes = await PostMessage.updateMany(
      { creator: userId },
      { $set: { name: userName } },
    );

    postMatchedCount += Number(updateRes.matchedCount || 0);
    postModifiedCount += Number(updateRes.modifiedCount || 0);
  }

  const postsWithComments = await PostMessage.find(
    { comments: { $exists: true, $ne: [] } },
    "_id comments",
  ).lean();

  const bulkUpdates = [];
  let commentsRewritten = 0;

  for (const post of postsWithComments) {
    const comments = Array.isArray(post.comments) ? post.comments : [];
    let changed = false;

    const updatedComments = comments.map((rawComment) => {
      if (typeof rawComment !== "string") return rawComment;

      const trimmed = rawComment.trim();
      if (!trimmed || !trimmed.startsWith("{")) return rawComment;

      try {
        const parsed = JSON.parse(trimmed);
        const userId = String(parsed?.userId || "").trim();
        if (!userId) return rawComment;

        const currentUserName = userNameById.get(userId);
        if (!currentUserName) return rawComment;

        if (String(parsed.userName || "") === currentUserName) {
          return rawComment;
        }

        changed = true;
        commentsRewritten += 1;

        return JSON.stringify({
          ...parsed,
          userName: currentUserName,
        });
      } catch (_error) {
        return rawComment;
      }
    });

    if (changed) {
      bulkUpdates.push({
        updateOne: {
          filter: { _id: post._id },
          update: { $set: { comments: updatedComments } },
        },
      });
    }
  }

  let commentDocsModified = 0;
  if (bulkUpdates.length > 0) {
    const bulkResult = await PostMessage.bulkWrite(bulkUpdates);
    commentDocsModified = Number(bulkResult.modifiedCount || 0);
  }

  console.log(
    JSON.stringify(
      {
        usersProcessed: userNameById.size,
        postNameSync: {
          matched: postMatchedCount,
          modified: postModifiedCount,
        },
        commentNameSync: {
          docsModified: commentDocsModified,
          commentsRewritten,
        },
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
};

syncUserNames().catch(async (error) => {
  console.error("Name sync failed:", error.message || error);
  try {
    await mongoose.disconnect();
  } catch (_disconnectError) {
    // Ignore disconnect errors here.
  }
  process.exit(1);
});
