import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
	return (
		<footer aria-label="Site footer">


			{/* Footer bar */}
			<div
				role="contentinfo"
				className="bg-gradient-to-b from-[#152f27] to-dark-green py-8 text-[#f2f5f1]"
			>
				<div className="w-full max-w-[1100px] mx-auto px-4 flex items-center justify-between gap-4 sm:flex-col sm:text-center sm:gap-3">
					{/* Links */}
					<nav
						aria-label="Footer"
						className="flex items-center gap-1 flex-wrap justify-center text-white/90"
					>
						<RouterLink
							to="/posts"
							className="text-white/90 no-underline font-semibold text-[0.95rem] px-1 py-0.5 hover:text-white hover:underline transition-colors"
						>
							Explore
						</RouterLink>

						<span
							aria-hidden
							className="text-white/60 mx-1 select-none"
						>
							|
						</span>

						<RouterLink
							to="/posts"
							className="text-white/90 no-underline font-semibold text-[0.95rem] px-1 py-0.5 hover:text-white hover:underline transition-colors"
						>
							Public Diaries
						</RouterLink>

						<span
							aria-hidden
							className="text-white/60 mx-1 select-none"
						>
							|
						</span>

						<RouterLink
							to="/how-it-works"
							className="text-white/90 no-underline font-semibold text-[0.95rem] px-1 py-0.5 hover:text-white hover:underline transition-colors"
						>
							How It Works
						</RouterLink>

						<span
							aria-hidden
							className="text-white/60 mx-1 select-none"
						>
							|
						</span>

						<RouterLink
							to="/about"
							className="text-white/90 no-underline font-semibold text-[0.95rem] px-1 py-0.5 hover:text-white hover:underline transition-colors"
						>
							About
						</RouterLink>

						<span
							aria-hidden
							className="text-white/60 mx-1 select-none"
						>
							|
						</span>

						<RouterLink
							to="/contact"
							className="text-white/90 no-underline font-semibold text-[0.95rem] px-1 py-0.5 hover:text-white hover:underline transition-colors"
						>
							Contact
						</RouterLink>

						<span
							aria-hidden
							className="text-white/60 mx-1 select-none"
						>
							|
						</span>

						<RouterLink
							to="/privacy"
							className="text-white/90 no-underline font-semibold text-[0.95rem] px-1 py-0.5 hover:text-white hover:underline transition-colors"
						>
							Privacy Policy
						</RouterLink>
					</nav>

					{/* Copyright */}
					<p className="text-white/78 text-[0.85rem] sm:mt-1">
						© {new Date().getFullYear()} Atlas Diary. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
