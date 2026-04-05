import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
	MdThumbUp,
	MdComment,
	MdVisibility,
} from "react-icons/md";
import {
	getRecommendations,
	trackPostView,
	likePost,
} from "../../actions/posts";
import { END_LOADING, FETCH_RECOMMENDATIONS } from "../../constants/actionTypes";
import {
	areSameCountry,
	extractCountryFromLocationName,
	getLocationInfoFromCoordinates,
} from "../../utils/locationCountry";
import moment from "moment";

const getStoredAuthData = () => {
	try {
		const raw = localStorage.getItem("traveller-profile");
		return raw ? JSON.parse(raw) : null;
	} catch (_error) {
		return null;
	}
};

const getRecommendationsCacheKey = (userId, token) => {
	const tokenSuffix = String(token || "").slice(-24) || "no-token";
	return `recommendations-cache-v1:${String(userId || "unknown")}:${tokenSuffix}`;
};

const getRecommendationsCache = (userId, token) => {
	try {
		const raw = localStorage.getItem(getRecommendationsCacheKey(userId, token));
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed?.recommendations)) return null;
		return parsed;
	} catch (_error) {
		return null;
	}
};

const setRecommendationsCache = (userId, token, payload) => {
	try {
		localStorage.setItem(
			getRecommendationsCacheKey(userId, token),
			JSON.stringify(payload),
		);
	} catch (_error) {
		// Ignore cache write failures.
	}
};

const clearRecommendationsCache = (userId, token) => {
	try {
		localStorage.removeItem(getRecommendationsCacheKey(userId, token));
	} catch (_error) {
		// Ignore cache clear failures.
	}
};

const getCompactLocationLabel = (locationName, country) => {
	const cleaned = String(locationName || "").trim();
	if (!cleaned) return "Unknown location";

	const parts = cleaned
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	if (parts.length <= 3) {
		return cleaned;
	}

	let compact = parts.slice(0, 3).join(", ");
	if (country && !compact.toLowerCase().includes(country.toLowerCase())) {
		compact = `${compact}, ${country}`;
	}

	return compact;
};

