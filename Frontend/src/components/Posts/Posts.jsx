import { useSelector } from "react-redux";
import Post from "./Post/Post";

const Posts = () => {
	const { posts, isLoading } = useSelector((state) => state.posts);

	if (!posts.length && !isLoading) {
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
		<div className="space-y-4 max-w-2xl">
			{posts.map((post) => (
				<Post key={post._id} post={post} />
			))}
		</div>
	);
};

export default Posts;
