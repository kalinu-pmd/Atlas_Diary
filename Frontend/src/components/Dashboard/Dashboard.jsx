import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import "./styles.css";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
	MdEdit,
	MdDelete,
	MdClose,
	MdPeople,
	MdAutoStories,
	MdDashboard,
	MdThumbUp,
	MdComment,
	MdRefresh,
} from "react-icons/md";
import * as api from "../../api";

// ── Confirmation modal ────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
	return (
		<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-sm">
				<h3 className="text-text-dark font-extrabold text-lg mb-2">
					Are you sure?
				</h3>
				<p className="text-text-gray text-sm mb-6">{message}</p>
				<div className="flex gap-3 justify-end">
					<button
						onClick={onCancel}
						className="px-4 py-2 rounded-lg border border-dark-green/20 text-dark-green font-semibold text-sm hover:bg-dark-green/5 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 rounded-lg bg-orange hover:bg-orange-hover text-white font-bold text-sm transition-colors"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}

ConfirmModal.propTypes = {
	message: PropTypes.string.isRequired,
	onConfirm: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
};

// ── Edit Post modal ───────────────────────────────────────────────────────────
function EditPostModal({ post, onSave, onClose, loading }) {
	const [title, setTitle] = useState(post?.title || "");
	const [message, setMessage] = useState(post?.message || "");
	const [tags, setTags] = useState(
		Array.isArray(post?.tags) ? post.tags.join(", ") : post?.tags || "",
	);

	const handleSave = (e) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Title is required.");
			return;
		}
		onSave({
			title: title.trim(),
			message: message.trim(),
			tags: tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
		});
	};

	return (
		<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-lg">
				<div className="flex items-center justify-between mb-5">
					<h3 className="text-text-dark font-extrabold text-lg">
						Edit Post
					</h3>
					<button
						onClick={onClose}
						className="text-text-gray hover:text-dark-green transition-colors"
					>
						<MdClose size={22} />
					</button>
				</div>

				<form onSubmit={handleSave} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-dark-green">
							Title <span className="text-orange">*</span>
						</label>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2.5 text-sm text-text-dark transition-colors"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-dark-green">
							Message
						</label>
						<textarea
							rows={4}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2.5 text-sm text-text-dark resize-y transition-colors"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-dark-green">
							Tags (comma separated)
						</label>
						<input
							value={tags}
							onChange={(e) => setTags(e.target.value)}
							placeholder="hiking, travel, adventure"
							className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2.5 text-sm text-text-dark transition-colors"
						/>
					</div>
					<div className="flex gap-3 justify-end mt-1">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-lg border border-dark-green/20 text-dark-green font-semibold text-sm hover:bg-dark-green/5 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-light-green hover:bg-light-green-hover disabled:opacity-60 disabled:cursor-not-allowed text-text-dark font-bold text-sm transition-colors"
						>
							{loading && (
								<div className="w-3.5 h-3.5 rounded-full border-2 border-text-dark/30 border-t-text-dark animate-spin" />
							)}
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

EditPostModal.propTypes = {
	post: PropTypes.shape({
		title: PropTypes.string,
		message: PropTypes.string,
		tags: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(PropTypes.string),
		]),
	}),
	onSave: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

