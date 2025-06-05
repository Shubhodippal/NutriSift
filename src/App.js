import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Link } from 'react-scroll'; // Add this import at the top
import './App.css';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import AboutSection from './AboutSection';
import RecipeChatPage from './pages/RecipeChatPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import GroceryListPage from './pages/GroceryListPage';
import LoginSignup from './pages/LoginSignup'; // Add this import
import AnimatedBackground from './components/AnimatedBackground';
import { ThemeProvider } from './ThemeContext';
import RecipeGallery from './RecipeGallery';

function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  }, []);
  
  // Handle logout functionality
  const handleLogout = () => {
    // Ask for confirmation before logging out
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear localStorage
      localStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Update state
      setIsLoggedIn(false);
      
      // Redirect to home page
      navigate('/');
      
      // Show toast notification instead of alert
      showToastNotification('Logout successful!');
    }
  };
  
  // Function to show toast notification
  const showToastNotification = (message) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };
  
  // Toggle hamburger menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Close menu when navigating
  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };
  
  // Add scroll animation detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.pro-section');
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const triggerPoint = window.innerHeight * 0.8;
        
        if (sectionTop < triggerPoint) {
          section.classList.add('appear');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="app-bg-pro">
      <AnimatedBackground />
      
      <nav className="navbar-pro">
        <div className="navbar-pro__logo">
          <span className="navbar-pro__logo-icon">👩‍🍳</span>
          <span className="navbar-pro__brand">NutriSift</span>
        </div>
        <div className="navbar-pro__links">
          <Link 
            to="features" 
            smooth={true} 
            duration={500} 
            offset={-80} // Adjust based on your navbar height
            className="navbar-link"
          >
            Features
          </Link>
          <Link 
            to="how" 
            smooth={true} 
            duration={500} 
            offset={-80}
            className="navbar-link"
          >
            How It Works
          </Link>
          <Link 
            to="pricing" 
            smooth={true} 
            duration={500} 
            offset={-80}
            className="navbar-link"
          >
            Pricing
          </Link>
          <Link 
            to="testimonials" 
            smooth={true} 
            duration={500} 
            offset={-80}
            className="navbar-link"
          >
            Testimonials
          </Link>
          <Link 
            to="about" 
            smooth={true} 
            duration={500} 
            offset={-80}
            className="navbar-link"
          >
            About
          </Link>
          
          {/* Hamburger menu button */}
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
              <div className="menu-item" onClick={() => handleNavigation('/chat')}>
                <span className="menu-icon">💬</span>
                <span>Recipe Chat</span>
              </div>
              <div className="menu-item" onClick={() => handleNavigation('/saved-recipes')}>
                <span className="menu-icon">📚</span>
                <span>Saved Recipes</span>
              </div>
              <div className="menu-item" onClick={() => handleNavigation('/grocery-list')}>
                <span className="menu-icon">🛒</span>
                <span>Grocery List</span>
              </div>
            </div>
          </div>
          
          {isLoggedIn ? (
            <button
              className="navbar-pro__cta navbar-pro__logout"
              onClick={handleLogout}
            >
              <span className="logout-icon">🔓</span>
              <span className="logout-text">Logout</span>
            </button>
          ) : (
            <button
              className="navbar-pro__cta"
              onClick={() => navigate('/login')}
            >
              Try Now
            </button>
          )}
        </div>
      </nav>

      <section className="hero-pro">
        <div className="hero-pro__content">
          <h1>
            <span className="hero-pro__highlight">Smarter Cooking, Less Waste</span>
          </h1>
          <p className="hero-pro__subtitle">
            AI-powered recipes for homes, restaurants, and businesses.<br />
            Transform your ingredients into chef-level meals, save money, and help the planet.
          </p>
          <button
            className="hero-pro__cta"
            onClick={() => navigate('/chat')}
          >
            <span className="hero-pro__cta-icon">🚀</span>
            Start Generating Recipes
          </button>
          <div className="hero-pro__trusted">
            <span>Trusted by</span>
            <span className="hero-pro__trusted-logos">
              <span role="img" aria-label="restaurant">🍴</span>
              <span role="img" aria-label="home">🏠</span>
              <span role="img" aria-label="business">🏢</span>
            </span>
          </div>
        </div>
        <div className="hero-pro__image">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" alt="Chef" />
        </div>
      </section>

      <main className="main-pro">
        <section id="features" className="pro-section">
          <h2 className="pro-section__title">
            <span className="pro-section__icon">✨</span>
            Features
          </h2>
          <div className="pro-section__card">
            <FeaturesSection />
          </div>
        </section>
        <section className="pro-section">
          <h2 className="pro-section__title">
            <span className="pro-section__icon">🍲</span>
            Recipe Examples
          </h2>
          <div className="pro-section__card">
            <RecipeGallery />
          </div>
        </section>
        <section id="how" className="pro-section">
          <h2 className="pro-section__title">
            <span className="pro-section__icon">🔄</span>
            How It Works
          </h2>
          <div className="pro-section__card">
            <HowItWorksSection />
          </div>
        </section>
        <section id="pricing" className="pro-section">
          <h2 className="pro-section__title">
            <span className="pro-section__icon">💰</span>
            Pricing
          </h2>
          <div className="pro-section__card">
            <PricingSection />
          </div>
        </section>
        <section id="testimonials" className="pro-section">
          <h2 className="pro-section__title">
            <span className="pro-section__icon">⭐</span>
            Testimonials
          </h2>
          <div className="pro-section__card">
            <TestimonialsSection />
          </div>
        </section>
        <section id="about" className="pro-section">
          <h2 className="pro-section__title">
            <span className="pro-section__icon">🏢</span>
            About
          </h2>
          <div className="pro-section__card">
            <AboutSection />
          </div>
        </section>
      </main>

      <footer className="footer-pro">
        <div>
          &copy; {new Date().getFullYear()} NutriSift &mdash; Empowering Smart Kitchens
        </div>
        <div className="footer-pro__links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms</a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router basename="/NutriSift">
        <Routes>
          {/* Public routes - All routes are now accessible without authentication */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginSignup />} /> {/* Add this route */}
          <Route path="/chat" element={<RecipeChatPage />} />
          <Route path="/saved-recipes" element={<SavedRecipesPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/grocery-list" element={<GroceryListPage />} /> 
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
