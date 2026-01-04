import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Chat } from "../models/Chat.js";

const onlineUsers = new Map(); // userId -> Set of socketIds
let io; // Global io instance

const addUserSocket = (userId, socketId) => {
  const existing = onlineUsers.get(userId) || new Set();
  existing.add(socketId);
  onlineUsers.set(userId, existing);
};

const removeUserSocket = (userId, socketId) => {
  const existing = onlineUsers.get(userId);
  if (!existing) return;
  existing.delete(socketId);
  if (existing.size === 0) {
    onlineUsers.delete(userId);
  }
};

export const getIO = () => io;

export const initChatSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id };
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(userId);
    addUserSocket(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    socket.on("typing", ({ to }) => {
      if (to) io.to(to).emit("typing", { from: userId });
    });

    socket.on("stopTyping", ({ to }) => {
      if (to) io.to(to).emit("stopTyping", { from: userId });
    });

    socket.on("sendMessage", async ({ to, msg }) => {
      try {
        if (!to || !msg || msg.length === 0 || msg.length > 50) {
          return socket.emit("error", { message: "Message must be 1-50 characters" });
        }
        const chat = await Chat.create({ from: userId, to, msg: msg.trim() });
        const populated = await chat.populate("from", "username").populate("to", "username");
        io.to(userId).emit("newMessage", populated);
        io.to(to).emit("newMessage", populated);
      } catch (err) {
        console.error("Socket sendMessage error", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("editMessage", async ({ id, msg, to }) => {
      try {
        if (!msg || msg.length === 0 || msg.length > 50) {
          return socket.emit("error", { message: "Message must be 1-50 characters" });
        }
        const chat = await Chat.findById(id);
        if (!chat) return socket.emit("error", { message: "Message not found" });
        if (chat.from.toString() !== userId) {
          return socket.emit("error", { message: "You can only edit your own messages" });
        }
        chat.msg = msg.trim();
        await chat.save();
        const populated = await chat.populate("from", "username").populate("to", "username");
        io.to(userId).emit("messageEdited", populated);
        io.to(to).emit("messageEdited", populated);
      } catch (err) {
        console.error("Socket editMessage error", err);
        socket.emit("error", { message: "Failed to edit message" });
      }
    });

    socket.on("deleteMessage", async ({ id, to }) => {
      try {
        const chat = await Chat.findById(id);
        if (!chat) return socket.emit("error", { message: "Message not found" });
        if (chat.from.toString() !== userId) {
          return socket.emit("error", { message: "You can only delete your own messages" });
        }
        await chat.deleteOne();
        io.to(userId).emit("messageDeleted", { id });
        io.to(to).emit("messageDeleted", { id });
      } catch (err) {
        console.error("Socket deleteMessage error", err);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    socket.on("disconnect", () => {
      removeUserSocket(userId, socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};
