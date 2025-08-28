import React, { useEffect } from "react";
import HeroSection from "../components/home/HeroSection";
import UnmatchedSection from "../components/home/UnmatchedSection";
import ExperinceSection from "../components/home/ExperinceSection";
import DiscoverSection from "../components/home/DiscoverSection";
import WebflowSection from "../components/home/WebflowSection";
import ElevateSection from "../components/home/ElevateSection";
import OurTeam from "../components/home/OurTeam";
import FAQs from "../components/FAQs";
import MarkVid from "../components/home/MarkVid";

const HomePage = () => {
    useEffect(() => {
      document.title = "Home Page - Nazra";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen w-full">
      <HeroSection />
      <UnmatchedSection />
      <ExperinceSection />
      <MarkVid/>
      <DiscoverSection />
      <WebflowSection />
      <ElevateSection />
      <OurTeam />
      <FAQs/>
    </div>
  );
};

export default HomePage;
