import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatModal = ({ isOpen, onClose, user, recipientName, socket, roomName }) => {
  const [messages, setMessages] = useState([
    { sender: 'System', text: '🔐 Secure Protocol Room Established. End-to-End Escrow Protection Active.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!socket || !isOpen) return;

    socket.emit('join_room', roomName);

    const handleReceiveMsg = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('receive_message', handleReceiveMsg);

    return () => {
      socket.off('receive_message', handleReceiveMsg);
    };
  }, [socket, isOpen, roomName]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msgData = {
      room: roomName,
      sender: user?.profile?.fullName || user?.profile?.companyName || user?.email || 'User',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (socket) {
      socket.emit('send_message', msgData);
    }
    setMessages((prev) => [...prev, msgData]);
    setInputText('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '600px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(30, 41, 59, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '14px', color: '#818cf8' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontFamily: 'Outfit', fontSize: '1.1rem' }}>{recipientName}</h4>
              <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> Active Protocol Session
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Messages Body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((m, idx) => {
            const isMe = m.sender === (user?.profile?.fullName || user?.profile?.companyName || user?.email);
            const isSystem = m.sender === 'System';

            if (isSystem) {
              return (
                <div key={idx} style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '8px 14px', borderRadius: '12px' }}>
                  {m.text}
                </div>
              );
            }

            return (
              <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  background: isMe ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
                  border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: '4px', fontWeight: '700' }}>{m.sender}</div>
                  <div>{m.text}</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.5, textAlign: 'right', marginTop: '4px' }}>{m.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-input-premium"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ borderRadius: '14px' }}
          />
          <button type="submit" className="btn-premium-primary" style={{ padding: '14px 20px', borderRadius: '14px' }}>
            <Send size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChatModal;
