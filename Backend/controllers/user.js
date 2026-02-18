import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

import User from "../models/users.js";
import PostMessage from "../models/postMessage.js";

export const signIn = async (req, res) => {
	const { email, password, rememberMe } = req.body;

	try {
		const existingUser = await User.findOne({ email });

		if (!existingUser) {
			return res
				.status(404)
				.json({ message: "Invalid username or password" });
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

		if (existingUser) {
			return res.status(404).json({ message: "User already exists" });
		}
		if (password !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const result = await User.create({
			email,
			password: hashedPassword,
			name: `${firstName} ${lastName}`,
		});

		const token = jwt.sign(
			{ email: result.email, id: result._id },
			JWT_SECRET,
			{
				expiresIn: "1h",
			},
		);

		res.status(200).json({ result, token });
	} catch (error) {
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

	if (user) {
		const { email, password, name } = req.body;

		// Prepare update object
		const updateData = { email, name };

		// Only hash and include password if provided
		if (password) {
			const hashedPassword = await bcrypt.hash(password, 12);
			updateData.password = hashedPassword;
		}

		if (!email) {
			updateData.email = user.email; // Keep existing email, if not available
		}

		const updatedUser = await User.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (updatedUser) {
			return res.status(200).json({ msg: "User updated" });
		}
	} else {
		return res.status(404).json({ msg: "No user found" });
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
