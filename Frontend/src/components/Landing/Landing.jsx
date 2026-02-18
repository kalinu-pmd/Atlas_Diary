import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
	MdExplore,
	MdAutoStories,
	MdPeople,
	MdStar,
	MdCameraAlt,
	MdLocationOn,
	MdFavorite,
} from "react-icons/md";
import heroImage from "../../Images/heroSection.png";
import Footer from "../Footer/Footer";

const features = [
	{
		icon: <MdAutoStories size={32} className="text-light-green" />,
		title: "Document Every Journey",
		desc: "Write rich diary entries with photos, tags and descriptions. Your adventures deserve more than a fleeting post.",
	},
	{
		icon: <MdPeople size={32} className="text-light-green" />,
		title: "Share with the Community",
		desc: "Connect with fellow explorers. Like, comment and discover stories from travellers all over the world.",
	},
	{
		icon: <MdExplore size={32} className="text-light-green" />,
		title: "Discover New Places",
		desc: "Our smart recommendation engine learns your taste and surfaces adventures you'll love — before you even know to look.",
	},
	{
		icon: <MdStar size={32} className="text-light-green" />,
		title: "Personalised For You",
		desc: "The more you explore and engage, the smarter your feed becomes. Your Atlas, tailored to your world.",
	},
];

const steps = [
	{
		number: "01",
		icon: <MdCameraAlt size={28} className="text-dark-green" />,
		title: "Create Your Post",
		desc: "Upload your best shots, write about the moment and add tags so others can find your story.",
	},
	{
		number: "02",
		icon: <MdLocationOn size={28} className="text-dark-green" />,
		title: "Share Your Adventure",
		desc: "Publish to your public diary. The community can like, comment and bookmark your entries.",
	},
	{
		number: "03",
		icon: <MdFavorite size={28} className="text-dark-green" />,
		title: "Grow Your Atlas",
		desc: "Build a beautiful, searchable map of everywhere you've been. Your story, always with you.",
	},
];

const testimonials = [
	{
		name: "Sofia L.",
		location: "Bali & Portugal",
		quote: "Atlas Diary changed how I document my trips. It feels personal and beautiful — not just another social media app.",
		avatar: "S",
	},
	{
		name: "Marcus T.",
		location: "Patagonia Trek",
		quote: "The recommendation system found posts I'd never have discovered otherwise. I've been inspired to visit 3 new countries.",
		avatar: "M",
	},
	{
		name: "Priya K.",
		location: "Southeast Asia",
		quote: "Finally a place that treats travel diaries seriously. The community here is wonderful and genuinely adventurous.",
		avatar: "P",
	},
];

