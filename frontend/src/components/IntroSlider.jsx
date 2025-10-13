import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import eng from "../locales/en/translation.json";
import fr from "../locales/fr/translation.json";
import ar from "../locales/ar/translation.json";
import { useTranslation } from "react-i18next";

const IntroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t, i18n } = useTranslation();
  const [slidesData, setSlides] = useState([]);

  useEffect(() => {
    if (i18n.language === "en") setSlides(eng?.introHomePage);
    else if (i18n.language === "fr") setSlides(fr?.introHomePage);
    else setSlides(ar?.introHomePage);
  }, [i18n.language]);

  const totalSlides = slidesData.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, totalSlides]);

  return (
    <div className="w-full h-[500px] sm:h-[600px] md:h-screen overflow-hidden">
      <div className="relative w-full h-full mx-auto rounded-xl">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slidesData.map((slide, index) => (
            <div
              key={slide.id || index}
              className="w-full flex-shrink-0 relative h-full"
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />

              <div className="relative z-10 flex flex-col justify-center items-center text-center h-full px-4 sm:px-10 text-white max-w-3xl mx-auto">
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-lg md:text-2xl mb-8 font-light drop-shadow-md max-w-2xl">
                  {slide.subtitle}
                </p>
                <Link
                  to="/store/products"
                  className="px-8 py-3 text-md md:text-lg font-semibold rounded-full shadow-lg border border-white overflow-hidden relative"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/30 via-black/30 to-white/30 animate-gradient-move"></span> <span className="relative z-10 text-white">{t("introHomePageBtn")}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="hidden md:flex absolute top-1/2 left-4 transform -translate-y-1/2 p-3 bg-white/70 hover:bg-white text-black rounded-full shadow transition z-20"
          aria-label="Previous Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="hidden md:flex absolute top-1/2 right-4 transform -translate-y-1/2 p-3 bg-white/70 hover:bg-white text-black rounded-full shadow transition z-20"
          aria-label="Next Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {slidesData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50 w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroSlider;
