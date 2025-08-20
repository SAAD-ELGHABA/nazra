import React from "react";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <div className="flex md:flex-row flex-col-reverse min-h-screen w-full">
      <div className="flex flex-col items-center justify-center px-10 gap-5 py-4 md:py-0 md:gap-10">
        <h1
          className="font-bold text-[32px] text-center md:text-left md:text-[56px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          {t("hero.title")}
        </h1>
        <p className="md:text-[18px] text-sm text-center md:text-start">
          {t("hero.description")}
        </p>
        <div className="flex gap-4 md:self-start">
          <button
            className="bg-black border border-white text-sm p-2 md:p-4 text-white capitalize cursor-pointer hover:bg-transparent hover:text-black hover:border-black transition-all duration-300 ease-in"
            style={{ letterSpacing: "2px" }}
          >
            {t("hero.shop")}
          </button>
          <button
            className="bg-transparent border border-black p-2 text-sm md:p-4 text-black capitalize cursor-pointer hover:bg-black hover:text-white transition-all duration-300 ease-in"
            style={{ letterSpacing: "2px" }}
          >
            {t("hero.learnMore")}
          </button>
        </div>
      </div>
      <img
        src="/hero-section-img-2_LE_upscale_ultra_x4_strength_100_similarity_100_remove_background_general_clip_to_object_off.png"
        alt="Hero-Section"
        className="w-full h-screen object-cover"
      />
    </div>
  );
};

export default HeroSection;
