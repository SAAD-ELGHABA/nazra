import React from "react";
import { useTranslation } from "react-i18next";

function StorySection() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 gap-6 items-center justify-center">
      <div className="md:w-1/2 md:h-100 overflow-hidden flex items-center">
        <img src="/About/about-story-img.png" alt="story-img" loading="lazy" />
      </div>
      <div className="flex flex-col gap-4 md:w-1/2">
        <h1
          className="font-bold text-[28px] md:text-left md:text-[46px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" , textShadow:'4px 2px 4px black'}}
        >
          {t("story.title")}
        </h1>
        <p>{t("story.paragraph1")}</p>
        <p>{t("story.paragraph2")}</p>
      </div>
    </div>
  );
}

export default StorySection;
