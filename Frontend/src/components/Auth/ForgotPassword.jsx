import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { toast } from "react-toastify";

import Input from "./Input/Input";
import { requestPasswordReset } from "../../actions/auth";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please enter a valid email.");
      return;
    }

    dispatch(requestPasswordReset({ email: formData.email }));
    // After requesting, guide user towards reset screen
    history.push(`/reset-password?email=${encodeURIComponent(formData.email)}`);
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
          Forgot password
        </h2>
        <p className="text-xs text-text-gray mb-4 text-center">
          Enter your registered email address and we will send you a
          verification code to reset your password.
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
            autoFocus
          />

          <button
            type="submit"
            className="w-full mt-2 bg-light-green hover:bg-light-green-hover text-text-dark font-bold py-2.5 rounded-md transition-colors"
          >
            Send reset code
          </button>

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

export default ForgotPassword;
