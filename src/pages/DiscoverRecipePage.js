import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DiscoverRecipePage.css';
import HamburgerMenu from '../components/HamburgerMenu';

function DiscoverRecipePage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter states
  const [calorieRange, setCalorieRange] = useState('any');
  const [diet, setDiet] = useState('any');
  const [origin, setOrigin] = useState('any');
  const [course, setCourse] = useState('any');
  const [cuisine, setCuisine] = useState('any');
  
  // New state for the search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // Options for filter dropdowns
  const calorieRanges = [
    { value: 'any', label: 'Any Calories' },
    { value: 'under300', label: 'Under 300 calories' },
    { value: '300-500', label: '300-500 calories' },
    { value: '500-800', label: '500-800 calories' },
    { value: 'over800', label: 'Over 800 calories' }
  ];
  
  const dietOptions = [
    { value: 'any', label: 'Any Diet' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'low-carb', label: 'Low Carb' }
  ];
  
  const originOptions = [
    { value: 'any', label: 'Any Origin' },
    { value: 'italian', label: 'Italian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'indian', label: 'Indian' }, // Fixed: was using comma instead of colon
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'american', label: 'American' },
    { value: 'french', label: 'French' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'thai', label: 'Thai' }
  ];
  
  const courseOptions = [
    { value: 'any', label: 'Any Course' },
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'main', label: 'Main Course' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'soup', label: 'Soup' }
  ];
  
  const cuisineOptions = [
    { value: 'any', label: 'Any Cuisine' },
    { value: 'fusion', label: 'Fusion' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'modern', label: 'Modern' },
    { value: 'street', label: 'Street Food' },
    { value: 'gourmet', label: 'Gourmet' },
    { value: 'comfort', label: 'Comfort Food' },
    { value: 'healthy', label: 'Healthy' }
  ];
  
  // Remove the useEffect hook that automatically calls fetchRecipes
  
  // Updated fetchRecipes function - only called when search button is clicked
  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      // Prepare the filter parameters
      const params = {
        query: searchQuery.trim(),  // Add this line
        calorieRange,
        diet: diet === 'any' ? null : diet,
        origin: origin === 'any' ? null : origin,
        course: course === 'any' ? null : course,
        cuisine: cuisine === 'any' ? null : cuisine
      };
      
      // Make the API call to your backend
      const response = await fetch('http://localhost:8080/recipe/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the response data to match your UI expectations
      // Update the formattedRecipes creation in your fetchRecipes function
      const formattedRecipes = await Promise.all(data.map(async recipe => {
        // Get image URL with our custom function
        const imageUrl = recipe.imageUrl || await getRecipeImage(recipe);
        
        return {
          id: recipe.id,
          title: recipe.title,
          calories: recipe.calories ?? 'Not available',
          diet: recipe.diet ?? 'Not specified',
          origin: recipe.origin ?? 'Not specified',
          course: recipe.course ?? 'Not specified',
          cuisine: recipe.cuisine ?? 'Not specified',
          ingredients: Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : typeof recipe.ingredients === 'string'
              ? recipe.ingredients.split(',').map(item => item.trim())
              : [],
          steps: Array.isArray(recipe.steps) 
            ? recipe.steps 
            : typeof recipe.steps === 'string'
              ? recipe.steps.split('\n').map(item => item.trim())
              : [],
          prepTime: recipe.prepTime ?? 30,
          cookTime: recipe.cookTime ?? 45,
          image: imageUrl
        };
      }));
      
      setRecipes(formattedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to load recipes. Please try again.';
      setError(errorMessage);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Update the handleSaveRecipe function to include a timeout for the success message
  const handleSaveRecipe = async (recipe) => {
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userId) {
        setError('You must be logged in to save recipes');
        setTimeout(() => setError(null), 5000); // Updated to 5 seconds
        return false;
      }
      
      // Format recipe data for the API - use actual steps from the recipe
      const recipeData = {
        uid: userId,
        mail: userEmail || '',
        recipeName: recipe.title,
        ingredients: Array.isArray(recipe.ingredients) 
          ? recipe.ingredients.join('\n') 
          : recipe.ingredients,
        // Use actual steps from the recipe instead of placeholder text
        steps: Array.isArray(recipe.steps) 
          ? recipe.steps.join('\n') 
          : recipe.steps,
        calories: recipe.calories.toString(),
        diet: recipe.diet,
        origin: recipe.origin,
        course: recipe.course,
        cuisine: recipe.cuisine,
        prompt: "Discovered via recipe search"
      };
      
      // Make API call to save the recipe
      const response = await fetch('http://localhost:8080/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save recipe: ${response.status}`);
      }
      
      // Also save to localStorage for offline access with actual recipe data
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      
      // Check if recipe already exists
      if (savedRecipes.some(r => r.id === recipe.id)) {
        setSuccessMessage('Recipe already saved');
      } else {
        // Format steps for markdown display
        const stepsMarkdown = Array.isArray(recipe.steps)
          ? recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
          : typeof recipe.steps === 'string'
            ? recipe.steps.split('\n').map((step, index) => `${index + 1}. ${step.trim()}`).join('\n')
            : 'No instructions available';
        
        // Add new recipe with actual steps
        savedRecipes.push({
          id: recipe.id,
          title: recipe.title,
          text: `# ${recipe.title}\n\n**Nutritional & Recipe Information:**\n- Calories: ${recipe.calories}\n- Diet: ${recipe.diet}\n- Origin: ${recipe.origin}\n- Course: ${recipe.course}\n- Cuisine: ${recipe.cuisine}\n\n## Ingredients\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}\n\n## Instructions\n${stepsMarkdown}`,
          savedAt: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        
        setSuccessMessage('Recipe saved successfully!');
      }
      
      // Add this timeout to clear the success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError('Failed to save recipe. Please try again.');
      setTimeout(() => setError(null), 5000); // Updated to 5 seconds
      return false;
    }
  };
  
  // Replace the handleViewRecipe function with this version that doesn't save
  const handleViewRecipe = (recipe) => {
    try {
      // Create a recipe detail object with all necessary data
      const recipeDetail = {
        id: recipe.id,
        title: recipe.title,
        content: {
          calories: recipe.calories,
          diet: recipe.diet,
          origin: recipe.origin,
          course: recipe.course,
          cuisine: recipe.cuisine,
          ingredients: Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : typeof recipe.ingredients === 'string'
              ? recipe.ingredients.split(',').map(item => item.trim())
              : [],
          steps: Array.isArray(recipe.steps) 
            ? recipe.steps 
            : typeof recipe.steps === 'string'
              ? recipe.steps.split('\n').map(item => item.trim())
              : [],
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          image: recipe.image
        }
      };
      
      // Store the recipe detail in sessionStorage to be retrieved by the detail page
      // This ensures we have all data without saving to user's recipes
      sessionStorage.setItem('viewingRecipe', JSON.stringify(recipeDetail));
      
      // Navigate to the recipe detail page
      navigate(`/recipe/view/${recipe.id}`);
    } catch (error) {
      console.error('Error viewing recipe:', error);
      setError('Failed to view recipe details. Please try again.');
      setTimeout(() => setError(null), 5000); // Updated to 5 seconds
    }
  };
  
  const resetFilters = () => {
    setSearchQuery('');  // Add this line
    setCalorieRange('any');
    setDiet('any');
    setOrigin('any');
    setCourse('any');
    setCuisine('any');
  };
  
  
  
  // Handle printing recipe
  const handlePrintRecipe = (recipe) => {
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    // Set the content with image and disclaimer
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
          ${Array.isArray(recipe.ingredients) 
            ? recipe.ingredients.map(item => `<p>• ${item}</p>`).join('') 
            : `<p>${recipe.ingredients}</p>`}
        </div>
        
        <h2 class="section-title">Instructions</h2>
        <div>
          ${Array.isArray(recipe.steps) 
            ? recipe.steps.map((step, index) => `<p>${index + 1}. ${step}</p>`).join('') 
            : `<p>${recipe.steps}</p>`}
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
  
  // Handle adding to grocery list
  const handleAddToGroceryList = (recipe) => {
    setLoading(true);
    
    try {
      // Get current grocery list from localStorage
      const currentList = JSON.parse(localStorage.getItem('groceryItems') || '[]');
      
      // Create a list of ingredients to add
      const newIngredients = recipe.ingredients.map(ingredient => {
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
              meals: [...currentList[existingIndex].meals, recipe.title]
            };
          }
          
          // Create new item
          return {
            name,
            quantity,
            category: categorizeIngredient(name),
            checked: false,
            count: 1,
            meals: [recipe.title]
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
      setSuccessMessage(`${recipe.ingredients.length} ingredients added to grocery list!`);
      setTimeout(() => setSuccessMessage(''), 5000); // Updated to 5 seconds
      
    } catch (error) {
      console.error('Error adding to grocery list:', error);
      setError('Failed to add ingredients to grocery list');
      setTimeout(() => setError(null), 3000);
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
  
  // Add this function to use a more reliable and legal image source
  const getRecipeImage = async (recipe) => {
    try {
      // Create search queries in order of preference
      const searchQueries = [
        // First try specific search with title + cuisine + course
        `${recipe.title} ${recipe.cuisine} ${recipe.course} food`,
        // Then try with just title + cuisine
        `${recipe.title} ${recipe.cuisine} food`,
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
        
        // If we didn't find any images, we'll try the next query
        console.log(`No images found for query: ${query}, trying next...`);
      }
      
      // If all searches failed, use a food-themed placeholder
      console.log('All image searches failed, using placeholder');
      return `https://via.placeholder.com/600x400/1a2235/ffffff?text=${encodeURIComponent(recipe.title)}`;
    } catch (error) {
      console.error('Error fetching recipe image:', error);
      // Fallback to a food placeholder
      return `https://via.placeholder.com/600x400/1a2235/ffffff?text=${encodeURIComponent(recipe.title)}`;
    }
  };
  
  // Update these functions in both DiscoverRecipePage.js and SavedRecipesPage.js
  const handleShareViaEmail = (recipe) => {
    const subject = encodeURIComponent(`Check out this recipe: ${recipe.title}`);
    const body = encodeURIComponent(
      `I found this amazing recipe for ${recipe.title}!\n\n` +
      `Calories: ${recipe.calories} cal\n` +
      `Diet: ${recipe.diet}\n` +
      `Origin: ${recipe.origin}\n` +
      `Course: ${recipe.course}\n` +
      `Cuisine: ${recipe.cuisine}\n\n` +
      `View the full recipe at: ${window.location.origin}/recipe/${recipe.id}\n\n` +
      `Note: Recipe images are provided for reference only and may not exactly match the actual dish.`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareDialog(false);
  };

  const handleCopyLink = (recipe) => {
    // Create a shareable link with image reference
    const shareText = `Check out this ${recipe.title} recipe! ${window.location.origin}/recipe/${recipe.id}\n\nNote: Recipe images are provided for reference only and may not exactly match the actual dish.`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        setSuccessMessage('Link copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowShareDialog(false);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const handleShareViaWhatsApp = (recipe) => {
    const text = encodeURIComponent(
      `Check out this recipe for ${recipe.title}! ${window.location.origin}/recipe/${recipe.id}\n\nNote: Recipe images are provided for reference only and may not exactly match the actual dish.`
    );
    
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareDialog(false);
  };
  
  // Helper functions to extract ingredients and steps from recipes
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

  // Add the fallback function
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
  
  return (
    <div className="discover-recipe-page">
      <header className="discover-header">
        <h1>🔍 Discover Recipes</h1>
        <HamburgerMenu isLoggedIn={true} />
      </header>
      
      <div className="filters-section">
        <h2>Advanced Filters</h2>
        <div className="filter-grid">
          <div className="filter-group search-group">
            <label htmlFor="search-query">Search Recipes</label>
            <div className="search-input-wrapper">
              <input
                id="search-query"
                type="text"
                placeholder="Enter keywords (e.g., 'pasta', 'vegetarian dinner')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchRecipes()}
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label htmlFor="calorie-filter">Calories</label>
            <select 
              id="calorie-filter" 
              value={calorieRange} 
              onChange={(e) => setCalorieRange(e.target.value)}
            >
              {calorieRanges.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="diet-filter">Diet</label>
            <select 
              id="diet-filter" 
              value={diet} 
              onChange={(e) => setDiet(e.target.value)}
            >
              {dietOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="origin-filter">Origin</label>
            <select 
              id="origin-filter" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)}
            >
              {originOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="course-filter">Course</label>
            <select 
              id="course-filter" 
              value={course} 
              onChange={(e) => setCourse(e.target.value)}
            >
              {courseOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="cuisine-filter">Cuisine Style</label>
            <select 
              id="cuisine-filter" 
              value={cuisine} 
              onChange={(e) => setCuisine(e.target.value)}
            >
              {cuisineOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="search-buttons">
            <button 
              className={`search-recipes-button ${loading ? 'loading' : ''}`}
              onClick={fetchRecipes}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Recipes'}
            </button>
            
            <button 
              className="reset-filters-button"
              onClick={resetFilters}
              disabled={loading}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {hasSearched && (
        <div className="recipes-container">
          <h2>Search Results</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Finding recipes...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchRecipes}>Try Again</button>
            </div>
          ) : recipes.length === 0 ? (
            <div className="no-results">
              <p>No recipes found matching your criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="recipe-grid">
              {recipes.map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-image">
                    <img src={recipe.image} alt={recipe.title} />
                    {/* Remove the course badge from here */}
                    {/* <div className="recipe-course-badge">{recipe.course}</div> */}
                  </div>
                  <div className="recipe-content">
                    <h3>{recipe.title}</h3>
                    <div className="recipe-metadata">
                      <span className="recipe-calories">{recipe.calories} cal</span>
                      <span className="recipe-diet">{recipe.diet}</span>
                      <span className="recipe-origin">{recipe.origin}</span>
                      {/* Add the course badge here */}
                      {recipe.course && <span className="recipe-course">{recipe.course}</span>}
                    </div>
                    <div className="recipe-cuisine">{recipe.cuisine} cuisine</div>
                    <div className="recipe-time">
                      <span>Prep: {recipe.prepTime} min</span>
                      <span>Cook: {recipe.cookTime} min</span>
                    </div>
                    <div className="recipe-steps-preview">
                      <h4>Steps Preview:</h4>
                      <p>{recipe.steps.length > 0 
                        ? (recipe.steps[0].length > 100 
                          ? recipe.steps[0].substring(0, 100) + '...' 
                          : recipe.steps[0]) 
                        : 'No steps available'}</p>
                    </div>
                    <div className="recipe-actions">
                      <button 
                        className="view-recipe-button"
                        onClick={() => handleViewRecipe(recipe)}
                      >
                        View
                      </button>
                      <button 
                        className="save-recipe-button"
                        onClick={() => handleSaveRecipe(recipe)}
                      >
                        <span className="action-icon">💾</span>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recipes.length > 0 && (
            <div className="image-disclaimer">
              <p>
                <span className="disclaimer-icon">ℹ️</span> 
                Recipe images are provided for reference only and may not exactly match the actual dish.
              </p>
            </div>
          )}
        </div>
      )}
      
      {successMessage && (
        <div className="success-toast">
          <span className="toast-icon">✅</span>
          <span className="toast-message">{successMessage}</span>
        </div>
      )}
      
      {/* Share Recipe Dialog */}
      {showShareDialog && (
        <div className="share-dialog">
          <div className="share-dialog-content">
            <div className="share-dialog-header">
              <h3>Share Recipe</h3>
              <button 
                className="share-dialog-close"
                onClick={() => setShowShareDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="share-dialog-body">
              <p>Share this delicious recipe with friends and family:</p>
              
              {/* Recipe preview */}
              <div className="share-recipe-preview">
                <img src={selectedRecipe?.image} alt={selectedRecipe?.title} />
                <h4>{selectedRecipe?.title}</h4>
              </div>
              
              {/* Disclaimer */}
              <div className="share-recipe-disclaimer">
                <p>⚠️ Recipe images are provided for reference only and may not exactly match the actual dish.</p>
              </div>
              
              <div className="share-options">
                <button 
                  className="share-option-btn email-btn"
                  onClick={() => handleShareViaEmail(selectedRecipe)}
                >
                  <span className="share-icon">📧</span>
                  Email
                </button>
                <button 
                  className="share-option-btn copy-btn"
                  onClick={() => handleCopyLink(selectedRecipe)}
                >
                  <span className="share-icon">📋</span>
                  Copy Link
                </button>
                <button 
                  className="share-option-btn whatsapp-btn"
                  onClick={() => handleShareViaWhatsApp(selectedRecipe)}
                >
                  <span className="share-icon">📱</span>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiscoverRecipePage;
