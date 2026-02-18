import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getPosts } from "../../actions/posts";

const Paginate = ({ page }) => {
	const dispatch = useDispatch();
	const totalPages = useSelector((state) => state.posts.numberOfPages);

	useEffect(() => {
		if (page) {
			dispatch(getPosts(page));
		}
	}, [dispatch, page]);

	if (!totalPages || totalPages <= 1) return null;

	const currentPage = Number(page) || 1;

	// Build an array of page numbers to display (with ellipsis logic)
	const getPageNumbers = () => {
		const pages = [];
		const delta = 2; // pages around current

		const rangeStart = Math.max(2, currentPage - delta);
		const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

		// Always include first page
		pages.push(1);

		// Ellipsis after first
		if (rangeStart > 2) {
			pages.push("...");
		}

		// Middle range
		for (let i = rangeStart; i <= rangeEnd; i++) {
			pages.push(i);
		}

		// Ellipsis before last
		if (rangeEnd < totalPages - 1) {
			pages.push("...");
		}

		// Always include last page (if more than 1 page total)
		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return pages;
	};

	const btnBase =
		"inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg border text-sm font-semibold transition-colors select-none";

	const btnActive =
		"bg-dark-green text-off-white border-dark-green hover:bg-dark-green-hover";

	const btnDefault =
		"bg-off-white text-dark-green border-light-green hover:bg-light-green hover:text-text-dark";

	const btnDisabled =
		"bg-off-white text-text-gray border-text-gray/30 cursor-not-allowed opacity-50";

	return (
		<nav
			aria-label="Pagination"
			className="flex justify-around items-center flex-wrap gap-1 py-2"
		>
			{/* Previous */}
			{currentPage > 1 ? (
				<Link
					to={`/posts?page=${currentPage - 1}`}
					className={`${btnBase} ${btnDefault} no-underline`}
					aria-label="Previous page"
				>
					&lsaquo;
				</Link>
			) : (
				<span className={`${btnBase} ${btnDisabled}`} aria-disabled>
					&lsaquo;
				</span>
			)}

			{/* Page numbers */}
			{getPageNumbers().map((p, idx) =>
				p === "..." ? (
					<span
						key={`ellipsis-${idx}`}
						className="inline-flex items-center justify-center min-w-[36px] h-9 px-2 text-sm text-text-gray select-none"
					>
						&hellip;
					</span>
				) : (
					<Link
						key={p}
						to={`/posts?page=${p}`}
						className={`${btnBase} no-underline ${
							p === currentPage ? btnActive : btnDefault
						}`}
						aria-label={`Page ${p}`}
						aria-current={p === currentPage ? "page" : undefined}
					>
						{p}
					</Link>
				),
			)}

			{/* Next */}
			{currentPage < totalPages ? (
				<Link
					to={`/posts?page=${currentPage + 1}`}
					className={`${btnBase} ${btnDefault} no-underline`}
					aria-label="Next page"
				>
					&rsaquo;
				</Link>
			) : (
				<span className={`${btnBase} ${btnDisabled}`} aria-disabled>
					&rsaquo;
				</span>
			)}
		</nav>
	);
};

export default Paginate;
