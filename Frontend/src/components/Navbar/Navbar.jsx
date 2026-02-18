import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import decode from "jwt-decode";
import { toast } from "react-toastify";
import { MdMenu, MdClose } from "react-icons/md";

import { LOGOUT } from "../../constants/actionTypes";
import logo from "../../Images/logo.svg";

const navItems = [
	{ label: "Explore", to: "/explore" },
	{ label: "How it Works", to: "/how-it-works" },
	{ label: "Public Diaries", to: "/public-diaries" },
];

function Navbar() {
	const user = useSelector((state) => state.auth.authData);
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();

	const [mobileOpen, setMobileOpen] = useState(false);

	const logout = useCallback(() => {
		dispatch({ type: LOGOUT });
		toast.success("Logged out successfully!");
		history.push("/");
	}, [dispatch, history]);

	useEffect(() => {
		const token = user?.token;
		if (token) {
			const decodedToken = decode(token);
			if (decodedToken.exp * 1000 < new Date().getTime()) {
				logout();
			}
		}
	}, [location, user?.token, logout]);

	const toggleMobile = () => setMobileOpen((s) => !s);

	return (
		<header
			className="fixed top-0 left-0 right-0 z-[1300] bg-cream shadow-nav border-b border-accent-green/10"
			style={{ minHeight: 64 }}
		>
			<div className="max-w-[1100px] mx-auto px-5 h-16 flex items-center justify-between relative">
				{/* Brand (left) */}
				<Link
					to="/"
					aria-label="Atlas Diary"
					className="flex items-center shrink-0 transition-opacity hover:opacity-90"
				>
					<img
						src={logo}
						alt="Atlas Diary"
						className="h-10 w-auto block"
					/>
				</Link>

				{/* Center navigation (desktop only) */}
				<nav
					aria-label="Primary navigation"
					className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-7 items-center"
				>
					{navItems.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="no-underline text-muted font-semibold px-2.5 py-2 rounded-lg transition-colors hover:bg-accent-green/10 hover:text-accent-green"
						>
							{item.label}
						</Link>
					))}
				</nav>

				{/* Right side */}
				<div className="flex items-center gap-3 ml-auto">
					{/* Mobile hamburger */}
					<button
						className="md:hidden text-accent-green p-1 rounded"
						aria-label={mobileOpen ? "Close menu" : "Open menu"}
						onClick={toggleMobile}
					>
						{mobileOpen ? (
							<MdClose size={24} />
						) : (
							<MdMenu size={24} />
						)}
					</button>

					{user ? (
						<div className="flex items-center gap-3">
							{/* Admin dashboard link */}
							{user.result.isAdmin && (
								<Link
									to="/dashboard"
									className="hidden md:inline-flex text-accent-green font-extrabold text-sm px-3 py-1.5 rounded hover:bg-accent-green/10 transition-colors no-underline"
								>
									Dashboard
								</Link>
							)}

							{/* For You */}
							<Link
								to="/recommendations"
								className="hidden sm:inline-flex items-center border border-accent-green text-accent-green font-bold text-sm px-4 py-1.5 rounded-full hover:bg-[#eef7ef] hover:text-[#1f4f3f] transition-all no-underline"
							>
								For You
							</Link>

							{/* Avatar */}
							<div className="flex items-center gap-3">
								<div
									className="w-9 h-9 rounded-full bg-accent-green text-white flex items-center justify-center font-semibold text-base cursor-pointer select-none overflow-hidden shrink-0 transition-transform hover:scale-105"
									title={user.result.name}
								>
									{user.result.imageUrl ? (
										<img
											src={user.result.imageUrl}
											alt={user.result.name}
											className="w-full h-full object-cover"
										/>
									) : (
										user.result.name
											?.charAt(0)
											.toUpperCase()
									)}
								</div>

								<span className="hidden lg:block text-text-dark font-medium max-w-[120px] truncate text-sm">
									{user.result.name}
								</span>

								<button
									onClick={logout}
									className="bg-orange text-white font-bold text-sm px-4 py-1.5 rounded-full hover:bg-orange-hover transition-all whitespace-nowrap"
								>
									Logout
								</button>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<Link
								to="/auth"
								className="text-muted font-semibold text-sm px-2 py-1.5 hover:text-accent-green transition-colors no-underline"
							>
								Login
							</Link>
							<Link
								to="/signup"
								className="bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-bold text-sm px-4 py-2 rounded-full shadow-md hover:brightness-95 transition-all no-underline"
							>
								Sign Up
							</Link>
						</div>
					)}
				</div>
			</div>

			{/* Mobile dropdown */}
			{mobileOpen && (
				<div
					role="menu"
					aria-label="Mobile navigation"
					className="md:hidden absolute top-16 left-2 right-2 bg-cream rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex flex-col gap-2 p-3 z-[1200]"
				>
					{navItems.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							onClick={() => setMobileOpen(false)}
							className="px-3 py-2.5 rounded-lg no-underline text-accent-green font-semibold hover:bg-accent-green/10 transition-colors"
						>
							{item.label}
						</Link>
					))}

					{user ? (
						<button
							onClick={() => {
								setMobileOpen(false);
								logout();
							}}
							className="mt-2 w-full bg-orange text-white font-bold py-2 rounded-lg hover:bg-orange-hover transition-colors"
						>
							Logout
						</button>
					) : (
						<div className="flex gap-2 mt-2">
							<Link
								to="/auth"
								onClick={() => setMobileOpen(false)}
								className="flex-1 text-center text-accent-green font-semibold py-2 rounded-lg border border-accent-green/30 hover:bg-accent-green/10 transition-colors no-underline"
							>
								Login
							</Link>
							<Link
								to="/signup"
								onClick={() => setMobileOpen(false)}
								className="flex-1 text-center bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-bold py-2 rounded-lg no-underline hover:brightness-95 transition-all"
							>
								Sign Up
							</Link>
						</div>
					)}
				</div>
			)}
		</header>
	);
}

export default Navbar;
