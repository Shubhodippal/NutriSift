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
  
  // Modify your existing useEffect to load from localStorage
  useEffect(() => {
    const recipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    setSavedRecipes(recipes);
    
    // Load grocery items from localStorage if available
    const savedGroceryItems = localStorage.getItem('groceryItems');
    if (savedGroceryItems) {
      setGroceryItems(JSON.parse(savedGroceryItems));
    } else if (location.state?.mealPlan) {
      const items = generateGroceryListFromMealPlan(location.state.mealPlan, recipes);
      setGroceryItems(items);
      localStorage.setItem('groceryItems', JSON.stringify(items));
    }
  }, [location.state]);
  
  // Add this effect to save changes when items are updated
  useEffect(() => {
    if (groceryItems.length > 0) {
      localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
    }
  }, [groceryItems]);
  
  const generateGroceryListFromMealPlan = (mealPlan, recipes) => {
    const ingredientMap = {};
    
    // Extract all ingredients from each meal in the plan
    Object.keys(mealPlan).forEach(day => {
      Object.keys(mealPlan[day]).forEach(meal => {
        const recipeId = mealPlan[day][meal];
        if (recipeId) {
          const recipe = recipes.find(r => r.id === recipeId);
          if (recipe?.recipeData?.ingredients) {
            recipe.recipeData.ingredients.forEach(ingredient => {
              // Parse ingredient to extract quantity and name
              const parts = ingredient.match(/^([\d./]+ \w+)?\s*(.+)/);
              if (parts) {
                const name = parts[2].trim();
                if (ingredientMap[name]) {
                  ingredientMap[name].count++;
                  ingredientMap[name].meals.push(`${day} ${meal}`);
                } else {
                  ingredientMap[name] = {
                    name,
                    quantity: parts[1] || '',
                    category: categorizeIngredient(name),
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
    
    // Convert to array and sort by category
    return Object.values(ingredientMap).sort((a, b) => 
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  };
  
  const categorizeIngredient = (ingredient) => {
    // Simple categorization logic - would be expanded in real app
    const lowerIngredient = ingredient.toLowerCase();
    if (lowerIngredient.includes('flour') || lowerIngredient.includes('sugar') || 
        lowerIngredient.includes('oil') || lowerIngredient.includes('pasta')) {
      return 'Pantry';
    } else if (lowerIngredient.includes('milk') || lowerIngredient.includes('cheese') || 
               lowerIngredient.includes('yogurt') || lowerIngredient.includes('butter')) {
      return 'Dairy';
    } else if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || 
               lowerIngredient.includes('pork') || lowerIngredient.includes('fish')) {
      return 'Meat';
    } else if (lowerIngredient.includes('apple') || lowerIngredient.includes('banana') || 
               lowerIngredient.includes('berry') || lowerIngredient.includes('fruit')) {
      return 'Fruits';
    } else if (lowerIngredient.includes('lettuce') || lowerIngredient.includes('tomato') || 
               lowerIngredient.includes('onion') || lowerIngredient.includes('potato')) {
      return 'Vegetables';
    } else {
      return 'Other';
    }
  };
  
  const toggleItemCheck = (index) => {
    setGroceryItems(items => 
      items.map((item, i) => 
        i === index ? {...item, checked: !item.checked} : item
      )
    );
  };
  
  const addItemToGroceryList = () => {
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
  };
  
  // Add this function near your other functions
  const handleAddItem = (e) => {
    e.preventDefault();
    
    if (!newItemName.trim()) return;
    
    // Create the new item
    const newItem = {
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      category: newItemCategory,
      checked: false,
      count: 1,
      meals: ['Added manually']
    };
    
    // Add to the grocery list
    setGroceryItems(items => {
      const updatedItems = [...items, newItem].sort((a, b) => 
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
      
      // Save to localStorage
      localStorage.setItem('groceryItems', JSON.stringify(updatedItems));
      
      return updatedItems;
    });
    
    // Reset form
    setNewItemName('');
    setNewItemQuantity('');
  };
  
  const handleDeleteItem = (index) => {
    setGroceryItems(items => {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      
      // Save to localStorage
      if (updatedItems.length > 0) {
        localStorage.setItem('groceryItems', JSON.stringify(updatedItems));
      } else {
        localStorage.removeItem('groceryItems');
      }
      
      return updatedItems;
    });
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

const handleEditSave = () => {
  if (!editName.trim()) return;
  
  setGroceryItems(items => {
    const updatedItems = [...items];
    updatedItems[editingIndex] = {
      ...updatedItems[editingIndex],
      name: editName.trim(),
      quantity: editQuantity.trim(),
      category: editCategory
    };
    
    // Sort items again after edit in case category changed
    const sortedItems = updatedItems.sort((a, b) => 
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
    
    // Save to localStorage
    localStorage.setItem('groceryItems', JSON.stringify(sortedItems));
    
    return sortedItems;
  });
  
  setEditingIndex(-1);
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

  return (
    <div className="grocery-list-page">
      <header className="grocery-list-header">
        <h1>🛒 Grocery List</h1>
        
        {/* Replace with component */}
        <HamburgerMenu 
          isLoggedIn={true}
        />
      </header>
      
      <div className="list-controls">
        <button onClick={handlePrintList}>
          🖨️ Print List
        </button>
        <button onClick={() => {
          setGroceryItems([]);
          localStorage.removeItem('groceryItems');
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