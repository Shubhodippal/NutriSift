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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_RECIPE_SEARCH_ENDPOINT}`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_RECIPES_ENDPOINT}/save`, {
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
  
  // Update the handleAddToGroceryList function to use API
  const handleAddToGroceryList = async (recipe) => {
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userId || !userEmail) {
        setError('You must be logged in to add items to your grocery list');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Get current grocery list
      let currentList = [];
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
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
      
      // Extract ingredient names and prepare for batch categorization
      const ingredientNames = [];
      const ingredientsData = [];
      
      recipe.ingredients.forEach(ingredient => {
        const parts = ingredient.match(/^([\d./]+ \w+)?\s*(.+)/);
        if (parts) {
          const name = parts[2].trim();
          const quantity = parts[1] || '';
          ingredientNames.push(name);
          ingredientsData.push({ name, quantity });
        }
      });
      
      // Batch categorize all ingredients
      const categories = "other";
      
      // Create new ingredients with categories
      const newIngredients = ingredientsData.map(({ name, quantity }) => {
        const existingIndex = currentList.findIndex(item => 
          item.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          const existingItem = currentList[existingIndex];
          // Ensure meals is an array before spreading
          const meals = Array.isArray(existingItem.meals) ? existingItem.meals : [];
          
          return {
            ...existingItem,
            count: (existingItem.count || 0) + 1,
            meals: [...meals, recipe.title]
          };
        }
        
        return {
          name,
          quantity,
          category: categories[name] || 'Other',
          checked: false,
          count: 1,
          meals: [recipe.title]
        };
      });
      
      // Process items
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
      
      // Save to API
      try {
        const saveResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: sortedList })
        });
        
        if (!saveResponse.ok) {
          console.error('Error saving to API:', await saveResponse.text());
        }
      } catch (saveError) {
        console.error('Error saving grocery list to API:', saveError);
      }
      
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
  
  // Replace the handleShareRecipe function with this version that shares via email, link, or WhatsApp
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
   
  // Get recipe image function
