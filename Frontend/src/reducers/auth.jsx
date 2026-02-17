import {AUTH, LOGOUT} from '../constants/actionTypes';

const reducer = (state= {authData: JSON.parse(localStorage.getItem('traveller-profile'))}, action) =>{
    switch (action.type) {
        case AUTH:
            localStorage.setItem('traveller-profile', JSON.stringify({...action?.payload}));
            return {...state, authData : action?.payload };
        case LOGOUT:
            localStorage.removeItem('traveller-profile');
            return {...state, authData : null };
        default:
            return state;
    }
}

export default reducer;