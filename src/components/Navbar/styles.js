import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  // Theme tokens used across the navbar
  rootVars: {
    // not applied directly, just for reference
    "--bg": "#FBF7F2",
    "--muted": "#4b4b44",
    "--accent": "#2f6b4f",
    "--accent-strong": "#2b6f4f",
    "--cta-light": "#9ee100",
  },

  appBar: {
    backgroundColor: "#FBF7F2", // light cream like homepage
    boxShadow: "0 6px 18px rgba(34,34,34,0.06)",
    borderBottom: "1px solid rgba(47,107,79,0.06)",
    position: "sticky",
    top: 0,
    zIndex: 1300,
    minHeight: 64,
    // keep content flow consistent with sticky header
    "&.MuiAppBar-root": {
      color: "#2f6b4f",
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: 56,
    },
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    padding: "6px 20px",
    minHeight: 64,
    maxWidth: 1100,
    width: "100%",
    margin: "0 auto",
    position: "relative", // allows center nav to be absolutely centered
    [theme.breakpoints.down("sm")]: {
      padding: "6px 12px",
      minHeight: 56,
    },
  },

  /* Brand (left) */
  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "inherit",
    transition: "transform 180ms ease, opacity 180ms ease",
    "&:hover": {
      opacity: 0.95,
      transform: "translateY(-1px)",
    },
  },
  brandName: {
    height: 40,
    width: "auto",
    display: "block",
    [theme.breakpoints.down("sm")]: {
      height: 34,
    },
  },
  brandText: {
    marginLeft: 8,
    color: "#2f6b4f",
    fontWeight: 700,
    letterSpacing: 0.2,
    fontSize: "1rem",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },

  /* Center navigation (desktop) */
  centerNav: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 28,
    alignItems: "center",
    pointerEvents: "auto",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  navLink: {
    textDecoration: "none",
    color: "#4b4b44",
    fontWeight: 600,
    padding: "8px 10px",
    borderRadius: 8,
    transition: "background 140ms ease, color 140ms ease",
    "&:hover": {
      backgroundColor: "rgba(47,107,79,0.06)",
      color: "#2f6b4f",
    },
  },

  /* Right-side actions */
  navSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    [theme.breakpoints.down("sm")]: {
      gap: 8,
    },
  },

  adminButton: {
    color: "#2f6b4f",
    fontWeight: 800,
    textTransform: "none",
    padding: "6px 12px",
    transition: "all 0.18s ease",
    "&:hover": {
      backgroundColor: "rgba(47,107,79,0.06)",
      transform: "translateY(-1px)",
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },

  recommendationButton: {
    borderColor: "#2f6b4f",
    color: "#2f6b4f",
    fontWeight: 700,
    textTransform: "none",
    padding: "6px 16px",
    borderRadius: 20,
    transition: "all 0.18s ease",
    "&:hover": {
      backgroundColor: "#eef7ef",
      color: "#1f4f3f",
      transform: "translateY(-1px)",
      boxShadow: "0 6px 16px rgba(47,107,79,0.08)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "4px 12px",
      fontSize: "0.875rem",
    },
  },

  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    [theme.breakpoints.down("sm")]: {
      gap: 8,
    },
  },

  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "#2f6b4f",
    color: "#fff",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "transform 180ms ease, box-shadow 180ms ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 6px 18px rgba(47,107,79,0.12)",
    },
    [theme.breakpoints.down("sm")]: {
      width: 32,
      height: 32,
      fontSize: "0.875rem",
    },
  },

  userName: {
    color: "#333333",
    fontWeight: 500,
    maxWidth: 120,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },

  logoutButton: {
    backgroundColor: "#ff6b3a",
    color: "#fff",
    fontWeight: 700,
    textTransform: "none",
    padding: "6px 16px",
    borderRadius: 20,
    transition: "all 0.18s ease",
    "&:hover": {
      backgroundColor: "#e65a2f",
      transform: "translateY(-1px)",
      boxShadow: "0 8px 20px rgba(230,90,47,0.12)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "4px 12px",
      fontSize: "0.875rem",
    },
  },

  signInButton: {
    background: "linear-gradient(180deg,#2f6b4f,#2b6f4f)",
    color: "#fff",
    fontWeight: 800,
    textTransform: "none",
    padding: "8px 18px",
    borderRadius: 999,
    transition: "all 0.18s ease",
    boxShadow: "0 8px 24px rgba(47,107,79,0.12)",
    "&:hover": {
      filter: "brightness(0.98)",
      transform: "translateY(-1px)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "6px 14px",
      fontSize: "0.9rem",
    },
  },

  loginLink: {
    color: "#4b4b44",
    textTransform: "none",
    fontWeight: 600,
    padding: "6px 8px",
    "&:hover": {
      color: "#2f6b4f",
      backgroundColor: "transparent",
    },
  },

  /* Mobile menu container (if you want to style it via classes) */
  mobileMenu: {
    position: "absolute",
    top: 64,
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
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },

  // Legacy / helper styles (kept for backward compatibility)
  heading: {
    color: "#2f6b4f",
    textDecoration: "none",
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  image: {
    marginLeft: 10,
    marginTop: 5,
  },
  profile: {
    display: "flex",
    justifyContent: "space-between",
    width: 400,
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      marginTop: 20,
      justifyContent: "center",
    },
  },
  logout: {
    marginLeft: 20,
  },
  purple: {
    color: "#fff",
    backgroundColor: "#6a5acd",
  },
}));
