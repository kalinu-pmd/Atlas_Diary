import * as api from "../api";
import { AUTH } from "../constants/actionTypes";
import { toast } from "react-toastify";

export const signIn = (formData, history) => async (dispatch) => {
  try {
    const { data } = await api.signIn(formData);
    dispatch({ type: AUTH, payload: data });

    toast.success(`Welcome back, ${data.result.name}!`);
    history.push("/");
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message || "Login failed. Please try again.";
    toast.error(errorMessage);
  }
};

export const signUp = (formData, history) => async (dispatch) => {
  try {
    const { data } = await api.signUp(formData);
    dispatch({ type: AUTH, payload: data });

    toast.success(
      `Welcome, ${data.result.name}! Account created successfully.`
    );
    history.push("/");
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message || "Sign up failed. Please try again.";
    toast.error(errorMessage);
  }
};
