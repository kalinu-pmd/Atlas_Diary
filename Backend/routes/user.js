import express from "express";
import {
	signIn,
	signUp,
	getAllUsers,
	editUser,
	deleteUser,
} from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.get("/users", auth, getAllUsers);
router.delete("/users/:id", auth, deleteUser);
router.patch("/users/:id", auth, editUser);

export default router;
