// const express = require("express");
// const router = express.Router();

// // Get all users
// router.get("/users", async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Update a user's profile
// router.put("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Delete a user
// router.delete("/users/:id", async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "User deleted" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get all posts
// router.get("/posts", async (req, res) => {
//   try {
//     const posts = await Post.find().populate("user"); // Assuming each post has a reference to a user
//     res.json(posts);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Edit a post
// router.put("/posts/:id", async (req, res) => {
//   try {
//     const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Delete a post
// router.delete("/posts/:id", async (req, res) => {
//   try {
//     await Post.findByIdAndDelete(req.params.id);
//     res.json({ message: "Post deleted" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;
