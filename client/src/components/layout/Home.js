import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';

const Home = () => {
  const authenticated = isAuthenticated();

  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-3">Share Your Culinary Creations</h1>
              <p className="lead mb-4">
                Discover, create, and share delicious recipes with food enthusiasts around the world.
                Join our community and start your culinary journey today!
              </p>
              <div className="d-flex gap-3">
                {authenticated ? (
                  <Link to="/recipes/new" className="btn btn-light btn-lg">
                    <i className="bi bi-plus-circle me-2"></i>Add Recipe
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn-light btn-lg">
                    <i className="bi bi-person-plus me-2"></i>Join Now
                  </Link>
                )}
                <Link to="/recipes" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-search me-2"></i>Explore Recipes
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <img 
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="Cooking" 
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Why Join Our Recipe Community?</h2>
          <p className="text-muted">Discover the benefits of sharing your recipes with us</p>
        </div>
        
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-share text-primary" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h4>Share Your Recipes</h4>
                <p className="text-muted">
                  Upload and share your favorite recipes with our community. Get feedback and appreciation from fellow food lovers.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-lightning-charge text-primary" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h4>Real-time Updates</h4>
                <p className="text-muted">
                  Experience real-time updates when new recipes are added. Stay connected with the latest culinary creations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-collection text-primary" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h4>Organize Your Collection</h4>
                <p className="text-muted">
                  Keep all your recipes organized in one place. Easily manage, edit, and update your culinary creations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-3">Ready to Start Sharing?</h2>
              <p className="lead mb-4">
                Join thousands of food enthusiasts who are already sharing their favorite recipes.
              </p>
              <div className="d-flex justify-content-center gap-3">
                {authenticated ? (
                  <Link to="/recipes/new" className="btn btn-primary btn-lg">
                    <i className="bi bi-plus-circle me-2"></i>Add Your First Recipe
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">
                      <i className="bi bi-person-plus me-2"></i>Sign Up
                    </Link>
                    <Link to="/login" className="btn btn-outline-primary btn-lg">
                      <i className="bi bi-box-arrow-in-right me-2"></i>Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 