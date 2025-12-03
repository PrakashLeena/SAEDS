import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '../data/slider';

// Memoized slide component
const Slide = memo(({ slide, isActive }) => {
  const textShadowStyles = useMemo(() => ({
    title: {
      textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
    },
    subtitle: {
      textShadow: '1px 1px 4px rgba(0,0,0,0.7), 0 0 10px rgba(0,0,0,0.4)'
    },
    description: {
      textShadow: '1px 1px 3px rgba(0,0,0,0.6)'
    }
  }), []);

  return (
    <div className="relative h-full w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt={slide.title}
          className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${isActive ? 'scale-110' : 'scale-100'
            }`}
          loading={slide.id === 1 ? "eager" : "lazy"}
          fetchPriority={slide.id === 1 ? "high" : "auto"}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Subtitle */}
            <div
              className={`text-sm sm:text-base md:text-lg font-semibold text-primary-300 mb-2 sm:mb-3 transition-all duration-700 delay-100 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}
              style={textShadowStyles.subtitle}
            >
              {slide.subtitle}
            </div>

            {/* Title - Using div with role="heading" for SEO */}
            <div
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-4 transition-all duration-700 delay-300 leading-tight ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}
              style={textShadowStyles.title}
              role="heading"
              aria-level="2"
            >
              {slide.title}
            </div>

            {/* Description */}
            <p
              className={`text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-6 sm:mb-8 max-w-2xl transition-all duration-700 delay-500 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}
              style={textShadowStyles.description}
            >
              {slide.description}
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all duration-700 delay-700 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}
            >
              <a
                href={slide.cta.primary.link}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all hover:scale-105 shadow-lg text-center text-sm sm:text-base"
              >
                {slide.cta.primary.text}
              </a>
              <a
                href={slide.cta.secondary.link}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/90 hover:bg-white text-gray-900 font-bold rounded-lg transition-all hover:scale-105 shadow-lg text-center text-sm sm:text-base"
              >
                {slide.cta.secondary.text}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Slide.displayName = 'Slide';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Memoized navigation handlers
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Auto-advance slider
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Memoized dot indicators
  const dotIndicators = useMemo(() => (
    <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center space-x-2 sm:space-x-3 z-20">
      {heroSlides.map((_, index) => (
        <button
          key={index}
          onClick={() => goToSlide(index)}
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
            ? 'bg-white w-6 sm:w-8'
            : 'bg-white/50 hover:bg-white/75'
            }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  ), [currentSlide, goToSlide]);

  return (
    <div
      className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <Slide slide={slide} isActive={index === currentSlide} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Dot Indicators */}
      {dotIndicators}
    </div>
  );
};

export default HeroSlider;