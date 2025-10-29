import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '../data/slider';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(0); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div 
      className="slider-container relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover slider-image ${
                index === currentSlide ? 'slider-image-active' : ''
              }`}
            />
            {/* Overlay */}
            <div className="absolute inset-0 gradient-overlay-dark"></div>
            <div className="absolute inset-0 gradient-overlay-primary"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                <h1
                  className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 text-shadow-lg transition-all duration-700 delay-300 ${
                    index === currentSlide
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-10 opacity-0'
                  }`}
                >
                  {slide.title}
                </h1>
                <p
                  className={`text-2xl md:text-3xl text-primary-200 mb-4 text-shadow-md transition-all duration-700 delay-500 ${
                    index === currentSlide
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-10 opacity-0'
                  }`}
                >
                  {slide.subtitle}
                </p>
                <p
                  className={`text-lg md:text-xl text-gray-200 mb-8 text-shadow-md transition-all duration-700 delay-700 ${
                    index === currentSlide
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-10 opacity-0'
                  }`}
                >
                  {slide.description}
                </p>

                {/* CTA Buttons */}
                <div
                  className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-900 ${
                    index === currentSlide
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-10 opacity-0'
                  }`}
                >
                  {slide.cta.primary.link.startsWith('#') ? (
                    <a
                      href={slide.cta.primary.link}
                      className="btn-primary bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all hover:scale-105 text-center shadow-lg relative z-10"
                    >
                      {slide.cta.primary.text}
                    </a>
                  ) : (
                    <Link
                      to={slide.cta.primary.link}
                      className="btn-primary bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all hover:scale-105 text-center shadow-lg relative z-10"
                    >
                      {slide.cta.primary.text}
                    </Link>
                  )}

                  {slide.cta.secondary.link.startsWith('#') ? (
                    <a
                      href={slide.cta.secondary.link}
                      className="btn-secondary bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all hover:scale-105 text-center border-2 border-white/30 shadow-lg"
                    >
                      {slide.cta.secondary.text}
                    </a>
                  ) : (
                    <Link
                      to={slide.cta.secondary.link}
                      className="btn-secondary bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all hover:scale-105 text-center border-2 border-white/30 shadow-lg"
                    >
                      {slide.cta.secondary.text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="slider-nav-btn absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="slider-nav-btn absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`slider-dot ${
              index === currentSlide
                ? 'slider-dot-active w-12 h-3 bg-white rounded-full'
                : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="slide-counter absolute top-8 right-8 bg-black/30 text-white px-4 py-2 rounded-full text-sm font-semibold">
        {currentSlide + 1} / {heroSlides.length}
      </div>
    </div>
  );
};

export default HeroSlider;
