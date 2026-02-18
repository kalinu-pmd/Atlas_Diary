import { Link } from "react-router-dom";
import { MdExplore, MdHome, MdArrowBack } from "react-icons/md";
import Footer from "../Footer/Footer";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-off-white flex flex-col">
			<main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
				{/* Big 404 */}
				<div className="relative mb-8 select-none">
					<span
						className="font-black text-dark-green/8 leading-none"
						style={{ fontSize: "clamp(7rem, 20vw, 14rem)" }}
						aria-hidden
					>
						404
					</span>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-20 h-20 rounded-full bg-dark-green flex items-center justify-center shadow-card">
							<MdExplore size={40} className="text-light-green" />
						</div>
					</div>
				</div>

				{/* Heading */}
				<h1 className="text-text-dark font-extrabold text-3xl sm:text-4xl mb-3">
					Page not found
				</h1>
				<p className="text-text-gray text-base max-w-md mx-auto mb-8">
					Looks like this trail goes cold. The page you&apos;re
					looking for doesn&apos;t exist, was moved or has been
					removed.
				</p>

				{/* Actions */}
				<div className="flex flex-wrap items-center justify-center gap-3">
					<Link
						to="/posts"
						className="inline-flex items-center gap-2 bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-extrabold text-sm px-6 py-3 rounded-full no-underline shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
					>
						<MdHome size={18} />
						Go to Feed
					</Link>

					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center gap-2 text-dark-green font-semibold text-sm px-5 py-3 rounded-full border border-dark-green/20 hover:border-dark-green hover:bg-dark-green/5 transition-all bg-off-white"
					>
						<MdArrowBack size={18} />
						Go Back
					</button>

					<Link
							to="/posts"
						className="inline-flex items-center gap-2 text-dark-green font-semibold text-sm px-5 py-3 rounded-full border border-dark-green/20 hover:border-dark-green hover:bg-dark-green/5 transition-all bg-off-white no-underline"
					>
						<MdExplore size={18} />
						Explore Diaries
					</Link>
				</div>

				{/* Quick links */}
				<div className="mt-14 flex flex-col items-center gap-3">
					<p className="text-text-gray text-xs font-semibold uppercase tracking-widest">
						Quick Links
					</p>
					<div className="flex flex-wrap items-center justify-center gap-4">
						{[
							{ label: "Home", to: "/" },
							{ label: "How It Works", to: "/how-it-works" },
							{ label: "About", to: "/about" },
							{ label: "Contact", to: "/contact" },
						].map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="text-accent-green font-semibold text-sm hover:underline no-underline transition-colors"
							>
								{link.label}
							</Link>
						))}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
