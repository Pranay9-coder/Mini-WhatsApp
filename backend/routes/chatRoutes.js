import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createChat, deleteChat, getChats, updateChat } from "../controllers/chatController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getChats);
router.post("/", createChat);
router.put("/:id", updateChat);
router.delete("/:id", deleteChat);

export default router;
