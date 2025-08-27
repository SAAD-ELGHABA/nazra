import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function TermsAndConditions() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  useEffect(() => {
    document.title = "Terms And Conditions - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <section
      className="w-full bg-black text-white py-16 px-6 md:px-12 lg:px-20"
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          {t("termsAndConditions.title")}
        </h1>
        <p className="text-gray-300 text-sm md:text-base">
          {t("termsAndConditions.intro")}
        </p>

        {t("termsAndConditions.sections", { returnObjects: true }).map(
          (section, index) => (
            <div key={index} className="space-y-2">
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <p className="text-gray-300">{section.content}</p>
            </div>
          )
        )}

        <div className="mt-6 p-6 border border-gray-700 rounded-lg bg-white text-black">
          <h3 className="text-lg font-semibold mb-2">
            {t("termsAndConditions.contactTitle")}
          </h3>
          <p className=" mb-1">
            {t("termsAndConditions.contactEmail")}: nazraglasses@gmail.com
          </p>
          <p className="">
            {t("termsAndConditions.contactPhone")}: +212 600 000 000
          </p>
        </div>
      </div>
    </section>
  );
}
