import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import your hero image
// Ensure this image is in your src/assets/images folder or public folder
import heroImage from '../assets/images/saeds-hero-education.webp';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slider (optional, can be removed if single image)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 0 : 0)); // Placeholder for multi-slide logic
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
      {/* Slide Container */}
      <div className="relative h-full w-full">
        {/* Image */}
        <img
          src={heroImage}
          alt="SAEDS student community studying together in Sri Lanka, promoting education"
          className="w-full h-full object-cover opacity-60"
          loading="eager" // Load immediately for LCP (Largest Contentful Paint)
          width="1920"
          height="1080"
          fetchPriority="high"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            {/* Main H1 Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
              SAEDS Community Hub – Student Association for Environmental Development
            </h1>

            {/* Subheading / Description */}
            <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto drop-shadow-md">
              Empowering Sri Lankan students through free education, E-Library resources, and environmental sustainability.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/browse"
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors shadow-lg"
              >
                Access E-Library
              </a>
              <a
                href="/join"
                className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg transition-colors shadow-lg"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;