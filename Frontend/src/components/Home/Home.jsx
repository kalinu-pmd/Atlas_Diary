import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useLocation, useHistory } from "react-router-dom";
import { MdSearch, MdClose, MdTune, MdKeyboardArrowUp } from "react-icons/md";

import Posts from "../Posts/Posts";
import Footer from "../Footer/Footer";
import { getPosts, getPostsBySearch, loadMorePosts } from "../../actions/posts";
import LocationPicker from "../Form/LocationPicker";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

export default function Home() {
	const routeLocation = useLocation();
	const query = useQuery();
	const searchQuery = query.get("searchQuery");
	const latQuery = query.get("lat");
	const lngQuery = query.get("lng");
	const radiusQuery = query.get("radius");
	const locationModeQuery = query.get("locationMode");

	const dispatch = useDispatch();
	const history = useHistory();
	const { posts, currentPage, numberOfPages, isLoading } = useSelector(
		(state) => state.posts,
	);

	const [search, setSearch] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [pinnedLocation, setPinnedLocation] = useState(null);
	const [searchRadiusKm, setSearchRadiusKm] = useState(50);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const loadMoreRef = useRef(null);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const searchDispatchRef = useRef(false);

	const hasSearchQuery = Boolean(searchQuery && searchQuery !== "none");
	const hasLocationQuery =
		Number.isFinite(Number(latQuery)) && Number.isFinite(Number(lngQuery));
	const hasLocalFilters = Boolean(search.trim()) || Boolean(pinnedLocation);
	const isSearchRoute = routeLocation.pathname === "/posts/search";
	const isSearchActive =
		isSearchRoute &&
		(hasSearchQuery || hasLocationQuery || hasLocalFilters);
	const isLocationResultMode =
		locationModeQuery === "1" &&
		Number.isFinite(Number(latQuery)) &&
		Number.isFinite(Number(lngQuery));
	const isInitialFeedLoading =
		routeLocation.pathname === "/posts" &&
		!isSearchActive &&
		!isLocationResultMode &&
		isLoading &&
		posts.length === 0;

	// Prevent users from scrolling down into empty space while the initial
	// public feed skeleton is loading, then restore normal scrolling after load.
	useEffect(() => {
		if (!isInitialFeedLoading) return;
		window.scrollTo({ top: 0, behavior: "auto" });

		return () => {
			window.scrollTo({ top: 0, behavior: "auto" });
		};
	}, [isInitialFeedLoading]);

	// Track scroll position to toggle the floating "scroll to top" button
	useEffect(() => {
		const handleScroll = () => {
			const y = window.scrollY || window.pageYOffset || 0;
			setShowScrollTop(y > 340);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useEffect(() => {
		if (routeLocation.pathname !== "/posts/search") {
			setSearch("");
			setPinnedLocation(null);
			setSearchRadiusKm(50);
			return;
		}

		if (searchQuery && searchQuery !== "none") {
			setSearch(decodeURIComponent(searchQuery));
		} else {
			setSearch("");
		}

		const parsedLat = Number(latQuery);
		const parsedLng = Number(lngQuery);
		if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
			setPinnedLocation({ lat: parsedLat, lng: parsedLng });
		} else {
			setPinnedLocation(null);
		}

		const parsedRadius = Number(radiusQuery);
		if (Number.isFinite(parsedRadius) && parsedRadius > 0) {
			setSearchRadiusKm(Math.round(parsedRadius / 1000));
		} else {
			setSearchRadiusKm(50);
		}
	}, [routeLocation.pathname, searchQuery, latQuery, lngQuery, radiusQuery]);

	useEffect(() => {
		if (routeLocation.pathname !== "/posts/search") return;
		if (searchDispatchRef.current) {
			searchDispatchRef.current = false;
			return;
		}

		const hasSearch = searchQuery && searchQuery !== "none";
		const parsedLat = Number(latQuery);
		const parsedLng = Number(lngQuery);
		const hasPinned = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);

		if (!hasSearch && !hasPinned) return;

		const payload = {
			search: hasSearch ? decodeURIComponent(searchQuery) : "none",
			tags: "none",
		};

		if (hasPinned) {
			const parsedRadius = Number(radiusQuery);
			payload.location = { lat: parsedLat, lng: parsedLng };
			payload.radius = Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 50000;
		}

		dispatch(getPostsBySearch(payload));
	}, [dispatch, routeLocation.pathname, searchQuery, latQuery, lngQuery, radiusQuery]);

	const performSearch = () => {
		const hasSearchInput = Boolean(search.trim());
		const hasPinnedFilter = Boolean(pinnedLocation);
		const useLocationSearch = !hasSearchInput && hasPinnedFilter;

		if (!hasSearchInput && !hasPinnedFilter) {
			history.push("/posts");
			dispatch(getPosts(1));
			return;
		}

		const radiusMeters = Math.max(5, Number(searchRadiusKm || 50)) * 1000;
		const searchPayload = {
			search: search.trim() || "none",
			tags: "none",
		};

		if (useLocationSearch) {
			searchPayload.location = pinnedLocation;
			searchPayload.radius = radiusMeters;
		} else if (hasSearchInput) {
			// A plain name search should not keep the previous location filter active.
			setPinnedLocation(null);
			setShowFilters(false);
		}

		const params = new URLSearchParams();
		if (searchPayload.search !== "none") {
			params.set("searchQuery", searchPayload.search);
		}
		if (useLocationSearch) {
			params.set("lat", String(pinnedLocation.lat));
			params.set("lng", String(pinnedLocation.lng));
			params.set("radius", String(radiusMeters));
			params.set("locationMode", "1");
		}

		history.push(`/posts/search?${params.toString()}`);
		searchDispatchRef.current = true;
		dispatch(getPostsBySearch(searchPayload));
	};

	// Initial feed load when not in search mode
	useEffect(() => {
		if (routeLocation.pathname !== "/posts") return;
		dispatch(getPosts(1));
	}, [dispatch, routeLocation.pathname]);

	// Track whether more pages are available
	useEffect(() => {
		if (numberOfPages && currentPage) {
			setHasMore(currentPage < numberOfPages);
		}
	}, [currentPage, numberOfPages]);

	const handleSearch = (e) => {
		e.preventDefault();
		performSearch();
	};

	const handleClearSearch = () => {
		setSearch("");
		setPinnedLocation(null);
		setSearchRadiusKm(50);
		setShowFilters(false);
		history.push("/posts");
		dispatch(getPosts(1));
	};

	const handleClearPin = () => {
		setPinnedLocation(null);

		if (routeLocation.pathname === "/posts/search") {
			const hasSearchInput = Boolean(search.trim());
			if (hasSearchInput) {
				const params = new URLSearchParams();
				params.set("searchQuery", search.trim());
				history.push(`/posts/search?${params.toString()}`);
				dispatch(
					getPostsBySearch({
						search: search.trim(),
						tags: "none",
					}),
				);
				return;
			}

			history.push("/posts");
			dispatch(getPosts(1));
		}
	};

	// Infinite scroll observer for the main feed
	useEffect(() => {
		if (isSearchActive) return; // no infinite scroll in search mode
		if (!hasMore) return;
		if (isLoadingMore) return;

		const element = loadMoreRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting && !isLoadingMore && hasMore) {
					const nextPage = (currentPage || 1) + 1;
					if (!numberOfPages || nextPage > numberOfPages) return;

					setIsLoadingMore(true);
					dispatch(loadMorePosts(nextPage)).finally(() => {
						setIsLoadingMore(false);
					});
				}
			},
			{
				root: null,
				rootMargin: "0px 0px 200px 0px",
				threshold: 0.1,
			},
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [
		dispatch,
		currentPage,
		numberOfPages,
		isSearchActive,
		hasMore,
		isLoadingMore,
	]);

	const handleScrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(101,162,122,0.14),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(175,250,1,0.08),_transparent_36%),#f7f6f2] flex flex-col">
			{/* Minimal search header */}
			<section className="relative overflow-hidden bg-gradient-to-br from-[#0f3d34] via-[#1b4a40] to-[#2f6b4f] px-4 pt-6 pb-6 border-b border-light-green/20">
				<div className="max-w-5xl mx-auto relative z-[1]">
					<p className="text-white/75 text-sm mb-3 font-semibold tracking-wide">
						Search public diaries
					</p>

					<form onSubmit={handleSearch} className="w-full">
						<div className="flex items-center gap-2.5 flex-wrap p-2 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm">
							<div className="flex-1 flex items-center bg-off-white rounded-xl px-3 py-2.5 gap-2 min-w-0">
								<MdSearch size={20} className="text-dark-green/80 shrink-0" />
								<input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search destinations, stories, and tags"
									className="flex-1 bg-transparent text-text-dark text-sm outline-none placeholder:text-text-gray min-w-0"
								/>
								{(hasLocalFilters || isSearchActive) && (
									<button
										type="button"
										onClick={handleClearSearch}
										className="text-orange hover:text-orange-hover shrink-0"
									>
										<MdClose size={18} />
									</button>
								)}
							</div>

							<button
								type="button"
								onClick={() => setShowFilters((s) => !s)}
								className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
									showFilters || (pinnedLocation && !search.trim())
										? "bg-light-green border-light-green text-text-dark"
										: "bg-transparent border-white/35 text-white hover:border-light-green hover:text-light-green"
								}`}
							>
								<MdTune size={17} />
								<span className="hidden sm:inline">Location Search</span>
								{pinnedLocation && !search.trim() && (
									<span className="bg-dark-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
										1
									</span>
								)}
							</button>

							<button
								type="submit"
								className="bg-light-green hover:bg-light-green-hover text-text-dark font-black px-5 py-2.5 rounded-xl text-sm transition-colors"
							>
								Search
							</button>
						</div>

						{showFilters && (
							<div className="mt-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-3">
								<p className="text-white/80 text-xs mb-2 font-medium">
									Pin a location and set radius
								</p>

								<div className="mt-3 rounded-lg border border-light-green/40 bg-white/90 p-3">
									<p className="text-xs font-semibold text-dark-green mb-2">
										Map pin location
									</p>
									<LocationPicker
										value={pinnedLocation || { lat: 27.7172, lng: 85.324 }}
										onChange={(nextLocation) => setPinnedLocation(nextLocation)}
										radiusMeters={searchRadiusKm * 1000}
										showSearch={false}
									/>

									<label className="text-xs font-semibold text-dark-green block mb-1">
										Radius: {searchRadiusKm} km
									</label>
									<div className="flex items-center justify-between text-[10px] font-semibold text-text-gray mb-1">
										<span>5 km</span>
										<span className="text-dark-green text-xs">{searchRadiusKm} km</span>
										<span>200 km</span>
									</div>
									<input
										type="range"
										min={5}
										max={200}
										step={5}
										value={searchRadiusKm}
										onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
										className="w-full accent-dark-green h-2"
									/>

									<div className="mt-2 flex justify-end gap-2">
										<button
											type="button"
											onClick={handleClearPin}
											className="text-xs font-semibold text-orange hover:underline"
										>
											Clear pin
										</button>
										<button
											type="button"
											onClick={performSearch}
											className="text-xs font-bold bg-dark-green text-off-white px-3 py-1.5 rounded-md"
										>
											Search
										</button>
									</div>
								</div>
							</div>
						)}
					</form>
				</div>
			</section>

			{/* ── Main content ─────────────────────────────────────────── */}
		<main className="flex-1 max-w-6xl mx-auto w-full px-4 py-7">
			<div className="w-full">
				{/* Posts feed */}
				<div className="w-full">
					{isLocationResultMode ? (
						<div className="overflow-hidden rounded-xl border border-dark-green/20 bg-off-white shadow-sm">
							<table className="w-full text-sm">
								<thead className="bg-dark-green text-off-white">
									<tr>
										<th className="text-left px-4 py-3 font-bold">Post Name</th>
										<th className="text-left px-4 py-3 font-bold">Location</th>
										<th className="text-left px-4 py-3 font-bold">Distance</th>
									</tr>
								</thead>
								<tbody>
									{posts.map((post) => (
										<tr key={post._id} className="border-t border-dark-green/10 hover:bg-light-green/10">
											<td className="px-4 py-3">
												<RouterLink to={`/posts/${post._id}`} className="text-dark-green font-semibold hover:underline">
													{post.title || "Untitled Post"}
												</RouterLink>
											</td>
											<td className="px-4 py-3 text-text-dark">
												{post.locationName || "Unknown location"}
											</td>
											<td className="px-4 py-3 text-text-dark">
												{typeof post.distanceKm === "number"
													? `${post.distanceKm.toFixed(2)} km from pinned location`
													: typeof post.distanceMeters === "number"
														? `${(post.distanceMeters / 1000).toFixed(2)} km from pinned location`
														: "-"}
											</td>
										</tr>
									))}
									{posts.length === 0 && (
										<tr>
											<td colSpan={3} className="px-4 py-6 text-center text-text-gray">
												No posts found for this pinned location and radius.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					) : (
						<Posts />
					)}
					{/* Infinite scroll sentinel & status (only in main feed) */}
					{!isSearchActive && !isLocationResultMode && (
						<div className="mt-8 flex flex-col items-center gap-3 pb-10">
							<div
								ref={loadMoreRef}
								className="h-1 w-full"
							/>
							{isLoadingMore && (
								<div className="flex items-center gap-2 text-text-gray text-sm">
									<div className="w-4 h-4 rounded-full border-2 border-transparent border-t-dark-green animate-spin" />
									<span>Finding more adventures for you…</span>
								</div>
							)}
							{!isLoading && !isLoadingMore && !hasMore && (
								<div className="text-center text-xs sm:text-sm text-text-gray space-y-1">
									<p className="text-text-dark font-semibold text-sm sm:text-base">
										You&apos;re all caught up for now.
									</p>
									<p>
										Come back later for fresh adventures, or share your own story.
									</p>
									<button
										onClick={() => history.push("/create-post")}
										className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-dark-green text-off-white text-xs sm:text-sm font-bold hover:bg-dark-green-hover transition-colors"
									>
										Create a new adventure
									</button>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</main>

		{/* Floating scroll-to-top button */}
		<button
			type="button"
			onClick={handleScrollToTop}
			aria-label="Scroll to top"
			className={`fixed bottom-6 right-5 sm:right-7 z-[1200] inline-flex h-12 w-12 items-center justify-center rounded-full border border-dark-green/20 bg-dark-green text-off-white shadow-[0_8px_22px_rgba(12,52,44,0.35)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-[#0b4237] ${
				showScrollTop
					? "opacity-100 translate-y-0 scale-100"
					: "opacity-0 translate-y-3 scale-90 pointer-events-none"
			}`}
		>
			<MdKeyboardArrowUp size={24} />
		</button>

			<Footer />
		</div>
	);
}
