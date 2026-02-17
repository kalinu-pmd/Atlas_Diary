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

const recuder = (state = { isLoading: true, posts: [] }, action) => {
  switch (action.type) {
    case START_LOADING:
      return {
        ...state,
        isLoading: true,
      };

    case END_LOADING:
      return {
        ...state,
        isLoading: false,
      };

    case FETCH_ALL:
      return {
        ...state,
        posts: action.payload.data,
        currentPage: action.payload.currentPage,
        numberOfPages: action.payload.numberOfPages,
      };

    case UPDATE:
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
      };

    case CREATE:
      return {
        ...state,
        posts: [...state.posts, action.payload],
      };

    case DELETE:
      return {
        ...state,
        posts: state.posts.filter((post) => post._id !== action.payload),
      };

    case LIKE:
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
      };

    case FETCH_BY_SEARCH:
      return { ...state, posts: action.payload };

    case FETCH_BY_ID:
      return { ...state, post: action.payload };

    case COMMENT:
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
      };

    case FETCH_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: action.payload,
      };

    case FETCH_SIMILAR_POSTS:
      return {
        ...state,
        similarPosts: action.payload,
      };

    default:
      return state;
  }
};

export default recuder;
