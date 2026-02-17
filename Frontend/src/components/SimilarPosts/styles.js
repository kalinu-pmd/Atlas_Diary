import { makeStyles } from "@material-ui/core/styles";

export default makeStyles(() => ({
  paper: {
    padding: "20px",
    marginTop: "20px",
    backgroundColor: "#fef9f5", // Off white
    borderRadius: "15px",
    border: "1px solid #0c342c", // Dark green border
    boxShadow: "0 4px 12px rgba(12, 52, 44, 0.15)",
  },
  title: {
    color: "#0c342c", // Dark green
    fontWeight: "bold",
    marginBottom: "16px",
  },
  list: {
    "& .MuiListItem-root": {
      backgroundColor: "rgba(175, 250, 1, 0.05)", // Light green tint
      marginBottom: "8px",
      borderRadius: "8px",
      border: "1px solid rgba(175, 250, 1, 0.3)",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "rgba(175, 250, 1, 0.1)",
        transform: "translateX(4px)",
      },
    },
  },
  listItemText: {
    "& .MuiListItemText-primary": {
      color: "#333333", // Black
      fontWeight: "500",
    },
    "& .MuiListItemText-secondary": {
      color: "#666666",
    },
  },
  avatar: {
    backgroundColor: "#0c342c", // Dark green
    color: "#fef9f5", // Off white
    fontWeight: "bold",
  },
  chip: {
    backgroundColor: "#affa01", // Light green
    color: "#333333", // Black
    fontSize: "0.75rem",
    fontWeight: "500",
    margin: "2px",
  },
  viewButton: {
    backgroundColor: "#affa01", // Light green
    color: "#333333", // Black
    fontWeight: "bold",
    textTransform: "none",
    borderRadius: "20px",
    padding: "6px 16px",
    "&:hover": {
      backgroundColor: "#9ee100", // Darker light green
    },
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginTop: "8px",
  },
  dateText: {
    color: "#666666",
    fontSize: "0.75rem",
    fontStyle: "italic",
  },
}));
