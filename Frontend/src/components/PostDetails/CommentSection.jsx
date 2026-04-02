import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { MdMoreHoriz, MdClose } from "react-icons/md";
import { commentPost, editComment, deleteComment } from "../../actions/posts";

const parseComment = (rawComment) => {
	const extractCommentText = (value) => {
		if (value === null || value === undefined) return "";
		if (typeof value === "string") return value.trim();
		if (typeof value === "number" || typeof value === "boolean") {
			return String(value);
		}

		if (Array.isArray(value)) {
			for (const item of value) {
				const extracted = extractCommentText(item);
				if (extracted) return extracted;
			}
			return "";
		}

		if (typeof value === "object") {
			for (const key of ["text", "comment", "body", "message", "value"]) {
				const extracted = extractCommentText(value[key]);
				if (extracted) return extracted;
			}
		}

		return "";
	};

	if (rawComment && typeof rawComment === "object") {
		return {
			userName: rawComment.userName || "User",
			userId: rawComment.userId || "",
			userAvatar: rawComment.userAvatar || "",
			text: extractCommentText(rawComment),
			editedAt: rawComment.editedAt || null,
		};
	}

	if (typeof rawComment !== "string") {
		return {
			userName: "User",
			userId: "",
			userAvatar: "",
			text: "",
			editedAt: null,
		};
	}

	const trimmed = rawComment.trim();
	if (!trimmed) {
		return { userName: "User", userId: "", userAvatar: "", text: "", editedAt: null };
	}

	if (trimmed.startsWith("{")) {
		try {
			const parsed = JSON.parse(trimmed);
			if (parsed && typeof parsed === "object") {
				return {
					userName: parsed.userName || "User",
					userId: parsed.userId || "",
					userAvatar: parsed.userAvatar || "",
					text: extractCommentText(parsed),
					editedAt: parsed.editedAt || null,
				};
			}
		} catch (_error) {
			// fallback to legacy parser
		}
	}

	const [userName, ...commentParts] = trimmed.split(": ");
	return {
		userName: userName || "User",
		userId: "",
		userAvatar: "",
		text: commentParts.join(": "),
		editedAt: null,
	};
};

