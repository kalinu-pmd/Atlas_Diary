import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
	MdCameraAlt,
	MdLocationOn,
	MdFavorite,
	MdSearch,
	MdAutoStories,
	MdPeople,
	MdStar,
	MdThumbUp,
	MdComment,
	MdExpandMore,
	MdExpandLess,
} from "react-icons/md";
import { useState } from "react";
import Footer from "../Footer/Footer";

const steps = [
	{
		number: "01",
		icon: <MdAutoStories size={36} className="text-light-green" />,
		title: "Create Your Account",
		desc: "Sign up for free in seconds. No credit card, no catches. Just your name, email and a password — and you're in.",
		details: [
			"Completely free to join",
			"Secure, private by default",
			"Set up your profile in under a minute",
		],
	},
	{
		number: "02",
		icon: <MdCameraAlt size={36} className="text-light-green" />,
		title: "Write & Upload Your Adventure",
		desc: "Create a post for any adventure — a weekend hike, a solo backpacking trip, a local hidden gem. Add photos, a title, a description and tags.",
		details: [
			"Upload multiple photos per post",
			"Add descriptive tags for discoverability",
			"Rich text descriptions to tell your story",
		],
	},
	{
		number: "03",
		icon: <MdLocationOn size={36} className="text-light-green" />,
		title: "Share with the Community",
		desc: "Publish your diary entry to your public profile. The Atlas Diary community can discover, like and comment on your adventures.",
		details: [
			"Instantly visible to the community",
			"Receive likes and comments from fellow explorers",
			"Build your reputation as an adventurer",
		],
	},
	{
		number: "04",
		icon: <MdFavorite size={36} className="text-light-green" />,
		title: "Discover & Get Personalised Picks",
		desc: "The more you interact — liking, commenting, viewing posts — the smarter your recommendations become. Your 'For You' feed learns your style.",
		details: [
			"Content-based recommendation engine",
			"Discover posts similar to ones you loved",
			"'For You' page tailored to your taste",
		],
	},
];

const features = [
	{
		icon: <MdSearch size={26} className="text-dark-green" />,
		title: "Powerful Search",
		desc: "Search by title, keyword or tags. Find adventures from specific destinations or activity types instantly.",
	},
	{
		icon: <MdThumbUp size={26} className="text-dark-green" />,
		title: "Like & Engage",
		desc: "Show appreciation for posts you love. Your likes also train your personal recommendation engine.",
	},
	{
		icon: <MdComment size={26} className="text-dark-green" />,
		title: "Comment & Connect",
		desc: "Leave comments on adventures, ask questions, share tips. Build genuine connections with explorers.",
	},
	{
		icon: <MdPeople size={26} className="text-dark-green" />,
		title: "Community Feed",
		desc: "Browse a live feed of adventures from the entire community — sorted newest first, always fresh.",
	},
	{
		icon: <MdStar size={26} className="text-dark-green" />,
		title: "For You Page",
		desc: "A personalised recommendations page that surfaces the most relevant posts based on your history.",
	},
	{
		icon: <MdAutoStories size={26} className="text-dark-green" />,
		title: "Public Diaries",
		desc: "Browse all public posts without an account. Perfect for inspiration before you sign up.",
	},
];

const faqs = [
	{
		q: "Is Atlas Diary free to use?",
		a: "Yes, completely free. Creating an account, posting adventures, liking and commenting are all free features. We believe everyone's adventures deserve to be documented.",
	},
	{
		q: "Can I browse without an account?",
		a: "Absolutely. The Public Diaries section is open to everyone. You only need an account to create posts, like, comment or get personalised recommendations.",
	},
	{
		q: "How does the recommendation system work?",
		a: "Our content-based recommendation engine analyses the posts you like, view and comment on. It builds a preference profile and uses tag similarity plus text analysis to surface posts you'll likely enjoy. The more you interact, the better it gets.",
	},
	{
		q: "Can I upload multiple photos to one post?",
		a: "Yes! Each post supports multiple image uploads. Your readers can browse through all your photos on the post detail page.",
	},
	{
		q: "How do I edit or delete a post?",
		a: "On the posts feed, each post you own has an edit button (the three-dot icon). Click it to select the post for editing in the form panel. To delete, use the delete button that appears on your own posts.",
	},
	{
		q: "What types of adventures can I post?",
		a: "Anything goes — hiking, surfing, city exploration, road trips, solo travel, group adventures, local discoveries. If it's an experience worth remembering, it belongs on Atlas Diary.",
	},
];

