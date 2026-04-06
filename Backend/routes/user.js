import express from "express";
import {
	signIn,
	signUp,
	getAllUsers,
	editUser,
	deleteUser,
	verifyEmailOtp,
	resendOtp,
	requestDeleteAccountOtp,
	deleteAccountWithOtp,
} from "../controllers/user.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.post("/verify-otp", verifyEmailOtp);
router.post("/resend-otp", resendOtp);
router.post("/request-delete-account-otp", auth, requestDeleteAccountOtp);
router.post("/delete-account", auth, deleteAccountWithOtp);
router.get("/users", auth, getAllUsers);

router.delete("/users/:id", auth, deleteUser);
router.patch("/users/:id", auth, editUser);

export default router;
