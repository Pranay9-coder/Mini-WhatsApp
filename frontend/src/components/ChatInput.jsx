import { useEffect, useState } from "react";
import { useChat } from "../context/ChatContext.jsx";

const MAX = 50;

const ChatInput = ({ to }) => {
  const { sendMessage, startTyping, stopTyping } = useChat();
  const [msg, setMsg] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  const handleChange = (e) => {
    const value = e.target.value.slice(0, MAX);
    setMsg(value);
    startTyping(to);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => stopTyping(to), 1200);
    setTypingTimeout(timeout);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!msg.trim()) return;
    sendMessage({ to, msg: msg.trim() });
    setMsg("");
    stopTyping(to);
  };

  return (
    <div className="chat-input">
      <textarea
        placeholder="Type a message"
        value={msg}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={MAX}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="counter">{msg.length}/{MAX}</span>
        <button className="button" onClick={handleSend} disabled={!msg.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
