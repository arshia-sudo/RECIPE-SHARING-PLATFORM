import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecipes } from '../../services/recipeService';
import { subscribeToRecipeAdded, subscribeToRecipeUpdated, subscribeToRecipeDeleted } from '../../services/socketService';
import { isAuthenticated } from '../../services/authService';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes();
        setRecipes(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch recipes');
        setLoading(false);
      }
    };

    fetchRecipes();
    setAuthenticated(isAuthenticated());

    // Subscribe to real-time updates
    subscribeToRecipeAdded((newRecipe) => {
      setRecipes((prevRecipes) => [newRecipe, ...prevRecipes]);
    });

    subscribeToRecipeUpdated((updatedRecipe) => {
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === updatedRecipe._id ? updatedRecipe : recipe
        )
      );
    });

    subscribeToRecipeDeleted((deletedRecipeId) => {
      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe._id !== deletedRecipeId)
      );
    });
  }, []);

  // Filter recipes based on search term and category
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? recipe.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'cookingTime') {
      return a.cookingTime - b.cookingTime;
    } else if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Get unique categories
  const categories = [...new Set(recipes.map((recipe) => recipe.category))];

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <h2 className="mb-0">Discover Delicious Recipes</h2>
          <p className="text-muted">Find and share your favorite recipes</p>
        </div>
        <div className="col-md-4 text-end">
          {authenticated && (
            <Link to="/recipes/new" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>Add New Recipe
            </Link>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort recipes"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="cookingTime">Cooking Time</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-search" style={{ fontSize: '3rem' }}></i>
          </div>
          <h4>No recipes found</h4>
          <p className="text-muted">Try adjusting your search or filters</p>
          {authenticated ? (
            <Link to="/recipes/new" className="btn btn-primary mt-3">
              Add Your First Recipe
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary mt-3">
              Login to Add Recipes
            </Link>
          )}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {sortedRecipes.map((recipe) => (
            <div key={recipe._id} className="col">
              <div className="card h-100 shadow-sm">
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    className="card-img-top"
                    alt={recipe.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="card-img-top bg-light d-flex align-items-center justify-content-center" 
                    style={{ height: '200px' }}
                  >
                    <i className="bi bi-card-image text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">{recipe.title}</h5>
                  <div className="mb-2">
                    <span className="badge bg-secondary me-2">{recipe.category}</span>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {recipe.cookingTime} mins
                    </small>
                  </div>
                  <p className="card-text small text-muted">
                    {recipe.ingredients.length} ingredients • {recipe.preparationSteps.length} steps
                  </p>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <Link to={`/recipes/${recipe._id}`} className="btn btn-outline-primary w-100">
                    View Recipe
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList; 