// ── Edit User modal ───────────────────────────────────────────────────────────
function EditUserModal({ user, onSave, onClose, loading }) {
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [password, setPassword] = useState("");

	const handleSave = (e) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Name is required.");
			return;
		}
		if (!email.trim()) {
			toast.error("Email is required.");
			return;
		}
		const payload = { name: name.trim(), email: email.trim() };
		if (password.trim()) payload.password = password;
		onSave(payload);
	};

	return (
		<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-sm">
				<div className="flex items-center justify-between mb-5">
					<h3 className="text-text-dark font-extrabold text-lg">
						Edit User
					</h3>
					<button
						onClick={onClose}
						className="text-text-gray hover:text-dark-green transition-colors"
					>
						<MdClose size={22} />
					</button>
				</div>

				<form onSubmit={handleSave} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-dark-green">
							Name <span className="text-orange">*</span>
						</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2.5 text-sm text-text-dark transition-colors"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-dark-green">
							Email <span className="text-orange">*</span>
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2.5 text-sm text-text-dark transition-colors"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-dark-green">
							New Password{" "}
							<span className="text-text-gray font-normal">
								(leave blank to keep)
							</span>
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2.5 text-sm text-text-dark transition-colors"
						/>
					</div>
					<div className="flex gap-3 justify-end mt-1">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-lg border border-dark-green/20 text-dark-green font-semibold text-sm hover:bg-dark-green/5 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-light-green hover:bg-light-green-hover disabled:opacity-60 disabled:cursor-not-allowed text-text-dark font-bold text-sm transition-colors"
						>
							{loading && (
								<div className="w-3.5 h-3.5 rounded-full border-2 border-text-dark/30 border-t-text-dark animate-spin" />
							)}
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

EditUserModal.propTypes = {
	user: PropTypes.shape({
		name: PropTypes.string,
		email: PropTypes.string,
	}),
	onSave: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
	const [posts, setPosts] = useState([]);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("posts");
	const history = useHistory();

	// Modal states
	const [confirmModal, setConfirmModal] = useState(null); // { type, id, message }
	const [editPostModal, setEditPostModal] = useState(null); // post object
	const [editUserModal, setEditUserModal] = useState(null); // user object

	const token = localStorage.getItem("traveller-profile")
		? JSON.parse(localStorage.getItem("traveller-profile")).token
		: null;

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [usersRes, postsRes] = await Promise.all([
				api.getAllUsers(),
				api.fetchPosts(1),
			]);
			setUsers(usersRes.data.users || []);
			setPosts(postsRes.data.data || []);
		} catch (error) {
			console.error(error);
			toast.error("Failed to load dashboard data.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!token) {
			history.push("/auth");
		} else {
			fetchData();
		}
	}, [token, history, fetchData]);

	// ── Delete actions ──────────────────────────────────────────────────────
	const handleDeletePost = (id) => {
		setConfirmModal({
			type: "post",
			id,
			message:
				"This will permanently delete the post and all its comments. This action cannot be undone.",
		});
	};

	const handleDeleteUser = (id) => {
		setConfirmModal({
			type: "user",
			id,
			message:
				"This will permanently delete the user account and all their data. This action cannot be undone.",
		});
	};

	const confirmDelete = async () => {
		if (!confirmModal) return;
		setActionLoading(true);
		
		// Close modal immediately for better UX
		const modalType = confirmModal.type;
		const modalId = confirmModal.id;
		setConfirmModal(null);
		
		try {
			if (modalType === "post") {
				await api.deletePost(modalId);
				toast.success("Post deleted successfully.");
			} else {
				await api.deleteUser(modalId);
				toast.success("User deleted successfully.");
			}
			await fetchData();
		} catch (error) {
			console.error(error);
			toast.error("Delete failed. Please try again.");
		} finally {
			setActionLoading(false);
		}
	};

	// ── Edit actions ────────────────────────────────────────────────────────
	const handleSavePost = async (updated) => {
		if (!editPostModal) return;
		setActionLoading(true);
		try {
			await api.updatePost(editPostModal._id, updated);
			toast.success("Post updated successfully.");
			await fetchData();
			setEditPostModal(null);
		} catch (error) {
			console.error(error);
			toast.error("Failed to update post.");
		} finally {
			setActionLoading(false);
		}
	};

	const handleSaveUser = async (updated) => {
		if (!editUserModal) return;
		setActionLoading(true);
		try {
			await api.editUser(editUserModal._id, updated);
			toast.success("User updated successfully.");
			await fetchData();
			setEditUserModal(null);
		} catch (error) {
			console.error(error);
			toast.error("Failed to update user.");
		} finally {
			setActionLoading(false);
		}
	};

	// ── Stats ───────────────────────────────────────────────────────────────
	const totalLikes = posts.reduce(
		(sum, p) => sum + (p.likes?.length || 0),
		0,
	);
	const totalComments = posts.reduce(
		(sum, p) => sum + (p.comments?.length || 0),
		0,
	);

	return (
		<>
			{/* Modals */}
			{confirmModal && (
				<ConfirmModal
					message={confirmModal.message}
					onConfirm={confirmDelete}
					onCancel={() => setConfirmModal(null)}
				/>
			)}
			{editPostModal && (
				<EditPostModal
					post={editPostModal}
					onSave={handleSavePost}
					onClose={() => setEditPostModal(null)}
					loading={actionLoading}
				/>
			)}
			{editUserModal && (
				<EditUserModal
					user={editUserModal}
					onSave={handleSaveUser}
					onClose={() => setEditUserModal(null)}
					loading={actionLoading}
				/>
			)}

			<div className="min-h-screen bg-off-white">
				{/* ── Header ─────────────────────────────────────── */}
				<div className="bg-gradient-to-br from-dark-green to-[#0a2d26] px-4 py-8">
					<div className="max-w-6xl mx-auto">
						<div className="flex items-center justify-between gap-4 flex-wrap">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-light-green/15 flex items-center justify-center">
									<MdDashboard
										size={24}
										className="text-light-green"
									/>
								</div>
								<div>
									<h1 className="text-white font-extrabold text-xl">
										Admin Dashboard
									</h1>
									<p className="text-white/55 text-xs">
										Manage posts and users
									</p>
								</div>
							</div>
							<button
								onClick={fetchData}
								disabled={loading}
								className="flex items-center gap-1.5 bg-light-green/15 hover:bg-light-green/25 border border-light-green/30 text-light-green font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
							>
								<MdRefresh
									size={18}
									className={loading ? "animate-spin" : ""}
								/>
								Refresh
							</button>
						</div>

						{/* Stats row */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
							{[
								{
									label: "Total Posts",
									value: posts.length,
									icon: (
										<MdAutoStories
											size={20}
											className="text-light-green"
										/>
									),
								},
								{
									label: "Total Users",
									value: users.length,
									icon: (
										<MdPeople
											size={20}
											className="text-light-green"
										/>
									),
								},
								{
									label: "Total Likes",
									value: totalLikes,
									icon: (
										<MdThumbUp
											size={20}
											className="text-light-green"
										/>
									),
								},
								{
									label: "Total Comments",
									value: totalComments,
									icon: (
										<MdComment
											size={20}
											className="text-light-green"
										/>
									),
								},
							].map((stat) => (
								<div
									key={stat.label}
									className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3"
								>
									<div className="w-9 h-9 rounded-lg bg-dark-green/60 flex items-center justify-center shrink-0">
										{stat.icon}
									</div>
									<div>
										<p className="text-white font-extrabold text-xl leading-tight">
											{stat.value}
										</p>
										<p className="text-white/50 text-xs">
											{stat.label}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* ── Content ────────────────────────────────────── */}
				<div className="max-w-6xl mx-auto px-4 py-6">
					{/* Tab buttons */}
					<div className="flex gap-2 mb-6 border-b border-dark-green/10 pb-1">
						<button
							onClick={() => setActiveTab("posts")}
							className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors border-b-2 -mb-[1px] ${
								activeTab === "posts"
									? "border-dark-green text-dark-green bg-off-white"
									: "border-transparent text-text-gray hover:text-dark-green"
							}`}
						>
							<MdAutoStories size={16} />
							Posts ({posts.length})
						</button>
						<button
							onClick={() => setActiveTab("users")}
							className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors border-b-2 -mb-[1px] ${
								activeTab === "users"
									? "border-dark-green text-dark-green bg-off-white"
									: "border-transparent text-text-gray hover:text-dark-green"
							}`}
						>
							<MdPeople size={16} />
							Users ({users.length})
						</button>
					</div>

					{loading ? (
						<div className="flex justify-center items-center py-24">
							<div className="flex flex-col items-center gap-3">
								<div className="w-10 h-10 rounded-full border-4 border-off-white border-t-dark-green animate-spin" />
								<p className="text-text-gray text-sm">
									Loading data…
								</p>
							</div>
						</div>
					) : (
						<>
							{/* ── Posts table ─────────────────── */}
							{activeTab === "posts" && (
								<div className="dashboard-panel overflow-x-auto">
									<h2 className="text-dark-green font-extrabold text-lg mb-4">
										All Posts
									</h2>
									{posts.length === 0 ? (
										<p className="text-text-gray text-sm py-6 text-center">
											No posts found.
										</p>
									) : (
										<table>
											<thead>
												<tr>
													<th>Title</th>
													<th>Author</th>
													<th>Tags</th>
													<th>Likes</th>
													<th>Comments</th>
													<th>Actions</th>
												</tr>
											</thead>
											<tbody>
												{posts.map((post) => (
													<tr key={post._id}>
														<td className="max-w-[180px] truncate font-medium">
															{post.title}
														</td>
														<td>{post.name}</td>
														<td className="max-w-[140px]">
															<div className="flex flex-wrap gap-1">
																{(Array.isArray(
																	post.tags,
																)
																	? post.tags
																	: []
																)
																	.slice(0, 3)
																	.map(
																		(
																			tag,
																		) => (
																			<span
																				key={
																					tag
																				}
																				className="bg-light-green/20 text-dark-green text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full"
																			>
																				{
																					tag
																				}
																			</span>
																		),
																	)}
																{Array.isArray(
																	post.tags,
																) &&
																	post.tags
																		.length >
																		3 && (
																		<span className="text-text-gray text-[0.65rem]">
																			+
																			{post
																				.tags
																				.length -
																				3}
																		</span>
																	)}
															</div>
														</td>
														<td>
															{post.likes
																?.length || 0}
														</td>
														<td>
															{post.comments
																?.length || 0}
														</td>
														<td>
															<button
																className="edit"
																onClick={() =>
																	setEditPostModal(
																		post,
																	)
																}
															>
																<MdEdit
																	size={14}
																	className="inline mr-1"
																/>
																Edit
															</button>
															<button
																className="delete"
																onClick={() =>
																	handleDeletePost(
																		post._id,
																	)
																}
															>
																<MdDelete
																	size={14}
																	className="inline mr-1"
																/>
																Delete
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							)}

							{/* ── Users table ─────────────────── */}
							{activeTab === "users" && (
								<div className="dashboard-panel overflow-x-auto">
									<h2 className="text-dark-green font-extrabold text-lg mb-4">
										All Users
									</h2>
									{users.length === 0 ? (
										<p className="text-text-gray text-sm py-6 text-center">
											No users found.
										</p>
									) : (
										<table>
											<thead>
												<tr>
													<th>Name</th>
													<th>Email</th>
													<th>Admin</th>
													<th>Actions</th>
												</tr>
											</thead>
											<tbody>
												{users.map((user) => (
													<tr key={user._id}>
														<td className="font-medium">
															{user.name}
														</td>
														<td>{user.email}</td>
														<td>
															{user.isAdmin ? (
																<span className="bg-light-green text-dark-green text-xs font-bold px-2 py-0.5 rounded-full">
																	Admin
																</span>
															) : (
																<span className="text-text-gray text-xs">
																	—
																</span>
															)}
														</td>
														<td>
															<button
																className="edit"
																onClick={() =>
																	setEditUserModal(
																		user,
																	)
																}
															>
																<MdEdit
																	size={14}
																	className="inline mr-1"
																/>
																Edit
															</button>
															<button
																className="delete"
																onClick={() =>
																	handleDeleteUser(
																		user._id,
																	)
																}
															>
																<MdDelete
																	size={14}
																	className="inline mr-1"
																/>
																Delete
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Dashboard;