const Recommendations = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { recommendations } = useSelector((state) => state.posts);
	const [user] = useState(getStoredAuthData);
	const userId = user?.result?._id || user?.result?.id;
	const cachedRecommendationsSnapshot = useMemo(
		() => getRecommendationsCache(userId, user?.token),
		[userId, user?.token],
	);
	const [userLocation, setUserLocation] = useState(null);
	const [hasAttemptedFetch, setHasAttemptedFetch] = useState(() =>
		Boolean(cachedRecommendationsSnapshot?.fetched),
	);
	const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false);
	const [isManualRefreshing, setIsManualRefreshing] = useState(false);
	const [currentCountry, setCurrentCountry] = useState(
		cachedRecommendationsSnapshot?.currentCountry || "",
	);
	const [currentLocationName, setCurrentLocationName] = useState(
		cachedRecommendationsSnapshot?.currentLocationName || "",
	);
	const [postCountries, setPostCountries] = useState({});
	const displayedRecommendations =
		Array.isArray(recommendations) && recommendations.length > 0
			? recommendations
			: Array.isArray(cachedRecommendationsSnapshot?.recommendations)
				? cachedRecommendationsSnapshot.recommendations
				: [];

	const requestLocation = async () => {
		if (!hasAttemptedFetch) {
			setHasAttemptedFetch(true);
		}
		setIsFetchingRecommendations(true);
		setCurrentCountry("");
		setCurrentLocationName("");

		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setCurrentCountry("");
			setCurrentLocationName("");
			// Fallback: fetch recommendations without location
			try {
				const recommendationsPayload = await dispatch(getRecommendations(10));
				if (Array.isArray(recommendationsPayload)) {
					setRecommendationsCache(userId, user?.token, {
						fetched: true,
						recommendations: recommendationsPayload,
						userLocation: null,
						currentCountry: "",
						currentLocationName: "",
						updatedAt: Date.now(),
					});
				}
			} finally {
				setIsFetchingRecommendations(false);
			}
			return;
		}

		try {
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
				});
			});

			const { latitude, longitude } = position.coords;
			const location = { lat: latitude, lng: longitude };
			setUserLocation(location);
			let resolvedCountry = "";
			let resolvedLocationName = "";

			try {
				const locationInfo = await getLocationInfoFromCoordinates(location);
				resolvedCountry = locationInfo.country || "";
				resolvedLocationName = locationInfo.label || "";
				setCurrentCountry(resolvedCountry);
				setCurrentLocationName(resolvedLocationName);
			} catch (countryError) {
				console.error("Country lookup error:", countryError);
				setCurrentCountry("");
				setCurrentLocationName("");
			}

			const recommendationsPayload = await dispatch(
				getRecommendations(10, {
					location,
					radius: 50000, // 50km radius in meters
				}),
			);

			if (Array.isArray(recommendationsPayload)) {
				setRecommendationsCache(userId, user?.token, {
					fetched: true,
					recommendations: recommendationsPayload,
					userLocation: location,
					currentCountry: resolvedCountry,
					currentLocationName: resolvedLocationName,
					updatedAt: Date.now(),
				});
			}
		} catch (error) {
			console.error("Geolocation error:", error);
			setCurrentCountry("");
			setCurrentLocationName("");
			// If user denies location or it fails, fall back to non-location-based
			const recommendationsPayload = await dispatch(getRecommendations(10));
			if (Array.isArray(recommendationsPayload)) {
				setRecommendationsCache(userId, user?.token, {
					fetched: true,
					recommendations: recommendationsPayload,
					userLocation: null,
					currentCountry: "",
					currentLocationName: "",
					updatedAt: Date.now(),
				});
			}
		} finally {
			setIsFetchingRecommendations(false);
		}
	};

	const handleManualRefresh = async () => {
		if (!user?.token) return;
		setIsManualRefreshing(true);
		clearRecommendationsCache(userId, user?.token);
		await requestLocation();
		setIsManualRefreshing(false);
	};

	useEffect(() => {
		if (!user?.token) return;

		const cached = getRecommendationsCache(userId, user?.token);
		if (cached?.fetched && Array.isArray(cached.recommendations)) {
			dispatch({
				type: FETCH_RECOMMENDATIONS,
				payload: cached.recommendations,
			});
			dispatch({ type: END_LOADING });
			setUserLocation(cached.userLocation || null);
			setCurrentCountry(cached.currentCountry || "");
			setCurrentLocationName(cached.currentLocationName || "");
			setHasAttemptedFetch(true);
			setIsFetchingRecommendations(false);
			return;
		}

		requestLocation();
	}, [user, userId]);

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

	const handleCardKeyDown = (event, postId) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleViewPost(postId);
		}
	};

	useEffect(() => {
		let isCancelled = false;

		const resolveCountriesFromCoordinates = async () => {
			if (!Array.isArray(displayedRecommendations) || displayedRecommendations.length === 0) {
				return;
			}

			const updates = {};

			for (const post of displayedRecommendations) {
				const postId = String(post?._id || "");
				if (!postId || postCountries[postId]) {
					continue;
				}

				const fromLocationText = extractCountryFromLocationName(
					post?.locationName,
				);
				if (fromLocationText) {
					updates[postId] = fromLocationText;
					continue;
				}

				const coordinates = post?.location?.coordinates;
				if (!Array.isArray(coordinates) || coordinates.length < 2) {
					continue;
				}

				const [lng, lat] = coordinates;
				if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
					continue;
				}

				try {
					const locationInfo = await getLocationInfoFromCoordinates({
						lat: Number(lat),
						lng: Number(lng),
					});
					if (locationInfo?.country) {
						updates[postId] = locationInfo.country;
					}
				} catch (_error) {
					// Ignore reverse-lookup failures per card.
				}
			}

			if (!isCancelled && Object.keys(updates).length > 0) {
				setPostCountries((prev) => ({ ...prev, ...updates }));
			}
		};

		resolveCountriesFromCoordinates();

		return () => {
			isCancelled = true;
		};
	}, [displayedRecommendations, postCountries]);

	if (!user?.token) {
		return (
			<div className="p-5 text-center bg-off-white border border-dark-green rounded-[15px] shadow-card">
				<p className="text-lg font-semibold text-text-dark">
					Please sign in to see personalized recommendations
				</p>
			</div>
		);
	}

	if ((isFetchingRecommendations || !hasAttemptedFetch) && displayedRecommendations.length === 0) {
		return (
			<div className="relative overflow-hidden w-full min-h-[calc(100vh-4rem)] border-2 border-light-green bg-gradient-to-br from-off-white via-[#f7fbf2] to-light-green/20 flex items-center justify-center px-4">
				<style>{`
					@keyframes recommendationsShimmer {
						0% { transform: translateX(-120%); }
						100% { transform: translateX(120%); }
					}
					@keyframes recommendationsPulse {
						0%, 100% { opacity: 0.55; transform: translateY(0); }
						50% { opacity: 1; transform: translateY(-3px); }
					}
				`}</style>

				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					<div
						className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
						style={{ animation: "recommendationsShimmer 2.2s linear infinite" }}
					/>
				</div>

				<div className="relative z-[1] flex flex-col items-center text-center w-full max-w-4xl">
					<div className="inline-flex items-end gap-2 mb-4" aria-hidden>
						<span className="h-2.5 w-2.5 rounded-full bg-dark-green" style={{ animation: "recommendationsPulse 1.2s ease-in-out infinite" }} />
						<span className="h-3.5 w-3.5 rounded-full bg-light-green" style={{ animation: "recommendationsPulse 1.2s ease-in-out 0.2s infinite" }} />
						<span className="h-2.5 w-2.5 rounded-full bg-dark-green" style={{ animation: "recommendationsPulse 1.2s ease-in-out 0.4s infinite" }} />
					</div>

					<p className="text-xl sm:text-2xl font-black text-dark-green tracking-tight">
						Finding adventures you will love
					</p>
					<p className="text-sm text-text-gray mt-1 mb-5">
						Loading recommendations based on your activity and nearby places.
					</p>

					<div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-3" aria-hidden>
						{[1, 2, 3].map((item) => (
							<div
								key={item}
								className="rounded-xl border border-dark-green/10 bg-white/65 p-3"
							>
								<div className="h-20 rounded-lg bg-dark-green/10 mb-3" />
								<div className="h-3 rounded bg-dark-green/20 mb-2" />
								<div className="h-3 w-2/3 rounded bg-dark-green/15" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (hasAttemptedFetch && displayedRecommendations.length === 0) {
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

	const nearbyThresholdMeters = 50000;
	const sortedRecommendations = [...displayedRecommendations].sort((a, b) => {
		const aNearby =
			a?.isNearby ||
			(typeof a?.distanceMeters === "number" &&
				a.distanceMeters <= nearbyThresholdMeters);
		const bNearby =
			b?.isNearby ||
			(typeof b?.distanceMeters === "number" &&
				b.distanceMeters <= nearbyThresholdMeters);

		if (aNearby !== bNearby) return aNearby ? -1 : 1;

		const aDistance =
			typeof a?.distanceMeters === "number"
				? a.distanceMeters
				: Number.MAX_SAFE_INTEGER;
		const bDistance =
			typeof b?.distanceMeters === "number"
				? b.distanceMeters
				: Number.MAX_SAFE_INTEGER;
		if (aDistance !== bDistance) return aDistance - bDistance;

		return (b?.recommendationScore || 0) - (a?.recommendationScore || 0);
	});

	return (
		<div className="mt-8 sm:mt-10 mb-8 sm:mb-10 px-4">
			<div className="mx-auto mb-8 max-w-4xl overflow-hidden rounded-3xl border border-dark-green/10 bg-gradient-to-r from-off-white via-light-green/10 to-off-white shadow-[0_10px_30px_rgba(12,52,44,0.08)]">
				<div className="h-1 bg-gradient-to-r from-dark-green via-light-green to-amber-400" />
				<div className="px-5 py-5 sm:px-8 sm:py-6 text-center">
					<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-dark mb-2">
						Recomended Posts
					</h1>
					<p className="text-sm sm:text-[15px] font-medium text-text-dark leading-relaxed max-w-3xl mx-auto">
						{userLocation
							? "A blend of your activity, interests, and nearby places."
							: "A blend of your activity and interests. Allow location in your browser settings to improve nearby recommendations."}
					</p>
					<div className="mt-4">
						<button
							type="button"
							onClick={handleManualRefresh}
							disabled={isManualRefreshing || isFetchingRecommendations}
							className="inline-flex items-center rounded-lg border border-dark-green/20 bg-white px-3 py-1.5 text-xs font-bold text-dark-green shadow-sm transition-colors hover:bg-light-green/20 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isManualRefreshing || isFetchingRecommendations
								? "Refreshing..."
								: "Refresh recommendations"}
						</button>
					</div>
					{currentCountry && (
						<div className="mt-3 inline-flex items-center gap-2 rounded-full border border-dark-green/10 bg-white/70 px-3 py-1.5 shadow-sm">
							<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
								Current location
							</span>
							<span className="inline-flex items-center rounded-full bg-light-green px-2.5 py-1 text-xs font-bold text-dark-green shadow-sm border border-dark-green/10">
								{currentLocationName || currentCountry}
							</span>
						</div>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 sm:mt-8">
				{sortedRecommendations.map((post) => {
					const postMessage =
						typeof post?.message === "string" ? post.message : "";
					const postTags = Array.isArray(post?.tags) ? post.tags : [];
					const selectedFiles = Array.isArray(post?.selectedFile)
						? post.selectedFile
						: post?.selectedFile
							? [post.selectedFile]
							: [];
					const isNearby =
						post?.isNearby ||
						(typeof post?.distanceMeters === "number" &&
							post.distanceMeters <= nearbyThresholdMeters);
					const postCountry =
						postCountries[String(post._id)] ||
						extractCountryFromLocationName(post.locationName);
					const compactLocation = getCompactLocationLabel(
						post.locationName,
						postCountry,
					);
					const isOutsideCurrentCountry =
						Boolean(currentCountry && postCountry) &&
						!areSameCountry(currentCountry, postCountry);
					const distanceKm =
						typeof post?.distanceMeters === "number"
							? (post.distanceMeters / 1000).toFixed(1)
							: null;

					return (
					<div
						key={post._id}
						onClick={() => handleViewPost(post._id)}
						onKeyDown={(event) => handleCardKeyDown(event, post._id)}
						tabIndex={0}
						role="button"
						className={`flex flex-col bg-off-white border rounded-[15px] shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 overflow-hidden ${
							isNearby
								? "border-light-green ring-2 ring-light-green/35"
								: isOutsideCurrentCountry
									? "border-amber-500 ring-2 ring-amber-300/60 bg-amber-50/70"
									: "border-dark-green"
						}`}
					>
						{/* Image */}
						{selectedFiles.length > 0 && (
							<div className="relative">
								<img
									src={selectedFiles[0]}
									alt={post.title}
									className="w-full h-[200px] object-cover"
								/>
								<div className="absolute top-2 right-2 z-10 flex items-center justify-end gap-1">
									{/* Multi-image badge */}
									{selectedFiles.length > 1 && (
										<div className="bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow">
											+{selectedFiles.length - 1} more
										</div>
									)}
								</div>
								{isNearby && (
									<div className="absolute top-2 left-2 bg-light-green text-dark-green text-xs font-black px-2.5 py-1 rounded-full z-10 shadow">
										Nearby
									</div>
								)}
								{isOutsideCurrentCountry && postCountry && (
									<div
										className={`absolute left-2 ${isNearby ? "top-10" : "top-2"} bg-orange text-off-white text-xs font-black px-2.5 py-1 rounded-full z-10 shadow`}
									>
										{postCountry}
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
								{postMessage.substring(0, 100)}...
							</p>
							<p className="text-text-gray text-xs mb-3">
								By {post.name} &bull;{" "}
								{moment(post.createdAt).fromNow()}
							</p>
							<p
								title={post.locationName || compactLocation}
								className="text-text-dark text-xs mb-3 font-semibold"
							>
								{compactLocation}
							</p>
							{postCountry && (
								<p className="text-dark-green text-[11px] font-bold mb-3">
									Country: {postCountry}
								</p>
							)}

							{/* Tags */}
							<div className="flex flex-wrap gap-1 mb-3">
								{postTags.map((tag, index) => (
									<span
										key={index}
										className="border border-dark-green text-dark-green text-[0.7rem] px-2 py-0.5 rounded-full"
									>
										{tag}
									</span>
								))}
							</div>

							{/* Match score explanation */}
							{typeof post.recommendationScore === "number" ? (
								<p className="text-[#1976d2] font-bold text-xs">
									Match score (activity + place proximity): {" "}
									{(post.recommendationScore * 100).toFixed(0)}%
								</p>
							) : (
								<p className="text-[#1976d2] font-bold text-xs">
									Recommended based on your activity and other signals
								</p>
							)}
							{isNearby && distanceKm && (
								<p className="text-dark-green font-semibold text-xs mt-1">
									{distanceKm} km far from your current location
								</p>
							)}
						</div>

						{/* Actions */}
						<div className="flex items-center justify-between px-4 py-3 bg-light-green/10 border-t border-dark-green/10">
							<div className="flex items-center gap-1">
								<button
									onClick={(event) => {
										event.stopPropagation();
										handleLike(post._id);
									}}
									className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded transition-colors ${
										post.likes?.includes(user?.result?._id)
											? "text-accent-green bg-accent-green/10"
											: "text-text-dark hover:bg-light-green/20"
									}`}
								>
									<MdThumbUp size={16} />
									{post.likes?.length || 0}
								</button>
								<button
									onClick={(event) => event.stopPropagation()}
									className="flex items-center gap-1 text-sm font-medium text-text-dark px-2 py-1 rounded hover:bg-light-green/20 transition-colors"
								>
									<MdComment size={16} />
									{post.comments?.length || 0}
								</button>
							</div>
							<button
								onClick={(event) => {
									event.stopPropagation();
									handleViewPost(post._id);
								}}
								className="flex items-center gap-1.5 bg-light-green hover:bg-light-green-hover text-text-dark font-bold text-sm px-3 py-1.5 rounded-lg transition-colors"
							>
								<MdVisibility size={16} />
								View
							</button>
						</div>
					</div>
					);
				})}
			</div>
		</div>
	);
};

export default Recommendations;
