import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RecipeDetailPage.css';
import ReactMarkdown from 'react-markdown';

function RecipeDetailPage() {
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(4);
  const [activeStep, setActiveStep] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    const found = savedRecipes.find(r => r.id.toString() === id);
    
    if (found) {
      setRecipe(found);
    }
  }, [id]);

  if (!recipe) {
    return (
      <div className="recipe-detail-loading">
        <p>Loading recipe...</p>
        <button onClick={() => navigate('/saved-recipes')}>Back to Saved Recipes</button>
      </div>
    );
  }

  const ingredientsList = recipe.recipeData?.ingredients || [];
  const stepsList = recipe.recipeData?.steps || [];

  const adjustedIngredients = ingredientsList.map(ingredient => {
    // Extract quantity if present and adjust based on servings
    const match = ingredient.match(/^([\d./]+)\s+(.+)/);
    if (match) {
      const quantity = parseFloat(eval(match[1]));
      const adjustedQuantity = (quantity * servings / 4).toFixed(1).replace(/\.0$/, '');
      return `${adjustedQuantity} ${match[2]}`;
    }
    return ingredient;
  });

  return (
    <div className="recipe-detail-page">
      <header className="recipe-detail-header">
        <button className="back-button" onClick={() => navigate('/saved-recipes')}>
          <span>←</span> Back to Saved Recipes
        </button>
        <h1>{recipe.recipeData?.title || "Recipe"}</h1>
      </header>

      <div className="recipe-content">
        <div className="recipe-servings">
          <label>Servings:</label>
          <div className="servings-control">
            <button onClick={() => servings > 1 && setServings(servings - 1)}>-</button>
            <span>{servings}</span>
            <button onClick={() => setServings(servings + 1)}>+</button>
          </div>
        </div>

        <div className="recipe-tabs">
          <button className={activeStep === 0 ? 'active' : ''} onClick={() => setActiveStep(0)}>
            Overview
          </button>
          <button className={activeStep === 1 ? 'active' : ''} onClick={() => setActiveStep(1)}>
            Step-by-Step
          </button>
        </div>

        {activeStep === 0 ? (
          <>
            <div className="ingredients-section">
              <h2>Ingredients</h2>
              <ul>
                {adjustedIngredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="instructions-section">
              <h2>Instructions</h2>
              <ol>
                {stepsList.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <div className="step-by-step">
            <div className="step-progress">
              Step {activeStep} of {stepsList.length}
              <div className="progress-bar">
                <div className="progress" style={{width: `${(activeStep / stepsList.length) * 100}%`}}></div>
              </div>
            </div>
            
            <div className="current-step">
              <p>{stepsList[activeStep - 1]}</p>
            </div>
            
            <div className="step-controls">
              <button 
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
              >
                Previous Step
              </button>
              <button 
                disabled={activeStep === stepsList.length}
                onClick={() => setActiveStep(prev => Math.min(prev + 1, stepsList.length))}
              >
                Next Step
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetailPage;