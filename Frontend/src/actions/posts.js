import * as api from "../api";
import { toast } from "react-toastify";
import {
  CREATE,
  DELETE,
  UPDATE,
  FETCH_ALL,
  LIKE,
  FETCH_BY_SEARCH,
  START_LOADING,
  END_LOADING,
  FETCH_BY_ID,
  COMMENT,
  FETCH_RECOMMENDATIONS,
  FETCH_SIMILAR_POSTS,
} from "../constants/actionTypes";

export const getPosts = (page) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    const { data } = await api.fetchPosts(page);

    dispatch({ type: FETCH_ALL, payload: data });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.log("Error message : " + error);
    dispatch({ type: END_LOADING });
    toast.error(
      "Failed to load posts. Please check your connection and try again."
    );
  }
};

export const getPostsBySearch = (searchQuery) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    const { data } = await api.fetchPostsBySearch(searchQuery);

    dispatch({ type: FETCH_BY_SEARCH, payload: data });
    dispatch({ type: END_LOADING });

    if (data && data.length > 0) {
      toast.success(
        `Found ${data.length} post${
          data.length > 1 ? "s" : ""
        } matching your search!`
      );
    }
  } catch (error) {
    console.log(error);
    dispatch({ type: END_LOADING });
    toast.error("Search failed. Please try again.");
  }
};

export const getPostById = (id) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    const { data } = await api.fetchPostById(id);

    dispatch({ type: FETCH_BY_ID, payload: data });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.log(error);
    dispatch({ type: END_LOADING });
    toast.error("Failed to load post details. Please try again.");
  }
};

export const createPost = (post, history) => async (dispatch) => {
  try {
    const { data } = await api.createPost(post);

    dispatch({ type: CREATE, payload: data });
    toast.success("Post created successfully!");
    history.push(`/posts/${data._id}`);
  } catch (error) {
    console.log("Error message : " + error);
    const errorMessage =
      error.response?.data?.message ||
      "Failed to create post. Please try again.";
    toast.error(errorMessage);
  }
};

export const updatePost = (postId, post) => async (dispatch) => {
  try {
    const { data } = await api.updatePost(postId, post);
    dispatch({ type: UPDATE, payload: data });
    toast.success("Post updated successfully!");
  } catch (error) {
    console.log("Error message : " + error);
    const errorMessage =
      error.response?.data?.message ||
      "Failed to update post. Please try again.";
    toast.error(errorMessage);
  }
};

export const deletePost = (postId) => async (dispatch) => {
  try {
    await api.deletePost(postId);
    dispatch({ type: DELETE, payload: postId });
    toast.success("Post deleted successfully!");
  } catch (error) {
    console.log("Error message : " + error);
    const errorMessage =
      error.response?.data?.message ||
      "Failed to delete post. Please try again.";
    toast.error(errorMessage);
  }
};

export const likePost = (postId) => async (dispatch) => {
  try {
    const { data } = await api.likePost(postId);
    dispatch({ type: LIKE, payload: data });
    toast.success("Post liked!");
  } catch (error) {
    console.log("Error message : " + error);
    const errorMessage =
      error.response?.data?.message || "Failed to like post. Please try again.";
    toast.error(errorMessage);
  }
};

export const commentPost = (comment, postId) => async (dispatch) => {
  try {
    const { data } = await api.commentPost(comment, postId);

    dispatch({ type: COMMENT, payload: data });
    toast.success("Comment added successfully!");
    return data.comments;
  } catch (error) {
    console.log("Error message : " + error);
    const errorMessage =
      error.response?.data?.message ||
      "Failed to add comment. Please try again.";
    toast.error(errorMessage);
  }
};

// Recommendation actions
export const getRecommendations =
  (limit = 10) =>
  async (dispatch) => {
    try {
      dispatch({ type: START_LOADING });
      const { data } = await api.fetchRecommendations(limit);

      dispatch({ type: FETCH_RECOMMENDATIONS, payload: data });
      dispatch({ type: END_LOADING });

      if (data && data.length > 0) {
        toast.success(
          `Found ${data.length} personalized recommendation${
            data.length > 1 ? "s" : ""
          } for you!`
        );
      }
    } catch (error) {
      console.log("Error fetching recommendations:", error);
      dispatch({ type: END_LOADING });
      toast.error("Failed to load recommendations. Please try again later.");
    }
  };

export const getSimilarPosts =
  (postId, limit = 5) =>
  async (dispatch) => {
    try {
      const { data } = await api.fetchSimilarPosts(postId, limit);

      dispatch({ type: FETCH_SIMILAR_POSTS, payload: data });
    } catch (error) {
      console.log("Error fetching similar posts:", error);
    }
  };

export const trackPostView = (postId) => async (dispatch) => {
  try {
    await api.trackPostView(postId);
  } catch (error) {
    console.log("Error tracking post view:", error);
  }
};
