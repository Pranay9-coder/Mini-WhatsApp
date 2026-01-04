import { useState } from "react";
import { useChat } from "../context/ChatContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ChatBubble from "../components/ChatBubble.jsx";
import ChatInput from "../components/ChatInput.jsx";
import { searchUsers } from "../services/authService.js";

const ChatRoom = () => {
  const { messagesForSelected, selectedUserId, setSelectedUserId, typingFrom, onlineUsers } = useChat();
  const { user } = useAuth();
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchUsername.trim()) return;
    setSearching(true);
    try {
      const data = await searchUsers(searchUsername.trim());
      setSearchResults(data.users || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = (userId) => {
    setSelectedUserId(userId);
    setSearchResults([]);
    setSearchUsername("");
  };

  const isTyping = typingFrom && typingFrom === selectedUserId;
  const isOnline = selectedUserId && onlineUsers.includes(selectedUserId);

  return (
    <section className="content">
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1f2c33", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>
            {selectedUserId ? `Chat with ${selectedUserId}` : "Select or start a chat"}
            {isOnline && <span className="badge">Online</span>}
          </div>
          <div style={{ color: "#9db1bf", fontSize: 13 }}>You are {user?.username}</div>
        </div>
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          <input
            placeholder="Search username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #1f2c33", background: "#0f191f", color: "#e9f0f5", width: 220 }}
          />
          <button className="button secondary" onClick={handleSearch} disabled={searching}>
            {searching ? "..." : "Search"}
          </button>
          {searchResults.length > 0 && (
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#0f191f", border: "1px solid #1f2c33", borderRadius: 8, width: 220, maxHeight: 200, overflow: "auto", zIndex: 10 }}>
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleStartChat(u._id)}
                  style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #1f2c33" }}
                  onMouseEnter={(e) => e.target.style.background = "#1f2c33"}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                >
                  {u.username}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="chat-room">
        <div className="chat-messages">
          {messagesForSelected.map((chat) => (
            <ChatBubble key={chat._id} chat={chat} />
          ))}
          {!messagesForSelected.length && (
            <div style={{ color: "#9db1bf" }}>No messages yet. Start chatting!</div>
          )}
        </div>
        {isTyping && <div className="typing">Typing...</div>}
        {selectedUserId ? <ChatInput to={selectedUserId} /> : <div style={{ padding: 16 }}>Select a chat to begin</div>}
      </div>
    </section>
  );
};

export default ChatRoom;
