import { combineReducers } from "redux";
import posts from "./posts";
import selectedPost from "./selectedPost";
import auth from "./auth";

const rootReducer = combineReducers({
	posts,
	selectedPost,
	auth,
});

export default rootReducer;
