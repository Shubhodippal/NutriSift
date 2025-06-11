import React, { useState, useRef, useEffect } from 'react';
import './RecipeChatPage.css';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import HamburgerMenu from '../components/HamburgerMenu';

const BOT_AVATAR = "👩‍🍳";
const USER_AVATAR = "🧑";

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
    
    return `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/600x400/1a2235/ffffff?text=${encodeURIComponent(recipe.title)}`;
  } catch (error) {
    console.error('Error fetching recipe image:', error);
    return `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/600x400/1a2235/ffffff?text=${encodeURIComponent(recipe.title)}`;
  }
};

const RecipeChatPage = () => {
const [messages, setMessages] = useState(() => {
  const savedMessages = localStorage.getItem('chatHistory');
  if (savedMessages) {
    try {
      return JSON.parse(savedMessages);
    } catch (e) {
      console.error('Error loading saved chat history:', e);
    }
  }
  return [{ 
    sender: "bot", 
    text: "Hi! Tell me what ingredients you have, and I'll suggest a recipe tailored just for you." 
  }];
});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState(() => {
    const saved = localStorage.getItem('savedRecipes');
    return saved ? JSON.parse(saved) : [];
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const navigate = useNavigate();

  const ingredientSuggestions = [
    "chicken, garlic, lemon, potatoes",
    "pasta, tomatoes, basil, olive oil",
    "rice, beans, corn, avocado",
    "tofu, broccoli, ginger, soy sauce"
  ];

  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    if (input.trim().length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  }, [input]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    await generateRecipe(input);

    setLoading(false);
    inputRef.current?.focus();
  };

const generateRecipe = async (ingredients) => {
  try {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });
      
      if (!res.ok) {
        throw new Error(`API returned status: ${res.status}`);
      }
      
      const data = await res.json();
      
      const imageUrl = await getRecipeImage({
        title: data.title,
        cuisine: data.cuisine,
        course: data.course
      });
      
      const metadataSection = `
**Nutritional & Recipe Information**
- **Calories:** ${data.calories || 'Not available'}
- **Diet:** ${data.diet || 'Not specified'}
- **Origin:** ${data.origin || 'Not specified'} 
- **Course:** ${data.course || 'Not specified'}
- **Cuisine:** ${data.cuisine || 'Not specified'}
`;
      
      setMessages(msgs => [
        ...msgs,
        {
          sender: "bot",
          text: `Here's a recipe for you:\n\n# ${data.title}\n\n${metadataSection}\n## Ingredients\n${data.ingredients.map(i => `- ${i}`).join('\n')}\n\n## Instructions\n${data.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
          recipeData: {
            title: data.title,
            ingredients: data.ingredients,
            steps: data.steps,
            calories: data.calories,
            diet: data.diet,
            origin: data.origin,
            course: data.course,
            cuisine: data.cuisine,
            image: imageUrl
          }
        }
      ]);
    } catch (apiError) {
      console.error('API Error:', apiError);
      
      const mockRecipe = generateMockRecipe(ingredients);
      
      const imageUrl = await getRecipeImage({
        title: mockRecipe.title,
        cuisine: mockRecipe.cuisine,
        course: mockRecipe.course
      });
      
      setMessages(msgs => [
        ...msgs,
        {
          sender: "bot",
          text: `Here's a recipe for you:\n\n# ${mockRecipe.title}\n\n## Ingredients\n${mockRecipe.ingredients.map(i => `- ${i}`).join('\n')}\n\n## Instructions\n${mockRecipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
          recipeData: {
            ...mockRecipe,
            image: imageUrl
          }
        }
      ]);
    }
  } catch (error) {
    console.error('Recipe generation error:', error);
    setMessages(msgs => [
      ...msgs,
      { 
        sender: "bot", 
        text: "Sorry, I couldn't generate a recipe right now. Please try again in a moment." 
      }
    ]);
  }
};

