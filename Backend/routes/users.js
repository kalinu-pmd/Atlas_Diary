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
	getUserStats,
	getUserProfile,
	verifyEmailOtp,
	resendOtp,
	createUserByAdmin,
	requestPasswordReset,
	resetPasswordWithOtp,
	adminResetUserPassword,
	verifyPasswordResetOtp,
	requestDeleteAccountOtp,
	deleteAccountWithOtp,
} from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.post("/verify-otp", verifyEmailOtp);
router.post("/resend-otp", resendOtp);
router.post("/admin/create", auth, createUserByAdmin);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPasswordWithOtp);
router.post("/verify-reset-otp", verifyPasswordResetOtp);
router.post("/request-delete-account-otp", auth, requestDeleteAccountOtp);
router.post("/delete-account", auth, deleteAccountWithOtp);
router.post("/admin/:id/reset-password", auth, adminResetUserPassword);
router.get("/", auth, getAllUsers);
router.get("/:id/stats", auth, getUserStats);
router.get("/:id/profile", auth, getUserProfile);
router.delete("/:id", auth, deleteUser);
router.patch("/:id", auth, editUser);

export default router;
