import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import {
	AppBar,
	Avatar,
	Button,
	Toolbar,
	Typography,
	Box,
	useMediaQuery,
	useTheme,
} from "@material-ui/core";
import decode from "jwt-decode";
import { toast } from "react-toastify";

import { LOGOUT } from "../../constants/actionTypes";
import useStyles from "./styles";
import logo from "../../Images/logo.svg";

function Navbar() {
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const user = useSelector((state) => state.auth.authData);
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();

	const logout = React.useCallback(() => {
		dispatch({ type: LOGOUT });
		toast.success("Logged out successfully!");
		history.push("/");
		Navbar;
	}, [dispatch, history]);

	useEffect(() => {
		const token = user?.token;

		if (token) {
			const decodedToken = decode(token);

			if (decodedToken.exp * 1000 < new Date().getTime()) {
				logout();
			}
		}
	}, [location, user?.token, logout]);

	// To prevent content being hidden under the sticky navbar, add a top margin or padding to your main content equal to the navbar's height (e.g., 64px for desktop, 56px for mobile)
	// Example in your main layout/component: <div style={{ marginTop: 64 }}>...</div>
	return (
		<AppBar
			className={classes.appBar}
			position="sticky"
			elevation={2}
			style={{ background: "#fff", zIndex: 1301 }}
		>
			<Toolbar
				className={classes.toolbar}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				{/* Brand Section */}
				<Box className={classes.brandContainer}>
					<Link to="/" className={classes.brandLink}>
						<img
							src={logo}
							alt="brand name"
							className={classes.brandName}
						/>
						{/* <img src={mainImg} alt="brand icon" className={classes.brandIcon} /> */}
					</Link>
				</Box>

				{/* Navigation Section */}
				<Box
					className={classes.navSection}
					style={{ display: "flex", alignItems: "center" }}
				>
					{user ? (
						<Box className={classes.userSection}>
							{/* Admin Dashboard Link */}
							{user.result.isAdmin && (
								<Button
									component={Link}
									to="/dashboard"
									className={classes.adminButton}
									variant="text"
									color="inherit"
								>
									Dashboard
								</Button>
							)}

							{/* Recommendation Button */}
							<Button
								component={Link}
								to="/recommendations"
								className={classes.recommendationButton}
								variant="outlined"
								color="primary"
								size={isMobile ? "small" : "medium"}
							>
								For You
							</Button>

							{/* User Profile Section */}
							<Box className={classes.userProfile}>
								<Avatar
									className={classes.avatar}
									alt={user.result.name}
									src={user.result.imageUrl}
								>
									{user.result.name.charAt(0).toUpperCase()}
								</Avatar>

								{!isMobile && (
									<Typography
										className={classes.userName}
										variant="subtitle1"
									>
										{user.result.name}
									</Typography>
								)}

								<Button
									variant="contained"
									className={classes.logoutButton}
									color="secondary"
									onClick={logout}
									size={isMobile ? "small" : "medium"}
									style={{
										maxWidth: 120,
										flexShrink: 1,
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
										marginLeft: 16,
										marginRight: 16,
									}}
								>
									Logout
								</Button>
							</Box>
						</Box>
					) : (
						<Button
							component={Link}
							to="/auth"
							variant="contained"
							color="primary"
							className={classes.signInButton}
							size={isMobile ? "small" : "medium"}
							style={{
								alignSelf: "center",
								maxWidth: 120,
								flexShrink: 1,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								marginRight: 16,
							}}
						>
							Sign In
						</Button>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
}

export default Navbar;
