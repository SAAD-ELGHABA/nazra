import React from "react";
import { useTranslation } from "react-i18next";

export default function ReturnsPolicy() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <section
      className="w-full bg-black text-white py-16 px-6 md:px-12 lg:px-20"
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          {t("returnsPolicy.title")}
        </h1>
        <p className="text-gray-300 text-sm md:text-base">
          {t("returnsPolicy.intro")}
        </p>

        {t("returnsPolicy.sections", { returnObjects: true }).map((section, index) => (
          <div key={index} className="space-y-2">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <p className="text-gray-300">{section.content}</p>
          </div>
        ))}

        <div className="mt-6 p-6 border text-black border-gray-700 rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-2">{t("returnsPolicy.contactTitle")}</h3>
          <p className=" mb-1">{t("returnsPolicy.contactEmail")}: nazraglasses@gmail.com</p>
          <p className="">{t("returnsPolicy.contactPhone")}: +212 600 000 000</p>
        </div>
      </div>
    </section>
  );
}
