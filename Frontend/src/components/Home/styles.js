import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  appBarSearch: {
    borderRadius: 12,
    marginBottom: "1rem",
    display: "flex",
    padding: "16px",
    backgroundColor: "#fef9f5", // Off white
    border: "2px solid #0c342c", // Dark green border
    boxShadow: "0 4px 12px rgba(12, 52, 44, 0.15)",
  },
  pagination: {
    borderRadius: 12,
    marginTop: "1rem",
    padding: "16px",
    backgroundColor: "#fef9f5", // Off white
    border: "1px solid #affa01", // Light green border
  },
  gridContainer: {
    backgroundColor: "#fef9f5", // Off white
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column-reverse",
    },
  },
}));