FaqItem.propTypes = {
	q: PropTypes.string.isRequired,
	a: PropTypes.string.isRequired,
};

function FaqItem({ q, a }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="border border-dark-green/10 rounded-xl overflow-hidden">
			<button
				onClick={() => setOpen((s) => !s)}
				className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left bg-off-white hover:bg-dark-green/3 transition-colors"
			>
				<span className="text-text-dark font-semibold text-sm pr-4">
					{q}
				</span>
				{open ? (
					<MdExpandLess
						size={22}
						className="text-dark-green shrink-0"
					/>
				) : (
					<MdExpandMore
						size={22}
						className="text-dark-green shrink-0"
					/>
				)}
			</button>
			{open && (
				<div className="px-5 pb-4 pt-1 bg-dark-green/3 border-t border-dark-green/10">
					<p className="text-text-gray text-sm leading-relaxed">
						{a}
					</p>
				</div>
			)}
		</div>
	);
}

export default function HowItWorks() {
	return (
		<div className="min-h-screen bg-off-white flex flex-col">
			{/* ── Hero ──────────────────────────────────────────── */}
			<div className="bg-gradient-to-br from-dark-green via-[#0a2d26] to-[#071e18] py-16 px-4 text-center">
				<span className="inline-block bg-light-green/15 border border-light-green/25 text-light-green text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
					How It Works
				</span>
				<h1 className="text-white font-extrabold text-3xl sm:text-4xl mb-3">
					Your adventure diary,{" "}
					<span className="text-light-green">simplified.</span>
				</h1>
				<p className="text-white/65 text-base max-w-lg mx-auto mb-8">
					From signing up to sharing your first post, Atlas Diary is
					designed to be effortless. Here&apos;s exactly how it works.
				</p>
				<div className="flex flex-wrap items-center justify-center gap-3">
					<Link
						to="/signup"
						className="inline-flex items-center gap-2 bg-light-green hover:bg-light-green-hover text-text-dark font-extrabold text-sm px-6 py-3 rounded-full no-underline transition-all hover:-translate-y-0.5 shadow-[0_6px_24px_rgba(175,250,1,0.18)]"
					>
						Get Started Free
					</Link>
					<Link
						to="/public-diaries"
						className="inline-flex items-center gap-2 text-white/75 hover:text-white font-semibold text-sm px-5 py-3 rounded-full no-underline border border-white/20 hover:border-white/40 transition-all"
					>
						Browse Diaries First
					</Link>
				</div>
			</div>

			{/* ── Steps ─────────────────────────────────────────── */}
			<section
				aria-labelledby="steps-heading"
				className="py-16 sm:py-12 px-4"
			>
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<h2
							id="steps-heading"
							className="text-2xl sm:text-3xl font-extrabold text-text-dark"
						>
							Four steps to your Atlas
						</h2>
						<p className="text-text-gray text-sm mt-2 max-w-md mx-auto">
							Start documenting your adventures in minutes.
						</p>
					</div>

					<div className="flex flex-col gap-8">
						{steps.map((step, i) => (
							<div
								key={step.number}
								className={`flex flex-col sm:flex-row gap-6 items-start ${
									i % 2 === 1 ? "sm:flex-row-reverse" : ""
								}`}
							>
								{/* Icon card */}
								<div className="shrink-0 flex flex-col items-center gap-2 sm:w-40">
									<div className="w-20 h-20 rounded-2xl bg-dark-green flex items-center justify-center shadow-card">
										{step.icon}
									</div>
									<span className="text-dark-green/30 font-black text-4xl leading-none select-none">
										{step.number}
									</span>
								</div>

								{/* Content */}
								<div
									className={`flex-1 bg-off-white border border-dark-green/10 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow ${
										i % 2 === 1 ? "sm:text-right" : ""
									}`}
								>
									<h3 className="text-dark-green font-bold text-xl mb-2">
										{step.title}
									</h3>
									<p className="text-text-gray text-sm leading-relaxed mb-4">
										{step.desc}
									</p>
									<ul
										className={`flex flex-col gap-1.5 ${
											i % 2 === 1
												? "sm:items-end"
												: "items-start"
										}`}
									>
										{step.details.map((d) => (
											<li
												key={d}
												className={`flex items-center gap-2 text-sm text-text-dark ${
													i % 2 === 1
														? "sm:flex-row-reverse"
														: ""
												}`}
											>
												<span className="w-1.5 h-1.5 rounded-full bg-light-green shrink-0" />
												{d}
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Features ──────────────────────────────────────── */}
			<section
				aria-labelledby="features-heading"
				className="py-16 sm:py-12 px-4 bg-gradient-to-b from-dark-green/5 to-off-white"
			>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<span className="text-dark-green font-bold text-xs uppercase tracking-widest">
							Platform Features
						</span>
						<h2
							id="features-heading"
							className="mt-2 text-2xl sm:text-3xl font-extrabold text-text-dark"
						>
							Everything you need, nothing you don&apos;t
						</h2>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{features.map((f) => (
							<div
								key={f.title}
								className="bg-off-white border border-dark-green/10 rounded-xl p-5 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200"
							>
								<div className="w-11 h-11 rounded-xl bg-light-green/15 flex items-center justify-center mb-3">
									{f.icon}
								</div>
								<h3 className="text-dark-green font-bold text-base mb-1.5">
									{f.title}
								</h3>
								<p className="text-text-gray text-sm leading-relaxed">
									{f.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── FAQ ───────────────────────────────────────────── */}
			<section
				aria-labelledby="faq-heading"
				className="py-16 sm:py-12 px-4"
			>
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-10">
						<span className="text-dark-green font-bold text-xs uppercase tracking-widest">
							FAQs
						</span>
						<h2
							id="faq-heading"
							className="mt-2 text-2xl sm:text-3xl font-extrabold text-text-dark"
						>
							Frequently asked questions
						</h2>
					</div>

					<div className="flex flex-col gap-3">
						{faqs.map((faq) => (
							<FaqItem key={faq.q} q={faq.q} a={faq.a} />
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ───────────────────────────────────────────── */}
			<section className="py-16 px-4 bg-gradient-to-br from-dark-green to-[#071e18]">
				<div className="max-w-xl mx-auto text-center">
					<h2 className="text-white font-extrabold text-2xl sm:text-3xl mb-3">
						Ready to start your Atlas?
					</h2>
					<p className="text-white/65 text-sm mb-7 max-w-md mx-auto">
						Join a community of adventurers documenting the world —
						one journey at a time. Free, forever.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Link
							to="/signup"
							className="inline-flex items-center gap-2 bg-light-green hover:bg-light-green-hover text-text-dark font-extrabold text-sm px-7 py-3.5 rounded-full no-underline shadow-[0_6px_24px_rgba(175,250,1,0.18)] transition-all hover:-translate-y-0.5"
						>
							Create Free Account
						</Link>
						<Link
							to="/public-diaries"
							className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold text-sm px-5 py-3.5 rounded-full no-underline border border-white/20 hover:border-white/40 transition-all"
						>
							Explore First
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
