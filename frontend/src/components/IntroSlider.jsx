import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Define the data for the slider
const slidesData = [
  {
    id: 1,
    title: 'New Arrivals: The Summer Collection',
    subtitle: 'Explore the latest trends in eyewear. Limited stock!',
    // Use a placeholder image URL or path
    imageUrl: '/slider/slider-1.jpg',
  },
  {
    id: 2,
    title: 'Up to 50% Off: Clearance Sale',
    subtitle: 'Don\'t miss out on our biggest discounts of the season.',
    imageUrl: '/slider/Octagonal Sunglasses-1.png',
  },
  {
    id: 3,
    title: 'Premium Polarized Lenses',
    subtitle: 'Superior clarity and protection for your eyes. See the difference.',
    imageUrl: '/slider/Sophisticated Seascape Reflection Sunglasses-1.png',
  },
  {
    id: 3,
    title: 'Premium Polarized Lenses',
    subtitle: 'Superior clarity and protection for your eyes. See the difference.',
    imageUrl: '/slider/Contemplative Fashion Portrait-1.png',
    
  },
];

const IntroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = slidesData.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  // Optional: Auto-slide feature
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 7000); // Change slide every 7 seconds
    return () => clearInterval(slideInterval);
  }, [currentSlide]);

  return (
    <div className="relative w-full overflow-hidden shadow-xl h-[470px] md:h-screen">
      
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slidesData.map((slide) => (
          <div 
            key={slide.id} 
            className="w-full flex-shrink-0 relative h-full overflow-hidden" // Set a fixed height
          >
            {/* Background Image */}
            <img 
              src={slide.imageUrl} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay for Readability */}
            <div className={`absolute inset-0 bg-black opacity-40`}></div> 

            {/* Content Box */}
            <div className="relative z-10 flex flex-col justify-center items-center md:items-start h-full p-6 sm:p-10 lg:p-20 text-white max-w-4xl">
              <h1 className="text-2xl sm:text-5xl lg:text-7xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                {slide.title}
              </h1>
              <p className="text-sm sm:text-xl lg:text-2xl mb-8 font-light drop-shadow-md">
                {slide.subtitle}
              </p>
              <Link 
                to={'/store/products'} 
                className={`px-8 py-3 text-md md:text-lg font-semibold rounded-full transition duration-300 border  border-black backdrop-blur-lg hover:brightness-110 shadow-lg`}
              >
                Learn more
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons (Arrows) */}
      <button 
        onClick={prevSlide} 
        className="hidden md:block absolute top-1/2 left-4 transform -translate-y-1/2 p-3 sm:p-4 bg-white/30 hover:bg-white/50 text-white rounded-full transition duration-300 z-20 focus:outline-none"
        aria-label="Previous Slide"
      >
        {/* Left Arrow Icon (SVG) */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        onClick={nextSlide} 
        className="hidden md:block absolute top-1/2 right-4 transform -translate-y-1/2 p-3 sm:p-4 bg-white/30 hover:bg-white/50 text-white rounded-full transition duration-300 z-20 focus:outline-none"
        aria-label="Next Slide"
      >
        {/* Right Arrow Icon (SVG) */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slidesData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroSlider;