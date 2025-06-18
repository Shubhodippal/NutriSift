import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalizedMealPlannerPage.css';
import HamburgerMenu from '../components/HamburgerMenu';

// Helper function to fetch recipe images from Pixabay
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
    
    // Return a placeholder image URL
    return `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/300x200/1a2235/ffffff?text=${encodeURIComponent(recipe.title)}`;
  } catch (error) {
    console.error('Error fetching recipe image:', error);
    return `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/300x200/1a2235/ffffff?text=${encodeURIComponent(recipe.title)}`;
  }
};

function PersonalizedMealPlannerPage() {
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [recipeImages, setRecipeImages] = useState({});
  const [addingToGroceryList, setAddingToGroceryList] = useState(false);
  const [orientation, setOrientation] = useState(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const decodeJWT = (token) => {
    try {
      const [, payloadEncoded] = token.split('.');
      const payload = JSON.parse(atob(payloadEncoded));
      return payload;
    } catch (err) {
      console.error("Invalid JWT token:", err);
      return null;
    }
  };

  const fetchMealPlans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view meal plans');
        setLoading(false);
        return;
      }
      
      const decoded = decodeJWT(token);
      const userId = decoded?.userId;
      const userEmail = decoded?.email;

      if (!userId || !userEmail) {
        setError('User information is missing');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipe/meal-plans/${userId}/${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the response contains an error message or empty plans
      if (data.message && data.message.includes("No meal plans found")) {
        setMealPlans([]);
      } else {
        setMealPlans(data);
        
        if (data.length > 0) {
          setSuccessMessage('Meal plans fetched successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      }
      
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      setError('Failed to fetch meal plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load recipe images when meal plans change or selected plan changes
  useEffect(() => {
    const loadRecipeImages = async () => {
      if (mealPlans.length === 0 || !mealPlans[selectedPlanIndex]) return;
      
      const selectedPlan = mealPlans[selectedPlanIndex];
      const weeklyPlan = selectedPlan.meal_plan?.weeklyPlan || 
                        selectedPlan.mealPlan?.weeklyPlan || [];
      
      const newImages = { ...recipeImages };
      let imagesUpdated = false;
      
      // Fetch images for all meals in the selected plan
      for (const day of weeklyPlan) {
        if (day.meals && Array.isArray(day.meals)) {
          for (const meal of day.meals) {
            // Only fetch if we don't already have the image
            const recipeKey = `${meal.title}-${meal.type}`;
            if (!newImages[recipeKey] && !meal.image) {
              newImages[recipeKey] = await getRecipeImage(meal);
              imagesUpdated = true;
            }
          }
        }
      }
      
      if (imagesUpdated) {
        setRecipeImages(newImages);
      }
    };

    loadRecipeImages();
  }, [mealPlans, selectedPlanIndex]);

  // Optimize the generate meal plan function to properly handle the backend response
  const generateMealPlan = async () => {
    setGenerateLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to generate a meal plan');
        setGenerateLoading(false);
        return;
      }
      
      const decoded = decodeJWT(token);
      const userId = decoded?.userId;
      const userEmail = decoded?.email;

      if (!userId || !userEmail) {
        setError('User information is missing');
        setGenerateLoading(false);
        return;
      }
      
      // Match the exact parameter names expected by the backend
      const params = {
        uid: userId,
        mail: userEmail
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipe/meal-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
        },
        body: JSON.stringify(params)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Handle specific error messages from backend
        const errorMessage = typeof responseData === 'string' 
          ? responseData 
          : responseData.error || `Failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      // Fetch updated meal plans immediately after generating
      await fetchMealPlans();
      setSuccessMessage('New meal plan generated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setError(`Failed to generate meal plan: ${error.message}`);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleViewRecipe = (recipe) => {
    try {
      // Get the image from our cached images or use the one from the recipe
      const recipeKey = `${recipe.title}-${recipe.type}`;
      const recipeImage = recipe.image || recipeImages[recipeKey] ;
      
      // Format recipe data for the detail page
      const recipeDetail = {
        id: recipe.id || Date.now(), // Use timestamp as fallback ID
        title: recipe.title,
        content: {
          calories: recipe.calories,
          diet: recipe.diet,
          origin: recipe.origin ? 
            (typeof recipe.origin === 'object' ? `${recipe.origin.country}, ${recipe.origin.region}` : recipe.origin) : 
            '',
          course: recipe.type,
          cuisine: recipe.origin ? 
            (typeof recipe.origin === 'object' ? recipe.origin.country : recipe.origin) : 
            '',
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
          steps: Array.isArray(recipe.instructions) ? recipe.instructions : [],
          prepTime: recipe.prepTime || "15 mins",
          cookTime: recipe.cookTime || "20 mins",
          image: recipeImage
        }
      };
      
      sessionStorage.setItem('viewingRecipe', JSON.stringify(recipeDetail));
      navigate(`/recipe/view/${recipeDetail.id}`);
      
    } catch (error) {
      console.error('Error viewing recipe:', error);
      setError('Failed to view recipe details. Please try again.');
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      const token = localStorage.getItem('token');
      const decoded = decodeJWT(token);

      const userId = decoded.userId;
      const userEmail = decoded.email;
      
      if (!userId) {
        setError('You must be logged in to save recipes');
        setTimeout(() => setError(''), 5000);
        return false;
      }
      console.log('Saving recipe for user:', userId, userEmail, recipe.title);
      const recipeDetail = {
        uid: userId,
        mail: userEmail,
        recipeName: recipe.title,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : (recipe.ingredients || 'No ingredients specified'),
        steps: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : [],
        calories: recipe.calories,
        diet: recipe.diet,
        origin: recipe.origin ? (typeof recipe.origin === 'object' ? `${recipe.origin.country}, ${recipe.origin.region}` : recipe.origin) : 'None',
        course: recipe.type,
        cuisine: recipe.origin ? (typeof recipe.origin === 'object' ? recipe.origin.country : recipe.origin) : 'None',
        prompt: 'Meal Plan Recipe'
      };
      
      console.log('Saving recipe data:', recipeDetail);
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipe/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
        },
        body: JSON.stringify(recipeDetail)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save recipe: ${response.status}`);
      }
      
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      
      if (savedRecipes.some(r => r.id === recipe.id)) {
        setSuccessMessage('Recipe already saved');
      } else {
        const stepsMarkdown = Array.isArray(recipe.steps)
          ? recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
          : typeof recipe.steps === 'string'
            ? recipe.steps.split('\n').map((step, index) => `${index + 1}. ${step.trim()}`).join('\n')
            : 'No instructions available';
        
        savedRecipes.push({
          id: recipe.id,
          title: recipe.title,
          text: `# ${recipe.title}\n\n**Nutritional & Recipe Information:**\n- Calories: ${recipe.calories}\n- Diet: ${recipe.diet}\n- Origin: ${recipe.origin}\n- Course: ${recipe.course}\n- Cuisine: ${recipe.cuisine}\n\n## Ingredients\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}\n\n## Instructions\n${stepsMarkdown}`,
          savedAt: new Date().toISOString()
        });
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        
        setSuccessMessage('Recipe saved successfully!');
      }
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
      return true;
    } catch (error) {
      console.error('Error saving recipe:', error);
      return false;
    }
  };

  const handlePrintRecipe = (meal) => {
    const printWindow = window.open('', '_blank');
    
    const recipeTitle = meal.title || "Recipe";
    const imageUrl = getMealImageUrl(meal);
    
    // Generate text content from meal properties
    const ingredientsList = Array.isArray(meal.ingredients) 
      ? meal.ingredients.map(ing => `<li>${ing}</li>`).join('') 
      : '<li>No ingredients available</li>';
      
    const instructionsList = Array.isArray(meal.instructions) 
      ? meal.instructions.map((step, index) => `<li>${index + 1}. ${step}</li>`).join('') 
      : '<li>No instructions available</li>';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipeTitle}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 {
              font-size: 24pt;
              color: #2c5282;
              border-bottom: 2px solid #4299e1;
              padding-bottom: 10px;
            }
            .recipe-image {
              width: 100%;
              max-height: 300px;
              object-fit: cover;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            h2 {
              font-size: 16pt;
              color: #2c5282;
              margin-top: 20px;
            }
            ul, ol {
              padding-left: 25px;
            }
            li {
              margin-bottom: 8px;
            }
            .footer {
              margin-top: 30px;
              font-size: 10pt;
              color: #718096;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
            }
            .disclaimer {
              font-style: italic;
              color: #718096;
              font-size: 10pt;
              margin-top: 10px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <h1>${recipeTitle}</h1>
          ${imageUrl ? `<img src="${imageUrl}" alt="${recipeTitle}" class="recipe-image" />` : ''}
          
          <h2>Nutritional & Recipe Information:</h2>
          <ul>
            <li>Calories: ${meal.calories || 'Not specified'}</li>
            <li>Diet: ${meal.diet || 'Not specified'}</li>
            <li>Type: ${meal.type || 'Not specified'}</li>
            ${meal.origin ? `<li>Origin: ${typeof meal.origin === 'object' ? 
              `${meal.origin.country}, ${meal.origin.region}` : meal.origin}</li>` : ''}
          </ul>

          <h2>Ingredients</h2>
          <ul>
            ${ingredientsList}
          </ul>

          <h2>Instructions</h2>
          <ol>
            ${instructionsList}
          </ol>
            
          <div class="disclaimer">
            ⚠️ Recipe image is provided for reference only and may not exactly match the actual dish.
          </div>
          <div class="footer">
            Generated by NutriSift | ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleShareRecipe = async (meal, event) => {
    if (event) event.stopPropagation(); // Prevent click event from bubbling
    
    const recipeTitle = meal.title || "Untitled Recipe";
    
    // Format ingredients as a string
    const ingredientsText = Array.isArray(meal.ingredients) 
      ? meal.ingredients.map(ing => `• ${ing}`).join('\n')
      : 'No ingredients available';
    
    // Format instructions as a string
    const instructionsText = Array.isArray(meal.instructions) 
      ? meal.instructions.map((step, i) => `${i+1}. ${step}`).join('\n')
      : 'No instructions available';
    
    // Create a formatted text to share
    const shareText = `📝 ${recipeTitle}\n\n` +
      `📋 INGREDIENTS:\n${ingredientsText}\n\n` +
      `👨‍🍳 INSTRUCTIONS:\n${instructionsText}\n\n` +
      `From: NutriSift Recipe App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipeTitle,
          text: shareText
        });
        
        setSuccessMessage('Recipe shared successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error sharing:', error);
        if (error.name !== 'AbortError') {
          fallbackToClipboard(recipeTitle, shareText);
        }
      }
    } else {
      fallbackToClipboard(recipeTitle, shareText);
    }
  };

  const fallbackToClipboard = async (title, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('Recipe copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setError('Could not copy recipe. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddToGroceryList = async (meal, event) => {
    if (event) event.stopPropagation(); // Prevent click event from bubbling
    
    const recipeTitle = meal.title || "Untitled Recipe";
    
    // Parse ingredients regardless of format
    let ingredients = [];
    if (Array.isArray(meal.ingredients)) {
      ingredients = meal.ingredients;
    } else if (typeof meal.ingredients === 'string') {
      ingredients = meal.ingredients.split('\n').map(line => line.trim()).filter(Boolean);
    }
    
    if (ingredients.length === 0) {
      setError('No ingredients found in recipe');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setAddingToGroceryList(true);
    
    try {
      const token = localStorage.getItem('token');
      const decoded = decodeJWT(token);
      
      const userId = decoded.userId;
      const userEmail = decoded.email;
      
      if (!userId || !userEmail) {
        setError('You must be logged in to add items to your grocery list');
        setTimeout(() => setError(''), 3000);
        setAddingToGroceryList(false);
        return;
      }
      
      // Get current grocery list - use GET method or fall back to localStorage
      let currentList = [];
      try {
        // Use GET method to retrieve the list
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
          // Fallback to localStorage if API fails
          currentList = JSON.parse(localStorage.getItem('groceryItems') || '[]');
        }
      } catch (fetchError) {
        console.error('Error fetching grocery list:', fetchError);
        currentList = JSON.parse(localStorage.getItem('groceryItems') || '[]');
      }
      
      // Process ingredients into structured data
      const ingredientData = ingredients.map(ingredient => {
        const parts = ingredient.match(/^([\d./]+ \w+)?\s*(.+)/);
        const quantity = parts && parts[1] ? parts[1] : '';
        const name = parts && parts[2] ? parts[2] : ingredient;
        
        return {
          name: name,
          quantity: quantity,
          category: 'Other',
          checked: false,
          count: 1,
          meals: [recipeTitle]
        };
      });
      
      // Merge new items with existing items
      const mergedItems = [...currentList];
      
      ingredientData.forEach(newItem => {
        const existingIndex = mergedItems.findIndex(item => 
          item.name.toLowerCase() === newItem.name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          // Update existing item
          mergedItems[existingIndex].count++;
          // Ensure meals array exists
          if (!mergedItems[existingIndex].meals) {
            mergedItems[existingIndex].meals = [];
          }
          // Add recipe to meals if not already included
          if (!mergedItems[existingIndex].meals.includes(recipeTitle)) {
            mergedItems[existingIndex].meals.push(recipeTitle);
          }
        } else {
          // Add new item
          mergedItems.push(newItem);
        }
      });
      
      // Sort items by category and name
      const sortedItems = mergedItems.sort((a, b) => {
        const categoryA = a.category || 'Other';
        const categoryB = b.category || 'Other';
        const nameA = a.name || '';
        const nameB = b.name || '';
        
        return categoryA.localeCompare(categoryB) || nameA.localeCompare(nameB);
      });
      
      // Save to local storage for immediate feedback
      localStorage.setItem('groceryItems', JSON.stringify(sortedItems));
      
      // Save to backend with the correct endpoint structure
      try {
        // Use the endpoint exactly as defined in your backend: /grocerylist/{userId}/{email}
        const saveResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}/${userEmail}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY 
          },
          // Match the expected GroceryListRequest format
          body: JSON.stringify({ items: sortedItems })
        });
        
        if (!saveResponse.ok) {
          throw new Error(`Server error: ${saveResponse.status}`);
        }
        
        // Process successful response
        const responseData = await saveResponse.json();
        if (responseData.success) {
          // Update local storage with the server's version
          if (responseData.items) {
            localStorage.setItem('groceryItems', JSON.stringify(responseData.items));
          }
        }
      } catch (saveError) {
        console.error('Error saving grocery list to API:', saveError);
        // Continue since we've already saved to localStorage as a fallback
      }
      
      setSuccessMessage(`${ingredients.length} ingredients added to grocery list!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error adding to grocery list:', error);
      setError('Error adding ingredients to grocery list');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAddingToGroceryList(false);
    }
  };

  // Fetch meal plans on component mount
  useEffect(() => {
    fetchMealPlans();
  }, []);

  // Add this useEffect to handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
    };
    
    // Listen for resize events which happen during orientation changes
    window.addEventListener('resize', handleOrientationChange);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Helper functions for displaying data
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
        // Removed hour and minute to hide time
      });
    } catch (error) {
      return dateString;
    }
  };

  // Function to get a meal description or placeholder
  const getMealDescription = (meal) => {
    if (meal.description) return meal.description;
    
    if (Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
      const firstThreeIngredients = meal.ingredients.slice(0, 3);
      return `Features ${firstThreeIngredients.join(', ')}${meal.ingredients.length > 3 ? ' and more.' : '.'}`;
    }
    
    return `A delicious ${meal.type.toLowerCase()} option.`;
  };

  // Function to get the image URL for a meal
  const getMealImageUrl = (meal) => {
    const recipeKey = `${meal.title}-${meal.type}`;
    if (meal.image) return meal.image;
    if (recipeImages[recipeKey]) return recipeImages[recipeKey];
  };

  // Get the current meal plan
  const currentPlan = mealPlans[selectedPlanIndex];
  const weeklyPlan = currentPlan?.meal_plan?.weeklyPlan || 
                     currentPlan?.mealPlan?.weeklyPlan || [];

  // Add this new function to delete a meal plan
  const handleDeleteMealPlan = async () => {
    if (!currentPlan) {
      setError('Cannot delete: No meal plan selected');
      return;
    }
    
    // Extract the numerical ID as expected by the backend
    // The backend requires an integer ID
    const planId = currentPlan.id || 
                  (currentPlan._id && !isNaN(parseInt(currentPlan._id, 10)) ? 
                   parseInt(currentPlan._id, 10) : null);
    
    if (planId === null) {
      setError('Cannot delete: Invalid meal plan ID format');
      return;
    }
    
    setDeleteLoading(true);
    setError(null);
    
    try {
      console.log(`Deleting meal plan with ID: ${planId}`);
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipe/del_meal-plan/${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
        }
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `Failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      // Remove the deleted plan from state
      const updatedPlans = mealPlans.filter(plan => {
        const currentId = plan.id || plan._id;
        return currentId != planId; // Use loose equality to compare numeric and string IDs
      });
      
      setMealPlans(updatedPlans);
      
      // Reset selected index if needed
      if (updatedPlans.length <= selectedPlanIndex) {
        setSelectedPlanIndex(Math.max(0, updatedPlans.length - 1));
      }
      
      setSuccessMessage(responseData.message || 'Meal plan deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      setError(`Failed to delete meal plan: ${error.message}`);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Add a confirmation dialog component
  const DeleteConfirmationDialog = () => (
    <div className="confirmation-dialog">
      <div className="confirmation-content">
        <h3>Delete Meal Plan</h3>
        <p>Are you sure you want to delete this meal plan? This action cannot be undone.</p>
        <div className="confirmation-actions">
          <button 
            className="action-button secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </button>
          <button 
            className="action-button danger"
            onClick={handleDeleteMealPlan}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

  // Add this new function to handle printing the entire meal plan
  const handlePrintMealPlan = () => {
    if (!currentPlan || weeklyPlan.length === 0) {
      setError("No meal plan available to print");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const printWindow = window.open('', '_blank');
    const planDate = formatDate(currentPlan.created_at || currentPlan.createdAt);
    const planId = currentPlan.id || currentPlan._id || 'Unknown';
    
    // Start building HTML content for the meal plan
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Meal Plan ${planId}</title>
          <style>
            /* Critical fix: Reset margins and ensure no blank pages */
            html, body {
              margin: 0 !important;
              padding: 0 !important;
            }
            
            @page {
              margin: 0.5cm !important;
              size: auto;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              max-width: 100%;
              color: #333;
              padding-top: 0 !important;
            }
            
            .page-content {
              padding: 10px;
              max-width: 900px;
              margin: 0 auto;
            }
            
            h1 {
              font-size: 24pt;
              color: #2c5282;
              border-bottom: 2px solid #4299e1;
              padding-bottom: 10px;
              text-align: center;
              margin-top: 0;
              padding-top: 0;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
            }
            
            .plan-info {
              text-align: center;
              margin-bottom: 20px;
              font-size: 12pt;
              color: #555;
              page-break-before: avoid !important;
            }
            
            /* Rest of your styles... */
            .day-container {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .day-header {
              background-color: #ebf4ff;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 15px;
              font-size: 18pt;
              font-weight: bold;
              color: #2b6cb0;
            }
            .meal-container {
              margin-bottom: 25px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              page-break-inside: avoid;
            }
            .meal-header {
              font-size: 16pt;
              font-weight: bold;
              color: #2c5282;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
            }
            .meal-type {
              font-size: 11pt;
              background-color: #4299e1;
              color: white;
              padding: 3px 10px;
              border-radius: 15px;
            }
            .meal-details {
              margin-bottom: 15px;
            }
            .meal-nutrition {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-bottom: 15px;
              font-size: 11pt;
            }
            .nutrition-item {
              background-color: #f0f4f8;
              padding: 5px 10px;
              border-radius: 4px;
            }
            .meal-image {
              width: 100%;
              max-height: 200px;
              object-fit: cover;
              border-radius: 6px;
              margin-bottom: 10px;
            }
            .image-disclaimer {
              font-style: italic;
              color: #718096;
              font-size: 9pt;
              margin-top: 5px;
              margin-bottom: 15px;
            }
            h3 {
              font-size: 14pt;
              color: #2c5282;
              margin-top: 15px;
              margin-bottom: 10px;
            }
            ul, ol {
              padding-left: 25px;
            }
            li {
              margin-bottom: 8px;
            }
            .footer {
              margin-top: 30px;
              font-size: 10pt;
              color: #718096;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
            }
            .health-disclaimer {
              margin-top: 50px;
              padding: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              background-color: #f8fafc;
            }
            .health-disclaimer h2 {
              color: #2c5282;
              font-size: 16pt;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .health-disclaimer p {
              font-size: 11pt;
              color: #4a5568;
              margin-bottom: 10px;
            }
            
            @media print {
              body {
                padding: 0 !important;
                margin: 0 !important;
              }
              .day-container {
                page-break-inside: avoid;
              }
              .meal-container {
                page-break-inside: avoid;
              }
              .health-disclaimer {
                page-break-before: always;
              }
              /* Force first page to show content */
              .page-content {
                display: block !important;
                visibility: visible !important;
                position: static !important;
              }
              h1 {
                display: block !important;
                visibility: visible !important;
              }
            }
            
            * {
              orphans: 3;
              widows: 3;
            }
          </style>
        </head>
        <body>
          <div class="page-content">
            <h1>7-Day Meal Plan</h1>
            <div class="plan-info">
              <p>Plan ID: ${planId} | Created: ${planDate}</p>
            </div>
    `;
    
    // Add each day and its meals
    weeklyPlan.forEach((day, dayIndex) => {
      // For first day, ensure no page break before
      const isFirstDay = dayIndex === 0;
      
      htmlContent += `
        <div class="day-container" ${isFirstDay ? 'style="page-break-before: avoid !important;"' : ''}>
          <div class="day-header">${day.day}</div>
      `;
      
      if (day.meals && Array.isArray(day.meals)) {
        day.meals.forEach(meal => {
          const ingredientsList = Array.isArray(meal.ingredients) 
            ? meal.ingredients.map(ing => `<li>${ing}</li>`).join('') 
            : '<li>No ingredients available</li>';
            
          const instructionsList = Array.isArray(meal.instructions) 
            ? meal.instructions.map((step, index) => `<li>${step}</li>`).join('') 
            : '<li>No instructions available</li>';
        
          const mealOrigin = meal.origin ? 
            (typeof meal.origin === 'object' ? 
              `${meal.origin.country}${meal.origin.region ? `, ${meal.origin.region}` : ''}` : 
              meal.origin) : 
            'Not specified';
          
          // Get the meal image URL
          const recipeKey = `${meal.title}-${meal.type}`;
          const imageUrl = meal.image || recipeImages[recipeKey] || 
            `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/300x200/1a2235/ffffff?text=${encodeURIComponent(meal.title)}`;
          
          htmlContent += `
            <div class="meal-container">
              <div class="meal-header">
                <span>${meal.title}</span>
                <span class="meal-type">${meal.type}</span>
              </div>
              
              <!-- Add meal image with disclaimer -->
              <img src="${imageUrl}" alt="${meal.title}" class="meal-image" onerror="this.style.display='none'" />
              <div class="image-disclaimer">⚠️ Image is for reference only and may not represent the actual dish</div>
              
              <div class="meal-details">
                <p>${meal.description || getMealDescription(meal)}</p>
              </div>
              
              <div class="meal-nutrition">
                ${meal.calories ? `<span class="nutrition-item">🔥 Calories: ${meal.calories}</span>` : ''}
                ${meal.diet ? `<span class="nutrition-item">🥗 Diet: ${meal.diet}</span>` : ''}
                <span class="nutrition-item">🌍 Origin: ${mealOrigin}</span>
              </div>
              
              <h3>Ingredients</h3>
              <ul>
                ${ingredientsList}
              </ul>
              
              <h3>Instructions</h3>
              <ol>
                ${instructionsList}
              </ol>
            </div>
          `;
        });
      }
      
      htmlContent += `</div>`;
    });
    
    // Add health and nutrition disclaimer on the last page
    htmlContent += `
      <div class="health-disclaimer">
        <h2>Health and Nutrition Disclaimer</h2>
        <p>The nutritional information, recipes, and dietary recommendations provided through our Services are for informational purposes only and are not intended as medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before making significant changes to your diet or if you have any health concerns or conditions.</p>
        <p>We cannot guarantee that recipes generated by our AI will be suitable for specific dietary needs or restrictions. Users with severe allergies or medical dietary requirements should verify all ingredients and nutritional information independently.</p>
      </div>
    
      <div class="footer">
        Generated by NutriSift | ${new Date().toLocaleDateString()}
      </div>
    </div> <!-- close page-content div -->
    
    <script>
      // Moved script to end of body for better loading
      document.addEventListener('DOMContentLoaded', function() {
        // Force any browser reflow before printing
        document.body.offsetHeight;
        
        // Print after short delay to ensure page is rendered
        setTimeout(function() {
          window.print();
        }, 1000);
      });
    </script>
  </body>
  </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
};

  return (
    <div className={`meal-planner-page ${orientation}`}>
      <header className="meal-planner-header">
        <div className="header-content">
          <h1><span className="calendar-icon">📅</span> Personalized Meal Planner</h1>
          <HamburgerMenu isLoggedIn={true} />
        </div>
      </header>
      
      <div className="meal-planner-content">
        <div className="control-bar">
          <button 
            className={`action-button primary ${generateLoading ? 'loading' : ''}`}
            onClick={generateMealPlan}
            disabled={generateLoading || loading}
          >
            {generateLoading ? 
              <><span className="spinner"></span> Generating...</> : 
              <><span className="icon">✨</span> Generate New Plan</>}
          </button>
          
          <button 
            className={`action-button secondary ${loading ? 'loading' : ''}`}
            onClick={fetchMealPlans}
            disabled={loading || generateLoading}
          >
            {loading ? 
              <><span className="spinner"></span> Fetching...</> : 
              <><span className="icon">🔄</span> Refresh Plans</>}
          </button>
          
          {/* Print Meal Plan button */}
          {mealPlans.length > 0 && (
            <button 
              className="action-button print-plan"
              onClick={handlePrintMealPlan}
              disabled={loading || generateLoading || !currentPlan}
            >
              <span className="icon">📃</span> Print Plan
            </button>
          )}
          
          {mealPlans.length > 0 && (
            <button 
              className="action-button danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || generateLoading || deleteLoading}
            >
              <span className="icon">🗑️</span> Delete Plan
            </button>
          )}
          
          {mealPlans.length > 1 && (
            <div className="select-container top-select">
              <select 
                value={selectedPlanIndex}
                onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
              >
                {mealPlans.map((plan, index) => (
                  <option key={index} value={index}>
                    Plan Id {plan.id || plan._id || index + 1} - {formatDate(plan.created_at || plan.createdAt)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {successMessage && (
            <div className="toast success">
              <span className="toast-icon">✅</span>
              <span>{successMessage}</span>
            </div>
          )}
          
          {error && (
            <div className="toast error">
              <span className="toast-icon">❌</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="close-toast">×</button>
            </div>
          )}
        </div>
        
        {loading && (
          <div className="loading-state">
            <div className="spinner large"></div>
            <p>Loading your personalized meal plans...</p>
          </div>
        )}
        
        {!loading && mealPlans.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h2>No Meal Plans Found</h2>
            <p>Get started by generating your first personalized meal plan.</p>
            <button 
              className="action-button primary"
              onClick={generateMealPlan}
              disabled={generateLoading}
            >
              {generateLoading ? 'Generating...' : 'Generate Meal Plan'}
            </button>
          </div>
        )}
        
        {!loading && mealPlans.length > 0 && (
          <div className="meal-plan-view">            
            <div className={`days-container ${orientation}`}>
              {weeklyPlan.map((day, dayIndex) => (
                <div key={dayIndex} className="day">
                  <div className="day-name">
                    <h3>{day.day}</h3>
                  </div>
                  
                  <div className="meals">
                    {day.meals && day.meals.map((meal, mealIndex) => (
                      <div 
                        key={mealIndex} 
                        className={`meal ${orientation}`}
                        onClick={() => handleViewRecipe(meal)}
                      >
                        <div className={`meal-img ${orientation === 'portrait' ? 'full-width' : ''}`}>
                          <img 
                            src={getMealImageUrl(meal)} 
                            alt={meal.title} 
                            onError={(e) => {
                              e.target.onerror = null; 
                            }}
                          />
                          <span className="meal-type">{meal.type}</span>
                        </div>
                        
                        <div className="meal-info">
                          <h4>{meal.title}</h4>
                          
                          <p className="description">{getMealDescription(meal)}</p>
                          
                          <div className="meal-stats">
                            {meal.calories && (
                              <span className="stat">
                                <span className="stat-icon">🔥</span>
                                {meal.calories} cal
                              </span>
                            )}
                            
                            {meal.ingredients && (
                              <span className="stat">
                                <span className="stat-icon">🥕</span>
                                {meal.ingredients.length} ingredients
                              </span>
                            )}
                          </div>
                          
                          {/* New action buttons */}
                          <div className={`meal-actions ${orientation === 'portrait' ? 'compact' : ''}`}>
                            <button 
                              className="action-icon view" 
                              title="View Recipe"
                              onClick={(e) => { e.stopPropagation(); handleViewRecipe(meal); }}
                            >
                              <span className="action-icon-symbol">👁️</span>
                              <span className="action-label">View</span>
                            </button>
                            
                            <button 
                              className="action-icon save" 
                              title="Save Recipe"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent the event from bubbling up to parent
                                handleSaveRecipe(meal);
                              }}
                            >
                              <span className="action-icon-symbol">💾</span>
                              <span className="action-label">Save</span>
                            </button>
                            
                            <button 
                              className="action-icon share" 
                              title="Share Recipe"
                              onClick={(e) => handleShareRecipe(meal, e)}
                            >
                              <span className="action-icon-symbol">📤</span>
                              <span className="action-label">Share</span>
                            </button>
                            
                            <button 
                              className="action-icon print" 
                              title="Print Recipe"
                              onClick={(e) => handlePrintRecipe(meal, e)}
                            >
                              <span className="action-icon-symbol">🖨️</span>
                              <span className="action-label">Print</span>
                            </button>
                            
                            <button 
                              className="action-icon grocery" 
                              title="Add to Grocery List"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToGroceryList(meal, e);
                              }}
                              disabled={addingToGroceryList}
                            >
                              <span className="action-icon-symbol">{addingToGroceryList ? '⏳' : '🛒'}</span>
                              <span className="action-label">{addingToGroceryList ? 'Adding...' : 'Add to List'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Add confirmation dialog */}
      {showDeleteConfirm && <DeleteConfirmationDialog />}
    </div>
  );
}

export default PersonalizedMealPlannerPage;