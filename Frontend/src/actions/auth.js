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

  // Cache the signup details so the user can go back and edit
  try {
    localStorage.setItem("pending-signup-data", JSON.stringify(formData));
  } catch {
    // ignore storage errors
  }

  toast.success(
    "OTP sent to your email. Please verify to complete signup.",
  );
  history.push(
    `/verify-email?email=${encodeURIComponent(data?.email || formData.email)}`
  );
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message || "Sign up failed. Please try again.";
    toast.error(errorMessage);
  }
};

export const verifyOtp = (formData, history) => async (dispatch) => {
  try {
    const { data } = await api.verifyOtp(formData);
    dispatch({ type: AUTH, payload: data });
    toast.success(
      `Welcome, ${data?.result?.name || "traveller"}! Your email has been verified.`,
    );
    history.push("/");
  try {
    localStorage.removeItem("pending-signup-data");
  } catch {
    // ignore
  }
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message ||
      "Verification failed. Please check the code and try again.";
    toast.error(errorMessage);
  }
};
