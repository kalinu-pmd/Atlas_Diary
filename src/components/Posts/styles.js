import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  mainContainer: {
    borderRadius: 15,
    margin: "30px 0",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 50px",
    backgroundColor: "#fef9f5", // Off white
  //   border: "1px solid #affa01", // Light green border
  },
  heading: {
    color: "#0c342c", // Dark green
    textDecoration: "none",
    fontWeight: 600,
  },
  image: {
    marginLeft: "15px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    width: "400px",
  },
  profile: {
    display: "flex",
    justifyContent: "space-between",
    width: "400px",
  },
  userName: {
    display: "flex",
    alignItems: "center",
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
  },
  smMargin: {
    margin: theme.spacing(1),
  },
  purple: {
    color: "#333333", // Black text
    backgroundColor: "#affa01", // Light green
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
  [theme.breakpoints.down("sm")]: {
    appBar: {
      padding: "10px 20px",
    },
    heading: {
      display: "none",
    },
    userName: {
      display: "none",
    },
    image: {
      marginLeft: "5px",
    },
    toolbar: {
      display: "flex",
      justifyContent: "flex-end",
      width: "160px",
    },
  },
  actionDiv: {
    textAlign: "center",
  },
}));
