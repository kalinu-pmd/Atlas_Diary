import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useParams, useHistory } from "react-router-dom";
import { MdClose, MdChevronLeft, MdChevronRight, MdThumbUp, MdThumbUpOffAlt } from "react-icons/md";
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
			<div className="flex justify-center items-center h-[77vh] bg-off-white border-2 border-dark-green rounded-[15px]">
				<div
					className="w-12 h-12 rounded-full border-4 border-off-white border-t-dark-green animate-spin"
					role="status"
					aria-label="Loading post"
				/>
			</div>
		);
	}

	if (!post) return null;

	const renderImages = () => {
		if (Array.isArray(post.selectedFile) && post.selectedFile.length > 0) {
			return (
				<div>
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
							className="w-full rounded-[15px] object-cover border-2 border-dark-green shadow-card hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
							style={{
								maxHeight: 500,
								minHeight: 300,
								marginBottom:
									idx < post.selectedFile.length - 1 ? 10 : 0,
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
				className="w-full rounded-[15px] object-cover border-2 border-dark-green shadow-card hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
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

	return (
		<div>
			{/* Lightbox Modal */}
			{lightboxOpen && (
				<div 
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
					onClick={() => setLightboxOpen(false)}
				>
					<div 
						className="relative w-full max-w-4xl mx-4 flex items-center justify-center"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setLightboxOpen(false)}
							className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
							aria-label="Close"
						>
							<MdClose size={24} />
						</button>

						{/* Main image */}
						<div className="relative w-full">
							<img
								src={
									Array.isArray(post.selectedFile)
										? post.selectedFile[currentImageIndex]
										: post.selectedFile
								}
								alt={`${post.title} - ${currentImageIndex + 1}`}
								className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
								onError={(e) => {
									e.target.onerror = null;
									e.target.src =
										"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
								}}
							/>

							{/* Image counter */}
							{Array.isArray(post.selectedFile) &&
								post.selectedFile.length > 1 && (
									<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
										className="absolute left-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
										aria-label="Previous image"
									>
										<MdChevronLeft size={24} />
									</button>
									<button
										onClick={() =>
											setCurrentImageIndex(
												(prev) =>
													(prev + 1) %
													post.selectedFile.length,
											)
										}
										className="absolute right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
										aria-label="Next image"
									>
										<MdChevronRight size={24} />
									</button>
								</>
							)}
					</div>
				</div>
			)}

			{/* Main content */}
			<div className="mt-8 sm:mt-7">
			<div className="bg-off-white rounded-[18px] shadow-lg p-6">
				{/* Main grid - centered layout */}
				<div className="flex flex-col gap-6 max-w-4xl mx-auto border border-light-green rounded-[20px] p-4 shadow-form">
					{/* Content section */}
					<div className="bg-off-white rounded-[20px] p-2">
						<div className="flex items-start justify-between gap-3 mb-1">
						<h2 className="text-3xl sm:text-2xl font-bold text-text-dark mb-1">
							{post.title}
						</h2>
							{isOwner && ["alerted", "rejected"].includes(latestReportStatus) && (
								<div className="flex items-center gap-2 self-start">
									<button
										type="button"
										onClick={handleEditPost}
										className="px-3 py-1.5 rounded-full border border-dark-green/30 text-dark-green text-xs font-semibold hover:bg-dark-green/5"
									>
										Edit post
									</button>
									<button
										type="button"
										onClick={handleSendForReview}
											disabled={reviewSending || reviewSent}
											className="px-3 py-1.5 rounded-full border border-orange/40 text-orange text-xs font-semibold hover:bg-orange/5 disabled:opacity-50 disabled:cursor-default"
									>
										{reviewSent ? "Review received" : reviewSending ? "Sending..." : "Send for review"}
									</button>
								</div>
							)}
						</div>
							{isOwner && latestReportStatus === "under_review" && (
								<div className="mb-3 inline-flex items-center gap-2 rounded-full bg-light-green/10 border border-light-green px-3 py-1 text-[0.7rem] font-semibold text-dark-green">
									<span className="w-2 h-2 rounded-full bg-light-green" />
									<span>Review received by admin. They will check your updates soon.</span>
								</div>
							)}
							{isOwner && latestReportStatus === "rejected" && (
								<div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange/10 border border-orange px-3 py-1 text-[0.7rem] font-semibold text-orange">
									<span className="w-2 h-2 rounded-full bg-orange" />
									<span>Your last changes were rejected. Please edit the post and send for review again.</span>
								</div>
							)}

						<p className="text-sm text-text-gray mb-3">
							{post.name && (
								<span>
									{post.title
											? `${post.name} is at ${post.title}`
											: post.name}
								</span>
							)}
							{"	"}
							<span className="text-xs text-text-gray">
								{moment(post.createdAt).fromNow()}
							</span>
						</p>

						{/* Message + hashtags */}
						<p className="text-text-dark text-base whitespace-pre-line mb-3">
							{post.message}
							{post.tags?.length > 0 && (
								<span className="text-light-green font-semibold">
									{"\n\n"}
									{post.tags.map((tag) => `#${tag}`).join(" ")}
								</span>
							)}
						</p>
					</div>

					{/* Images section - centered */}
					{renderImages()}

					{/* Primary actions: likes summary */}
					<div className="flex items-center justify-between mt-3 mb-3 px-1">
						<button
							type="button"
							onClick={handleToggleLike}
							className={`inline-flex items-center gap-1 text-sm font-semibold rounded-full px-3 py-1 border transition-colors ${
								hasLiked
									? "bg-accent-green/10 border-accent-green text-accent-green"
									: "bg-off-white border-dark-green/30 text-text-dark hover:bg-light-green/20"
							}`}
						>
							{hasLiked ? (
								<MdThumbUp size={16} />
							) : (
								<MdThumbUpOffAlt size={16} />
							)}
							<span>
								{likes.length > 0
									? `${likes.length} like${likes.length > 1 ? "s" : ""}`
									: "Like"}
							</span>
						</button>
						<span className="text-xs text-text-gray">
							{post.comments?.length || 0} comment
							{(post.comments?.length || 0) === 1 ? "" : "s"}
						</span>
					</div>

					{/* Comments section */}
					<CommentSection post={post} />
				</div>

				{/* Recommended posts */}
				{recommendedPosts.length > 0 && (
					<div className="mt-8 mb-4">
						<h2 className="text-xl font-semibold text-text-dark mb-2">
							You might also like
						</h2>
						<hr className="border-text-gray/20 mb-4" />

						<div className="flex flex-wrap flex-row justify-start gap-4 bg-light-green/5 p-4 rounded-xl border border-light-green">
							{recommendedPosts.map(
								({
									title,
									message,
									name,
									likes,
									selectedFile,
									_id,
								}) => (
									<div
										key={_id}
										className="bg-off-white rounded-xl border border-dark-green/10 shadow-md p-4 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
										onClick={() => openPost(_id)}
										tabIndex={0}
										role="button"
										onKeyPress={(e) => {
											if (e.key === "Enter")
												openPost(_id);
										}}
									>
										<p className="font-semibold text-text-dark text-sm mb-1 leading-snug">
											{title}
										</p>
										<p className="text-xs text-text-gray mb-1">
											{name}
										</p>
										<LinesEllipsis
											text={message}
											maxLine="3"
											ellipsis="..."
											trimRight
											basedOn="letters"
											className="text-xs text-text-dark leading-snug"
										/>
										<p className="text-xs text-text-gray mt-1">
											Likes: {likes.length}
										</p>
										<div className="mt-2">
											<img
												src={
													Array.isArray(
														selectedFile,
													) && selectedFile.length > 0
														? selectedFile[0]
														: selectedFile
												}
												alt="recommended"
												loading="lazy"
												className="w-full h-20 object-cover rounded-lg border border-light-green bg-off-white"
												onError={(e) => {
													e.target.onerror = null;
													e.target.src =
														"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
												}}
											/>
											{Array.isArray(selectedFile) &&
												selectedFile.length > 1 && (
													<p className="text-xs text-text-gray mt-0.5">
														+
														{selectedFile.length -
															1}{" "}
														more images
													</p>
												)}
										</div>
									</div>
								),
							)}
						</div>
					</div>
				)}

				{/* Similar posts */}
				<div className="mt-8">
					<SimilarPosts postId={post._id} />
				</div>
			</div>
		</div>
		</div>
	);
}

export default PostDetails;
