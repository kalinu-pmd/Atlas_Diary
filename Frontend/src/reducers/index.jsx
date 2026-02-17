import { combineReducers } from "redux";
import posts from './posts';
import selectedPost from './selectedPost';
import auth from './auth';

export default combineReducers({
    posts,
    selectedPost,
    auth,
});
