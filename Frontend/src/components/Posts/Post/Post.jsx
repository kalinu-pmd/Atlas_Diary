import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import useStyles from "./styles";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  ButtonBase,
} from "@material-ui/core";

import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
import ThumbUpAltOutlined from "@material-ui/icons/ThumbUpAltOutlined";
import DeleteIcon from "@material-ui/icons/Delete";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";

import { deletePost, likePost } from "../../../actions/posts";

const Post = ({ post }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.auth.authData);

  const [likes, setLikes] = useState(post?.likes);
  const userId = user?.result?.googleId || user?.result?._id;
  const hasAlreadyLiked = post.likes.find((like) => like === userId);

  const Likes = () => {
    const len = likes.length;

    if (len > 0) {
      return hasAlreadyLiked ? (
        <>
          <ThumbUpAltIcon fontSize="small" />
          &nbsp;
          {len >= 2
            ? `You and ${len - 1} ${len === 2 ? "other" : "others"}`
            : `${len} like${len > 1 ? "s" : ""}`}{" "}
        </>
      ) : (
        <>
          <ThumbUpAltOutlined fontSize="small" />
          &nbsp;{len} {len === 1 ? "Like" : "Likes"}
        </>
      );
    }
    return (
      <>
        <ThumbUpAltOutlined fontSize="small" />
        &nbsp;Like
      </>
    );
  };

  const Delete = () => {
    return (
      (user?.result.googleId === post?.creator ||
        user?.result._id === post?.creator) && (
        <Button
          size="small"
          color="secondary"
          onClick={() => dispatch(deletePost(post._id))}
        >
          <DeleteIcon fontSize="small" /> &nbsp;Delete
        </Button>
      )
    );
  };

  const More = () => {
    return (
      (user?.result.googleId === post?.creator ||
        user?.result?._id === post?.creator) && (
        <div className={classes.overlay2}>
          <Button
            style={{ color: "white" }}
            size="small"
            onClick={() => {
              dispatch({ type: "SELECTED_POST", payload: post._id });
              toast.info("Post selected for editing!");
            }}
          >
            <MoreHorizIcon fontSize="default" />
          </Button>
        </div>
      )
    );
  };

  const openPost = () => {
    history.push(`/posts/${post._id}`);
  };

  const handleLike = async () => {
    dispatch(likePost(post._id));

    if (hasAlreadyLiked) {
      setLikes(post.likes.filter((id) => id !== userId));
    } else {
      setLikes([...post.likes, userId]);
    }
  };

  return (
    <Card className={classes.card} raised elevation={6}>
      <CardMedia
        className={classes.media}
        image={
          Array.isArray(post.selectedFile) && post.selectedFile.length > 0
            ? post.selectedFile[0]
            : post.selectedFile ||
              "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png"
        }
        title={post.title}
      />
      {Array.isArray(post.selectedFile) && post.selectedFile.length > 1 && (
        <div className={classes.imageCounter}>
          +{post.selectedFile.length - 1} more
        </div>
      )}
      <div className={classes.overlay}>
        <Typography variant="h6"> {post.name} </Typography>
        <Typography variant="body2">
          {" "}
          {moment(post.createdAt).fromNow()}{" "}
        </Typography>
      </div>
      <div className={classes.overlay2}>
        <More />
      </div>
      <ButtonBase className={classes.cardAction} onClick={openPost}>
        <div className={classes.details}>
          <Typography variant="body2" color="textSecondary" component="h2">
            {" "}
            {post.tags.map((tag) => `#${tag} `)}{" "}
          </Typography>
        </div>
        <Typography
          className={classes.title}
          variant="h5"
          gutterBottom
          component="h2"
        >
          {" "}
          {post.title}{" "}
        </Typography>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {" "}
            {post.message.split(" ").splice(0, 25).join(" ")}...{" "}
          </Typography>
        </CardContent>
      </ButtonBase>

      <CardActions className={classes.cardActions}>
        <Button
          size="small"
          color="primary"
          disabled={!user?.result}
          onClick={handleLike}
        >
          <Likes />
        </Button>

        <Delete />
      </CardActions>
    </Card>
  );
};

export default Post;
