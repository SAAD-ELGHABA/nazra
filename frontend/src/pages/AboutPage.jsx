import React from "react";
import LuxurySection from "../components/About/LuxurySection";
import StorySection from "../components/About/StorySection";
import FeaturesSection from "../components/About/FeaturesSection";

function AboutPage() {
  return (
    <div className="min-h-screen w-full ">
      <LuxurySection />
      <StorySection/>
      <FeaturesSection/>
    </div>
  );
}

export default AboutPage;
