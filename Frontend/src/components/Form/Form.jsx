import { useState, useEffect } from "react";
import LocationPicker from "./LocationPicker";
import FileBase from "react-file-base64";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createPost, updatePost } from "../../actions/posts";
import { verifyPostLocation } from "../../api";

const Posts = () => {
	const initial = { title: "", message: "", tags: "", selectedFile: [], location: null };
	const [postData, setPostData] = useState(initial);
	const [error, setError] = useState("");
	const [locationVerification, setLocationVerification] = useState(null);
	const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);

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

	const handleVerifyLocation = async () => {
		if (!postData.location || postData.location.lat == null || postData.location.lng == null) {
			toast.error("Please select a location on the map before verifying.");
			setError("Location is required.");
			return;
		}

		if (!postData.title && !postData.message) {
			toast.warn("Add a place name in the title or message to verify location.");
			return;
		}

		setIsVerifyingLocation(true);
		setLocationVerification(null);

		try {
			const { data } = await verifyPostLocation({
				title: postData.title,
				message: postData.message,
				location: postData.location,
			});

			setLocationVerification(data);

			if (data?.status === "within-radius" && data?.newLocation) {
				setPostData({ ...postData, location: data.newLocation });
				toast.info(
					data.placeName
						? `Location verified within 20km: ${data.placeName}.`
						: "Location verified within 20km of your pin.",
				);
			} else if (data?.status === "outside-radius") {
				toast.warn(
					"The place mentioned in your title/description is more than 20km away from the selected pin. Please adjust the pin or your text.",
				);
			} else if (data?.status === "no-match") {
				toast.warn(
					"We couldn't find that place near your selected location. Please double-check your pin and place name.",
				);
			} else if (data?.status === "no-text") {
				toast.warn(
					"Add a place name in the title or message so we can verify the location.",
				);
			} else if (data?.status === "service-unavailable") {
				toast.info(
					"Place verification service is temporarily unavailable. Please try again later.",
				);
			}
		} catch (err) {
			console.error("Location verification error:", err);
			setLocationVerification({ status: "error" });
			toast.error(
				"Could not verify the place automatically. Please try again later.",
			);
		} finally {
			setIsVerifyingLocation(false);
		}
	};

	const handleFormSubmit = async (event) => {
		event.preventDefault();
		if (!validateForm()) return;

		if (!postData.location || postData.location.lat == null || postData.location.lng == null) {
			toast.error("Please select a location on the map before posting.");
			setError("Location is required.");
			return;
		}

		// For new posts, require at least one photo
		if (!selectedPost) {
			const hasPhoto = Array.isArray(postData.selectedFile)
				? postData.selectedFile.length > 0
				: !!postData.selectedFile;
			if (!hasPhoto) {
				setError("At least one photo is required.");
				toast.error("Please upload at least one photo before posting.");
				return;
			}

			// Require a successful location verification for new posts
			if (!locationVerification || locationVerification.status !== "within-radius") {
				setError("Location must be verified within 20km before posting.");
				toast.error("Please verify your location before posting. It must be within 20km of the mentioned place.");
				return;
			}
		}

		let finalPostData = { ...postData };

		if (selectedPost) {
			dispatch(
				updatePost(selectedPost, {
					...finalPostData,
					name: user?.result?.name,
				}),
			);
		} else {
			dispatch(
				createPost({
					...finalPostData,
					name: user?.result?.name,
					authorImage: user?.result?.profileImage,
				}, history),
			);
		}
		clearPost();
	};

	const clearPost = () => {
		setPostData(initial);
		setError("");
		setLocationVerification(null);
		dispatch({ type: "SELECTED_POST", payload: "" });
		toast.info("Form cleared!");
		history.push("/posts");
	};

	if (!user?.result?.name) {
		return null;
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

				{/* Location Picker */}
				<div className="flex flex-col gap-1">
					<label className="text-xs font-semibold text-dark-green">
						Select Location (click on map)
					</label>
					<LocationPicker
						value={postData.location}
						onChange={(loc) => {
							setPostData({ ...postData, location: loc });
							setLocationVerification(null);
						}}
					/>
					{postData.location && (
						<div className="text-xs text-text-gray">Selected: Lat {postData.location.lat}, Lng {postData.location.lng}</div>
					)}
					<div className="flex gap-2 mt-1">
						<button
							type="button"
							onClick={handleVerifyLocation}
							disabled={isVerifyingLocation}
							className={`px-3 py-1 rounded-md text-xs font-semibold border border-dark-green text-dark-green bg-off-white hover:bg-light-green/20 transition-colors ${
								isVerifyingLocation ? "opacity-60 cursor-not-allowed" : ""
							}`}
						>
							{isVerifyingLocation ? "Verifying..." : "Verify location"}
						</button>
					</div>
					{locationVerification && (
						<div
							className={`text-[11px] mt-1 ${
								locationVerification.status === "within-radius"
									? "text-dark-green"
								: locationVerification.status === "outside-radius"
									? "text-orange"
								: locationVerification.status === "service-unavailable" ||
								  locationVerification.status === "error" ||
								  locationVerification.status === "no-text"
									? "text-orange"
								: "text-text-gray"
							}`}
						>
							{locationVerification.status === "within-radius" && (
								<span>
									Location verified within 20km
									{locationVerification.placeName
										? `: ${locationVerification.placeName}`
										: "."}
								</span>
							)}
							{locationVerification.status === "outside-radius" && (
								<span>
									Mentioned place is more than 20km away from the pin.
								</span>
							)}
							{locationVerification.status === "no-match" && (
								<span>
									No nearby place could be verified automatically.
								</span>
							)}
							{locationVerification.status === "no-text" && (
								<span>
									Add a place name in the title or message to verify the location.
								</span>
							)}
							{locationVerification.status === "service-unavailable" && (
								<span>
									Place verification service is unavailable; using your pin as-is.
								</span>
							)}
							{locationVerification.status === "error" && (
								<span>
									Could not contact the verification service; using your pin as-is.
								</span>
							)}
						</div>
					)}
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
					disabled={
						!selectedPost && (!locationVerification || locationVerification.status !== "within-radius")
					}
					className={`w-full font-bold py-2.5 rounded-md transition-colors mt-1 ${
						!selectedPost && (!locationVerification || locationVerification.status !== "within-radius")
							? "bg-light-green/40 text-text-gray cursor-not-allowed"
							: "bg-light-green hover:bg-light-green-hover text-text-dark"
					}`}
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
