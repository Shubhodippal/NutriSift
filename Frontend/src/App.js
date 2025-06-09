import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Link } from 'react-scroll'; 
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
import LoginSignup from './pages/LoginSignup';
import AnimatedBackground from './components/AnimatedBackground';
import RecipeGallery from './RecipeGallery';
import RestaurantMapPage from './pages/RestaurantMapPage'; 
import HamburgerMenu from './components/HamburgerMenu';
import DiscoverRecipePage from './pages/DiscoverRecipePage'; 

function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  }, []);
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.clear();
      
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      setIsLoggedIn(false);
      
      navigate('/');
      
      showToastNotification('Logout successful!');
    }
  };
  
  const showToastNotification = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };
  
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
            offset={-80} 
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
          
          <HamburgerMenu 
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
          
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
    <Router> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/chat" element={<RecipeChatPage />} />
        <Route path="/saved-recipes" element={<SavedRecipesPage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        <Route path="/recipe/view/:id" element={<RecipeDetailPage />} /> 
        <Route path="/grocery-list" element={<GroceryListPage />} />
        <Route path="/nearby-restaurants" element={<RestaurantMapPage />} />
        <Route path="/discover-recipes" element={<DiscoverRecipePage />} /> 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;