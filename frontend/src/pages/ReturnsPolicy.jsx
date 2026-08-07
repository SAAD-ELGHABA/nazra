import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SITE_CONFIG } from "../config/site";

export default function ReturnsPolicy() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  useEffect(()=>{
    window.scrollTo(0,0);
  },[])

  return (
    <section
      className="w-full  text-black py-16 px-6 md:px-12 lg:px-20"
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          {t("returnsPolicy.title")}
        </h1>
        <p className="text-gray-700 text-sm md:text-base">
          {t("returnsPolicy.intro")}
        </p>

        {t("returnsPolicy.sections", { returnObjects: true }).map((section, index) => (
          <div key={index} className="space-y-2">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <p className="text-gray-700">{section.content}</p>
          </div>
        ))}

        <div className="mt-6 p-6 border text-black border-gray-700 rounded-lg ">
          <h3 className="text-lg font-semibold mb-2">{t("returnsPolicy.contactTitle")}</h3>
          <p className=" mb-1">
            {t("returnsPolicy.contactEmail")}:{" "}
            <a href={`mailto:${SITE_CONFIG.email}`} className="underline underline-offset-4" dir="ltr">
              {SITE_CONFIG.email}
            </a>
          </p>
          <p className="">
            {t("returnsPolicy.contactPhone")}:{" "}
            <a href={`tel:${SITE_CONFIG.phone.replace(/\s/g, "")}`} className="underline underline-offset-4" dir="ltr">
              {SITE_CONFIG.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
