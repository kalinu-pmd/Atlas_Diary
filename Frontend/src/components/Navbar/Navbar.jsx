import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import decode from "jwt-decode";
import { toast } from "react-toastify";
import { MdMenu, MdClose, MdAdd, MdSettings, MdExitToApp, MdNotifications, MdDashboard } from "react-icons/md";

import { LOGOUT } from "../../constants/actionTypes";
import logo from "../../Images/logo.svg";
import {
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	clearAllNotifications,
} from "../../actions/notifications";

const navItems = [
	{ label: "Public Diaries", to: "/posts" },
	{ label: "How it Works", to: "/how-it-works" },
];

function Navbar() {
	const user = useSelector((state) => state.auth.authData);
	const notificationsState = useSelector((state) => state.notifications);
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();

	const [mobileOpen, setMobileOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const menuRef = useRef(null);
	const notificationsRef = useRef(null);
	const profileImage = user?.result?.profileImage || user?.result?.imageUrl || null;

	const logout = useCallback(() => {
		dispatch({ type: LOGOUT });
		toast.success("Logged out successfully!");
		history.push("/");
	}, [dispatch, history]);

	useEffect(() => {
		const token = user?.token;
		if (token) {
			try {
				const decodedToken = decode(token);
				if (decodedToken.exp * 1000 < new Date().getTime()) {
					logout();
				}
			} catch (e) {}
		}
		setUserMenuOpen(false);
	}, [location, user?.token, logout]);

	// Periodically refresh notifications for logged-in users so the bell updates in near real time
	useEffect(() => {
		if (!user?.token) return;

		// Initial fetch
		dispatch(getNotifications());

		const intervalId = setInterval(() => {
			// Optional: only poll when tab is visible
			if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
			dispatch(getNotifications());
		}, 7000); // every 7 seconds (local DB)

		return () => clearInterval(intervalId);
	}, [dispatch, user?.token]);

	useEffect(() => {
		function handleOutside(e) {
			if (userMenuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
				setUserMenuOpen(false);
			}
			if (notificationsOpen && notificationsRef.current && !notificationsRef.current.contains(e.target)) {
				setNotificationsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, [userMenuOpen, notificationsOpen]);

	const toggleMobile = () => setMobileOpen((s) => !s);

	const toggleNotifications = () => {
		setNotificationsOpen((open) => {
			const next = !open;
			if (next && user && !notificationsState.loaded) {
				dispatch(getNotifications());
			}
			// When opening the notifications panel, mark all as read so the badge goes away
			if (next && user && notificationsState.unreadCount > 0) {
				dispatch(markAllNotificationsAsRead());
			}
			return next;
		});
	};

	const goToOwnProfile = () => {
		const userId = user?.result?._id || user?.result?.googleId;
		if (!userId) return;
		setUserMenuOpen(false);
		history.push(`/profile/${userId}`);
	};

	// Simple auth controls variable (keeps JSX tidy)
	const authControls = user ? (
		<div className="flex items-center gap-3">
			<Link to="/create-post" className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-extrabold text-sm px-4 py-2 rounded-full shadow-[0_8px_30px_rgba(47,107,79,0.12)] hover:-translate-y-0.5 transition-transform no-underline whitespace-nowrap">
				<MdAdd size={16} />
				<span>Post</span>
			</Link>

					<Link to="/recommendations" className="hidden sm:inline-flex items-center gap-2 border border-accent-green/50 bg-accent-green/10 text-accent-green font-black text-sm px-4 py-2 rounded-full hover:bg-accent-green/15 hover:text-[#1f4f3f] transition-all no-underline whitespace-nowrap shadow-[0_8px_22px_rgba(47,107,79,0.08)] hover:-translate-y-0.5">For You</Link>

			{/* Notifications bell */}
			<div ref={notificationsRef} className="relative hidden sm:flex">
				<button
					type="button"
					aria-label="Notifications"
					onClick={toggleNotifications}
					className="relative w-9 h-9 flex items-center justify-center rounded-full border border-accent-green/40 text-accent-green hover:bg-accent-green/10 transition-colors"
				>
					<MdNotifications size={18} />
					{notificationsState.unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 bg-orange text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold">
							{notificationsState.unreadCount}
						</span>
					)}
				</button>

				{notificationsOpen && (
					<div className="absolute right-0 top-full mt-2 w-80 bg-white/95 rounded-2xl shadow-lg border border-dark-green/5 backdrop-blur-sm z-50">
						<div className="flex items-center justify-between px-3 py-2 border-b border-dark-green/10">
							<p className="text-xs font-semibold text-text-dark">
								Notifications
							</p>
							{notificationsState.items && notificationsState.items.length > 0 && (
								<button
									type="button"
									className="text-[11px] text-accent-green font-semibold hover:underline"
									onClick={() => {
										dispatch(clearAllNotifications());
									}}
								>
									Clear all
								</button>
							)}
						</div>
						<div className="max-h-80 overflow-y-auto">
							{(!notificationsState.items || notificationsState.items.length === 0) && (
								<p className="px-3 py-4 text-[11px] text-text-gray text-center">
									No notifications yet.
								</p>
							)}
							{notificationsState.items && notificationsState.items.map((n) => {
								const actorName = n.fromUser?.name || "Someone";
								const postTitle = n.post?.title || "your post";
								let text;
								switch (n.type) {
									case "like":
										text = `${actorName} liked ${postTitle}`;
										break;
									case "comment":
										text = `${actorName} commented on ${postTitle}`;
										break;
									case "report_alert":
										text = `Your post "${postTitle}" was reported. Please review and update it.`;
										break;
									case "report_resolved":
										text = `An admin accepted your updates for "${postTitle}".`;
										break;
									case "report_rejected":
										text = `An admin rejected the changes for "${postTitle}". You can edit it again.`;
										break;
									case "report_deleted":
										text = `Your post "${postTitle}" was deleted due to a report.`;
										break;
									case "report_genuine":
										text = `An admin confirmed that "${postTitle}" is a genuine place.`;
										break;
									default:
										text = `${actorName} interacted with ${postTitle}`;
								}
								return (
									<button
										key={n._id}
										type="button"
										onClick={() => {
											dispatch(markNotificationAsRead(n._id));
											setNotificationsOpen(false);
											if (n.post?._id) {
												history.push(`/posts/${n.post._id}`);
											}
										}}
										className={`w-full text-left px-3 py-2.5 text-[11px] border-b border-dark-green/5 last:border-b-0 hover:bg-light-green/10 ${n.read ? "text-text-gray" : "bg-accent-green/5 text-text-dark"}`}
									>
										<span className="block truncate">{text}</span>
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{/* Avatar + menu */}
				<div ref={menuRef} className="relative flex items-center">
				<button
					aria-label="Open user menu"
					onClick={() => setUserMenuOpen((s) => !s)}
					onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setUserMenuOpen((s) => !s); }}
					className="w-9 h-9 rounded-full bg-accent-green text-white flex items-center justify-center font-semibold text-base cursor-pointer select-none overflow-hidden transition-transform hover:scale-105"
				>
					{profileImage ? (
						<img src={profileImage} alt={user.result?.name} className="w-full h-full object-cover" />
					) : (
						<span className="pointer-events-none">{user.result?.name?.charAt(0).toUpperCase()}</span>
					)}
				</button>

				<button
					type="button"
					className="hidden lg:inline-flex ml-2 items-center h-9 px-2 text-text-dark font-medium rounded hover:bg-light-green/5 transition-colors"
					onClick={goToOwnProfile}
				>
					{user.result?.name}
				</button>

				{userMenuOpen && (
						<div className="absolute right-0 top-full mt-2 flex justify-end w-max z-50">
							<div className="w-3 h-3 bg-white/95 border border-dark-green/5 rotate-45 -mt-2 mr-4" style={{ boxShadow: 'rgba(6,24,15,0.05) 0px 6px 12px' }} />
							<div className="bg-white/95 rounded-2xl shadow-lg w-56 p-3 border border-dark-green/5 backdrop-blur-sm">
								<button
									type="button"
									onClick={goToOwnProfile}
									className="flex items-center gap-3 px-2 py-2 border-b border-dark-green/5 mb-2 w-full text-left rounded-lg hover:bg-light-green/5"
								>
									<div className="w-10 h-10 rounded-full bg-accent-green text-white flex items-center justify-center font-semibold overflow-hidden">
										{profileImage ? <img src={profileImage} alt={user.result?.name} className="w-full h-full object-cover" /> : user.result?.name?.charAt(0).toUpperCase()}
								</div>
								<div className="flex-1">
									<p className="text-text-dark font-semibold text-sm truncate">{user.result?.name}</p>
									<p className="text-text-gray text-xs">{user.result?.email}</p>
								</div>
								</button>
							{user.result?.isAdmin && (
								<Link
									to="/dashboard"
									className="flex items-center gap-3 px-2 py-2 text-sm text-text-dark hover:bg-light-green/5 rounded mb-1 no-underline"
									onClick={() => setUserMenuOpen(false)}
								>
									<MdDashboard size={18} className="text-dark-green" />
									<span>Admin dashboard</span>
								</Link>
							)}
									<Link
										to={`/profile/${user.result?._id || user.result?.googleId}`}
										className="flex items-center gap-3 px-2 py-2 text-sm text-text-dark hover:bg-light-green/5 rounded mb-1"
										onClick={() => setUserMenuOpen(false)}
									>
										<span className="w-5 h-5 rounded-full bg-accent-green/10 flex items-center justify-center text-[11px] font-bold text-dark-green">
											{user.result?.name?.charAt(0).toUpperCase()}
										</span>
										<span>View profile</span>
									</Link>
									<Link
										to="/settings"
										className="flex items-center gap-3 px-2 py-2 text-sm text-text-dark hover:bg-light-green/5 rounded mb-2"
										onClick={() => setUserMenuOpen(false)}
									>
										<MdSettings size={18} className="text-dark-green" />
										<span>Account settings</span>
									</Link>
							<button onClick={logout} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-white bg-orange rounded-lg hover:bg-orange-hover transition-colors"><MdExitToApp size={18} /><span className="font-semibold">Logout</span></button>
						</div>
					</div>
				)}
			</div>
		</div>
	) : (
		<div className="flex items-center gap-2 sm:gap-3">
			<Link
				to="/auth"
				className="inline-flex items-center justify-center h-9 px-4 text-dark-green font-semibold text-sm rounded-full border border-dark-green/30 hover:border-dark-green hover:bg-dark-green/5 transition-all no-underline whitespace-nowrap"
			>
				Login
			</Link>
			<Link
				to="/signup"
				className="inline-flex items-center justify-center h-9 px-5 bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-bold text-sm rounded-full shadow-md hover:brightness-95 transition-all no-underline whitespace-nowrap"
			>
				Sign Up
			</Link>
		</div>
	);

	return (
		<header className="fixed top-0 left-0 right-0 z-[1300] bg-cream shadow-nav border-b border-accent-green/10" style={{ minHeight: 64 }}>
			<div className="w-full px-5 h-16 flex items-center">
				{/* Brand */}
				<Link
					to="/"
					aria-label="Atlas Diary"
					className="flex items-center flex-shrink-0 transition-opacity hover:opacity-90"
					onClick={() => {
						window.scrollTo({ top: 0, behavior: "smooth" });
						setMobileOpen(false);
						setUserMenuOpen(false);
						setNotificationsOpen(false);
					}}
				>
					<img src={logo} alt="Atlas Diary" className="h-10 w-auto block" />
				</Link>

				<div className="flex-1" />

				<div className="flex items-center gap-6">
					<nav aria-label="Primary navigation" className="hidden md:flex gap-6 items-center">
						{navItems.map((item) => {
							if (item.label === "How it Works" && user) return null;

							const isActive =
								location.pathname === item.to ||
								(location.pathname.startsWith(item.to) && item.to !== "/");

							const isHighlighted =
								item.label === "Public Diaries" || item.label === "For You";
							const baseClasses = isHighlighted
								? "no-underline text-sm font-black px-4 py-2 rounded-full whitespace-nowrap transition-all"
								: "no-underline text-sm font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors";
							const inactiveClasses = isHighlighted
								? " text-text-dark bg-white hover:bg-light-green/10 shadow-[0_8px_20px_rgba(12,52,44,0.06)] border border-dark-green/10"
								: " text-muted hover:bg-accent-green/10 hover:text-accent-green";
							const activeClasses = isHighlighted
								? " text-dark-green bg-gradient-to-r from-light-green to-[#d8ff56] shadow-[0_8px_24px_rgba(175,250,1,0.2)]"
								: " text-accent-green bg-accent-green/10 shadow-[0_4px_10px_rgba(47,107,79,0.15)]";

							return (
								<Link
									key={item.to}
									to={item.to}
									className={
										baseClasses + (isActive ? activeClasses : inactiveClasses)
									}
								>
									{item.label}
								</Link>
							);
						})}
					</nav>

					<button className="md:hidden text-accent-green p-1 rounded" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={toggleMobile}>{mobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}</button>

					{user && (
						<Link
							to="/create-post"
							className="md:hidden ml-2 inline-flex items-center justify-center bg-gradient-to-b from-accent-green to-accent-green-2 text-white p-2 rounded-full shadow-sm"
						>
							<MdAdd size={18} />
						</Link>
					)}

					{authControls}
				</div>
			</div>

			{/* Mobile dropdown */}
			{mobileOpen && (
				<div role="menu" aria-label="Mobile navigation" className="md:hidden absolute top-16 left-2 right-2 bg-cream rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex flex-col gap-2 p-3 z-[1200]">
					{navItems.map((item) => {
						if (item.label === "How it Works" && user) return null;
						return (
							<Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg no-underline text-accent-green font-semibold hover:bg-accent-green/10 transition-colors">{item.label}</Link>
						);
					})}

					{user ? (
						<>
							<Link to="/recommendations" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg no-underline text-accent-green font-semibold hover:bg-accent-green/10 transition-colors border border-accent-green/30">For You</Link>
							{user.result?.isAdmin && <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg no-underline text-accent-green font-extrabold hover:bg-accent-green/10 transition-colors">⚙️ Dashboard</Link>}
							<div className="flex items-center gap-2 px-3 py-2 bg-accent-green/5 rounded-lg"><div className="w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center font-bold text-sm shrink-0">{user.result?.name?.charAt(0).toUpperCase()}</div><span className="text-text-dark font-medium text-sm truncate">{user.result?.name}</span></div>
							<button onClick={() => { setMobileOpen(false); logout(); }} className="mt-1 w-full bg-orange text-white font-bold py-2 rounded-lg hover:bg-orange-hover transition-colors">Logout</button>
						</>
					) : (
						<div className="flex gap-2 mt-2">
							<Link to="/auth" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-accent-green font-semibold py-2 rounded-lg border border-accent-green/30 hover:bg-accent-green/10 transition-colors no-underline">Login</Link>
							<Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-gradient-to-b from-accent-green to-accent-green-2 text-white font-bold py-2 rounded-lg no-underline hover:brightness-95 transition-all">Sign Up</Link>
						</div>
					)}
				</div>
			)}
		</header>
	);
}

export default Navbar;
