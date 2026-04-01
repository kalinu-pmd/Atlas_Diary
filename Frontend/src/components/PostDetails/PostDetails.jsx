import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useParams, useHistory } from "react-router-dom";
import { MdClose, MdChevronLeft, MdChevronRight, MdThumbUp, MdThumbUpOffAlt, MdExpandMore } from "react-icons/md";
import LinesEllipsis from "react-lines-ellipsis";
import { toast } from "react-toastify";

import {
	getPostById,
	getPostsBySearch,
	trackPostView,
	likePost,
}	from "../../actions/posts";
import * as api from "../../api";
import CommentSection from "./CommentSection";
import SimilarPosts from "../SimilarPosts/SimilarPosts";

function PostDetails() {
	const { post, posts } = useSelector((state) => state.posts);
	const dispatch = useDispatch();
	const history = useHistory();
	const { id } = useParams();
	const user = useSelector((state) => state.auth.authData);

	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [reviewSent, setReviewSent] = useState(false);
	const [reviewSending, setReviewSending] = useState(false);
	const [latestReportStatus, setLatestReportStatus] = useState(null);
	const [isPostLoading, setIsPostLoading] = useState(true);
	const [likes, setLikes] = useState([]);
	const [showScrollButton, setShowScrollButton] = useState(true);
	const similarPostsRef = useRef(null);

	// Detect when similar posts section is visible to hide button.
	// In production, data can render later, so re-bind observer after post loads.
	useEffect(() => {
		const target = similarPostsRef.current;
		if (!target) return;

		if (typeof window === "undefined" || !window.IntersectionObserver) {
			setShowScrollButton(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setShowScrollButton(!entry.isIntersecting);
			},
			{ threshold: 0.1 }
		);

		observer.observe(target);

		return () => {
			observer.unobserve(target);
			observer.disconnect();
		};
	}, [isPostLoading, post?._id]);

	useEffect(() => {
		setIsPostLoading(true);
		dispatch(getPostById(id));
		dispatch(trackPostView(id));
	}, [dispatch, id]);

	useEffect(() => {
		if (post && String(post._id) === String(id)) {
			setIsPostLoading(false);
			setLikes(post.likes || []);
			// If backend returned latestReport, keep its status for banners
			if (post.latestReport && post.latestReport.status) {
				setLatestReportStatus(post.latestReport.status);
			}
			dispatch(
				getPostsBySearch({
					search: "none",
					tags: post?.tags?.join(","),
				}),
			);
		}
	}, [dispatch, post, id]);

	const recommendedPosts = posts.filter(
		(recommendedPost) => recommendedPost?._id !== post?._id,
	);

	const currentUserId =
		user?.result?.googleId || user?.result?._id || null;
	const isOwner =
		currentUserId && post?.creator
			? String(currentUserId) === String(post.creator)
			: false;
	const hasLiked =
		currentUserId && likes?.some((likeId) => String(likeId) === String(currentUserId));

	const handleEditPost = () => {
		if (!isOwner) return;
		const latestReport = post?.latestReport;
		const requiresLocationFix =
			latestReport &&
			["description_mismatch", "photo_mismatch"].includes(
				latestReport.reason,
			);
		const sendForReviewAfterUpdate =
			latestReport && latestReport.status === "alerted";
		const reportId = sendForReviewAfterUpdate ? latestReport._id : null;
		dispatch({
			type: "SELECTED_POST",
			payload: post._id,
		});
		history.push({
			pathname: "/create-post",
			state: { requiresLocationFix, sendForReviewAfterUpdate, reportId },
		});
	};

	const openPost = (_id) => {
		history.push(`/posts/${_id}`);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleToggleLike = () => {
		if (!user?.result) {
			toast.info("Please sign in to like posts.");
			return;
		}

		if (!post?._id) return;

		dispatch(likePost(post._id));

		setLikes((prevLikes) => {
			if (hasLiked) {
				return prevLikes.filter(
					(idVal) => String(idVal) !== String(currentUserId),
				);
			}
			return [...prevLikes, currentUserId];
		});
	};

	if (isPostLoading) {
		return (
			<div className="flex justify-center items-center w-full min-h-[calc(100vh-4rem)] bg-gradient-to-br from-off-white to-light-green/10 border-2 border-light-green">
				<div className="flex flex-col items-center gap-4">
					<div
						className="w-14 h-14 rounded-full border-4 border-light-green/30 border-t-dark-green animate-spin"
						role="status"
						aria-label="Loading post"
					/>
					<p className="text-dark-green font-semibold text-sm">Loading amazing content...</p>
				</div>
			</div>
		);
	}

	if (!post) return null;

	const renderImages = () => {
		if (Array.isArray(post.selectedFile) && post.selectedFile.length > 0) {
			return (
				<div className="space-y-3">
					{post.selectedFile.map((image, idx) => (
						<img
							key={idx}
							src={image}
							alt={`${post.title} - ${idx + 1}`}
							loading="lazy"
							onClick={() => {
								setCurrentImageIndex(idx);
								setLightboxOpen(true);
							}}
							className="w-full rounded-[18px] object-cover border-3 border-light-green shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer"
							style={{
								maxHeight: 500,
								minHeight: 300,
							}}
							onError={(e) => {
								e.target.onerror = null;
								e.target.src =
									"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
							}}
						/>
					))}
				</div>
			);
		}
		return (
			<img
				src={
					post.selectedFile ||
					"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png"
				}
				alt={post.title}
				onClick={() => {
					setCurrentImageIndex(0);
					setLightboxOpen(true);
				}}
				loading="lazy"
				className="w-full rounded-[18px] object-cover border-3 border-light-green shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer"
				style={{ maxHeight: 500, minHeight: 300 }}
				onError={(e) => {
					e.target.onerror = null;
					e.target.src =
						"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
				}}
			/>
		);
	};

	const handleSendForReview = async () => {
		if (!isOwner || reviewSending) return;
		setReviewSending(true);
		try {
			await api.sendPostForReview(post._id, {});
			toast.success(
				"Your updated post has been sent to the admins for review.",
			);
			setReviewSent(true);
			setLatestReportStatus("under_review");
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log("Error sending post for review:", error);
			const message =
				error?.response?.data?.message ||
				"Failed to send post for review. Please try again.";
			toast.error(message);
		}
		finally {
			setReviewSending(false);
		}
	};

	const scrollToSimilarPosts = () => {
		if (similarPostsRef.current) {
			similarPostsRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	};

	return (
		<div>
			{/* Lightbox Modal */}
			{lightboxOpen && (
				<div
				className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/80 backdrop-blur-md"
				onClick={() => setLightboxOpen(false)}
			>
				<button
					onClick={(e) => {
						e.stopPropagation();
						setLightboxOpen(false);
					}}
					className="absolute top-8 right-8 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/30 backdrop-blur-sm"
					aria-label="Close image"
				>
					<MdClose size={28} />
				</button>

				<div
					className="relative w-full max-w-5xl mx-4 flex items-center justify-center"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Main image */}
					<div className="relative w-full">
						<img
							src={
								Array.isArray(post.selectedFile)
									? post.selectedFile[currentImageIndex]
									: post.selectedFile
							}
							alt={`${post.title} - ${currentImageIndex + 1}`}
							className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
							onError={(e) => {
								e.target.onerror = null;
								e.target.src =
									"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
							}}
						/>

						{/* Image counter */}
						{Array.isArray(post.selectedFile) &&
							post.selectedFile.length > 1 && (
								<div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-light-green px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-light-green/50">
									{currentImageIndex + 1} / {post.selectedFile.length}
								</div>
							)}
					</div>

					{/* Navigation buttons */}
					{Array.isArray(post.selectedFile) &&
						post.selectedFile.length > 1 && (
							<>
								<button
									onClick={() =>
										setCurrentImageIndex(
											(prev) =>
												(prev - 1 +
													post.selectedFile.length) %
												post.selectedFile.length,
										)
									}
									className="absolute left-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-4 transition-all duration-300 border border-white/30 backdrop-blur-sm hover:scale-110 shadow-xl"
									aria-label="Previous image"
								>
									<MdChevronLeft size={28} />
								</button>
								<button
									onClick={() =>
										setCurrentImageIndex(
											(prev) =>
												(prev + 1) %
												post.selectedFile.length,
										)
									}
									className="absolute right-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-4 transition-all duration-300 border border-white/30 backdrop-blur-sm hover:scale-110 shadow-xl"
									aria-label="Next image"
								>
									<MdChevronRight size={28} />
								</button>
							</>
						)}
				</div>
			</div>
		)}

			{/* Main content */}
			<div className="mt-8 sm:mt-7 pb-12">
			<div className="bg-gradient-to-b from-off-white to-light-green/3 rounded-[20px] shadow-xl p-8 border border-light-green/40">
				{/* Main grid - centered layout */}
				<div className="flex flex-col gap-8 max-w-4xl mx-auto">
					{/* Content section */}
					<div className="bg-gradient-to-br from-off-white via-off-white to-light-green/5 rounded-[20px] p-6 border-b-2 border-light-green/30">
						<div className="flex items-start justify-between gap-3 mb-4">
						<div className="flex-1">
							<h2 className="text-4xl sm:text-3xl font-black bg-gradient-to-r from-dark-green via-dark-green to-light-green bg-clip-text text-transparent mb-2">
								{post.title}
							</h2>
							{/* Author info with improved styling */}
							<div className="flex items-center gap-3 mb-3">
								<div className="h-10 w-10 rounded-full bg-gradient-to-br from-dark-green to-light-green flex items-center justify-center text-white font-bold text-sm">
									{post.name?.charAt(0).toUpperCase() || "U"}
								</div>
								<div>
									<p className="font-bold text-text-dark text-sm">
										{post.name}
									</p>
									<p className="text-xs text-text-gray">
										{moment(post.createdAt).fromNow()}
									</p>
								</div>
							</div>
						</div>
							{isOwner && (
								<div className="flex items-center gap-2 self-start">
									<button
										type="button"
										onClick={handleEditPost}
										className="px-3 py-1.5 rounded-full border border-dark-green/40 text-dark-green text-xs font-semibold hover:bg-dark-green/10 transition-colors"
									>
										Edit
									</button>
									{["alerted", "rejected"].includes(latestReportStatus) && (
										<button
											type="button"
											onClick={handleSendForReview}
											disabled={reviewSending || reviewSent}
											className="px-4 py-2 rounded-full border-2 border-orange text-orange text-xs font-bold hover:bg-orange hover:text-off-white transition-all duration-300 disabled:opacity-50 disabled:cursor-default"
										>
											{reviewSent ? "✅ Sent" : reviewSending ? "Sending..." : "📤 Review"}
										</button>
									)}
								</div>
							)}
						</div>
							{isOwner && latestReportStatus === "under_review" && (
								<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-light-green/20 border-2 border-light-green px-4 py-2 text-xs font-bold text-dark-green backdrop-blur-sm">
									<span className="w-2.5 h-2.5 rounded-full bg-light-green animate-pulse" />
									<span>Review in progress</span>
								</div>
							)}
							{isOwner && latestReportStatus === "rejected" && (
								<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange/20 border-2 border-orange px-4 py-2 text-xs font-bold text-orange backdrop-blur-sm">
									<span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
									<span>Changes needed - please edit</span>
								</div>
							)}

						{/* Message + hashtags with improved styling */}
						<p className="text-text-dark text-lg leading-relaxed mb-4 whitespace-pre-line">
							{post.message}
						</p>
						
						{/** Tags section with better styling **/}
						{post.tags?.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-light-green/30">
								{post.tags.map((tag, idx) => (
									<span
										key={idx}
										className="bg-gradient-to-r from-light-green/80 to-light-green text-text-dark px-4 py-1.5 rounded-full text-xs font-bold border border-light-green/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
									>
										#{tag}
									</span>
								))}
							</div>
						)}
					</div>

					{/* Images section - centered */}
					{renderImages()}

					{/* Primary actions: likes summary */}
					<div className="flex items-center justify-between px-4 py-3 rounded-[15px] bg-gradient-to-r from-light-green/10 to-dark-green/5 border-2 border-light-green/40 mt-4">
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={handleToggleLike}
								className={`inline-flex items-center gap-2 text-sm font-bold rounded-full px-4 py-2 border-2 transition-all duration-300 ${
									hasLiked
										? "bg-dark-green text-light-green border-dark-green shadow-md"
										: "bg-off-white border-dark-green/30 text-text-dark hover:bg-light-green/20 hover:border-dark-green"
								}`}
							>
								{hasLiked ? (
									<>
										<MdThumbUp size={18} />
										<span>Liked</span>
									</>
								) : (
									<>
										<MdThumbUpOffAlt size={18} />
										<span>Like</span>
									</>
								)}
							</button>
							{likes.length > 0 && (
								<span className="text-sm font-bold text-dark-green">
									💚 {likes.length} {likes.length === 1 ? "like" : "likes"}
								</span>
							)}
						</div>
						<span className="text-xs font-semibold text-text-gray bg-white/60 px-3 py-1 rounded-full">
							💬 {post.comments?.length || 0} {(post.comments?.length || 0) === 1 ? "comment" : "comments"}
						</span>
					</div>

					{/* Comments section */}
					<CommentSection post={post} />
				</div>

				{/* Similar posts (now the primary recommendation section) */}
				<div className="mt-8" ref={similarPostsRef}>
					<SimilarPosts postId={post._id} />
				</div>
			</div>
		</div>

		{/* Floating Scroll Button */}
		{showScrollButton && (
			<button
				onClick={scrollToSimilarPosts}
				className="fixed bottom-8 right-8 bg-gradient-to-r from-dark-green to-dark-green/80 hover:from-light-green hover:to-light-green/80 text-off-white hover:text-text-dark rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 p-4 group z-50 opacity-100 animate-fade-in border-2 border-light-green/50 hover:border-light-green backdrop-blur-md hover:scale-110"
				title="Scroll to recommendations"
			>
				<div className="flex items-center gap-2">
					<span className="text-sm font-bold whitespace-nowrap">You might also like</span>
					<MdExpandMore size={20} className="group-hover:translate-y-1 transition-transform duration-500" />
				</div>
			</button>
		)}
		<style>{`
			@keyframes fadeOut {
				from {
					opacity: 1;
					transform: translateY(0);
				}
				to {
					opacity: 0;
					transform: translateY(10px);
				}
			}
			@keyframes fadeIn {
				from {
					opacity: 0;
					transform: translateY(10px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}
			button.animate-fade-in {
				animation: fadeIn 0.5s ease-out;
			}
		`}</style>
		</div>
	);
}

export default PostDetails;
