// ChatPopup.jsx
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import '../styles/ChatPopup.css';
import { BACKEND_URL } from '../api';

// we connect to the chat namespace
const SOCKET_URL = (process.env.BACKEND_URL || 'http://localhost:5002').replace(/\/$/, '') + '/chat';

export default function ChatPopup({ room }) {
  // room: optional (document id) — if not supplied uses 'global'
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const defaultName = storedUser?.displayName || storedUser?.email?.split('@')[0] || 'Guest';
  const defaultUserId = storedUser?.uid || null;

  const [socket, setSocket] = useState(null);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(defaultName);
  const [userId] = useState(defaultUserId);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState('');
  const messagesRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    // create socket connection to namespace /chat
    const s = io(SOCKET_URL, { transports: ['websocket'], upgrade: false });
    setSocket(s);

    s.on('connect', () => {
      // join room immediately
      s.emit('join', { room: room || 'global', userId, username });
    });

    s.on('chat-history', (history) => {
      // history = array of messages
      setMessages(history || []);
      // scroll
      setTimeout(() => scrollToBottom(), 100);
    });

    s.on('chat-message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => scrollToBottom(), 50);
    });

    s.on('online-users', (list) => {
      setOnlineUsers(list || []);
    });

    s.on('user-joined', (u) => {
      // optional small system message
      setMessages(prev => [...prev, { _id: 'sys-' + Date.now(), username: 'System', text: `${u.username} joined`, createdAt: new Date() }]);
    });
    s.on('user-left', (u) => {
      setMessages(prev => [...prev, { _id: 'sys-' + Date.now(), username: 'System', text: `${u.username} left`, createdAt: new Date() }]);
    });

    return () => {
      s.emit('leave');
      s.disconnect();
    };
    // eslint-disable-next-line
  }, []); // run once

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = () => {
    if (!text.trim() || !socket) return;
    const payload = {
      room: room || 'global',
      userId,
      username,
      text: text.trim()
    };
    socket.emit('chat-message', payload);
    setText('');
  };

  const scrollToBottom = () => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating button */}
      <button
        className="chat-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat"
      >
        💬
      </button>

      {/* Popup */}
      {open && (
        <div className="chat-popup" role="dialog" aria-modal="true">
          <div className="chat-header">
            <div className="chat-title">Realtime Chat</div>
            <div className="chat-online-count">{onlineUsers.length} online</div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-body" ref={messagesRef}>
            <div className="chat-users">
              {onlineUsers.map((u, i) => (
                <div key={i} className="chat-user-pill" title={u.username}>
                  <div className="avatar-pill">{(u.username || 'G').slice(0,2).toUpperCase()}</div>
                  <div className="pill-name">{u.username}</div>
                </div>
              ))}
            </div>

            <div className="chat-messages">
              {messages.map((m) => (
                <div key={m._id || Math.random()} className={`chat-message ${m.username === username ? 'me' : ''}`}>
                  <div className="msg-meta">
                    <span className="msg-user">{m.username}</span>
                    <span className="msg-time">{formatTime(m.createdAt)}</span>
                  </div>
                  <div className="msg-text">{m.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            />
            <button className="chat-send" onClick={send}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
