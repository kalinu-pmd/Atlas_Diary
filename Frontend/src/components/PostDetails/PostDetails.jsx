import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useParams, useHistory } from "react-router-dom";
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

	if (!post) return null;

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
							className="w-full rounded-[15px] object-cover border-2 border-dark-green shadow-card hover:scale-[1.02] transition-transform duration-200"
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
				loading="lazy"
				className="w-full rounded-[15px] object-cover border-2 border-dark-green shadow-card hover:scale-[1.02] transition-transform duration-200"
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
		<div className="mt-8 sm:mt-7">
			<div className="bg-off-white rounded-[18px] shadow-lg p-6">
				{/* Main grid */}
				<div className="flex flex-col md:flex-row gap-6 md:gap-8 border border-light-green rounded-[20px] p-4 shadow-form">
					{/* Content */}
					<div className="flex-1 bg-off-white rounded-[20px] p-2">
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

						<hr className="border-text-gray/20 my-5" />
						<CommentSection post={post} />
						<hr className="border-text-gray/20 my-5" />
					</div>

					{/* Images */}
					<div className="w-full md:w-5/12">{renderImages()}</div>
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
	);
}

export default PostDetails;
