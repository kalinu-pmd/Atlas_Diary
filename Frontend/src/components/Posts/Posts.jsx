import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Post from "./Post/Post";

const Posts = () => {
	const { posts, isLoading } = useSelector((state) => state.posts);
	const location = useLocation();
	const user = useSelector((state) => state.auth.authData);
	const currentUserId =
		user?.result?.googleId || user?.result?._id || null;

	useEffect(() => {
		if (!isLoading || !location.pathname.startsWith("/posts")) return;
		window.scrollTo({ top: 0, behavior: "auto" });

		return () => {
			window.scrollTo({ top: 0, behavior: "auto" });
		};
	}, [isLoading, location.pathname]);

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
			<div className="relative overflow-hidden w-full min-h-[calc(100vh-4rem)] bg-gradient-to-br from-off-white via-[#fbfdf6] to-light-green/20 flex items-center justify-center px-4 py-10">
				<style>{`
					@keyframes postsShimmer {
						0% { transform: translateX(-120%); }
						100% { transform: translateX(120%); }
					}
					@keyframes postsPulse {
						0%, 100% { opacity: 0.55; transform: translateY(0); }
						50% { opacity: 1; transform: translateY(-3px); }
					}
				`}</style>

				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					<div
						className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
						style={{ animation: "postsShimmer 2.2s linear infinite" }}
					/>
				</div>

				<div className="relative z-[1] flex flex-col items-center text-center w-full max-w-5xl">
					<div className="inline-flex items-end gap-2 mb-4" aria-hidden>
						<span className="h-2.5 w-2.5 rounded-full bg-dark-green" style={{ animation: "postsPulse 1.2s ease-in-out infinite" }} />
						<span className="h-3.5 w-3.5 rounded-full bg-light-green" style={{ animation: "postsPulse 1.2s ease-in-out 0.2s infinite" }} />
						<span className="h-2.5 w-2.5 rounded-full bg-dark-green" style={{ animation: "postsPulse 1.2s ease-in-out 0.4s infinite" }} />
					</div>

					<p className="text-xl sm:text-2xl font-black text-dark-green tracking-tight">
						Loading the latest public diaries
					</p>
					<p className="text-sm text-text-gray mt-1 mb-6">
						Gathering fresh stories, places and photos from the community.
					</p>

					<div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4" aria-hidden>
						{[1, 2, 3].map((item) => (
							<div key={item} className="rounded-2xl border border-dark-green/10 bg-white/70 shadow-[0_10px_28px_rgba(12,52,44,0.08)] p-3">
								<div className="h-52 rounded-xl bg-dark-green/10 mb-3" />
								<div className="h-4 rounded bg-dark-green/20 mb-2 w-3/4" />
								<div className="h-3 rounded bg-dark-green/15 mb-2" />
								<div className="h-3 rounded bg-dark-green/15 mb-2 w-5/6" />
								<div className="h-3 rounded bg-dark-green/15 w-2/3" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-5 max-w-[760px] mx-auto pb-12">
			{visiblePosts.map((post) => (
				<Post key={post._id} post={post} />
			))}
		</div>
	);
};

export default Posts;
