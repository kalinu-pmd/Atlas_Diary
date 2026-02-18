import React from "react";
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
			<div className="flex justify-center items-center h-[77vh] bg-off-white border-2 border-dark-green rounded-[15px]">
				<div
					className="w-12 h-12 rounded-full border-4 border-off-white border-t-dark-green animate-spin"
					role="status"
					aria-label="Loading posts"
				/>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{posts.map((post) => (
				<Post key={post._id} post={post} />
			))}
		</div>
	);
};

export default Posts;
