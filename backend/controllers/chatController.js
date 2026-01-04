import { Chat } from "../models/Chat.js";
import { getIO } from "../sockets/chatSocket.js";

export const getChats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({
      $or: [{ from: userId }, { to: userId }]
    })
      .sort({ createdAt: 1 })
      .populate("from", "username")
      .populate("to", "username");
    res.json({ chats });
  } catch (err) {
    next(err);
  }
};

export const createChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { to, msg } = req.body;
    if (!to || !msg) {
      return res.status(400).json({ message: "Recipient and message are required" });
    }
    if (msg.length === 0 || msg.length > 50) {
      return res.status(400).json({ message: "Message must be between 1 and 50 characters" });
    }
    const chat = await Chat.create({ from: userId, to, msg: msg.trim() });
    const populated = await chat.populate("from", "username").populate("to", "username");
    res.status(201).json({ chat: populated });
  } catch (err) {
    next(err);
  }
};

export const updateChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { msg } = req.body;
    if (!msg || msg.length === 0 || msg.length > 50) {
      return res.status(400).json({ message: "Message must be between 1 and 50 characters" });
    }
    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.from.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }
    chat.msg = msg.trim();
    await chat.save();
    const populated = await chat.populate("from", "username").populate("to", "username");
    
    // Emit via socket to both users
    const io = getIO();
    if (io) {
      io.to(userId).emit("messageEdited", populated);
      io.to(chat.to.toString()).emit("messageEdited", populated);
    }
    
    res.json({ chat: populated });
  } catch (err) {
    next(err);
  }
};

export const deleteChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.from.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }
    const toUserId = chat.to.toString();
    await chat.deleteOne();
    
    // Emit via socket to both users
    const io = getIO();
    if (io) {
      io.to(userId).emit("messageDeleted", { id });
      io.to(toUserId).emit("messageDeleted", { id });
    }
    
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