const getRecipeImage = async (recipe) => {
  // If recipe already has an image, use it
  if (recipe.image) return recipe.image;
  
  try {
    // Attempt to get an image from Pixabay based on recipe title
    const query = encodeURIComponent(recipe.title);
    const response = await fetch(
      `${process.env.REACT_APP_PIXABAY_API_URL}/?key=${process.env.REACT_APP_PIXABAY_API_KEY}&q=${query}&image_type=photo&category=food&per_page=3`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const data = await response.json();
    
    // Return the first image if available, otherwise use a placeholder
    if (data.hits && data.hits.length > 0) {
      return data.hits[0].webformatURL;
    }
    
    // Fallback to placeholder
    return `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/400x300?text=No+Image+Available`;
  } catch (error) {
    console.error('Error fetching recipe image:', error);
    return `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/400x300?text=No+Image+Available`;
  }
};

// Extract ingredients function
const extractIngredients = (recipe) => {
  if (!recipe) return [];
  
  // Check if recipe has ingredients as an array
  if (Array.isArray(recipe.ingredients)) {
    return recipe.ingredients;
  }
  
  // Check if recipe has ingredients as a string
  if (typeof recipe.ingredients === 'string') {
    return recipe.ingredients.split(',').map(item => item.trim());
  }
  
  // Try to extract from recipe.text if available (for saved recipes)
  if (recipe.text) {
    const ingredientsMatch = recipe.text.match(/## Ingredients\n([\s\S]*?)(?=\n## |$)/);
    if (ingredientsMatch && ingredientsMatch[1]) {
      return ingredientsMatch[1]
        .split('\n')
        .map(line => line.replace(/^- /, '').trim())
        .filter(Boolean);
    }
  }
  
  // Check if in recipeData (for saved recipes)
  if (recipe.recipeData && recipe.recipeData.ingredients) {
    return Array.isArray(recipe.recipeData.ingredients) 
      ? recipe.recipeData.ingredients 
      : recipe.recipeData.ingredients.split(',').map(item => item.trim());
  }
  
  return [];
};

// Extract steps function
const extractSteps = (recipe) => {
  if (!recipe) return [];
  
  // Check if recipe has steps as an array
  if (Array.isArray(recipe.steps)) {
    return recipe.steps;
  }
  
  // Check if recipe has steps as a string
  if (typeof recipe.steps === 'string') {
    return recipe.steps.split('\n').map(item => item.trim()).filter(Boolean);
  }
  
  // Try to extract from recipe.text if available (for saved recipes)
  if (recipe.text) {
    const stepsMatch = recipe.text.match(/## Instructions\n([\s\S]*?)(?=\n## |$)/);
    if (stepsMatch && stepsMatch[1]) {
      return stepsMatch[1]
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);
    }
  }
  
  // Check if in recipeData (for saved recipes)
  if (recipe.recipeData && recipe.recipeData.steps) {
    return Array.isArray(recipe.recipeData.steps) 
      ? recipe.recipeData.steps 
      : recipe.recipeData.steps.split('\n').map(item => item.trim()).filter(Boolean);
  }
  
  return [];
};

// Handle share via email function
const handleShareViaEmail = (recipe) => {
  if (!recipe) return;
  
  const ingredients = extractIngredients(recipe);
  const steps = extractSteps(recipe);
  
  // Format ingredients and steps for email
  const formattedIngredients = ingredients.map(ing => `• ${ing}`).join('%0D%0A');
  const formattedSteps = steps.map((step, i) => `${i+1}. ${step}`).join('%0D%0A');
  
  // Create email subject and body
  const subject = `Recipe: ${recipe.title || recipe.recipeName}`;
  const body = `Check out this recipe!%0D%0A%0D%0A` +
    `${recipe.title || recipe.recipeName}%0D%0A%0D%0A` +
    `INGREDIENTS:%0D%0A${formattedIngredients}%0D%0A%0D%0A` +
    `INSTRUCTIONS:%0D%0A${formattedSteps}%0D%0A%0D%0A` +
    `From: NutriSift Recipe App`;
  
  // Open mail client
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
  
  // Close dialog
  setShowShareDialog(false);
  
  // Show success message
  setSuccessMessage('Email client opened!');
  setTimeout(() => setSuccessMessage(''), 3000);
};

// Handle copy link function
const handleCopyLink = (recipe) => {
  if (!recipe) return;
  
  // In a real app, you'd generate a shareable link
  // For this implementation, we'll just copy the recipe details to clipboard
  
  const ingredients = extractIngredients(recipe);
  const steps = extractSteps(recipe);
  
  // Format ingredients and steps
  const formattedIngredients = ingredients.map(ing => `• ${ing}`).join('\n');
  const formattedSteps = steps.map((step, i) => `${i+1}. ${step}`).join('\n');
  
  // Create text to copy
  const textToCopy = `${recipe.title || recipe.recipeName}\n\n` +
    `INGREDIENTS:\n${formattedIngredients}\n\n` +
    `INSTRUCTIONS:\n${formattedSteps}\n\n` +
    `From: NutriSift Recipe App`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // Close dialog
      setShowShareDialog(false);
      
      // Show success message
      setSuccessMessage('Recipe copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      setError('Failed to copy recipe to clipboard');
      setTimeout(() => setError(null), 3000);
    });
};

// Handle share via WhatsApp function
const handleShareViaWhatsApp = (recipe) => {
  if (!recipe) return;
  
  const ingredients = extractIngredients(recipe);
  const steps = extractSteps(recipe);
  
  // Format ingredients and steps for WhatsApp
  const formattedIngredients = ingredients.map(ing => `• ${ing}`).join('\n');
  const formattedSteps = steps.map((step, i) => `${i+1}. ${step}`).join('\n');
  
  // Create text to share
  const textToShare = `*${recipe.title || recipe.recipeName}*\n\n` +
    `*INGREDIENTS:*\n${formattedIngredients}\n\n` +
    `*INSTRUCTIONS:*\n${formattedSteps}\n\n` +
    `From: NutriSift Recipe App`;
  
  // Open WhatsApp with the recipe
  const whatsappUrl = `${process.env.REACT_APP_WHATSAPP_SHARE_URL}/?text=${encodeURIComponent(textToShare)}`;
  window.open(whatsappUrl, '_blank');
  
  // Close dialog
  setShowShareDialog(false);
  
  // Show success message
  setSuccessMessage('Opening WhatsApp...');
  setTimeout(() => setSuccessMessage(''), 3000);
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
