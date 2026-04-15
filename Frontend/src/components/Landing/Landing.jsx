import { Link as RouterLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
	MdExplore,
	MdAutoStories,
	MdPeople,
	MdStar,
	MdCameraAlt,
	MdLocationOn,
	MdFavorite,
	MdSupportAgent,
	MdEmail,
	MdArrowForward,
} from "react-icons/md";
import heroImage from "../../Images/heroSection.png";
import Footer from "../Footer/Footer";
import { fetchPublicPostStats } from "../../api";

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
	const [heroStats, setHeroStats] = useState({
		totalPlaces: 0,
		totalUsers: 0,
		totalCountries: 0,
	});

	useEffect(() => {
		let mounted = true;

		if (typeof window !== "undefined") {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}

		const loadStats = async () => {
			try {
				const { data } = await fetchPublicPostStats();
				if (!mounted) return;
				setHeroStats({
					totalPlaces: Number(data?.totalPlaces || 0),
					totalUsers: Number(data?.totalUsers || 0),
					totalCountries: Number(data?.totalCountries || 0),
				});
			} catch (_error) {
				if (!mounted) return;
				setHeroStats({ totalPlaces: 0, totalUsers: 0, totalCountries: 0 });
			}
		};

		loadStats();
		const refreshId = setInterval(loadStats, 30000);

		return () => {
			mounted = false;
			clearInterval(refreshId);
		};
	}, []);

	const stats = useMemo(
		() => [
			{ value: heroStats.totalPlaces.toLocaleString(), label: "Total Places" },
			{ value: heroStats.totalUsers.toLocaleString(), label: "Total Users" },
			{
				value: heroStats.totalCountries.toLocaleString(),
				label: "Total Countries",
			},
		],
		[heroStats],
	);

	return (
		<div className="flex flex-col min-h-screen bg-off-white">
			<style>{`
				@keyframes heroFadeUp {
					from { opacity: 0; transform: translateY(18px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes heroGlowPulse {
					0%, 100% { transform: scale(1); opacity: 0.65; }
					50% { transform: scale(1.08); opacity: 1; }
				}
				@keyframes heroFloat {
					0%, 100% { transform: translateY(0px); }
					50% { transform: translateY(-10px); }
				}
				@keyframes ambientDriftA {
					0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
					50% { transform: translate3d(28px, -22px, 0) scale(1.08); }
				}
				@keyframes ambientDriftB {
					0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
					50% { transform: translate3d(-24px, 26px, 0) scale(1.05); }
				}
			`}</style>

			<div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
				<div
					className="absolute -top-24 -left-20 w-[360px] h-[360px] rounded-full blur-3xl"
					style={{
						background: "radial-gradient(circle at 30% 30%, rgba(175,250,1,0.16), rgba(175,250,1,0.02) 70%)",
						animation: "ambientDriftA 18s ease-in-out infinite",
					}}
				/>
				<div
					className="absolute top-[35%] -right-24 w-[420px] h-[420px] rounded-full blur-3xl"
					style={{
						background: "radial-gradient(circle at 40% 40%, rgba(47,107,79,0.18), rgba(47,107,79,0.03) 72%)",
						animation: "ambientDriftB 22s ease-in-out infinite",
					}}
				/>
				<div
					className="absolute -bottom-24 left-[18%] w-[380px] h-[380px] rounded-full blur-3xl"
					style={{
						background: "radial-gradient(circle at 45% 45%, rgba(12,52,44,0.12), rgba(12,52,44,0.02) 72%)",
						animation: "ambientDriftA 24s ease-in-out 1.2s infinite",
					}}
				/>
			</div>

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
				<div
					aria-hidden
					className="absolute top-14 right-10 w-32 h-32 rounded-full bg-light-green/10 blur-3xl z-[1]"
					style={{ animation: "heroGlowPulse 4s ease-in-out infinite" }}
				/>
				<div
					aria-hidden
					className="absolute bottom-14 right-[12%] w-24 h-24 rounded-full bg-white/10 blur-2xl z-[1]"
					style={{ animation: "heroFloat 6s ease-in-out infinite" }}
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
								animation: "heroFadeUp 0.85s ease both",
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
								animation: "heroFadeUp 0.85s ease 0.12s both",
							}}
						>
							A travel diary made for real explorers — document,
							share and discover adventures from around the world.
						</p>

						{/* Stats row */}
						<div className="flex flex-wrap gap-5 mt-4 mb-7">
							{stats.map((stat, index) => (
								<div
									key={stat.label}
									className="flex flex-col"
									style={{ animation: `heroFadeUp 0.7s ease ${0.08 * index}s both` }}
								>
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
								<>
									{/* Logged-in: highlight Public Diaries as the main CTA */}
									<RouterLink
										to="/posts"
										className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-light-green via-[#c6ff3a] to-[#aef501] text-dark-green font-black text-base px-7 py-3.5 rounded-full no-underline shadow-[0_18px_50px_rgba(175,250,1,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_62px_rgba(175,250,1,0.34)] hover:brightness-110 border border-white/20 overflow-hidden"
										style={{ animation: "heroFadeUp 0.85s ease 0.2s both" }}
									>
										<span className="pointer-events-none absolute inset-0 rounded-full border-2 border-dark-green/0 scale-100 transition-all duration-300 group-hover:scale-[1.04] group-hover:border-dark-green/35" />
										<span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-dark-green/45 to-transparent transform -skew-x-12 transition-transform duration-700 group-hover:translate-x-[330%]" />
										<span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/85 to-transparent transform -skew-x-12 transition-transform duration-500 delay-75 group-hover:translate-x-[390%]" />
										<span className="relative z-[1]">Explore Public Diaries</span>
										<span className="relative z-[1] transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-110">
											<MdArrowForward size={18} />
										</span>
									</RouterLink>

									<RouterLink
										to="/recommendations"
										className="group relative inline-flex items-center gap-2 bg-white/12 hover:bg-white/24 text-white font-semibold text-sm px-5 py-3 rounded-full no-underline border border-white/25 transition-all backdrop-blur-sm hover:-translate-y-px overflow-hidden"
										style={{ animation: "heroFadeUp 0.85s ease 0.28s both" }}
									>
										<span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent transform -skew-x-12 transition-transform duration-600 group-hover:translate-x-[360%]" />
										<span className="relative z-[1]">For You</span>
										<span className="relative z-[1] transition-transform duration-300 group-hover:translate-x-1">
											<MdArrowForward size={16} />
										</span>
									</RouterLink>
								</>
							) : (
								<>
									<RouterLink
										to="/signup"
										className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-light-green via-[#c6ff3a] to-[#aef501] text-dark-green font-black text-base px-7 py-3.5 rounded-full no-underline shadow-[0_18px_50px_rgba(175,250,1,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_62px_rgba(175,250,1,0.34)] hover:brightness-110 border border-white/20 overflow-hidden"
										style={{ animation: "heroFadeUp 0.85s ease 0.2s both" }}
									>
										<span className="pointer-events-none absolute inset-0 rounded-full border-2 border-dark-green/0 scale-100 transition-all duration-300 group-hover:scale-[1.04] group-hover:border-dark-green/35" />
										<span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-dark-green/45 to-transparent transform -skew-x-12 transition-transform duration-700 group-hover:translate-x-[330%]" />
										<span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/85 to-transparent transform -skew-x-12 transition-transform duration-500 delay-75 group-hover:translate-x-[390%]" />
										<span className="relative z-[1]">Start Your Journey &mdash; It&apos;s Free</span>
										<span className="relative z-[1] transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-110">
											<MdArrowForward size={18} />
										</span>
									</RouterLink>

									<RouterLink
										to="/posts"
										className="inline-flex items-center gap-2 bg-white/12 hover:bg-white/20 text-white font-semibold text-base px-5 py-3 rounded-full no-underline border border-white/25 transition-all backdrop-blur-sm hover:-translate-y-px"
										style={{ animation: "heroFadeUp 0.85s ease 0.28s both" }}
									>
										Explore Public Diaries
										<MdArrowForward size={18} />
									</RouterLink>
								</>
							)}
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
				className="py-16 sm:py-12 px-4"
				style={{
					background:
						"radial-gradient(circle at 12% 6%, rgba(175,250,1,0.08), transparent 42%), radial-gradient(circle at 88% 16%, rgba(47,107,79,0.09), transparent 36%), #fef9f5",
				}}
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
				className="py-16 sm:py-12 px-4"
				style={{
					background:
						"linear-gradient(180deg, rgba(12,52,44,0.06) 0%, rgba(254,249,245,1) 62%), radial-gradient(circle at 82% 82%, rgba(175,250,1,0.08), transparent 34%)",
				}}
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
				className="py-16 sm:py-12 px-4"
				style={{
					background:
						"radial-gradient(circle at 14% 82%, rgba(47,107,79,0.08), transparent 34%), radial-gradient(circle at 88% 20%, rgba(175,250,1,0.08), transparent 36%), #fef9f5",
				}}
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

			{/* ── Contact CTA ───────────────────────────────────────────── */}
			<section
				aria-labelledby="contact-cta-heading"
				className="py-14 sm:py-12 px-4"
				style={{
					background:
						"linear-gradient(180deg, rgba(12,52,44,0.07) 0%, rgba(254,249,245,1) 100%), radial-gradient(circle at 78% 22%, rgba(175,250,1,0.12), transparent 38%)",
				}}
			>
				<div className="max-w-5xl mx-auto">
					<div className="bg-off-white border border-dark-green/15 rounded-3xl p-7 sm:p-10 shadow-card">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
							<div className="max-w-2xl">
								<span className="inline-flex items-center gap-2 bg-light-green/20 border border-light-green/40 text-dark-green text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
									<MdSupportAgent size={14} />
									Need help?
								</span>
								<h2
									id="contact-cta-heading"
									className="text-2xl sm:text-xl font-extrabold text-text-dark mb-2"
								>
									Questions, feedback, or partnership ideas?
								</h2>
								<p className="text-text-gray text-sm sm:text-base leading-relaxed">
									Our team reads every message. Reach out anytime and we will
									get back to you as quickly as possible.
								</p>
							</div>

							<div className="flex flex-col md:flex-row gap-3 md:justify-end md:items-center">
								<RouterLink
									to="/contact"
									className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-dark-green hover:bg-dark-green-hover text-off-white font-bold text-sm px-6 py-3 rounded-full no-underline transition-all hover:-translate-y-0.5"
								>
									Contact Us
									<MdArrowForward size={16} />
								</RouterLink>
								<a
									href="mailto:hello@atlasdiary.com"
									className="inline-flex items-center justify-center gap-2 whitespace-nowrap border border-dark-green/25 text-dark-green font-semibold text-sm px-6 py-3 rounded-full no-underline hover:bg-light-green/15 transition-colors"
								>
									<MdEmail size={16} />
									hello@atlasdiary.com
								</a>
							</div>
						</div>
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
