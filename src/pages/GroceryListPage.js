import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GroceryListPage.css';
import HamburgerMenu from '../components/HamburgerMenu';

function GroceryListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [groceryItems, setGroceryItems] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Other');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCategory, setEditCategory] = useState('');
  // First, add state for the menu
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Add these state variables at the top of the GroceryListPage component
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'offline'
  
  // Modify your existing useEffect to load from localStorage
  useEffect(() => {
    const recipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    setSavedRecipes(recipes);
    
    const loadGroceryList = async () => {
      // Show loading state
      setSyncStatus('syncing');
      
      // Try to fetch from API first
      const apiItems = await fetchGroceryListFromAPI();
      
      // If API fetch successful, use that data
      if (apiItems) {
        setGroceryItems(apiItems);
        // Update localStorage with the latest from server
        localStorage.setItem('groceryItems', JSON.stringify(apiItems));
      } else {
        // Fallback to localStorage if API fails
        const savedGroceryItems = localStorage.getItem('groceryItems');
        if (savedGroceryItems) {
          setGroceryItems(JSON.parse(savedGroceryItems));
        } else if (location.state?.mealPlan) {
          const items = await generateGroceryListFromMealPlan(location.state.mealPlan, recipes);
          setGroceryItems(items);
          localStorage.setItem('groceryItems', JSON.stringify(items));
          // Also try to save to API
          saveGroceryListToAPI(items);
        }
      }
    };
    
    loadGroceryList();
  }, [location.state]);
  
  // Add this effect to save changes when items are updated
  useEffect(() => {
    if (groceryItems.length > 0) {
      localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
    }
  }, [groceryItems]);
  
  // Update the generateGroceryListFromMealPlan function
const generateGroceryListFromMealPlan = async (mealPlan, recipes) => {
  const ingredientMap = {};
  const allIngredients = [];
  
  // First collect all ingredients
  Object.keys(mealPlan).forEach(day => {
    Object.keys(mealPlan[day]).forEach(meal => {
      const recipeId = mealPlan[day][meal];
      if (recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe?.recipeData?.ingredients) {
          recipe.recipeData.ingredients.forEach(ingredient => {
            const parts = ingredient.match(/^([\d./]+ \w+)?\s*(.+)/);
            if (parts) {
              const name = parts[2].trim();
              allIngredients.push(name);
              
              if (ingredientMap[name]) {
                ingredientMap[name].count++;
                ingredientMap[name].meals.push(`${day} ${meal}`);
              } else {
                ingredientMap[name] = {
                  name,
                  quantity: parts[1] || '',
                  category: 'Other', // Placeholder until categorized
                  checked: false,
                  count: 1,
                  meals: [`${day} ${meal}`]
                };
              }
            }
          });
        }
      }
    });
  });
  
  // Batch categorize all ingredients
  /*try {
    const categories = await batchCategorizeIngredients(allIngredients);
    
    // Update the categories
    Object.keys(ingredientMap).forEach(name => {
      ingredientMap[name].category = categories[name] || 'Other';
    });
  } catch (error) {
    console.error('Error categorizing ingredients:', error);
    // In case of failure, use Other as default category
  }*/
  
  // Convert to array and sort by category
  return Object.values(ingredientMap).sort((a, b) => 
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
};
  
  // Update toggleItemCheck
// Update the toggleItemCheck function to use the specific toggle endpoint
const toggleItemCheck = async (index) => {
  const userId = localStorage.getItem('userId');
  const item = groceryItems[index];
  
  // Optimistically update UI
  const updatedItems = groceryItems.map((i, idx) => 
    idx === index ? {...i, checked: !i.checked} : i
  );
  setGroceryItems(updatedItems);
  
  // Save to localStorage as fallback
  localStorage.setItem('groceryItems', JSON.stringify(updatedItems));
  
  // If item has an ID, use the toggle endpoint
  if (userId && item.id) {
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/item/${item.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: userId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle item: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.items) {
        // Update with server response to get any server-side changes
        setGroceryItems(result.items);
        localStorage.setItem('groceryItems', JSON.stringify(result.items));
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error toggling item:', error);
      setApiError('Failed to sync change. Using local data.');
      setSyncStatus('offline');
    }
  } else if (userId) {
    // If the item doesn't have an ID, save the whole list
    saveGroceryListToAPI(updatedItems);
  }
};

