const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  preparationSteps: [{
    type: String,
    required: true
  }],
  cookingTime: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other']
  },
  image: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe; 