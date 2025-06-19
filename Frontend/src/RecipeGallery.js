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

let hasCompletedGalleryBefore = false;

function RecipeGallery() {
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasViewedAllImages, setHasViewedAllImages] = useState(hasCompletedGalleryBefore);
  const [isInView, setIsInView] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isReverseScrolling, setIsReverseScrolling] = useState(false);
  const lastScrollY = useRef(0);
  const scrollAccumulator = useRef(0); 
  const scrollThreshold = 150; 
  const galleryRef = useRef(null);
  const containerRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const howItWorksRef = useRef(null);
  const pricingRef = useRef(null);
  const testimonialsRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const lastSection = useRef(''); 
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeTranslate, setSwipeTranslate] = useState(0);
  
  useEffect(() => {
    howItWorksRef.current = document.getElementById('how');
    pricingRef.current = document.getElementById('pricing');
    testimonialsRef.current = document.getElementById('testimonials');
    aboutRef.current = document.getElementById('about');
    featuresRef.current = document.getElementById('features');
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    let lastScroll = window.pageYOffset;
    
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      const isScrollUp = currentScroll < lastScroll;
      
      const howSection = howItWorksRef.current;
      const featuresSection = featuresRef.current;
      const pricingSection = pricingRef.current;
      const testimonialsSection = testimonialsRef.current;
      const aboutSection = aboutRef.current;
      
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
  
  useEffect(() => {
    if (hasViewedAllImages) {
      hasCompletedGalleryBefore = true;
    }
  }, [hasViewedAllImages]);
  
  useEffect(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  
    if (isMobile) return;
    
    const isComingFromBelow = ['how', 'pricing', 'testimonials', 'about'].includes(lastSection.current);
    
    if (isInView && isScrollingUp && isComingFromBelow && !isReverseScrolling) {
      setIsReverseScrolling(true);
      
      setCurrentIndex(recipeExamples.length - 1);
      
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
      }, 800); 
    }
    
    if (!isInView && autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
      setIsReverseScrolling(false);
    }
    
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
    };
  }, [isInView, isScrollingUp, isReverseScrolling, isMobile]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isInitialLoad) {
          setIsInView(entry.isIntersecting);
          
          if (entry.isIntersecting) {
            scrollAccumulator.current = 0;
          }
        }
      },
      { threshold: [0.1, 0.5] } 
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
  
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isInView || isReverseScrolling || isMobile) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      scrollAccumulator.current += Math.abs(e.deltaY);
      if (scrollAccumulator.current >= scrollThreshold) {
        const direction = e.deltaY > 0 ? 1 : -1;
        if (direction > 0) {
          if (currentIndex < recipeExamples.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            setHasViewedAllImages(true);
          }
        } else if (direction < 0) {
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
        }
        scrollAccumulator.current = 0;
      }
    };
    
    if (isInView && !isInitialLoad) {
      containerRef.current.addEventListener('wheel', handleWheel, { passive: true });
    }
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isInView, currentIndex, isInitialLoad, isReverseScrolling, isMobile]);
  
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
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setTouchStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };
  
  const handleTouchMove = (e) => {
    if (!isMobile || !isSwiping || touchStartX === null) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    
    if ((currentIndex === 0 && diff > 0) || 
        (currentIndex === recipeExamples.length - 1 && diff < 0)) {
      setSwipeTranslate(diff / 3); 
    } else {
      setSwipeTranslate(diff);
    }
  };
  
  const handleTouchEnd = (e) => {
    if (!isMobile || !isSwiping) return;
    setIsSwiping(false);
    const endX = e.changedTouches[0].clientX;
    setTouchEndX(endX);
    const slideWidth = galleryRef.current?.clientWidth || 0;
    const swipeDistance = endX - touchStartX;
    if (Math.abs(swipeDistance) > slideWidth * 0.25) {
      if (swipeDistance > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (swipeDistance < 0 && currentIndex < recipeExamples.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
    setSwipeTranslate(0);
    setTouchStartX(null);
    setTouchEndX(null);
  };
  
  const handleCardClick = (recipeId) => {
    if (!isMobile) {
      setActiveRecipe(activeRecipe === recipeId ? null : recipeId);
    }
  };
  
  useEffect(() => {
    if (galleryRef.current) {
      const slideWidth = galleryRef.current.clientWidth;
      galleryRef.current.style.transition = isSwiping 
        ? "none" 
        : (isReverseScrolling ? "transform 0.8s ease-out" : "transform 0.5s ease-out");
      galleryRef.current.style.transform = `translateX(${-currentIndex * slideWidth + swipeTranslate}px)`;
    }
  }, [currentIndex, isReverseScrolling, isSwiping, swipeTranslate]);
  
  useEffect(() => {
    const handleResize = () => {
      if (galleryRef.current) {
        const slideWidth = galleryRef.current.clientWidth;
        galleryRef.current.style.transition = "none";
        galleryRef.current.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
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
      
      <div 
        className="gallery-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="gallery-track" ref={galleryRef}>
          {recipeExamples.map((recipe) => (
            <div 
              key={recipe.id}
              className={`gallery-slide ${activeRecipe === recipe.id ? 'expanded' : ''} ${isMobile ? 'mobile' : ''}`}
              onClick={() => handleCardClick(recipe.id)}
            >
              <div className="gallery-card">
                <img src={recipe.image} alt={recipe.title} className="gallery-image" />
                <div className="gallery-content">
                  <h4>{recipe.title}</h4>
                  {activeRecipe === recipe.id && !isMobile && (
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
      
      {!isMobile && (
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
      )}
    </div>
  );
}
export default RecipeGallery;