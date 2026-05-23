import { useEffect, useState, useCallback, useRef } from "react";
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
	MdVisibility,
	MdVisibilityOff,
	MdMessage,
	MdNotifications,
} from "react-icons/md";
import * as api from "../../api";
import "./styles.css";

function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = "Delete", cancelLabel = "Cancel" }) {
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
						{cancelLabel}
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 rounded-lg bg-orange hover:bg-orange-hover text-white font-bold text-sm transition-colors"
					>
						{confirmLabel}
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
	confirmLabel: PropTypes.string,
	cancelLabel: PropTypes.string,
};

function MessageActionModal({ actionType, message, onCancel, onSubmit, loading }) {
	const [adminMessage, setAdminMessage] = useState("");
	const [closeTicket, setCloseTicket] = useState(true);

	if (!message) return null;

	const isDelete = actionType === "delete";
	const title = isDelete ? "Delete message" : "Mark as resolved";
	const description = isDelete
		? "Add a reason so this ticket is archived in the resolved section instead of being permanently removed."
		: "Write the admin message and choose whether to close the ticket.";
	const submitLabel = isDelete ? "Archive ticket" : closeTicket ? "Close ticket" : "Save reply";

	const handleSubmit = (e) => {
		e.preventDefault();
		const trimmed = adminMessage.trim();
		if (!trimmed) {
			toast.error(isDelete ? "Reason is required." : "Admin message is required.");
			return;
		}
		onSubmit(isDelete ? { reason: trimmed } : { message: trimmed, closeTicket });
	};

	return (
		<div className="fixed inset-0 z-[2125] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-lg">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-text-dark font-extrabold text-lg">{title}</h3>
					<button onClick={onCancel} className="text-text-gray hover:text-dark-green transition-colors">
						<MdClose size={20} />
					</button>
				</div>
				<p className="text-text-gray text-sm mb-4">{description}</p>
				<div className="mb-4 rounded-xl border border-dark-green/10 bg-light-green/5 p-3">
					<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-1">Subject</p>
					<p className="text-sm font-semibold text-text-dark break-words">{message.subject}</p>
					<p className="text-xs text-text-gray mt-2 whitespace-pre-wrap break-words">{message.message}</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-3">
					<label className="block text-sm font-semibold text-text-dark">
						{isDelete ? "Reason for archiving" : "Admin message"}
						<textarea
							rows={4}
							value={adminMessage}
							onChange={(e) => setAdminMessage(e.target.value)}
							placeholder={isDelete ? "Explain why this message is being archived..." : "Write the message that should appear before closing..."}
							className="mt-1 w-full rounded-lg border border-dark-green/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30"
						/>
					</label>
					{!isDelete && (
						<label className="inline-flex items-center gap-2 text-sm text-text-dark">
							<input
								type="checkbox"
								checked={closeTicket}
								onChange={(e) => setCloseTicket(e.target.checked)}
								className="rounded border-dark-green/30"
							/>
							Close ticket
						</label>
					)}
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
							{loading ? "Working..." : submitLabel}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

MessageActionModal.propTypes = {
	actionType: PropTypes.oneOf(["resolve", "delete"]).isRequired,
	message: PropTypes.object,
	onCancel: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
	loading: PropTypes.bool,
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
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isAdmin, setIsAdmin] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value.trim());

	const isStrongPassword = (value) => {
		const trimmed = value.trim();
		return trimmed.length >= 8 && /[A-Za-z]/.test(trimmed) && /\d/.test(trimmed);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
			toast.error("All fields are required.");
			return;
		}
		if (!isValidEmail(email)) {
			toast.error("Please enter a valid email address.");
			return;
		}
		if (!isStrongPassword(password)) {
			toast.error("Password must be at least 8 characters and include letters and numbers.");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}
		onSave({
			name: name.trim(),
			email: email.trim(),
			password,
			confirmPassword,
			isAdmin,
		});
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
						<div className="mt-1 relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-lg border border-dark-green/20 px-3 py-2 pr-11 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((value) => !value)}
								className="absolute inset-y-0 right-0 flex items-center px-3 text-text-gray hover:text-dark-green transition-colors"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
							</button>
						</div>
						<p className="mt-1 text-[11px] text-text-gray">
							Use at least 8 characters with letters and numbers.
						</p>
					</label>
					<label className="block text-sm font-semibold text-text-dark">
						Confirm Password
						<div className="mt-1 relative">
							<input
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full rounded-lg border border-dark-green/20 px-3 py-2 pr-11 focus:outline-none focus:ring-2 focus:ring-dark-green/30"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword((value) => !value)}
								className="absolute inset-y-0 right-0 flex items-center px-3 text-text-gray hover:text-dark-green transition-colors"
								aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
							>
								{showConfirmPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
							</button>
						</div>
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

function UserPostsModal({ user, posts, onClose, onViewPost, onDeletePost, loading }) {
	if (!user) return null;

	return (
		<div className="fixed inset-0 z-[2050] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-3">
					<div>
						<h3 className="text-text-dark font-extrabold text-lg">Posts by {user.name}</h3>
						<p className="text-text-gray text-xs break-all">{user.email}</p>
					</div>
					<button onClick={onClose} className="text-text-gray hover:text-dark-green transition-colors">
						<MdClose size={20} />
					</button>
				</div>
				{loading ? (
					<div className="flex justify-center items-center py-10">
						<div className="w-10 h-10 rounded-full border-4 border-off-white border-t-dark-green animate-spin" />
					</div>
				) : posts.length === 0 ? (
					<p className="text-text-gray text-sm py-4 text-center">This user has not created any posts yet.</p>
				) : (
					<table>
						<thead>
							<tr>
								<th>Title</th>
								<th>Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{posts.map((post) => (
								<tr key={post._id}>
									<td className="max-w-[260px] truncate font-medium cursor-pointer text-dark-green hover:underline" onClick={() => onViewPost(post._id)}>
										{post.title}
									</td>
									<td className="text-xs text-text-gray">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</td>
									<td className="whitespace-nowrap text-xs">
										<button type="button" className="details mr-2" onClick={() => onViewPost(post._id)}>
											View
										</button>
										<button type="button" className="delete" onClick={() => onDeletePost(post._id)}>
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
		</div>
	);
}

UserPostsModal.propTypes = {
	user: PropTypes.object,
	posts: PropTypes.arrayOf(PropTypes.object).isRequired,
	onClose: PropTypes.func.isRequired,
	onViewPost: PropTypes.func.isRequired,
	onDeletePost: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

function ViewMessageModal({ message, onClose, onReply, replyLoading }) {
	const [replyText, setReplyText] = useState("");
	const [sendEmail, setSendEmail] = useState(true);
	const [sendPush, setSendPush] = useState(true);
	const [previewSrc, setPreviewSrc] = useState(null);

	const openPreview = (src) => setPreviewSrc(src);
	const closePreview = () => setPreviewSrc(null);

	if (!message) return null;

	const handleReply = () => {
		const trimmed = replyText.trim();
		if (!trimmed) return;
		onReply(message._id, {
			message: trimmed,
			channels: {
				email: sendEmail,
				push: sendPush,
			},
		});
		setReplyText("");
	};

	return (
		<div className="fixed inset-0 z-[2050] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
			<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-5">
					<h3 className="text-text-dark font-extrabold text-xl">Message Details</h3>
					<button onClick={onClose} className="text-text-gray hover:text-dark-green transition-colors">
						<MdClose size={24} />
					</button>
				</div>
				<div className="space-y-5">
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-light-green/5 rounded-lg p-4 border border-light-green/20">
							<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-1">Name</p>
							<p className="text-text-dark font-medium">{message.name}</p>
							{message.user && (
								<p className="text-[11px] text-dark-green font-semibold mt-2">Signed-in user</p>
							)}
						</div>
						<div className="bg-light-green/5 rounded-lg p-4 border border-light-green/20">
							<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-1">Email</p>
							<p className="text-text-dark font-medium break-all">{message.email}</p>
						</div>
					</div>
					<div className="bg-light-green/5 rounded-lg p-4 border border-light-green/20">
						<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-2">Subject</p>
						<p className="text-text-dark font-medium">{message.subject}</p>
					</div>
					<div className="bg-light-green/5 rounded-lg p-4 border border-light-green/20">
						<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-2">Message</p>
								<p className="text-text-dark whitespace-pre-wrap">{message.message}</p>
									{message.attachment && (
										<div className="mt-3">
											<p className="text-xs text-text-gray mb-2">Attachment</p>
											<img src={message.attachment} alt="attachment" className="max-w-full rounded-md border border-dark-green/10 cursor-pointer" onClick={() => openPreview(message.attachment)} />
										</div>
									)}
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-light-green/5 rounded-lg p-4 border border-light-green/20">
							<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-1">Status</p>
							{message.isResolved ? (
								<span className="inline-block bg-light-green text-dark-green text-xs font-bold px-2.5 py-1 rounded-full">
									{message.resolutionType === "deleted" ? "Deleted" : "Closed"}
								</span>
							) : (
								<span className="inline-block bg-orange/10 text-orange text-xs font-bold px-2.5 py-1 rounded-full">Unresolved</span>
							)}
						</div>
						<div className="bg-light-green/5 rounded-lg p-4 border border-light-green/20">
							<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-1">Received</p>
							<p className="text-text-dark font-medium">{new Date(message.createdAt).toLocaleString()}</p>
						</div>
					</div>
					{message.emailConfirmationSent && (
						<div className="bg-light-green/10 rounded-lg p-3 border border-light-green/30">
							<p className="text-xs text-dark-green font-semibold">✓ Confirmation email sent to user</p>
						</div>
					)}

					{message.isResolved && (
						<div className="bg-light-green/5 rounded-lg p-4 border border-light-green/20">
							<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-2">Resolution details</p>
							<p className="text-sm text-text-dark font-medium mb-1">
								Type: {message.resolutionType === "deleted" ? "Deleted" : "Closed"}
							</p>
							{message.resolutionMessage && (
								<p className="text-sm text-text-dark whitespace-pre-wrap break-words mb-1">
									Message: {message.resolutionMessage}
								</p>
							)}
							{message.resolutionReason && (
								<p className="text-sm text-text-dark whitespace-pre-wrap break-words">
									Reason: {message.resolutionReason}
								</p>
							)}
						</div>
					)}

					<div className="bg-off-white border border-dark-green/10 rounded-xl p-4">
						<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-2">Conversation</p>
						{Array.isArray(message.replies) && message.replies.length > 0 ? (
								<div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
								{message.replies.map((reply, index) => (
										<div key={`${reply.createdAt || "reply"}-${index}`} className="bg-light-green/5 border border-light-green/20 rounded-lg p-3">
											<p className="text-xs font-semibold text-text-gray mb-1">
												{reply.sender === "admin" ? "Admin" : "User"} · {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ""}
											</p>
											<p className="text-text-dark text-sm whitespace-pre-wrap">{reply.message}</p>
											{reply.attachment && (
												<div className="mt-2">
													<img src={reply.attachment} alt="reply-attachment" className="max-w-full max-h-[60vh] object-contain rounded-md border border-dark-green/10 cursor-pointer" onClick={() => openPreview(reply.attachment)} />
													</div>
												)}
										</div>
								))}
							</div>
						) : (
							<p className="text-xs text-text-gray">No replies yet.</p>
						)}
					</div>

					{!message.isResolved ? (
						<div className="bg-light-green/5 border border-light-green/20 rounded-xl p-4">
							<p className="text-xs font-semibold text-dark-green uppercase tracking-wide mb-2">Reply</p>
							<textarea
								rows={4}
								value={replyText}
								onChange={(e) => setReplyText(e.target.value)}
								placeholder="Write a response to the user..."
								className="w-full rounded-lg border border-dark-green/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 bg-off-white"
							/>
							<div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-gray">
								<label className="inline-flex items-center gap-2">
									<input
										type="checkbox"
										checked={sendEmail}
										onChange={(e) => setSendEmail(e.target.checked)}
										className="rounded border-dark-green/30"
									/>
									Send email
								</label>
								<label className="inline-flex items-center gap-2">
									<input
										type="checkbox"
										checked={sendPush}
										onChange={(e) => setSendPush(e.target.checked)}
										className="rounded border-dark-green/30"
									/>
									Send in-app notification
								</label>
							</div>
							<div className="flex justify-end gap-3 mt-4">
								<button
									type="button"
									onClick={handleReply}
									disabled={replyLoading || !replyText.trim()}
									className="px-4 py-2 rounded-lg bg-dark-green text-white font-bold text-sm hover:bg-dark-green/90 transition-colors disabled:opacity-50"
								>
									{replyLoading ? "Sending..." : "Send reply"}
								</button>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

ViewMessageModal.propTypes = {
	message: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	onReply: PropTypes.func.isRequired,
	replyLoading: PropTypes.bool,
};

function Dashboard() {
	const history = useHistory();
	const [posts, setPosts] = useState([]);
	const [users, setUsers] = useState([]);
	const [reports, setReports] = useState([]);
	const [messages, setMessages] = useState([]);
	const [reviewReports, setReviewReports] = useState([]);
	const [postsPage, setPostsPage] = useState(1);
	const [postsTotalPages, setPostsTotalPages] = useState(1);
	const [postsTotalCount, setPostsTotalCount] = useState(0);
	const [activeTab, setActiveTab] = useState("posts");
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [adminReplyLoading, setAdminReplyLoading] = useState(false);
	const [confirmModal, setConfirmModal] = useState(null);
	const [messageActionModal, setMessageActionModal] = useState(null);
	const [editPostModal, setEditPostModal] = useState(null);
	const [editUserModal, setEditUserModal] = useState(null);
	const [createUserModal, setCreateUserModal] = useState(false);
	const [reportActionModal, setReportActionModal] = useState(null);
	const [reviewDiffModal, setReviewDiffModal] = useState(null);
	const [reportsView, setReportsView] = useState("active");
	const [userPostsModal, setUserPostsModal] = useState(null);

	const [messagesView, setMessagesView] = useState("active");
	const [viewMessageModal, setViewMessageModal] = useState(null);
	const [adminNotificationsOpen, setAdminNotificationsOpen] = useState(false);
	const adminNotificationsRef = useRef(null);
	const fetchData = useCallback(
		async (page = 1) => {
			setLoading(true);
			try {
				const [postsRes, usersRes, reportsRes, messagesRes] = await Promise.all([
					api.fetchPosts(page, { summary: true }),
					api.getAllUsers(),
					api.fetchPostReports(),
					api.fetchContactMessages(1, 100),
				]);

				const postsList = postsRes?.data?.data || postsRes?.data?.posts || postsRes?.data?.results || postsRes?.data || [];
				const usersList = usersRes?.data?.users || usersRes?.data?.data || usersRes?.data || [];
				const reportList = reportsRes?.data?.reports || reportsRes?.data || [];
				const messageList = messagesRes?.data?.data || messagesRes?.data?.messages || messagesRes?.data || [];
				const currentPage = postsRes?.data?.currentPage || page;
				const totalPages = postsRes?.data?.numberOfPages || 1;
				const totalPosts = Number(postsRes?.data?.total);

				setPosts(Array.isArray(postsList) ? postsList : []);
				setUsers(Array.isArray(usersList) ? usersList : []);
				setReports(Array.isArray(reportList) ? reportList : []);
				setMessages(Array.isArray(messageList) ? messageList : []);
				setReviewReports(Array.isArray(reportList) ? reportList.filter((r) => r.status === "under_review") : []);
				setPostsPage(currentPage);
				setPostsTotalPages(totalPages);
				setPostsTotalCount(Number.isFinite(totalPosts) ? totalPosts : 0);
			} catch (error) {
				console.error("Failed to load dashboard data:", error);
				toast.error("Failed to load dashboard data.");
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		const handleOutside = (event) => {
			if (!adminNotificationsOpen) return;
			if (adminNotificationsRef.current && !adminNotificationsRef.current.contains(event.target)) {
				setAdminNotificationsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, [adminNotificationsOpen]);

	const handlePostsPageChange = (page) => {
		if (!page || page === postsPage) return;
		if (page < 1 || page > postsTotalPages) return;
		fetchData(page);
	};

	const handleDeletePost = (postId) => {
		setConfirmModal({
			message: "Delete this post?",
			onConfirm: async () => {
				setActionLoading(true);
				try {
					await api.deletePost(postId);
					toast.success("Post deleted.");
					setPosts((prev) => prev.filter((p) => p._id !== postId));
					setUserPostsModal((prev) =>
						prev ? { ...prev, posts: prev.posts.filter((p) => p._id !== postId) } : prev,
					);
					// Close the confirm dialog immediately; refresh in background
					setConfirmModal(null);
					fetchData(postsPage);
				} catch (error) {
					console.error(error);
					toast.error("Failed to delete post.");
				} finally {
					setActionLoading(false);
				}
			},
			onCancel: () => setConfirmModal(null),
		});
	};

	const handleOpenUserPosts = async (user) => {
		if (!user || !user._id) return;
		setUserPostsModal({ user, posts: [], loading: true });
		try {
			const { data } = await api.fetchUserProfile(user._id);
			setUserPostsModal({
				user: data.user || user,
				posts: Array.isArray(data.posts) ? data.posts : [],
				loading: false,
			});
		} catch (error) {
			console.error("Failed to load user posts", error);
			setUserPostsModal(null);
			toast.error("Failed to load user posts.");
		}
	};

	const handleDeleteUser = (userId) => {
		setConfirmModal({
			message: "Delete this user?",
			onConfirm: async () => {
				setActionLoading(true);
				try {
					await api.deleteUser(userId);
					toast.success("User deleted.");
					setConfirmModal(null);
					fetchData(postsPage);
				} catch (error) {
					console.error(error);
					toast.error("Failed to delete user.");
				} finally {
					setActionLoading(false);
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
			await fetchData(postsPage);
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
			await fetchData(postsPage);
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
			await fetchData(postsPage);
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
			await fetchData(postsPage);
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

	const openUserProfile = (userId) => {
		if (!userId) return;
		history.push(`/profile/${userId}`);
	};

	const handleMarkMessageAsResolved = (messageId) => {
		setConfirmModal({
			message: "Mark this message as resolved?",
			confirmLabel: "Yes",
			cancelLabel: "No",
			onConfirm: async () => {
				setConfirmModal(null);
				setMessageActionModal({ type: "resolve", messageId, message: messages.find((m) => String(m._id) === String(messageId)) || null });
			},
			onCancel: () => setConfirmModal(null),
		});
	};

	const handleDeleteMessage = (messageId) => {
		setMessageActionModal({ type: "delete", messageId, message: messages.find((m) => String(m._id) === String(messageId)) || null });
	};

	const handleAdminReplyMessage = async (messageId, payload) => {
		setAdminReplyLoading(true);
		try {
			const { data } = await api.adminReplyContactMessage(messageId, payload);
			const updated = data?.data || data;
			if (updated?._id) {
				setMessages((prev) =>
					prev.map((m) => (m._id === updated._id ? updated : m)),
				);
				setViewMessageModal(null);
				setMessagesView("followup");
			}
			toast.success("Reply sent.");
		} catch (error) {
			console.error(error);
			const message = error?.response?.data?.message || "Failed to send reply.";
			toast.error(message);
		} finally {
			setAdminReplyLoading(false);
		}
	};

	const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
	const totalReports = reports.length;
	const activeReports = reports.filter((r) => ["open", "alerted", "under_review"].includes(r.status));
	const openReportsCount = activeReports.filter((r) => r.status === "open" || r.status === "alerted").length;
	const receivedReviewsCount = reviewReports.length;
	const historyReports = reports.filter((r) => !["open", "alerted", "under_review"].includes(r.status));
	const unresolvedMessages = messages.filter((m) => !m.isResolved);
	const followUpMessages = messages.filter(
		(m) => !m.isResolved && Array.isArray(m.replies) && m.replies.length > 0,
	);
	const activeMessages = messages.filter(
		(m) => !m.isResolved && (!Array.isArray(m.replies) || m.replies.length === 0),
	);
	const resolvedMessages = messages.filter((m) => m.isResolved);

	const adminNotifications = [
		...openReportsCount
			? activeReports
				.filter((report) => report.status === "open" || report.status === "alerted")
				.map((report) => ({
					id: `report-open-${report._id}`,
					type: "report_open",
					label: `Report needs review: ${report.post?.title || "Untitled post"}`,
					createdAt: report.createdAt,
					onClick: () => {
						setActiveTab("reports");
						setReportsView("active");
						setAdminNotificationsOpen(false);
					},
				}))
			: [],
		...reviewReports.map((report) => ({
			id: `report-review-${report._id}`,
			type: "report_review",
			label: `Review submitted changes: ${report.post?.title || "Untitled post"}`,
			createdAt: report.updatedAt || report.createdAt,
			onClick: () => {
				setActiveTab("reports");
				setReportsView("active");
				setAdminNotificationsOpen(false);
			},
		})),
		...unresolvedMessages.map((message) => ({
			id: `message-${message._id}`,
			type: "message",
			label: `New message: ${message.subject || "(No subject)"}`,
			createdAt: message.createdAt,
			onClick: () => {
				setActiveTab("messages");
				setMessagesView("active");
				setAdminNotificationsOpen(false);
			},
		})),
	]
		.filter(Boolean)
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

	return (
		<div className="min-h-screen bg-off-white">
			{confirmModal && (
				<ConfirmModal
					message={confirmModal.message}
					onConfirm={confirmModal.onConfirm}
					onCancel={confirmModal.onCancel}
					confirmLabel={confirmModal.confirmLabel}
					cancelLabel={confirmModal.cancelLabel}
				/>
			)}
			{messageActionModal && (
				<MessageActionModal
					actionType={messageActionModal.type}
					message={messageActionModal.message}
					onCancel={() => setMessageActionModal(null)}
					onSubmit={async (payload) => {
						setActionLoading(true);
						try {
							const isDelete = messageActionModal.type === "delete";
							const { data } = isDelete
								? await api.deleteContactMessage(String(messageActionModal.messageId), payload)
								: await api.markContactMessageAsResolved(String(messageActionModal.messageId), payload);
							const updated = data?.data || data;
							if (updated?._id) {
								setMessages((prev) => prev.map((m) => (String(m._id) === String(updated._id) ? updated : m)));
								setViewMessageModal((prev) => (prev && String(prev._id) === String(updated._id) ? updated : prev));
							}
							toast.success(isDelete ? "Message archived in resolved history." : payload.closeTicket ? "Message closed." : "Reply saved.");
							setMessageActionModal(null);
							if (isDelete || payload.closeTicket) {
								setMessagesView("resolved");
							}
						} catch (error) {
							console.error(error);
							const message = error?.response?.data?.message || (messageActionModal.type === "delete" ? "Failed to archive message." : "Failed to update message.");
							toast.error(message);
						} finally {
							setActionLoading(false);
						}
					}}
					loading={actionLoading}
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
			{userPostsModal && (
				<UserPostsModal
					user={userPostsModal.user}
					posts={userPostsModal.posts}
					onClose={() => setUserPostsModal(null)}
					onViewPost={openPostDetails}
					onDeletePost={handleDeletePost}
					loading={userPostsModal.loading}
				/>
			)}
			{viewMessageModal && (
				<ViewMessageModal
					message={viewMessageModal}
					onClose={() => setViewMessageModal(null)}
					onReply={handleAdminReplyMessage}
					replyLoading={adminReplyLoading}
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
						<div className="flex items-center gap-3" ref={adminNotificationsRef}>
							<div className="relative">
								<button
									type="button"
									aria-label="Admin notifications"
									onClick={() => setAdminNotificationsOpen((open) => !open)}
									className="relative w-10 h-10 flex items-center justify-center rounded-full border border-light-green/30 text-light-green hover:bg-light-green/15 transition-colors"
								>
									<MdNotifications size={18} />
									{adminNotifications.length > 0 && (
										<span className="absolute -top-1 -right-1 bg-orange text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold">
											{adminNotifications.length}
										</span>
									)}
								</button>

								{adminNotificationsOpen && (
									<div className="absolute right-0 top-full mt-2 w-80 bg-white/95 rounded-2xl shadow-lg border border-dark-green/5 backdrop-blur-sm z-50">
										<div className="flex items-center justify-between px-3 py-2 border-b border-dark-green/10">
											<p className="text-xs font-semibold text-text-dark">Admin notifications</p>
											<p className="text-[11px] text-text-gray">
												{adminNotifications.length} total
											</p>
										</div>
										<div className="max-h-80 overflow-y-auto">
											{adminNotifications.length === 0 && (
												<p className="px-3 py-4 text-[11px] text-text-gray text-center">
													No admin notifications right now.
												</p>
											)}
											{adminNotifications.map((item) => (
												<button
													key={item.id}
													type="button"
													onClick={item.onClick}
													className="w-full text-left px-3 py-2.5 text-[11px] border-b border-dark-green/5 last:border-b-0 hover:bg-light-green/10 text-text-dark"
												>
													<div className="flex items-start gap-2">
														<div className="mt-0.5 text-dark-green">
															{item.type === "message" ? (
																<MdMessage size={14} />
															) : (
																<MdReport size={14} />
															)}
														</div>
														<span className="block truncate">{item.label}</span>
													</div>
												</button>
											))}
										</div>
									</div>
								)}
							</div>

							<button
								onClick={() => fetchData(postsPage)}
								disabled={loading}
								className="flex items-center gap-1.5 bg-light-green/15 hover:bg-light-green/25 border border-light-green/30 text-light-green font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
							>
								<MdRefresh size={18} className={loading ? "animate-spin" : ""} />
								Refresh
							</button>
						</div>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
							{[
								{
									label: "Total Posts",
									value: postsTotalCount,
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
							Posts ({postsTotalCount})
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
						<button
							onClick={() => setActiveTab("messages")}
							className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors border-b-2 -mb-[1px] ${
								activeTab === "messages" ? "border-dark-green text-dark-green bg-off-white" : "border-transparent text-text-gray hover:text-dark-green"
							}`}
						>
							<MdMessage size={16} />
							Messages ({unresolvedMessages.length})
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
								<>
									<table>
										<thead>
											<tr>
												<th>Title</th>
												<th>Author</th>
													<th>Description</th>
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
														<td className="max-w-[260px] text-xs" title={post.message || ""}>
															{post.message
																? post.message.length > 80
																	? `${post.message.slice(0, 80)}…`
																	: post.message
																: ""}
														</td>
													<td>{post.likes?.length || 0}</td>
													<td>{typeof post.commentsCount === "number" ? post.commentsCount : post.comments?.length || 0}</td>
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
									{postsTotalPages > 1 && (
										<div className="flex items-center justify-between mt-4 gap-3 text-sm">
											<button
												type="button"
												onClick={() => handlePostsPageChange(postsPage - 1)}
												disabled={postsPage === 1}
												className="px-3 py-1.5 rounded-lg border border-dark-green/20 text-text-dark hover:bg-light-green/20 disabled:opacity-40 disabled:hover:bg-transparent"
											>
												Previous
											</button>
											<div className="flex flex-wrap justify-center gap-1">
												{Array.from({ length: postsTotalPages }, (_, idx) => {
													const page = idx + 1;
													const isActive = page === postsPage;
													return (
														<button
															key={page}
															type="button"
															onClick={() => handlePostsPageChange(page)}
															disabled={isActive}
															className={`min-w-[2.25rem] px-2 py-1 rounded-md border text-xs font-semibold transition-colors ${
																isActive
																	? "bg-dark-green text-off-white border-dark-green cursor-default"
																	: "bg-off-white text-text-dark border-dark-green/20 hover:bg-light-green/20"
															}`}
														>
															{page}
														</button>
													);
												})}
											</div>
											<button
												type="button"
												onClick={() => handlePostsPageChange(postsPage + 1)}
												disabled={postsPage === postsTotalPages}
												className="px-3 py-1.5 rounded-lg border border-dark-green/20 text-text-dark hover:bg-light-green/20 disabled:opacity-40 disabled:hover:bg-transparent"
											>
												Next
											</button>
										</div>
									)}
								</>
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
													<button
														type="button"
														className="details mr-2"
														onClick={() => handleOpenUserPosts(user)}
													>
														Details
													</button>
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

					{!loading && activeTab === "messages" && (
						<div className="dashboard-panel overflow-x-auto">
							<h2 className="text-dark-green font-extrabold text-lg mb-4">Contact Messages</h2>
							<div className="mb-6 flex items-center justify-between">
								<div className="flex gap-2">
									<button
										onClick={() => setMessagesView("active")}
										className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors border ${
											messagesView === "active"
												? "bg-light-green text-dark-green border-light-green"
												: "bg-transparent text-text-gray border-dark-green/20 hover:text-dark-green"
										}`}
									>
										Unresolved ({activeMessages.length})
									</button>
									<button
										onClick={() => setMessagesView("followup")}
										className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors border ${
											messagesView === "followup"
												? "bg-light-green text-dark-green border-light-green"
												: "bg-transparent text-text-gray border-dark-green/20 hover:text-dark-green"
										}`}
									>
										Follow up ({followUpMessages.length})
									</button>
									<button
										onClick={() => setMessagesView("resolved")}
										className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors border ${
											messagesView === "resolved"
												? "bg-light-green text-dark-green border-light-green"
												: "bg-transparent text-text-gray border-dark-green/20 hover:text-dark-green"
										}`}
									>
										Resolved ({resolvedMessages.length})
									</button>
								</div>
							</div>
							{(messagesView === "active"
								? activeMessages
								: messagesView === "followup"
									? followUpMessages
									: resolvedMessages
							).length === 0 ? (
								<p className="text-text-gray text-sm py-6 text-center">No messages yet.</p>
							) : (
								<table>
									<thead>
										<tr>
											<th>Name</th>
											<th>Subject</th>
											<th>Message</th>
											<th>Status</th>
											<th>Date</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{(messagesView === "active"
											? activeMessages
											: messagesView === "followup"
												? followUpMessages
												: resolvedMessages
										).map((message) => (
												<tr key={message._id} className={message.user?._id ? "signed-in-row" : ""}>
													<td className="font-medium align-top text-left message-name-cell">
														<div className="flex flex-col items-start text-left gap-1">
															<div className="flex items-center justify-start text-left">
															{message.user?._id ? (
																<button
																	type="button"
																	onClick={() => openUserProfile(message.user._id)}
																	className="text-dark-green hover:underline font-semibold leading-tight text-left"
																>
																	{message.user?.name || message.name}
																</button>
															) : (
																<span className="font-semibold leading-tight text-left">{message.name}</span>
															)}
														</div>
														<span className="text-[11px] text-text-gray leading-tight">{message.user?.email || message.email}</span>
													</div>
												</td>
												<td className="max-w-[180px] truncate text-xs">{message.subject}</td>
												<td className="max-w-[250px] truncate text-xs" title={message.message}>{message.message}</td>
												<td className="text-xs">
													{message.isResolved ? (
														<span className="bg-light-green text-dark-green text-xs font-bold px-2 py-0.5 rounded-full">
															{message.resolutionType === "deleted" ? "Deleted" : "Closed"}
														</span>
													) : (
														<span className="bg-orange/10 text-orange text-xs font-bold px-2 py-0.5 rounded-full">Unresolved</span>
													)}
												</td>
												<td className="text-xs text-text-gray">{new Date(message.createdAt).toLocaleDateString()}</td>
												<td className="whitespace-nowrap">
													<button
														type="button"
														onClick={() => setViewMessageModal(message)}
														className="details mr-2"
													>
														View
													</button>
													{!message.isResolved && (
														<button
															type="button"
															onClick={() => handleMarkMessageAsResolved(message._id)}
															className="edit mr-2"
														>
															Mark resolved
														</button>
													)}
													{!message.isResolved ? (
														<button
															type="button"
															onClick={() => handleDeleteMessage(message._id)}
															className="delete"
														>
															Delete
														</button>
													) : null}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					)}
				</div>
			</div>
		);
}

export default Dashboard;