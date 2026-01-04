import { useState } from "react";
import { useChat } from "../context/ChatContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ChatList = () => {
  const { conversations, setSelectedUserId, selectedUserId, loading, error } = useChat();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #1f2c33" }}>
        <div style={{ color: "#9db1bf", fontSize: 13 }}>Signed in as</div>
        <div style={{ fontWeight: 700 }}>{user?.username}</div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <input
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #1f2c33", background: "#0f191f", color: "#e9f0f5" }}
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading && <div style={{ padding: 12 }}>Loading chats...</div>}
      {error && <div style={{ padding: 12, color: "#ff6b6b" }}>{error}</div>}
      <ul className="chat-list">
        {filtered.map((c) => (
          <li
            key={c.userId}
            className="chat-item"
            onClick={() => setSelectedUserId(c.userId)}
            style={{ background: selectedUserId === c.userId ? "#0f191f" : "" }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{c.username}</div>
              <div style={{ color: "#9db1bf", fontSize: 13 }}>{c.last.msg}</div>
            </div>
            <div style={{ fontSize: 11, color: "#9db1bf" }}>{new Date(c.last.createdAt).toLocaleTimeString()}</div>
          </li>
        ))}
        {!filtered.length && <li className="chat-item">No chats yet</li>}
      </ul>
    </aside>
  );
};

export default ChatList;
