
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getSimilarPosts, trackPostView } from "../../actions/posts";
import moment from "moment";
import PropTypes from "prop-types";

// Haversine formula to calculate distance between two lat/lng points in km
function getDistanceKm(lat1, lng1, lat2, lng2) {
	if (
		typeof lat1 !== "number" ||
		typeof lng1 !== "number" ||
		typeof lat2 !== "number" ||
		typeof lng2 !== "number"
	)
		return null;
	const R = 6371; // Radius of the earth in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLng / 2) * Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}


const SimilarPosts = ({ postId }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { similarPosts } = useSelector((state) => state.posts);
	const { post } = useSelector((state) => state.posts); // get current post details
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
				{similarPosts.map((simPost) => {
					// Use distanceKm from API if available
					let nearbyText = null;
					if (typeof simPost.distanceKm === "number") {
						nearbyText = `Nearby: ${simPost.distanceKm.toFixed(2)} km`;
					}
					return (
						<li
							key={simPost._id}
							onClick={() => handleViewPost(simPost._id)}
							className={`
								flex items-start gap-3 py-3 px-3 rounded-lg cursor-pointer
								bg-light-green/5 border border-light-green/30 mb-2
								hover:bg-light-green/10 hover:translate-x-1
								transition-all duration-200
							`}
						>
							{/* Avatar */}
							<div className="shrink-0 w-10 h-10 rounded-full bg-dark-green text-off-white flex items-center justify-center font-bold text-sm overflow-hidden">
								{Array.isArray(simPost.selectedFile) &&
								simPost.selectedFile.length > 0 ? (
									<img
										src={simPost.selectedFile[0]}
										alt={simPost.title}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.target.onerror = null;
											e.target.style.display = "none";
										}}
									/>
								) : simPost.selectedFile ? (
									<img
										src={simPost.selectedFile}
										alt={simPost.title}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.target.onerror = null;
											e.target.style.display = "none";
										}}
									/>
								) : (
									simPost.title.charAt(0).toUpperCase()
								)}
							</div>

							{/* Content */}
							<div className="flex-1 min-w-0">
								<p className="font-bold text-text-dark text-sm leading-snug mb-0.5">
									{simPost.title}
								</p>

								<p className="text-text-gray text-xs mb-1 line-clamp-2">
									{simPost.message.substring(0, 80)}...
								</p>

								<p className="text-text-gray text-xs italic mb-1">
									By {simPost.name} &bull; {moment(simPost.createdAt).fromNow()}
								</p>

								{/* Tags */}
								<div className="flex flex-wrap gap-1 mt-1">
									{simPost.tags.slice(0, 3).map((tag, tagIndex) => (
										<span
											key={tagIndex}
											className="bg-light-green text-text-dark text-[0.7rem] font-medium px-2 py-0.5 rounded-full border border-dark-green/20"
										>
											{tag}
										</span>
									))}
								</div>

								{/* Similarity score and Nearby tag */}
								<p className="text-[#1976d2] font-bold text-xs mt-1.5">
									Similarity: {(simPost.similarityScore * 100).toFixed(0)}%
									{nearbyText && (
										<span className="ml-3 bg-green-200 text-green-900 px-2 py-0.5 rounded-full text-xs font-semibold">
											{nearbyText}
										</span>
									)}
								</p>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

SimilarPosts.propTypes = {
	postId: PropTypes.string.isRequired,
};

export default SimilarPosts;
