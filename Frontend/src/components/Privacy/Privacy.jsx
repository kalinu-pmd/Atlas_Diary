import { Link } from "react-router-dom";
import { MdShield, MdLock, MdVisibility, MdDelete } from "react-icons/md";
import Footer from "../Footer/Footer";

const sections = [
	{
		id: "information-we-collect",
		title: "1. Information We Collect",
		content: [
			{
				subtitle: "Account Information",
				text: "When you create an Atlas Diary account, we collect your name, email address and a securely hashed password. We do not store plain-text passwords.",
			},
			{
				subtitle: "Content You Create",
				text: "Posts, diary entries, photos, tags and comments you submit are stored on our servers so they can be displayed to you and the community.",
			},
			{
				subtitle: "Usage Data",
				text: "We track interactions such as post views, likes and comments to power our personalised recommendation engine. This data is tied to your account and is used solely to improve your experience.",
			},
			{
				subtitle: "Technical Data",
				text: "We may collect standard server logs including IP addresses, browser type and device information for security, debugging and performance purposes. This data is not sold or shared.",
			},
		],
	},
	{
		id: "how-we-use-information",
		title: "2. How We Use Your Information",
		content: [
			{
				subtitle: "To Operate the Platform",
				text: "Your account information is used to authenticate you, display your profile and attribute posts to your name.",
			},
			{
				subtitle: "To Personalise Your Experience",
				text: "Your interaction history (likes, views, comments) feeds our recommendation engine to surface posts and adventures you're most likely to enjoy.",
			},
			{
				subtitle: "To Communicate With You",
				text: "We may use your email address to send important account-related notifications. We do not send unsolicited marketing emails.",
			},
			{
				subtitle: "To Improve Atlas Diary",
				text: "Aggregated, anonymised usage data helps us understand which features are valuable so we can make Atlas Diary better for everyone.",
			},
		],
	},
	{
		id: "sharing-information",
		title: "3. Sharing Your Information",
		content: [
			{
				subtitle: "We Do Not Sell Your Data",
				text: "Atlas Diary does not sell, rent or trade your personal information to any third party for commercial purposes.",
			},
			{
				subtitle: "Public Content",
				text: "Posts, diary entries and comments you publish on Atlas Diary are visible to all users including guests browsing Public Diaries. Do not include sensitive personal details in public posts.",
			},
			{
				subtitle: "Service Providers",
				text: "We may share data with trusted infrastructure providers (e.g. cloud hosting, database services) solely to operate the platform. These providers are contractually bound to protect your data.",
			},
			{
				subtitle: "Legal Obligations",
				text: "We may disclose information if required by law, court order or to protect the rights and safety of our users and the public.",
			},
		],
	},
	{
		id: "data-retention",
		title: "4. Data Retention",
		content: [
			{
				subtitle: "Account Data",
				text: "We retain your account data for as long as your account is active. If you delete your account, your personal data will be removed within 30 days, except where we are required to retain it by law.",
			},
			{
				subtitle: "Content",
				text: "Posts and diary entries you delete are removed immediately from public view. Residual copies may remain in backups for up to 90 days before being permanently purged.",
			},
			{
				subtitle: "Recommendation Data",
				text: "Interaction data (likes, views, comments) used for recommendations is retained as long as your account exists and is deleted upon account deletion.",
			},
		],
	},
	{
		id: "your-rights",
		title: "5. Your Rights",
		content: [
			{
				subtitle: "Access & Portability",
				text: "You have the right to access the personal data we hold about you. Contact us at privacy@atlasdiary.com to request a copy of your data.",
			},
			{
				subtitle: "Correction",
				text: "You can update your name and email at any time through your account settings. If you notice inaccuracies in other data, contact us and we will correct them promptly.",
			},
			{
				subtitle: "Deletion",
				text: "You may request deletion of your account and all associated personal data at any time. Send a deletion request to privacy@atlasdiary.com and we will process it within 30 days.",
			},
			{
				subtitle: "Objection & Restriction",
				text: "You have the right to object to or restrict certain processing of your data, including the use of your interaction history for recommendations. To opt out, contact us directly.",
			},
		],
	},
	{
		id: "cookies",
		title: "6. Cookies & Local Storage",
		content: [
			{
				subtitle: "Authentication",
				text: "Atlas Diary stores your authentication token in your browser's local storage to keep you logged in between sessions. This is strictly necessary for the platform to function.",
			},
			{
				subtitle: "No Tracking Cookies",
				text: "We do not use third-party tracking cookies, advertising cookies or cross-site analytics. Your browsing behaviour is not shared with advertisers.",
			},
			{
				subtitle: "Managing Storage",
				text: "You can clear your browser's local storage at any time to log out of Atlas Diary. This will not delete your account or any of your published content.",
			},
		],
	},
	{
		id: "security",
		title: "7. Security",
		content: [
			{
				subtitle: "Encryption",
				text: "All data transmitted between your browser and our servers is encrypted using HTTPS/TLS. Passwords are hashed with bcrypt before storage — we never store plain-text passwords.",
			},
			{
				subtitle: "Access Controls",
				text: "Access to user data is restricted to authorised personnel on a strict need-to-know basis. Administrative actions require authentication and are logged.",
			},
			{
				subtitle: "Incident Response",
				text: "In the event of a data breach that affects your personal information, we will notify you via email within 72 hours of becoming aware of the incident.",
			},
		],
	},
	{
		id: "children",
		title: "8. Children's Privacy",
		content: [
			{
				subtitle: "Age Requirement",
				text: "Atlas Diary is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has created an account, please contact us immediately and we will delete it.",
			},
		],
	},
	{
		id: "changes",
		title: "9. Changes to This Policy",
		content: [
			{
				subtitle: "Updates",
				text: "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of significant changes by email or by displaying a prominent notice on the platform. The 'Last Updated' date at the top of this page reflects the most recent revision.",
			},
			{
				subtitle: "Continued Use",
				text: "By continuing to use Atlas Diary after a policy update, you accept the revised terms. If you do not agree, you may delete your account at any time.",
			},
		],
	},
	{
		id: "contact",
		title: "10. Contact Us",
		content: [
			{
				subtitle: "Privacy Enquiries",
				text: "For any privacy-related questions, data access requests or deletion requests, please contact our privacy team at privacy@atlasdiary.com. We aim to respond within 5 business days.",
			},
			{
				subtitle: "General Contact",
				text: "For general questions about Atlas Diary, visit our Contact page or email hello@atlasdiary.com.",
			},
		],
	},
];