/*const addItemToGroceryList = () => {
    if (!newItemName) return;
    
    const newItem = {
      name: newItemName,
      quantity: newItemQuantity,
      category: newItemCategory,
      checked: false,
      count: 1,
      meals: []
    };
    
    setGroceryItems(items => [...items, newItem]);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemCategory('Other');
  };*/
  
  // Update handleAddItem
const handleAddItem = async (e) => {
  e.preventDefault();
  
  if (!newItemName.trim()) return;
  
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    setApiError('You must be logged in to add items');
    return;
  }
  
  setSyncStatus('syncing');
  
  try {
    // Get category from Cohere API
    const category = "Other";
    
    // Create the new item
    const newItem = {
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      category: category,
      checked: false,
      count: 1,
      meals: ['Added manually']
    };
    
    // Add to the grocery list locally
    const updatedItems = [...groceryItems, newItem].sort((a, b) => 
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
    
    // Save to localStorage as fallback
    localStorage.setItem('groceryItems', JSON.stringify(updatedItems));
    
    // Update state
    setGroceryItems(updatedItems);
    
    // Reset form
    setNewItemName('');
    setNewItemQuantity('');
    
    // Save to API
    try {
      const saveResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: updatedItems })
      });
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save to API: ${saveResponse.status}`);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error saving to API:', error);
      setApiError('Failed to save to server. Data saved locally only.');
      setSyncStatus('offline');
    }
  } catch (error) {
    console.error('Error categorizing ingredient:', error);
    setApiError('Failed to categorize ingredient. Using "Other" category.');
    
    // Fallback to "Other" category
    const newItem = {
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      category: 'Other',
      checked: false,
      count: 1,
      meals: ['Added manually']
    };
    
    const updatedItems = [...groceryItems, newItem].sort((a, b) => 
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
    
    localStorage.setItem('groceryItems', JSON.stringify(updatedItems));
    setGroceryItems(updatedItems);
    setNewItemName('');
    setNewItemQuantity('');
    
    // Try to save to API even with the fallback category
    saveGroceryListToAPI(updatedItems);
  }
};

  // Update handleDeleteItem to use the item-specific endpoint
const handleDeleteItem = async (index) => {
  const userId = localStorage.getItem('userId');
  const item = groceryItems[index];
  
  // Optimistically update UI
  const updatedItems = [...groceryItems];
  updatedItems.splice(index, 1);
  setGroceryItems(updatedItems);
  
  // Save to localStorage as fallback
  if (updatedItems.length > 0) {
    localStorage.setItem('groceryItems', JSON.stringify(updatedItems));
  } else {
    localStorage.removeItem('groceryItems');
  }
  
  // If item has an ID, use the delete item endpoint
  if (userId && item.id) {
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/item/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: userId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.items) {
        // Update with server response
        setGroceryItems(result.items);
        localStorage.setItem('groceryItems', JSON.stringify(result.items));
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error deleting item:', error);
      setApiError('Failed to sync deletion. Using local data.');
      setSyncStatus('offline');
    }
  } else if (userId) {
    // If the item doesn't have an ID, save the whole list
    saveGroceryListToAPI(updatedItems);
  }
};
  
  // Add these functions after your other handler functions
const handleEditStart = (index) => {
  const item = groceryItems[index];
  setEditingIndex(index);
  setEditName(item.name);
  setEditQuantity(item.quantity);
  setEditCategory(item.category);
};

const handleEditCancel = () => {
  setEditingIndex(-1);
};

// Update handleEditSave
const handleEditSave = async () => {
  if (!editName.trim()) return;
  
  const userId = localStorage.getItem('userId');
  const item = groceryItems[editingIndex];
  
  // Update item locally
  const updatedItems = [...groceryItems];
  updatedItems[editingIndex] = {
    ...updatedItems[editingIndex],
    name: editName.trim(),
    itemName: editName.trim(), // Add this for backend compatibility
    quantity: editQuantity.trim(),
    category: editCategory
  };
  
  // Sort items again after edit in case category changed
  const sortedItems = updatedItems.sort((a, b) => 
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
  
  // Save to localStorage as fallback
  localStorage.setItem('groceryItems', JSON.stringify(sortedItems));
  
  // Update state
  setGroceryItems(sortedItems);
  setEditingIndex(-1);
  
  // If item has an ID, use the update item endpoint
  if (userId && item.id) {
    setSyncStatus('syncing');
    try {
      const updatedItem = {
        ...item,
        name: editName.trim(),
        itemName: editName.trim(), // Backend uses itemName
        quantity: editQuantity.trim(),
        category: editCategory,
        uid: userId
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/item/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedItem)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.items) {
        // Update with server response
        setGroceryItems(result.items);
        localStorage.setItem('groceryItems', JSON.stringify(result.items));
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error updating item:', error);
      setApiError('Failed to sync update. Using local data.');
      setSyncStatus('offline');
    }
  } else if (userId) {
    // If the item doesn't have an ID, save the whole list
    saveGroceryListToAPI(sortedItems);
  }
};

// Add this function near your other handler functions
const handleUpdateItem = (e) => {
  e.preventDefault();
  handleEditSave();
};

const handlePrintList = () => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Generate a printable version of the grocery list
  const categories = Array.from(new Set(groceryItems.map(item => item.category)));
  
  let printContent = `
    <html>
    <head>
      <title>Grocery List - NutriSift</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        h2 {
          margin-top: 20px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ddd;
          color: #444;
        }
        ul {
          list-style-type: none;
          padding-left: 0;
        }
        li {
          padding: 8px 0;
          display: flex;
          border-bottom: 1px dashed #eee;
        }
        .checkbox {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 1px solid #999;
          margin-right: 10px;
        }
        .quantity {
          color: #666;
          width: 80px;
          display: inline-block;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        @media print {
          body {
            font-size: 12pt;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>Grocery List</h1>
  `;
  
  categories.forEach(category => {
    const items = groceryItems.filter(item => item.category === category);
    
    printContent += `<h2>${category}</h2><ul>`;
    
    items.forEach(item => {
      printContent += `
        <li>
          <span class="checkbox"></span>
          <span class="quantity">${item.quantity}</span>
          <span>${item.name}</span>
          ${item.count > 1 ? ` (×${item.count})` : ''}
        </li>
      `;
    });
    
    printContent += `</ul>`;
  });
  
  printContent += `
      <div class="footer">
        Generated by NutriSift - ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;
  
  // Write content to the new window and print
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = function() {
    printWindow.print();
    // printWindow.close(); // Uncomment to auto-close after print dialog
  };
};

// Add this function to your component
const handleShareList = async () => {
  if (groceryItems.length === 0) {
    alert("Your grocery list is empty.");
    return;
  }
  
  // Format the grocery list as text
  const categories = Array.from(new Set(groceryItems.map(item => item.category)));
  
  let listText = "📝 My Grocery List:\n\n";
  
  categories.forEach(category => {
    const items = groceryItems.filter(item => item.category === category);
    
    listText += `📌 ${category}:\n`;
    
    items.forEach(item => {
      listText += `- ${item.quantity ? `${item.quantity} ` : ''}${item.name}${item.count > 1 ? ` (×${item.count})` : ''}\n`;
    });
    
    listText += "\n";
  });
  
  listText += "Generated with NutriSift";
  
  try {
    // Try to use the Web Share API (works on mobile)
    if (navigator.share) {
      await navigator.share({
        title: 'My Grocery List',
        text: listText
      });
      return;
    }
    
    // Fallback to clipboard copy
    await navigator.clipboard.writeText(listText);
    
    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'share-success';
    toast.textContent = 'Grocery list copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error sharing:', error);
    
    // Show error toast
    const errorToast = document.createElement('div');
    errorToast.className = 'share-error';
    errorToast.textContent = 'Failed to share grocery list';
    document.body.appendChild(errorToast);
    
    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast);
      }
    }, 3000);
  }
};

