import heroImage from "../../Images/heroSection.png";
import { Link as RouterLink } from "react-router-dom";

export default function Hero() {
	return (
		<section
			role="banner"
			aria-label="Hero"
			className="relative w-full min-h-[500px] md:min-h-[440px] sm:min-h-[340px] flex items-center justify-center bg-black"
			style={{
				backgroundImage: `linear-gradient(rgba(8,12,10,0.36), rgba(8,12,10,0.06)), url(${heroImage})`,
				backgroundSize: "cover",
				backgroundPosition: "center center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Overlay */}
			<div
				aria-hidden
				className="absolute inset-0 z-[1] pointer-events-none"
				style={{
					background:
						"linear-gradient(180deg, rgba(6,12,8,0.48) 0%, rgba(6,12,8,0.18) 40%, rgba(6,12,8,0.06) 70%, rgba(6,12,8,0.00) 100%)",
				}}
			/>

			{/* Inner container */}
			<div className="relative z-[2] w-full max-w-7xl mx-auto px-6 pt-4 pb-16 flex justify-start">
				<div className="max-w-3xl text-white px-4 lg:px-6">
					{/* Headline */}
					<h1
						className="m-0 font-extrabold leading-[1.03] tracking-tight text-white"
						style={{
							fontSize: "clamp(1.6rem, 5vw, 3.6rem)",
							textShadow: "0 18px 48px rgba(0,0,0,0.5)",
							marginBottom: "0.5rem",
						}}
					>
						Document Your Adventures.
						<br />
						Relive Every Journey.
					</h1>

					{/* Lead */}
					<p
						className="mt-2 mb-3 text-white/90 font-medium max-w-2xl"
						style={{ fontSize: "clamp(0.98rem, 1.5vw, 1rem)" }}
					>
						A travel journal made for explorers — clear, focused and
						beautiful.
					</p>

					{/* CTA group */}
					<div
						role="group"
						aria-label="Primary actions"
						className="flex flex-wrap items-center gap-4 mt-6 xs:flex-col xs:w-full"
					>
						<RouterLink
							to="/signup"
							aria-label="Start your journey"
							className="inline-flex items-center justify-center bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-extrabold text-base px-6 py-3 rounded-full no-underline shadow-[0_12px_40px_rgba(47,107,79,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(47,107,79,0.22)]"
						>
							Start Your Journey
						</RouterLink>

						<RouterLink
							to="/public-diaries"
							aria-label="Explore public diaries"
							className="inline-flex items-center justify-center bg-[#f2efe6] text-[#274b3f] font-bold text-base px-5 py-3 rounded-full no-underline border border-[rgba(39,75,63,0.08)] transition-all hover:bg-[#efece1] hover:-translate-y-px"
						>
							Explore Public Diaries
						</RouterLink>
					</div>
				</div>
			</div>
		</section>
	);
}
