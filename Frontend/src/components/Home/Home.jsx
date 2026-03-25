import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { MdSearch, MdClose, MdAdd, MdTune } from "react-icons/md";

import Posts from "../Posts/Posts";
import Footer from "../Footer/Footer";
import { getPosts, getPostsBySearch, loadMorePosts } from "../../actions/posts";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

export default function Home() {
	const query = useQuery();
	const searchQuery = query.get("searchQuery");

	const dispatch = useDispatch();
	const history = useHistory();
	const user = useSelector((state) => state.auth.authData);
	const { currentPage, numberOfPages, isLoading } = useSelector(
		(state) => state.posts,
	);

	const [search, setSearch] = useState("");
	const [tags, setTags] = useState([]);
	const [tagInput, setTagInput] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const loadMoreRef = useRef(null);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const [isHidingScrollTop, setIsHidingScrollTop] = useState(false);

	const isSearchActive = search.trim() || tags.length > 0;

	// Track scroll position to toggle the floating "scroll to top" button
	useEffect(() => {
		const handleScroll = () => {
			const y = window.scrollY || window.pageYOffset || 0;
			const shouldShow = y > 400;

			if (shouldShow) {
				setShowScrollTop(true);
				setIsHidingScrollTop(false);
			} else if (!shouldShow && showScrollTop && !isHidingScrollTop) {
				// Smoothly hide when user scrolls near the top
				setIsHidingScrollTop(true);
				setTimeout(() => {
					setShowScrollTop(false);
					setIsHidingScrollTop(false);
				}, 250);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [showScrollTop, isHidingScrollTop]);

	useEffect(() => {
		if (searchQuery) {
			setSearch(decodeURIComponent(searchQuery));
		}
	}, [searchQuery]);

	// Initial feed load when not in search mode
	useEffect(() => {
		if (!isSearchActive) {
			dispatch(getPosts(1));
		}
	}, [dispatch, isSearchActive]);

	// Track whether more pages are available
	useEffect(() => {
		if (numberOfPages && currentPage) {
			setHasMore(currentPage < numberOfPages);
		}
	}, [currentPage, numberOfPages]);

	const handleSearch = (e) => {
		e.preventDefault();
		if (!search.trim() && tags.length === 0) return;
		dispatch(
			getPostsBySearch({
				search: search.trim() || "none",
				tags: tags.join(","),
			}),
		);
		history.push(
			`/posts/search?searchQuery=${encodeURIComponent(
				search.trim() || "none",
			)}&tags=${tags.join(",")}`,
		);
	};

	const handleClearSearch = () => {
		setSearch("");
		setTags([]);
		setTagInput("");
		history.push("/posts");
	};

	const handleAddTag = (e) => {
		if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
			e.preventDefault();
			const newTag = tagInput.trim().toLowerCase().replace(/,/g, "");
			if (!tags.includes(newTag)) {
				setTags([...tags, newTag]);
			}
			setTagInput("");
		}
	};

	const handleRemoveTag = (tag) => {
		setTags(tags.filter((t) => t !== tag));
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
		if (!showScrollTop) return;
		setIsHidingScrollTop(true);

		// Easing-based scroll: fast at start, slows near the top
		const startY = window.scrollY || window.pageYOffset || 0;
		const duration = 550; // ms
		const startTime = performance.now();

		const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

		const step = (now) => {
			const elapsed = now - startTime;
			const t = Math.min(1, elapsed / duration);
			const eased = easeOutCubic(t);
			const nextY = startY * (1 - eased);
			window.scrollTo(0, nextY);

			if (t < 1) {
				requestAnimationFrame(step);
			} else {
				setShowScrollTop(false);
				setIsHidingScrollTop(false);
			}
		};

		requestAnimationFrame(step);
	};

	return (
		<div className="min-h-screen bg-off-white flex flex-col">
			{/* ── Page header ─────────────────────────────────────────── */}
			<div className="bg-gradient-to-b from-dark-green to-[#0a2d26] py-8 px-4">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-white font-extrabold text-2xl sm:text-3xl mb-1">
						Adventure Feed
					</h1>
					<p className="text-white/70 text-sm mb-5">
						Discover stories from explorers around the world
					</p>

					{/* Search bar */}
					<form onSubmit={handleSearch} className="w-full">
						<div className="flex items-center gap-2 flex-wrap">
							<div className="flex-1 flex items-center bg-off-white rounded-xl border-2 border-light-green px-3 py-2 gap-2 min-w-0">
								<MdSearch
									size={20}
									className="text-dark-green shrink-0"
								/>
								<input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search adventures, destinations…"
									className="flex-1 bg-transparent text-text-dark text-sm outline-none placeholder:text-text-gray min-w-0"
								/>
								{isSearchActive && (
									<button
										type="button"
										onClick={handleClearSearch}
										className="text-orange hover:text-orange-hover shrink-0"
									>
										<MdClose size={18} />
									</button>
								)}
							</div>

							{/* Tag filter toggle */}
							<button
								type="button"
								onClick={() => setShowFilters((s) => !s)}
								className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
									showFilters || tags.length > 0
										? "bg-light-green border-light-green text-text-dark"
										: "bg-transparent border-off-white/40 text-white hover:border-light-green hover:text-light-green"
								}`}
							>
								<MdTune size={18} />
								<span className="hidden sm:inline">Tags</span>
								{tags.length > 0 && (
									<span className="bg-dark-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
										{tags.length}
									</span>
								)}
							</button>

							<button
								type="submit"
								className="bg-light-green hover:bg-light-green-hover text-text-dark font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
							>
								Search
							</button>
						</div>

						{/* Tag panel */}
						{showFilters && (
							<div className="mt-3 bg-off-white/10 border border-off-white/20 rounded-xl p-3">
								<p className="text-white/80 text-xs mb-2 font-medium">
									Filter by tags — press Enter or comma to add
								</p>
								<div className="flex flex-wrap gap-1.5 mb-2">
									{tags.map((tag) => (
										<span
											key={tag}
											className="flex items-center gap-1 bg-light-green text-text-dark text-xs font-semibold px-2.5 py-1 rounded-full"
										>
											#{tag}
											<button
												type="button"
												onClick={() =>
													handleRemoveTag(tag)
												}
												className="hover:text-orange transition-colors"
											>
												<MdClose size={12} />
											</button>
										</span>
									))}
								</div>
								<input
									value={tagInput}
									onChange={(e) =>
										setTagInput(e.target.value)
									}
									onKeyDown={handleAddTag}
									placeholder="e.g. hiking, bali, roadtrip…"
									className="w-full bg-white/90 rounded-lg px-3 py-2 text-sm text-text-dark outline-none border border-light-green focus:border-dark-green placeholder:text-text-gray"
								/>
							</div>
						)}
					</form>
				</div>
			</div>

			{/* Search active banner */}
			{isSearchActive && (
				<div className="bg-light-green/20 border-b border-light-green/40 px-4 py-2">
					<div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
						<p className="text-dark-green text-sm font-semibold">
							Showing results
							{search.trim() && (
								<span>
									{" "}
									for{" "}
									<em className="not-italic font-bold">
										&ldquo;{search}&rdquo;
									</em>
								</span>
							)}
							{tags.length > 0 && (
								<span>
									{" "}
									tagged{" "}
									{tags.map((t) => (
										<span
											key={t}
											className="inline-block bg-dark-green text-off-white text-xs px-2 py-0.5 rounded-full mx-0.5"
										>
											#{t}
										</span>
									))}
								</span>
							)}
						</p>
						<button
							onClick={handleClearSearch}
							className="text-orange text-xs font-bold hover:underline"
						>
							Clear search
						</button>
					</div>
				</div>
			)}

			{/* ── Main content ─────────────────────────────────────────── */}
		<main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
			<div className="flex flex-col lg:flex-row gap-8 justify-center">
				{/* Posts feed (centered) */}
				<div className="w-full lg:max-w-2xl">
					<Posts />
					{/* Infinite scroll sentinel & status (only in main feed) */}
					{!isSearchActive && (
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
				{/* Sidebar removed - create post moved to separate page */}
				</div>
			</main>

		{/* Floating scroll-to-top button */}
		{showScrollTop && (
			<button
				type="button"
				onClick={handleScrollToTop}
				className={`fixed right-4 bottom-5 z-[1100] inline-flex items-center justify-center rounded-full bg-dark-green text-off-white shadow-[0_10px_25px_rgba(12,52,44,0.35)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-light-green/70 ${
					isHidingScrollTop
						? "opacity-0 translate-y-3 scale-90 pointer-events-none"
						: "opacity-100 translate-y-0 scale-100"
				}`}
				aria-label="Scroll back to top"
			>
				<span className="px-3 py-3 text-lg leading-none">↑</span>
			</button>
		)}

			<Footer />
		</div>
	);
}
