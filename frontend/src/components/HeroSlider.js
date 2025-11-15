import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '../data/slider';

// Constants
const AUTO_PLAY_INTERVAL = 5000;
const RESUME_AUTO_PLAY_DELAY = 10000;
const MIN_SWIPE_DISTANCE = 50;

// Memoized navigation button component
const NavButton = memo(({ onClick, direction, ariaLabel }) => {
  const isLeft = direction === 'left';
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  const positionClass = isLeft ? 'left-2 sm:left-4' : 'right-2 sm:right-4';
  
  return (
    <button
      onClick={onClick}
      className={`slider-nav-btn absolute ${positionClass} top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full z-10 backdrop-blur-md shadow-lg border border-white/20 touch-manipulation transition-colors`}
      aria-label={ariaLabel}
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
});

NavButton.displayName = 'NavButton';

// Memoized dot indicator component
const DotIndicator = memo(({ index, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`slider-dot touch-manipulation transition-all ${
      isActive
        ? 'slider-dot-active w-8 sm:w-10 md:w-12 h-2 sm:h-2.5 md:h-3 bg-white rounded-full shadow-lg'
        : 'w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-white/60 rounded-full hover:bg-white/80 shadow-md'
    }`}
    aria-label={`Go to slide ${index + 1}`}
  />
));

DotIndicator.displayName = 'DotIndicator';

// Memoized CTA Button component
const CTAButton = memo(({ cta, onButtonClick, isPrimary }) => {
  const baseClass = "px-3 py-1.5 sm:px-6 sm:py-3 md:px-6 md:py-3 rounded-lg text-xs sm:text-base font-bold transition-all hover:scale-105 text-center shadow-xl relative z-10 touch-manipulation whitespace-nowrap";
  const primaryClass = isPrimary 
    ? "btn-primary bg-primary-600 text-white hover:bg-primary-700" 
    : "btn-secondary bg-white/25 backdrop-blur-md text-white hover:bg-white/35 border-2 border-white/60";
  
  const isSpecialLink = cta.link.startsWith('#') || cta.link === '/join';
  
  if (isSpecialLink) {
    return (
      <button
        onClick={(e) => onButtonClick(e, cta.link)}
        className={`${baseClass} ${primaryClass}`}
      >
        {cta.text}
      </button>
    );
  }
  
  return (
    <Link
      to={cta.link}
      className={`${baseClass} ${primaryClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      {cta.text}
    </Link>
  );
});

CTAButton.displayName = 'CTAButton';

const HeroSlider = memo(({ onOpenJoinModal }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Use refs to avoid recreating timeout handlers
  const autoPlayTimeoutRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  // Memoize slides length
  const slidesLength = useMemo(() => heroSlides.length, []);

  // Memoized text shadow styles
  const textShadowStyles = useMemo(() => ({
    title: { textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)' },
    subtitle: { textShadow: '0 2px 8px rgba(0,0,0,0.7)' },
    description: { textShadow: '0 2px 6px rgba(0,0,0,0.7)' }
  }), []);

  // Cleanup timeouts
  const clearTimeouts = useCallback(() => {
    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  }, []);

  // Optimized auto-play with cleanup
  useEffect(() => {
    if (!isAutoPlaying) return;

    autoPlayTimeoutRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesLength);
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearInterval(autoPlayTimeoutRef.current);
      }
    };
  }, [isAutoPlaying, slidesLength]);

  // Resume auto-play helper
  const pauseAndResumeAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    clearTimeouts();
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, RESUME_AUTO_PLAY_DELAY);
  }, [clearTimeouts]);

  // Navigation functions
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    pauseAndResumeAutoPlay();
  }, [pauseAndResumeAutoPlay]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slidesLength);
    pauseAndResumeAutoPlay();
  }, [slidesLength, pauseAndResumeAutoPlay]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slidesLength) % slidesLength);
    pauseAndResumeAutoPlay();
  }, [slidesLength, pauseAndResumeAutoPlay]);

  // Touch handlers
  const onTouchStart = useCallback((e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    if (touchStart && Math.abs(touchStart - currentTouch) > 10) {
      e.preventDefault();
    }
  }, [touchStart]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    
    if (distance > MIN_SWIPE_DISTANCE) {
      nextSlide();
    } else if (distance < -MIN_SWIPE_DISTANCE) {
      prevSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  // Handle CTA button clicks
  const handleButtonClick = useCallback((e, link) => {
    e.preventDefault();
    e.stopPropagation();

    if (link.startsWith('#')) {
      const element = document.getElementById(link.substring(1));
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (link === '/join' && onOpenJoinModal) {
      onOpenJoinModal();
    }
  }, [onOpenJoinModal]);

  // Determine which images to render (current and adjacent)
  const shouldRenderImage = useCallback((index) => {
    return (
      index === currentSlide ||
      index === (currentSlide + 1) % slidesLength ||
      index === (currentSlide - 1 + slidesLength) % slidesLength
    );
  }, [currentSlide, slidesLength]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  return (
    <div 
      className="slider-container relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {heroSlides.map((slide, index) => {
        const isActive = index === currentSlide;
        const shouldRender = shouldRenderImage(index);
        
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              {shouldRender && (
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading={isActive ? 'eager' : 'lazy'}
                  fetchpriority={isActive ? 'high' : 'low'}
                  decoding="async"
                  className={`w-full h-full object-cover slider-image ${
                    isActive ? 'slider-image-active' : ''
                  }`}
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 md:from-black/50 md:via-black/40 md:to-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl">
                  <h1
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-4 transition-all duration-700 delay-300 leading-tight ${
                      isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                    }`}
                    style={textShadowStyles.title}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className={`text-base sm:text-lg md:text-xl lg:text-2xl text-primary-100 mb-3 sm:mb-4 md:mb-4 font-medium transition-all duration-700 delay-500 ${
                      isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                    }`}
                    style={textShadowStyles.subtitle}
                  >
                    {slide.subtitle}
                  </p>
                  <p
                    className={`text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-4 sm:mb-5 md:mb-6 transition-all duration-700 delay-700 line-clamp-3 sm:line-clamp-3 md:line-clamp-none leading-relaxed ${
                      isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                    }`}
                    style={textShadowStyles.description}
                  >
                    {slide.description}
                  </p>

                  {/* CTA Buttons */}
                  <div
                    className={`flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 transition-all duration-700 delay-900 ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                  >
                    <CTAButton 
                      cta={slide.cta.primary} 
                      onButtonClick={handleButtonClick}
                      isPrimary={true}
                    />
                    <CTAButton 
                      cta={slide.cta.secondary} 
                      onButtonClick={handleButtonClick}
                      isPrimary={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <NavButton onClick={prevSlide} direction="left" ariaLabel="Previous slide" />
      <NavButton onClick={nextSlide} direction="right" ariaLabel="Next slide" />

      {/* Dots Navigation */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
        {heroSlides.map((_, index) => (
          <DotIndicator
            key={index}
            index={index}
            isActive={index === currentSlide}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="slide-counter absolute top-3 right-3 sm:top-4 sm:right-4 md:top-8 md:right-8 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-sm sm:text-sm font-bold shadow-lg border border-white/20">
        {currentSlide + 1} / {slidesLength}
      </div>
    </div>
  );
});

HeroSlider.displayName = 'HeroSlider';

export default HeroSlider;