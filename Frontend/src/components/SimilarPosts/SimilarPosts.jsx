import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getSimilarPosts, trackPostView } from "../../actions/posts";
import moment from "moment";
import PropTypes from "prop-types";

const SimilarPosts = ({ postId }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { similarPosts } = useSelector((state) => state.posts);
	const [user] = useState(
		JSON.parse(localStorage.getItem("traveller-profile")),
	);

	useEffect(() => {
		if (postId) {
			dispatch(getSimilarPosts(postId, 5));
		}
	}, [dispatch, postId]);

	const handleViewPost = (similarPostId) => {
		if (user?.token) {
			dispatch(trackPostView(similarPostId));
		}
		history.push(`/posts/${similarPostId}`);
	};

	if (!similarPosts || similarPosts.length === 0) {
		return null;
	}

	return (
		<div className="bg-off-white border border-dark-green rounded-[15px] shadow-card p-5 mt-5">
			<h3 className="text-dark-green font-bold text-lg mb-4">
				Similar Posts
			</h3>

			<ul className="flex flex-col gap-0">
				{similarPosts.map((post, index) => (
					<li
						key={post._id}
						onClick={() => handleViewPost(post._id)}
						className={`
							flex items-start gap-3 py-3 px-3 rounded-lg cursor-pointer
							bg-light-green/5 border border-light-green/30 mb-2
							hover:bg-light-green/10 hover:translate-x-1
							transition-all duration-200
						`}
					>
						{/* Avatar */}
						<div className="shrink-0 w-10 h-10 rounded-full bg-dark-green text-off-white flex items-center justify-center font-bold text-sm overflow-hidden">
							{Array.isArray(post.selectedFile) &&
							post.selectedFile.length > 0 ? (
								<img
									src={post.selectedFile[0]}
									alt={post.title}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.target.onerror = null;
										e.target.style.display = "none";
									}}
								/>
							) : post.selectedFile ? (
								<img
									src={post.selectedFile}
									alt={post.title}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.target.onerror = null;
										e.target.style.display = "none";
									}}
								/>
							) : (
								post.title.charAt(0).toUpperCase()
							)}
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<p className="font-bold text-text-dark text-sm leading-snug mb-0.5">
								{post.title}
							</p>

							<p className="text-text-gray text-xs mb-1 line-clamp-2">
								{post.message.substring(0, 80)}...
							</p>

							<p className="text-text-gray text-xs italic mb-1">
								By {post.name} &bull;{" "}
								{moment(post.createdAt).fromNow()}
							</p>

							{/* Tags */}
							<div className="flex flex-wrap gap-1 mt-1">
								{post.tags.slice(0, 3).map((tag, tagIndex) => (
									<span
										key={tagIndex}
										className="bg-light-green text-text-dark text-[0.7rem] font-medium px-2 py-0.5 rounded-full border border-dark-green/20"
									>
										{tag}
									</span>
								))}
							</div>

							{/* Similarity score */}
							<p className="text-[#1976d2] font-bold text-xs mt-1.5">
								Similarity:{" "}
								{(post.similarityScore * 100).toFixed(0)}%
							</p>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

SimilarPosts.propTypes = {
	postId: PropTypes.string.isRequired,
};

export default SimilarPosts;
