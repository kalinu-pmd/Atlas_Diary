import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useParams, useHistory } from "react-router-dom";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";
import LinesEllipsis from "react-lines-ellipsis";

import {
	getPostById,
	getPostsBySearch,
	trackPostView,
} from "../../actions/posts";
import CommentSection from "./CommentSection";
import SimilarPosts from "../SimilarPosts/SimilarPosts";

function PostDetails() {
	const { post, posts, isLoading } = useSelector((state) => state.posts);
	const dispatch = useDispatch();
	const history = useHistory();
	const { id } = useParams();

	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	useEffect(() => {
		dispatch(getPostById(id));
		dispatch(trackPostView(id));
	}, [dispatch, id]);

	useEffect(() => {
		if (post) {
			dispatch(
				getPostsBySearch({
					search: "none",
					tags: post?.tags?.join(","),
				}),
			);
		}
	}, [dispatch, post]);

	const recommendedPosts = posts.filter(
		(recommendedPost) => recommendedPost?._id !== post?._id,
	);

	const openPost = (_id) => {
		history.push(`/posts/${_id}`);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (isLoading) {
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
						<h2 className="text-3xl sm:text-2xl font-bold text-text-dark mb-2">
							{post.title}
						</h2>

						{/* Tags */}
						<div className="flex flex-wrap gap-1.5 mb-3">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="bg-light-green text-dark-green text-xs font-semibold px-2.5 py-0.5 rounded-full"
								>
									#{tag}
								</span>
							))}
						</div>

						{/* Message */}
						<p className="text-text-dark text-base whitespace-pre-line mb-3">
							{post.message}
						</p>

						<p className="text-sm text-text-gray mb-1">
							<strong>Created by:</strong> {post.name}
						</p>
						<p className="text-xs text-text-gray mb-4">
							{moment(post.createdAt).fromNow()}
						</p>
					</div>

					{/* Images section - centered */}
					{renderImages()}

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
