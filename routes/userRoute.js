import express from "express";
import { register, login, checkAuth, logout } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Private route
router.use(protect);
router.get("/check-auth", checkAuth);

export default router;
