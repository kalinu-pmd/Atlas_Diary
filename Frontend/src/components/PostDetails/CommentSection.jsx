import React, { useState, useRef } from "react";
import { Typography, TextField, Button } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import { commentPost } from "../../actions/posts";
import useStyles from "./styles";

const CommentSection = ({ post }) => {
  const classes = useStyles();
  const [comments, setComments] = useState(post?.comments);

  // const {post, posts, isLoading} = useSelector((state) => state.posts);
  const commentRef = useRef();

  const [comment, setComment] = useState("");
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.authData);

  const handleClick = async () => {
    const commentFinal = `${user.result.name}: ${comment}`;
    const newComment = await dispatch(commentPost(commentFinal, post._id));
    setComments(newComment);
    setComment("");

    commentRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const CommentsComp = () => {
    return comments.map((c, i) => (
      <div className={classes.commentItem} key={i}>
        <Typography variant="body1" component="div">
          <strong>{c?.split(": ")[0]}</strong>
          <span style={{ marginLeft: "8px" }}>{c?.split(":")[1]}</span>
        </Typography>
      </div>
    ));
  };

  return (
    <div>
      <div className={classes.commentsOuterContainer}>
        <div className={classes.commentsInnerContainer}>
          <Typography
            variant="h6"
            gutterBottom
            style={{
              color: "#0c342c",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Comments ({comments.length})
          </Typography>
          {comments.length > 0 ? (
            <CommentsComp />
          ) : (
            <Typography
              variant="body2"
              style={{
                color: "#666666",
                fontStyle: "italic",
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              No comments yet. Be the first to comment!
            </Typography>
          )}
          <div ref={commentRef} />
        </div>
        {user?.result?.name && (
          <div className={classes.commentForm}>
            <Typography
              variant="h6"
              gutterBottom
              style={{
                color: "#0c342c",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Write a comment
            </Typography>
            <TextField
              fullWidth
              rows={4}
              variant="outlined"
              label="Share your thoughts..."
              multiline
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={classes.commentTextField}
              placeholder="What do you think about this post?"
            />
            <Button
              fullWidth
              disabled={!comment.trim()}
              variant="contained"
              onClick={handleClick}
              className={classes.commentButton}
            >
              Post Comment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
