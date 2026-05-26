import { Link } from "react-router-dom";
import {
	MdExplore,
	MdFavorite,
	MdPeople,
	MdAutoStories,
	MdStar,
	MdLocationOn,
} from "react-icons/md";
import Footer from "../Footer/Footer";

const values = [
	{
		icon: <MdExplore size={28} className="text-light-green" />,
		title: "Adventure First",
		desc: "Everything we build is designed to celebrate and elevate the spirit of exploration — big trips and small discoveries alike.",
	},
	{
		icon: <MdAutoStories size={28} className="text-light-green" />,
		title: "Stories Matter",
		desc: "We believe every journey deserves to be documented properly. Not just a photo dump — a real, lasting diary entry.",
	},
	{
		icon: <MdPeople size={28} className="text-light-green" />,
		title: "Community Driven",
		desc: "Atlas Diary grows stronger with every explorer who joins. We build features around what our community actually needs.",
	},
	{
		icon: <MdFavorite size={28} className="text-light-green" />,
		title: "Authenticity",
		desc: "We celebrate real adventures — not curated perfection. Honest stories from real people in real places.",
	},
	{
		icon: <MdStar size={28} className="text-light-green" />,
		title: "Quality Experience",
		desc: "From the recommendation engine to the post editor, every detail is crafted to make your experience smooth and beautiful.",
	},
	{
		icon: <MdLocationOn size={28} className="text-light-green" />,
		title: "Global Perspective",
		desc: "Adventure knows no borders. Our platform is built for explorers from every country, culture and background.",
	},
];

const team = [
	{
		name: "Pramod Gyawali",
		role: "Algorithms",
		bio: "Focuses on recommendation and ranking logic that keep exploration smart and relevant.",
		avatar: "P",
		color: "bg-dark-green",
	},
	{
		name: "Ritesh Pokhrel",
		role: "Frontend & UI/UX",
		bio: "Designs and builds the interface to keep Atlas Diary clean, fast, and delightful.",
		avatar: "R",
		color: "bg-accent-green",
	},
	{
		name: "Binod Kandel",
		role: "Backend & Frontend",
		bio: "Connects the client and server with reliable APIs and smooth integrations.",
		avatar: "B",
		color: "bg-[#2b6f4f]",
	},
];

