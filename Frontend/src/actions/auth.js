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

    toast.success(
      "OTP sent to your email. Please verify to complete signup.",
    );
    history.push(
      `/verify-email?email=${encodeURIComponent(
        data?.email || formData.email,
      )}`,
      { formData },
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

export const resendOtp = (email) => async (dispatch) => {
  try {
    const { data } = await api.resendOtp({ email });
    
    // Show success message whether email was delivered or just regenerated
    const message = data?.message || "OTP sent successfully.";
    toast.success(message);
    
    return true;
  } catch (error) {
    console.log("resendOtp error:", error);
    
    // Provide helpful error messages based on the response
    let errorMessage = "Failed to resend OTP. Please try again.";
    
    if (error.response?.status === 404) {
      errorMessage = "User account not found.";
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || "Cannot resend OTP. Please check your email or try signing up again.";
    } else if (error.response?.status === 500) {
      errorMessage = "Server error. Please try again in a moment.";
    } else if (error.message === "Network Error") {
      errorMessage = "Network error. Please check your connection and try again.";
    } else {
      errorMessage = error.response?.data?.message || "Failed to resend OTP. Please try again.";
    }
    
    toast.error(errorMessage);
    return false;
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