const generateMockRecipe = (ingredients) => {
    const ingredientList = ingredients.split(/,\s*/).filter(i => i.trim().length > 0);
    
    const mainIngredient = ingredientList[0] || 'Mixed';
    const secondaryIngredient = ingredientList.length > 1 ? ingredientList[1] : '';
    
    const title = secondaryIngredient 
      ? `${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} and ${secondaryIngredient} Dish`
      : `${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Special`;
    
    let cuisine = 'Fusion';
    let course = 'Main Dish';
    
    if (ingredientList.some(i => i.match(/pasta|spaghetti|noodle|pizza/i))) {
      cuisine = 'Italian';
    } else if (ingredientList.some(i => i.match(/rice|soy|ginger|tofu/i))) {
      cuisine = 'Asian';
    } else if (ingredientList.some(i => i.match(/tortilla|salsa|taco|bean/i))) {
      cuisine = 'Mexican';
    }
    
    if (ingredientList.some(i => i.match(/chocolate|sugar|vanilla|cream|cake/i))) {
      course = 'Dessert';
    } else if (ingredientList.some(i => i.match(/bread|cheese|cracker/i)) && ingredientList.length < 3) {
      course = 'Appetizer';
    }
    
    return {
      title,
      ingredients: [
        ...ingredientList,
        'Salt and pepper to taste',
        'Olive oil',
        'Fresh herbs (optional)'
      ],
      steps: [
        `Prepare all your ingredients. Wash and chop the ${ingredientList.join(' and ')}.`,
        `Heat olive oil in a pan over medium heat.`,
        `Add ${ingredientList[0] || 'ingredients'} to the pan and cook for 5 minutes.`,
        ingredientList.length > 1 ? `Add ${ingredientList.slice(1).join(' and ')} and continue cooking for another 5 minutes.` : 'Continue cooking for another 5 minutes.',
        'Season with salt and pepper to taste.',
        'Serve hot, garnished with fresh herbs if desired.'
      ],
      calories: 'Approximately 350-450 calories per serving',
      diet: ingredientList.some(i => i.match(/meat|chicken|beef|pork|fish/i)) ? 'Non-vegetarian' : 'Vegetarian',
      origin: 'Modern Kitchen',
      course: course,
      cuisine: cuisine
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const saveRecipeToDatabase = async (recipe) => {
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      const ingredientsMatch = recipe.text.match(/## Ingredients\n([\s\S]*?)(?=## Instructions)/);
      const stepsMatch = recipe.text.match(/## Instructions\n([\s\S]*?)(?=##|$)/);
      
      const ingredients = ingredientsMatch 
        ? ingredientsMatch[1].trim() 
        : '';
      const steps = stepsMatch 
        ? stepsMatch[1].trim() 
        : '';
      
      let recipeName = 'Untitled Recipe';
      
      const titleMatch = recipe.text.match(/# (.*?)(?:\n|$)/);
      if (titleMatch && titleMatch[1] && titleMatch[1].trim()) {
        recipeName = titleMatch[1].trim();
      } 
      else if (recipe.title && typeof recipe.title === 'string' && recipe.title.trim()) {
        recipeName = recipe.title.trim();
      }
      else if (recipe.recipeData && recipe.recipeData.title) {
        recipeName = recipe.recipeData.title.trim();
      }
      
      let calories, diet, origin, course, cuisine;
      
      if (recipe.recipeData) {
        calories = recipe.recipeData.calories;
        diet = recipe.recipeData.diet;
        origin = recipe.recipeData.origin;
        course = recipe.recipeData.course;
        cuisine = recipe.recipeData.cuisine;
      }
      
      if (!calories) {
        const caloriesMatch = recipe.text.match(/Calories: ([^\n]*)/);
        calories = caloriesMatch ? caloriesMatch[1].trim() : '';
      }
      
      if (!diet) {
        const dietMatch = recipe.text.match(/Diet: ([^\n]*)/);
        diet = dietMatch ? dietMatch[1].trim() : '';
      }
      
      if (!origin) {
        const originMatch = recipe.text.match(/Origin: ([^\n]*)/);
        origin = originMatch ? originMatch[1].trim() : '';
      }
      
      if (!course) {
        const courseMatch = recipe.text.match(/Course: ([^\n]*)/);
        course = courseMatch ? courseMatch[1].trim() : '';
      }
      
      if (!cuisine) {
        const cuisineMatch = recipe.text.match(/Cuisine: ([^\n]*)/);
        cuisine = cuisineMatch ? cuisineMatch[1].trim() : '';
      }
      
      console.log('Saving recipe with name:', recipeName);
      
      const recipeData = {
        uid: userId,
        mail: userEmail , 
        prompt: recipe.userInput || input || '', 
        recipeName: recipeName,
        ingredients: ingredients || 'No ingredients specified',
        steps: steps || 'No steps specified',
        calories: calories || '',
        diet: diet || '',
        origin: origin || '',
        course: course || '',
        cuisine: cuisine || ''
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipes/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to save recipe: ${response.status} ${errorText}`);
      }
      
      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = { message: text, success: true };
      }
      
      console.log('Save successful:', result);
      return result;
    } catch (err) {
      console.error('Error saving recipe to database:', err);
      throw err;
    }
  };

  const handleSaveRecipe = async (message) => {
    try {
      setSavingRecipe(true);
      
      const recipe = {
        id: Date.now().toString(),
        text: message.text,
        userInput: messages.find(m => m.sender === "user")?.text || '',
        savedAt: new Date().toISOString()
      };
      
      const savedRecipe = await saveRecipeToDatabase(recipe);
      
      if (savedRecipe && savedRecipe.id) {
        recipe.id = savedRecipe.id;
      }
      
      setSavedRecipes(prev => [...prev, recipe]);
      
      setSuccessMessage(savedRecipe.message || 'Recipe saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setErrorMessage('Failed to save recipe. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSavingRecipe(false);
    }
  };

  const handlePrintRecipe = (message) => {
    const printWindow = window.open('', '_blank');
    
    const titleMatch = message.text.match(/# (.*)\n/);
    const recipeTitle = titleMatch ? titleMatch[1] : "Recipe";
    
    const imageUrl = message.recipeData?.image || '';
    
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
          ${message.text.replace(/# (.*)\n/, '<h1>$1</h1>\n')
                       .replace(/## (.*)\n/g, '<h2>$1</h2>\n')
                       .replace(/- (.*)/g, '<li>$1</li>')
                       .replace(/(\d+)\. (.*)/g, '<li>$1. $2</li>')
                       .replace(/\n\n/g, '<br><br>')
                       .replace(/Ingredients\n/, '<ul>')
                       .replace(/Instructions\n/, '</ul><ol>')
                       .replace(/$/s, '</ol>')}
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

  const handleShareRecipe = async (message) => {
    const titleMatch = message.text.match(/# (.*)\n/);
    const recipeTitle = titleMatch ? titleMatch[1] : "Recipe";
    
    const plainText = message.text
      .replace(/# (.*)\n/, '$1\n\n')
      .replace(/## Ingredients\n/, 'INGREDIENTS:\n')
      .replace(/## Instructions\n/, 'INSTRUCTIONS:\n')
      .replace(/- /g, '• ')
      .replace(/(\d+)\. /g, '$1. ');
    
    const shareText = `${plainText}\n\nNote: Recipe images are provided for reference only and may not exactly match the actual dish.\n\nShared via NutriSift Recipe Assistant`;
    
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
      setErrorMessage('Could not copy recipe. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleAddToGroceryList = async (message) => {
    const titleMatch = message.text.match(/# (.*)\n/);
    const recipeTitle = titleMatch ? titleMatch[1] : "Untitled Recipe";
    
    let ingredients = [];
    if (message.recipeData && message.recipeData.ingredients) {
      ingredients = message.recipeData.ingredients;
    } else {
      const ingredientsMatch = message.text.match(/## Ingredients\n([\s\S]*?)(?=\n## |\n$)/);
      if (ingredientsMatch && ingredientsMatch[1]) {
        ingredients = ingredientsMatch[1]
          .split('\n')
          .map(line => line.replace(/^- /, '').trim())
          .filter(Boolean);
      }
    }
    
    if (ingredients.length === 0) {
      setErrorMessage('No ingredients found in recipe');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setErrorMessage('You must be logged in to add items to your grocery list');
        setTimeout(() => setErrorMessage(''), 3000);
        setLoading(false);
        return;
      }
      
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
      
      const ingredientData = [];
      const ingredientNames = [];
      
      ingredients.forEach(ingredient => {
        const parts = ingredient.match(/^([\d./]+ \w+)?\s*(.+)/);
        const quantity = parts && parts[1] ? parts[1] : '';
        const name = parts && parts[2] ? parts[2] : ingredient;
        
        ingredientData.push({ name, quantity });
        ingredientNames.push(name);
      });
      
      const categories = "Other";
      
      const groceryItems = ingredientData.map(({ name, quantity }) => {
        return {
          name: name,
          quantity: quantity,
          category: categories[name] || 'Other',
          checked: false,
          count: 1,
          meals: [recipeTitle]
        };
      });
      
      const mergedItems = [...currentList];
      
      groceryItems.forEach(newItem => {
        const existingIndex = mergedItems.findIndex(item => 
          item.name.toLowerCase() === newItem.name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          mergedItems[existingIndex].count++;
          if (!mergedItems[existingIndex].meals.includes(recipeTitle)) {
            mergedItems[existingIndex].meals.push(recipeTitle);
          }
        } else {
          mergedItems.push(newItem);
        }
      });
      
      const sortedItems = mergedItems.sort((a, b) => {
        const categoryA = a.category || 'Other';
        const categoryB = b.category || 'Other';
        const nameA = a.name || '';
        const nameB = b.name || '';
        
        return categoryA.localeCompare(categoryB) || nameA.localeCompare(nameB);
      });
      
      localStorage.setItem('groceryItems', JSON.stringify(sortedItems));
      
      try {
        const saveResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: sortedItems })
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
      setErrorMessage('Error adding ingredients to grocery list');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{ 
      sender: "bot", 
      text: "Hi! Tell me what ingredients you have, and I'll suggest a recipe tailored just for you." 
    }]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="chat-page">
      <div className="gradient-background">
        <div className="gradient-sphere gradient-sphere-1"></div>
        <div className="gradient-sphere gradient-sphere-2"></div>
        <div className="gradient-sphere gradient-sphere-3"></div>
      </div>
      
      <nav className="chat-navbar">
        <div className="chat-logo" onClick={() => navigate("/")}>
          <span role="img" aria-label="chef" className="logo-emoji">{BOT_AVATAR}</span>
          <span className="brand-name">NutriSift</span>
        </div>
        
        <HamburgerMenu 
          additionalItems={{
            showNewChat: true,
            clearChat: handleClearChat
          }}
          isLoggedIn={true}
        />
      </nav>
      
      <div className="chat-container">
        {!isMobile && (
          <div className="chat-header">
            <h1>Recipe Assistant</h1>
            <p>Transform your ingredients into chef-level recipes</p>
            <div className="chat-decoration">
              <span className="decoration-icon">🍴</span>
              <span className="decoration-line"></span>
              <span className="decoration-icon">🥦</span>
              <span className="decoration-line"></span>
              <span className="decoration-icon">🍲</span>
            </div>
          </div>
        )}
        
        <div className="messages-container" ref={messagesContainerRef}>
          <div className="messages-wrapper">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
              >
                <div className="message-avatar">
                  {msg.sender === "user" ? USER_AVATAR : BOT_AVATAR}
                </div>
                <div className="message-content">
                  <div className="message-sender">{msg.sender === "user" ? "You" : "Chef Assistant"}</div>
                  <div className="message-text">
                    {msg.sender === "bot" ? (
                      <>
                        {msg.recipeData && msg.recipeData.image && msg.text.includes("# ") && (
                          <div className="recipe-image-container">
                            <div className="recipe-image-wrapper">
                              <img 
                                src={msg.recipeData.image} 
                                alt={msg.recipeData.title || "Recipe"} 
                                className="recipe-image"
                              />
                            </div>
                            <div className="image-disclaimer">
                              <span className="disclaimer-icon">ℹ️</span> 
                              <span>Recipe image is provided for reference only and may not exactly match the actual dish.</span>
                            </div>
                          </div>
                        )}
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{msg.text}</ReactMarkdown>
                      </>
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.sender === "bot" && idx > 0 && idx === messages.length - 1 && msg.text.includes("# ") && (
                    <div className="message-actions">
                      <button 
                        className={`action-button ${savingRecipe ? 'saving' : ''}`}
                        onClick={() => {
                          handleSaveRecipe(msg);
                        }}
                        disabled={savingRecipe}
                      >
                        <span className="action-icon">{savingRecipe ? '⏳' : '💾'}</span> 
                        {savingRecipe ? 'Saving...' : 'Save Recipe'}
                      </button>
                      <button 
                        className="action-button"
                        onClick={() => handleShareRecipe(msg)}
                      >
                        <span className="action-icon">📤</span> Share Recipe
                      </button>
                      <button 
                        className="action-button"
                        onClick={() => handlePrintRecipe(msg)}
                      >
                        <span className="action-icon">🖨️</span> Print
                      </button>
                      <button 
                        className="action-button"
                        onClick={() => handleAddToGroceryList(msg)}
                      >
                        <span className="action-icon">🛒</span> Add to Grocery List
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message bot-message typing-indicator">
                <div className="message-avatar">{BOT_AVATAR}</div>
                <div className="message-content">
                  <div className="message-sender">Chef Assistant</div>
                  <div className="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        
        {showSuggestions && messages.length === 1 && !isMobile && (
          <div className="suggestion-chips">
            <p className="suggestion-title">Try these ingredient combinations:</p>
            <div className="chips-container">
              {ingredientSuggestions.map((suggestion, index) => (
                <button 
                  key={index} 
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <form className="input-form" onSubmit={handleSend}>
          <div className="input-container">
            <div className="input-icon">🥗</div>
            <input
              ref={inputRef}
              className="message-input"
              type="text"
              placeholder="Enter ingredients (e.g., chicken, rice, broccoli)..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
            <button 
              className={`send-button ${input.trim() ? 'active' : ''}`} 
              type="submit" 
              disabled={loading || !input.trim()}
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
          <div className="input-help">
            <span className="help-tip">💡</span> Press Enter to send • Be specific with ingredients for better results
          </div>
        </form>
      </div>
      
      {!isMobile && (
        <div className="chat-footer">
          <p>Made with ❤️ by NutriSift • <a href="#privacy">Privacy Policy</a> • <a href="#terms">Terms</a></p>
        </div>
      )}
      
      {successMessage && (
        <div className="success-toast">
          <span className="toast-icon">✅</span>
          <span className="toast-message">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="error-toast">
          <span className="toast-icon">⚠️</span>
          <span className="toast-message">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export default RecipeChatPage;