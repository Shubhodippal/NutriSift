import React, { useState, useRef, useEffect } from 'react';
import './RecipeChatPage.css';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const BOT_AVATAR = "👩‍🍳";
const USER_AVATAR = "🧑";

function RecipeChatPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Tell me what ingredients you have, and I'll suggest a recipe tailored just for you." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState(() => {
    // Load saved recipes from localStorage on component mount
    const saved = localStorage.getItem('savedRecipes');
    return saved ? JSON.parse(saved) : [];
  });
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

  // Save recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Add a slight delay to ensure the animation completes before scrolling
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Hide suggestions after user starts typing
  useEffect(() => {
    if (input.trim().length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  }, [input]);

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
      // Simulate API call to local endpoint
      try {
        const res = await fetch('http://localhost:5000/generate-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients })
        });
        
        if (!res.ok) {
          throw new Error(`API returned status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Format the response to match the expected format in the app
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "bot",
            text: `Here's a recipe for you:\n\n# ${data.title}\n\n## Ingredients\n${data.ingredients.map(i => `- ${i}`).join('\n')}\n\n## Instructions\n${data.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
            recipeData: {
              title: data.title,
              ingredients: data.ingredients,
              steps: data.steps
            }
          }
        ]);
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Fallback: Generate a mock recipe instead of showing an error
        const data = generateMockRecipe(ingredients);
        
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "bot",
            text: `Here's a recipe for you:\n\n# ${data.title}\n\n## Ingredients\n${data.ingredients.map(i => `- ${i}`).join('\n')}\n\n## Instructions\n${data.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
            recipeData: data
          }
        ]);
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      setMessages((msgs) => [
        ...msgs,
        { 
          sender: "bot", 
          text: "Sorry, I couldn't generate a recipe right now. Please try again in a moment." 
        }
      ]);
    }
  };

  // Helper function to parse recipe data from AI-generated text
  const parseRecipeFromText = (text, originalIngredients) => {
    // Default values in case parsing fails
    let title = "Recipe with " + originalIngredients.split(',')[0];
    let ingredients = [];
    let steps = [];
    
    try {
      // Try to extract title (usually the first line)
      const titleMatch = text.match(/^(.*?)(?:\n|$)/);
      if (titleMatch && titleMatch[1].trim().length > 0) {
        title = titleMatch[1].trim();
      }
      
      // Try to extract ingredients section
      let ingredientsSection = '';
      if (text.includes('Ingredients:') || text.includes('INGREDIENTS')) {
        ingredientsSection = text.split(/Ingredients:|INGREDIENTS/)[1].split(/Instructions:|INSTRUCTIONS|Directions:|DIRECTIONS|Steps:|STEPS/)[0];
      }
      
      // Parse ingredients list
      if (ingredientsSection) {
        ingredients = ingredientsSection
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^[-•*]\s*/, '').trim());
      } else {
        // Fallback: use the provided ingredients
        ingredients = originalIngredients.split(',').map(i => i.trim());
        ingredients.push('Salt and pepper to taste');
      }
      
      // Try to extract instructions section
      let instructionsSection = '';
      if (text.includes('Instructions:') || text.includes('INSTRUCTIONS') || 
          text.includes('Directions:') || text.includes('DIRECTIONS') ||
          text.includes('Steps:') || text.includes('STEPS')) {
        const sections = text.split(/Instructions:|INSTRUCTIONS|Directions:|DIRECTIONS|Steps:|STEPS/);
        instructionsSection = sections.length > 1 ? sections[1] : '';
      }
      
      // Parse steps
      if (instructionsSection) {
        steps = instructionsSection
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^\d+\.\s*/, '').trim());
      } else {
        // Fallback: create basic steps
        steps = [
          `Cook with ${ingredients.slice(0, 3).join(', ')}.`,
          'Season to taste.',
          'Serve and enjoy!'
        ];
      }
      
      // Ensure we have at least some ingredients and steps
      if (ingredients.length === 0) {
        ingredients = originalIngredients.split(',').map(i => i.trim());
      }
      
      if (steps.length === 0) {
        steps = [`Cook with ${ingredients.join(', ')} until done.`];
      }
      
    } catch (parseError) {
      console.error('Error parsing recipe:', parseError);
      // Return basic recipe structure based on original ingredients
      return generateMockRecipe(originalIngredients);
    }
    
    return {
      title,
      ingredients,
      steps
    };
  };

  // Helper function to generate a fallback recipe when the API fails
  const generateMockRecipe = (ingredients) => {
    // Parse ingredients from the input string
    const ingredientList = ingredients.split(/,\s*/).filter(i => i.trim().length > 0);
    
    // Generate a simple title based on the ingredients
    const mainIngredient = ingredientList[0] || 'Mixed';
    const secondaryIngredient = ingredientList.length > 1 ? ingredientList[1] : '';
    
    const title = secondaryIngredient 
      ? `${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} and ${secondaryIngredient} Dish`
      : `${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Special`;
    
    // Create a structured mock recipe
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
      ]
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

  // Save recipe to local storage
  const handleSaveRecipe = (message) => {
    // Extract recipe title for identification
    const titleMatch = message.text.match(/# (.*)\n/);
    const recipeTitle = titleMatch ? titleMatch[1] : "Untitled Recipe";
    
    // Check if recipe is already saved
    const isAlreadySaved = savedRecipes.some(recipe => 
      recipe.title === recipeTitle || recipe.text === message.text
    );
    
    if (!isAlreadySaved) {
      const newRecipe = {
        id: Date.now(),
        title: recipeTitle,
        text: message.text,
        savedAt: new Date().toISOString(),
        recipeData: message.recipeData || null
      };
      
      setSavedRecipes([...savedRecipes, newRecipe]);
      
      // Show success notification
      alert(`Recipe "${recipeTitle}" saved successfully!`);
    } else {
      alert('This recipe is already saved!');
    }
  };

  // Print recipe
  const handlePrintRecipe = (message) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Extract title for a cleaner print
    const titleMatch = message.text.match(/# (.*)\n/);
    const recipeTitle = titleMatch ? titleMatch[1] : "Recipe";
    
    // Create a styled HTML document for printing
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
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${message.text.replace(/# (.*)\n/, '<h1>$1</h1>\n')
                       .replace(/## (.*)\n/g, '<h2>$1</h2>\n')
                       .replace(/- (.*)/g, '<li>$1</li>')
                       .replace(/(\d+)\. (.*)/g, '<li>$1. $2</li>')
                       .replace(/\n\n/g, '<br><br>')
                       .replace(/Ingredients\n/, '<ul>')
                       .replace(/Instructions\n/, '</ul><ol>')
                       .replace(/$/s, '</ol>')}
          <div class="footer">
            Generated by NutriSift | ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `);
    
    // Trigger print dialog
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleShareRecipe = async (message) => {
    // Extract recipe title
    const titleMatch = message.text.match(/# (.*)\n/);
    const recipeTitle = titleMatch ? titleMatch[1] : "Recipe";
    
    // Show sharing options dialog
    const shareDialog = document.createElement('div');
    shareDialog.className = 'share-dialog';
    shareDialog.innerHTML = `
      <div class="share-dialog-content">
        <div class="share-dialog-header">
          <h3>Share Recipe</h3>
          <button class="share-dialog-close">&times;</button>
        </div>
        <div class="share-dialog-body">
          <p>Choose how you want to share "${recipeTitle}":</p>
          <div class="share-options">
            <button class="share-option-btn whatsapp-btn">
              <span class="share-icon">📱</span>
              WhatsApp
            </button>
            <button class="share-option-btn pdf-btn">
              <span class="share-icon">📄</span>
              Download PDF
            </button>
            <button class="share-option-btn copy-btn">
              <span class="share-icon">📋</span>
              Copy Text
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(shareDialog);
    
    // Add event handlers
    const closeBtn = shareDialog.querySelector('.share-dialog-close');
    const whatsappBtn = shareDialog.querySelector('.whatsapp-btn');
    const pdfBtn = shareDialog.querySelector('.pdf-btn');
    const copyBtn = shareDialog.querySelector('.copy-btn');
    
    // Close dialog function
    const closeDialog = () => {
      document.body.removeChild(shareDialog);
    };
    
    // Add event listeners
    closeBtn.addEventListener('click', closeDialog);
    
    // Close on click outside
    shareDialog.addEventListener('click', (e) => {
      if (e.target === shareDialog) {
        closeDialog();
      }
    });
    
    // WhatsApp share
    whatsappBtn.addEventListener('click', () => {
      // Format text for WhatsApp
      const plainText = message.text
        .replace(/# (.*)\n/, '$1\n\n')
        .replace(/## Ingredients\n/, 'INGREDIENTS:\n')
        .replace(/## Instructions\n/, 'INSTRUCTIONS:\n')
        .replace(/- /g, '• ')
        .replace(/(\d+)\. /g, '$1. ');
    
      // Encode text for URL
      const encodedText = encodeURIComponent(`${plainText}\n\nShared via NutriSift Recipe Assistant`);
    
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
      // Open WhatsApp in new window
      window.open(whatsappUrl, '_blank');
      closeDialog();
    });
    
    // PDF download
    pdfBtn.addEventListener('click', async () => {
      closeDialog();
      setLoading(true);
    
      try {
        await generateAndDownloadPDF(message, recipeTitle);
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'share-success';
        toast.textContent = 'Recipe PDF saved!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
        
      } catch (error) {
        console.error('PDF generation error:', error);
        
        // Show error toast
        const errorToast = document.createElement('div');
        errorToast.className = 'share-error';
        errorToast.textContent = 'Could not generate PDF. Please try again.';
        document.body.appendChild(errorToast);
        
        setTimeout(() => {
          if (document.body.contains(errorToast)) {
            document.body.removeChild(errorToast);
          }
        }, 3000);
      } finally {
        setLoading(false);
      }
    });
    
    // Copy text
    copyBtn.addEventListener('click', async () => {
      try {
        // Format text for clipboard
        const plainText = message.text
          .replace(/# (.*)\n/, '$1\n\n')
          .replace(/## Ingredients\n/, 'INGREDIENTS:\n')
          .replace(/## Instructions\n/, 'INSTRUCTIONS:\n');
      
        await navigator.clipboard.writeText(plainText);
      
        // Visual feedback
        copyBtn.innerHTML = '<span class="share-icon">✓</span> Copied!';
        setTimeout(() => {
          closeDialog();
        
          // Show success toast
          const toast = document.createElement('div');
          toast.className = 'share-success';
          toast.textContent = 'Recipe copied to clipboard!';
          document.body.appendChild(toast);
        
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 3000);
        }, 1000);
      
      } catch (error) {
        console.error('Copy failed:', error);
        closeDialog();
      
        // Show error toast
        const errorToast = document.createElement('div');
        errorToast.className = 'share-error';
        errorToast.textContent = 'Could not copy text. Please try again.';
        document.body.appendChild(errorToast);
      
        setTimeout(() => {
          if (document.body.contains(errorToast)) {
            document.body.removeChild(errorToast);
          }
        }, 3000);
      }
    });
  };

  // Helper function to generate and download PDF
  const generateAndDownloadPDF = async (message, recipeTitle) => {
    // Create temporary invisible div to render recipe for PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '-9999px';
    document.body.appendChild(pdfContainer);
    
    // Format recipe content with proper styling for PDF
    pdfContainer.innerHTML = `
      <div style="font-family: 'Segoe UI', sans-serif; padding: 40px; max-width: 800px; background-color: white; color: black;">
        <h1 style="font-size: 28pt; color: #2c5282; border-bottom: 3px solid #4299e1; padding-bottom: 15px; margin-bottom: 25px; font-weight: bold;">${recipeTitle}</h1>
        <div style="margin-bottom: 40px;">
          ${message.text
            .replace(/# .*\n/, '')
            .replace(/## Ingredients\n/, '<h2 style="font-size: 20pt; color: #2c5282; margin-top: 30px; margin-bottom: 20px; font-weight: bold;">Ingredients</h2><ul style="padding-left: 30px; margin-bottom: 30px; font-size: 12pt; line-height: 1.8;">')
            .replace(/## Instructions\n/, '</ul><h2 style="font-size: 20pt; color: #2c5282; margin-top: 30px; margin-bottom: 20px; font-weight: bold;">Instructions</h2><ol style="padding-left: 30px; font-size: 12pt; line-height: 1.8;">')
            .replace(/- (.*)/g, '<li style="margin-bottom: 12px; padding-left: 5px;">$1</li>')
            .replace(/(\d+)\. (.*)/g, '<li style="margin-bottom: 16px; padding-left: 5px;"><span style="font-weight: bold; color: #2c5282;">Step $1:</span> $2</li>')
            .replace(/$/s, '</ol>')}
        </div>
        <div style="margin-top: 40px; font-size: 10pt; color: #718096; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Generated by NutriSift | ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;
    
    try {
      // Import libraries dynamically
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      // Generate PDF with improved settings
      const canvas = await html2canvas(pdfContainer, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 1200,
        imageTimeout: 15000,
        allowTaint: false,
        removeContainer: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate the ratio to fit the content better
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Generate filename and save
      const fileName = `${recipeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`;
      pdf.save(fileName);
      
    } finally {
      // Clean up
      if (document.body.contains(pdfContainer)) {
        document.body.removeChild(pdfContainer);
      }
    }
  };

  // Add to grocery list
  const handleAddToGroceryList = async (message) => {
    // Extract recipe title for reference
    const titleMatch = message.text.match(/# (.*)\n/);
    const recipeTitle = titleMatch ? titleMatch[1] : "Untitled Recipe";
    
    // Get ingredients from the recipe data or parse from text
    let ingredients = [];
    if (message.recipeData && message.recipeData.ingredients) {
      ingredients = message.recipeData.ingredients;
    } else {
      // Try to extract ingredients section from text
      const ingredientsMatch = message.text.match(/## Ingredients\n([\s\S]*?)(?=\n## |\n$)/);
      if (ingredientsMatch && ingredientsMatch[1]) {
        ingredients = ingredientsMatch[1]
          .split('\n')
          .map(line => line.replace(/^- /, '').trim())
          .filter(line => line);
      }
    }
    
    if (ingredients.length === 0) {
      // Show error if no ingredients found
      const errorToast = document.createElement('div');
      errorToast.className = 'share-error';
      errorToast.textContent = 'No ingredients found in recipe';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
      return;
    }
    
    // Show loading indicator
    setLoading(true);
    
    try {
      // Format ingredients for grocery list
      const groceryItemPromises = ingredients.map(async (ingredient) => {
        // Try to extract quantity if it exists
        const parts = ingredient.match(/^([\d./]+ \w+)?\s*(.+)/);
        const quantity = parts && parts[1] ? parts[1] : '';
        const name = parts && parts[2] ? parts[2] : ingredient;
        
        // Get category from API
        const category = await categorizeIngredient(name);
        
        return {
          name: name,
          quantity: quantity,
          category: category,
          checked: false,
          count: 1,
          meals: [recipeTitle]
        };
      });
      
      // Wait for all categorization promises to resolve
      const groceryItems = await Promise.all(groceryItemPromises);
      
      // Get existing grocery items from localStorage
      const existingItems = JSON.parse(localStorage.getItem('groceryItems') || '[]');
      
      // Merge new items with existing items (avoid duplicates)
      const mergedItems = [...existingItems];
      
      groceryItems.forEach(newItem => {
        const existingIndex = mergedItems.findIndex(item => 
          item.name.toLowerCase() === newItem.name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          // Update existing item
          mergedItems[existingIndex].count++;
          if (!mergedItems[existingIndex].meals.includes(recipeTitle)) {
            mergedItems[existingIndex].meals.push(recipeTitle);
          }
        } else {
          // Add new item
          mergedItems.push(newItem);
        }
      });
      
      // Sort by category and name

      const sortedItems = mergedItems.sort((a, b) => {
        // Safely handle undefined categories or names
        const categoryA = a.category || 'Other';
        const categoryB = b.category || 'Other';
        const nameA = a.name || '';
        const nameB = b.name || '';
        
        // Sort by category first, then by name
        return categoryA.localeCompare(categoryB) || nameA.localeCompare(nameB);
      });
      
      // Save to localStorage
      localStorage.setItem('groceryItems', JSON.stringify(sortedItems));
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'share-success';
      toast.textContent = `${ingredients.length} ingredients added to grocery list!`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    } catch (error) {
      console.error('Error adding to grocery list:', error);
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'share-error';
      errorToast.textContent = 'Error adding ingredients to grocery list';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Update the categorizeIngredient function
  const categorizeIngredient = async (ingredient) => {
    try {
      // Call the categorization API
      const response = await fetch('http://localhost:5000/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingredient })
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      // Ensure we always have a valid category string
      return data.category || 'Other';
    } catch (error) {
      console.error('Categorization API error:', error);
      // Fallback to basic categorization if API fails
      return fallbackCategorize(ingredient);
    }
  };

  // Add a fallback function for when the API call fails
  const fallbackCategorize = (ingredient) => {
    const lowerIngredient = ingredient.toLowerCase();
    
    if (lowerIngredient.includes('flour') || lowerIngredient.includes('sugar') || 
        lowerIngredient.includes('oil') || lowerIngredient.includes('pasta') ||
        lowerIngredient.includes('rice') || lowerIngredient.includes('sauce')) {
      return 'Pantry';
    } else if (lowerIngredient.includes('milk') || lowerIngredient.includes('cheese') || 
               lowerIngredient.includes('yogurt') || lowerIngredient.includes('butter') ||
               lowerIngredient.includes('cream')) {
      return 'Dairy';
    } else if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || 
               lowerIngredient.includes('pork') || lowerIngredient.includes('fish') ||
               lowerIngredient.includes('meat') || lowerIngredient.includes('turkey')) {
      return 'Meat';
    } else if (lowerIngredient.includes('apple') || lowerIngredient.includes('banana') || 
               lowerIngredient.includes('berry') || lowerIngredient.includes('fruit') ||
               lowerIngredient.includes('orange') || lowerIngredient.includes('lemon')) {
      return 'Fruits';
    } else if (lowerIngredient.includes('lettuce') || lowerIngredient.includes('tomato') || 
               lowerIngredient.includes('onion') || lowerIngredient.includes('potato') ||
               lowerIngredient.includes('carrot') || lowerIngredient.includes('broccoli') ||
               lowerIngredient.includes('vegetable')) {
      return 'Vegetables';
    } else if (lowerIngredient.includes('salt') || lowerIngredient.includes('pepper') ||
               lowerIngredient.includes('spice') || lowerIngredient.includes('herb') ||
               lowerIngredient.includes('garlic') || lowerIngredient.includes('seasoning')) {
      return 'Spices';
    } else {
      return 'Other';
    }
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
        <div className="nav-links">
          {savedRecipes.length > 0 && (
            <button className="saved-button" onClick={() => navigate("/saved-recipes")}>
              <span className="saved-icon">📚</span>
              <span className="saved-count">{savedRecipes.length}</span>
            </button>
          )}
          <button className="home-button" onClick={() => navigate("/")}>
            <span className="home-icon">🏠</span>
            <span className="home-text">Back to Home</span>
          </button>
        </div>
      </nav>
      
      <div className="chat-container">
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
        
        <div className="messages-container" ref={messagesContainerRef}>
          <div className="messages-wrapper">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.sender === "user" ? "user-message" : "bot-message"} ${idx === messages.length - 1 ? "fade-in" : ""}`}
              >
                <div className="message-avatar">
                  {msg.sender === "user" ? USER_AVATAR : BOT_AVATAR}
                </div>
                <div className="message-content">
                  <div className="message-sender">{msg.sender === "user" ? "You" : "Chef Assistant"}</div>
                  <div className="message-text">
                    {msg.sender === "bot" ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.sender === "bot" && idx > 0 && idx === messages.length - 1 && msg.text.includes("# ") && (
                    <div className="message-actions">
                      <button 
                        className="action-button"
                        onClick={() => handleSaveRecipe(msg)}
                      >
                        <span className="action-icon">💾</span> Save Recipe
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
        
        {showSuggestions && messages.length === 1 && (
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
      
      <div className="chat-footer">
        <p>Made with ❤️ by NutriSift • <a href="#privacy">Privacy Policy</a> • <a href="#terms">Terms</a></p>
      </div>
    </div>
  );
}

export default RecipeChatPage;