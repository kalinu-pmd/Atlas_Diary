import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import {
	MdThumbUp,
	MdThumbUpOffAlt,
	MdDelete,
	MdMoreHoriz,
} from "react-icons/md";

import { deletePost, likePost } from "../../../actions/posts";

const Post = ({ post }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const user = useSelector((state) => state.auth.authData);

	const [likes, setLikes] = useState(post?.likes);
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

	const imageUrl =
		Array.isArray(post.selectedFile) && post.selectedFile.length > 0
			? post.selectedFile[0]
			: post.selectedFile ||
				"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

	return (
		<div className="flex flex-col justify-between bg-off-white border border-dark-green rounded-[15px] shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 h-full overflow-hidden">
			{/* Media */}
			<div className="relative" style={{ paddingTop: "56.25%" }}>
				<img
					src={imageUrl}
					alt={post.title}
					className="absolute inset-0 w-full h-full object-cover rounded-t-[15px]"
					style={{ backgroundColor: "rgba(12,52,44,0.7)" }}
					onError={(e) => {
						e.target.onerror = null;
						e.target.src =
							"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
					}}
				/>

				{/* Image counter badge */}
				{Array.isArray(post.selectedFile) &&
					post.selectedFile.length > 1 && (
						<div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded-xl shadow z-10">
							+{post.selectedFile.length - 1} more
						</div>
					)}

				{/* Author overlay (bottom-left) */}
				<div className="absolute top-5 left-5 bg-dark-green/80 text-off-white px-3 py-2 rounded-lg z-10">
					<p className="font-bold text-sm leading-tight">
						{post.name}
					</p>
					<p className="text-xs">
						{moment(post.createdAt).fromNow()}
					</p>
				</div>

				{/* Edit overlay (top-right) */}
				{isOwner && (
					<div className="absolute top-5 right-5 z-10">
						<button
							className="text-white bg-light-green/90 hover:bg-light-green rounded-lg px-2 py-1 transition-colors"
							onClick={() => {
								dispatch({
									type: "SELECTED_POST",
									payload: post._id,
								});
								toast.info("Post selected for editing!");
							}}
						>
							<MdMoreHoriz size={20} />
						</button>
					</div>
				)}
			</div>

			{/* Clickable body */}
			<button
				onClick={openPost}
				className="flex-1 flex flex-col text-left w-full bg-transparent border-0 cursor-pointer"
			>
				{/* Tags */}
				<div className="px-4 pt-3 pb-1">
					<p className="text-xs text-text-gray">
						{post.tags.map((tag) => `#${tag} `)}
					</p>
				</div>

				{/* Title */}
				<div className="px-4 pb-1">
					<h2 className="text-lg font-bold text-text-dark leading-snug">
						{post.title}
					</h2>
				</div>

				{/* Message excerpt */}
				<div className="px-4 pb-3">
					<p className="text-sm text-text-gray line-clamp-3">
						{post.message.split(" ").splice(0, 25).join(" ")}...
					</p>
				</div>
			</button>

			{/* Actions */}
			<div className="flex items-center justify-between px-4 py-2 bg-light-green/10 border-t border-dark-green/10">
				<button
					className="flex items-center gap-1 text-dark-green text-sm font-medium hover:bg-light-green/20 px-2 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!user?.result}
					onClick={handleLike}
				>
					<Likes />
				</button>

				{isOwner && (
					<button
						className="flex items-center gap-1 text-orange text-sm font-medium hover:bg-orange/10 px-2 py-1 rounded transition-colors"
						onClick={() => dispatch(deletePost(post._id))}
					>
						<MdDelete size={16} />
						Delete
					</button>
				)}
			</div>
		</div>
	);
};

export default Post;
