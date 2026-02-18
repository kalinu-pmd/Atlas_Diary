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

	const handleClick = async () => {
		const commentFinal = `${user.result.name}: ${comment}`;
		const newComment = await dispatch(commentPost(commentFinal, post._id));
		setComments(newComment);
		setComment("");
		commentRef.current.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div className="bg-light-green/5 p-3 rounded-lg border border-light-green shadow-sm">
			{/* Comments list */}
			<div
				className="max-h-[240px] overflow-y-auto bg-off-white p-3 rounded-lg border border-dark-green/20 shadow-sm mb-3"
				style={{
					scrollbarWidth: "thin",
					scrollbarColor: "#affa01 #f1f1f1",
				}}
			>
				<h3 className="text-dark-green font-bold text-sm mb-2">
					Comments ({comments.length})
				</h3>

				{comments.length > 0 ? (
					comments.map((c, i) => (
						<div
							key={i}
							className="bg-light-green/10 px-2 py-2 my-1 rounded text-xs border border-dark-green/10"
						>
							<p className="text-xs text-text-dark">
								<strong className="text-dark-green font-semibold">
									{c?.split(": ")[0]}
								</strong>
								<span className="ml-1">
									{c?.split(": ").slice(1).join(": ")}
								</span>
							</p>
						</div>
					))
				) : (
					<p className="text-text-gray italic text-xs text-center">
						No comments yet. Be first!
					</p>
				)}

				<div ref={commentRef} />
			</div>

			{/* Comment form - integrated inside */}
			{user?.result?.name ? (
				<div className="flex flex-col gap-2">
					<textarea
						rows={2}
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Add a comment..."
						className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-light-green focus:outline-none rounded text-xs px-2 py-1.5 text-text-dark resize-none transition-colors"
					/>

					<button
						onClick={handleClick}
						disabled={!comment.trim()}
						className="w-full text-xs bg-light-green hover:bg-light-green-hover disabled:bg-gray-200 disabled:text-gray-400 text-text-dark font-bold py-1.5 px-3 rounded transition-colors disabled:cursor-not-allowed"
					>
						Comment
					</button>
				</div>
			) : (
				<div className="bg-gradient-to-br from-light-green/10 to-dark-green/5 p-3 rounded-lg border border-light-green shadow-sm flex flex-col items-center justify-center gap-2">
					<MdLogin size={24} className="text-dark-green opacity-60" />
					<p className="text-dark-green font-semibold text-xs text-center">
						Sign in to comment
					</p>
					<button
						onClick={() => history.push("/auth")}
						className="w-full text-xs bg-dark-green hover:bg-dark-green-hover text-off-white font-bold py-1.5 px-2 rounded transition-colors"
					>
						Sign In
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
