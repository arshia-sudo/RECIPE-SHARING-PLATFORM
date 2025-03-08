import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  socket = io('http://localhost:5000');
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinRoom = (userId) => {
  const socket = getSocket();
  socket.emit('join', userId);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// Recipe events
export const emitNewRecipe = (recipe) => {
  const socket = getSocket();
  socket.emit('new_recipe', recipe);
};

export const emitUpdateRecipe = (recipe) => {
  const socket = getSocket();
  socket.emit('update_recipe', recipe);
};

export const emitDeleteRecipe = (recipeId) => {
  const socket = getSocket();
  socket.emit('delete_recipe', recipeId);
};

// Subscribe to recipe events
export const subscribeToRecipeAdded = (callback) => {
  const socket = getSocket();
  socket.on('recipe_added', (recipe) => {
    callback(recipe);
  });
};

export const subscribeToRecipeUpdated = (callback) => {
  const socket = getSocket();
  socket.on('recipe_updated', (recipe) => {
    callback(recipe);
  });
};

export const subscribeToRecipeDeleted = (callback) => {
  const socket = getSocket();
  socket.on('recipe_deleted', (recipeId) => {
    callback(recipeId);
  });
}; 