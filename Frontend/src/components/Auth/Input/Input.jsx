import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import PropTypes from "prop-types";

const Input = ({
	half,
	name,
	label,
	handleChange,
	type,
	error,
	autoFocus,
	handleShowPassword,
	helperText,
}) => {
	return (
		<div className={`${half ? "w-1/2 px-1" : "w-full"} mb-1`}>
			<div className="relative">
				<input
					name={name}
					id={name}
					type={type || "text"}
					onChange={handleChange}
					autoFocus={autoFocus}
					required
					placeholder=" "
					className={`
            peer w-full bg-off-white border rounded-md px-3 pt-5 pb-2 text-sm text-text-dark outline-none transition-colors
            ${
				error
					? "border-red-500 focus:border-red-500"
					: "border-dark-green focus:border-dark-green hover:border-light-green"
			}
          `}
				/>
				<label
					htmlFor={name}
					className={`
            absolute left-3 top-1 text-xs font-medium transition-all pointer-events-none
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
            peer-focus:top-1 peer-focus:text-xs
            ${error ? "text-red-500" : "text-text-dark peer-focus:text-dark-green"}
          `}
				>
					{label}
				</label>

				{name === "password" && handleShowPassword && (
					<button
						type="button"
						onClick={handleShowPassword}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-green hover:text-light-green transition-colors"
						tabIndex={-1}
					>
						{type === "password" ? (
							<MdVisibility size={20} />
						) : (
							<MdVisibilityOff size={20} />
						)}
					</button>
				)}
			</div>

			{helperText && (
				<p className="mt-1 text-xs text-red-500 px-1">{helperText}</p>
			)}
		</div>
	);
};

Input.propTypes = {
	half: PropTypes.bool,
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	handleChange: PropTypes.func.isRequired,
	type: PropTypes.string,
	error: PropTypes.bool,
	autoFocus: PropTypes.bool,
	handleShowPassword: PropTypes.func,
	helperText: PropTypes.string,
};

export default Input;
