import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { commentPost } from "../../actions/posts";

const CommentSection = ({ post }) => {
	const [comments, setComments] = useState(post?.comments);
	const commentRef = useRef();
	const [comment, setComment] = useState("");
	const dispatch = useDispatch();
	const user = useSelector((state) => state.auth.authData);

	const handleClick = async () => {
		const commentFinal = `${user.result.name}: ${comment}`;
		const newComment = await dispatch(commentPost(commentFinal, post._id));
		setComments(newComment);
		setComment("");
		commentRef.current.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row gap-5 bg-light-green/5 p-5 rounded-[15px] border border-light-green shadow-[0_2px_8px_rgba(12,52,44,0.1)]">
				{/* Comments list */}
				<div
					className="flex-1 h-[300px] overflow-y-auto bg-off-white p-4 rounded-xl border border-dark-green shadow-[inset_0_2px_4px_rgba(12,52,44,0.1)]"
					style={{
						scrollbarWidth: "thin",
						scrollbarColor: "#affa01 #f1f1f1",
					}}
				>
					<h3 className="text-dark-green font-bold text-lg mb-4">
						Comments ({comments.length})
					</h3>

					{comments.length > 0 ? (
						comments.map((c, i) => (
							<div
								key={i}
								className="bg-light-green/10 px-3 py-3 my-2 rounded-lg border border-dark-green/10"
							>
								<p className="text-sm text-text-dark">
									<strong className="text-dark-green font-semibold">
										{c?.split(": ")[0]}
									</strong>
									<span className="ml-2">
										{c?.split(":")[1]}
									</span>
								</p>
							</div>
						))
					) : (
						<p className="text-text-gray italic text-sm text-center mt-5">
							No comments yet. Be the first to comment!
						</p>
					)}

					<div ref={commentRef} />
				</div>

				{/* Comment form */}
				{user?.result?.name && (
					<div className="flex-1 max-w-full md:max-w-[400px] bg-off-white p-5 rounded-xl border border-dark-green shadow-[0_2px_8px_rgba(12,52,44,0.1)] flex flex-col">
						<h3 className="text-dark-green font-bold text-lg mb-4">
							Write a comment
						</h3>

						<textarea
							rows={4}
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder="What do you think about this post?"
							className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-light-green focus:outline-none rounded-md px-3 py-2 text-sm text-text-dark resize-y transition-colors"
						/>

						<button
							onClick={handleClick}
							disabled={!comment.trim()}
							className="w-full mt-4 bg-light-green hover:bg-light-green-hover disabled:bg-gray-200 disabled:text-gray-400 text-text-dark font-bold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
						>
							Post Comment
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default CommentSection;
