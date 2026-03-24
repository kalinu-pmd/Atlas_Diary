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

  useEffect(() => {
    if (!emailFromQuery) {
      toast.error("Missing email. Please request a new reset link.");
    }
  }, [emailFromQuery]);

  const validateAll = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.otp || formData.otp.length < 4) {
      newErrors.otp = "Please enter the code we emailed you.";
    }
    if (!passwordPattern.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character.";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

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

    const ok = await dispatch(
      verifyResetOtp({ email: formData.email, otp: formData.otp }),
    );
    if (ok) {
      setOtpVerified(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error("Please verify the reset code first.");
      return;
    }

    if (!validateAll()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    dispatch(
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
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
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
          className="w-full flex flex-col gap-3"
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
            className="w-full mt-1 bg-light-green hover:bg-light-green-hover text-text-dark font-bold py-2.5 rounded-md transition-colors"
          >
            Verify code
          </button>

          {otpVerified && (
            <>
              <Input
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                handleChange={handleChange}
                type="password"
                error={!!errors.newPassword}
                helperText={errors.newPassword}
              />

              <Input
                name="confirmPassword"
                label="Confirm New Password"
                value={formData.confirmPassword}
                handleChange={handleChange}
                type="password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />

              <button
                type="submit"
                className="w-full mt-2 bg-light-green hover:bg-light-green-hover text-text-dark font-bold py-2.5 rounded-md transition-colors"
              >
                Reset password
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
