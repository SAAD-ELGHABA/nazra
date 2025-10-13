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
    {
      i18n.language === "en"
        ? setSlides(eng?.introHomePage)
        : i18n.language === "fr"
        ? setSlides(fr?.introHomePage)
        : setSlides(ar?.introHomePage);
    }
  }, [i18n.language]);

  const totalSlides = slidesData.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [currentSlide]);

  return (
    <div className=" w-full  overflow-hidden  h-[470px] md:h-screen">
      <div className="w-[90%] relative overflow-hidden mx-auto h-[80vh] rounded-xl mt-[5vh] ">
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slidesData.map((slide) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative h-full overflow-hidden"
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-black opacity-40`}></div>

            <div className="relative z-10 flex flex-col justify-center items-center md:items-center text-center h-full p-6 sm:p-10 lg:p-20 text-white max-w-4xl mx-auto ">
            <h1 className="relative text-2xl sm:text-5xl lg:text-7xl font-extrabold mb-4 drop-shadow-lg leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-black to-white animate-gradient-move">
              {slide.title}
            </h1>

              <p className="text-sm sm:text-xl lg:text-2xl mb-8 font-light drop-shadow-md">
                {slide.subtitle}
              </p>
            <Link
              to="/store/products"
              className="px-8 py-3 text-md md:text-lg font-semibold rounded-full shadow-lg border border-white overflow-hidden relative"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/30 via-black/30 to-white/30 animate-gradient-move"></span>
              <span className="relative z-10 text-white">{t("introHomePageBtn")}</span>
            </Link>

            </div>
          </div>
        ))}
      </div>
      <button
        onClick={prevSlide}
        className="hidden md:block absolute top-1/2 -left-6  shadow transform -translate-y-1/2 p-3 sm:p-4 bg-white hover:bg-white/50 border border-gray-300 text-black rounded-full transition duration-300 z-20 focus:outline-none"
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:block absolute top-1/2 -right-6 shadow transform -translate-y-1/2 p-3 sm:p-4 bg-white hover:bg-white/50 border border-gray-300 text-black rounded-full transition duration-300 z-20 focus:outline-none"
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

      <div className="absolute -bottom-2 p-2 rounded-xl bg-white left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slidesData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none ${
              index === currentSlide
                ? "bg-black w-8"
                : "bg-black/50 hover:bg-black/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      </div>

    </div>
  );
};

export default IntroSlider;
