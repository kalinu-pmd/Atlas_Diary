import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { toast } from "react-toastify";

import Input from "./Input/Input";
import Signup from "./Signup";
import { signIn } from "../../actions/auth";

const initialFormData = {
	firstName: "",
	lastName: "",
	email: "",
	password: "",
	confirmPassword: "",
};

const Auth = () => {
	const dispatch = useDispatch();
	const history = useHistory();

	const [showPassword, setShowPassword] = useState(false);
	const [isSignup, setIsSignUp] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [formData, setFormData] = useState(initialFormData);
	const [errors, setErrors] = useState({});

	const validate = () => {
		const newErrors = {};
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const passwordPattern =
			/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

		if (!emailPattern.test(formData.email)) {
			newErrors.email = "Invalid email format.";
		}
		if (!passwordPattern.test(formData.password)) {
			newErrors.password =
				"Password must be at least 8 characters and include uppercase, lowercase, number and special character.";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validate()) {
			toast.error("Please fix the form errors before submitting.");
			return;
		}
		dispatch(signIn({ ...formData, rememberMe }, history));
	};

	const handleChange = (event) => {
		setFormData({ ...formData, [event.target.name]: event.target.value });
		setErrors({ ...errors, [event.target.name]: "" });
	};

	const handleShowPassword = () => {
		setShowPassword((prev) => !prev);
	};

	const switchMode = () => {
		setIsSignUp((prev) => !prev);
		setErrors({});
		setFormData(initialFormData);
		setShowPassword(false);
	};

	if (isSignup) {
		return <Signup onSwitchToSignIn={switchMode} />;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-off-white px-4 py-12">
			<div className="w-full max-w-sm bg-off-white border border-dark-green rounded-[15px] shadow-form p-6 flex flex-col items-center">
				{/* Avatar icon */}
				<div className="w-12 h-12 rounded-full bg-dark-green flex items-center justify-center mb-3">
					<MdLockOutline size={24} className="text-off-white" />
				</div>

				<h2 className="text-2xl font-bold text-text-dark mb-4">
					Sign In
				</h2>

				<form
					onSubmit={handleSubmit}
					noValidate
					className="w-full flex flex-col gap-3"
				>
					<Input
						name="email"
						label="Email Address"
						handleChange={handleChange}
						type="email"
						error={!!errors.email}
						helperText={errors.email}
						autoFocus
					/>

					<Input
						name="password"
						label="Password"
						handleChange={handleChange}
						type={showPassword ? "text" : "password"}
						handleShowPassword={handleShowPassword}
						error={!!errors.password}
						helperText={errors.password}
					/>
				{/* Remember Me Checkbox */}
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="rememberMe"
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
						className="w-4 h-4 rounded cursor-pointer accent-dark-green"
					/>
					<label
						htmlFor="rememberMe"
						className="text-sm text-text-gray cursor-pointer select-none"
					>
						Remember me
					</label>
				</div>
					<button
						type="submit"
						className="w-full mt-2 bg-light-green hover:bg-light-green-hover text-text-dark font-bold py-2.5 rounded-md transition-colors"
					>
						Sign In
					</button>

					<button
						type="button"
						onClick={switchMode}
						className="w-full text-sm text-dark-green font-semibold py-2 hover:underline transition-colors"
					>
						Don&apos;t have an account? Sign Up
					</button>
				</form>
			</div>
		</div>
	);
};

export default Auth;
