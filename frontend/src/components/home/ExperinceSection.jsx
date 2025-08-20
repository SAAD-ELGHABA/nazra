import { Kanban } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

function ExperinceSection() {
  const { t } = useTranslation();

  const list = t("experience.list", { returnObjects: true });

  return (
    <div className="grid md:grid-cols-2 items-center md:flex-row md:p-10 p-4 w-full min-h-screen overflow-hidden gap-4">
      <div className="flex flex-col md:gap-12 gap-4">
        <h1
          className="font-bold text-[24px] md:text-[40px] w-full max-w-3xl"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          {t("experience.title")}
        </h1>
        <h5>{t("experience.subtitle")}</h5>
        <ul>
          {list?.map((item, index) => (
            <li key={index} className="flex items-center gap-4">
              <Kanban />
              <p>{item}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <img
          src="/experience-section.png"
          alt="exp-section-img"
          className="w-full object-cover"
        />
      </div>
    </div>
  );
}

export default ExperinceSection;
