import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

import User from "../models/users.js";
import PostMessage from "../models/postMessage.js";
import { sendOtpEmail } from "../services/emailService.js";

export const signIn = async (req, res) => {
	const { email, password, rememberMe } = req.body;

	try {
		const existingUser = await User.findOne({ email });

		if (!existingUser) {
			return res
				.status(404)
				.json({ message: "Invalid username or password" });
		}

		// Require verified email for login (but keep legacy users without flag working)
		if (existingUser.isEmailVerified === false) {
			return res
				.status(403)
				.json({ message: "Please verify your email before signing in." });
		}

		const isPasswordCorrect = await bcrypt.compare(
			password,
			existingUser.password,
		);

		if (!isPasswordCorrect) {
			return res
				.status(404)
				.json({ message: "Invalid username or password" });
		}

		// Set token expiration: 7 days if remember me, 1 hour otherwise
		const tokenExpiry = rememberMe ? "7d" : "1h";

		const token = jwt.sign(
			{ email: existingUser.email, id: existingUser._id },
			JWT_SECRET,
			{ expiresIn: tokenExpiry },
		);

		res.status(200).json({ result: existingUser, token });
	} catch (error) {
		res.status(500).json({ message: "Something went wrong" });
	}
};

export const signUp = async (req, res) => {
	const { email, password, confirmPassword, firstName, lastName } = req.body;

	try {
		const existingUser = await User.findOne({ email });

		if (existingUser && existingUser.isEmailVerified !== false) {
			return res.status(409).json({ message: "User already exists" });
		}
		if (password !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		// Generate 6-digit OTP and hash it
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpHash = await bcrypt.hash(otp, 10);
		const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

		let userDoc;
		if (existingUser && existingUser.isEmailVerified === false) {
			// Reuse unverified account, update credentials + OTP
			existingUser.password = hashedPassword;
			existingUser.name = `${firstName} ${lastName}`;
			existingUser.emailVerification = { otpHash, otpExpiresAt };
			userDoc = await existingUser.save();
		} else {
			userDoc = await User.create({
				email,
				password: hashedPassword,
				name: `${firstName} ${lastName}`,
				isEmailVerified: false,
				emailVerification: { otpHash, otpExpiresAt },
			});
		}

		// Send OTP email (best-effort)
		await sendOtpEmail(email, otp);
		console.log("[signUp] Generated OTP for", email, "is", otp);
		const isProd = process.env.NODE_ENV === "production";

		return res.status(200).json({
			message: "OTP sent. Please check your email to verify your account.",
			userId: userDoc._id,
			email: userDoc.email,
			// For development/testing only we return the OTP in the response
			// so you can verify things are wired correctly. This is omitted in production.
			...(isProd ? {} : { debugOtp: otp }),
		});
	} catch (error) {
		console.error("signUp error:", error);
		res.status(500).json({ message: "Something went wrong" });
	}
};

export const getAllUsers = async (req, res, next) => {
	const users = await User.find();
	if (users) return res.status(200).json({ users });
	else return res.status(200).json({ msg: "No users found" });
};

export const deleteUser = async (req, res, next) => {
	const id = req.params.id;
	const user = await User.findByIdAndDelete(id);
	if (user) return res.status(200).json({ msg: "User deleted" });
	else return res.status(404).json({ msg: "No user found" });
};
export const editUser = async (req, res, next) => {
	const id = req.params.id;
	const user = await User.findById(id);

	if (!user) {
		return res.status(404).json({ msg: "No user found" });
	}

	const { email, password, name, bio, profileImage, location, isAdmin } =
		req.body;

	// Prepare update object
	const updateData = { email, name };

	// Optional profile fields
	if (bio !== undefined) updateData.bio = bio;
	if (profileImage !== undefined) updateData.profileImage = profileImage;
	if (location !== undefined) updateData.location = location;

	// Only hash and include password if provided
	if (password) {
		const hashedPassword = await bcrypt.hash(password, 12);
		updateData.password = hashedPassword;
	}

	if (!email) {
		updateData.email = user.email; // Keep existing email, if not available
	}

	// Role changes (isAdmin) are only allowed by admins
	if (typeof isAdmin === "boolean") {
		if (!req.userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const requestingUser = await User.findById(req.userId);
		if (!requestingUser || !requestingUser.isAdmin) {
			return res
				.status(403)
				.json({ message: "Admin privileges required to change roles" });
		}

		updateData.isAdmin = !!isAdmin;
	}

	const updatedUser = await User.findByIdAndUpdate(id, updateData, {
		new: true,
	});

	if (!updatedUser) {
		return res.status(500).json({ msg: "Failed to update user" });
	}

	return res.status(200).json({ msg: "User updated", user: updatedUser });
};

// Get profile information and posts for a user
export const getUserProfile = async (req, res, next) => {
	try {
		const { id } = req.params;

		// First, try to find by Mongo _id
		let user = await User.findById(id).select(
			"name email bio profileImage location isAdmin id",
		);

		// If not found, fall back to the "id" field (used for some OAuth users)
		if (!user) {
			user = await User.findOne({ id }).select(
				"name email bio profileImage location isAdmin id",
			);
		}

		if (!user) return res.status(404).json({ message: "User not found" });

		// Posts created by this user (creator stores user id or external id as string)
		const creatorKey = String(user._id || id);
		const posts = await PostMessage.find({ creator: creatorKey })
			.sort({ createdAt: -1 })
			.lean();

		return res.status(200).json({ user, posts });
	} catch (error) {
		console.error("getUserProfile error:", error);
		return res.status(500).json({ message: "Failed to get user profile" });
	}
};

// Get aggregated stats for a specific user
export const getUserStats = async (req, res, next) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id)
			.populate("likedPosts", "title")
			.populate("commentedPosts", "title");

		if (!user) return res.status(404).json({ message: "User not found" });

		// Count posts created by the user (creator stores user id as string)
		const postsCount = await PostMessage.countDocuments({ creator: id });

		// Build comment details by scanning posts' comments for author prefix
		const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const namePrefix = user.name ? `^${escapeRegex(user.name)}: ` : null;

		let commentDetails = [];
		let totalComments = 0;

		if (namePrefix) {
			// Find posts that contain comments starting with the user's name
			const postsWithUserComments = await PostMessage.find({
				comments: { $elemMatch: { $regex: namePrefix } },
			}).select("title comments");

			commentDetails = postsWithUserComments.map((p) => {
				const count = (p.comments || []).filter((c) =>
					c?.startsWith(`${user.name}: `),
				).length;
				totalComments += count;
				return { postId: p._id, title: p.title, count };
			});
		}

		// Liked posts (populated earlier)
		const likedPosts = (user.likedPosts || []).map((p) => ({
			postId: p._id,
			title: p.title,
		}));

		// Also include list of commentedPosts (unique posts user commented on)
		const commentedPosts = (user.commentedPosts || []).map((p) => ({
			postId: p._id,
			title: p.title,
		}));

		return res.status(200).json({
			postsCount,
			totalComments,
			commentDetails,
			likedPosts,
			commentedPosts,
		});
	} catch (error) {
		console.error("getUserStats error:", error);
		return res.status(500).json({ message: "Failed to get user stats" });
	}
};

