import { makeStyles } from "@material-ui/core/styles";

export default makeStyles({
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9 aspect ratio
    backgroundColor: "rgba(12, 52, 44, 0.7)", // Dark green overlay
    backgroundBlendMode: "darken",
    borderTopLeftRadius: "15px",
    borderTopRightRadius: "15px",
    position: "relative",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  border: {
    border: "2px solid #affa01", // Light green border
  },
  fullHeightCard: {
    height: "100%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: "15px",
    height: "100%",
    position: "relative",
    backgroundColor: "#fef9f5", // Off white
    border: "1px solid #0c342c", // Dark green border
    boxShadow: "0 4px 12px rgba(12, 52, 44, 0.15)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 25px rgba(12, 52, 44, 0.25)",
    },
  },
  overlay: {
    position: "absolute",
    top: "20px",
    left: "20px",
    color: "#fef9f5", // Off white
    backgroundColor: "rgba(12, 52, 44, 0.8)", // Dark green background
    padding: "8px 12px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  overlay2: {
    position: "absolute",
    top: "20px",
    right: "20px",
    color: "#fef9f5", // Off white
    backgroundColor: "rgba(175, 250, 1, 0.9)", // Light green background
    padding: "4px 8px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  grid: {
    display: "flex",
  },
  details: {
    display: "flex",
    justifyContent: "space-between",
    margin: "20px",
  },
  title: {
    padding: "0 16px",
    color: "#333333", // Black
    fontWeight: "bold",
  },
  cardActions: {
    padding: "0 16px 8px 16px",
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "rgba(175, 250, 1, 0.1)", // Light green tint
  },
  cardAction: {
    display: "block",
    textAlign: "initial",
    color: "#0c342c", // Dark green
    "&:hover": {
      backgroundColor: "rgba(175, 250, 1, 0.2)",
    },
  },
  imageCounter: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 1,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
});
