import { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import {
	MdThumbUp,
	MdThumbUpOffAlt,
	MdDelete,
	MdMoreHoriz,
	MdComment,
} from "react-icons/md";

import { deletePost, likePost } from "../../../actions/posts";

const Post = ({ post }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const user = useSelector((state) => state.auth.authData);

	// Get current page from URL query params
	const queryParams = new URLSearchParams(location.search);
	const currentPage = queryParams.get("page") || 1;

	const [likes, setLikes] = useState(post?.likes);
	const [menuOpen, setMenuOpen] = useState(false);
	const userId = user?.result?.googleId || user?.result?._id;
	const hasAlreadyLiked = post.likes.find((like) => like === userId);

	const Likes = () => {
		const len = likes.length;
		if (len > 0) {
			return hasAlreadyLiked ? (
				<span className="flex items-center gap-1">
					<MdThumbUp size={16} />
					{len >= 2
						? `You and ${len - 1} ${len === 2 ? "other" : "others"}`
						: `${len} like${len > 1 ? "s" : ""}`}
				</span>
			) : (
				<span className="flex items-center gap-1">
					<MdThumbUpOffAlt size={16} />
					{len} {len === 1 ? "Like" : "Likes"}
				</span>
			);
		}
		return (
			<span className="flex items-center gap-1">
				<MdThumbUpOffAlt size={16} />
				Like
			</span>
		);
	};

	const isOwner =
		user?.result?.googleId === post?.creator ||
		user?.result?._id === post?.creator;

	const openPost = () => history.push(`/posts/${post._id}`);

	const handleLike = () => {
		dispatch(likePost(post._id));
		if (hasAlreadyLiked) {
			setLikes(post.likes.filter((id) => id !== userId));
		} else {
			setLikes([...post.likes, userId]);
		}
	};

	const handleEdit = () => {
		dispatch({
			type: "SELECTED_POST",
			payload: post._id,
		});
		toast.info("Post selected for editing.");
		setMenuOpen(false);
		history.push("/create-post");
	};

	const handleDelete = () => {
		setMenuOpen(false);
		const confirmed = window.confirm("Are you sure you want to delete this post?");
		if (!confirmed) return;
		// Keep existing delete behavior so pagination stays in sync
		dispatch(deletePost(post._id, parseInt(currentPage)));
	};

	const imageUrl =
		Array.isArray(post.selectedFile) && post.selectedFile.length > 0
			? post.selectedFile[0]
			: post.selectedFile ||
				"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

	return (
		<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200">
			{/* Header with author info */}
			<div className="px-4 pt-4 pb-3 flex items-center justify-between">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-green to-light-green flex items-center justify-center text-white font-bold text-sm shrink-0">
						{post.name?.charAt(0)?.toUpperCase() || "U"}
					</div>
					<div className="flex-1 min-w-0">
						<p className="font-semibold text-text-dark text-sm truncate">
							{post.name}
						</p>
						<p className="text-xs text-text-gray truncate">
							{post.title
								? `${post.name || "Someone"} is at ${post.title}`
								: moment(post.createdAt).fromNow()}
						</p>
						<p className="text-[11px] text-text-gray">
							{moment(post.createdAt).fromNow()}
						</p>
					</div>
				</div>
				{isOwner && (
					<div className="relative">
						<button
							className="text-text-gray hover:text-text-dark transition-colors p-1"
							onClick={() => setMenuOpen((open) => !open)}
							title="Post options"
							type="button"
						>
							<MdMoreHoriz size={18} />
						</button>
						{menuOpen && (
							<div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
								<button
									type="button"
									onClick={handleEdit}
									className="w-full text-left px-3 py-2 text-sm text-text-dark hover:bg-gray-100"
								>
									Edit post
								</button>
								<button
									type="button"
									onClick={handleDelete}
									className="w-full text-left px-3 py-2 text-sm text-orange hover:bg-red-50"
								>
									Delete post
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Tags (subtitle) */}

			{/* Description + hashtags (above image, like Facebook) */}
			<div className="px-4 pt-3 pb-3">
				<p className="text-sm text-text-gray leading-relaxed">
					{post.message}
					{post.tags?.length > 0 && (
						<span className="text-light-green font-semibold">
							{" "}
							{post.tags.map((tag) => `#${tag}`).join(" ")}
						</span>
					)}
				</p>
			</div>

			{/* Image */}
			<div className="relative w-full bg-gray-200 overflow-hidden" style={{ paddingTop: "56.25%" }}>
				<img
					src={imageUrl}
					alt={post.title}
					className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
					onClick={openPost}
					style={{ backgroundColor: "rgba(12,52,44,0.1)" }}
					onError={(e) => {
						e.target.onerror = null;
						e.target.src =
							"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
					}}
				/>

				{/* Image counter badge */}
				{Array.isArray(post.selectedFile) &&
					post.selectedFile.length > 1 && (
						<div className="absolute top-3 right-3 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
							+{post.selectedFile.length - 1}
						</div>
					)}
			</div>

			{/* Stats */}
			<div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-text-gray">
				<span className="flex items-center gap-1">
					<span className="w-5 h-5 rounded-full bg-dark-green text-white text-xs flex items-center justify-center">
						👍
					</span>
					{likes.length} {likes.length === 1 ? "like" : "likes"}
				</span>
				{post.comments?.length > 0 && (
					<span>{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
				)}
			</div>

			{/* Action buttons */}
			<div className="flex items-center justify-between px-2 py-2 border-t border-gray-100">
				<button
					className="flex-1 flex items-center justify-center gap-2 text-text-gray hover:bg-gray-100 py-2 rounded font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!user?.result}
					onClick={handleLike}
					title={!user?.result ? "Sign in to like posts" : "Like this post"}
				>
					{hasAlreadyLiked ? (
						<>
							<MdThumbUp size={18} className="text-dark-green" />
							<span className="text-dark-green">Like</span>
						</>
					) : (
						<>
							<MdThumbUpOffAlt size={18} />
							<span>Like</span>
						</>
					)}
				</button>

				<button
					className="flex-1 flex items-center justify-center gap-2 text-text-gray hover:bg-gray-100 py-2 rounded font-semibold text-sm transition-colors"
					onClick={openPost}
					title="View comments and details"
				>
					<MdComment size={18} />
					<span>Comment</span>
				</button>

				{isOwner && (
					<button
						className="flex-1 flex items-center justify-center gap-2 text-text-gray hover:bg-red-50 py-2 rounded font-semibold text-sm transition-colors hover:text-orange"
						onClick={handleDelete}
						title="Delete this post"
					>
						<MdDelete size={18} />
						<span>Delete</span>
					</button>
				)}
			</div>
		</div>
	);
};

Post.propTypes = {
	post: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		title: PropTypes.string,
		message: PropTypes.string,
		name: PropTypes.string,
		creator: PropTypes.string,
		tags: PropTypes.arrayOf(PropTypes.string),
		selectedFile: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(PropTypes.string),
		]),
		likes: PropTypes.arrayOf(PropTypes.string),
		comments: PropTypes.arrayOf(PropTypes.string),
		createdAt: PropTypes.string,
	}).isRequired,
};

export default Post;