// Add toggle function
const toggleMenu = () => {
  setMenuOpen(!menuOpen);
};

// Add navigation handler
const handleNavigation = (path) => {
  setMenuOpen(false);
  navigate(path);
};

// Add these API helper functions after your other function declarations

// Fetch grocery list from API
const fetchGroceryListFromAPI = async () => {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    setApiError('User not logged in');
    return null;
  }
  
  try {
    setApiError(null);
    setSyncStatus('syncing');
    
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch grocery list: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch grocery list');
    }
    
    // Transform backend items to match frontend structure
    const transformedItems = data.items.map(item => ({
      id: item.id,
      name: item.itemName || item.name,
      quantity: item.quantity || '',
      category: item.category || 'Other',
      checked: item.checked || false,
      count: 1, // Default
      meals: item.meals || ['Unspecified']
    }));
    
    setSyncStatus('synced');
    return transformedItems;
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    setApiError('Failed to load grocery list from server. Using local data.');
    setSyncStatus('offline');
    return null;
  }
};

// Save grocery list to API
const saveGroceryListToAPI = async (items) => {
  const userId = localStorage.getItem('userId');
  let userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  
  if (!userId) {
    setApiError('User not logged in');
    return false;
  }
  
  try {
    setIsSaving(true);
    setApiError(null);
    setSyncStatus('syncing');
    
    // Try to verify the email first
    try {
      const verifyResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/verify/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (verifyResponse.ok) {
        const userData = await verifyResponse.json();
        userEmail = userData.email; // Use verified email
      }
    } catch (verifyError) {
      console.error('Error verifying user email:', verifyError);
      // Continue with email from localStorage as fallback
    }
    
    // Transform items to match backend structure with verified email
    const transformedItems = items.map(item => ({
      id: item.id, // Pass ID if it exists
      uid: userId,
      mail: userEmail, // Use verified email
      itemName: item.name,
      name: item.name,
      quantity: item.quantity || '',
      category: item.category || 'Other',
      checked: item.checked || false,
      state: item.checked ? 'checked' : 'active',
      meals: item.meals || []
    }));
    
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: transformedItems })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save grocery list: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to save grocery list');
    }
    
    // Update with server response to get IDs
    if (result.items) {
      setGroceryItems(result.items);
      localStorage.setItem('groceryItems', JSON.stringify(result.items));
    }
    
    setSyncStatus('synced');
    return true;
  } catch (error) {
    console.error('Error saving grocery list:', error);
    setApiError('Failed to save to server. Data saved locally only.');
    setSyncStatus('offline');
    return false;
  } finally {
    setIsSaving(false);
  }
};
  return (
    <div className="grocery-list-page">
      <header className="grocery-list-header">
        <h1>🛒 Grocery List</h1>
        
        {/* Replace with component */}
        <HamburgerMenu 
          isLoggedIn={true}
        />
      </header>
      
      {/* Add this below the header */}
<div className="sync-status">
  {syncStatus === 'syncing' && (
    <div className="syncing">
      <span className="sync-icon">🔄</span> Syncing...
    </div>
  )}
  {syncStatus === 'synced' && (
    <div className="synced">
      <span className="sync-icon">✅</span> All changes saved
    </div>
  )}
  {syncStatus === 'offline' && (
    <div className="offline">
      <span className="sync-icon">⚠️</span> Offline mode - changes saved locally
    </div>
  )}
  {apiError && (
    <div className="sync-error">
      <span className="error-icon">❌</span> {apiError}
    </div>
  )}
</div>
      
      <div className="list-controls">
        <button onClick={handlePrintList}>
          🖨️ Print List
        </button>
        <button onClick={async () => {
  const userId = localStorage.getItem('userId');
  
  // Clear state and localStorage
  setGroceryItems([]);
  localStorage.removeItem('groceryItems');
  
  // Clear from API if logged in
  if (userId) {
    setSyncStatus('syncing');
    try {
      // Use the DELETE endpoint instead of sending an empty array
      const clearResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/grocerylist/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!clearResponse.ok) {
        throw new Error(`Failed to clear list on server: ${clearResponse.status}`);
      }
      
      const result = await clearResponse.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to clear grocery list');
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error clearing list on server:', error);
      setApiError('Failed to clear list on server. Cleared locally only.');
      setSyncStatus('offline');
    }
  }
}}>
  🗑️ Clear List
