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

const initialState = {
  isLoading: true,
  posts: [],
  post: null,
  similarPosts: [],
  recommendations: [],
  currentPage: 1,
  numberOfPages: 1,
};

const recuder = (state = initialState, action) => {
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
        similarPosts: state.similarPosts,
        recommendations: state.recommendations,
      };

    case UPDATE:
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
        similarPosts: state.similarPosts,
        recommendations: state.recommendations,
      };

    case CREATE:
      return {
        ...state,
        posts: [...state.posts, action.payload],
        similarPosts: state.similarPosts,
        recommendations: state.recommendations,
      };

    case DELETE:
      return {
        ...state,
        posts: state.posts.filter((post) => post._id !== action.payload),
        similarPosts: state.similarPosts,
        recommendations: state.recommendations,
      };

    case LIKE:
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
        similarPosts: state.similarPosts,
        recommendations: state.recommendations,
      };

    case FETCH_BY_SEARCH:
      return { ...state, posts: action.payload, isLoading: false, similarPosts: state.similarPosts, recommendations: state.recommendations };

    case FETCH_BY_ID:
      return { ...state, post: action.payload, similarPosts: state.similarPosts, recommendations: state.recommendations };

    case COMMENT:
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
        similarPosts: state.similarPosts,
        recommendations: state.recommendations,
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
