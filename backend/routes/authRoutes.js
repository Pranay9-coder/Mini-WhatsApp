import { Router } from "express";
import { login, register, searchUsers } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", authMiddleware, searchUsers);

export default router;
