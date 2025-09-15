import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Circle,
  CircleOutlined,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import Eng from "../../locales/en/translation.json";
import fr from "../../locales/fr/translation.json";
import ar from "../../locales/ar/translation.json";
import { useTranslation } from "react-i18next";
const LuxurySlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  // Sample slides - replace with your actual brand content
  const { t, i18n } = useTranslation();

  const [slides, setSlides] = useState([]);
  useEffect(() => {
    {
      i18n.language === "en"
        ? setSlides(Eng?.LuxurySlider)
        : i18n.language === "fr"
        ? setSlides(fr?.LuxurySlider)
        : setSlides(ar?.LuxurySlider);
      console.log(slides);
    }
  }, [i18n.language, slides]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: isMobile ? "70vh" : "90vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {slides.map((slide, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: currentSlide === index ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              maxWidth: "800px",
              px: 4,
              transform:
                currentSlide === index ? "translateY(0)" : "translateY(20px)",
              transition: "transform 0.8s ease-in-out",
              opacity: currentSlide === index ? 1 : 0,
              transitionDelay: currentSlide === index ? "0.3s" : "0s",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                letterSpacing: "3px",
                mb: 2,
                display: "block",
                opacity: 0.8,
                fontSize: isMobile ? "0.7rem" : "0.8rem",
              }}
            >
              {slide.subtitle}
            </Typography>

            <Typography
              variant={isMobile ? "h3" : "h1"}
              sx={{
                fontWeight: 300,
                mb: 3,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {slide.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: isMobile ? "1rem" : "1.2rem",
                maxWidth: "600px",
                mx: "auto",
                opacity: 0.9,
              }}
            >
              {slide.description}
            </Typography>

            <Link
              to={slide.ctaLink}
              className="px-4 py-2 border border-white hover:text-black hover:bg-white"
            >
              {slide.cta}
            </Link>
          </Box>
        </Box>
      ))}

      {/* Navigation Arrows */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          left: 20,
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
        }}
      >
        <KeyboardArrowLeft fontSize="large" />
      </IconButton>

      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
        }}
      >
        <KeyboardArrowRight fontSize="large" />
      </IconButton>

      {/* Dots Indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {slides.map((_, index) => (
          <IconButton
            key={index}
            onClick={() => goToSlide(index)}
            sx={{ color: "white", p: 0.5 }}
          >
            {currentSlide === index ? (
              <Circle sx={{ fontSize: "12px" }} />
            ) : (
              <CircleOutlined sx={{ fontSize: "12px" }} />
            )}
          </IconButton>
        ))}
      </Box>
    </Box>
  );
};

export default LuxurySlider;
