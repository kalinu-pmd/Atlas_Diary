import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { toast } from "react-toastify";

import Input from "./Input/Input";
import { resetPasswordWithOtp, verifyResetOtp } from "../../actions/auth";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const emailFromQuery = params.get("email") || "";

  const [formData, setFormData] = useState({
    email: emailFromQuery,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [otpVerified, setOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!emailFromQuery) {
      toast.error("❌ Missing email. Please request a new reset link.", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [emailFromQuery]);

  const validateAll = () => {
    const newErrors = {};
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required.";
    } else if (!passwordPattern.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must be 8+ chars with uppercase, lowercase, number & special character.";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (isVerifyingOtp) return;

    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.otp || formData.otp.length < 4) {
      newErrors.otp = "Please enter the code we emailed you.";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please enter a valid email and code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const ok = await dispatch(
        verifyResetOtp({ email: formData.email, otp: formData.otp }),
      );
      if (ok) {
        setOtpVerified(true);
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!otpVerified) {
      toast.error("Please verify your reset code first.");
      return;
    }
    
    if (!validateAll()) {
      toast.error("✋ Please fix the form errors before submitting", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        resetPasswordWithOtp(
          {
            email: formData.email,
            otp: formData.otp,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          },
          history,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white px-4 py-12">
      <div className="w-full max-w-sm bg-off-white border border-dark-green rounded-[15px] shadow-form p-6 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-dark-green flex items-center justify-center mb-3">
          <MdLockOutline size={24} className="text-off-white" />
        </div>

        <h2 className="text-2xl font-bold text-text-dark mb-1">
          Reset password
        </h2>
        <p className="text-xs text-text-gray mb-4 text-center">
          Enter the verification code we sent to your email and choose a new
          password.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full flex flex-col gap-4"
        >
          <Input
            name="email"
            label="Email Address"
            value={formData.email}
            handleChange={handleChange}
            type="email"
            error={!!errors.email}
            helperText={errors.email}
          />

          <Input
            name="otp"
            label="Reset Code"
            value={formData.otp}
            handleChange={handleChange}
            type="text"
            error={!!errors.otp}
            helperText={errors.otp}
          />

          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={isVerifyingOtp || otpVerified}
            className={`w-full font-bold py-2.5 rounded-md transition-colors ${
              isVerifyingOtp || otpVerified
                ? "bg-light-green/60 text-text-gray cursor-not-allowed"
                : "bg-light-green hover:bg-light-green-hover text-text-dark"
            }`}
          >
            {otpVerified
              ? "Code verified"
              : isVerifyingOtp
                ? "Verifying..."
                : "Verify code"}
          </button>

          {otpVerified && (
            <>
          <Input
            name="newPassword"
            label="New Password"
            value={formData.newPassword}
            handleChange={handleChange}
            type={showPassword ? "text" : "password"}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            handleShowPassword={handleShowPassword}
          />

          <Input
            name="confirmPassword"
            label="Confirm New Password"
            value={formData.confirmPassword}
            handleChange={handleChange}
            type={showConfirmPassword ? "text" : "password"}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            handleShowPassword={handleShowConfirmPassword}
          />

          {errors.newPassword && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-xs text-red-700">
              <p className="font-semibold mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-2 font-bold py-2.5 rounded-md transition-colors ${
              isSubmitting
                ? "bg-light-green/60 text-text-gray cursor-not-allowed"
                : "bg-light-green hover:bg-light-green-hover text-text-dark"
            }`}
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
            </>
          )}

          <button
            type="button"
            onClick={() => history.push("/auth")}
            className="w-full text-sm text-dark-green font-semibold py-2 hover:underline transition-colors"
          >
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
