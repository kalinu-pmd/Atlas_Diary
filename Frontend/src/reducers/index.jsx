import { combineReducers } from "redux";
import posts from "./posts";
import selectedPost from "./selectedPost";
import auth from "./auth";
import notifications from "./notifications";

const rootReducer = combineReducers({
	posts,
	selectedPost,
	auth,
	notifications,
});

export default rootReducer;
