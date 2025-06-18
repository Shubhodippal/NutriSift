import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HamburgerMenu.css';

function HamburgerMenu({ additionalItems, onLogout, isLoggedIn, onClearCache }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  // Default menu items that appear on all pages
  const defaultMenuItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/chat', icon: '💬', label: 'Recipe Chat' },
    { path: '/discover-recipes', icon: '🔍', label: 'Discover Recipes' }, 
    { path: '/saved-recipes', icon: '📚', label: 'Saved Recipes' },
    { path: '/grocery-list', icon: '🛒', label: 'Grocery List' },
    { path: '/meal-planner', icon: '🗓️', label: 'Meal Planner' }, // Add this line
    { path: '/nearby-restaurants', icon: '🍽️', label: 'Find Restaurants' },
    { path: '/profile', icon: '👤', label: 'My Profile' },
  ];

  const handleClearChat = () => {
    if (typeof additionalItems?.clearChat === 'function') {
      additionalItems.clearChat();
      setMenuOpen(false);
    }
  };

  return (
    <div className="hamburger-menu-container">
      <button 
        className={`hamburger-button ${menuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span className="hamburger-icon"></span>
      </button>
      
      <div className={`menu-dropdown ${menuOpen ? 'open' : ''}`}>
        {defaultMenuItems.map(item => (
          <div 
            key={item.path} 
            className="menu-item" 
            onClick={() => handleNavigation(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        {/* Special items for specific pages */}
        {additionalItems?.showNewChat && (
          <div className="menu-item" onClick={handleClearChat}>
            <span className="menu-icon">🔄</span>
            <span>Clear Chat</span>
          </div>
        )}

        {/* Logout option if user is logged in */}
        {isLoggedIn && onLogout && (
          <div className="menu-item logout-item" onClick={onLogout}>
            <span className="menu-icon">🔓</span>
            <span>Logout</span>
          </div>
        )}

        {/* Clear Recipe Cache option if user is logged in */}
        {isLoggedIn && onClearCache && (
          <div className="menu-item" onClick={onClearCache}>
            <span className="menu-icon">🧹</span>
            <span className="menu-text">Clear Recipe Cache</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HamburgerMenu;