const highlights = [
	{
		icon: <MdShield size={28} className="text-light-green" />,
		title: "Your data is safe",
		desc: "All passwords are hashed. All data is encrypted in transit. No plain-text secrets — ever.",
	},
	{
		icon: <MdLock size={28} className="text-light-green" />,
		title: "We don't sell your data",
		desc: "Your personal information is never sold, rented or traded to third parties for any reason.",
	},
	{
		icon: <MdVisibility size={28} className="text-light-green" />,
		title: "You control what's public",
		desc: "Only content you explicitly publish is visible to others. Your account details stay private.",
	},
	{
		icon: <MdDelete size={28} className="text-light-green" />,
		title: "Delete anytime",
		desc: "Request full deletion of your account and all data at any time. No questions asked.",
	},
];

export default function Privacy() {
	return (
		<div className="min-h-screen bg-off-white flex flex-col">
			{/* ── Hero ──────────────────────────────────────────────── */}
			<div className="bg-gradient-to-br from-dark-green via-[#0a2d26] to-[#071e18] py-16 sm:py-12 px-4 text-center">
				<span className="inline-block bg-light-green/15 border border-light-green/25 text-light-green text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
					Privacy Policy
				</span>
				<h1 className="text-white font-extrabold text-3xl sm:text-4xl mb-3 max-w-2xl mx-auto">
					Your privacy matters to us.
				</h1>
				<p className="text-white/65 text-base max-w-lg mx-auto mb-4">
					We believe in total transparency. Here is everything you
					need to know about how Atlas Diary collects, uses and
					protects your personal information.
				</p>
				<p className="text-white/40 text-xs">
					Last updated: 1 January 2025
				</p>
			</div>

			{/* ── Highlights ────────────────────────────────────────── */}
			<section
				aria-labelledby="highlights-heading"
				className="py-10 px-4 border-b border-dark-green/8 bg-off-white"
			>
				<div className="max-w-5xl mx-auto">
					<h2 id="highlights-heading" className="sr-only">
						Privacy highlights
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
						{highlights.map((h) => (
							<div
								key={h.title}
								className="flex flex-col items-start bg-off-white border border-dark-green/10 rounded-xl p-5 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200"
							>
								<div className="w-11 h-11 rounded-xl bg-dark-green flex items-center justify-center mb-3">
									{h.icon}
								</div>
								<h3 className="text-dark-green font-bold text-sm mb-1">
									{h.title}
								</h3>
								<p className="text-text-gray text-xs leading-relaxed">
									{h.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Main content ──────────────────────────────────────── */}
			<main className="flex-1 py-14 px-4">
				<div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
					{/* ── Table of contents (sticky sidebar) ─── */}
					<aside className="lg:w-56 xl:w-64 shrink-0 hidden lg:block">
						<div className="sticky top-24 bg-off-white border border-dark-green/10 rounded-2xl p-5 shadow-card">
							<h2 className="text-dark-green font-bold text-sm mb-4 uppercase tracking-wide">
								Contents
							</h2>
							<nav aria-label="Policy sections">
								<ul className="flex flex-col gap-1.5">
									{sections.map((s) => (
										<li key={s.id}>
											<a
												href={`#${s.id}`}
												className="text-text-gray hover:text-dark-green text-xs font-medium leading-snug transition-colors no-underline hover:underline block py-0.5"
											>
												{s.title}
											</a>
										</li>
									))}
								</ul>
							</nav>
						</div>
					</aside>

					{/* ── Policy sections ───────────────────────── */}
					<div className="flex-1 min-w-0 flex flex-col gap-10">
						{/* Intro */}
						<div className="bg-light-green/10 border border-light-green/30 rounded-2xl p-6">
							<p className="text-dark-green font-semibold text-sm leading-relaxed">
								This Privacy Policy describes how Atlas Diary
								(&ldquo;we&rdquo;, &ldquo;us&rdquo;,
								&ldquo;our&rdquo;) collects, uses and protects
								information about you when you use our platform
								at{" "}
								<span className="font-bold">
									atlasdiary.com
								</span>
								. By using Atlas Diary, you agree to the
								practices described in this policy. If you do
								not agree, please do not use our service.
							</p>
						</div>

						{sections.map((section) => (
							<section
								key={section.id}
								id={section.id}
								aria-labelledby={`heading-${section.id}`}
								className="scroll-mt-24"
							>
								<h2
									id={`heading-${section.id}`}
									className="text-text-dark font-extrabold text-xl mb-5 pb-2 border-b-2 border-light-green/40"
								>
									{section.title}
								</h2>

								<div className="flex flex-col gap-5">
									{section.content.map((item) => (
										<div key={item.subtitle}>
											<h3 className="text-dark-green font-bold text-sm mb-1.5">
												{item.subtitle}
											</h3>
											<p className="text-text-gray text-sm leading-relaxed">
												{item.text}
											</p>
										</div>
									))}
								</div>
							</section>
						))}

						{/* Contact block at the end */}
						<div className="bg-gradient-to-br from-dark-green to-[#0a2d26] rounded-2xl p-7 text-white">
							<h2 className="font-extrabold text-xl mb-2">
								Questions about this policy?
							</h2>
							<p className="text-white/65 text-sm mb-5 max-w-md">
								Our team is happy to explain anything in plain
								language. Reach out and we&apos;ll get back to
								you within one business day.
							</p>
							<div className="flex flex-wrap items-center gap-3">
								<Link
									to="/contact"
									className="inline-flex items-center gap-2 bg-light-green hover:bg-light-green-hover text-text-dark font-bold text-sm px-5 py-2.5 rounded-full no-underline transition-all hover:-translate-y-0.5"
								>
									Contact Us
								</Link>
								<a
									href="mailto:privacy@atlasdiary.com"
									className="inline-flex items-center gap-2 text-white/75 hover:text-white font-semibold text-sm px-4 py-2.5 rounded-full border border-white/20 hover:border-white/40 no-underline transition-all"
								>
									privacy@atlasdiary.com
								</a>
							</div>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
