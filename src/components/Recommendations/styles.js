import { makeStyles } from "@material-ui/core/styles";

export default makeStyles(() => ({
  container: {
    padding: "20px",
    backgroundColor: "#fef9f5", // Off white
    minHeight: "100vh",
  },
  header: {
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    color: "#0c342c", // Dark green
    fontWeight: "bold",
    marginBottom: "16px",
  },
  subtitle: {
    color: "#333333", // Black
    fontSize: "1.1rem",
  },
  cardGrid: {
    marginTop: "20px",
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fef9f5", // Off white
    border: "1px solid #0c342c", // Dark green border
    borderRadius: "15px",
    boxShadow: "0 4px 12px rgba(12, 52, 44, 0.15)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 25px rgba(12, 52, 44, 0.25)",
    },
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
    padding: "16px",
  },
  cardTitle: {
    color: "#0c342c", // Dark green
    fontWeight: "bold",
    marginBottom: "8px",
  },
  cardDescription: {
    color: "#333333", // Black
    marginBottom: "12px",
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "12px",
  },
  tag: {
    backgroundColor: "#affa01", // Light green
    color: "#333333", // Black
    fontWeight: "500",
    fontSize: "0.75rem",
  },
  cardActions: {
    padding: "8px 16px 16px",
    backgroundColor: "rgba(175, 250, 1, 0.1)", // Light green tint
  },
  actionButton: {
    color: "#0c342c", // Dark green
    "&:hover": {
      backgroundColor: "rgba(175, 250, 1, 0.2)",
    },
  },
  iconButton: {
    color: "#0c342c", // Dark green
  },
  likedIcon: {
    color: "#ff3d11", // Orange for liked state
  },
  viewButton: {
    backgroundColor: "#affa01", // Light green
    color: "#333333", // Black
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#9ee100", // Darker light green
    },
  },
  dateText: {
    color: "#666666",
    fontSize: "0.875rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#fef9f5", // Off white
    borderRadius: "15px",
    border: "2px dashed #affa01", // Light green dashed border
  },
  emptyTitle: {
    color: "#0c342c", // Dark green
    marginBottom: "12px",
  },
  emptyDescription: {
    color: "#333333", // Black
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    backgroundColor: "#fef9f5", // Off white
  },
  loadingSpinner: {
    color: "#0c342c", // Dark green
  },
  imageContainer: {
    position: "relative",
    cursor: "pointer",
    "&:hover $zoomOverlay": {
      opacity: 1,
    },
  },
  zoomOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  zoomIcon: {
    color: "white",
    fontSize: "3rem",
  },
  fullScreenDialog: {
    "& .MuiDialog-paper": {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      boxShadow: "none",
      margin: 0,
      maxHeight: "100vh",
      maxWidth: "100vw",
    },
  },
  dialogContent: {
    padding: 0,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 1000,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
  },
  fullScreenImageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  fullScreenImage: {
    maxWidth: "100%",
    maxHeight: "80vh",
    objectFit: "contain",
    borderRadius: "8px",
  },
  imageTitle: {
    color: "white",
    marginTop: "16px",
    textAlign: "center",
    padding: "0 16px",
  },
  imageCounter: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "6px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 1,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(4px)",
  },
}));