const CommentSection = ({ post }) => {
	const [comments, setComments] = useState(post?.comments);
	const commentRef = useRef();
	const [comment, setComment] = useState("");
	const [editingIndex, setEditingIndex] = useState(null);
	const [editingText, setEditingText] = useState("");
	const [openMenuIndex, setOpenMenuIndex] = useState(null);
	const [deleteIndex, setDeleteIndex] = useState(null);
	const dispatch = useDispatch();
	const history = useHistory();
	const user = useSelector((state) => state.auth.authData);
	const hasComments = Array.isArray(comments) && comments.length > 0;
	const currentUserId = user?.result?.googleId || user?.result?._id || "";
	const isPostOwner =
		currentUserId && post?.creator
			? String(currentUserId) === String(post.creator)
			: false;

	const handleClick = async () => {
		const payload = {
			comment,
			userName: user?.result?.name,
			userAvatar: user?.result?.profileImage || user?.result?.imageUrl || "",
		};
		const newComment = await dispatch(commentPost(payload, post._id));
		setComments(newComment);
		setComment("");
		commentRef.current.scrollIntoView({ behavior: "smooth" });
	};

	const handleCommentKeyDown = (event) => {
		if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
		event.preventDefault();
		handleClick();
	};

	const startEdit = (index, text) => {
		setEditingIndex(index);
		setEditingText(text);
		setOpenMenuIndex(null);
	};

	const cancelEdit = () => {
		setEditingIndex(null);
		setEditingText("");
	};

	const handleSaveEdit = async (index) => {
		const updatedComments = await dispatch(
			editComment(post._id, index, editingText),
		);
		if (updatedComments) {
			setComments(updatedComments);
			cancelEdit();
		}
	};

	const handleDelete = async (index) => {
		setDeleteIndex(index);
		setOpenMenuIndex(null);
	};

	const confirmDelete = async () => {
		if (deleteIndex === null) return;

		const index = deleteIndex;
		setDeleteIndex(null);

		const updatedComments = await dispatch(deleteComment(post._id, index));
		if (updatedComments) {
			setComments(updatedComments);
			if (editingIndex === index) cancelEdit();
		}
	};

	const cancelDelete = () => {
		setDeleteIndex(null);
	};

	return (
		<div className="bg-gradient-to-br from-light-green/10 via-off-white to-light-green/5 p-5 rounded-[18px] border-2 border-light-green/50 shadow-lg">
			{/* Header */}
			<div className="mb-5 pb-4 border-b-2 border-light-green/40">
				<h3 className="text-dark-green font-extrabold text-lg flex items-center gap-2">
					<span className="text-xl">💬</span>
					Comments {hasComments && `(${comments.length})`}
				</h3>
				{!hasComments && (
					<p className="text-xs text-text-gray italic mt-1">No comments yet. Be the first to share your thoughts!</p>
				)}
			</div>

			{/* Comments list */}
			{hasComments && (
				<div
					className="max-h-[300px] overflow-y-auto bg-off-white/60 p-4 rounded-[15px] border-2 border-light-green/30 shadow-inner mb-5 space-y-3"
					style={{
						scrollbarWidth: "thin",
						scrollbarColor: "#affa01 transparent",
					}}
				>
					{comments.map((rawComment, i) => {
						const parsed = parseComment(rawComment);
						const profilePath = parsed.userId ? `/profile/${parsed.userId}` : null;
						const isCommentOwner =
							(currentUserId && parsed.userId && String(currentUserId) === String(parsed.userId)) ||
							(!parsed.userId && user?.result?.name && parsed.userName === user.result.name);
						const canDeleteComment = isCommentOwner || isPostOwner;
						const isEditing = editingIndex === i;
						return (
							<div
								key={i}
								className="relative bg-gradient-to-r from-light-green/20 to-dark-green/10 px-4 py-3 rounded-[12px] border-l-4 border-light-green shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-1"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1 pr-10">
										<div className="flex items-center gap-2 mb-1.5">
											{parsed.userAvatar ? (
												<img
													src={parsed.userAvatar}
													alt={parsed.userName}
													className="w-7 h-7 rounded-full object-cover border border-light-green/60"
												/>
											) : (
												<span className="w-7 h-7 rounded-full bg-dark-green text-off-white text-[0.65rem] font-bold flex items-center justify-center">
													{parsed.userName?.charAt(0)?.toUpperCase() || "U"}
												</span>
											)}
											{profilePath ? (
												<RouterLink
													to={profilePath}
													className="text-dark-green font-bold text-sm hover:underline"
												>
													{parsed.userName}
												</RouterLink>
											) : (
												<span className="text-dark-green font-bold text-sm">
													{parsed.userName}
												</span>
											)}
											{parsed.editedAt && (
												<span className="text-[0.65rem] text-text-gray italic">(edited)</span>
											)}
										</div>

										{isEditing ? (
											<div className="space-y-2">
												<textarea
													rows={2}
													value={editingText}
													onChange={(e) => setEditingText(e.target.value)}
													className="w-full bg-white border border-light-green/60 rounded-lg px-3 py-2 text-sm outline-none focus:border-dark-green"
												/>
												<div className="flex items-center gap-2">
													<button
														onClick={() => handleSaveEdit(i)}
														disabled={!editingText.trim()}
														className="text-xs font-bold bg-dark-green text-off-white px-2.5 py-1 rounded-md disabled:opacity-50"
													>
														Save
													</button>
													<button
														onClick={cancelEdit}
														className="text-xs font-semibold text-text-gray hover:underline"
													>
														Cancel
													</button>
												</div>
											</div>
										) : (
											<p className="text-sm text-text-dark leading-relaxed">{parsed.text}</p>
										)}
									</div>

								</div>

								{canDeleteComment && !isEditing && (
									<div className="absolute top-2.5 right-2.5">
										<button
											type="button"
											onClick={() =>
												setOpenMenuIndex((prev) =>
													prev === i ? null : i,
												)
											}
											className="h-7 w-7 rounded-full flex items-center justify-center text-dark-green hover:bg-dark-green/10 transition-colors"
											aria-label="Comment options"
										>
											<MdMoreHoriz size={18} />
										</button>

										{openMenuIndex === i && (
											<div className="absolute right-0 mt-1 w-24 rounded-lg border border-light-green/60 bg-off-white shadow-lg py-1 z-10">
												{isCommentOwner && (
													<button
														type="button"
														onClick={() => startEdit(i, parsed.text)}
														className="w-full text-left px-3 py-1.5 text-xs font-semibold text-dark-green hover:bg-light-green/20"
													>
														Edit
													</button>
												)}
												<button
													type="button"
													onClick={() => handleDelete(i)}
													className="w-full text-left px-3 py-1.5 text-xs font-semibold text-orange hover:bg-light-green/20"
												>
													Delete
												</button>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}

					<div ref={commentRef} className="h-0" />
				</div>
			)}

			{/* Comment form - integrated inside */}
			{user?.result?.name ? (
				<div className="flex flex-col gap-3">
					<div className="relative">
						<label className="text-xs font-bold text-dark-green mb-2 block">Your comment</label>
						<textarea
							rows={3}
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							onKeyDown={handleCommentKeyDown}
							placeholder="Share your thoughts about this amazing place..."
							className="w-full bg-white border-2 border-light-green/50 hover:border-light-green focus:border-dark-green focus:outline-none rounded-[12px] text-sm px-4 py-3 text-text-dark resize-none transition-all duration-300 shadow-sm focus:shadow-md focus:ring-2 focus:ring-light-green/30"
						/>
					</div>

					<button
						onClick={handleClick}
						disabled={!comment.trim()}
						className="w-full text-sm bg-gradient-to-r from-dark-green to-dark-green/80 hover:from-light-green hover:to-light-green/80 disabled:from-gray-300 disabled:to-gray-300 text-off-white hover:text-text-dark disabled:text-gray-500 font-bold py-2.5 px-4 rounded-[12px] transition-all duration-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:translate-y-0.5 border border-light-green/30"
					>
						✓ Post Comment
					</button>
				</div>
			) : (
				<div
					className="bg-gradient-to-br from-dark-green/5 via-light-green/10 to-dark-green/5 p-6 rounded-[15px] border-2 border-dashed border-light-green shadow-md flex flex-col items-center justify-center gap-3 backdrop-blur-sm"
				>
					<div className="text-4xl">🔐</div>
					<p className="text-dark-green font-bold text-sm text-center">
						Sign in to share your thoughts
					</p>
					<p className="text-xs text-text-gray text-center max-w-xs">
						Join our community and leave comments on amazing travel spots
					</p>
					<button
						onClick={() => history.push("/auth")}
						className="w-40 text-sm bg-gradient-to-r from-dark-green to-dark-green/80 hover:from-light-green hover:to-light-green/80 text-off-white hover:text-text-dark font-bold py-2.5 px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl border border-light-green/40"
					>
						🔑 Sign In
					</button>
				</div>
			)}

			{deleteIndex !== null && (
				<div className="fixed inset-0 z-[2100] flex items-center justify-center bg-dark-green/70 backdrop-blur-sm px-4">
					<div className="bg-off-white rounded-2xl shadow-[0_16px_48px_rgba(12,52,44,0.3)] border border-light-green p-6 w-full max-w-sm">
						<div className="flex items-start justify-between gap-3 mb-2">
							<h3 className="text-text-dark font-extrabold text-lg">Delete comment?</h3>
							<button
								type="button"
								onClick={cancelDelete}
								className="text-text-gray hover:text-dark-green transition-colors"
								aria-label="Close delete confirmation"
							>
								<MdClose size={20} />
							</button>
						</div>
						<p className="text-text-gray text-sm mb-6">
							This comment will be removed permanently. This action cannot be undone.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								type="button"
								onClick={cancelDelete}
								className="px-4 py-2 rounded-lg border border-dark-green/20 text-dark-green font-semibold text-sm hover:bg-dark-green/5 transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={confirmDelete}
								className="px-4 py-2 rounded-lg bg-orange hover:bg-orange-hover text-white font-bold text-sm transition-colors"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

CommentSection.propTypes = {
	post: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		comments: PropTypes.arrayOf(PropTypes.string),
	}).isRequired,
};

export default CommentSection;
