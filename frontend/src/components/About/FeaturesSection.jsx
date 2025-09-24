import { Hand, InspectionPanel, Sun } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <InspectionPanel className="h-10 w-10" />,
      title: t("features.materials.title"),
      description: t("features.materials.description"),
    },
    {
      icon: <Hand className="h-10 w-10" />,
      title: t("features.handcrafted.title"),
      description: t("features.handcrafted.description"),
    },
    {
      icon: <Sun className="h-10 w-10" />,
      title: t("features.uv.title"),
      description: t("features.uv.description"),
    },
  ];

  return (
    <div className="flex flex-col p-4 md:p-10 gap-6 items-center justify-center">
      <div>
        <h1
          className="font-bold text-[28px] md:text-left md:text-[56px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px", textShadow:'4px 2px 4px black' }}
        >
          {t("features.title")}
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mt-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center gap-4">
            {feature.icon}
            <h3
              className="font-bold text-[20px] text-center md:text-[36px]"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              {feature.title}
            </h3>
            <h4 className="text-center ">{feature.description}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturesSection;
