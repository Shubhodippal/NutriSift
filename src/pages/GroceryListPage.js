import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GroceryListPage.css';

function GroceryListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [groceryItems, setGroceryItems] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  
  useEffect(() => {
    const recipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    setSavedRecipes(recipes);
    
    if (location.state?.mealPlan) {
      const items = generateGroceryListFromMealPlan(location.state.mealPlan, recipes);
      setGroceryItems(items);
    }
  }, [location.state]);
  
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
  
  return (
    <div className="grocery-list-page">
      <header className="grocery-list-header">
        <h1>Grocery List</h1>
        <button onClick={() => navigate('/meal-planner')}>Back to Meal Planner</button>
      </header>
      
      <div className="list-controls">
        <button onClick={() => window.print()}>Print List</button>
        <button onClick={() => setGroceryItems([])}>Clear List</button>
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
                    .map((item, index) => (
                      <li 
                        key={index} 
                        className={item.checked ? 'checked' : ''}
                        onClick={() => toggleItemCheck(index)}
                      >
                        <span className="item-checkbox">
                          {item.checked ? '✓' : ''}
                        </span>
                        <span className="item-quantity">{item.quantity}</span>
                        <span className="item-name">{item.name}</span>
                        {item.count > 1 && <span className="item-count">({item.count})</span>}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroceryListPage;