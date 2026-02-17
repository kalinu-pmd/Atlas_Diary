import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Box,
  Dialog,
  DialogContent,
  IconButton,
} from "@material-ui/core";
import {
  ThumbUp,
  Comment,
  Visibility,
  Close,
  ZoomIn,
  ArrowBack,
  ArrowForward,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import {
  getRecommendations,
  trackPostView,
  likePost,
} from "../../actions/posts";
import moment from "moment";
import useStyles from "./styles";
import { useMediaQuery, useTheme } from "@material-ui/core";

const Recommendations = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const history = useHistory();
  const { recommendations, isLoading } = useSelector((state) => state.posts);
  // Removed unused 'authData'
  const [user] = useState(
    JSON.parse(localStorage.getItem("traveller-profile"))
  );
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (user?.token) {
      dispatch(getRecommendations(10));
    }
  }, [dispatch, user]);

  const handleViewPost = (postId) => {
    if (user?.token) {
      dispatch(trackPostView(postId));
    }
    history.push(`/posts/${postId}`);
  };

  const handleLike = (postId) => {
    if (user?.token) {
      dispatch(likePost(postId));
    }
  };

  const handleImageClick = (imageData, postTitle) => {
    if (Array.isArray(imageData)) {
      setFullScreenImage({ urls: imageData, title: postTitle });
    } else {
      setFullScreenImage({ urls: [imageData], title: postTitle });
    }
    setCurrentImageIndex(0);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setFullScreenImage(null);
    setCurrentImageIndex(0);
  };

  if (!user?.token) {
    return (
      <Paper elevation={3} style={{ padding: "20px", textAlign: "center" }}>
        <Typography variant="h6">
          Please sign in to see personalized recommendations
        </Typography>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper elevation={3} style={{ padding: "20px", textAlign: "center" }}>
        <Typography variant="h6">Loading recommendations...</Typography>
      </Paper>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Paper elevation={3} style={{ padding: "20px", textAlign: "center" }}>
        <Typography variant="h6">No recommendations available</Typography>
        <Typography variant="body2">
          Start interacting with posts to get personalized recommendations!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box style={{ marginTop: isMobile ? 56 : 64 }}>
      <Typography
        variant="h4"
        gutterBottom
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        Recommended for You
      </Typography>
      <Grid container spacing={3}>
        {recommendations.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Card
              elevation={3}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {post.selectedFile && post.selectedFile.length > 0 && (
                <Box
                  className={classes.imageContainer}
                  onClick={() =>
                    handleImageClick(
                      Array.isArray(post.selectedFile)
                        ? post.selectedFile[0]
                        : post.selectedFile,
                      post.title
                    )
                  }
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      Array.isArray(post.selectedFile)
                        ? post.selectedFile[0]
                        : post.selectedFile
                    }
                    alt={post.title}
                    style={{ objectFit: "cover" }}
                  />
                  <Box className={classes.zoomOverlay}>
                    <ZoomIn className={classes.zoomIcon} />
                  </Box>
                  {Array.isArray(post.selectedFile) &&
                    post.selectedFile.length > 1 && (
                      <Box className={classes.imageCounter}>
                        +{post.selectedFile.length - 1} more
                      </Box>
                    )}
                </Box>
              )}
              <CardContent style={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {post.message.substring(0, 100)}...
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  By {post.name} • {moment(post.createdAt).fromNow()}
                </Typography>

                {/* Tags */}
                <Box style={{ marginTop: "10px", marginBottom: "10px" }}>
                  {post.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      style={{ margin: "2px" }}
                      variant="outlined"
                    />
                  ))}
                </Box>

                {/* Recommendation Score */}
                <Typography
                  variant="caption"
                  style={{ color: "#1976d2", fontWeight: "bold" }}
                >
                  Match Score: {(post.recommendationScore * 100).toFixed(0)}%
                </Typography>
              </CardContent>

              <CardActions
                style={{ justifyContent: "space-between", padding: "16px" }}
              >
                <Box>
                  <Button
                    size="small"
                    startIcon={<ThumbUp />}
                    onClick={() => handleLike(post._id)}
                    color={
                      post.likes?.includes(user?.result?._id)
                        ? "primary"
                        : "default"
                    }
                  >
                    {post.likes?.length || 0}
                  </Button>
                  <Button size="small" startIcon={<Comment />}>
                    {post.comments?.length || 0}
                  </Button>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Visibility />}
                  onClick={() => handleViewPost(post._id)}
                >
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Full Screen Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
        className={classes.fullScreenDialog}
      >
        <DialogContent className={classes.dialogContent}>
          <IconButton
            onClick={handleCloseImageDialog}
            className={classes.closeButton}
          >
            <Close />
          </IconButton>
          {fullScreenImage && (
            <Box className={classes.fullScreenImageContainer}>
              <Box
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {fullScreenImage.urls.length > 1 && (
                  <IconButton
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev > 0 ? prev - 1 : fullScreenImage.urls.length - 1
                      )
                    }
                    style={{
                      position: "absolute",
                      left: "10px",
                      zIndex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                )}
                <img
                  src={fullScreenImage.urls[currentImageIndex]}
                  alt={fullScreenImage.title}
                  className={classes.fullScreenImage}
                />
                {fullScreenImage.urls.length > 1 && (
                  <IconButton
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev < fullScreenImage.urls.length - 1 ? prev + 1 : 0
                      )
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      zIndex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h6" className={classes.imageTitle}>
                {fullScreenImage.title}
                {fullScreenImage.urls.length > 1 && (
                  <span style={{ fontSize: "14px", marginLeft: "10px" }}>
                    ({currentImageIndex + 1} of {fullScreenImage.urls.length})
                  </span>
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Recommendations;
