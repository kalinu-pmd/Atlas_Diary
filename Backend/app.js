import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello to Atlas Diary App");
});

const PORT = process.env.PORT || 5000;

// Add mongoose connection logging for better debugging
const connectUri = process.env.CONNECTION_URL;
if (!connectUri) {
  console.error("No CONNECTION_URL provided in environment (.env). Server will not start.");
  process.exit(1);
}

// Mask password for logging
const maskedLogUri = connectUri.replace(/:(.*)@/, ":****@");
console.log("Attempting to connect to MongoDB:", maskedLogUri.startsWith('mongodb+srv://') ? 'Atlas cluster' : maskedLogUri);

mongoose.connection.on("connected", () => console.log("MongoDB connected"));
mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err && err.message ? err.message : err));
mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));

mongoose
  .connect(connectUri)
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`App listening on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Initial mongoose.connect error:", err && err.message ? err.message : err);
  });
