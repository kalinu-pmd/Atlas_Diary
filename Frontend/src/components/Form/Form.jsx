import { useState, useEffect } from "react";
import useStyles from "./styles";
import { TextField, Button, Typography, Paper } from "@material-ui/core";
import FileBase from "react-file-base64";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createPost, updatePost } from "../../actions/posts";

const Posts = () => {
  const initial = { title: "", message: "", tags: "", selectedFile: [] };
  const [postData, setPostData] = useState(initial);
  const [error, setError] = useState("");

  const classes = useStyles();
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
        "Please fill in all required fields (Title, Message, and Tags)."
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
        updatePost(selectedPost, { ...postData, name: user?.result?.name })
      );
    } else {
      dispatch(createPost({ ...postData, name: user?.result?.name }, history));
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
      <Paper className={classes.paper}>
        <Typography variant="h6">
          Please Sign In to create your own posts and like others posts.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper className={classes.paper} elevation={6}>
      <form
        autoComplete="off"
        noValidate
        className={`${classes.root} ${classes.form}`}
        onSubmit={handleFormSubmit}
      >
        <Typography variant="h6">
          {selectedPost ? "Updating a Post" : "Creating a Post"}
        </Typography>
        {error && (
          <Typography color="error" variant="subtitle2">
            {error}
          </Typography>
        )}
        <TextField
          name="title"
          variant="outlined"
          label="Title"
          fullWidth
          value={postData.title}
          onChange={(event) =>
            setPostData({ ...postData, title: event.target.value })
          }
        />
        <TextField
          name="message"
          variant="outlined"
          label="Message"
          fullWidth
          value={postData.message}
          onChange={(event) =>
            setPostData({ ...postData, message: event.target.value })
          }
        />
        <TextField
          name="tags"
          variant="outlined"
          label="Tags (comma separated)"
          fullWidth
          value={postData.tags}
          onChange={(event) =>
            setPostData({ ...postData, tags: event.target.value.split(",") })
          }
        />
        <div className={classes.fileInput}>
          <Typography className={classes.fileInputLabel}>
            Upload Images (Optional)
          </Typography>
          <FileBase
            type="file"
            multiple={true}
            onDone={(files) => {
              if (Array.isArray(files)) {
                // Handle multiple files
                const fileStrings = files.map((file) => file.base64);
                setPostData({ ...postData, selectedFile: fileStrings });
                toast.success(
                  `${files.length} image${
                    files.length > 1 ? "s" : ""
                  } uploaded successfully!`
                );
              } else {
                // Handle single file (backwards compatibility)
                setPostData({ ...postData, selectedFile: [files.base64] });
                toast.success("Image uploaded successfully!");
              }
            }}
          />
          <Typography className={classes.fileInputHelp}>
            You can upload multiple images to enhance your post. Supported
            formats: JPG, PNG, GIF
          </Typography>
        </div>
        <Button
          className={classes.buttonSubmit}
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          fullWidth
        >
          Submit
        </Button>
        <Button
          className={classes.buttonClear}
          variant="contained"
          color="secondary"
          size="small"
          onClick={clearPost}
          fullWidth
        >
          Clear
        </Button>
      </form>
    </Paper>
  );
};

export default Posts;
