import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedRecipesPage.css';

function SavedRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedRecipes = localStorage.getItem('savedRecipes');
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
  }, []);
  
  // Add toggle function for hamburger menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Add navigation handler
  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleDeleteRecipe = (id) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
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
    .filter(recipe => recipe.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  return (
    <div className="saved-recipes-page">
      <header className="saved-recipes-header">
        <h1>📚 Your Saved Recipes</h1>
        
        {/* Replace Back button with hamburger menu */}
        <div className="hamburger-menu-container">
          <button 
            className={`hamburger-button ${menuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span className="hamburger-icon"></span>
          </button>
          
          {/* Menu dropdown */}
          <div className={`menu-dropdown ${menuOpen ? 'open' : ''}`}>
            <div className="menu-item" onClick={() => handleNavigation('/')}>
              <span className="menu-icon">🏠</span>
              <span>Home</span>
            </div>
            <div className="menu-item" onClick={() => handleNavigation('/chat')}>
              <span className="menu-icon">💬</span>
              <span>Recipe Chat</span>
            </div>
            <div className="menu-item" onClick={() => handleNavigation('/grocery-list')}>
              <span className="menu-icon">🛒</span>
              <span>Grocery List</span>
            </div>
          </div>
        </div>
      </header>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search recipes..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {recipes.length === 0 ? (
        <div className="no-recipes">
          <p>You haven't saved any recipes yet.</p>
          <button onClick={() => navigate('/chat')}>Get Recipe Suggestions</button>
        </div>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <h2>{recipe.title}</h2>
              <div className="recipe-preview">
                <p>{formatPreviewText(recipe.text)}</p>
              </div>
              <div className="recipe-card-actions">
                <button onClick={() => navigate(`/recipe/${recipe.id}`)}>View Recipe</button>
                <button onClick={() => handleDeleteRecipe(recipe.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedRecipesPage;