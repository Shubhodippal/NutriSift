import React, { useState, useRef, useEffect } from 'react';

const recipeExamples = [
  { 
    id: 1, 
    title: "Vegetable Stir Fry", 
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    ingredients: "Bell peppers, broccoli, carrots, soy sauce, garlic, ginger, sesame oil"
  },
  { 
    id: 2, 
    title: "Berry Smoothie Bowl", 
    image: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?auto=format&fit=crop&w=900&q=80",
    ingredients: "Mixed berries, banana, yogurt, granola, chia seeds, honey, coconut flakes"
  },
  { 
    id: 3, 
    title: "Lemon Herb Chicken", 
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
    ingredients: "Chicken breast, lemon, rosemary, thyme, garlic, olive oil, salt, pepper"
  },
  {
    id: 4,
    title: "Mediterranean Pasta",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80",
    ingredients: "Spaghetti, cherry tomatoes, olives, feta cheese, olive oil, garlic, basil"
  },
  {
    id: 5,
    title: "Avocado Toast",
    image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=900&q=80",
    ingredients: "Sourdough bread, avocado, cherry tomatoes, feta cheese, microgreens, olive oil, salt, pepper"
  }
];

// Create a variable outside component to persist between re-renders
let hasCompletedGalleryBefore = false;

function RecipeGallery() {
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasViewedAllImages, setHasViewedAllImages] = useState(hasCompletedGalleryBefore);
  const [isInView, setIsInView] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isReverseScrolling, setIsReverseScrolling] = useState(false);
  const lastScrollY = useRef(0);
  const scrollAccumulator = useRef(0); // Added for slower scrolling
  const scrollThreshold = 150; // Increased threshold for slower scrolling
  const galleryRef = useRef(null);
  const containerRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const howItWorksRef = useRef(null);
  const pricingRef = useRef(null);
  const testimonialsRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const lastSection = useRef(''); // Track the last section we were in
  
  // Find all section references on mount
  useEffect(() => {
    howItWorksRef.current = document.getElementById('how');
    pricingRef.current = document.getElementById('pricing');
    testimonialsRef.current = document.getElementById('testimonials');
    aboutRef.current = document.getElementById('about');
    featuresRef.current = document.getElementById('features');
  }, []);
  
  // Ensure smooth initial load
  useEffect(() => {
    // Set initial load to false after a delay
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Track scroll direction with more reliability and track section position
  useEffect(() => {
    let lastScroll = window.pageYOffset;
    
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      const isScrollUp = currentScroll < lastScroll;
      
      // Track which section we're in or coming from
      const howSection = howItWorksRef.current;
      const featuresSection = featuresRef.current;
      const pricingSection = pricingRef.current;
      const testimonialsSection = testimonialsRef.current;
      const aboutSection = aboutRef.current;
      
      // Find which section we're in or coming from
      if (aboutSection && currentScroll >= aboutSection.offsetTop - 100) {
        if (lastSection.current !== 'about') {
          lastSection.current = 'about';
        }
      } else if (testimonialsSection && currentScroll >= testimonialsSection.offsetTop - 100) {
        if (lastSection.current !== 'testimonials') {
          lastSection.current = 'testimonials';
        }
      } else if (pricingSection && currentScroll >= pricingSection.offsetTop - 100) {
        if (lastSection.current !== 'pricing') {
          lastSection.current = 'pricing';
        }
      } else if (howSection && currentScroll >= howSection.offsetTop - 100) {
        if (lastSection.current !== 'how') {
          lastSection.current = 'how';
        }
      } else if (featuresSection && currentScroll >= featuresSection.offsetTop - 100) {
        if (lastSection.current !== 'features') {
          lastSection.current = 'features';
        }
      }
      
      setIsScrollingUp(isScrollUp);
      lastScrollY.current = lastScroll;
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Update the external variable when all images have been viewed
  useEffect(() => {
    if (hasViewedAllImages) {
      hasCompletedGalleryBefore = true;
    }
  }, [hasViewedAllImages]);
  
  // Enhanced reverse auto-scrolling when scrolling back up to gallery
  useEffect(() => {
    // Clear any existing interval first to prevent overlapping
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
    
    // Trigger reverse scrolling when: 
    // 1. Gallery is in view
    // 2. We're scrolling up 
    // 3. We're coming from a section below the gallery (how, pricing, testimonials, about)
    const isComingFromBelow = ['how', 'pricing', 'testimonials', 'about'].includes(lastSection.current);
    
    if (isInView && isScrollingUp && isComingFromBelow && !isReverseScrolling) {
      setIsReverseScrolling(true);
      
      // Reset to the last image
      setCurrentIndex(recipeExamples.length - 1);
      
      // Auto-scroll back through images at a slower pace for better visibility
      autoScrollInterval.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          if (prevIndex <= 0) {
            clearInterval(autoScrollInterval.current);
            autoScrollInterval.current = null;
            setIsReverseScrolling(false);
            return 0;
          }
          return prevIndex - 1;
        });
      }, 800); // Even slower timing for better visibility (increased from 600ms)
    }
    
    // Cleanup interval when gallery is no longer in view
    if (!isInView && autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
      setIsReverseScrolling(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
    };
  }, [isInView, isScrollingUp, isReverseScrolling]);
  
  // Improved intersection observer with higher sensitivity
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Don't set isInView during initial load
        if (!isInitialLoad) {
          setIsInView(entry.isIntersecting);
          
          // Reset scroll accumulator when entering view
          if (entry.isIntersecting) {
            scrollAccumulator.current = 0;
          }
        }
      },
      { threshold: [0.1, 0.5] } // Multiple thresholds for better detection
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isInitialLoad]);
  
  // Handle wheel events for horizontal scrolling when in gallery - SLOWED DOWN
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isInView || isReverseScrolling) return;
      
      // If the wheel event has horizontal scrolling, let browser handle it
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      // Don't prevent default scroll - let the page scroll normally
      // But slow down the horizontal scrolling by accumulating scroll values
      
      // Accumulate scroll value
      scrollAccumulator.current += Math.abs(e.deltaY);
      
      // Only change slide when we've accumulated enough scroll
      if (scrollAccumulator.current >= scrollThreshold) {
        const direction = e.deltaY > 0 ? 1 : -1;
        
        if (direction > 0) {
          // Scroll right (next image)
          if (currentIndex < recipeExamples.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            // Reached the end of images
            setHasViewedAllImages(true);
          }
        } else if (direction < 0) {
          // Scroll left (previous image)
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
        }
        
        // Reset accumulator after changing slide
        scrollAccumulator.current = 0;
      }
    };
    
    // Add event listener when gallery is in view
    if (isInView && !isInitialLoad) {
      containerRef.current.addEventListener('wheel', handleWheel, { passive: true });
    }
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isInView, currentIndex, isInitialLoad, isReverseScrolling]);
  
  // Handle keyboard navigation for horizontal gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isInView) return;
      
      if (e.key === 'ArrowRight') {
        if (currentIndex < recipeExamples.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setHasViewedAllImages(true);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInView, currentIndex]);
  
  // Smooth animation to current slide when index changes
  useEffect(() => {
    if (galleryRef.current) {
      const slideWidth = galleryRef.current.clientWidth;
      galleryRef.current.style.transition = isReverseScrolling 
        ? "transform 0.8s ease-out" // Slower transition during reverse scrolling
        : "transform 0.5s ease-out";
      galleryRef.current.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
  }, [currentIndex, isReverseScrolling]);
  
  // Handle window resize to maintain proper slide positioning
  useEffect(() => {
    const handleResize = () => {
      if (galleryRef.current) {
        const slideWidth = galleryRef.current.clientWidth;
        // Disable transition during resize to prevent jumpy behavior
        galleryRef.current.style.transition = "none";
        galleryRef.current.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        // Re-enable transition after a small delay
        setTimeout(() => {
          if (galleryRef.current) {
            galleryRef.current.style.transition = "transform 0.5s ease-out";
          }
        }, 50);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);
  
  return (
    <div className="gallery-section" ref={containerRef}>
      <h3 className="gallery-title">Explore Our Recipes</h3>
      
      <div className="gallery-wrapper">
        <div className="gallery-track" ref={galleryRef}>
          {recipeExamples.map((recipe) => (
            <div 
              key={recipe.id}
              className={`gallery-slide ${activeRecipe === recipe.id ? 'expanded' : ''}`}
              onClick={() => setActiveRecipe(activeRecipe === recipe.id ? null : recipe.id)}
            >
              <div className="gallery-card">
                <img src={recipe.image} alt={recipe.title} className="gallery-image" />
                <div className="gallery-content">
                  <h4>{recipe.title}</h4>
                  {activeRecipe === recipe.id && (
                    <p className="recipe-ingredients">{recipe.ingredients}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="gallery-indicator">
        {recipeExamples.map((_, index) => (
          <span 
            key={index} 
            className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      
      <div className="gallery-controls">
        <button 
          className="gallery-button prev" 
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          ←
        </button>
        <button 
          className="gallery-button next" 
          onClick={() => {
            if (currentIndex < recipeExamples.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else {
              setHasViewedAllImages(true);
            }
          }}
          disabled={currentIndex === recipeExamples.length - 1}
        >
          →
        </button>
      </div>
    </div>
  );
}

export default RecipeGallery;