import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, Link } from "react-router-dom";
import moment from "moment";
import {
	MdSearch,
	MdClose,
	MdThumbUp,
	MdComment,
	MdArrowForward,
	MdTune,
	MdExplore,
} from "react-icons/md";

import { getPosts, getPostsBySearch } from "../../actions/posts";
import Paginate from "../Pagination/Pagination";
import Footer from "../Footer/Footer";

const POPULAR_TAGS = [
	"hiking",
	"travel",
	"adventure",
	"backpacking",
	"photography",
	"nature",
	"roadtrip",
	"camping",
	"beach",
	"mountains",
	"culture",
	"solo",
	"budget",
	"luxury",
	"food",
];

export default function PublicDiaries() {
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const page = parseInt(query.get("page") || 1);

	const dispatch = useDispatch();
	const history = useHistory();
	const { posts, isLoading, numberOfPages } = useSelector(
		(state) => state.posts,
	);

	const [search, setSearch] = useState("");
	const [activeTags, setActiveTags] = useState([]);
	const [showFilters, setShowFilters] = useState(false);
	const [isSearchMode, setIsSearchMode] = useState(false);

	// Fetch posts when page changes (only when not in search mode)
	useEffect(() => {
		if (!isSearchMode) {
			dispatch(getPosts(page));
		}
	}, [dispatch, page]);

	// Return to normal posts when clearing search
	useEffect(() => {
		if (!isSearchMode) {
			dispatch(getPosts(1));
		}
	}, [isSearchMode, dispatch]);

	const handleSearch = (e) => {
		e.preventDefault();
		if (!search.trim() && activeTags.length === 0) return;
		setIsSearchMode(true);
		dispatch(
			getPostsBySearch({
				search: search.trim() || "none",
				tags: activeTags.join(","),
			}),
		);
	};

	const handleClear = () => {
		setSearch("");
		setActiveTags([]);
		setIsSearchMode(false);
		// useEffect will handle fetching when isSearchMode becomes false
	};

	const toggleTag = (tag) => {
		setActiveTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	const openPost = (id) => history.push(`/posts/${id}`);

	const getImage = (post) => {
		if (Array.isArray(post.selectedFile) && post.selectedFile.length > 0)
			return post.selectedFile[0];
		if (typeof post.selectedFile === "string" && post.selectedFile)
			return post.selectedFile;
		return "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
	};

	return (
		<div className="min-h-screen bg-off-white flex flex-col">
			{/* ── Page header ──────────────────────────────────────── */}
			<div className="bg-gradient-to-br from-dark-green via-[#0a2d26] to-[#071e18] py-12 px-4">
				<div className="max-w-5xl mx-auto text-center">
					{/* Icon */}
					<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-light-green/10 border border-light-green/20 mb-4">
						<MdExplore size={30} className="text-light-green" />
					</div>

					<h1 className="text-white font-extrabold text-3xl sm:text-4xl mb-2">
						Public Diaries
					</h1>
					<p className="text-white/65 text-base max-w-lg mx-auto mb-8">
						Browse real adventure stories shared by the Atlas Diary
						community — no account required.
					</p>

					{/* Search */}
					<form
						onSubmit={handleSearch}
						className="max-w-xl mx-auto w-full"
					>
						<div className="flex items-center bg-off-white rounded-xl border-2 border-light-green px-3 py-2.5 gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
							<MdSearch
								size={22}
								className="text-dark-green shrink-0"
							/>
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search destinations, activities…"
								className="flex-1 bg-transparent text-text-dark text-sm outline-none placeholder:text-text-gray"
							/>
							{(search || activeTags.length > 0) && (
								<button
									type="button"
									onClick={handleClear}
									className="text-orange hover:text-orange-hover shrink-0"
								>
									<MdClose size={18} />
								</button>
							)}
							<button
								type="submit"
								className="bg-dark-green hover:bg-dark-green-hover text-off-white font-bold text-sm px-4 py-1.5 rounded-lg transition-colors shrink-0"
							>
								Search
							</button>
						</div>

						{/* Tag filter toggle */}
						<button
							type="button"
							onClick={() => setShowFilters((s) => !s)}
							className="mt-3 flex items-center gap-1.5 text-white/70 hover:text-light-green text-xs font-semibold transition-colors mx-auto"
						>
							<MdTune size={16} />
							{showFilters
								? "Hide tag filters"
								: "Filter by tags"}
							{activeTags.length > 0 && (
								<span className="bg-light-green text-text-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
									{activeTags.length}
								</span>
							)}
						</button>
					</form>
				</div>
			</div>

			{/* ── Tag filters panel ────────────────────────────────── */}
			{showFilters && (
				<div className="bg-dark-green/5 border-b border-dark-green/10 px-4 py-4">
					<div className="max-w-5xl mx-auto">
						<p className="text-dark-green font-semibold text-xs mb-3 uppercase tracking-wide">
							Popular Tags
						</p>
						<div className="flex flex-wrap gap-2">
							{POPULAR_TAGS.map((tag) => (
								<button
									key={tag}
									onClick={() => toggleTag(tag)}
									className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
										activeTags.includes(tag)
											? "bg-dark-green text-off-white border-dark-green"
											: "bg-off-white text-dark-green border-dark-green/30 hover:border-dark-green hover:bg-dark-green/5"
									}`}
								>
									#{tag}
								</button>
							))}
						</div>
						{activeTags.length > 0 && (
							<div className="mt-3 flex items-center gap-3">
								<p className="text-dark-green text-xs font-semibold">
									Active filters:
								</p>
								<div className="flex flex-wrap gap-1.5">
									{activeTags.map((tag) => (
										<span
											key={tag}
											className="flex items-center gap-1 bg-light-green text-text-dark text-xs font-bold px-2.5 py-1 rounded-full"
										>
											#{tag}
											<button
												onClick={() => toggleTag(tag)}
												className="hover:text-orange transition-colors"
											>
												<MdClose size={12} />
											</button>
										</span>
									))}
								</div>
								<button
									onClick={() => {
										setActiveTags([]);
										if (isSearchMode) handleClear();
									}}
									className="text-orange text-xs font-bold hover:underline ml-auto"
								>
									Clear all
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* ── Active search banner ─────────────────────────────── */}
			{isSearchMode && (
				<div className="bg-light-green/15 border-b border-light-green/30 px-4 py-2.5">
					<div className="max-w-5xl mx-auto flex items-center justify-between gap-2 flex-wrap">
						<p className="text-dark-green text-sm font-semibold">
							Showing search results
							{search.trim() && search !== "none" && (
								<>
									{" "}
									for{" "}
									<em className="not-italic font-bold">
										&ldquo;{search}&rdquo;
									</em>
								</>
							)}
						</p>
						<button
							onClick={handleClear}
							className="text-orange text-xs font-bold hover:underline"
						>
							← Back to all diaries
						</button>
					</div>
				</div>
			)}

			{/* ── Posts grid ───────────────────────────────────────── */}
			<main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
				{isLoading ? (
					<div className="flex justify-center items-center py-24">
						<div className="w-12 h-12 rounded-full border-4 border-off-white border-t-dark-green animate-spin" />
					</div>
				) : posts.length === 0 ? (
					<div className="text-center py-20">
						<div className="w-16 h-16 rounded-full bg-dark-green/5 flex items-center justify-center mx-auto mb-4">
							<MdExplore
								size={32}
								className="text-dark-green/40"
							/>
						</div>
						<p className="text-text-dark font-semibold text-lg mb-1">
							No diaries found
						</p>
						<p className="text-text-gray text-sm mb-4">
							Try a different search or browse all adventures.
						</p>
						<button
							onClick={handleClear}
							className="text-dark-green font-bold text-sm hover:underline"
						>
							Browse all diaries →
						</button>
					</div>
				) : (
					<>
						{/* Results count */}
						<p className="text-text-gray text-sm mb-5 font-medium">
							{isSearchMode ? (
								<>
									Found{" "}
									<strong className="text-dark-green">
										{posts.length}
									</strong>{" "}
									{posts.length === 1 ? "diary" : "diaries"}
								</>
							) : (
								<>
									Page{" "}
									<strong className="text-dark-green">
										{page}
									</strong>{" "}
									of{" "}
									<strong className="text-dark-green">
										{numberOfPages || 1}
									</strong>
								</>
							)}
						</p>

						{/* Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{posts.map((post) => (
								<article
									key={post._id}
									onClick={() => openPost(post._id)}
									className="group flex flex-col bg-off-white border border-dark-green/10 rounded-2xl shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 overflow-hidden cursor-pointer"
									tabIndex={0}
									role="button"
									aria-label={`Read "${post.title}" by ${post.name}`}
									onKeyPress={(e) => {
										if (e.key === "Enter")
											openPost(post._id);
									}}
								>
									{/* Image */}
									<div
										className="relative overflow-hidden"
										style={{ paddingTop: "60%" }}
									>
										<img
											src={getImage(post)}
											alt={post.title}
											loading="lazy"
											className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											onError={(e) => {
												e.target.onerror = null;
												e.target.src =
													"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
											}}
										/>

										{/* Image count */}
										{Array.isArray(post.selectedFile) &&
											post.selectedFile.length > 1 && (
												<div className="absolute top-2 right-2 bg-black/75 text-white text-xs font-bold px-2 py-0.5 rounded-xl z-10 backdrop-blur-sm">
													+
													{post.selectedFile.length -
														1}
												</div>
											)}

										{/* Author chip */}
										<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3 z-10">
											<div className="flex items-center gap-2">
												<div className="w-7 h-7 rounded-full bg-dark-green text-off-white flex items-center justify-center font-bold text-xs shrink-0 border border-light-green/40">
													{post.name
														?.charAt(0)
														.toUpperCase()}
												</div>
												<div>
													<p className="text-white font-semibold text-xs leading-tight">
														{post.name}
													</p>
													<p className="text-white/65 text-[0.65rem]">
														{moment(
															post.createdAt,
														).fromNow()}
													</p>
												</div>
											</div>
										</div>
									</div>

									{/* Content */}
									<div className="flex flex-col flex-1 p-4">
										{/* Tags */}
										<div className="flex flex-wrap gap-1 mb-2">
											{post.tags
												.slice(0, 4)
												.map((tag) => (
													<span
														key={tag}
														className="bg-light-green/15 text-dark-green text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
													>
														#{tag}
													</span>
												))}
											{post.tags.length > 4 && (
												<span className="text-text-gray text-[0.65rem] px-1">
													+{post.tags.length - 4}
												</span>
											)}
										</div>

										{/* Title */}
										<h2 className="text-text-dark font-bold text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-dark-green transition-colors">
											{post.title}
										</h2>

										{/* Excerpt */}
										<p className="text-text-gray text-sm leading-relaxed line-clamp-3 flex-1 mb-3">
											{post.message}
										</p>

										{/* Footer */}
										<div className="flex items-center justify-between pt-2 border-t border-dark-green/8">
											<div className="flex items-center gap-3">
												<span className="flex items-center gap-1 text-text-gray text-xs">
													<MdThumbUp
														size={14}
														className="text-accent-green"
													/>
													{post.likes?.length || 0}
												</span>
												<span className="flex items-center gap-1 text-text-gray text-xs">
													<MdComment
														size={14}
														className="text-accent-green"
													/>
													{post.comments?.length || 0}
												</span>
											</div>
											<span className="flex items-center gap-1 text-dark-green font-bold text-xs group-hover:gap-2 transition-all">
												Read more{" "}
												<MdArrowForward size={14} />
											</span>
										</div>
									</div>
								</article>
							))}
						</div>

						{/* Pagination */}
						{!isSearchMode && (
							<div className="mt-8">
								<Paginate
									page={page}
									basePath="/public-diaries"
								/>
							</div>
						)}
					</>
				)}
			</main>

			{/* ── Join CTA ─────────────────────────────────────────── */}
			<section className="bg-gradient-to-b from-dark-green/5 to-off-white px-4 py-12 border-t border-dark-green/10">
				<div className="max-w-xl mx-auto text-center">
					<h3 className="text-text-dark font-extrabold text-xl mb-2">
						Got an adventure to share?
					</h3>
					<p className="text-text-gray text-sm mb-6">
						Join thousands of explorers documenting their journeys
						on Atlas Diary.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Link
							to="/signup"
							className="inline-flex items-center gap-2 bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-bold px-6 py-2.5 rounded-full no-underline shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
						>
							Create Free Account
						</Link>
						<Link
							to="/posts"
							className="inline-flex items-center gap-2 text-dark-green font-semibold text-sm px-4 py-2.5 rounded-full no-underline border border-dark-green/20 hover:border-dark-green hover:bg-dark-green/5 transition-all"
						>
							Go to Feed
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
