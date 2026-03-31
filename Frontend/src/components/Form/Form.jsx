import { useState, useEffect, useRef } from "react";
import LocationPicker from "./LocationPicker";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createPost, updatePost } from "../../actions/posts";
import { verifyPostLocation, sendPostForReview } from "../../api";


	const formatLocationName = (name) => {
		if (!name) return "";
		const parts = name
			.split(",")
			.map((p) => p.trim())
			.filter(Boolean);
		if (!parts.length) return "";
		const primary = parts[0];
		const secondary = parts[1] && parts[1] !== primary ? parts[1] : null;
		const label = secondary ? `${primary}, ${secondary}` : primary;
		return label.length > 40 ? primary : label;
	};

	const Posts = ({
		requiresLocationFix = false,
		sendForReviewAfterUpdate = false,
		reportId = null,
	}) => {
	const initial = { title: "", message: "", tags: "", selectedFile: [], location: null, locationName: "" };
	const [postData, setPostData] = useState(initial);
	const [error, setError] = useState("");
	const [locationVerification, setLocationVerification] = useState(null);
	const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [autoVerifyAfterSearch, setAutoVerifyAfterSearch] = useState(false);
	const MAX_TOTAL_IMAGE_BYTES = 12 * 1024 * 1024; // Keep safely below Mongo 16MB doc limit
	const fileInputRef = useRef(null);

	const dispatch = useDispatch();
	const history = useHistory();

	const selectedPost = useSelector((state) => state.selectedPost);
	const { posts, post: detailedPost } = useSelector((state) => state.posts);
	const user = useSelector((state) => state.auth.authData);

	useEffect(() => {
		if (!selectedPost) return;

		// Prefer the detailed post (from PostDetails view) when available,
		// otherwise fall back to the list entry.
		let sourcePost = null;
		if (detailedPost && detailedPost._id === selectedPost) {
			sourcePost = detailedPost;
		} else if (Array.isArray(posts)) {
			sourcePost = posts.find((p) => p._id === selectedPost) || null;
		}

		if (!sourcePost) return;

		// Normalize tags to comma-separated string
		const normalizedTags = Array.isArray(sourcePost.tags)
			? sourcePost.tags.join(",")
			: sourcePost.tags || "";

		// Normalize location to { lat, lng } for the map picker
		let normalizedLocation = null;
		const loc = sourcePost.location;
		if (loc) {
			if (typeof loc.lat === "number" && typeof loc.lng === "number") {
				normalizedLocation = { lat: loc.lat, lng: loc.lng };
			} else if (
				Array.isArray(loc.coordinates) &&
				loc.coordinates.length >= 2
			) {
				normalizedLocation = {
					lng: loc.coordinates[0],
					lat: loc.coordinates[1],
				};
			}
		}

		// Ensure selectedFile is always an array (or string) so existing
		// photos remain attached when the user updates without re-uploading.
		let normalizedSelectedFile = sourcePost.selectedFile;
		if (!normalizedSelectedFile) {
			normalizedSelectedFile = [];
		}

		setPostData({
			...initial,
			...sourcePost,
			tags: normalizedTags,
			location: normalizedLocation,
			selectedFile: normalizedSelectedFile,
		});
	}, [selectedPost, posts, detailedPost]);

	const validateForm = () => {
		if (!postData.title || !postData.locationName || !postData.message || !postData.tags) {
			setError("Title, location name, message, and tags are required.");
			toast.error(
				"Please fill in all required fields (Title, Location name, Message, and Tags).",
			);
			return false;
		}
		setError("");
		return true;
	};

	const estimateBase64Bytes = (dataUrl) => {
		if (!dataUrl || typeof dataUrl !== "string") return 0;
		const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
		if (!base64) return 0;
		const padding = (base64.match(/=+$/) || [""])[0].length;
		return Math.floor((base64.length * 3) / 4) - padding;
	};

	const validateImagePayloadSize = () => {
		const images = Array.isArray(postData.selectedFile)
			? postData.selectedFile
			: postData.selectedFile
				? [postData.selectedFile]
				: [];

		const totalBytes = images.reduce(
			(sum, img) => sum + estimateBase64Bytes(img),
			0,
		);

		if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
			const mb = (totalBytes / (1024 * 1024)).toFixed(1);
			setError(
				`Images are too large (${mb}MB). Please upload smaller/compressed images (max ~12MB total).`,
			);
			toast.error(
				`Upload too large (${mb}MB). Please compress images and keep total under ~12MB.`,
			);
			return false;
		}

		return true;
	};

	const toBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});

	const appendImagesToPost = async (files, source = "selected") => {
		if (!Array.isArray(files) || files.length === 0) return;

		try {
			const encoded = await Promise.all(files.map((f) => toBase64(f)));
			setPostData((prev) => {
				const existing = Array.isArray(prev.selectedFile)
					? prev.selectedFile
					: prev.selectedFile
						? [prev.selectedFile]
						: [];
				return {
					...prev,
					selectedFile: [...existing, ...encoded],
				};
			});

			const actionText = source === "clipboard" ? "pasted" : "added";
			toast.success(
				`${files.length} image${files.length > 1 ? "s" : ""} ${actionText} successfully!`,
			);
		} catch (err) {
			toast.error("Could not read selected images. Please try again.");
		}
	};

	const handleSelectImages = async (event) => {
		const files = Array.from(event?.target?.files || []);
		if (!files.length) {
			// User canceled picker; keep existing images unchanged.
			return;
		}

		await appendImagesToPost(files, "selected");
	};

	const handlePasteImages = async (event) => {
		const clipboardItems = Array.from(event?.clipboardData?.items || []);
		if (!clipboardItems.length) return;

		const imageFiles = clipboardItems
			.filter((item) => item.kind === "file" && item.type?.startsWith("image/"))
			.map((item) => item.getAsFile())
			.filter(Boolean);

		if (!imageFiles.length) return;

		event.preventDefault();
		await appendImagesToPost(imageFiles, "clipboard");
	};

	const handleRemoveImage = (indexToRemove) => {
		setPostData((prev) => {
			const existing = Array.isArray(prev.selectedFile)
				? prev.selectedFile
				: prev.selectedFile
					? [prev.selectedFile]
					: [];
			return {
				...prev,
				selectedFile: existing.filter((_, idx) => idx !== indexToRemove),
			};
		});
	};

	const moveImage = (fromIndex, toIndex) => {
		setPostData((prev) => {
			const existing = Array.isArray(prev.selectedFile)
				? [...prev.selectedFile]
				: prev.selectedFile
					? [prev.selectedFile]
					: [];

			if (
				fromIndex < 0 ||
				toIndex < 0 ||
				fromIndex >= existing.length ||
				toIndex >= existing.length ||
				fromIndex === toIndex
			) {
				return prev;
			}

			const [moved] = existing.splice(fromIndex, 1);
			existing.splice(toIndex, 0, moved);

			return {
				...prev,
				selectedFile: existing,
			};
		});
	};

	const setImageAsFirst = (index) => {
		moveImage(index, 0);
		toast.info("Photo order updated. This image will display first.");
	};

	const handleClearImages = () => {
		setPostData((prev) => ({ ...prev, selectedFile: [] }));
		toast.info("All selected images removed.");
	};

	const handleVerifyLocation = async () => {
		if (!postData.location || postData.location.lat == null || postData.location.lng == null) {
			toast.error("Please select a location on the map before verifying.");
			setError("Location is required.");
			return;
		}

		if (!postData.locationName) {
			toast.warn("Add a place name in the Location name field to verify location.");
			return;
		}

		setIsVerifyingLocation(true);
		setLocationVerification(null);

		try {
			const { data } = await verifyPostLocation({
				title: postData.locationName,
				message: postData.message,
				location: postData.location,
			});

			setLocationVerification(data);

			if (data?.status === "within-radius") {
				const preservedLocationName = (postData.locationName || "").trim();
				const nextLocation = data?.newLocation || postData.location;

				setPostData({
					...postData,
					location: nextLocation,
					// Keep the user's searched/entered label for feed readability.
					// Only fallback to geocoder label when field is empty.
					locationName:
						preservedLocationName ||
						formatLocationName(data.placeName) ||
						"",
				});

				if (data?.pinHandling === "kept-user-pin") {
					toast.success(
						"Location verified. Your pin is within 10km, so your selected pin was kept.",
					);
				} else if (data?.pinHandling === "snapped-to-match") {
					toast.info(
						data.placeName
							? `Location verified. Pin updated to exact match: ${data.placeName}.`
							: "Location verified. Pin updated to the matched place.",
					);
				} else {
					toast.info(
						data.placeName
							? `Location verified within 20km: ${data.placeName}.`
							: "Location verified within 20km of your pin.",
					);
				}
			} else if (data?.status === "within-search-radius") {
				// Place is within 50km but further than 20km — close, but not accepted
				toast.warn(
					"Location is within 50km of your pin. Please move the pin closer to the place (within 20km) to verify.",
				);
			} else if (data?.status === "outside-radius") {
				toast.warn(
					"The place mentioned in your location name/description is more than 50km away from the selected pin. Please adjust the pin or your text.",
				);
			} else if (data?.status === "no-match") {
				toast.warn(
					"We couldn't find that place near your selected location. Please double-check your pin and place name.",
				);
			} else if (data?.status === "no-text") {
				toast.warn(
					"Add a place name in the Location name field so we can verify the location.",
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

	useEffect(() => {
		if (!autoVerifyAfterSearch) return;
		if (isVerifyingLocation) return;
		if (!postData.location || postData.location.lat == null || postData.location.lng == null) return;
		if (!postData.locationName || !postData.locationName.trim()) return;

		setAutoVerifyAfterSearch(false);
		handleVerifyLocation();
	}, [
		autoVerifyAfterSearch,
		postData.location,
		postData.locationName,
		isVerifyingLocation,
	]);

	const handleFormSubmit = async (event) => {
		event.preventDefault();

		if (isSubmitting) return;

		if (!validateForm()) return;

		if (!validateImagePayloadSize()) return;

		if (!postData.location || postData.location.lat == null || postData.location.lng == null) {
			toast.error("Please select a location on the map before posting.");
			setError("Location is required.");
			return;
		}

		const isNewPost = !selectedPost;

		// For new posts, require at least one photo
		if (isNewPost) {
			const hasPhoto = Array.isArray(postData.selectedFile)
				? postData.selectedFile.length > 0
				: !!postData.selectedFile;
			if (!hasPhoto) {
				setError("At least one photo is required.");
				toast.error("Please upload at least one photo before posting.");
				return;
			}

			// Require location verification that is not clearly invalid
			// Block only when verification says the place is far away or failed with an error
			if (
				!locationVerification ||
				["outside-radius", "error"].includes(locationVerification.status)
			) {
				setError("Location could not be verified. Please adjust the pin or try again.");
				toast.error(
					"Please verify your location or adjust the pin before posting.",
				);
				return;
			}
		} else if (requiresLocationFix) {
			// When editing due to a location-related report, also require
			// a fresh location verification before allowing updates.
			if (
				!locationVerification ||
				["outside-radius", "error"].includes(locationVerification.status)
			) {
				setError("Location could not be verified. Please adjust the pin or try again.");
				toast.error(
					"Please verify your location or adjust the pin before updating this post.",
				);
				return;
			}
		}

		let finalPostData = { ...postData };

		setIsSubmitting(true);
		try {
			if (selectedPost) {
				await dispatch(
					updatePost(selectedPost, {
						...finalPostData,
						name: user?.result?.name,
					}),
				);

				if (sendForReviewAfterUpdate) {
					try {
						await sendPostForReview(selectedPost, reportId ? { reportId } : {});
						toast.success(
							"Your updated post has been sent to the admins for review.",
						);
					} catch (err) {
						// eslint-disable-next-line no-console
						console.error("Auto send for review failed:", err);
						const message =
							err?.response?.data?.message ||
							"Failed to send your updates for review. Please try again.";
						toast.error(message);
					}
				}

				// After updating an existing post, clear the editor and
				// return to the posts list.
				clearPost();
			} else {
				await dispatch(
					createPost(
						{
							...finalPostData,
							name: user?.result?.name,
							authorImage:
								user?.result?.profileImage || user?.result?.imageUrl,
						},
						history,
					),
				);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const clearPost = (options = {}) => {
		const { navigateToPosts = true } = options;
		setPostData(initial);
		setError("");
		setLocationVerification(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		dispatch({ type: "SELECTED_POST", payload: "" });
		if (navigateToPosts) {
			history.push("/posts");
		}
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
						placeholder="e.g. Sunset walk at Lakeside"
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
						Add hashtags (no need to add #, separate words using comma){" "}
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
						placeholder="mountains, cafe, chiya break"
						className="w-full bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-md px-3 py-2 text-sm text-text-dark transition-colors"
					/>
				</div>

				{/* Location (Search + Pin) */}
				<div className="rounded-xl border-2 border-light-green/60 bg-gradient-to-br from-off-white via-off-white to-light-green/10 p-4 shadow-sm">
					<div className="mb-2">
						<p className="text-sm font-bold text-dark-green">
							Find Your Place <span className="text-red-500">*</span>
						</p>
						<p className="text-xs text-text-gray">
							Search first for best accuracy. If needed, fine-tune by pinning on map.
						</p>
					</div>

					<LocationPicker
						value={postData.location}
						onChange={(loc, meta) => {
							setPostData((prev) => {
								const next = { ...prev, location: loc };
								if (meta?.source === "search" && meta?.placeName) {
									next.locationName = meta.placeName;
								}
								return next;
							});
							setAutoVerifyAfterSearch(meta?.source === "search");
							setLocationVerification(null);
						}}
					/>

					<div className="mt-2 flex flex-col gap-1">
						<label
							htmlFor="locationName"
							className="text-xs font-semibold text-dark-green"
						>
							Enter location name <span className="text-red-500">*</span>
						</label>
						<input
							id="locationName"
							name="locationName"
							value={postData.locationName || ""}
							onChange={(e) =>
								setPostData({ ...postData, locationName: e.target.value })
							}
							placeholder="Auto-filled from search (you can edit)"
							className="w-full bg-white border border-dark-green/40 hover:border-light-green focus:border-dark-green focus:outline-none rounded-md px-3 py-2 text-sm text-text-dark transition-colors"
						/>
					</div>

					{postData.location && (
						<div className="mt-2 text-xs text-text-gray bg-white/70 border border-dark-green/10 rounded-md px-2 py-1">
							Selected pin: Lat {postData.location.lat}, Lng {postData.location.lng}
						</div>
					)}

					<div className="flex gap-2 mt-3">
						<button
							type="button"
							onClick={handleVerifyLocation}
							disabled={isVerifyingLocation}
							className={`flex-1 px-4 py-3 rounded-lg text-sm font-bold border-2 transition-all transform ${
								locationVerification?.status === "within-radius"
									? "bg-dark-green text-off-white border-dark-green shadow-lg hover:shadow-xl"
									: "bg-light-green text-text-dark border-dark-green shadow-md hover:shadow-lg hover:bg-light-green-hover"
							} ${
								isVerifyingLocation ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
							}`}
						>
							{isVerifyingLocation ? (
								<>
									<span className="inline-block mr-2">⏳</span>
									Verifying Location...
								</>
							) : locationVerification?.status === "within-radius" ? (
								<>
									<span className="inline-block mr-2">✅</span>
									Location Verified!
								</>
							) : (
								<>
									<span className="inline-block mr-2">📍</span>
									Verify Location
								</>
							)}
						</button>
					</div>
					<p className="text-xs text-text-gray italic mt-2">
						⭐ Tip: Searching by place name is usually more accurate than manual pinning.
					</p>
					{locationVerification && (
						<div
							className={`text-[11px] mt-1 ${
								locationVerification.status === "within-radius"
									? "text-dark-green"
								: locationVerification.status === "within-search-radius" ||
								  locationVerification.status === "outside-radius"
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
							{locationVerification.status === "within-search-radius" && (
								<span>
									Location is within 50km, move pin closer to the location.
								</span>
							)}
							{locationVerification.status === "outside-radius" && (
								<span>
									Mentioned place is more than 50km away from the pin.
								</span>
							)}
							{locationVerification.status === "no-match" && (
								<span>
									No nearby place could be verified automatically.
								</span>
							)}
							{locationVerification.status === "no-text" && (
								<span>
									Add a place name in the Location name field to verify the location.
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
					<div
						onPaste={handlePasteImages}
						tabIndex={0}
						className="mb-3 rounded-md border border-dashed border-dark-green/40 bg-white/70 px-3 py-2 text-xs text-text-gray focus:outline-none focus:ring-2 focus:ring-light-green/70"
						title="Click here and press Ctrl+V to paste an image from clipboard"
					>
						Paste from clipboard: click this box and press Ctrl+V
					</div>
					{(Array.isArray(postData.selectedFile)
						? postData.selectedFile.length > 0
						: !!postData.selectedFile) && (
						<div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
							{(Array.isArray(postData.selectedFile)
								? postData.selectedFile
								: [postData.selectedFile]
							).map((image, idx) => (
								<div key={idx} className="relative">
									<img
										src={image}
										alt={`Existing upload ${idx + 1}`}
										className="w-full h-24 object-cover rounded-md border border-dark-green/20"
										onError={(e) => {
											e.target.onerror = null;
											e.target.src =
												"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
										}}
									/>
									{idx === 0 && (
										<span className="absolute left-1 top-1 text-[10px] font-bold bg-dark-green text-off-white px-2 py-0.5 rounded-full">
											1st
										</span>
									)}
									<button
										type="button"
										onClick={() => handleRemoveImage(idx)}
										className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs font-bold hover:bg-orange transition-colors"
										title="Remove this image"
									>
										×
									</button>
									<div className="absolute bottom-1 left-1 right-1 flex gap-1">
										<button
											type="button"
											onClick={() => moveImage(idx, idx - 1)}
											disabled={idx === 0}
											className="flex-1 text-[10px] font-semibold bg-black/65 text-white rounded px-1 py-0.5 disabled:opacity-40"
											title="Move left"
										>
											←
										</button>
										<button
											type="button"
											onClick={() => setImageAsFirst(idx)}
											disabled={idx === 0}
											className="flex-1 text-[10px] font-semibold bg-black/65 text-white rounded px-1 py-0.5 disabled:opacity-40"
											title="Set as first image"
										>
											1st
										</button>
										<button
											type="button"
											onClick={() => moveImage(idx, idx + 1)}
											disabled={
												idx ===
												(Array.isArray(postData.selectedFile)
													? postData.selectedFile.length
													: [postData.selectedFile].length) -
													1
											}
											className="flex-1 text-[10px] font-semibold bg-black/65 text-white rounded px-1 py-0.5 disabled:opacity-40"
											title="Move right"
										>
											→
										</button>
									</div>
								</div>
							))}
						</div>
					)}
					<div className="flex flex-wrap gap-2 items-center">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={handleSelectImages}
							className="hidden"
						/>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="px-3 py-2 rounded-md bg-dark-green text-off-white text-sm font-semibold hover:bg-dark-green-hover transition-colors"
						>
							Add Photos
						</button>
						{(Array.isArray(postData.selectedFile)
							? postData.selectedFile.length > 0
							: !!postData.selectedFile) && (
							<>
								<span className="text-xs text-text-gray font-medium">
									{Array.isArray(postData.selectedFile)
										? `${postData.selectedFile.length} image${postData.selectedFile.length > 1 ? "s" : ""} selected`
										: "1 image selected"}
								</span>
								<button
									type="button"
									onClick={handleClearImages}
									className="px-3 py-2 rounded-md bg-orange/10 text-orange text-sm font-semibold hover:bg-orange/20 transition-colors"
								>
									Remove All
								</button>
							</>
						)}
					</div>
					<p className="text-text-gray text-xs italic mt-2">
						You can upload multiple images to enhance your post.
						 Use arrows or "1st" to rearrange display order.
						Supported formats: JPG, PNG, GIF
					</p>
				</div>

				{/* Submit */}
				<button
					type="submit"
							disabled={
								isSubmitting ||
								(!selectedPost && (!locationVerification || locationVerification.status !== "within-radius"))
							}
							className={`w-full font-bold py-2.5 rounded-md transition-colors mt-1 ${
								isSubmitting ||
								(!selectedPost && (!locationVerification || locationVerification.status !== "within-radius"))
									? "bg-light-green/40 text-text-gray cursor-not-allowed"
									: "bg-light-green hover:bg-light-green-hover text-text-dark"
							}`}
				>
							{isSubmitting
								? selectedPost
									? "Updating..."
									: "Uploading..."
								: selectedPost
									? "Update Post"
									: "Submit"}
				</button>

				{/* Clear */}
				<button
					type="button"
					onClick={() => {
						clearPost();
						toast.info("Form cleared!");
					}}
					className="w-full bg-orange/10 hover:bg-orange/20 text-orange font-semibold py-2 rounded-md text-sm transition-colors"
				>
					Clear
				</button>
			</form>
		</div>
	);
};

export default Posts;
