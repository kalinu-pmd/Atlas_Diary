import { useSelector } from "react-redux";
import Post from "./Post/Post";

const Posts = () => {
	const { posts, isLoading } = useSelector((state) => state.posts);
	const user = useSelector((state) => state.auth.authData);
	const currentUserId =
		user?.result?.googleId || user?.result?._id || null;

	// For the main feed, hide posts created by the logged-in user.
	// Their own posts are still visible on profile and other views.
	const visiblePosts = currentUserId
		? posts.filter((post) =>
				post?.creator ? String(post.creator) !== String(currentUserId) : true,
		  )
		: posts;

	if (!visiblePosts.length && !isLoading) {
		return (
			<p className="text-center text-text-dark font-medium py-10">
				No posts
			</p>
		);
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[77vh] bg-transparent">
				<div
					className="w-12 h-12 rounded-full border-4 border-transparent border-t-dark-green animate-spin"
					role="status"
					aria-label="Loading posts"
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-3xl mx-auto pb-10">
			{visiblePosts.map((post) => (
				<Post key={post._id} post={post} />
			))}
		</div>
	);
};

export default Posts;
