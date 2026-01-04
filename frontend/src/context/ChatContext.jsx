import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { fetchChats, updateMessage, deleteMessage } from "../services/chatService.js";
import { useSocket } from "../hooks/useSocket.js";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socket = useSocket(token);
  const [chats, setChats] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [typingFrom, setTypingFrom] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setChats([]);
      setSelectedUserId("");
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchChats();
        setChats(data.chats || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load chats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (chat) => {
      setChats((prev) => [...prev, chat]);
    };
    const onMessageEdited = (chat) => {
      setChats((prev) =>
        prev.map((c) => (c._id === chat._id ? chat : c))
      );
    };
    const onMessageDeleted = ({ id }) => {
      setChats((prev) => prev.filter((c) => c._id !== id));
    };
    const onTyping = ({ from }) => setTypingFrom(from);
    const onStopTyping = () => setTypingFrom(null);
    const onOnlineUsers = (users) => setOnlineUsers(users);

    socket.on("newMessage", onNewMessage);
    socket.on("messageEdited", onMessageEdited);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);
    socket.on("onlineUsers", onOnlineUsers);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageEdited", onMessageEdited);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
      socket.off("onlineUsers", onOnlineUsers);
    };
  }, [socket]);

  const sendMessage = ({ to, msg }) => {
    if (!socket) return;
    socket.emit("sendMessage", { to, msg });
  };

  const editMessageInChat = async (id, newMsg) => {
    try {
      const result = await updateMessage(id, newMsg);
      setChats((prev) =>
        prev.map((c) => (c._id === id ? result.chat : c))
      );
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  };

  const deleteMessageFromChat = async (id) => {
    try {
      await deleteMessage(id);
      setChats((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const startTyping = (to) => socket?.emit("typing", { to });
  const stopTyping = (to) => socket?.emit("stopTyping", { to });

  const conversations = useMemo(() => {
    if (!user) return [];
    const map = new Map();
    chats.forEach((c) => {
      const otherId = c.from._id === user.id ? c.to._id : c.from._id;
      const otherName = c.from._id === user.id ? c.to.username : c.from.username;
      if (!map.has(otherId)) map.set(otherId, { userId: otherId, username: otherName, last: c });
      else map.set(otherId, { ...map.get(otherId), last: c });
    });
    return Array.from(map.values());
  }, [chats, user]);

  const messagesForSelected = useMemo(() => {
    if (!selectedUserId || !user) return [];
    return chats.filter(
      (c) =>
        (c.from._id === user.id && c.to._id === selectedUserId) ||
        (c.to._id === user.id && c.from._id === selectedUserId)
    );
  }, [chats, selectedUserId, user]);

  const value = {
    chats,
    setChats,
    conversations,
    selectedUserId,
    setSelectedUserId,
    messagesForSelected,
    typingFrom,
    onlineUsers,
    sendMessage,
    editMessageInChat,
    deleteMessageFromChat,
    startTyping,
    stopTyping,
    loading,
    error,
    setError
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
