import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createRecipe, getRecipeById, updateRecipe } from '../../services/recipeService';
import { emitNewRecipe, emitUpdateRecipe } from '../../services/socketService';

const RecipeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    ingredients: [''],
    preparationSteps: [''],
    cookingTime: '',
    category: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(isEditMode);
  const [previewImage, setPreviewImage] = useState('');
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const categories = [
    'Vegetarian',
    'Non-Vegetarian',
    'Vegan',
    'Dessert',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
    'Other'
  ];

  useEffect(() => {
    const fetchRecipe = async () => {
      if (isEditMode) {
        try {
          const recipe = await getRecipeById(id);
          setFormData({
            title: recipe.title,
            ingredients: recipe.ingredients,
            preparationSteps: recipe.preparationSteps,
            cookingTime: recipe.cookingTime,
            category: recipe.category,
            image: recipe.image || ''
          });
          setPreviewImage(recipe.image || '');
          setFormLoading(false);
        } catch (err) {
          setError('Failed to fetch recipe');
          setFormLoading(false);
        }
      }
    };

    fetchRecipe();
  }, [id, isEditMode]);

  // Validate form fields
  useEffect(() => {
    const newErrors = {};
    
    if (touched.title && !formData.title) {
      newErrors.title = 'Title is required';
    }
    
    if (touched.cookingTime) {
      if (!formData.cookingTime) {
        newErrors.cookingTime = 'Cooking time is required';
      } else if (formData.cookingTime <= 0) {
        newErrors.cookingTime = 'Cooking time must be greater than 0';
      }
    }
    
    if (touched.category && !formData.category) {
      newErrors.category = 'Category is required';
    }
    
    formData.ingredients.forEach((ingredient, index) => {
      if (touched[`ingredient-${index}`] && !ingredient) {
        newErrors[`ingredient-${index}`] = 'Ingredient cannot be empty';
      }
    });
    
    formData.preparationSteps.forEach((step, index) => {
      if (touched[`step-${index}`] && !step) {
        newErrors[`step-${index}`] = 'Step cannot be empty';
      }
    });
    
    if (touched.image && formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
  }, [formData, touched]);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    setTouched({
      ...touched,
      [name]: true
    });
    
    if (name === 'image') {
      setPreviewImage(value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
  };

  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = value;
    setFormData({
      ...formData,
      ingredients: updatedIngredients
    });
    
    setTouched({
      ...touched,
      [`ingredient-${index}`]: true
    });
  };

  const handleIngredientBlur = (index) => {
    setTouched({
      ...touched,
      [`ingredient-${index}`]: true
    });
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...formData.preparationSteps];
    updatedSteps[index] = value;
    setFormData({
      ...formData,
      preparationSteps: updatedSteps
    });
    
    setTouched({
      ...touched,
      [`step-${index}`]: true
    });
  };

  const handleStepBlur = (index) => {
    setTouched({
      ...touched,
      [`step-${index}`]: true
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, '']
    });
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const updatedIngredients = [...formData.ingredients];
      updatedIngredients.splice(index, 1);
      setFormData({
        ...formData,
        ingredients: updatedIngredients
      });
      
      // Remove the error for this ingredient
      const newErrors = { ...errors };
      delete newErrors[`ingredient-${index}`];
      setErrors(newErrors);
      
      // Update touched state
      const newTouched = { ...touched };
      delete newTouched[`ingredient-${index}`];
      setTouched(newTouched);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      preparationSteps: [...formData.preparationSteps, '']
    });
  };

  const removeStep = (index) => {
    if (formData.preparationSteps.length > 1) {
      const updatedSteps = [...formData.preparationSteps];
      updatedSteps.splice(index, 1);
      setFormData({
        ...formData,
        preparationSteps: updatedSteps
      });
      
      // Remove the error for this step
      const newErrors = { ...errors };
      delete newErrors[`step-${index}`];
      setErrors(newErrors);
      
      // Update touched state
      const newTouched = { ...touched };
      delete newTouched[`step-${index}`];
      setTouched(newTouched);
    }
  };

  const validateForm = () => {
    // Mark all fields as touched to show all errors
    const allTouched = {
      title: true,
      cookingTime: true,
      category: true,
      image: !!formData.image
    };
    
    formData.ingredients.forEach((_, index) => {
      allTouched[`ingredient-${index}`] = true;
    });
    
    formData.preparationSteps.forEach((_, index) => {
      allTouched[`step-${index}`] = true;
    });
    
    setTouched(allTouched);
    
    // Check if there are any empty required fields
    if (
      !formData.title ||
      !formData.cookingTime ||
      !formData.category ||
      formData.ingredients.some(ingredient => !ingredient) ||
      formData.preparationSteps.some(step => !step)
    ) {
      return false;
    }
    
    // Check if there are any validation errors
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      window.scrollTo(0, 0);
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        const updatedRecipe = await updateRecipe(id, formData);
        emitUpdateRecipe(updatedRecipe);
        setLoading(false);
        navigate(`/recipes/${id}`);
      } else {
        const newRecipe = await createRecipe(formData);
        emitNewRecipe(newRecipe);
        setLoading(false);
        navigate(`/recipes/${newRecipe._id}`);
      }
    } catch (err) {
      setLoading(false);
      setError(err.msg || 'Failed to save recipe');
      window.scrollTo(0, 0);
    }
  };

  if (formLoading) {
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
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">{isEditMode ? 'Edit Recipe' : 'Create New Recipe'}</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="form-label">Recipe Title</label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter a descriptive title for your recipe"
                    required
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="cookingTime" className="form-label">Cooking Time (minutes)</label>
                    <input
                      type="number"
                      className={`form-control ${errors.cookingTime ? 'is-invalid' : ''}`}
                      id="cookingTime"
                      name="cookingTime"
                      value={formData.cookingTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="How long does it take to prepare?"
                      required
                      min="1"
                    />
                    {errors.cookingTime && <div className="invalid-feedback">{errors.cookingTime}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="image" className="form-label">Image URL (optional)</label>
                  <input
                    type="url"
                    className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter a URL for your recipe image"
                  />
                  {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                  
                  {previewImage && (
                    <div className="mt-2">
                      <p className="text-muted small">Image Preview:</p>
                      <img
                        src={previewImage}
                        alt="Recipe preview"
                        className="img-thumbnail"
                        style={{ maxHeight: '200px' }}
                        onError={() => {
                          setErrors({...errors, image: 'Invalid image URL'});
                          setPreviewImage('');
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Ingredients</label>
                  <div className="card">
                    <div className="card-body">
                      {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="mb-3">
                          <div className="input-group">
                            <span className="input-group-text">{index + 1}</span>
                            <input
                              type="text"
                              className={`form-control ${errors[`ingredient-${index}`] ? 'is-invalid' : ''}`}
                              value={ingredient}
                              onChange={(e) => handleIngredientChange(index, e.target.value)}
                              onBlur={() => handleIngredientBlur(index)}
                              placeholder="e.g. 2 cups flour"
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => removeIngredient(index)}
                              disabled={formData.ingredients.length === 1}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                            {errors[`ingredient-${index}`] && (
                              <div className="invalid-feedback">{errors[`ingredient-${index}`]}</div>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={addIngredient}
                      >
                        <i className="bi bi-plus-circle me-2"></i>Add Ingredient
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Preparation Steps</label>
                  <div className="card">
                    <div className="card-body">
                      {formData.preparationSteps.map((step, index) => (
                        <div key={index} className="mb-3">
                          <div className="input-group">
                            <span className="input-group-text">{index + 1}</span>
                            <textarea
                              className={`form-control ${errors[`step-${index}`] ? 'is-invalid' : ''}`}
                              value={step}
                              onChange={(e) => handleStepChange(index, e.target.value)}
                              onBlur={() => handleStepBlur(index)}
                              placeholder="Describe this step of the recipe"
                              rows="2"
                              required
                            ></textarea>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => removeStep(index)}
                              disabled={formData.preparationSteps.length === 1}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          {errors[`step-${index}`] && (
                            <div className="invalid-feedback d-block">{errors[`step-${index}`]}</div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={addStep}
                      >
                        <i className="bi bi-plus-circle me-2"></i>Add Step
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="d-flex gap-2 justify-content-between">
                  <Link
                    to={isEditMode ? `/recipes/${id}` : '/recipes'}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Recipe' : 'Create Recipe'
                    )}
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

export default RecipeForm; 