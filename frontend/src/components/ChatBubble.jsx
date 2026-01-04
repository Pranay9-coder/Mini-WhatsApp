import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";
import { updateMessage, deleteMessage } from "../services/chatService.js";
import { useSocket } from "../hooks/useSocket.js";
import { formatTimestamp } from "../utils/time.js";

const ChatBubble = ({ chat }) => {
  const { user } = useAuth();
  const { token } = useAuth();
  const socket = useSocket(token);
  const { setChats } = useChat();
  const isSelf = chat.from._id === user?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(chat.msg);

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      const result = await updateMessage(chat._id, editText.trim());
      // Update local state immediately
      setChats((prev) =>
        prev.map((c) => (c._id === chat._id ? result.chat : c))
      );
      // Emit to other users
      socket?.emit("editMessage", {
        id: chat._id,
        msg: editText.trim(),
        to: chat.to._id
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this message?")) {
      try {
        await deleteMessage(chat._id);
        // Update local state immediately
        setChats((prev) => prev.filter((c) => c._id !== chat._id));
        // Emit to other users
        socket?.emit("deleteMessage", {
          id: chat._id,
          to: chat.to._id
        });
      } catch (err) {
        console.error("Failed to delete message:", err);
      }
    }
  };

  return (
    <div className={`chat-bubble ${isSelf ? "self" : "other"}`}>
      <div style={{ fontWeight: 600 }}>{isSelf ? "You" : chat.from.username}</div>
      {isEditing ? (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value.slice(0, 50))}
            style={{
              flex: 1,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #1f2c33",
              background: "#0f191f",
              color: "#e9f0f5",
              minHeight: 40,
              resize: "none"
            }}
            maxLength={50}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button
              style={{
                padding: "4px 8px",
                fontSize: 12,
                background: "#00a884",
                border: "none",
                color: "#0a1014",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={handleEdit}
            >
              Save
            </button>
            <button
              style={{
                padding: "4px 8px",
                fontSize: 12,
                background: "#1f2c33",
                border: "none",
                color: "#e9f0f5",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>{chat.msg}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div className="timestamp">{formatTimestamp(chat.createdAt)}</div>
            {isSelf && (
              <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                <button
                  style={{
                    padding: "2px 6px",
                    fontSize: 11,
                    background: "transparent",
                    border: "1px solid #00a884",
                    color: "#00a884",
                    borderRadius: 3,
                    cursor: "pointer"
                  }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button
                  style={{
                    padding: "2px 6px",
                    fontSize: 11,
                    background: "transparent",
                    border: "1px solid #ff6b6b",
                    color: "#ff6b6b",
                    borderRadius: 3,
                    cursor: "pointer"
                  }}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBubble;
