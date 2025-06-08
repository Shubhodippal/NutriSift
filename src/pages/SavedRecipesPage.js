import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedRecipesPage.css';
import HamburgerMenu from '../components/HamburgerMenu';

// Add the getRecipeImage function outside the component
const getRecipeImage = async (recipe) => {
  try {
    // Create search queries in order of preference
    const searchQueries = [
      // First try specific search with title + cuisine + course
      `${recipe.title || recipe.recipeName} ${recipe.cuisine || ''} ${recipe.course || ''} food`,
      // Then try with just title + cuisine
      `${recipe.title || recipe.recipeName} ${recipe.cuisine || ''} food`,
      // Then try just title + food
      `${recipe.title || recipe.recipeName} food`,
      // Finally try just the main ingredient (if we can extract it)
      (recipe.title || recipe.recipeName).split(' ')[0] + ' food'
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
    return `https://via.placeholder.com/600x400/1a2235/ffffff?text=${encodeURIComponent(recipe.title || recipe.recipeName)}`;
  } catch (error) {
    console.error('Error fetching recipe image:', error);
    // Fallback to a food placeholder
    return `https://via.placeholder.com/600x400/1a2235/ffffff?text=${encodeURIComponent(recipe.title || recipe.recipeName)}`;
  }
};

function SavedRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Load recipes from API on component mount
  useEffect(() => {
    fetchSavedRecipes();
  }, []);
  
  // Fetch recipes from API
  const fetchSavedRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        // User not logged in, redirect to login
        navigate('/login');
        return;
      }
      
      const response = await fetch(`http://localhost:8080/recipes/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data to match frontend structure and add images
      const transformedData = await Promise.all(data.map(async recipe => {
        // Get an image for the recipe
        const imageUrl = recipe.imageUrl || await getRecipeImage(recipe);
        
        return {
          id: recipe.id,
          title: recipe.recipeName, // Backend uses recipeName instead of title
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          prompt: recipe.prompt,
          savedAt: recipe.savedTimeDate,
          // Create a markdown formatted text from the recipe parts
          text: `# ${recipe.recipeName}\n\n## Ingredients\n${recipe.ingredients}\n\n## Instructions\n${recipe.steps}`,
          // Include all other fields
          calories: recipe.calories,
          diet: recipe.diet,
          origin: recipe.origin,
          course: recipe.course,
          cuisine: recipe.cuisine,
          // Add the image URL
          image: imageUrl
        };
      }));
      
      setRecipes(transformedData);
      
      // Also update localStorage for offline access
      localStorage.setItem('savedRecipes', JSON.stringify(transformedData));
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load your saved recipes. Using local data if available.');
      
      // Fallback to localStorage if API fails
      const savedRecipes = localStorage.getItem('savedRecipes');
      if (savedRecipes) {
        setRecipes(JSON.parse(savedRecipes));
      }
    } finally {
      setLoading(false);
    }
  };

  // Save recipe to database - adapted for backend
  const saveRecipeToDatabase = async (recipe) => {
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userId || !userEmail) {
        throw new Error('User not logged in');
      }
      
      // Parse recipe text to extract ingredients and steps
      const ingredientsMatch = recipe.text.match(/## Ingredients\n([\s\S]*?)(?=## Instructions)/);
      const stepsMatch = recipe.text.match(/## Instructions\n([\s\S]*?)(?=##|$)/);
      
      const ingredients = ingredientsMatch ? ingredientsMatch[1].trim() : '';
      const steps = stepsMatch ? stepsMatch[1].trim() : '';
      
      // Extract other data if available
      const caloriesMatch = recipe.text.match(/Calories: ([^\n]*)/);
      const dietMatch = recipe.text.match(/Diet: ([^\n]*)/);
      const originMatch = recipe.text.match(/Origin: ([^\n]*)/);
      const courseMatch = recipe.text.match(/Course: ([^\n]*)/);
      const cuisineMatch = recipe.text.match(/Cuisine: ([^\n]*)/);
      
      // Ensure recipe_name is never null by using fallbacks
      const recipeName = recipe.title || recipe.recipe_name || 'Untitled Recipe';
      
      // Format data for API according to backend model
      const recipeData = {
        uid: userId,
        mail: userEmail,
        prompt: recipe.prompt || '',
        recipeName: recipeName, // Changed from recipe_name to recipeName to match backend
        ingredients: ingredients,
        steps: steps,
        calories: caloriesMatch ? caloriesMatch[1].trim() : '',
        diet: dietMatch ? dietMatch[1].trim() : '',
        origin: originMatch ? originMatch[1].trim() : '',
        course: courseMatch ? courseMatch[1].trim() : '',
        cuisine: cuisineMatch ? cuisineMatch[1].trim() : ''
      };
      
      console.log('Saving recipe with name:', recipeName);
      
      const response = await fetch('http://localhost:8080/recipes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save recipe: ${response.status}`);
      }
      
      // After saving, fetch all recipes to get the updated list with IDs
      await fetchSavedRecipes();
      return { success: true };
    } catch (err) {
      console.error('Error saving recipe to database:', err);
      throw err;
    }
  };

  // Handle deleting a recipe
  const handleDeleteRecipe = async (id) => {
    try {
      const userId = localStorage.getItem('userId');
      
      // Delete from API
      const response = await fetch(`http://localhost:8080/recipes/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete recipe: ${response.status}`);
      }
      
      // Update local state
      const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
      setRecipes(updatedRecipes);
      
      // Update localStorage
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Navigation handler
  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const formatPreviewText = (text) => {
    // Remove markdown formatting and create a clean preview
    return text
      .replace(/# (.*)\n/, '$1\n')
      .replace(/## Ingredients\n/, 'Ingredients: ')
      .replace(/## Instructions\n/, 'Instructions: ')
      .replace(/- /g, '• ')
      .replace(/\n/g, ' ')
      .substring(0, 150) + '...';
  };

  const filteredRecipes = recipes
    .filter(recipe => {
      // Search in either title or recipeName field
      const searchText = recipe.title || recipe.recipeName || '';
      return searchText.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      // Sort by savedAt or savedTimeDate
      const dateA = a.savedAt || a.savedTimeDate || new Date(0);
      const dateB = b.savedAt || b.savedTimeDate || new Date(0);
      return new Date(dateB) - new Date(dateA);
    });

  // Handle printing recipe
  const handlePrintRecipe = (recipe) => {
    // Extract all ingredients and steps using the helper functions
    const ingredients = extractIngredients(recipe);
    const steps = extractSteps(recipe);
    
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    // Set the content with all ingredients and steps
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
        
        <!-- Disclaimer -->
        <div class="disclaimer">
          <p>⚠️ Recipe images are provided for reference only and may not exactly match the actual dish.</p>
        </div>
      </body>
      </html>
    `);
    
    // Trigger print after content loads
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  // Update the handleShareRecipe function to share full recipe details
  const handleShareRecipe = (recipe) => {
    // Extract recipe details
    const title = recipe.title || recipe.recipeName;
    const ingredients = extractIngredients(recipe);
    const steps = extractSteps(recipe);
    
    // Format detailed content for sharing
    const formattedIngredients = ingredients.map(ing => `• ${ing}`).join('\n');
    const formattedSteps = steps.map((step, i) => `${i+1}. ${step}`).join('\n');
    
    // Create comprehensive text
    const text = `📝 ${title}\n\n` +
      `📋 INGREDIENTS:\n${formattedIngredients}\n\n` +
      `👨‍🍳 INSTRUCTIONS:\n${formattedSteps}\n\n` +
      `From: NutriSift Recipe App`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text
        // Note: Not including URL so it's just the recipe content
      })
      .then(() => {
        console.log('Successfully shared');
        setSuccessMessage('Recipe shared successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((error) => {
        console.log('Error sharing:', error);
        // Fallback to clipboard if sharing fails
        fallbackToClipboard(title, text);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      fallbackToClipboard(title, text);
    }
  };

  // Update the fallback function to use the detailed content
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

  // Generate and download PDF
  const generatePDF = async (recipe) => {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    
    // Create a temporary container for the recipe
    const pdfContainer = document.createElement('div');
    pdfContainer.className = 'pdf-container';
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.width = '794px'; // A4 width
    
    // Get ingredients and steps
    const ingredients = extractIngredients(recipe);
    const steps = extractSteps(recipe);
    
    // Format the recipe for PDF
    pdfContainer.innerHTML = `
      <div class="pdf-content" style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
        <h1 style="color: #4f8cff; font-size: 28px; margin-bottom: 10px;">${recipe.title || recipe.recipeName}</h1>
        
        <div style="margin-bottom: 30px;">
          <p style="font-size: 16px; margin-bottom: 15px;"><strong>Nutritional Information:</strong></p>
          <ul style="list-style-type: none; padding-left: 10px; display: flex; flex-wrap: wrap; gap: 10px;">
            ${recipe.calories ? `<li style="background: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-size: 14px;">Calories: ${recipe.calories}</li>` : ''}
            ${recipe.diet ? `<li style="background: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-size: 14px;">Diet: ${recipe.diet}</li>` : ''}
            ${recipe.origin ? `<li style="background: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-size: 14px;">Origin: ${recipe.origin}</li>` : ''}
            ${recipe.course ? `<li style="background: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-size: 14px;">Course: ${recipe.course}</li>` : ''}
            ${recipe.cuisine ? `<li style="background: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-size: 14px;">Cuisine: ${recipe.cuisine}</li>` : ''}
          </ul>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4f8cff; font-size: 20px; margin-bottom: 15px;">Ingredients</h2>
          <ul style="padding-left: 20px;">
            ${ingredients.map(ingredient => `<li style="margin-bottom: 8px;">${ingredient}</li>`).join('')}
          </ul>
        </div>
        
        <div>
          <h2 style="color: #4f8cff; font-size: 20px; margin-bottom: 15px;">Instructions</h2>
          <ol style="padding-left: 20px;">
            ${steps.map(step => `<li style="margin-bottom: 12px;">${step}</li>`).join('')}
          </ol>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          Generated by NutriSift Recipe Finder | ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;
    
    document.body.appendChild(pdfContainer);
    
    try {
      // Create PDF
      const canvas = await html2canvas(pdfContainer.querySelector('.pdf-content'), {
        scale: 2,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'pt', 'a4');
      
      // Calculate dimensions to fit page
      const imgWidth = 595; // A4 width in pts
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename and save
      const fileName = `${(recipe.title || recipe.recipeName).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`;
      pdf.save(fileName);
      
    } finally {
      // Clean up
      if (document.body.contains(pdfContainer)) {
        document.body.removeChild(pdfContainer);
      }
    }
  };

  // Handle adding to grocery list
  const handleAddToGroceryList = (recipe) => {
    setLoading(true);
    
    try {
      // Extract ingredients from recipe
      const ingredients = extractIngredients(recipe);
      
      // Get current grocery list from localStorage
      const currentList = JSON.parse(localStorage.getItem('groceryItems') || '[]');
      
      // Create a list of ingredients to add
      const newIngredients = ingredients.map(ingredient => {
        // Try to parse ingredient to extract quantity and name
        const parts = ingredient.match(/^([\d./]+ \w+)?\s*(.+)/);
        
        if (parts) {
          const name = parts[2].trim();
          const quantity = parts[1] || '';
          
          // Check if ingredient already exists
          const existingIndex = currentList.findIndex(item => 
            item.name.toLowerCase() === name.toLowerCase()
          );
          
          if (existingIndex >= 0) {
            // Update existing item
            return {
              ...currentList[existingIndex],
              count: currentList[existingIndex].count + 1,
              meals: [...currentList[existingIndex].meals, recipe.title || recipe.recipeName]
            };
          }
          
          // Create new item
          return {
            name,
            quantity,
            category: categorizeIngredient(name),
            checked: false,
            count: 1,
            meals: [recipe.title || recipe.recipeName]
          };
        }
      }).filter(Boolean);
      
      // Find existing items to update and new items to add
      const existingItemsToUpdate = newIngredients.filter(ingredient => 
        currentList.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase())
      );
      
      const newItemsToAdd = newIngredients.filter(ingredient => 
        !currentList.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase())
      );
      
      // Update existing items
      const updatedList = currentList.map(item => {
        const matchingItem = existingItemsToUpdate.find(
          ingredient => ingredient.name.toLowerCase() === item.name.toLowerCase()
        );
        return matchingItem ? matchingItem : item;
      });
      
      // Add new items
      const finalList = [...updatedList, ...newItemsToAdd];
      
      // Sort ingredients by category
      const sortedList = finalList.sort((a, b) => 
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
      
      // Save to localStorage
      localStorage.setItem('groceryItems', JSON.stringify(sortedList));
      
      // Show success message
      alert(`${ingredients.length} ingredients added to grocery list!`);
      
    } catch (error) {
      console.error('Error adding to grocery list:', error);
      alert('Failed to add ingredients to grocery list');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to categorize ingredients
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

  // Helper functions to extract ingredients and steps from saved recipes
  const extractIngredients = (recipe) => {
    // If ingredients is an array, return it directly
    if (Array.isArray(recipe.ingredients)) {
      return recipe.ingredients;
    }
    
    // If ingredients is a string, split by newlines
    if (typeof recipe.ingredients === 'string') {
      return recipe.ingredients.split('\n').map(item => item.trim()).filter(Boolean);
    }
    
    // Try to extract from text
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
    // If steps is an array, return it directly
    if (Array.isArray(recipe.steps)) {
      return recipe.steps;
    }
    
    // If steps is a string, split by newlines
    if (typeof recipe.steps === 'string') {
      return recipe.steps.split('\n').map(item => item.trim()).filter(Boolean);
    }
    
    // Try to extract from text
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
        
        {/* Replace with component */}
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
                      // Use the extractSteps helper function to get properly formatted steps
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

      {/* Image Disclaimer - Add this before the success toast */}
      <div className="image-disclaimer">
        <p>
          <span className="disclaimer-icon">ℹ️</span> 
          Recipe images are provided for reference only and may not exactly match the actual dish.
        </p>
      </div>

      {/* Success Message Toast */}
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