import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { toast } from "react-toastify";

import PropTypes from "prop-types";
import Input from "./Input/Input";
import { signUp } from "../../actions/auth";

const Signup = ({ onSwitchToSignIn }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const restoredFormData = location.state?.formData;

	const initialFormData = {
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	};

	const [formData, setFormData] = useState(
		restoredFormData ? { ...initialFormData, ...restoredFormData } : initialFormData,
	);
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const [passwordsMatch, setPasswordsMatch] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Keep the live password match indicator in sync even when
	// form data is restored from localStorage on mount.
	useEffect(() => {
		if (formData.password && formData.confirmPassword) {
			setPasswordsMatch(formData.password === formData.confirmPassword);
		} else {
			setPasswordsMatch(false);
		}
	}, [formData.password, formData.confirmPassword]);

	const namePattern = /^[a-zA-Z]+$/;
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const passwordPattern =
		/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

	const validate = () => {
		const newErrors = {};

		if (!namePattern.test(formData.firstName)) {
			newErrors.firstName = "First name must contain only letters.";
		}
		if (!namePattern.test(formData.lastName)) {
			newErrors.lastName = "Last name must contain only letters.";
		}
		if (!emailPattern.test(formData.email)) {
			newErrors.email = "Invalid email format.";
		}
		if (!passwordPattern.test(formData.password)) {
			newErrors.password =
				"Password must be at least 8 characters and include uppercase, lowercase, number and special character.";
		}
		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match.";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) {
			toast.error("Please fix the form errors before submitting.");
			return;
		}
		if (isSubmitting) return;
		setIsSubmitting(true);
		const success = await dispatch(signUp(formData, history));
		if (!success) {
			setIsSubmitting(false);
		}
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);
		setErrors({ ...errors, [name]: "" });

		// Live password match indicator
		if (name === "password" || name === "confirmPassword") {
			if (updated.password && updated.confirmPassword) {
				setPasswordsMatch(updated.password === updated.confirmPassword);
			} else {
				setPasswordsMatch(false);
			}
		}
	};

	const handleShowPassword = () => {
		setShowPassword((prev) => !prev);
	};

	const handleSwitch = () => {
		if (typeof onSwitchToSignIn === "function") {
			onSwitchToSignIn();
		} else {
			history.push("/auth");
		}
	};

	const canSubmit = (() => {
		// Only check that all fields are filled; detailed
		// validation is handled on submit with alerts.
		const firstName = formData.firstName.trim();
		const lastName = formData.lastName.trim();
		const email = formData.email.trim();

		return (
			firstName &&
			lastName &&
			email &&
			formData.password &&
			formData.confirmPassword
		);
	})();

	return (
		<div className="min-h-screen flex items-center justify-center bg-off-white px-4 py-12">
			<div className="w-full max-w-sm bg-off-white border border-dark-green rounded-[15px] shadow-form p-6 flex flex-col items-center">
				{/* Avatar icon */}
				<div className="w-12 h-12 rounded-full bg-dark-green flex items-center justify-center mb-3">
					<MdLockOutline size={24} className="text-off-white" />
				</div>

				<h2 className="text-2xl font-bold text-text-dark mb-4">
					Sign Up
				</h2>

				<form
					onSubmit={handleSubmit}
					noValidate
					className="w-full flex flex-col gap-3"
				>
					{/* First / Last name row */}
					<div className="flex gap-2">
						<Input
							half
							name="firstName"
							label="First Name"
							value={formData.firstName}
							handleChange={handleChange}
							error={!!errors.firstName}
							helperText={errors.firstName}
							autoFocus
						/>
						<Input
							half
							name="lastName"
							label="Last Name"
							value={formData.lastName}
							handleChange={handleChange}
							error={!!errors.lastName}
							helperText={errors.lastName}
						/>
					</div>

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
						name="password"
						label="Password"
						value={formData.password}
						handleChange={handleChange}
						type={showPassword ? "text" : "password"}
						handleShowPassword={handleShowPassword}
						error={!!errors.password}
						helperText={errors.password}
					/>

					<Input
						name="confirmPassword"
						label="Repeat Password"
						value={formData.confirmPassword}
						handleChange={handleChange}
						type={showPassword ? "text" : "password"}
						error={!!errors.confirmPassword}
						helperText={errors.confirmPassword}
					/>
					{formData.password && formData.confirmPassword && (
						<p
							className={`text-xs mt-[-4px] ${
								passwordsMatch
									? "text-green-600"
									: "text-red-600"
							}`}
						>
							{passwordsMatch
								? "Passwords match"
								: "Passwords do not match"}
						</p>
					)}

					<button
						type="submit"
						disabled={!canSubmit || isSubmitting}
						className={`w-full mt-2 font-bold py-2.5 rounded-md transition-colors ${
							canSubmit && !isSubmitting
								? "bg-light-green hover:bg-light-green-hover text-text-dark"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
						}`}
					>
						{isSubmitting ? "Sending..." : "Send OTP"}
					</button>

					<button
						type="button"
						onClick={handleSwitch}
						className="w-full text-sm text-dark-green font-semibold py-2 hover:underline transition-colors"
					>
						Already have an account? Sign In
					</button>
				</form>
			</div>
		</div>
	);
};

Signup.propTypes = {
	onSwitchToSignIn: PropTypes.func,
};

export default Signup;
