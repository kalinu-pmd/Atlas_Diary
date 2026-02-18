import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
	return (
		<footer aria-label="Site footer">
			{/* CTA Strip */}
			<div
				role="region"
				aria-labelledby="create-your-atlas"
				className="bg-gradient-to-b from-[#e9f3ea] to-[#e1efe5] py-16 sm:py-10 flex items-center justify-center"
			>
				<div className="w-full max-w-[1100px] mx-auto px-4 flex items-center justify-between gap-4 sm:flex-col sm:items-center sm:gap-3">
					<p
						id="create-your-atlas"
						className="text-[#163a31] font-bold tracking-wide text-lg sm:text-base text-left sm:text-center"
					>
						Your memories deserve more than temporary posts.
					</p>

					<RouterLink
						to="/signup"
						aria-label="Create Your Atlas"
						className="inline-flex items-center justify-center bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-bold no-underline px-6 py-2.5 rounded-lg shadow-[0_12px_36px_rgba(47,107,79,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(47,107,79,0.18)] xs:w-full"
					>
						Create Your Atlas
					</RouterLink>
				</div>
			</div>

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
							to="/public-diaries"
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
