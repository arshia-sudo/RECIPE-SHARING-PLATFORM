import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRecipeById, deleteRecipe } from '../../services/recipeService';
import { getCurrentUser } from '../../services/authService';
import { emitDeleteRecipe } from '../../services/socketService';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shareOptions, setShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [servings, setServings] = useState(4);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeById(id);
        setRecipe(data);
        setLoading(false);
        
        // Check if current user is the owner
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser && data.user) {
          setIsOwner(currentUser._id === data.user._id);
        }
      } catch (err) {
        setError('Failed to fetch recipe');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteRecipe(id);
      emitDeleteRecipe(id);
      navigate('/recipes');
    } catch (err) {
      setError('Failed to delete recipe');
    }
  };

  const handleShare = () => {
    setShareOptions(!shareOptions);
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this delicious ${recipe.title} recipe!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this delicious ${recipe.title} recipe!`);
    window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
  };

  const shareOnPinterest = () => {
    const url = encodeURIComponent(window.location.href);
    const media = encodeURIComponent(recipe.image || '');
    const description = encodeURIComponent(`${recipe.title} - Delicious recipe`);
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
  };

  const adjustServings = (newServings) => {
    if (newServings > 0) {
      setServings(newServings);
    }
  };

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

  if (!recipe) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          Recipe not found
        </div>
      </div>
    );
  }

  const originalServings = 4; // Assuming original recipe is for 4 people
  const servingRatio = servings / originalServings;

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/recipes" className="text-decoration-none">
          <i className="bi bi-arrow-left me-2"></i>Back to Recipes
        </Link>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <h1 className="mb-3">{recipe.title}</h1>
          
          <div className="d-flex flex-wrap align-items-center mb-4">
            <span className="badge bg-secondary me-3 mb-2">{recipe.category}</span>
            <span className="me-3 mb-2">
              <i className="bi bi-clock me-1"></i>
              {recipe.cookingTime} mins
            </span>
            <span className="mb-2">
              <i className="bi bi-person me-1"></i>
              By {recipe.user ? recipe.user.username : 'Unknown'}
            </span>
          </div>
          
          {recipe.image && (
            <div className="mb-4">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="img-fluid rounded"
                style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Ingredients</h4>
              <div className="d-flex align-items-center">
                <span className="me-2">Servings:</span>
                <div className="input-group input-group-sm" style={{ width: '120px' }}>
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => adjustServings(servings - 1)}
                    disabled={servings <= 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <input 
                    type="number" 
                    className="form-control text-center" 
                    value={servings}
                    onChange={(e) => adjustServings(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => adjustServings(servings + 1)}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {recipe.ingredients.map((ingredient, index) => {
                  // This is a simple implementation - in a real app, you'd need to parse quantities
                  const parts = ingredient.split(' ');
                  if (parts.length > 1 && !isNaN(parts[0])) {
                    const quantity = parseFloat(parts[0]) * servingRatio;
                    return (
                      <li key={index} className="list-group-item border-0 px-0">
                        <strong>{quantity.toFixed(1)}</strong> {parts.slice(1).join(' ')}
                      </li>
                    );
                  }
                  return (
                    <li key={index} className="list-group-item border-0 px-0">
                      {ingredient}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="mb-0">Preparation Steps</h4>
            </div>
            <div className="card-body">
              <ol className="list-group list-group-flush list-group-numbered">
                {recipe.preparationSteps.map((step, index) => (
                  <li key={index} className="list-group-item border-0 px-0">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="d-flex flex-wrap gap-2 mb-4">
            <div className="dropdown">
              <button
                className="btn btn-outline-primary"
                onClick={handleShare}
              >
                <i className="bi bi-share me-2"></i>Share Recipe
              </button>
              
              {shareOptions && (
                <div className="card mt-2 shadow" style={{ position: 'absolute', zIndex: 1000, width: '250px' }}>
                  <div className="card-body">
                    <h6 className="card-title">Share this recipe</h6>
                    <div className="d-flex flex-column gap-2">
                      <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" onClick={copyToClipboard}>
                        <i className="bi bi-clipboard me-2"></i>
                        {copySuccess ? 'Copied!' : 'Copy Link'}
                      </button>
                      <button className="btn btn-sm btn-outline-primary d-flex align-items-center" onClick={shareOnFacebook}>
                        <i className="bi bi-facebook me-2"></i>Facebook
                      </button>
                      <button className="btn btn-sm btn-outline-info d-flex align-items-center" onClick={shareOnTwitter}>
                        <i className="bi bi-twitter me-2"></i>Twitter
                      </button>
                      <button className="btn btn-sm btn-outline-success d-flex align-items-center" onClick={shareOnWhatsApp}>
                        <i className="bi bi-whatsapp me-2"></i>WhatsApp
                      </button>
                      <button className="btn btn-sm btn-outline-danger d-flex align-items-center" onClick={shareOnPinterest}>
                        <i className="bi bi-pinterest me-2"></i>Pinterest
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {isOwner && (
              <>
                <Link
                  to={`/recipes/edit/${recipe._id}`}
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-pencil me-2"></i>Edit Recipe
                </Link>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="bi bi-trash me-2"></i>Delete Recipe
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Recipe Details</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Category</span>
                  <span className="badge bg-secondary">{recipe.category}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Cooking Time</span>
                  <span>{recipe.cookingTime} minutes</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Ingredients</span>
                  <span>{recipe.ingredients.length}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Steps</span>
                  <span>{recipe.preparationSteps.length}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Created</span>
                  <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Nutrition Facts</h5>
            </div>
            <div className="card-body">
              <p className="text-muted small">
                Nutrition information is estimated and may vary based on ingredients and portion sizes.
              </p>
              <div className="text-center py-4">
                <p className="text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  Nutrition information not available for this recipe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this recipe?</p>
                <p className="text-danger"><small>This action cannot be undone.</small></p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail; 