// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // React app address
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-sharing-app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// API Welcome Route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Recipe Sharing API' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a room based on user ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  // Listen for new recipe
  socket.on('new_recipe', (recipe) => {
    // Broadcast to all clients
    io.emit('recipe_added', recipe);
  });
  
  // Listen for recipe update
  socket.on('update_recipe', (recipe) => {
    // Broadcast to all clients
    io.emit('recipe_updated', recipe);
  });
  
  // Listen for recipe delete
  socket.on('delete_recipe', (recipeId) => {
    // Broadcast to all clients
    io.emit('recipe_deleted', recipeId);
  });
  
  // Disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});