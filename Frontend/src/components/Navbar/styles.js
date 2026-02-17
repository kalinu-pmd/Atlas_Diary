import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  appBar: {
    backgroundColor: "#0c342c", // Dark green
    boxShadow: "0 2px 8px rgba(12, 52, 44, 0.3)",
    borderBottom: "1px solid #affa01",
    position: "absolute",
    top: 0,
    zIndex: 1100,
    minHeight: "64px",
    marginBottom: "24px",
    "&.MuiAppBar-root": {
      color: "#fef9f5", // Off white
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: "16px",
    },
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    minHeight: "64px",
    maxWidth: "1800px",
    width: "100%",
    margin: "0 auto",
    [theme.breakpoints.down("sm")]: {
      padding: "0 16px",
      minHeight: "56px",
    },
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    transition: "all 0.3s ease",
    "&:hover": {
      opacity: 0.8,
      transform: "scale(1.02)",
    },
  },
  brandName: {
    height: "40px",
    width: "auto",
    [theme.breakpoints.down("sm")]: {
      height: "32px",
    },
  },
  brandIcon: {
    height: "36px",
    width: "auto",
    marginLeft: "8px",
    borderRadius: "50%",
    [theme.breakpoints.down("sm")]: {
      height: "28px",
    },
  },
  navSection: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    [theme.breakpoints.down("sm")]: {
      gap: "8px",
    },
  },
  adminButton: {
    color: "#affa01", // Light green
    fontWeight: 900,
    textTransform: "none",
    padding: "6px 12px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#affa01",
      color: "#333333", // Black text
      transform: "translateY(-1px)",
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  recommendationButton: {
    borderColor: "#affa01", // Light green
    color: "#affa01", // Light green
    fontWeight: 700,
    textTransform: "none",
    padding: "6px 16px",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#affa01",
      borderColor: "#affa01",
      color: "#333333", // Black text
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(175, 250, 1, 0.2)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "4px 12px",
      fontSize: "0.875rem",
    },
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    [theme.breakpoints.down("sm")]: {
      gap: "8px",
    },
  },
  avatar: {
    width: "36px",
    height: "36px",
    backgroundColor: "#affa01", // Light green
    color: "#333333", // Black text
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#9ee100",
      transform: "scale(1.05)",
      boxShadow: "0 4px 12px rgba(175, 250, 1, 0.3)",
    },
    [theme.breakpoints.down("sm")]: {
      width: "32px",
      height: "32px",
      fontSize: "0.875rem",
    },
  },
  userName: {
    color: "#333333", // Black text
    fontWeight: 400,
    maxWidth: "100px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  logoutButton: {
    backgroundColor: "#ff3d11", // Orange
    color: "#fef9f5", // Off white
    fontWeight: 700,
    textTransform: "none",
    padding: "6px 16px",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#affa01", // Light green
      color: "#333333", // Black text
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(175, 250, 1, 0.3)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "4px 12px",
      fontSize: "0.875rem",
    },
  },
  signInButton: {
    backgroundColor: "#affa01", // Light green
    color: "#333333", // Black text
    fontWeight: 800,
    textTransform: "none",
    padding: "8px 24px",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#9ee100", // Darker light green
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(175, 250, 1, 0.4)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "6px 16px",
      fontSize: "0.875rem",
    },
  },

  // Legacy styles for backward compatibility (can be removed later)
  heading: {
    color: "#affa01", // Light green
    textDecoration: "none",
    fontSize: "2em",
    fontWeight: 500,
  },
  image: {
    marginLeft: "10px",
    marginTop: "5px",
  },
  profile: {
    display: "flex",
    justifyContent: "space-between",
    width: "400px",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      marginTop: 20,
      justifyContent: "center",
    },
  },
  logout: {
    marginLeft: "20px",
  },
  purple: {
    color: "#333333", // Black text
    backgroundColor: "#affa01", // Light green
  },
}));
