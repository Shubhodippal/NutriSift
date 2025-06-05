import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import AnimatedBackground from './components/AnimatedBackground';
import { ThemeProvider } from './ThemeContext';
import RecipeGallery from './RecipeGallery';

function HomePage() {
  const navigate = useNavigate();
  
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
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#about">About</a>
          
          {/* Added navigation buttons for all pages */}
          <button
            className="navbar-pro__nav-button"
            onClick={() => navigate('/chat')}
          >
            💬 Recipe Chat
          </button>
          
          <button
            className="navbar-pro__nav-button"
            onClick={() => navigate('/saved-recipes')}
          >
            📚 Saved Recipes
          </button>
          
          <button
            className="navbar-pro__nav-button"
            onClick={() => navigate('/grocery-list')}
          >
            🛒 Grocery List
          </button>
          
          <button
            className="navbar-pro__cta"
            onClick={() => navigate('/chat')}
          >
            Try Now
          </button>
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
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<RecipeChatPage />} />
          <Route path="/saved-recipes" element={<SavedRecipesPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/grocery-list" element={<GroceryListPage />} />
          {/* Remove any routes to MealPlannerPage or UserProfilePage here */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
