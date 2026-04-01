
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
		<div className="bg-gradient-to-br from-off-white via-off-white to-light-green/5 border-2 border-light-green rounded-[20px] shadow-lg p-6 mt-5">
			{/* Header section with gradient accent */}
			<div className="mb-6 pb-4 border-b-2 border-light-green/40">
				<h3 className="text-dark-green font-extrabold text-2xl mb-1">
					✨ You might also like
				</h3>
				<p className="text-text-gray text-sm">
					Discovering places based on tags and location similarity
				</p>
			</div>

			{/* Grid layout for better visual management */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{similarPosts.map((simPost, idx) => {
					// Calculate distance if both posts have location
					let nearbyText = null;
					let isNearby = false;
					if (
						post &&
						post.location &&
						post.location.coordinates &&
						simPost.location &&
						simPost.location.coordinates &&
						Array.isArray(post.location.coordinates) &&
						Array.isArray(simPost.location.coordinates)
					) {
						const [lng1, lat1] = post.location.coordinates;
						const [lng2, lat2] = simPost.location.coordinates;
						const dist = getDistanceKm(lat1, lng1, lat2, lng2);
						if (dist !== null && dist < 50) {
							isNearby = true;
							nearbyText = `Nearby: ${(dist).toFixed(2)} km`;
						}
					}

					return (
						<div
							key={simPost._id}
							onClick={() => handleViewPost(simPost._id)}
							className={`group bg-white border-2 rounded-[15px] p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
								isNearby
									? "border-green-500/70 bg-gradient-to-br from-green-50/70 to-white shadow-[0_0_0_2px_rgba(34,197,94,0.18)]"
									: "border-light-green/50 hover:border-dark-green"
							}`}
							style={{
								animation: `slideIn 0.5s ease-out ${idx * 0.1}s backwards`,
							}}
						>
							{/* Thumbnail Image */}
							<div className="relative mb-3 overflow-hidden rounded-[10px] bg-gray-200 h-40">
								<img
									src={
										Array.isArray(simPost.selectedFile) &&
										simPost.selectedFile.length > 0
											? simPost.selectedFile[0]
											: simPost.selectedFile
									}
									alt={simPost.title}
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
									onError={(e) => {
										e.target.onerror = null;
										e.target.src =
											"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
									}}
								/>
								{/* Similarity badge overlay */}
								<div className="absolute top-2 right-2 bg-dark-green text-light-green text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
									{(simPost.similarityScore * 100).toFixed(0)}% Match
								</div>
								{isNearby && (
									<div className="absolute top-2 left-2 bg-green-600 text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full shadow-sm">
										Nearby
									</div>
								)}
							</div>

							{/* Content Section */}
							<div>
								{/* Author & Time */}
								<p className="text-[0.75rem] text-text-gray font-medium mb-1.5 flex items-center gap-1.5">
									<span className="inline-block w-5 h-5 rounded-full bg-light-green/40 text-text-dark text-[0.6rem] flex items-center justify-center font-bold">
										{simPost.name?.charAt(0).toUpperCase()}
									</span>
									{simPost.name} • {moment(simPost.createdAt).fromNow()}
								</p>

								{/* Title */}
								<h4 className="font-bold text-text-dark text-sm leading-snug mb-2 line-clamp-2 group-hover:text-dark-green transition-colors">
									{simPost.title}
								</h4>

								{/* Description */}
								<p className="text-text-gray text-xs mb-2.5 line-clamp-2 leading-relaxed">
									{simPost.message.substring(0, 85)}...
								</p>

								{/* Tags */}
								<div className="flex flex-wrap gap-1.5 mb-2.5">
									{simPost.tags.slice(0, 2).map((tag, tagIndex) => (
										<span
											key={tagIndex}
											className="bg-light-green/80 text-text-dark text-[0.65rem] font-semibold px-2 py-0.5 rounded-full border border-dark-green/30"
										>
											#{tag}
										</span>
									))}
									{simPost.tags.length > 2 && (
										<span className="text-[0.65rem] text-text-gray font-medium px-2 py-0.5 italic">
											+{simPost.tags.length - 2} more
										</span>
									)}
								</div>

								{/* Location/Distance & CTA */}
								<div className="flex items-center justify-between pt-2 border-t border-light-green/30">
									<div className="flex-1">
										{nearbyText ? (
											<p className="text-green-700 font-bold text-xs flex items-center gap-1">
												📍 {nearbyText}
											</p>
										) : (
											<p className="text-text-gray text-xs italic">
												Similar location
											</p>
										)}
									</div>
									<button
										className="text-dark-green hover:text-light-green font-bold text-xs bg-light-green/10 hover:bg-light-green/30 px-2.5 py-1 rounded-lg transition-all group-hover:translate-x-0.5"
										onClick={(e) => {
											e.stopPropagation();
											handleViewPost(simPost._id);
										}}
									>
										View →
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Add animation keyframes */}
			<style>{`
				@keyframes slideIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</div>
	);
};

SimilarPosts.propTypes = {
	postId: PropTypes.string.isRequired,
};

export default SimilarPosts;
