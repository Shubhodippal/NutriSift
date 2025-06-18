import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedRecipesPage.css';
import HamburgerMenu from '../components/HamburgerMenu';

const getRecipeImage = async (recipe) => {
  try {
    const searchQueries = [
      `${recipe.title || recipe.recipeName} ${recipe.cuisine || ''} ${recipe.course || ''} food`,
      `${recipe.title || recipe.recipeName} ${recipe.cuisine || ''} food`,
      `${recipe.title || recipe.recipeName} food`,
      (recipe.title || recipe.recipeName).split(' ')[0] + ' food'
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

function SavedRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

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

  const fetchSavedRecipes = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const decoded = decodeJWT(token);
      
      const userId = decoded.userId;
      
      if (!userId) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_RECIPES_ENDPOINT}/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
        [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status}`);
      }
      
      const data = await response.json();
      
      const transformedData = await Promise.all(data.map(async recipe => {
        const imageUrl = recipe.imageUrl || await getRecipeImage(recipe);
        
        return {
          id: recipe.id,
          title: recipe.recipeName, 
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          prompt: recipe.prompt,
          savedAt: recipe.savedTimeDate,
          text: `# ${recipe.recipeName}\n\n## Ingredients\n${recipe.ingredients}\n\n## Instructions\n${recipe.steps}`,
          calories: recipe.calories,
          diet: recipe.diet,
          origin: recipe.origin,
          course: recipe.course,
          cuisine: recipe.cuisine,
          image: imageUrl
        };
      }));
      
      setRecipes(transformedData);
      localStorage.setItem('savedRecipes', JSON.stringify(transformedData));
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load your saved recipes. Using local data if available.');
      
      const savedRecipes = localStorage.getItem('savedRecipes');
      if (savedRecipes) {
        setRecipes(JSON.parse(savedRecipes));
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  useEffect(() => {
    fetchSavedRecipes();
  }, [fetchSavedRecipes]);

  const handleDeleteRecipe = async (id) => {
    try {      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_RECIPES_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete recipe: ${response.status}`);
      }
      
      const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
      setRecipes(updatedRecipes);
      
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const filteredRecipes = recipes
    .filter(recipe => {
      const searchText = recipe.title || recipe.recipeName || '';
      return searchText.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = a.savedAt || a.savedTimeDate || new Date(0);
      const dateB = b.savedAt || b.savedTimeDate || new Date(0);
      return new Date(dateB) - new Date(dateA);
    });

  const handlePrintRecipe = (recipe) => {
    const ingredients = extractIngredients(recipe);
    const steps = extractSteps(recipe);
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${recipe.title || recipe.recipeName} - Recipe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1 {
            color: #2c5282;
            border-bottom: 2px solid #4f8cff;
            padding-bottom: 10px;
          }
          .recipe-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .recipe-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
          }
          .recipe-meta span {
            background: #f0f4ff;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 14px;
          }
          .section-title {
            margin-top: 30px;
            color: #2c5282;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
          }
          .disclaimer {
            margin-top: 30px;
            padding: 10px;
            background-color: #f7fafc;
            border-left: 4px solid #cbd5e0;
            font-style: italic;
            color: #718096;
          }
          .health-disclaimer {
            margin-top: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            color: #495057;
          }
          .health-disclaimer h3 {
            margin-top: 0;
            color: #2c5282;
          }
        </style>
      </head>
      <body>
        <h1>${recipe.title || recipe.recipeName}</h1>
        
        <!-- Recipe Image -->
        <img src="${recipe.image}" alt="${recipe.title || recipe.recipeName}" class="recipe-image">
        
        <div class="recipe-meta">
          ${recipe.calories ? `<span>Calories: ${recipe.calories} cal</span>` : ''}
          ${recipe.diet ? `<span>Diet: ${recipe.diet}</span>` : ''}
          ${recipe.origin ? `<span>Origin: ${recipe.origin}</span>` : ''}
          ${recipe.course ? `<span>Course: ${recipe.course}</span>` : ''}
          ${recipe.cuisine ? `<span>Cuisine: ${recipe.cuisine}</span>` : ''}
        </div>
        
        <h2 class="section-title">Ingredients</h2>
        <div>
          ${ingredients.map(item => `<p>• ${item}</p>`).join('')}
        </div>
        
        <h2 class="section-title">Instructions</h2>
        <div>
          ${steps.map((step, index) => `<p>${index + 1}. ${step}</p>`).join('')}
        </div>
        
        <!-- Image Disclaimer -->
        <div class="disclaimer">
          <p>⚠️ Recipe images are provided for reference only and may not exactly match the actual dish.</p>
        </div>
        
        <!-- Health and Nutrition Disclaimer -->
        <div class="health-disclaimer">
          <h3>Health and Nutrition Disclaimer</h3>
          <p>The nutritional information, recipes, and dietary recommendations provided through our Services are for informational purposes only and are not intended as medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before making significant changes to your diet or if you have any health concerns or conditions.</p>
          <p>We cannot guarantee that recipes generated by our AI will be suitable for specific dietary needs or restrictions. Users with severe allergies or medical dietary requirements should verify all ingredients and nutritional information independently.</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  const handleShareRecipe = (recipe) => {
    const title = recipe.title || recipe.recipeName;
    const ingredients = extractIngredients(recipe);
    const steps = extractSteps(recipe);
    
    const formattedIngredients = ingredients.map(ing => `• ${ing}`).join('\n');
    const formattedSteps = steps.map((step, i) => `${i+1}. ${step}`).join('\n');
    
    const text = `📝 ${title}\n\n` +
      `📋 INGREDIENTS:\n${formattedIngredients}\n\n` +
      `👨‍🍳 INSTRUCTIONS:\n${formattedSteps}\n\n` +
      `From: NutriSift Recipe App`;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text
      })
      .then(() => {
        console.log('Successfully shared');
        setSuccessMessage('Recipe shared successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((error) => {
        console.log('Error sharing:', error);
        fallbackToClipboard(title, text);
      });
    } else {
      fallbackToClipboard(title, text);
    }
  };

  const fallbackToClipboard = (title, text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccessMessage('Recipe copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(err => {
        console.error('Failed to copy recipe: ', err);
        alert(`Unable to copy recipe to clipboard. Please try again.`);
      });
  };
  
  const handleAddToGroceryList = async (recipe) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const decoded = decodeJWT(token);
      
      const userId = decoded.userId;
      
      if (!userId) {
        alert('You must be logged in to add items to your grocery list');
        return;
      }
      
      const ingredients = extractIngredients(recipe);
      
      let currentList = [];
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          currentList = data.items || [];
        } else {
          currentList = JSON.parse(localStorage.getItem('groceryItems') || '[]');
        }
      } catch (error) {
        console.error('Error fetching grocery list:', error);
        currentList = JSON.parse(localStorage.getItem('groceryItems') || '[]');
      }
      
      const newIngredients = ingredients.map(ingredient => {
        const parts = ingredient.match(/^([\d./]+ \w+)?\s*(.+)/);
        
        if (parts) {
          const name = parts[2].trim();
          const quantity = parts[1] || '';
          
          const existingIndex = currentList.findIndex(item => 
            item.name.toLowerCase() === name.toLowerCase()
          );
          
          if (existingIndex >= 0) {
            // Check if meals exists and is an array before spreading
            const existingMeals = Array.isArray(currentList[existingIndex].meals) 
              ? currentList[existingIndex].meals 
              : [];
              
            return {
              ...currentList[existingIndex],
              count: currentList[existingIndex].count + 1,
              meals: [...existingMeals, recipe.title || recipe.recipeName]
            };
          }
          
          return {
            name,
            quantity,
            category: categorizeIngredient(name),
            checked: false,
            count: 1,
            meals: [recipe.title || recipe.recipeName]
          };
        }
        return undefined;
      }).filter(Boolean);
      
      const existingItemsToUpdate = newIngredients.filter(ingredient => 
        currentList.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase())
      );
      
      const newItemsToAdd = newIngredients.filter(ingredient => 
        !currentList.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase())
      );
      
      const updatedList = currentList.map(item => {
        const matchingItem = existingItemsToUpdate.find(
          ingredient => ingredient.name.toLowerCase() === item.name.toLowerCase()
        );
        return matchingItem ? matchingItem : item;
      });
      
      const finalList = [...updatedList, ...newItemsToAdd];
      
      const sortedList = finalList.sort((a, b) => 
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
      
      localStorage.setItem('groceryItems', JSON.stringify(sortedList));
      
      try {
        const userEmail = decoded.email; // Make sure to get email from the token
        
        const saveResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}/${userEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
          },
          body: JSON.stringify({ items: sortedList })
        });
        
        if (!saveResponse.ok) {
          console.error('Error saving to API:', await saveResponse.text());
        }
      } catch (saveError) {
        console.error('Error saving grocery list to API:', saveError);
      }
      
      setSuccessMessage(`${ingredients.length} ingredients added to grocery list!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error adding to grocery list:', error);
      setError('Failed to add ingredients to grocery list');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const categorizeIngredient = (ingredient) => {
    const lowerIngredient = ingredient.toLowerCase();
    
    if (lowerIngredient.includes('milk') || lowerIngredient.includes('cheese') || 
        lowerIngredient.includes('yogurt') || lowerIngredient.includes('butter')) {
      return 'Dairy';
    } else if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || 
               lowerIngredient.includes('pork') || lowerIngredient.includes('fish') ||
               lowerIngredient.includes('meat')) {
      return 'Meat';
    } else if (lowerIngredient.includes('flour') || lowerIngredient.includes('sugar') || 
               lowerIngredient.includes('oil') || lowerIngredient.includes('pasta') ||
               lowerIngredient.includes('rice') || lowerIngredient.includes('sauce')) {
      return 'Pantry';
    } else if (lowerIngredient.includes('apple') || lowerIngredient.includes('banana') || 
               lowerIngredient.includes('berry') || lowerIngredient.includes('fruit')) {
      return 'Fruits';
    } else if (lowerIngredient.includes('lettuce') || lowerIngredient.includes('tomato') || 
               lowerIngredient.includes('onion') || lowerIngredient.includes('potato') ||
               lowerIngredient.includes('vegetable')) {
      return 'Vegetables';
    } else {
      return 'Other';
    }
  };

  const extractIngredients = (recipe) => {
    if (Array.isArray(recipe.ingredients)) {
      return recipe.ingredients;
    }
    
    if (typeof recipe.ingredients === 'string') {
      return recipe.ingredients.split('\n').map(item => item.trim()).filter(Boolean);
    }
    
    if (recipe.text) {
      const ingredientsMatch = recipe.text.match(/## Ingredients\n([\s\S]*?)(?=## Instructions|$)/);
      if (ingredientsMatch && ingredientsMatch[1]) {
        return ingredientsMatch[1]
          .split('\n')
          .map(line => line.replace(/^- /, '').trim())
          .filter(Boolean);
      }
    }
    
    return [];
  };

  const extractSteps = (recipe) => {
    if (Array.isArray(recipe.steps)) {
      return recipe.steps;
    }
    
    if (typeof recipe.steps === 'string') {
      return recipe.steps.split('\n').map(item => item.trim()).filter(Boolean);
    }
    
    if (recipe.text) {
      const stepsMatch = recipe.text.match(/## Instructions\n([\s\S]*?)(?=##|$)/);
      if (stepsMatch && stepsMatch[1]) {
        return stepsMatch[1]
          .split('\n')
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean);
      }
    }
    
    return [];
  };

  return (
    <div className="saved-recipes-page">
      <header className="saved-recipes-header">
        <h1>📚 Your Saved Recipes</h1>
        
        <HamburgerMenu 
          isLoggedIn={true}
        />
      </header>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search recipes..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your recipes...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchSavedRecipes}>Try Again</button>
        </div>
      ) : recipes.length === 0 ? (
        <div className="no-recipes">
          <p>You haven't saved any recipes yet.</p>
          <button onClick={() => navigate('/chat')}>Get Recipe Suggestions</button>
        </div>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-image">
                <img src={recipe.image} alt={recipe.title || recipe.recipeName} />
              </div>
              <div className="recipe-content">
                <h3>{recipe.title || recipe.recipeName}</h3>
                <div className="recipe-metadata">
                  <span className="recipe-calories">{recipe.calories} cal</span>
                  <span className="recipe-diet">{recipe.diet}</span>
                  <span className="recipe-origin">{recipe.origin}</span>
                  {recipe.course && <span className="recipe-course">{recipe.course}</span>}
                </div>
                <div className="recipe-cuisine">{recipe.cuisine} cuisine</div>
                <div className="recipe-steps-preview">
                  <h4>Steps Preview:</h4>
                  <p>
                    {(() => {
                      const steps = extractSteps(recipe);
                      if (steps && steps.length > 0) {
                        return steps[0].length > 100 
                          ? steps[0].substring(0, 100) + '...' 
                          : steps[0];
                      }
                      return 'No steps available';
                    })()}
                  </p>
                </div>
                <div className="recipe-actions">
                  <button 
                    className="view-recipe-button"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  >
                    View
                  </button>
                  <button 
                    className="print-recipe-button"
                    onClick={() => handlePrintRecipe(recipe)}
                  >
                    <span className="action-icon">🖨️</span>
                  </button>
                  <button 
                    className="share-recipe-button"
                    onClick={() => handleShareRecipe(recipe)}
                  >
                    <span className="action-icon">📤</span>
                  </button>
                  <button 
                    className="grocery-recipe-button"
                    onClick={() => handleAddToGroceryList(recipe)}
                  >
                    <span className="action-icon">🛒</span>
                  </button>
                  <button 
                    className="delete-recipe-button"
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    <span className="action-icon">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="image-disclaimer">
        <p>
          <span className="disclaimer-icon">ℹ️</span>
          Recipe images are provided for reference only and may not exactly match the actual dish.
        </p>
      </div>

      {successMessage && (
        <div className="success-toast">
          <span className="toast-icon">✅</span>
          <span className="toast-message">{successMessage}</span>
        </div>
      )}
    </div>
  );
}

export default SavedRecipesPage;
