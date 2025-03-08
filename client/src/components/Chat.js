// src/components/Chat.js
import React, { useState, useEffect } from 'react';
import socket from '../services/socket';
import 'bootstrap/dist/css/bootstrap.min.css';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    // Set up event listeners
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    
    // Listen for incoming messages
    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    
    // Listen for existing messages when connecting
    socket.on('load_messages', (existingMessages) => {
      setMessages(existingMessages);
    });

    // Cleanup function
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message');
      socket.off('load_messages');
    };
  }, []);

  // Function to send a message
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && connected) {
      const newMessage = {
        id: Date.now(),
        text: message,
        userId: socket.id,
        timestamp: new Date().toISOString()
      };
      
      // Send to server
      socket.emit('message', newMessage);
      
      // Clear input field
      setMessage('');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Real-time Chat</h3>
              <span className={`badge ${connected ? 'bg-success' : 'bg-danger'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="card-body" style={{ height: '300px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <div className="text-center text-muted">No messages yet</div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`alert ${msg.userId === socket.id ? 'alert-primary' : 'alert-secondary'} mb-2`}
                  >
                    <div className="d-flex justify-content-between">
                      <small>{msg.userId === socket.id ? 'You' : 'User ' + msg.userId.substring(0, 5)}</small>
                      <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                    </div>
                    <p className="mb-0 mt-1">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="card-footer">
              <form onSubmit={sendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!connected}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!connected || !message.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;