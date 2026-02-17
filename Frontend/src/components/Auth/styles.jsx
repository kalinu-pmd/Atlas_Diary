import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: "#fef9f5", // Off white
    borderRadius: "15px",
    border: "1px solid #0c342c", // Dark green border
    boxShadow: "0 8px 25px rgba(12, 52, 44, 0.15)",
  },
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#0c342c", // Dark green
        },
        "&:hover fieldset": {
          borderColor: "#affa01", // Light green on hover
        },
        "&.Mui-focused fieldset": {
          borderColor: "#0c342c", // Dark green when focused
        },
      },
      "& .MuiInputLabel-root": {
        color: "#333333", // Black
        "&.Mui-focused": {
          color: "#0c342c", // Dark green when focused
        },
      },
    },
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "#0c342c", // Dark green
    color: "#fef9f5", // Off white
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    backgroundColor: "#affa01", // Light green
    color: "#333333", // Black text
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#9ee100", // Darker light green
    },
  },
  googleButton: {
    marginBottom: theme.spacing(2),
    backgroundColor: "#ff3d11", // Orange
    color: "#fef9f5", // Off white
    "&:hover": {
      backgroundColor: "#e6350e", // Darker orange
    },
  },
}));
