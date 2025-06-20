import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RecipeDetailPage.css';
import HamburgerMenu from '../components/HamburgerMenu';

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(4);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  
  const getRecipeImage = async (recipe) => {
    try {
      const searchQueries = [
        `${recipe.title} ${recipe.cuisine || ''} ${recipe.course || ''} food`,
        `${recipe.title} ${recipe.cuisine || ''} food`,
        `${recipe.title} food`,
        recipe.title.split(' ')[0] + ' food'
      ];
      
      for (const query of searchQueries) {
        const searchQuery = encodeURIComponent(query);
        const pixabayApiKey = process.env.REACT_APP_PIXABAY_API_KEY;
        const response = await fetch(
          `${process.env.REACT_APP_PIXABAY_API_URL}/?key=${pixabayApiKey}&q=${searchQuery}&image_type=photo&per_page=3&category=food&orientation=horizontal&min_width=500`
        );
        
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
          return data.hits[0].webformatURL;
        }
      }
    } catch (error) {
      console.error('Error fetching recipe image:', error);
    }
  };
  
  const decodeJWT = (token) => {
    try {
      const [headerEncoded, payloadEncoded] = token.split('.');
      const payload = JSON.parse(atob(payloadEncoded));
      return payload;
    } catch (err) {
      console.error("Invalid JWT token:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = decodeJWT(token);
        
        const userId = decoded.userId; 
        const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        const found = savedRecipes.find(r => r.id.toString() === id.toString());
          
        if (found) {
          if (!found.image) {
            found.image = await getRecipeImage(found);
              
            localStorage.setItem('savedRecipes', JSON.stringify(
              savedRecipes.map(r => r.id.toString() === id.toString() ? {...r, image: found.image} : r)
            ));
          }
            
          const adaptedRecipe = {
            ...found,
            ingredients: Array.isArray(found.ingredients) 
              ? found.ingredients 
              : found.ingredients.split('\n').filter(item => item.trim()),
            steps: Array.isArray(found.steps) 
              ? found.steps 
              : found.steps.split('\n').filter(item => item.trim()),
          };
          setRecipe(adaptedRecipe);
          setLoading(false);
        } else {
          setError('Recipe not found');
          setLoading(false);
        }
      } catch (error) {
        setError('An error occurred while loading the recipe.');
        setLoading(false);
        console.error(error);
      }
    };
    
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    const loadViewingRecipe = async () => {
      const viewingRecipeJson = sessionStorage.getItem('viewingRecipe');
      
      if (viewingRecipeJson) {
        try {
          const viewingRecipe = JSON.parse(viewingRecipeJson);
          
          if (viewingRecipe.id.toString() === id.toString()) {
            const { content } = viewingRecipe;
            
            let imageUrl = content.image;
            if (!imageUrl) {
              imageUrl = await getRecipeImage({
                title: viewingRecipe.title,
                cuisine: content.cuisine,
                course: content.course
              });
            }
            
            setRecipe({
              id: viewingRecipe.id,
              title: viewingRecipe.title,
              ingredients: content.ingredients,
              steps: content.steps,
              text: formatRecipeAsMarkdown(viewingRecipe),
              calories: content.calories,
              diet: content.diet,
              origin: content.origin,
              course: content.course,
              cuisine: content.cuisine,
              savedAt: new Date().toISOString(),
              image: imageUrl
            });
            
            setLoading(false);
            sessionStorage.removeItem('viewingRecipe');
            return;
          }
        } catch (error) {
          console.error('Error parsing viewing recipe:', error);
        }
      }
    };
    
    loadViewingRecipe();
  }, [id]);

  const formatRecipeAsMarkdown = (recipe) => {
    const { content } = recipe;
    const ingredientsList = content.ingredients.map(i => `- ${i}`).join('\n');
    
    const stepsList = content.steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
    
    return `# ${recipe.title}

    **Nutritional & Recipe Information:**
    - Calories: ${content.calories}
    - Diet: ${content.diet}
    - Origin: ${content.origin}
    - Course: ${content.course}
    - Cuisine: ${content.cuisine}
    - Prep Time: ${content.prepTime} minutes
    - Cook Time: ${content.cookTime} minutes

    ## Ingredients
    ${ingredientsList}

    ## Instructions
    ${stepsList}`;
  };

  useEffect(() => {
    // Track conversion when the component mounts
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17233780436/xuZlCJrN8d4aENS92plA'
    });
  }, []);

  if (!recipe || loading) {
    return (
      <div className="recipe-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
        <button onClick={() => navigate('/saved-recipes')}>Back to Saved Recipes</button>
      </div>
    );
  }

  const ingredientsList = recipe.ingredients || [];
  const stepsList = recipe.steps || [];

  const adjustedIngredients = ingredientsList.map(ingredient => {
    const match = ingredient.match(/^([\d./]+)\s+(.+)/);
    if (match) {
      try {
        const parseFraction = (str) => {
          if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length === 2) {
              return parseFloat(parts[0]) / parseFloat(parts[1]);
            }
          }
          return parseFloat(str);
        };
        const quantity = parseFraction(match[1]);
        const adjustedQuantity = (quantity * servings / 4).toFixed(1).replace(/\.0$/, '');
        return `${adjustedQuantity} ${match[2]}`;
      } catch (e) {
        return ingredient;
      }
    }
    return ingredient;
  });

  return (
    <div className="recipe-detail-page">
      <header className="recipe-detail-header">
        <h1>{recipe.title || "Recipe"}</h1>
        
        <HamburgerMenu 
          isLoggedIn={true}
        />
      </header>

      <div className="recipe-metadata">
        {recipe.calories && (
          <div className="metadata-item">
            <span className="metadata-icon">🔥</span>
            <span className="metadata-label">Calories:</span>
            <span className="metadata-value">{recipe.calories}</span>
          </div>
        )}
        
        {recipe.diet && (
          <div className="metadata-item">
            <span className="metadata-icon">🥗</span>
            <span className="metadata-label">Diet:</span>
            <span className="metadata-value">{recipe.diet}</span>
          </div>
        )}
        
        {recipe.origin && (
          <div className="metadata-item">
            <span className="metadata-icon">🌍</span>
            <span className="metadata-label">Origin:</span>
            <span className="metadata-value">{recipe.origin}</span>
          </div>
        )}
        
        {recipe.course && (
          <div className="metadata-item">
            <span className="metadata-icon">🍽️</span>
            <span className="metadata-label">Course:</span>
            <span className="metadata-value">{recipe.course}</span>
          </div>
        )}
        
        {recipe.cuisine && (
          <div className="metadata-item">
            <span className="metadata-icon">👨‍🍳</span>
            <span className="metadata-label">Cuisine:</span>
            <span className="metadata-value">{recipe.cuisine}</span>
          </div>
        )}
        
        {recipe.savedAt && (
          <div className="metadata-item">
            <span className="metadata-icon">🕒</span>
            <span className="metadata-label">Saved:</span>
            <span className="metadata-value">
              {new Date(recipe.savedAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="recipe-detail-image">
        <img src={recipe.image} alt={recipe.title} />
      </div>

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
                  <li key={idx}>
                    {step.replace(/^\d+\.\s*/, '')}
                  </li>
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

      <div className="image-disclaimer">
        <p>
          <span className="disclaimer-icon">ℹ️</span> 
          Recipe images are provided for reference only and may not exactly match the actual dish.
        </p>
      </div>

      <div className="health-nutrition-disclaimer">
        <h3>Health and Nutrition Disclaimer</h3>
        <p>
          The nutritional information, recipes, and dietary recommendations provided through our Services are for informational purposes only and are not intended as medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before making significant changes to your diet or if you have any health concerns or conditions.
        </p>
        <p>
          We cannot guarantee that recipes generated by our AI will be suitable for specific dietary needs or restrictions. Users with severe allergies or medical dietary requirements should verify all ingredients and nutritional information independently.
        </p>
      </div>
    </div>
  );
}
export default RecipeDetailPage;