export default function Landing() {
	const user = useSelector((state) => state.auth.authData);

	return (
		<div className="flex flex-col min-h-screen bg-off-white">
			{/* ── Hero ──────────────────────────────────────────────────── */}
			<section
				role="banner"
				aria-label="Hero"
				className="relative w-full min-h-[540px] md:min-h-[480px] flex items-center justify-center bg-black"
				style={{
					backgroundImage: `linear-gradient(rgba(8,12,10,0.38), rgba(8,12,10,0.08)), url(${heroImage})`,
					backgroundSize: "cover",
					backgroundPosition: "center center",
					backgroundRepeat: "no-repeat",
				}}
			>
				{/* Gradient overlay */}
				<div
					aria-hidden
					className="absolute inset-0 z-[1] pointer-events-none"
					style={{
						background:
							"linear-gradient(180deg, rgba(6,12,8,0.52) 0%, rgba(6,12,8,0.18) 45%, rgba(6,12,8,0.06) 70%, transparent 100%)",
					}}
				/>

				<div className="relative z-[2] w-full max-w-7xl mx-auto px-6 pt-4 pb-20 flex justify-start">
					<div className="max-w-3xl text-white px-2 lg:px-6">
						{/* Badge */}
						<span className="inline-block bg-light-green/20 border border-light-green/40 text-light-green text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
							Adventure Social Platform
						</span>

						<h1
							className="font-extrabold leading-[1.03] tracking-tight text-white"
							style={{
								fontSize: "clamp(1.8rem, 5.5vw, 3.8rem)",
								textShadow: "0 18px 48px rgba(0,0,0,0.55)",
								marginBottom: "0.6rem",
							}}
						>
							Document Your Adventures.
							<br />
							<span className="text-light-green drop-shadow-[0_2px_8px_rgba(175,250,1,0.3)]">
								Relive Every Journey.
							</span>
						</h1>

						<p
							className="mt-3 mb-2 text-white/85 font-medium max-w-xl"
							style={{
								fontSize: "clamp(0.98rem, 1.6vw, 1.1rem)",
							}}
						>
							A travel diary made for real explorers — document,
							share and discover adventures from around the world.
						</p>

						{/* Stats row */}
						<div className="flex flex-wrap gap-5 mt-4 mb-7">
							{[
								{ value: "10k+", label: "Adventurers" },
								{ value: "50k+", label: "Posts Shared" },
								{ value: "120+", label: "Countries" },
							].map((stat) => (
								<div key={stat.label} className="flex flex-col">
									<span className="text-light-green font-extrabold text-xl leading-tight">
										{stat.value}
									</span>
									<span className="text-white/70 text-xs">
										{stat.label}
									</span>
								</div>
							))}
						</div>

						{/* CTAs */}
						<div
							role="group"
							aria-label="Primary actions"
							className="flex flex-wrap items-center gap-3"
						>
							{user ? (
								<RouterLink
									to="/posts"
									className="inline-flex items-center gap-2 bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-extrabold text-base px-6 py-3 rounded-full no-underline shadow-[0_12px_40px_rgba(47,107,79,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(47,107,79,0.28)]"
								>
									Go to Your Feed
								</RouterLink>
							) : (
								<RouterLink
									to="/signup"
									className="inline-flex items-center gap-2 bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-extrabold text-base px-6 py-3 rounded-full no-underline shadow-[0_12px_40px_rgba(47,107,79,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(47,107,79,0.28)]"
								>
									Start Your Journey &mdash; It&apos;s Free
								</RouterLink>
							)}

							<RouterLink
								to="/posts"
								className="inline-flex items-center gap-2 bg-[rgba(250,248,244,0.15)] hover:bg-[rgba(250,248,244,0.22)] text-white font-bold text-base px-5 py-3 rounded-full no-underline border border-white/30 transition-all backdrop-blur-sm hover:-translate-y-px"
							>
								Explore Public Diaries
							</RouterLink>
						</div>
					</div>
				</div>

				{/* Wave divider */}
				<div className="absolute bottom-0 left-0 right-0 z-[3]">
					<svg
						viewBox="0 0 1440 60"
						xmlns="http://www.w3.org/2000/svg"
						preserveAspectRatio="none"
						className="w-full h-10 block"
					>
						<path
							d="M0,40 C360,0 1080,80 1440,30 L1440,60 L0,60 Z"
							fill="#fef9f5"
						/>
					</svg>
				</div>
			</section>

			{/* ── Features ──────────────────────────────────────────────── */}
			<section
				aria-labelledby="features-heading"
				className="py-16 sm:py-12 px-4 bg-off-white"
			>
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<span className="text-dark-green font-bold text-xs uppercase tracking-widest">
							Why Atlas Diary
						</span>
						<h2
							id="features-heading"
							className="mt-2 text-3xl sm:text-2xl font-extrabold text-text-dark"
						>
							Everything a traveller needs
						</h2>
						<p className="mt-2 text-text-gray text-base max-w-xl mx-auto">
							Built around adventure. Designed for stories. Made
							for explorers.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{features.map((f) => (
							<div
								key={f.title}
								className="bg-off-white border border-dark-green/10 rounded-2xl p-6 shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group"
							>
								<div className="w-12 h-12 rounded-xl bg-dark-green/5 group-hover:bg-dark-green/10 flex items-center justify-center mb-4 transition-colors">
									{f.icon}
								</div>
								<h3 className="text-dark-green font-bold text-base mb-2">
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

			{/* ── How It Works ──────────────────────────────────────────── */}
			<section
				aria-labelledby="how-heading"
				className="py-16 sm:py-12 px-4 bg-gradient-to-b from-dark-green/5 to-off-white"
			>
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<span className="text-dark-green font-bold text-xs uppercase tracking-widest">
							Getting Started
						</span>
						<h2
							id="how-heading"
							className="mt-2 text-3xl sm:text-2xl font-extrabold text-text-dark"
						>
							Three steps to your Atlas
						</h2>
					</div>

					<div className="relative">
						{/* Connector line (desktop only) */}
						<div
							aria-hidden
							className="hidden md:block absolute top-10 left-[calc(16.7%+16px)] right-[calc(16.7%+16px)] h-0.5 bg-gradient-to-r from-light-green via-dark-green to-light-green opacity-30"
						/>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{steps.map((step, i) => (
								<div
									key={step.number}
									className="flex flex-col items-center text-center"
								>
									{/* Step circle */}
									<div className="relative w-20 h-20 rounded-full bg-off-white border-4 border-light-green shadow-card flex items-center justify-center mb-4 shrink-0">
										{step.icon}
										<span className="absolute -top-2 -right-2 w-6 h-6 bg-dark-green text-white text-xs font-extrabold rounded-full flex items-center justify-center">
											{i + 1}
										</span>
									</div>
									<h3 className="text-dark-green font-bold text-lg mb-2">
										{step.title}
									</h3>
									<p className="text-text-gray text-sm leading-relaxed max-w-xs">
										{step.desc}
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="mt-10 flex justify-center">
						<RouterLink
							to="/how-it-works"
							className="text-dark-green font-bold text-sm hover:text-accent-green transition-colors no-underline border-b-2 border-light-green pb-0.5"
						>
							Learn more about how it works →
						</RouterLink>
					</div>
				</div>
			</section>

			{/* ── Testimonials ──────────────────────────────────────────── */}
			<section
				aria-labelledby="testimonials-heading"
				className="py-16 sm:py-12 px-4 bg-off-white"
			>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<span className="text-dark-green font-bold text-xs uppercase tracking-widest">
							Community
						</span>
						<h2
							id="testimonials-heading"
							className="mt-2 text-3xl sm:text-2xl font-extrabold text-text-dark"
						>
							What explorers are saying
						</h2>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
						{testimonials.map((t) => (
							<div
								key={t.name}
								className="bg-off-white border border-dark-green/10 rounded-2xl p-6 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200"
							>
								<p className="text-text-dark text-sm italic leading-relaxed mb-5">
									&ldquo;{t.quote}&rdquo;
								</p>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-dark-green text-off-white flex items-center justify-center font-bold text-base shrink-0">
										{t.avatar}
									</div>
									<div>
										<p className="text-text-dark font-bold text-sm leading-tight">
											{t.name}
										</p>
										<p className="text-text-gray text-xs">
											{t.location}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Final CTA ─────────────────────────────────────────────── */}
			<section
				aria-labelledby="cta-heading"
				className="py-20 sm:py-14 px-4 bg-gradient-to-br from-dark-green to-[#071e18] relative overflow-hidden"
			>
				{/* Decorative circles */}
				<div
					aria-hidden
					className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-light-green/5 pointer-events-none"
				/>
				<div
					aria-hidden
					className="absolute -bottom-20 -left-12 w-48 h-48 rounded-full bg-light-green/5 pointer-events-none"
				/>

				<div className="relative max-w-2xl mx-auto text-center">
					<span className="inline-block bg-light-green/15 border border-light-green/30 text-light-green text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
						Join the Community
					</span>
					<h2
						id="cta-heading"
						className="text-3xl sm:text-2xl font-extrabold text-white mb-4"
					>
						Your memories deserve{" "}
						<span className="text-light-green">
							a permanent home.
						</span>
					</h2>
					<p className="text-white/70 text-base mb-8 max-w-lg mx-auto">
						Start your Atlas today. Every adventure you document
						becomes a chapter in a story that lasts forever.
					</p>

					<div className="flex flex-wrap items-center justify-center gap-4">
						{user ? (
							<RouterLink
								to="/posts"
								className="inline-flex items-center gap-2 bg-light-green hover:bg-light-green-hover text-text-dark font-extrabold text-base px-7 py-3.5 rounded-full no-underline shadow-[0_8px_32px_rgba(175,250,1,0.2)] transition-all hover:-translate-y-0.5"
							>
								Go to Your Feed
							</RouterLink>
						) : (
							<>
								<RouterLink
									to="/signup"
									className="inline-flex items-center gap-2 bg-light-green hover:bg-light-green-hover text-text-dark font-extrabold text-base px-7 py-3.5 rounded-full no-underline shadow-[0_8px_32px_rgba(175,250,1,0.2)] transition-all hover:-translate-y-0.5"
								>
									Create Free Account
								</RouterLink>
								<RouterLink
									to="/auth"
									className="inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold text-base px-5 py-3.5 rounded-full no-underline border border-white/20 hover:border-white/40 transition-all"
								>
									Already a member? Sign In
								</RouterLink>
							</>
						)}
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