// Admin-only: create a user without OTP verification
export const createUserByAdmin = async (req, res) => {
	const { name, email, password, confirmPassword, isAdmin } = req.body || {};

	try {
		// Ensure the requester is an authenticated admin
		if (!req.userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const adminUser = await User.findById(req.userId);
		if (!adminUser || !adminUser.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		// Basic validation (other details mandatory)
		if (!name || !name.trim() || !email || !email.trim()) {
			return res
				.status(400)
				.json({ message: "Name and email are required." });
		}

		if (!password || !confirmPassword) {
			return res
				.status(400)
				.json({ message: "Password and confirm password are required." });
		}

		if (password !== confirmPassword) {
			return res
				.status(400)
				.json({ message: "Passwords do not match." });
		}

		const existingUser = await User.findOne({ email: email.trim() });
		if (existingUser) {
			return res.status(409).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const newUser = await User.create({
			name: name.trim(),
			email: email.trim(),
			password: hashedPassword,
			isAdmin: !!isAdmin,
			// Created by admin: treat email as already verified
			isEmailVerified: true,
			emailVerification: undefined,
		});

		return res
			.status(201)
			.json({ message: "User created successfully", user: newUser });
	} catch (error) {
		console.error("createUserByAdmin error:", error);
		return res.status(500).json({ message: "Failed to create user." });
	}
};

// Verify email OTP and activate account
export const verifyEmailOtp = async (req, res) => {
	const { email, otp } = req.body || {};

	if (!email || !otp) {
		return res
			.status(400)
			.json({ message: "Email and OTP are required." });
	}

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.isEmailVerified === true) {
			return res
				.status(400)
				.json({ message: "Email is already verified." });
		}

		const { emailVerification } = user;
		if (!emailVerification || !emailVerification.otpHash) {
			return res
				.status(400)
				.json({ message: "No verification code found. Please sign up again." });
		}

		if (
			!emailVerification.otpExpiresAt ||
			new Date(emailVerification.otpExpiresAt) < new Date()
		) {
			return res
				.status(400)
				.json({ message: "Verification code has expired. Please sign up again." });
		}

		const isMatch = await bcrypt.compare(otp, emailVerification.otpHash);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid verification code." });
		}

		user.isEmailVerified = true;
		user.emailVerification = undefined;
		const savedUser = await user.save();

		const token = jwt.sign(
			{ email: savedUser.email, id: savedUser._id },
			JWT_SECRET,
			{ expiresIn: "1h" },
		);

		return res.status(200).json({ result: savedUser, token });
	} catch (error) {
		console.error("verifyEmailOtp error:", error);
		return res.status(500).json({ message: "Failed to verify email." });
	}
};
