import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  media: {
    borderRadius: "15px",
    objectFit: "cover",
    width: "100%",
    maxHeight: "500px",
    minHeight: "300px",
    border: "2px solid #0c342c", // Dark green border
    marginBottom: "10px",
    boxShadow: "0 4px 12px rgba(12, 52, 44, 0.15)",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  card: {
    display: "flex",
    width: "100%",
    backgroundColor: "#fef9f5", // Off white
    borderRadius: "20px",
    border: "1px solid #affa01", // Light green border
    boxShadow: "0 8px 25px rgba(12, 52, 44, 0.15)",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
      flexDirection: "column",
    },
  },
  section: {
    borderRadius: "20px",
    margin: "10px",
    flex: 1,
    backgroundColor: "#fef9f5", // Off white
    color: "#333333", // Black text
  },
  imageSection: {
    marginLeft: "30px",
    flex: 1,
    maxWidth: "45%",
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      maxWidth: "100%",
    },
  },
  recommendedPosts: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    maxWidth: "100%",
    justifyContent: "start",
    backgroundColor: "rgba(175, 250, 1, 0.05)", // Light green tint
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #affa01", // Light green border

    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },

  postWrap: {
    maxWidth: "20%",
    [theme.breakpoints.down("xl")]: {
      maxWidth: "15%",
    },
    [theme.breakpoints.down("lg")]: {
      maxWidth: "25%",
    },
    [theme.breakpoints.down("md")]: {
      maxWidth: "40%",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
  },

  postContent: {
    padding: "10px 0 0 0",
    fontSize: "0.875rem",
    letterSpacing: "0.00714em",
    color: "#333333", // Black text
  },
  loadingPaper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    borderRadius: "15px",
    height: "77vh",
    backgroundColor: "#fef9f5", // Off white
    border: "2px solid #0c342c", // Dark green border
  },
  commentsOuterContainer: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "rgba(175, 250, 1, 0.05)", // Light green tint
    padding: "20px",
    borderRadius: "15px",
    border: "1px solid #affa01", // Light green border
    boxShadow: "0 2px 8px rgba(12, 52, 44, 0.1)",
    gap: "20px",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      gap: "15px",
    },
  },
  commentsInnerContainer: {
    height: "300px",
    overflowY: "auto",
    flex: 1,
    backgroundColor: "#fef9f5", // Off white
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #0c342c", // Dark green border
    boxShadow: "inset 0 2px 4px rgba(12, 52, 44, 0.1)",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#affa01",
      borderRadius: "4px",
      "&:hover": {
        background: "#9ee100",
      },
    },
  },
  commentItem: {
    backgroundColor: "rgba(175, 250, 1, 0.1)",
    padding: "12px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "1px solid rgba(12, 52, 44, 0.1)",
    "& strong": {
      color: "#0c342c",
      fontWeight: "600",
    },
  },
  commentForm: {
    flex: 1,
    maxWidth: "400px",
    backgroundColor: "#fef9f5",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #0c342c",
    boxShadow: "0 2px 8px rgba(12, 52, 44, 0.1)",
    [theme.breakpoints.down("md")]: {
      maxWidth: "100%",
    },
  },
  commentTextField: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fef9f5",
      "& fieldset": {
        borderColor: "#0c342c",
      },
      "&:hover fieldset": {
        borderColor: "#affa01",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#affa01",
      },
    },
  },
  commentButton: {
    backgroundColor: "#affa01",
    color: "#333333",
    fontWeight: "bold",
    padding: "12px 24px",
    borderRadius: "8px",
    marginTop: "15px",
    "&:hover": {
      backgroundColor: "#9ee100",
    },
    "&:disabled": {
      backgroundColor: "#e0e0e0",
      color: "#666666",
    },
  },
}));
