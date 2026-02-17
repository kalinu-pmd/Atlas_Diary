import React, { useEffect, useState, useCallback } from "react";
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
  IconButton,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import decode from "jwt-decode";
import { toast } from "react-toastify";

import { LOGOUT } from "../../constants/actionTypes";
import useStyles from "./styles";
import logo from "../../Images/logo.svg";

/*
  Updated Navbar layout to follow the homepage UI:
  - Brand (logo + name) left-aligned
  - Navigation centered (hidden on small screens)
  - Auth actions on the right with a prominent "Sign Up" CTA
  - Mobile menu toggle (simple open/close that reveals vertical nav)
*/

function Navbar() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useSelector((state) => state.auth.authData);
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = useCallback(() => {
    dispatch({ type: LOGOUT });
    toast.success("Logged out successfully!");
    history.push("/");
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

  // Toggle mobile nav
  const toggleMobile = () => setMobileOpen((s) => !s);

  // Navigation items (center)
  const navItems = [
    { label: "Explore", to: "/explore" },
    { label: "How it Works", to: "/how-it-works" },
    { label: "Public Diaries", to: "/public-diaries" },
  ];

  return (
    <AppBar
      className={classes.appBar}
      position="sticky"
      elevation={2}
      style={{
        // Override the dark theme in styles.js to match the light/header aesthetic
        background: "#FBF7F2",
        color: "#2f6b4f",
        zIndex: 1301,
      }}
    >
      <Toolbar
        className={classes.toolbar}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Brand (left) */}
        <Box
          className={classes.brandContainer}
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <Link to="/" className={classes.brandLink} aria-label="Atlas Diary">
            <img
              src={logo}
              alt="Atlas Diary"
              className={classes.brandName}
              style={{
                height: 40,
                width: "auto",
                display: "block",
              }}
            />
          </Link>
        </Box>

        {/* Center navigation (desktop) */}
        <Box
          component="nav"
          aria-label="Primary navigation"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: isMobile ? "none" : "flex",
            gap: 28,
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: 600,
                padding: "8px 10px",
                borderRadius: 8,
              }}
            >
              <Typography
                variant="body1"
                style={{
                  color: "#4b4b44",
                  fontWeight: 600,
                }}
              >
                {item.label}
              </Typography>
            </Link>
          ))}
        </Box>

        {/* Auth / actions (right) */}
        <Box
          className={classes.navSection}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginLeft: "auto",
          }}
        >
          {/* Show hamburger on mobile */}
          {isMobile && (
            <IconButton
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={toggleMobile}
              size="small"
              style={{ color: "#2f6b4f" }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}

          {/* If logged in */}
          {user ? (
            <Box
              className={classes.userSection}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
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

              <Box
                className={classes.userProfile}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <Avatar
                  className={classes.avatar}
                  alt={user.result.name}
                  src={user.result.imageUrl}
                  style={{ cursor: "pointer" }}
                >
                  {user.result.name?.charAt(0).toUpperCase()}
                </Avatar>

                {!isMobile && (
                  <Typography
                    className={classes.userName}
                    variant="subtitle1"
                    style={{ color: "#333333" }}
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
                    marginLeft: 8,
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Box>
          ) : (
            /* Not logged in: show Login and Sign Up CTA */
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Button
                component={Link}
                to="/auth"
                variant="text"
                className={classes.loginLink}
                size={isMobile ? "small" : "medium"}
                style={{
                  color: "#4b4b44",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Login
              </Button>

              <Button
                component={Link}
                to="/signup"
                variant="contained"
                className={classes.signInButton}
                size={isMobile ? "small" : "medium"}
                style={{
                  background: "linear-gradient(180deg,#2f6b4f,#2b6f4f)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "8px 16px",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>

        {/* Mobile dropdown (simple vertical nav) */}
        {isMobile && mobileOpen && (
          <Box
            component="div"
            role="menu"
            aria-label="Mobile navigation"
            style={{
              position: "absolute",
              top: "64px",
              left: 8,
              right: 8,
              background: "#FBF7F2",
              padding: 12,
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              zIndex: 1200,
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#2f6b4f",
                  fontWeight: 600,
                  background: "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                style={{ marginTop: 8 }}
              >
                Logout
              </Button>
            ) : (
              <Box style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Button
                  component={Link}
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  variant="text"
                  style={{ color: "#2f6b4f" }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  variant="contained"
                  style={{
                    background: "linear-gradient(180deg,#2f6b4f,#2b6f4f)",
                    color: "#fff",
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
