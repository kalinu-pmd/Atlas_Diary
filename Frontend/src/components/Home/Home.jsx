import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { MdSearch, MdClose, MdAdd, MdTune } from "react-icons/md";

import Posts from "../Posts/Posts";
import Form from "../Form/Form";
import Paginate from "../Pagination/Pagination";
import Footer from "../Footer/Footer";
import { getPostsBySearch } from "../../actions/posts";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

export default function Home() {
	const query = useQuery();
	const page = query.get("page") || 1;
	const searchQuery = query.get("searchQuery");

	const dispatch = useDispatch();
	const history = useHistory();
	const user = useSelector((state) => state.auth.authData);

	const [search, setSearch] = useState("");
	const [tags, setTags] = useState([]);
	const [tagInput, setTagInput] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		if (searchQuery) {
			setSearch(decodeURIComponent(searchQuery));
		}
	}, [searchQuery]);

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

	const isSearchActive = search.trim() || tags.length > 0;

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
			<main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Posts grid */}
					<div className="flex-1 min-w-0">
						<Posts />
						{!isSearchActive && (
							<div className="mt-6">
								<Paginate page={page} />
							</div>
						)}
					</div>

					{/* Sidebar: Create post form */}
					<aside className="lg:w-72 xl:w-80 shrink-0">
						{/* Mobile: toggle button */}
						<div className="lg:hidden mb-3">
							{user?.result?.name && (
								<button
									onClick={() => setShowForm((s) => !s)}
									className="w-full flex items-center justify-center gap-2 bg-dark-green hover:bg-dark-green-hover text-off-white font-bold py-2.5 rounded-xl transition-colors"
								>
									<MdAdd size={20} />
									{showForm ? "Hide Form" : "Create a Post"}
								</button>
							)}
						</div>

						{/* Form visibility: always on lg+, toggle on mobile */}
						<div
							className={`${
								showForm ? "block" : "hidden"
							} lg:block`}
						>
							<Form />
						</div>

						{/* Hint for guests */}
						{!user?.result?.name && (
							<div className="hidden lg:block bg-gradient-to-br from-dark-green/5 to-light-green/10 border border-dark-green/20 rounded-xl p-4 text-center">
								<p className="text-dark-green font-semibold text-sm mb-2">
									Ready to share your adventure?
								</p>
								<p className="text-text-gray text-xs mb-3">
									Sign in to create posts, like and comment on
									stories.
								</p>
								<a
									href="/auth"
									className="inline-block bg-dark-green text-off-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-dark-green-hover transition-colors no-underline"
								>
									Sign In
								</a>
							</div>
						)}
					</aside>
				</div>
			</main>

			<Footer />
		</div>
	);
}
