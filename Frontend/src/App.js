import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Navigate, Link as RouterLink } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll'; 
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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import { checkTokenExpiration } from './utils/authUtils';
import ProfileDetails from './pages/ProfileDetails';
import PersonalizedMealPlannerPage from './pages/PersonalizedMealPlannerPage';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function HomePage({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  // Add state for the signup banner
  const [showSignupBanner, setShowSignupBanner] = useState(false);
  
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
      const isMobile = window.innerWidth <= 768;
      const sections = document.querySelectorAll('.pro-section');
      sections.forEach(section => {
        if (isMobile) {
          section.classList.add('appear');
          section.classList.add('mobile-fixed');
        } else {
          section.classList.remove('mobile-fixed');
          const sectionTop = section.getBoundingClientRect().top;
          const triggerPoint = window.innerHeight * 0.8;
          
          if (sectionTop < triggerPoint) {
            section.classList.add('appear');
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    if (window.innerWidth <= 768) {
      document.querySelectorAll('.pro-section').forEach(section => {
        section.classList.add('appear', 'mobile-fixed');
      });
    }
  }, []);
  
  useEffect(() => {
    if (!isLoggedIn) {
      const bannerTimer = setTimeout(() => {
        setShowSignupBanner(true);
      }, 2000); 
      
      return () => clearTimeout(bannerTimer);
    }
  }, [isLoggedIn]);
  
  return (
    <div className="app-bg-pro">
      <SEO 
        title="AI-Powered Recipe Generator" 
        description="Transform your ingredients into chef-level meals, save money, and help the planet with our AI-powered recipe generator."
        keywords="AI recipes, recipe generator, meal planner, food waste reduction, smart cooking"
        url="/"
      />
      <AnimatedBackground />
      
      {showSignupBanner && !isLoggedIn && (
        <div className="signup-banner">
          <button 
            className="signup-banner__close"
            onClick={() => setShowSignupBanner(false)}
          >
            ✕
          </button>
          <div className="signup-banner__content">
            <h3>🎁 Unlock All Premium Features!</h3>
            <p>Join <span className="highlight">10,000+</span> users who save time and reduce food waste</p>
            <ul className="signup-banner__benefits">
              <li>✅ Unlimited AI recipe generation</li>
              <li>✅ Personalized meal planning</li>
              <li>✅ Save favorite recipes</li>
            </ul>
            <div className="signup-banner__actions">
              <button 
                className="signup-banner__cta"
                onClick={() => navigate('/login?formMode=signup')}
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      )}
      
      <nav className="navbar-pro">
        <div className="navbar-pro__logo">
          <span className="navbar-pro__logo-icon">👩‍🍳</span>
          <span className="navbar-pro__brand">NutriSift</span>
        </div>
        
        <div className="navbar-pro__links">
          <ScrollLink 
            to="features" 
            smooth={true} 
            duration={500} 
            offset={-80} 
            className="navbar-link"
          >
            Features
          </ScrollLink>
          <ScrollLink 
            to="how" 
            smooth={true} 
            duration={500} 
            offset={-80}
            className="navbar-link"
          >
            How It Works
          </ScrollLink>
          <ScrollLink 
            to="pricing" 
            smooth={true} 
            duration={500} 
            offset={-80}
            className="navbar-link"
          >
            Pricing
          </ScrollLink>
          <ScrollLink 
            to="testimonials" 
            smooth={true} 
            duration={500} 
            offset={-80}
            className="navbar-link"
          >
            Testimonials
          </ScrollLink>
          <ScrollLink 
            to="about" 
            smooth={true} 
            duration={500} 
            offset={-80}
            className="navbar-link"
          >
            About
          </ScrollLink>
          
          {isLoggedIn && (
            <button
              className="navbar-pro__cta navbar-pro__logout navbar-pro__logout--desktop"
              onClick={handleLogout}
            >
              <span className="logout-icon">🔓</span>
              <span className="logout-text">Logout</span>
            </button>
          )}

          {!isLoggedIn && (
            <button
              className="navbar-pro__cta navbar-pro__cta--desktop"
              onClick={() => navigate('/login')}
            >
              Try Now
            </button>
          )}
        </div>
        
        <div className="navbar-pro__mobile-controls">
          {!isLoggedIn && (
            <button
              className="navbar-pro__cta navbar-pro__cta--mobile"
              onClick={() => navigate('/login')}
            >
              Try Now
            </button>
          )}
          
          <HamburgerMenu 
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
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
          <div className="hero-pro__benefits">
            <div className="hero-pro__benefit-item">🔍 Find recipes for any ingredients</div>
            <div className="hero-pro__benefit-item">⏱️ Save time planning meals</div>
            <div className="hero-pro__benefit-item">💰 Reduce food waste & grocery costs</div>
          </div>
          {isLoggedIn ? (
            <button
              className="hero-pro__cta"
              onClick={() => navigate('/chat')}
            >
              <span className="hero-pro__cta-icon">🚀</span>
              Start Generating Recipes
            </button>
          ) : (
            <div className="hero-pro__cta-container">
              <button
                className="hero-pro__cta"
                onClick={() => navigate('/login?formMode=signup')}
              >
                <span className="hero-pro__cta-icon">✨</span>
                Join Free for 14 Days
              </button>
              <p className="hero-pro__cta-subtext">No credit card required</p>
            </div>
          )}
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
          <RouterLink to="/privacy-policy">Privacy Policy</RouterLink>
          <RouterLink to="/terms-and-conditions">Terms</RouterLink>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const decodeJWT = (token) => {
    try {
      const [headerEncoded, payloadEncoded] = token.split('.');
      const payload = JSON.parse(atob(payloadEncoded));
      return payload;
    } catch (err) {
      console.error("Invalid JWT token:", err);
      return null;
    }
  };

  useEffect(() => {
    const checkExpiration = async () => {
      const isExpired = await checkTokenExpiration();
      
      if (isExpired) {
        const token = localStorage.getItem('token');
        const decoded = decodeJWT(token);
        setIsLoggedIn(!!(decoded && decoded.userId));
      }
    };
    checkExpiration();
    const intervalId = setInterval(() => {
      checkExpiration();
    }, 900000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <HelmetProvider>
      <Router> 
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/login" element={<LoginSignup setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/chat" element={<ProtectedRoute element={<RecipeChatPage />} />} />
          <Route path="/saved-recipes" element={<ProtectedRoute element={<SavedRecipesPage />} />} />
          <Route path="/recipe/:id" element={<ProtectedRoute element={<RecipeDetailPage />} />} />
          <Route path="/recipe/view/:id" element={<ProtectedRoute element={<RecipeDetailPage />} />} /> 
          <Route path="/grocery-list" element={<ProtectedRoute element={<GroceryListPage />} />} />
          <Route path="/nearby-restaurants" element={<ProtectedRoute element={<RestaurantMapPage />} />} />
          <Route path="/discover-recipes" element={<ProtectedRoute element={<DiscoverRecipePage />} />} /> 
          <Route path="/profile" element={<ProtectedRoute element={<ProfileDetails />} />} />
          <Route path="/meal-planner" element={<ProtectedRoute element={<PersonalizedMealPlannerPage />} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;