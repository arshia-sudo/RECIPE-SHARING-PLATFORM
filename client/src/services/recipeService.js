import axios from 'axios';

const API_URL = 'http://localhost:5000/api/recipes';

// Get auth token from local storage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

// Get all recipes
export const getAllRecipes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get recipe by ID
export const getRecipeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get recipes by user ID
export const getRecipesByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create a new recipe
export const createRecipe = async (recipeData) => {
  try {
    const config = {
      headers: getAuthHeader()
    };
    
    const response = await axios.post(API_URL, recipeData, config);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update a recipe
export const updateRecipe = async (id, recipeData) => {
  try {
    const config = {
      headers: getAuthHeader()
    };
    
    const response = await axios.put(`${API_URL}/${id}`, recipeData, config);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete a recipe
export const deleteRecipe = async (id) => {
  try {
    const config = {
      headers: getAuthHeader()
    };
    
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 