</button>
        <button onClick={handleShareList}>
          📤 Share List
        </button>
      </div>
      
      <div className="add-item-form">
        <h2>➕ Add New Item</h2>
        <form onSubmit={handleAddItem}>
          <div className="form-row">
            <div className="form-group">
              <label>📝 Item Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Enter item name"
                  required
                  className="enhanced-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>⚖️ Quantity</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="e.g., 2 lbs, 3 cups"
                  className="enhanced-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>🏷️ Category</label>
              <div className="select-wrapper">
                <select 
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="enhanced-input"
                >
                  <option value="Pantry">🥫 Pantry</option>
                  <option value="Dairy">🥛 Dairy</option>
                  <option value="Meat">🥩 Meat</option>
                  <option value="Fruits">🍎 Fruits</option>
                  <option value="Vegetables">🥦 Vegetables</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="add-button pulse-animation">
              ➕ Add to List
            </button>
          </div>
        </form>
      </div>
      
      <div className="grocery-list">
        {groceryItems.length === 0 ? (
          <div className="empty-list">
            <p>Your grocery list is empty.</p>
            <p>Plan your meals to generate a list!</p>
          </div>
        ) : (
          <div className="category-groups">
            {Array.from(new Set(groceryItems.map(item => item.category))).map(category => (
              <div key={category} className="category-group">
                <h2>{category}</h2>
                <ul>
                  {groceryItems
                    .filter(item => item.category === category)
                    .map((item, index) => {
                      const itemIndex = groceryItems.indexOf(item);
                      const isEditing = editingIndex === itemIndex;
                      
                      return (
                        <li 
                          key={index} 
                          className={`${item.checked ? 'checked' : ''} ${isEditing ? 'editing' : ''}`}
                        >
                          {isEditing ? (
                            // Edit mode
                            <div className="item-edit-form">
                              <div className="edit-form-group">
                                <label>Name</label>
                                <input 
                                  type="text" 
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="edit-input"
                                  required
                                />
                              </div>
                              <div className="edit-form-group">
                                <label>Quantity</label>
                                <input 
                                  type="text" 
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(e.target.value)}
                                  className="edit-input"
                                />
                              </div>
                              <div className="edit-form-group">
                                <label>Category</label>
                                <select
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value)}
                                  className="edit-input"
                                >
                                  <option value="Pantry">🥫 Pantry</option>
                                  <option value="Dairy">🥛 Dairy</option>
                                  <option value="Meat">🥩 Meat</option>
                                  <option value="Fruits">🍎 Fruits</option>
                                  <option value="Vegetables">🥦 Vegetables</option>
                                  <option value="Other">📦 Other</option>
                                </select>
                              </div>
                              <div className="edit-actions">
                                <button 
                                  type="button"
                                  className="edit-save-button"
                                  onClick={handleEditSave}
                                >
                                  Save
                                </button>
                                <button 
                                  type="button"
                                  className="edit-cancel-button"
                                  onClick={handleEditCancel}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display mode
                            <>
                              <div className="item-content" onClick={() => toggleItemCheck(itemIndex)}>
                                <span className="item-checkbox">
                                  {item.checked ? '✓' : ''}
                                </span>
                                <span className="item-quantity">{item.quantity}</span>
                                <span className="item-name">{item.name}</span>
                                {item.count > 1 && <span className="item-count">({item.count})</span>}
                              </div>
                              <div className="item-actions">
                                <button 
                                  className="edit-item-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStart(itemIndex);
                                  }}
                                >
                                  <span className="edit-icon">✏️</span>
                                </button>
                                <button 
                                  className="delete-item-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(itemIndex);
                                  }}
                                >
                                  <span className="delete-icon">🗑️</span>
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {editingIndex !== -1 && (
        <div className="edit-item-modal">
          <div className="modal-content">
            <h2>Edit Item</h2>
            <form onSubmit={(e) => {
  e.preventDefault();
  handleEditSave();
}}>
              <div className="form-row">
                <div className="form-group">
                  <label><span className="label-icon">📝</span> Item Name</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter item name"
                      required
                      className="enhanced-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label><span className="label-icon">⚖️</span> Quantity</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      placeholder="e.g., 2 lbs, 3 cups"
                      className="enhanced-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label><span className="label-icon">🏷️</span> Category</label>
                  <div className="select-wrapper">
                    <select 
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="enhanced-input"
                    >
                      <option value="Pantry">🥫 Pantry</option>
                      <option value="Dairy">🥛 Dairy</option>
                      <option value="Meat">🥩 Meat</option>
                      <option value="Fruits">🍎 Fruits</option>
                      <option value="Vegetables">🥦 Vegetables</option>
                      <option value="Other">📦 Other</option>
                    </select>
                  </div>
                </div>
                
                <button type="submit" className="update-button pulse-animation">
                  <span className="button-icon">✔️</span>
                  Update Item
                </button>
              </div>
            </form>
            <button className="close-modal" onClick={() => setEditingIndex(-1)}>
              <span className="close-icon">❌</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroceryListPage;