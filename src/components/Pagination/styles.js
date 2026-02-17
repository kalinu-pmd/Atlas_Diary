import { makeStyles } from "@material-ui/core/styles";

export default makeStyles(() => ({
  ul: {
    justifyContent: "space-around",
    "& .MuiPaginationItem-root": {
      color: "#0c342c", // Dark green
      border: "1px solid #affa01", // Light green border
      backgroundColor: "#fef9f5", // Off white
      "&:hover": {
        backgroundColor: "#affa01", // Light green on hover
        color: "#333333", // Black text on hover
      },
      "&.Mui-selected": {
        backgroundColor: "#0c342c", // Dark green for selected
        color: "#fef9f5", // Off white text for selected
        "&:hover": {
          backgroundColor: "#0a2d26", // Darker green on hover
        },
      },
    },
  },
}));
