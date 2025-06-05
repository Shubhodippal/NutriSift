import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="app-navigation">
      <div className="logo-section">
        <span role="img" aria-label="chef" className="nav-logo">👩‍🍳</span>
        <span className="nav-brand">NutriSift</span>
      </div>
      
      <button 
        className={`menu-toggle ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <li>
          <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>
            <span className="nav-icon">💬</span>
            Recipe Chat
          </Link>
        </li>
        <li>
          <Link to="/saved-recipes" className={isActive('/saved-recipes') ? 'active' : ''}>
            <span className="nav-icon">📚</span>
            Saved Recipes
          </Link>
        </li>
        <li>
          <Link to="/meal-planner" className={isActive('/meal-planner') ? 'active' : ''}>
            <span className="nav-icon">📅</span>
            Meal Planner
          </Link>
        </li>
        <li>
          <Link to="/grocery-list" className={isActive('/grocery-list') ? 'active' : ''}>
            <span className="nav-icon">🛒</span>
            Grocery List
          </Link>
        </li>
        <li>
          <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
            <span className="nav-icon">👤</span>
            Profile
          </Link>
        </li>
        <li>
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <span className="nav-icon">🏠</span>
            Home
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;