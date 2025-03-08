// src/services/socket.js
import { io } from 'socket.io-client';

// Connect to the Socket.io server
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true
});

// Socket event listeners
socket.on('connect', () => {
  console.log('Connected to socket server with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket server');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Export socket instance for use in components
export default socket;
