import React from "react";
import { useTranslation } from "react-i18next";

function DiscoverSection() {
  const { t } = useTranslation();

  const features = t("discover.features", { returnObjects: true });

  return (
    <div className="grid md:grid-cols-2 items-center md:p-10 p-4 w-full min-h-screen overflow-hidden gap-8">
      <div className="flex flex-col md:gap-12 gap-4">
        <h1
          className="font-bold text-[24px] md:text-[40px] w-full max-w-3xl"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          {t("discover.title")}
        </h1>
        <h5>{t("discover.subtitle")}</h5>

        <div className="flex items-center justify-center gap-4">
          {features.map((feature, index) => (
            <div key={index}>
              <h3
                className="font-medium text-[16px] md:text-[25px] w-full"
                style={{ lineHeight: "1.2", letterSpacing: "4px" }}
              >
                {feature.title}
              </h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <img
          src="/discover-section.png"
          alt="exp-section-img"
          className="w-full object-cover"
        />
      </div>
    </div>
  );
}

export default DiscoverSection;
