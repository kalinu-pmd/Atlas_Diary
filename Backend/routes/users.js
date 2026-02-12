// const express = require('express');
// const router = express.Router();
// const User = require('../models/User'); // adjust path as needed

// // Update user
// router.patch('/:id', async (req, res) => {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true }
//     );
//     res.status(200).json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update user" });
//   }
// });

// // Delete user
// router.delete('/:id', async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "User deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete user" });
//   }
// });

// // Get all users
// router.get('/', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json({ users });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch users" });
//   }
// });

// module.exports = router;


import express from "express";
import {
	signIn,
	signUp,
	getAllUsers,
	editUser,
	deleteUser,
} from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.get("/", auth, getAllUsers);
router.delete("/:id", auth, deleteUser);
router.patch("/:id", auth, editUser);

export default router;
