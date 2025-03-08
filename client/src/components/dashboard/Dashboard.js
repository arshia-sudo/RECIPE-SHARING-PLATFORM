import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import { getRecipesByUser } from '../../services/recipeService';
import { subscribeToRecipeAdded, subscribeToRecipeUpdated, subscribeToRecipeDeleted } from '../../services/socketService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserAndRecipes = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          setError('Please login to view your dashboard');
          setLoading(false);
          return;
        }
        
        setUser(userData);
        
        const userRecipes = await getRecipesByUser(userData._id);
        setRecipes(userRecipes);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchUserAndRecipes();

    // Subscribe to real-time updates
    subscribeToRecipeAdded((newRecipe) => {
      setRecipes((prevRecipes) => {
        if (user && newRecipe.user === user._id) {
          return [newRecipe, ...prevRecipes];
        }
        return prevRecipes;
      });
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
  }, [user]);

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

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>My Dashboard</h2>
          {user && <p>Welcome, {user.username}!</p>}
        </div>
        <div className="col-md-4 text-end">
          <Link to="/recipes/new" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Add New Recipe
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-light">
              <h4 className="mb-0">My Recipes</h4>
            </div>
            <div className="card-body">
              {recipes.length === 0 ? (
                <div className="text-center py-5">
                  <h5>You haven't added any recipes yet</h5>
                  <p className="text-muted">Create your first recipe to get started!</p>
                  <Link to="/recipes/new" className="btn btn-primary mt-3">
                    Create Recipe
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Cooking Time</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map((recipe) => (
                        <tr key={recipe._id}>
                          <td>
                            <Link to={`/recipes/${recipe._id}`} className="text-decoration-none">
                              {recipe.title}
                            </Link>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{recipe.category}</span>
                          </td>
                          <td>{recipe.cookingTime} mins</td>
                          <td>{new Date(recipe.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link to={`/recipes/${recipe._id}`} className="btn btn-outline-primary">
                                View
                              </Link>
                              <Link to={`/recipes/edit/${recipe._id}`} className="btn btn-outline-secondary">
                                Edit
                              </Link>
                              <Link to={`/recipes/${recipe._id}`} className="btn btn-outline-danger">
                                Delete
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 