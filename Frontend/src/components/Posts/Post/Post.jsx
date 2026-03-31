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
	MdChevronLeft,
	MdChevronRight,
} from "react-icons/md";

import { deletePost, likePost, reportPost } from "../../../actions/posts";

// Calm, subtle "like" sound (soft chime)
const playLikeSound = () => {
	try {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return;
		const ctx = new AudioCtx();

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = "sine";
		// Soft mid-high tone with tiny upward glide
		osc.frequency.setValueAtTime(520, ctx.currentTime);
		osc.frequency.linearRampToValueAtTime(580, ctx.currentTime + 0.18);

		// Very gentle volume, slow-ish fade out
		gain.gain.setValueAtTime(0.08, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start();
		osc.stop(ctx.currentTime + 0.45);
		osc.onended = () => ctx.close();
	} catch (e) {
		// Ignore audio errors so UI still works everywhere
	}
};

const formatLocationName = (name) => {
	if (!name) return "";
	const parts = name
		.split(",")
		.map((p) => p.trim())
		.filter(Boolean);
	if (!parts.length) return "";
	const primary = parts[0];
	const secondary = parts[1] && parts[1] !== primary ? parts[1] : null;
	const label = secondary ? `${primary}, ${secondary}` : primary;
	return label.length > 40 ? primary : label;
};

const Post = ({ post, onDeleted }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const user = useSelector((state) => state.auth.authData);

	// Get current page from URL query params
	const queryParams = new URLSearchParams(location.search);
	const currentPage = queryParams.get("page") || 1;

	const [likes, setLikes] = useState(post?.likes || []);
	const [menuOpen, setMenuOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [reportModalOpen, setReportModalOpen] = useState(false);
	const [reportReason, setReportReason] = useState("not_real_place");
	const [reportDetails, setReportDetails] = useState("");
	const userId = user?.result?.googleId || user?.result?._id;
	const hasLiked = userId && likes?.some((like) => like === userId);
	const isOwner =
		user?.result?.googleId === post?.creator ||
		user?.result?._id === post?.creator;
	const currentUserProfileImage =
		user?.result?.profileImage || user?.result?.imageUrl || null;

	const Likes = () => {
		const len = likes.length;
		if (len > 0) {
			return hasLiked ? (
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

	const handleOpenReport = () => {
		if (!user?.result) {
			toast.info("Please sign in to report posts.");
			return;
		}
		setMenuOpen(false);
		setReportReason("not_real_place");
		setReportDetails("");
		setReportModalOpen(true);
	};

	const handleSubmitReport = (e) => {
		e.preventDefault();
		if (!reportReason) return;
		dispatch(
			reportPost(post._id, {
				reason: reportReason,
				details: reportDetails?.trim() || undefined,
			}),
		);
		setReportModalOpen(false);
	};

	const openPost = () => history.push(`/posts/${post._id}`);

	const openAuthorProfile = () => {
		if (!post?.creator) return;
		history.push(`/profile/${post.creator}`);
	};

	const handleLike = () => {
		if (!user?.result) {
			toast.info("Please sign in to like posts.");
			return;
		}

		dispatch(likePost(post._id));
		if (hasLiked) {
			setLikes((prev) => prev.filter((id) => id !== userId));
		} else {
			setLikes((prev) => [...prev, userId]);
			playLikeSound();
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
		dispatch(deletePost(post._id, parseInt(currentPage, 10))).then((success) => {
			if (success && typeof onDeleted === "function") {
				onDeleted(post._id);
			}
		});
	};

	const imageListRaw = Array.isArray(post.selectedFile)
		? post.selectedFile.filter(Boolean)
		: post.selectedFile
			? [post.selectedFile]
			: [];
	const imageList =
		imageListRaw.length > 0
			? imageListRaw
			: [
				"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png",
			];
	const imageUrl = imageList[currentImageIndex] || imageList[0];

	const avatarUrl = post.authorImage || (isOwner ? currentUserProfileImage : null);
	const placeLabel = formatLocationName(post.locationName || "");
	const postTitle = (post.title || "").trim();
	// Keep cards visually similar in height by truncating
	// descriptions a bit earlier and using a See more toggle.
	const maxDescriptionChars = 160;
	const messageText = post.message || "";
	const hashtagsText =
		Array.isArray(post.tags) && post.tags.length > 0
			? post.tags.map((tag) => `#${tag}`).join(" ")
			: "";
	const totalDescriptionLength =
		messageText.length + (hashtagsText ? 1 + hashtagsText.length : 0);
	const isLongDescription = totalDescriptionLength > maxDescriptionChars;
	const visibleMessage =
		!isLongDescription || isExpanded
			? messageText
			: `${messageText.slice(0, maxDescriptionChars).trim()}...`;

	const showImageNavigation = imageList.length > 1;
	const hasPrevImage = currentImageIndex > 0;
	const hasNextImage = currentImageIndex < imageList.length - 1;
	const handlePrevImage = (e) => {
		e.stopPropagation();
		if (!hasPrevImage) return;
		setCurrentImageIndex((prev) => prev - 1);
	};
	const handleNextImage = (e) => {
		e.stopPropagation();
		if (!hasNextImage) return;
		setCurrentImageIndex((prev) => prev + 1);
	};

	return (
		<div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden border border-light-green/60 hover:-translate-y-1">
			{/* Header with author info */}
			<div className="px-4 pt-4 pb-2 flex items-center justify-between bg-white/70 backdrop-blur-sm border-b border-light-green/20">
				<button
					type="button"
					onClick={openAuthorProfile}
					className="flex items-center gap-3 flex-1 min-w-0 text-left"
				>
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt={post.name || "User avatar"}
							className="w-10 h-10 rounded-full object-cover shrink-0 border border-light-green"
							onError={(e) => {
								e.target.onerror = null;
								e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.name || "User");
							}}
						/>
					) : (
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-green to-light-green flex items-center justify-center text-white font-bold text-sm shrink-0">
							{post.name?.charAt(0)?.toUpperCase() || "U"}
						</div>
					)}
					<div className="flex-1 min-w-0">
						<p className="font-semibold text-text-dark text-sm truncate">
							{post.name}
						</p>
						<p className="text-xs text-text-gray truncate">
							{placeLabel
								? `${post.name || "Someone"} is at ${placeLabel}`
								: ""}
						</p>
						<p className="text-[11px] text-text-gray mt-0">
							{moment(post.createdAt).fromNow()}
						</p>
					</div>
				</button>
				{user?.result && (
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
							<div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
								{isOwner ? (
									<>
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
									</>
								) : (
									<button
										type="button"
										onClick={handleOpenReport}
										className="w-full text-left px-3 py-2 text-sm text-text-dark hover:bg-gray-100"
									>
										Report post
									</button>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Tags (subtitle) */}

			{/* Description + hashtags (above image, like Facebook) */}
			<div className="px-4 pt-2 pb-3 bg-white">
				{postTitle && (
					<p className="text-sm font-bold text-text-dark mb-1">
						{postTitle}
					</p>
				)}
				<p className="text-sm text-text-dark leading-relaxed">
					{visibleMessage}
					{isLongDescription && (
						<button
							type="button"
							onClick={() => setIsExpanded((prev) => !prev)}
							className="ml-1 text-dark-green font-semibold text-xs hover:underline"
						>
							{isExpanded ? "See less" : "See more"}
						</button>
					)}
					{post.tags?.length > 0 && (!isLongDescription || isExpanded) && (
						<span className="text-light-green font-semibold">
							{" "}
							{hashtagsText}
						</span>
					)}
				</p>
			</div>

			{/* Image */}
			<div className="relative w-full bg-gray-200 overflow-hidden group" style={{ paddingTop: "56.25%" }}>
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

				{showImageNavigation && (
					<>
						{hasPrevImage && (
							<button
								type="button"
								onClick={handlePrevImage}
								className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/65"
								title="Previous photo"
							>
								<MdChevronLeft size={22} />
							</button>
						)}
						{hasNextImage && (
							<button
								type="button"
								onClick={handleNextImage}
								className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/65"
								title="Next photo"
							>
								<MdChevronRight size={22} />
							</button>
						)}
					</>
				)}

				{/* Image counter badge */}
				{showImageNavigation && (
					<div className="absolute top-3 right-3 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
						{currentImageIndex + 1}/{imageList.length}
					</div>
				)}

				{/* Gradient overlay at bottom for readability */}
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
			</div>

			{/* Stats */}
			<div className="px-4 py-2 border-t border-light-green/30 flex items-center justify-between text-xs text-text-gray bg-white/60">
				<span className="flex items-center gap-1">
					<span className="w-5 h-5 rounded-full bg-dark-green text-white text-xs flex items-center justify-center">
						👍
					</span>
					{likes.length} {likes.length === 1 ? "like" : "likes"}
				</span>
				{post.comments?.length > 0 && (
					<span className="flex items-center gap-1">
						<MdComment size={14} />
						{post.comments?.length || post.commentsCount || 0} {(post.comments?.length || post.commentsCount || 0) === 1 ? "comment" : "comments"}
					</span>
				)}
			</div>

			{/* Action buttons */}
			<div className="flex items-center justify-between px-2 py-2 border-t border-light-green/30 bg-white">
				<button
					className="flex-1 flex items-center justify-center gap-2 text-text-gray hover:bg-gray-100 py-2 rounded font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					onClick={handleLike}
					title={!user?.result ? "Sign in to like posts" : hasLiked ? "Unlike this post" : "Like this post"}
				>
					{hasLiked ? (
						<>
							<MdThumbUp size={18} className="text-dark-green" />
							<span className="text-dark-green">Liked</span>
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

			{/* Report post modal */}
			{reportModalOpen && (
				<div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
					<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-5 w-full max-w-sm">
						<h3 className="text-text-dark font-extrabold text-lg mb-1">
							Report this place
						</h3>
						<p className="text-xs text-text-gray mb-4">
							Help us keep Atlas Diary safe by telling us what&apos;s wrong with this post.
						</p>
						<form onSubmit={handleSubmitReport} className="flex flex-col gap-3 text-sm">
							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-dark-green">
									Reason
								</span>
								<select
									value={reportReason}
									onChange={(e) => setReportReason(e.target.value)}
									className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2.5 text-sm text-text-dark transition-colors"
								>
									<option value="not_real_place">Not a real place</option>
									<option value="description_mismatch">Description does not match the location</option>
									<option value="photo_mismatch">Photos do not match the location</option>
									<option value="spam_or_advertisement">Spam / advertisement</option>
									<option value="other">Something else</option>
								</select>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-semibold text-dark-green">
									Additional details <span className="text-text-gray font-normal">(optional)</span>
								</label>
								<textarea
									rows={3}
									value={reportDetails}
									onChange={(e) => setReportDetails(e.target.value)}
									placeholder="Tell us briefly why this place looks fake or misleading."
									className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2.5 text-sm text-text-dark resize-y transition-colors"
								/>
							</div>
							<div className="flex justify-end gap-2 mt-2">
								<button
									type="button"
									onClick={() => setReportModalOpen(false)}
									className="px-4 py-2 rounded-lg border border-dark-green/20 text-dark-green font-semibold text-xs hover:bg-dark-green/5 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 rounded-lg bg-orange hover:bg-orange-hover text-white font-bold text-xs transition-colors"
								>
									Submit report
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
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
		authorImage: PropTypes.string,
		locationName: PropTypes.string,
	}).isRequired,
	onDeleted: PropTypes.func,
};

export default Post;
