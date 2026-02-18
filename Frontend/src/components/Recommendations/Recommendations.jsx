import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
	MdThumbUp,
	MdComment,
	MdVisibility,
	MdClose,
	MdZoomIn,
	MdArrowBack,
	MdArrowForward,
} from "react-icons/md";
import {
	getRecommendations,
	trackPostView,
	likePost,
} from "../../actions/posts";
import moment from "moment";

const Recommendations = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { recommendations, isLoading } = useSelector((state) => state.posts);
	const [user] = useState(
		JSON.parse(localStorage.getItem("traveller-profile")),
	);
	const [fullScreenImage, setFullScreenImage] = useState(null);
	const [imageDialogOpen, setImageDialogOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	useEffect(() => {
		if (user?.token) {
			dispatch(getRecommendations(10));
		}
	}, [dispatch, user]);

	const handleViewPost = (postId) => {
		if (user?.token) {
			dispatch(trackPostView(postId));
		}
		history.push(`/posts/${postId}`);
	};

	const handleLike = (postId) => {
		if (user?.token) {
			dispatch(likePost(postId));
		}
	};

	const handleImageClick = (imageData, postTitle) => {
		if (Array.isArray(imageData)) {
			setFullScreenImage({ urls: imageData, title: postTitle });
		} else {
			setFullScreenImage({ urls: [imageData], title: postTitle });
		}
		setCurrentImageIndex(0);
		setImageDialogOpen(true);
	};

	const handleCloseImageDialog = () => {
		setImageDialogOpen(false);
		setFullScreenImage(null);
		setCurrentImageIndex(0);
	};

	if (!user?.token) {
		return (
			<div className="p-5 text-center bg-off-white border border-dark-green rounded-[15px] shadow-card">
				<p className="text-lg font-semibold text-text-dark">
					Please sign in to see personalized recommendations
				</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="p-5 text-center bg-off-white border border-dark-green rounded-[15px] shadow-card">
				<p className="text-lg font-semibold text-text-dark">
					Loading recommendations...
				</p>
			</div>
		);
	}

	if (!recommendations || recommendations.length === 0) {
		return (
			<div className="p-5 text-center bg-off-white border-2 border-dashed border-light-green rounded-[15px]">
				<p className="text-lg font-semibold text-dark-green mb-2">
					No recommendations available
				</p>
				<p className="text-sm text-text-dark">
					Start interacting with posts to get personalized
					recommendations!
				</p>
			</div>
		);
	}

	return (
		<div className="mt-14 sm:mt-16 px-4">
			<h1 className="text-3xl font-bold text-center text-text-dark mb-6">
				Recommended for You
			</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{recommendations.map((post) => (
					<div
						key={post._id}
						className="flex flex-col bg-off-white border border-dark-green rounded-[15px] shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 overflow-hidden"
					>
						{/* Image */}
						{post.selectedFile && post.selectedFile.length > 0 && (
							<div
								className="relative cursor-pointer group"
								onClick={() =>
									handleImageClick(
										Array.isArray(post.selectedFile)
											? post.selectedFile[0]
											: post.selectedFile,
										post.title,
									)
								}
							>
								<img
									src={
										Array.isArray(post.selectedFile)
											? post.selectedFile[0]
											: post.selectedFile
									}
									alt={post.title}
									className="w-full h-[200px] object-cover"
								/>
								{/* Zoom overlay */}
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
									<MdZoomIn className="text-white text-5xl" />
								</div>
								{/* Multi-image badge */}
								{Array.isArray(post.selectedFile) &&
									post.selectedFile.length > 1 && (
										<div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 backdrop-blur-sm shadow">
											+{post.selectedFile.length - 1} more
										</div>
									)}
							</div>
						)}

						{/* Content */}
						<div className="flex-1 p-4">
							<h3 className="text-dark-green font-bold text-base mb-1 leading-snug">
								{post.title}
							</h3>
							<p className="text-text-dark text-sm mb-2 line-clamp-3">
								{post.message.substring(0, 100)}...
							</p>
							<p className="text-text-gray text-xs mb-3">
								By {post.name} &bull;{" "}
								{moment(post.createdAt).fromNow()}
							</p>

							{/* Tags */}
							<div className="flex flex-wrap gap-1 mb-3">
								{post.tags.map((tag, index) => (
									<span
										key={index}
										className="border border-dark-green text-dark-green text-[0.7rem] px-2 py-0.5 rounded-full"
									>
										{tag}
									</span>
								))}
							</div>

							{/* Match score */}
							<p className="text-[#1976d2] font-bold text-xs">
								Match Score:{" "}
								{(post.recommendationScore * 100).toFixed(0)}%
							</p>
						</div>

						{/* Actions */}
						<div className="flex items-center justify-between px-4 py-3 bg-light-green/10 border-t border-dark-green/10">
							<div className="flex items-center gap-1">
								<button
									onClick={() => handleLike(post._id)}
									className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded transition-colors ${
										post.likes?.includes(user?.result?._id)
											? "text-accent-green bg-accent-green/10"
											: "text-text-dark hover:bg-light-green/20"
									}`}
								>
									<MdThumbUp size={16} />
									{post.likes?.length || 0}
								</button>
								<button className="flex items-center gap-1 text-sm font-medium text-text-dark px-2 py-1 rounded hover:bg-light-green/20 transition-colors">
									<MdComment size={16} />
									{post.comments?.length || 0}
								</button>
							</div>
							<button
								onClick={() => handleViewPost(post._id)}
								className="flex items-center gap-1.5 bg-light-green hover:bg-light-green-hover text-text-dark font-bold text-sm px-3 py-1.5 rounded-lg transition-colors"
							>
								<MdVisibility size={16} />
								View
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Full-screen image dialog */}
			{imageDialogOpen && (
				<div
					className="fixed inset-0 z-[1400] bg-black/90 flex items-center justify-center"
					onClick={handleCloseImageDialog}
				>
					<div
						className="relative flex flex-col items-center max-w-full max-h-full p-4"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close button */}
						<button
							onClick={handleCloseImageDialog}
							className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
						>
							<MdClose size={24} />
						</button>

						{fullScreenImage && (
							<div className="flex flex-col items-center">
								<div className="relative flex items-center">
									{fullScreenImage.urls.length > 1 && (
										<button
											onClick={() =>
												setCurrentImageIndex((prev) =>
													prev > 0
														? prev - 1
														: fullScreenImage.urls
																.length - 1,
												)
											}
											className="absolute left-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
										>
											<MdArrowBack size={24} />
										</button>
									)}

									<img
										src={
											fullScreenImage.urls[
												currentImageIndex
											]
										}
										alt={fullScreenImage.title}
										className="max-w-full max-h-[80vh] object-contain rounded-lg"
									/>

									{fullScreenImage.urls.length > 1 && (
										<button
											onClick={() =>
												setCurrentImageIndex((prev) =>
													prev <
													fullScreenImage.urls
														.length -
														1
														? prev + 1
														: 0,
												)
											}
											className="absolute right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
										>
											<MdArrowForward size={24} />
										</button>
									)}
								</div>

								<p className="text-white text-lg font-semibold mt-4 text-center px-4">
									{fullScreenImage.title}
									{fullScreenImage.urls.length > 1 && (
										<span className="text-sm ml-2 text-white/70">
											({currentImageIndex + 1} of{" "}
											{fullScreenImage.urls.length})
										</span>
									)}
								</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Recommendations;
