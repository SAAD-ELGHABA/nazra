import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function TermsOfUse() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  useEffect(() => {
    document.title = "Terms Of Use - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <section
      className="w-full  text-black py-16 px-6 md:px-12 lg:px-20"
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          {t("termsOfUse.title")}
        </h1>
        <p className="text-gray-700 text-sm md:text-base">
          {t("termsOfUse.intro")}
        </p>

        {t("termsOfUse.sections", { returnObjects: true }).map(
          (section, index) => (
            <div key={index} className="space-y-2">
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <p className="text-gray-700">{section.content}</p>
            </div>
          )
        )}

        <div className="mt-6 p-6 border border-gray-700 rounded-lg bg-white text-black ">
          <h3 className="text-lg font-semibold mb-2">
            {t("termsOfUse.contactTitle")}
          </h3>
          <p className=" mb-1">
            {t("termsOfUse.contactEmail")}: nazraglasses@gmail.com
          </p>
          <p className="">{t("termsOfUse.contactPhone")}: +212 638 995 117</p>
        </div>
      </div>
    </section>
  );
}
