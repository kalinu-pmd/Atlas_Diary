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

  // TEMPORARY: store debugOtp locally so we can
  // auto-fill it on the verify-email screen when
  // SMTP is blocked in hosting. Safe to delete.
  try {
    if (data?.debugOtp) {
      localStorage.setItem(
        "debug-signup-otp",
        JSON.stringify({
          email: data.email || formData.email,
          otp: data.debugOtp,
          createdAt: Date.now(),
        }),
      );
    }
  } catch {
    // ignore storage errors
  }

    toast.success(
      "OTP sent to your email. Please verify to complete signup.",
    );
    history.push(
      `/verify-email?email=${encodeURIComponent(
        data?.email || formData.email,
      )}`,
    );
    return true;
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message || "Sign up failed. Please try again.";
    toast.error(errorMessage);
    return false;
  }
};

export const verifyOtp = (formData, history) => async (dispatch) => {
  try {
    const { data } = await api.verifyOtp(formData);
    dispatch({ type: AUTH, payload: data });
    toast.success(
      `Welcome, ${data?.result?.name || "traveller"}! Your email has been verified.`,
    );
		// After successful signup + email verification, send user to
		// Account Settings so they can complete their profile first.
		history.push("/settings");
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message ||
      "Verification failed. Please check the code and try again.";
    toast.error(errorMessage);
  }
};

export const requestPasswordReset = (formData) => async () => {
  try {
    const { data } = await api.requestPasswordReset(formData);
    const message =
      data?.message ||
      "If an account with that email exists, we have sent a reset code.";
    toast.success(message);
    return true;
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message ||
      "Failed to request password reset. Please try again.";
    toast.error(errorMessage);
    return false;
  }
};

export const resetPasswordWithOtp = (formData, history) => async () => {
  try {
    const { data } = await api.resetPasswordWithOtp(formData);
    const message =
      data?.message || "Password reset successfully. You can now sign in.";
    toast.success(message);
    if (history) {
      history.push("/auth");
    }
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message ||
      "Failed to reset password. Please check the code and try again.";
    toast.error(errorMessage);
  }
};

export const verifyResetOtp = (formData) => async () => {
  try {
    const { data } = await api.verifyResetOtp(formData);
    const message =
      data?.message || "Reset code verified successfully. You can continue.";
    toast.success(message);
    return true;
  } catch (error) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message ||
      "Failed to verify reset code. Please check and try again.";
    toast.error(errorMessage);
    return false;
  }
};
