import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { getSimilarPosts, trackPostView } from "../../actions/posts";
import moment from "moment";
import useStyles from "./styles";

const SimilarPosts = ({ postId }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { similarPosts } = useSelector((state) => state.posts);
  const [user] = useState(
    JSON.parse(localStorage.getItem("traveller-profile"))
  );

  useEffect(() => {
    if (postId) {
      dispatch(getSimilarPosts(postId, 5));
    }
  }, [dispatch, postId]);

  const handleViewPost = (similarPostId) => {
    if (user?.token) {
      dispatch(trackPostView(similarPostId));
    }
    history.push(`/posts/${similarPostId}`);
  };

  if (!similarPosts || similarPosts.length === 0) {
    return null;
  }

  return (
    <Paper elevation={3} className={classes.paper}>
      <Typography variant="h6" className={classes.title}>
        Similar Posts
      </Typography>
      <List className={classes.list}>
        {similarPosts.map((post, index) => (
          <ListItem
            key={post._id}
            divider={index < similarPosts.length - 1}
            className={classes.listItem}
            onClick={() => handleViewPost(post._id)}
          >
            <ListItemAvatar>
              <Avatar
                src={
                  Array.isArray(post.selectedFile) &&
                  post.selectedFile.length > 0
                    ? post.selectedFile[0]
                    : post.selectedFile || "/default-avatar.png"
                }
                className={classes.avatar}
              >
                {post.title.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              className={classes.listItemText}
              primary={
                <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                  {post.title}
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {post.message.substring(0, 80)}...
                  </Typography>
                  <Typography variant="caption" className={classes.dateText}>
                    By {post.name} • {moment(post.createdAt).fromNow()}
                  </Typography>
                  <Box className={classes.tagsContainer}>
                    {post.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Chip
                        key={tagIndex}
                        label={tag}
                        size="small"
                        className={classes.chip}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Typography
                    variant="caption"
                    style={{
                      color: "#1976d2",
                      fontWeight: "bold",
                      display: "block",
                      marginTop: "8px",
                    }}
                  >
                    Similarity: {(post.similarityScore * 100).toFixed(0)}%
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

import PropTypes from "prop-types";

SimilarPosts.propTypes = {
  postId: PropTypes.string.isRequired,
};

export default SimilarPosts;
