import { useEffect } from "react";
import {
	Paper,
	Typography,
	CircularProgress,
	Divider,
	Grid,
	Box,
	Chip,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useParams, useHistory } from "react-router-dom";
import LinesEllipsis from "react-lines-ellipsis";

import useStyles from "./styles";
import {
	getPostById,
	getPostsBySearch,
	trackPostView,
} from "../../actions/posts";
import CommentSection from "./CommentSection";
import SimilarPosts from "../SimilarPosts/SimilarPosts";

function PostDetails() {
	const { post, posts, isLoading } = useSelector((state) => state.posts);
	const dispatch = useDispatch();
	const history = useHistory();
	const classes = useStyles();
	const { id } = useParams();

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	useEffect(() => {
		dispatch(getPostById(id));
		dispatch(trackPostView(id));
	}, [dispatch, id]);

	useEffect(() => {
		if (post) {
			dispatch(
				getPostsBySearch({
					search: "none",
					tags: post?.tags?.join(","),
				}),
			);
		}
	}, [dispatch, post]);

	const recommendedPosts = posts.filter(
		(recommendedPost) => recommendedPost?._id !== post?._id,
	);

	const openPost = (_id) => {
		history.push(`/posts/${_id}`);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (!post) return null;

	if (isLoading) {
		return (
			<Paper elevation={6} className={classes.loadingPaper}>
				<CircularProgress size="3em" />
			</Paper>
		);
	}

	// Helper for rendering images (gallery or single)
	const renderImages = () => {
		if (Array.isArray(post.selectedFile) && post.selectedFile.length > 0) {
			return (
				<Box>
					{post.selectedFile.map((image, idx) => (
						<img
							key={idx}
							className={classes.media}
							src={image}
							alt={`${post.title} - ${idx + 1}`}
							loading="lazy"
							style={{
								marginBottom:
									idx < post.selectedFile.length - 1
										? "10px"
										: "0",
							}}
							onError={(e) => {
								e.target.onerror = null;
								e.target.src =
									"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
							}}
						/>
					))}
				</Box>
			);
		}
		return (
			<img
				className={classes.media}
				src={
					post.selectedFile ||
					"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png"
				}
				alt={post.title}
				loading="lazy"
				onError={(e) => {
					e.target.onerror = null;
					e.target.src =
						"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
				}}
			/>
		);
	};

	return (
		<Box mt={isMobile ? 7 : 8}>
			<Paper style={{ padding: 24, borderRadius: 18 }} elevation={6}>
				<Grid
					container
					spacing={isMobile ? 2 : 4}
					className={classes.card}
					direction={isMobile ? "column" : "row"}
				>
					{/* Main Content */}
					<Grid item xs={12} md={7}>
						<Box className={classes.section}>
							<Typography
								variant={isMobile ? "h5" : "h3"}
								component="h2"
								gutterBottom
								style={{ fontWeight: 700 }}
							>
								{post.title}
							</Typography>
							<Box mb={1}>
								{post.tags.map((tag) => (
									<Chip
										key={tag}
										label={`#${tag}`}
										size="small"
										style={{
											marginRight: 6,
											background: "#affa01",
											color: "#0c342c",
											fontWeight: 600,
										}}
									/>
								))}
							</Box>
							<Typography
								gutterBottom
								variant="body1"
								component="p"
								style={{
									marginBottom: 12,
									whiteSpace: "pre-line",
								}}
							>
								{post.message}
							</Typography>
							<Typography
								variant="subtitle1"
								color="textSecondary"
							>
								<strong>Created by:</strong> {post.name}
							</Typography>
							<Typography variant="caption" color="textSecondary">
								{moment(post.createdAt).fromNow()}
							</Typography>
							<Divider style={{ margin: "20px 0" }} />
							<CommentSection post={post} />
							<Divider style={{ margin: "20px 0" }} />
						</Box>
					</Grid>

					{/* Image Gallery */}
					<Grid item xs={12} md={5}>
							{renderImages()}
					</Grid>
				</Grid>

				{/* Recommended Posts */}
				{recommendedPosts.length > 0 && (
					<Box mt={4} mb={2}>
						<Typography
							variant="h5"
							gutterBottom
							style={{ fontWeight: 600 }}
						>
							You might also like
						</Typography>
						<Divider />
						<Box className={classes.recommendedPosts} mt={2}>
							{recommendedPosts.map(
								({
									title,
									message,
									name,
									likes,
									selectedFile,
									_id,
								}) => (
									<Paper
										key={_id}
										className={classes.postWrap}
										elevation={3}
										style={{
											margin: 16,
											cursor: "pointer",
											transition:
												"box-shadow 0.2s, transform 0.2s",
										}}
										onClick={() => openPost(_id)}
										tabIndex={0}
										onKeyPress={(e) => {
											if (e.key === "Enter")
												openPost(_id);
										}}
									>
										<Box p={2}>
											<Typography
												gutterBottom
												variant="subtitle1"
												style={{ fontWeight: 600 }}
											>
												{title}
											</Typography>
											<Typography
												gutterBottom
												variant="body2"
												color="textSecondary"
											>
												{name}
											</Typography>
											<LinesEllipsis
												className={classes.postContent}
												text={message}
												maxLine="3"
												ellipsis="..."
												trimRight
												basedOn="letters"
												style={{
													fontFamily: "inherit",
												}}
											/>
											<Typography
												variant="caption"
												color="textSecondary"
												style={{
													display: "block",
													marginTop: 4,
												}}
											>
												Likes: {likes.length}
											</Typography>
											<Box mt={1}>
												<img
													src={
														Array.isArray(
															selectedFile,
														) &&
														selectedFile.length > 0
															? selectedFile[0]
															: selectedFile
													}
													height="80"
													style={{
														width: "100%",
														objectFit: "cover",
														borderRadius: 8,
														border: "1px solid #affa01",
														background: "#fef9f5",
													}}
													alt="recommended_img"
													loading="lazy"
													onError={(e) => {
														e.target.onerror = null;
														e.target.src =
															"https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
													}}
												/>
												{Array.isArray(selectedFile) &&
													selectedFile.length > 1 && (
														<Typography
															variant="caption"
															style={{
																display:
																	"block",
																marginTop:
																	"2px",
																color: "#888",
															}}
														>
															+
															{selectedFile.length -
																1}{" "}
															more images
														</Typography>
													)}
											</Box>
										</Box>
									</Paper>
								),
							)}
						</Box>
					</Box>
				)}

				{/* Content-based Similar Posts */}
				<Box mt={4}>
					<SimilarPosts postId={post._id} />
				</Box>
			</Paper>
		</Box>
	);
}

export default PostDetails;
