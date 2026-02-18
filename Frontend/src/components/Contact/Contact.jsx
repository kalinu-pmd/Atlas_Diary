import { useState } from "react";
import { Link } from "react-router-dom";
import {
	MdEmail,
	MdSend,
	MdCheckCircle,
	MdSupportAgent,
	MdAutoStories,
	MdBugReport,
	MdGroup,
} from "react-icons/md";
import Footer from "../Footer/Footer";

const topics = [
	{
		icon: <MdSupportAgent size={24} className="text-light-green" />,
		title: "General Support",
		desc: "Questions about using Atlas Diary, your account or any feature.",
	},
	{
		icon: <MdBugReport size={24} className="text-light-green" />,
		title: "Bug Report",
		desc: "Found something broken? Let us know and we'll fix it fast.",
	},
	{
		icon: <MdAutoStories size={24} className="text-light-green" />,
		title: "Feature Request",
		desc: "Have an idea that would make Atlas Diary better? We'd love to hear it.",
	},
	{
		icon: <MdGroup size={24} className="text-light-green" />,
		title: "Partnerships",
		desc: "Interested in collaborating, sponsorships or press inquiries.",
	},
];

export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [errors, setErrors] = useState({});
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const validate = () => {
		const newErrors = {};
		if (!formData.name.trim()) newErrors.name = "Name is required.";
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(formData.email))
			newErrors.email = "Valid email address is required.";
		if (!formData.subject.trim())
			newErrors.subject = "Subject is required.";
		if (formData.message.trim().length < 20)
			newErrors.message = "Message must be at least 20 characters.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		setErrors({ ...errors, [e.target.name]: "" });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validate()) return;
		setLoading(true);
		// Simulate a submission delay (no real backend endpoint for contact)
		setTimeout(() => {
			setLoading(false);
			setSubmitted(true);
		}, 1200);
	};

	const handleReset = () => {
		setFormData({ name: "", email: "", subject: "", message: "" });
		setErrors({});
		setSubmitted(false);
	};

	return (
		<div className="min-h-screen bg-off-white flex flex-col">
			{/* ── Hero ──────────────────────────────────────────────── */}
			<div className="bg-gradient-to-br from-dark-green via-[#0a2d26] to-[#071e18] py-16 sm:py-12 px-4 text-center">
				<span className="inline-block bg-light-green/15 border border-light-green/25 text-light-green text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
					Contact Us
				</span>
				<h1 className="text-white font-extrabold text-3xl sm:text-4xl mb-3">
					We&apos;d love to hear from you.
				</h1>
				<p className="text-white/65 text-base max-w-md mx-auto">
					Have a question, idea or issue? Drop us a message and
					we&apos;ll get back to you within 24 hours.
				</p>
			</div>

			{/* ── Topics ────────────────────────────────────────────── */}
			<section
				aria-labelledby="topics-heading"
				className="py-12 px-4 bg-off-white border-b border-dark-green/8"
			>
				<div className="max-w-5xl mx-auto">
					<h2
						id="topics-heading"
						className="text-center text-xl font-extrabold text-text-dark mb-8"
					>
						What can we help with?
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{topics.map((t) => (
							<div
								key={t.title}
								className="bg-off-white border border-dark-green/10 rounded-xl p-5 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200"
							>
								<div className="w-10 h-10 rounded-xl bg-dark-green flex items-center justify-center mb-3">
									{t.icon}
								</div>
								<h3 className="text-dark-green font-bold text-sm mb-1.5">
									{t.title}
								</h3>
								<p className="text-text-gray text-xs leading-relaxed">
									{t.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Contact form + info ────────────────────────────────── */}
			<section className="flex-1 py-14 px-4">
				<div className="max-w-5xl mx-auto">
					<div className="flex flex-col lg:flex-row gap-10">
						{/* ── Form ────────────────────────────────── */}
						<div className="flex-1">
							{submitted ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="w-20 h-20 rounded-full bg-light-green/15 flex items-center justify-center mb-5">
										<MdCheckCircle
											size={44}
											className="text-dark-green"
										/>
									</div>
									<h2 className="text-2xl font-extrabold text-text-dark mb-2">
										Message sent!
									</h2>
									<p className="text-text-gray text-sm max-w-sm mb-6">
										Thanks for reaching out,{" "}
										<strong className="text-dark-green">
											{formData.name}
										</strong>
										. We&apos;ll reply to{" "}
										<strong className="text-dark-green">
											{formData.email}
										</strong>{" "}
										within 24 hours.
									</p>
									<button
										onClick={handleReset}
										className="bg-dark-green hover:bg-dark-green-hover text-off-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
									>
										Send another message
									</button>
								</div>
							) : (
								<div className="bg-off-white border border-dark-green/10 rounded-2xl shadow-form p-7">
									<h2 className="text-text-dark font-extrabold text-xl mb-1">
										Send us a message
									</h2>
									<p className="text-text-gray text-sm mb-6">
										Fill in the form below and we&apos;ll
										get back to you promptly.
									</p>

									<form
										onSubmit={handleSubmit}
										noValidate
										className="flex flex-col gap-4"
									>
										{/* Name + Email row */}
										<div className="flex flex-col sm:flex-row gap-4">
											<div className="flex-1 flex flex-col gap-1">
												<label
													htmlFor="name"
													className="text-xs font-semibold text-dark-green"
												>
													Full Name{" "}
													<span className="text-orange">
														*
													</span>
												</label>
												<input
													id="name"
													name="name"
													value={formData.name}
													onChange={handleChange}
													placeholder="Jane Explorer"
													className={`w-full bg-off-white border rounded-lg px-3 py-2.5 text-sm text-text-dark outline-none transition-colors placeholder:text-text-gray ${
														errors.name
															? "border-orange focus:border-orange"
															: "border-dark-green focus:border-dark-green hover:border-light-green"
													}`}
												/>
												{errors.name && (
													<p className="text-orange text-xs mt-0.5">
														{errors.name}
													</p>
												)}
											</div>

											<div className="flex-1 flex flex-col gap-1">
												<label
													htmlFor="email"
													className="text-xs font-semibold text-dark-green"
												>
													Email Address{" "}
													<span className="text-orange">
														*
													</span>
												</label>
												<input
													id="email"
													name="email"
													type="email"
													value={formData.email}
													onChange={handleChange}
													placeholder="you@example.com"
													className={`w-full bg-off-white border rounded-lg px-3 py-2.5 text-sm text-text-dark outline-none transition-colors placeholder:text-text-gray ${
														errors.email
															? "border-orange focus:border-orange"
															: "border-dark-green focus:border-dark-green hover:border-light-green"
													}`}
												/>
												{errors.email && (
													<p className="text-orange text-xs mt-0.5">
														{errors.email}
													</p>
												)}
											</div>
										</div>

										{/* Subject */}
										<div className="flex flex-col gap-1">
											<label
												htmlFor="subject"
												className="text-xs font-semibold text-dark-green"
											>
												Subject{" "}
												<span className="text-orange">
													*
												</span>
											</label>
											<input
												id="subject"
												name="subject"
												value={formData.subject}
												onChange={handleChange}
												placeholder="How can we help?"
												className={`w-full bg-off-white border rounded-lg px-3 py-2.5 text-sm text-text-dark outline-none transition-colors placeholder:text-text-gray ${
													errors.subject
														? "border-orange focus:border-orange"
														: "border-dark-green focus:border-dark-green hover:border-light-green"
												}`}
											/>
											{errors.subject && (
												<p className="text-orange text-xs mt-0.5">
													{errors.subject}
												</p>
											)}
										</div>

										{/* Message */}
										<div className="flex flex-col gap-1">
											<label
												htmlFor="message"
												className="text-xs font-semibold text-dark-green"
											>
												Message{" "}
												<span className="text-orange">
													*
												</span>
											</label>
											<textarea
												id="message"
												name="message"
												rows={6}
												value={formData.message}
												onChange={handleChange}
												placeholder="Tell us more about your question or issue…"
												className={`w-full bg-off-white border rounded-lg px-3 py-2.5 text-sm text-text-dark outline-none transition-colors resize-y placeholder:text-text-gray ${
													errors.message
														? "border-orange focus:border-orange"
														: "border-dark-green focus:border-dark-green hover:border-light-green"
												}`}
											/>
											<div className="flex items-center justify-between">
												{errors.message ? (
													<p className="text-orange text-xs mt-0.5">
														{errors.message}
													</p>
												) : (
													<span />
												)}
												<p className="text-text-gray text-xs mt-0.5 ml-auto">
													{formData.message.length}{" "}
													chars
												</p>
											</div>
										</div>

										<button
											type="submit"
											disabled={loading}
											className="flex items-center justify-center gap-2 w-full bg-dark-green hover:bg-dark-green-hover disabled:opacity-60 disabled:cursor-not-allowed text-off-white font-bold py-3 rounded-xl text-sm transition-colors mt-1"
										>
											{loading ? (
												<>
													<div className="w-4 h-4 rounded-full border-2 border-off-white/40 border-t-off-white animate-spin" />
													Sending…
												</>
											) : (
												<>
													<MdSend size={17} />
													Send Message
												</>
											)}
										</button>
									</form>
								</div>
							)}
						</div>

						{/* ── Info sidebar ────────────────────────── */}
						<aside className="lg:w-72 xl:w-80 shrink-0 flex flex-col gap-5">
							{/* Email card */}
							<div className="bg-gradient-to-br from-dark-green to-[#0a2d26] rounded-2xl p-6 text-white shadow-card">
								<div className="w-10 h-10 rounded-xl bg-light-green/15 flex items-center justify-center mb-3">
									<MdEmail
										size={22}
										className="text-light-green"
									/>
								</div>
								<h3 className="font-bold text-base mb-1">
									Email Us Directly
								</h3>
								<p className="text-white/65 text-xs mb-3">
									Prefer to email? Write to us directly and
									we&apos;ll respond within one business day.
								</p>
								<a
									href="mailto:hello@atlasdiary.com"
									className="text-light-green font-bold text-sm hover:underline no-underline"
								>
									hello@atlasdiary.com
								</a>
							</div>

							{/* Response time */}
							<div className="bg-off-white border border-dark-green/10 rounded-2xl p-5 shadow-card">
								<h3 className="text-dark-green font-bold text-sm mb-3">
									Response Times
								</h3>
								<ul className="flex flex-col gap-2">
									{[
										{
											label: "General support",
											time: "Within 24 hours",
										},
										{
											label: "Bug reports",
											time: "Within 12 hours",
										},
										{
											label: "Partnerships",
											time: "Within 48 hours",
										},
										{
											label: "Press inquiries",
											time: "Within 24 hours",
										},
									].map((item) => (
										<li
											key={item.label}
											className="flex items-center justify-between text-xs"
										>
											<span className="text-text-gray">
												{item.label}
											</span>
											<span className="text-dark-green font-semibold bg-light-green/15 px-2 py-0.5 rounded-full">
												{item.time}
											</span>
										</li>
									))}
								</ul>
							</div>

							{/* Quick links */}
							<div className="bg-off-white border border-dark-green/10 rounded-2xl p-5 shadow-card">
								<h3 className="text-dark-green font-bold text-sm mb-3">
									Quick Links
								</h3>
								<ul className="flex flex-col gap-2">
									{[
										{
											label: "How It Works",
											to: "/how-it-works",
										},
										{ label: "About Us", to: "/about" },
										{
											label: "Privacy Policy",
											to: "/privacy",
										},
										{
											label: "Browse Diaries",
											to: "/public-diaries",
										},
									].map((link) => (
										<li key={link.label}>
											<Link
												to={link.to}
												className="text-accent-green font-semibold text-xs hover:underline no-underline"
											>
												{link.label} →
											</Link>
										</li>
									))}
								</ul>
							</div>
						</aside>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
