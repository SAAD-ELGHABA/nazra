import React from "react";
import HeroSection from "../components/home/HeroSection";
import UnmatchedSection from "../components/home/UnmatchedSection";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <HeroSection />
      <UnmatchedSection />
    </div>
  );
};

export default HomePage;
