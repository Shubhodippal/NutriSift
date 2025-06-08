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
  const [loading, setLoading] = useState(true); // Add this line
  // Add this error state
  const [error, setError] = useState(null);
  
  // Add the getRecipeImage function (same as above)
const getRecipeImage = async (recipe) => {
  try {
    // Create search queries in order of preference
    const searchQueries = [
      // First try specific search with title + cuisine + course
      `${recipe.title} ${recipe.cuisine || ''} ${recipe.course || ''} food`,
      // Then try with just title + cuisine
      `${recipe.title} ${recipe.cuisine || ''} food`,
      // Then try just title + food
      `${recipe.title} food`,
      // Finally try just the main ingredient (if we can extract it)
      recipe.title.split(' ')[0] + ' food'
    ];
    
    // Try each search query in order until we find images
    for (const query of searchQueries) {
      const searchQuery = encodeURIComponent(query);
      const pixabayApiKey = process.env.REACT_APP_PIXABAY_API_KEY;
      const response = await fetch(
        `https://pixabay.com/api/?key=${pixabayApiKey}&q=${searchQuery}&image_type=photo&per_page=3&category=food&orientation=horizontal&min_width=500`
      );
      
      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        // Use the first image result
        return data.hits[0].webformatURL;
      }
    }
    
    // If all searches failed, use a food-themed placeholder
    return `https://via.placeholder.com/800x400/1a2235/ffffff?text=${encodeURIComponent(recipe.title)}`;
  } catch (error) {
    console.error('Error fetching recipe image:', error);
    // Fallback to a food placeholder
    return `https://via.placeholder.com/800x400/1a2235/ffffff?text=${encodeURIComponent(recipe.title)}`;
  }
};

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // First try to get from API
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const response = await fetch(`http://localhost:8080/recipes/${id}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // Get an image for the recipe
              const imageUrl = data.imageUrl || await getRecipeImage({
                title: data.recipeName,
                cuisine: data.cuisine,
                course: data.course
              });
              
              // Transform API data to match expected format
              setRecipe({
                id: data.id,
                title: data.recipeName,
                ingredients: data.ingredients.split('\n').filter(item => item.trim()),
                steps: data.steps.split('\n').filter(item => item.trim()),
                text: `# ${data.recipeName}\n\n## Ingredients\n${data.ingredients}\n\n## Instructions\n${data.steps}`,
                calories: data.calories,
                diet: data.diet,
                origin: data.origin,
                course: data.course,
                cuisine: data.cuisine,
                savedAt: data.savedTimeDate,
                image: imageUrl // Add the image URL
              });
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error fetching from API:', error);
          }
        }
        
        // Fallback to localStorage
        const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        const found = savedRecipes.find(r => r.id.toString() === id.toString());
        
        if (found) {
          // If recipe has no image, fetch one
          if (!found.image) {
            found.image = await getRecipeImage(found);
            
            // Update localStorage with the new image URL
            localStorage.setItem('savedRecipes', JSON.stringify(
              savedRecipes.map(r => r.id.toString() === id.toString() ? {...r, image: found.image} : r)
            ));
          }
          
          // Adapt the found recipe to match expected structure
          const adaptedRecipe = {
            ...found,
            // If the recipe has ingredients as string, convert to array
            ingredients: Array.isArray(found.ingredients) 
              ? found.ingredients 
              : found.ingredients.split('\n').filter(item => item.trim()),
            // If the recipe has steps as string, convert to array
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
        console.error('Error loading recipe:', error);
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id]);

  // Update the useEffect to properly handle async operations
  useEffect(() => {
    const loadViewingRecipe = async () => {
      // Check if we're viewing a temporary recipe
      const viewingRecipeJson = sessionStorage.getItem('viewingRecipe');
      
      if (viewingRecipeJson) {
        try {
          // Parse the recipe from sessionStorage
          const viewingRecipe = JSON.parse(viewingRecipeJson);
          
          // Check if this is the recipe we want to view
          if (viewingRecipe.id.toString() === id.toString()) {
            // Extract content
            const { content } = viewingRecipe;
            
            // Get the image URL
            let imageUrl = content.image;
            if (!imageUrl) {
              imageUrl = await getRecipeImage({
                title: viewingRecipe.title,
                cuisine: content.cuisine,
                course: content.course
              });
            }
            
            // Format the recipe for display
            setRecipe({
              id: viewingRecipe.id,
              title: viewingRecipe.title,
              // Extract arrays from content for direct access in the UI
              ingredients: content.ingredients,
              steps: content.steps,
              // Also include the original text format
              text: formatRecipeAsMarkdown(viewingRecipe),
              // Include all metadata
              calories: content.calories,
              diet: content.diet,
              origin: content.origin,
              course: content.course,
              cuisine: content.cuisine,
              savedAt: new Date().toISOString(),
              // Use the image URL we got above
              image: imageUrl
            });
            
            setLoading(false);
            
            // Clear the viewing recipe from sessionStorage after use
            sessionStorage.removeItem('viewingRecipe');
            return;
          }
        } catch (error) {
          console.error('Error parsing viewing recipe:', error);
        }
      }
      
      // If we're not viewing a temporary recipe, proceed with normal loading
    };
    
    loadViewingRecipe();
  }, [id]);

  // Helper function to format the recipe as markdown
  const formatRecipeAsMarkdown = (recipe) => {
    const { content } = recipe;
    
    // Format ingredients as bullet points
    const ingredientsList = content.ingredients.map(i => `- ${i}`).join('\n');
    
    // Format steps as numbered list
    const stepsList = content.steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
    
    // Create the complete markdown text
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

  // Update the loading condition to use the loading state
  if (!recipe || loading) {
    return (
      <div className="recipe-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
        <button onClick={() => navigate('/saved-recipes')}>Back to Saved Recipes</button>
      </div>
    );
  }

  // Get ingredients and steps directly from recipe
  const ingredientsList = recipe.ingredients || [];
  const stepsList = recipe.steps || [];

  const adjustedIngredients = ingredientsList.map(ingredient => {
    // Extract quantity if present and adjust based on servings
    const match = ingredient.match(/^([\d./]+)\s+(.+)/);
    if (match) {
      try {
        const quantity = parseFloat(eval(match[1]));
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
        
        {/* Add component */}
        <HamburgerMenu 
          isLoggedIn={true}
        />
      </header>

      {/* New Recipe Metadata Section */}
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

      {/* Add this before the recipe-content div */}
      <div className="recipe-detail-image">
        <img src={recipe.image} alt={recipe.title} />
        {/* Remove the course badge from here - it's already in the metadata section */}
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
                    {/* Remove leading numbers and periods from the step text */}
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

      {/* Add the image disclaimer at the bottom of the page */}
      <div className="image-disclaimer">
        <p>
          <span className="disclaimer-icon">ℹ️</span> 
          Recipe images are provided for reference only and may not exactly match the actual dish.
        </p>
      </div>
    </div>
  );
}

export default RecipeDetailPage;