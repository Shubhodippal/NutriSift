import React, { useState, useRef, useEffect } from 'react';
import './ImageCarousel.css';

const ImageCarousel = ({ images, altText = "Image" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle touch start event
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  // Handle touch move for interactive feedback
  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX;
    
    // Limit the drag to the next/previous image bounds with resistance
    const maxTranslate = carouselRef.current.offsetWidth * 0.8;
    const bounded = Math.max(Math.min(diff, maxTranslate), -maxTranslate);
    
    setTranslateX(bounded);
  };

  // Handle touch end event
  const handleTouchEnd = (e) => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    setTouchEndX(e.changedTouches[0].clientX);
    
    // Calculate the minimum distance needed for a swipe
    const minSwipeDistance = carouselRef.current.offsetWidth * 0.2;
    const swipeDistance = touchEndX - touchStartX;
    
    if (swipeDistance < -minSwipeDistance) {
      // Swipe left -> next image
      goToNext();
    } else if (swipeDistance > minSwipeDistance) {
      // Swipe right -> previous image
      goToPrev();
    }
    
    // Reset translate position
    setTranslateX(0);
  };

  // Handle left and right navigation
  const goToPrev = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div 
      className="image-carousel"
      ref={carouselRef}
    >
      <div 
        className="carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="carousel-item">
            <img 
              src={image} 
              alt={`${altText} ${index + 1}`} 
              className="carousel-image" 
            />
          </div>
        ))}
      </div>
      
      {/* Navigation dots */}
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button 
            key={index} 
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation arrows (shown on desktop, hidden on mobile) */}
      {!isMobile && (
        <>
          <button 
            className="carousel-arrow carousel-arrow-left" 
            onClick={goToPrev}
            aria-label="Previous image"
          >
            &#8249;
          </button>
          <button 
            className="carousel-arrow carousel-arrow-right" 
            onClick={goToNext}
            aria-label="Next image"
          >
            &#8250;
          </button>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;