import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      "& .MuiOutlinedInput-root": {
        backgroundColor: "#fef9f5", // Off white
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
  paper: {
    padding: theme.spacing(2),
    backgroundColor: "#fef9f5", // Off white
    borderRadius: "15px",
    border: "1px solid #0c342c", // Dark green border
    boxShadow: "0 8px 25px rgba(12, 52, 44, 0.15)",
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  fileInput: {
    width: "97%",
    margin: "10px 0",
    padding: "16px",
    backgroundColor: "rgba(175, 250, 1, 0.05)",
    border: "1px solid #0c342c",
    borderRadius: "12px",
    "& .MuiOutlinedInput-root": {
      borderColor: "#0c342c", // Dark green
    },
    "& input[type='file']": {
      padding: "8px",
      fontSize: "14px",
    },
  },
  fileInputLabel: {
    color: "#0c342c",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  },
  fileInputHelp: {
    color: "#666666",
    fontSize: "12px",
    marginTop: "8px",
    fontStyle: "italic",
  },
  buttonSubmit: {
    marginBottom: 10,
    backgroundColor: "#affa01", // Light green
    color: "#333333", // Black text
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#9ee100", // Darker light green
    },
  },
}));
