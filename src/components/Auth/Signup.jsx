import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Avatar,
  Button,
  Paper,
  Grid,
  Typography,
  Container,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { toast } from "react-toastify";

import useStyles from "./styles";
import Input from "./Input/Input";
import { signUp } from "../../actions/auth";

/**
 * Signup component
 *
 * This is a self-contained sign-up form that mirrors the style and validation
 * used in `Auth.jsx`. It dispatches the existing `signUp` action and will
 * navigate using react-router's history after a successful signup attempt.
 *
 * Props:
 * - onSwitchToSignIn (optional): a callback invoked when the user wants to switch
 *   to sign-in flow. If not provided, the component will attempt to navigate to
 *   "/auth" (which is the typical route used for authentication).
 */
const Signup = ({ onSwitchToSignIn }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const namePattern = /^[a-zA-Z]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    // Dispatch the signUp action (existing action in your project)
    dispatch(signUp(formData, history));
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSwitch = () => {
    if (typeof onSwitchToSignIn === "function") {
      onSwitchToSignIn();
    } else {
      // Fallback: navigate to the common auth route where sign-in is usually handled
      history.push("/auth");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper className={classes.paper} elevation={3}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography variant="h5">Sign Up</Typography>

        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Input
              half
              name="firstName"
              label="First Name"
              handleChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              autoFocus
            />
            <Input
              half
              name="lastName"
              label="Last Name"
              handleChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
            />

            <Input
              name="email"
              label="Email Address"
              handleChange={handleChange}
              type="email"
              error={!!errors.email}
              helperText={errors.email}
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

            <Input
              name="confirmPassword"
              label="Repeat Password"
              handleChange={handleChange}
              type={showPassword ? "text" : "password"}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign Up
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                onClick={handleSwitch}
                fullWidth
                color="secondary"
                style={{ marginTop: 8 }}
              >
                Already have an account? Sign In
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Signup;
