import {SELECTED_POST} from '../constants/actionTypes';

const reducer = (selectedPost = '' , action) =>{
    switch (action.type) {
        case SELECTED_POST:
            return action.payload;
        default:
            return selectedPost
    }
}

export default reducer;