export default function About() {
	return (
		<div className="min-h-screen bg-off-white flex flex-col">
			{/* ── Hero ──────────────────────────────────────────────── */}
			<div className="bg-gradient-to-br from-dark-green via-[#0a2d26] to-[#071e18] py-16 sm:py-12 px-4 text-center">
				<span className="inline-block bg-light-green/15 border border-light-green/25 text-light-green text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
					About Us
				</span>
				<h1 className="text-white font-extrabold text-3xl sm:text-4xl mb-3 max-w-2xl mx-auto leading-tight">
					Built by explorers,{" "}
					<span className="text-light-green">for explorers.</span>
				</h1>
				<p className="text-white/65 text-base max-w-lg mx-auto">
					Atlas Diary was born out of frustration — great travel
					memories disappearing into algorithmic feeds, never to be
					found again. We set out to fix that.
				</p>
			</div>

			{/* ── Mission ───────────────────────────────────────────── */}
			<section
				aria-labelledby="mission-heading"
				className="py-16 sm:py-12 px-4"
			>
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-col md:flex-row gap-10 items-center">
						{/* Text */}
						<div className="flex-1">
							<span className="text-dark-green font-bold text-xs uppercase tracking-widest">
								Our Mission
							</span>
							<h2
								id="mission-heading"
								className="mt-2 text-2xl sm:text-3xl font-extrabold text-text-dark mb-4 leading-tight"
							>
								Give every adventure a home it deserves.
							</h2>
							<p className="text-text-gray text-sm leading-relaxed mb-4">
								Social media was never designed for travel
								stories. Posts get buried in hours, algorithms
								decide what you see, and your carefully crafted
								diary entry is gone before anyone reads it.
							</p>
							<p className="text-text-gray text-sm leading-relaxed mb-4">
								Atlas Diary is different. We&apos;re
								purpose-built for explorers — a focused,
								beautiful platform where adventure content is
								first-class. Your stories are permanent,
								searchable and shareable on your terms.
							</p>
							<p className="text-text-gray text-sm leading-relaxed">
								Our mission is simple: ensure that no adventure
								goes undocumented, no story goes unheard, and no
								explorer feels alone on the road.
							</p>
						</div>

						{/* Stats card */}
						<div className="shrink-0 w-full md:w-64 bg-gradient-to-br from-dark-green to-[#0a2d26] rounded-2xl p-6 shadow-card text-white">
							<h3 className="font-bold text-base mb-5 text-light-green">
								Atlas in Numbers
							</h3>
							{[
								{ value: "10,000+", label: "Explorers" },
								{ value: "50,000+", label: "Diary Entries" },
								{
									value: "120+",
									label: "Countries Represented",
								},
								{
									value: "500K+",
									label: "Interactions Monthly",
								},
							].map((stat) => (
								<div
									key={stat.label}
									className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0"
								>
									<span className="text-white/70 text-sm">
										{stat.label}
									</span>
									<span className="text-light-green font-extrabold text-lg">
										{stat.value}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── Values ────────────────────────────────────────────── */}
			<section
				aria-labelledby="values-heading"
				className="py-16 sm:py-12 px-4 bg-gradient-to-b from-dark-green/5 to-off-white"
			>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<span className="text-dark-green font-bold text-xs uppercase tracking-widest">
							What We Believe
						</span>
						<h2
							id="values-heading"
							className="mt-2 text-2xl sm:text-3xl font-extrabold text-text-dark"
						>
							Our values
						</h2>
						<p className="text-text-gray text-sm mt-2 max-w-md mx-auto">
							These principles guide every decision we make — from
							product features to community policies.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{values.map((v) => (
							<div
								key={v.title}
								className="bg-off-white border border-dark-green/10 rounded-xl p-5 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 group"
							>
								<div className="w-11 h-11 rounded-xl bg-dark-green group-hover:bg-dark-green-hover flex items-center justify-center mb-3 transition-colors">
									{v.icon}
								</div>
								<h3 className="text-dark-green font-bold text-base mb-1.5">
									{v.title}
								</h3>
								<p className="text-text-gray text-sm leading-relaxed">
									{v.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Team ──────────────────────────────────────────────── */}
			<section
				aria-labelledby="team-heading"
				className="py-16 sm:py-12 px-4 bg-gradient-to-b from-dark-green/5 to-off-white"
			>
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-10">
						<span className="text-dark-green font-bold text-xs uppercase tracking-widest">
							The Team
						</span>
						<h2
							id="team-heading"
							className="mt-2 text-2xl sm:text-3xl font-extrabold text-text-dark"
						>
							Meet the explorers behind Atlas Diary
						</h2>
						<p className="text-text-gray text-sm mt-2 max-w-md mx-auto">
							A small, passionate team united by a love of travel
							and great software.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
						{team.map((member) => (
							<div
								key={member.name}
								className="bg-off-white border border-dark-green/10 rounded-2xl p-5 shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 text-center flex flex-col items-center"
							>
								<div
									className={`w-16 h-16 rounded-full ${member.color} text-white flex items-center justify-center font-extrabold text-2xl mb-3 shadow-md`}
								>
									{member.avatar}
								</div>
								<h3 className="text-text-dark font-bold text-base leading-tight">
									{member.name}
								</h3>
								<p className="text-dark-green font-semibold text-xs mt-0.5 mb-3">
									{member.role}
								</p>
								<p className="text-text-gray text-xs leading-relaxed">
									{member.bio}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ───────────────────────────────────────────────── */}
			<section className="py-16 px-4 bg-gradient-to-br from-dark-green to-[#071e18]">
				<div className="max-w-xl mx-auto text-center">
					<h2 className="text-white font-extrabold text-2xl sm:text-3xl mb-3">
						Become part of the story.
					</h2>
					<p className="text-white/65 text-sm mb-7 max-w-md mx-auto">
						Join thousands of adventurers building their permanent
						record of exploration. Your Atlas is waiting.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Link
							to="/signup"
							className="inline-flex items-center gap-2 bg-light-green hover:bg-light-green-hover text-text-dark font-extrabold text-sm px-7 py-3.5 rounded-full no-underline shadow-[0_6px_24px_rgba(175,250,1,0.18)] transition-all hover:-translate-y-0.5"
						>
							Join Atlas Diary
						</Link>
						<Link
							to="/contact"
							className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold text-sm px-5 py-3.5 rounded-full no-underline border border-white/20 hover:border-white/40 transition-all"
						>
							Get in Touch
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
