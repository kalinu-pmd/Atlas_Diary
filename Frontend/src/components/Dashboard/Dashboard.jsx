import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
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
	MdRefresh,
	MdReport,
} from "react-icons/md";
import * as api from "../../api";
import "./styles.css";

function ConfirmModal({ message, onConfirm, onCancel }) {
	return (
		<div className="fixed inset-0 z-[2100] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-sm">
				<h3 className="text-text-dark font-extrabold text-lg mb-2">Are you sure?</h3>
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

function ReportActionModal({ title, description, confirmLabel, onConfirm, onCancel, loading }) {
	const [note, setNote] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		onConfirm(note);
	};

	return (
		<div className="fixed inset-0 z-[2050] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-md">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-text-dark font-extrabold text-lg">{title}</h3>
					<button onClick={onCancel} className="text-text-gray hover:text-dark-green transition-colors">
						<MdClose size={20} />
					</button>
				</div>
				<p className="text-text-gray text-sm mb-4">{description}</p>
				<form onSubmit={handleSubmit} className="space-y-3">
					<label className="block text-sm font-semibold text-text-dark">
						Optional note to post owner
						<textarea
							rows={3}
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder="Explain what seems wrong or what they should fix."
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<div className="flex justify-end gap-3 pt-1">
						<button
							type="button"
							onClick={onCancel}
							className="px-4 py-2 rounded-lg border border-dark-green/20 text-dark-green font-semibold text-sm hover:bg-dark-green/5 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-4 py-2 rounded-lg bg-dark-green text-white font-bold text-sm hover:bg-dark-green/90 transition-colors disabled:opacity-50"
						>
							{loading ? "Sending..." : confirmLabel}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

ReportActionModal.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	confirmLabel: PropTypes.string.isRequired,
	onConfirm: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

function ReviewDiffModal({ report, onClose, onAccept, onReject, loading }) {
	if (!report) return null;

	const original = report.originalPostSnapshot || {};
	const updated = report.reviewSnapshot || {};

	const trim = (text) => {
		if (!text) return "";
		return text.length > 120 ? `${text.slice(0, 120)}…` : text;
	};

	return (
		<div className="fixed inset-0 z-[2075] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-3xl">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-text-dark font-extrabold text-lg">Review changes</h3>
					<button onClick={onClose} className="text-text-gray hover:text-dark-green transition-colors">
						<MdClose size={20} />
					</button>
				</div>
				<p className="text-xs text-text-gray mb-4">
					Compare the original diary entry with the updated version before deciding whether to accept or reject the changes.
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div className="bg-off-white border border-dark-green/10 rounded-xl p-3">
						<h4 className="text-xs font-bold text-text-gray uppercase tracking-wide mb-1">Original</h4>
						<p className="text-sm font-semibold text-text-dark mb-1 break-words">{original.title || report.post?.title || "(No title)"}</p>
						<p className="text-xs text-text-dark whitespace-pre-line break-words">{trim(original.message)}</p>
					</div>
					<div className="bg-light-green/5 border border-light-green rounded-xl p-3">
						<h4 className="text-xs font-bold text-dark-green uppercase tracking-wide mb-1">Updated</h4>
						<p className="text-sm font-semibold text-text-dark mb-1 break-words">{updated.title || report.post?.title || "(No title)"}</p>
						<p className="text-xs text-text-dark whitespace-pre-line break-words">{trim(updated.message)}</p>
					</div>
				</div>
				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-lg border border-dark-green/20 text-dark-green font-semibold text-sm hover:bg-dark-green/5 transition-colors"
					>
						Close
					</button>
					<button
						type="button"
						disabled={loading}
						onClick={onReject}
						className="px-4 py-2 rounded-lg bg-orange/90 hover:bg-orange text-white font-bold text-sm transition-colors disabled:opacity-50"
					>
						{loading ? "Working..." : "Reject changes"}
					</button>
					<button
						type="button"
						disabled={loading}
						onClick={onAccept}
						className="px-4 py-2 rounded-lg bg-dark-green text-white font-bold text-sm hover:bg-dark-green/90 transition-colors disabled:opacity-50"
					>
						{loading ? "Working..." : "Accept changes"}
					</button>
				</div>
			</div>
		</div>
	);
}

ReviewDiffModal.propTypes = {
	report: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	onAccept: PropTypes.func.isRequired,
	onReject: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

function EditPostModal({ post, onSave, onClose, loading }) {
	const [title, setTitle] = useState(post?.title || "");
	const [message, setMessage] = useState(post?.message || "");
	const [tags, setTags] = useState(Array.isArray(post?.tags) ? post.tags.join(", ") : post?.tags || "");

	const handleSubmit = (e) => {
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
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-text-dark font-extrabold text-lg">Edit Post</h3>
					<button onClick={onClose} className="text-text-gray hover:text-dark-green transition-colors">
						<MdClose size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-3">
					<label className="block text-sm font-semibold text-text-dark">
						Title
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<label className="block text-sm font-semibold text-text-dark">
						Description
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={4}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<label className="block text-sm font-semibold text-text-dark">
						Tags (comma separated)
						<input
							type="text"
							value={tags}
							onChange={(e) => setTags(e.target.value)}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<div className="flex justify-end gap-3 pt-2">
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
							className="px-4 py-2 rounded-lg bg-dark-green text-white font-bold text-sm hover:bg-dark-green/90 transition-colors disabled:opacity-50"
						>
							{loading ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

EditPostModal.propTypes = {
	post: PropTypes.object,
	onSave: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

function EditUserModal({ user, onSave, onClose, loading }) {
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [isAdmin, setIsAdmin] = useState(Boolean(user?.isAdmin));

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name.trim() || !email.trim()) {
			toast.error("Name and email are required.");
			return;
		}
		onSave({ name: name.trim(), email: email.trim(), isAdmin });
	};

	return (
		<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-lg">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-text-dark font-extrabold text-lg">Edit User</h3>
					<button onClick={onClose} className="text-text-gray hover:text-dark-green transition-colors">
						<MdClose size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-3">
					<label className="block text-sm font-semibold text-text-dark">
						Name
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<label className="block text-sm font-semibold text-text-dark">
						Email
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<label className="inline-flex items-center gap-2 text-sm font-semibold text-text-dark">
						<input
							type="checkbox"
							checked={isAdmin}
							onChange={(e) => setIsAdmin(e.target.checked)}
							className="rounded border-dark-green/30"
						/>
						<span>Admin</span>
					</label>
					<div className="flex justify-end gap-3 pt-2">
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
							className="px-4 py-2 rounded-lg bg-dark-green text-white font-bold text-sm hover:bg-dark-green/90 transition-colors disabled:opacity-50"
						>
							{loading ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

EditUserModal.propTypes = {
	user: PropTypes.object,
	onSave: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

function CreateUserModal({ onSave, onClose, loading }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isAdmin, setIsAdmin] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !password.trim()) {
			toast.error("All fields are required.");
			return;
		}
		onSave({ name: name.trim(), email: email.trim(), password, isAdmin });
	};

	return (
		<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-lg">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-text-dark font-extrabold text-lg">Add User</h3>
					<button onClick={onClose} className="text-text-gray hover:text-dark-green transition-colors">
						<MdClose size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-3">
					<label className="block text-sm font-semibold text-text-dark">
						Name
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<label className="block text-sm font-semibold text-text-dark">
						Email
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<label className="block text-sm font-semibold text-text-dark">
						Password
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					<label className="inline-flex items-center gap-2 text-sm font-semibold text-text-dark">
						<input
							type="checkbox"
							checked={isAdmin}
							onChange={(e) => setIsAdmin(e.target.checked)}
							className="rounded border-dark-green/30"
						/>
						<span>Admin</span>
					</label>
					<div className="flex justify-end gap-3 pt-2">
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
							className="px-4 py-2 rounded-lg bg-dark-green text-white font-bold text-sm hover:bg-dark-green/90 transition-colors disabled:opacity-50"
						>
							{loading ? "Creating..." : "Create"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

CreateUserModal.propTypes = {
	onSave: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

function Dashboard() {
	const history = useHistory();
	const [posts, setPosts] = useState([]);
	const [users, setUsers] = useState([]);
	const [reports, setReports] = useState([]);
	const [reviewReports, setReviewReports] = useState([]);
	const [activeTab, setActiveTab] = useState("posts");
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [confirmModal, setConfirmModal] = useState(null);
	const [editPostModal, setEditPostModal] = useState(null);
	const [editUserModal, setEditUserModal] = useState(null);
	const [createUserModal, setCreateUserModal] = useState(false);
	const [reportActionModal, setReportActionModal] = useState(null);
	const [reviewDiffModal, setReviewDiffModal] = useState(null);
	const [reportsView, setReportsView] = useState("active");

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [postsRes, usersRes, reportsRes] = await Promise.all([
				api.fetchPosts(1, { summary: true }),
				api.getAllUsers(),
				api.fetchPostReports(),
			]);

			const postsList = postsRes?.data?.data || postsRes?.data?.posts || postsRes?.data?.results || postsRes?.data || [];
			const usersList = usersRes?.data?.users || usersRes?.data?.data || usersRes?.data || [];
			const reportList = reportsRes?.data?.reports || reportsRes?.data || [];

			setPosts(Array.isArray(postsList) ? postsList : []);
			setUsers(Array.isArray(usersList) ? usersList : []);
			setReports(Array.isArray(reportList) ? reportList : []);
			setReviewReports(Array.isArray(reportList) ? reportList.filter((r) => r.status === "under_review") : []);
		} catch (error) {
			console.error("Failed to load dashboard data:", error);
			toast.error("Failed to load dashboard data.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleDeletePost = (postId) => {
		setConfirmModal({
			message: "Delete this post?",
			onConfirm: async () => {
				setActionLoading(true);
				try {
					await api.deletePost(postId);
					toast.success("Post deleted.");
					await fetchData();
				} catch (error) {
					console.error(error);
					toast.error("Failed to delete post.");
				} finally {
					setActionLoading(false);
					setConfirmModal(null);
				}
			},
			onCancel: () => setConfirmModal(null),
		});
	};

	const handleDeleteUser = (userId) => {
		setConfirmModal({
			message: "Delete this user?",
			onConfirm: async () => {
				setActionLoading(true);
				try {
					await api.deleteUser(userId);
					toast.success("User deleted.");
					await fetchData();
				} catch (error) {
					console.error(error);
					toast.error("Failed to delete user.");
				} finally {
					setActionLoading(false);
					setConfirmModal(null);
				}
			},
			onCancel: () => setConfirmModal(null),
		});
	};

	const handleSavePost = async (updated) => {
		if (!editPostModal) return;
		setActionLoading(true);
		try {
			await api.updatePost(editPostModal._id, updated);
			toast.success("Post updated.");
			setEditPostModal(null);
			await fetchData();
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
			toast.success("User updated.");
			setEditUserModal(null);
			await fetchData();
		} catch (error) {
			console.error(error);
			toast.error("Failed to update user.");
		} finally {
			setActionLoading(false);
		}
	};

	const handleCreateUser = async (payload) => {
		setActionLoading(true);
		try {
			await api.createUserByAdmin(payload);
			toast.success("User created.");
			setCreateUserModal(false);
			await fetchData();
		} catch (error) {
			console.error(error);
			const message = error?.response?.data?.message || "Failed to create user.";
			toast.error(message);
		} finally {
			setActionLoading(false);
		}
	};

	const handleAdminReportAction = async (reportId, action, note) => {
		setActionLoading(true);
		try {
			await api.adminActOnReport(reportId, { action, note });
			await fetchData();
			toast.success("Report updated.");
		} catch (error) {
			console.error("Failed to act on report:", error);
			const message = error?.response?.data?.message || "Failed to update report.";
			toast.error(message);
		} finally {
			setActionLoading(false);
		}
	};

	const openPostDetails = (postId) => {
		if (!postId) return;
		history.push(`/posts/${postId}`);
	};

	const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
	const totalReports = reports.length;
	const activeReports = reports.filter((r) => ["open", "alerted", "under_review"].includes(r.status));
	const openReportsCount = activeReports.filter((r) => r.status === "open" || r.status === "alerted").length;
	const receivedReviewsCount = reviewReports.length;
	const historyReports = reports.filter((r) => !["open", "alerted", "under_review"].includes(r.status));

	return (
		<div className="min-h-screen bg-off-white">
			{confirmModal && (
				<ConfirmModal
					message={confirmModal.message}
					onConfirm={confirmModal.onConfirm}
					onCancel={confirmModal.onCancel}
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
			{createUserModal && (
				<CreateUserModal
					onSave={handleCreateUser}
					onClose={() => setCreateUserModal(false)}
					loading={actionLoading}
				/>
			)}
			{reportActionModal && (
				<ReportActionModal
					title="Alert post owner"
					description="Send a short note to the post owner explaining what seems inaccurate. This will help them update or clarify their diary post."
					confirmLabel="Send alert"
					onConfirm={async (note) => {
						setActionLoading(true);
						try {
							await handleAdminReportAction(reportActionModal.reportId, "alert_user", note || "");
							setReportActionModal(null);
						} finally {
							setActionLoading(false);
						}
					}}
					onCancel={() => setReportActionModal(null)}
					loading={actionLoading}
				/>
			)}
			{reviewDiffModal && (
				<ReviewDiffModal
					report={reviewDiffModal}
					onClose={() => setReviewDiffModal(null)}
					onAccept={async () => {
						await handleAdminReportAction(reviewDiffModal._id, "accept_review", "Changes accepted");
						setReviewDiffModal(null);
					}}
					onReject={async () => {
						await handleAdminReportAction(reviewDiffModal._id, "reject_review", "Changes rejected");
						setReviewDiffModal(null);
					}}
					loading={actionLoading}
				/>
			)}

			<div className="bg-gradient-to-br from-dark-green to-[#0a2d26] px-4 py-8">
				<div className="max-w-6xl mx-auto">
					<div className="flex items center justify-between gap-4 flex-wrap">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-light-green/15 flex items-center justify-center">
								<MdDashboard size={24} className="text-light-green" />
								</div>
								<div>
									<h1 className="text-white font-extrabold text-xl">Admin Dashboard</h1>
									<p className="text-white/55 text-xs">Manage posts and users</p>
								</div>
						</div>
						<button
							onClick={fetchData}
							disabled={loading}
							className="flex items-center gap-1.5 bg-light-green/15 hover:bg-light-green/25 border border-light-green/30 text-light-green font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
						>
							<MdRefresh size={18} className={loading ? "animate-spin" : ""} />
							Refresh
						</button>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
							{[
								{
									label: "Total Posts",
									value: posts.length,
									icon: <MdAutoStories size={20} className="text-light-green" />,
								},
								{
									label: "Total Users",
									value: users.length,
									icon: <MdPeople size={20} className="text-light-green" />,
								},
								{
									label: "Total Likes",
									value: totalLikes,
									icon: <MdThumbUp size={20} className="text-light-green" />,
								},
								{
									label: "Total Reports",
									value: totalReports,
									icon: <MdReport size={20} className="text-light-green" />,
								},
							].map((stat) => (
								<div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
									<div className="w-9 h-9 rounded-lg bg-dark-green/60 flex items-center justify-center shrink-0">{stat.icon}</div>
									<div>
										<p className="text-white font-extrabold text-xl leading-tight">{stat.value}</p>
										<p className="text-white/50 text-xs">{stat.label}</p>
									</div>
								</div>
							))}
						</div>
				</div>
				</div>

				<div className="max-w-6xl mx-auto px-4 py-6">
					<div className="flex gap-2 mb-6 border-b border-dark-green/10 pb-1">
						<button
							onClick={() => setActiveTab("posts")}
							className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors border-b-2 -mb-[1px] ${
								activeTab === "posts" ? "border-dark-green text-dark-green bg-off-white" : "border-transparent text-text-gray hover:text-dark-green"
							}`}
						>
							<MdAutoStories size={16} />
							Posts ({posts.length})
						</button>
						<button
							onClick={() => setActiveTab("users")}
							className={`flex items center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors border-b-2 -mb-[1px] ${
								activeTab === "users" ? "border-dark-green text-dark-green bg-off-white" : "border-transparent text-text-gray hover:text-dark-green"
							}`}
						>
							<MdPeople size={16} />
							Users ({users.length})
						</button>
						<button
							onClick={() => setActiveTab("reports")}
							className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors border-b-2 -mb-[1px] ${
								activeTab === "reports" ? "border-dark-green text-dark-green bg-off-white" : "border-transparent text-text-gray hover:text-dark-green"
							}`}
						>
							<MdReport size={16} />
							Reports ({openReportsCount} / {receivedReviewsCount})
						</button>
					</div>

					{loading && (
						<div className="flex justify-center items-center py-24">
							<div className="flex flex-col items-center gap-3">
								<div className="w-10 h-10 rounded-full border-4 border-off-white border-t-dark-green animate-spin" />
								<p className="text-text-gray text-sm">Loading data…</p>
							</div>
						</div>
					)}

					{!loading && activeTab === "posts" && (
						<div className="dashboard-panel overflow-x-auto">
							<h2 className="text-dark-green font-extrabold text-lg mb-4">All Posts</h2>
							{posts.length === 0 ? (
								<p className="text-text-gray text-sm py-6 text-center">No posts found.</p>
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
												<td className="max-w-[180px] truncate font-medium">{post.title}</td>
												<td>{post.name}</td>
												<td className="max-w-[140px]">
													<div className="flex flex-wrap gap-1">
														{(Array.isArray(post.tags) ? post.tags : []).slice(0, 3).map((tag) => (
															<span key={tag} className="bg-light-green/20 text-dark-green text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full">{tag}</span>
														))}
														{Array.isArray(post.tags) && post.tags.length > 3 && <span className="text-text-gray text-[0.65rem]">+{post.tags.length - 3}</span>}
													</div>
												</td>
												<td>{post.likes?.length || 0}</td>
												<td>{post.comments?.length || 0}</td>
												<td className="whitespace-nowrap">
													<button className="edit" onClick={() => setEditPostModal(post)}>
														<MdEdit size={14} className="inline mr-1" />
														Edit
													</button>
													<button className="delete" onClick={() => handleDeletePost(post._id)}>
														<MdDelete size={14} className="inline mr-1" />
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

					{!loading && activeTab === "users" && (
						<div className="dashboard-panel overflow-x-auto">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-dark-green font-extrabold text-lg">All Users</h2>
								<button
									type="button"
									onClick={() => setCreateUserModal(true)}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-light-green hover:bg-light-green-hover text-text-dark text-xs font-bold border border-light-green/60 transition-colors"
								>
									<span className="text-base leading-none">+</span>
									<span>Add User</span>
								</button>
							</div>
							{users.length === 0 ? (
								<p className="text-text-gray text-sm py-6 text-center">No users found.</p>
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
												<td className="font-medium">{user.name}</td>
												<td>{user.email}</td>
												<td>{user.isAdmin ? <span className="bg-light-green text-dark-green text-xs font-bold px-2 py-0.5 rounded-full">Admin</span> : <span className="text-text-gray text-xs">—</span>}</td>
												<td className="whitespace-nowrap">
													<button className="edit mr-2" onClick={() => setEditUserModal(user)}>
														<MdEdit size={14} className="inline mr-1" />
														Edit
													</button>
													<button className="delete" onClick={() => handleDeleteUser(user._id)}>
														<MdDelete size={14} className="inline mr-1" />
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

					{!loading && activeTab === "reports" && (
						<div className="dashboard-panel overflow-x-auto">
							<div className="flex items-center justify-between mb-4 flex-wrap gap-3">
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setReportsView("active")}
										className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
											reportsView === "active"
												? "bg-dark-green text-off-white border-dark-green"
												: "bg-off-white text-text-gray border-dark-green/10 hover:bg-light-green/20 hover:text-dark-green"
										}`}
									>
										Reports
									</button>
									<button
										type="button"
										onClick={() => setReportsView("history")}
										className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
											reportsView === "history"
												? "bg-dark-green text-off-white border-dark-green"
												: "bg-off-white text-text-gray border-dark-green/10 hover:bg-light-green/20 hover:text-dark-green"
										}`}
									>
										History
									</button>
								</div>
								<p className="text-[11px] text-text-gray">
									{reportsView === "active"
										? "These are posts travellers have reported as incorrect or problematic."
										: "Posts that were edited after being reported and processed by admins."}
								</p>
							</div>

							{reportsView === "active" && (
								<>
									{activeReports.length === 0 ? (
								<p className="text-text-gray text-sm py-4 text-center">No reports yet.</p>
							) : (
								<table>
									<thead>
										<tr>
											<th>Post</th>
											<th>Reporter</th>
											<th>Reason</th>
											<th>Status</th>
											<th>Created</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{activeReports.map((report) => {
											const reasonLabels = {
												not_real_place: "Not a real place",
												description_mismatch: "Description mismatch",
												photo_mismatch: "Photos mismatch",
												spam_or_advertisement: "Spam / advertisement",
												other: "Other",
											};
												const isUnderReview = report.status === "under_review" && report.reviewSnapshot;
												return (
													<tr key={report._id}>
													<td className="max-w-[220px] truncate font-medium cursor-pointer text-dark-green hover:underline" onClick={() => openPostDetails(report.post?._id)}>
														{report.post?.title || "(Deleted post)"}
													</td>
													<td className="max-w-[160px] truncate">{report.reporter?.name || "Unknown"}</td>
													<td>{reasonLabels[report.reason] || report.reason}</td>
													<td className="text-xs capitalize">
														{report.status || "open"}
														{isUnderReview && (
															<span className="ml-1 inline-flex items-center rounded-full bg-light-green/15 px-2 py-0.5 text-[0.6rem] font-semibold text-dark-green border border-light-green/40">
																Review received
															</span>
														)}
													</td>
													<td className="text-xs text-text-gray">{report.createdAt ? new Date(report.createdAt).toLocaleString() : ""}</td>
													<td className="whitespace-nowrap text-xs">
														<button
															type="button"
															className="edit mr-2"
															onClick={() => handleAdminReportAction(report._id, "mark_genuine", "Marked as genuine")}
														>
															Mark genuine
														</button>
														<button
															type="button"
															className="details mr-2"
															onClick={() => setReportActionModal({ reportId: report._id })}
														>
															Alert user
														</button>
														{isUnderReview && (
															<button
																	type="button"
																	className="details mr-2"
																	onClick={() => setReviewDiffModal(report)}
															>
																View changes
															</button>
														)}
														<button
															type="button"
															className="delete"
															onClick={() =>
																setConfirmModal({
																	message: "Delete this post based on this report?",
																	onConfirm: async () => {
																		setActionLoading(true);
																		try {
																			await handleAdminReportAction(report._id, "delete_post", "Post deleted due to report");
																		} finally {
																			setActionLoading(false);
																			setConfirmModal(null);
																		}
																	},
																	onCancel: () => setConfirmModal(null),
																})
														}
														>
															Delete post
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								)}
							</>
							)}

							{reportsView === "history" && (
								<div className="mt-1">
									{historyReports.length === 0 ? (
										<p className="text-text-gray text-xs py-3 text-center border border-dashed border-light-green/40 rounded-lg bg-off-white/40">No completed report history yet.</p>
									) : (
										<table className="mt-2">
											<thead>
												<tr>
													<th>Post</th>
													<th>Status</th>
													<th>Reporter</th>
													<th>Original summary</th>
													<th>Updated summary</th>
													<th>Last updated</th>
												</tr>
											</thead>
											<tbody>
												{historyReports.map((report) => {
													const statusLabels = {
														open: "Open",
														genuine: "Marked genuine",
														alerted: "Alerted owner",
														under_review: "Under review",
														resolved: "Resolved",
														rejected: "Rejected",
														deleted: "Post deleted",
													};
													const origMessage = report.originalPostSnapshot?.message;
													const updatedMessage = report.reviewSnapshot?.message;

													const trim = (text) => {
														if (!text) return "";
														return text.length > 80 ? `${text.slice(0, 80)}…` : text;
													};

													return (
														<tr key={report._id}>
															<td className="max-w-[220px] truncate font-medium cursor-pointer text-dark-green hover:underline" onClick={() => openPostDetails(report.post?._id)}>
																{report.post?.title || "(Deleted post)"}
															</td>
															<td className="text-xs capitalize">{statusLabels[report.status] || report.status}</td>
															<td className="max-w-[160px] truncate text-xs">{report.reporter?.name || "Unknown"}</td>
															<td className="max-w-[260px] text-xs" title={origMessage || ""}>{trim(origMessage)}</td>
															<td className="max-w-[260px] text-xs" title={updatedMessage || ""}>{trim(updatedMessage)}</td>
															<td className="text-xs text-text-gray">
																{report.updatedAt ? new Date(report.updatedAt).toLocaleString() : ""}
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		);
}

export default Dashboard;