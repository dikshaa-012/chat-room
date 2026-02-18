
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io(import.meta.env.VITE_API_URL);

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && username) {
      socket.emit("send_message", { text: message, user: username });
      setMessage("");
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setShowNamePrompt(false);
    }
  };

  if (showNamePrompt) {
    return (
      <div className="chat-overlay premium-bg">
        <form className="chat-name-form glassmorph" onSubmit={handleNameSubmit}>
          <h2 className="premium-title">Welcome to Chat Room</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-container premium-bg glassmorph">
      <header className="chat-header premium-header">
        <span className="premium-logo">💬</span> Chat Room
      </header>
      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isOwn = msg.user === username;
          return (
            <div
              key={index}
              className={`chat-bubble${isOwn ? " own" : ""}`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="chat-avatar">{getInitials(msg.user)}</div>
              <div className="chat-content">
                <span className="chat-user">{msg.user || "User"}</span>
                <span className="chat-text">{msg.text || msg}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          value={message}
          placeholder="Type your message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
        <button className="chat-send-btn" onClick={sendMessage} disabled={!message.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
