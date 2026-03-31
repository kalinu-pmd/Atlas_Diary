import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { MdLogin } from "react-icons/md";
import { commentPost } from "../../actions/posts";

const CommentSection = ({ post }) => {
	const [comments, setComments] = useState(post?.comments);
	const commentRef = useRef();
	const [comment, setComment] = useState("");
	const dispatch = useDispatch();
	const history = useHistory();
	const user = useSelector((state) => state.auth.authData);
	const hasComments = Array.isArray(comments) && comments.length > 0;

	const handleClick = async () => {
		const commentFinal = `${user.result.name}: ${comment}`;
		const newComment = await dispatch(commentPost(commentFinal, post._id));
		setComments(newComment);
		setComment("");
		commentRef.current.scrollIntoView({ behavior: "smooth" });
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
					{comments.map((c, i) => {
						const [userName, ...commentParts] = c.split(": ");
						const commentText = commentParts.join(": ");
						return (
							<div
								key={i}
								className="bg-gradient-to-r from-light-green/20 to-dark-green/10 px-4 py-3 rounded-[12px] border-l-4 border-light-green shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-1"
							>
								<p className="text-xs text-text-dark leading-relaxed">
									<strong className="text-dark-green font-bold text-sm block mb-1.5">
										✍️ {userName}
									</strong>
									<span className="text-text-dark">{commentText}</span>
								</p>
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
