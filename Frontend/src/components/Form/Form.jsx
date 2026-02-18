import { useState, useEffect } from "react";
import FileBase from "react-file-base64";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createPost, updatePost } from "../../actions/posts";

const Posts = () => {
	const initial = { title: "", message: "", tags: "", selectedFile: [] };
	const [postData, setPostData] = useState(initial);
	const [error, setError] = useState("");

	const dispatch = useDispatch();
	const history = useHistory();

	const selectedPost = useSelector((state) => state.selectedPost);
	const { posts } = useSelector((state) => state.posts);
	const user = useSelector((state) => state.auth.authData);

	useEffect(() => {
		const post = posts?.find((p) => p._id === selectedPost);
		if (post && selectedPost) {
			setPostData(post);
		}
	}, [selectedPost, posts]);

	const validateForm = () => {
		if (!postData.title || !postData.message || !postData.tags) {
			setError("Title, message, and tags are required.");
			toast.error(
				"Please fill in all required fields (Title, Message, and Tags).",
			);
			return false;
		}
		setError("");
		return true;
	};

	const handleFormSubmit = (event) => {
		event.preventDefault();
		if (!validateForm()) return;

		if (selectedPost) {
			dispatch(
				updatePost(selectedPost, {
					...postData,
					name: user?.result?.name,
				}),
			);
		} else {
			dispatch(
				createPost({ ...postData, name: user?.result?.name }, history),
			);
		}
		clearPost();
	};

	const clearPost = () => {
		setPostData(initial);
		setError("");
		dispatch({ type: "SELECTED_POST", payload: "" });
		toast.info("Form cleared!");
		history.push();
	};

	if (!user?.result?.name) {
		return (
			<div className="bg-off-white border border-dark-green rounded-[15px] shadow-form p-6">
				<p className="text-lg font-semibold text-text-dark">
					Please Sign In to create your own posts and like others
					posts.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-off-white border border-dark-green rounded-[15px] shadow-form p-5">
			<form
				autoComplete="off"
				noValidate
				onSubmit={handleFormSubmit}
				className="flex flex-col gap-3"
			>
				<h2 className="text-lg font-bold text-text-dark text-center">
					{selectedPost ? "Updating a Post" : "Creating a Post"}
				</h2>

				{error && (
					<p className="text-red-500 text-sm font-medium">{error}</p>
				)}

				{/* Title */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="title"
						className="text-xs font-semibold text-dark-green"
					>
						Title <span className="text-red-500">*</span>
					</label>
					<input
						id="title"
						name="title"
						value={postData.title}
						onChange={(e) =>
							setPostData({ ...postData, title: e.target.value })
						}
						placeholder="Enter post title"
						className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-md px-3 py-2 text-sm text-text-dark transition-colors"
					/>
				</div>

				{/* Message */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="message"
						className="text-xs font-semibold text-dark-green"
					>
						Message <span className="text-red-500">*</span>
					</label>
					<textarea
						id="message"
						name="message"
						rows={4}
						value={postData.message}
						onChange={(e) =>
							setPostData({
								...postData,
								message: e.target.value,
							})
						}
						placeholder="What's on your mind?"
						className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-md px-3 py-2 text-sm text-text-dark transition-colors resize-y"
					/>
				</div>

				{/* Tags */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="tags"
						className="text-xs font-semibold text-dark-green"
					>
						Tags (comma separated){" "}
						<span className="text-red-500">*</span>
					</label>
					<input
						id="tags"
						name="tags"
						value={
							Array.isArray(postData.tags)
								? postData.tags.join(",")
								: postData.tags
						}
						onChange={(e) =>
							setPostData({
								...postData,
								tags: e.target.value.split(","),
							})
						}
						placeholder="travel, adventure, journal"
						className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-md px-3 py-2 text-sm text-text-dark transition-colors"
					/>
				</div>

				{/* File upload */}
				<div className="w-full p-4 bg-light-green/5 border border-dark-green rounded-xl">
					<p className="text-dark-green font-semibold text-sm mb-2">
						Upload Images (Optional)
					</p>
					<FileBase
						type="file"
						multiple={true}
						onDone={(files) => {
							if (Array.isArray(files)) {
								const fileStrings = files.map((f) => f.base64);
								setPostData({
									...postData,
									selectedFile: fileStrings,
								});
								toast.success(
									`${files.length} image${files.length > 1 ? "s" : ""} uploaded successfully!`,
								);
							} else {
								setPostData({
									...postData,
									selectedFile: [files.base64],
								});
								toast.success("Image uploaded successfully!");
							}
						}}
					/>
					<p className="text-text-gray text-xs italic mt-2">
						You can upload multiple images to enhance your post.
						Supported formats: JPG, PNG, GIF
					</p>
				</div>

				{/* Submit */}
				<button
					type="submit"
					className="w-full bg-light-green hover:bg-light-green-hover text-text-dark font-bold py-2.5 rounded-md transition-colors mt-1"
				>
					Submit
				</button>

				{/* Clear */}
				<button
					type="button"
					onClick={clearPost}
					className="w-full bg-orange/10 hover:bg-orange/20 text-orange font-semibold py-2 rounded-md text-sm transition-colors"
				>
					Clear
				</button>
			</form>
		</div>
	);
};

export default Posts;
