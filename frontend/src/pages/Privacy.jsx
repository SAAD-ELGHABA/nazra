import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  useEffect(() => {
    document.title = "Privacy - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
    // here the promise ...
  }, []);
  return (
    <section
      className="w-full  text-black py-16 px-6 md:px-12 lg:px-20"
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          {t("privacyPolicy.title")}
        </h1>
        <p className="text-gray-700 text-sm md:text-base">
          {t("privacyPolicy.intro")}
        </p>

        {t("privacyPolicy.sections", { returnObjects: true }).map(
          (section, index) => (
            <div key={index} className="space-y-2">
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <p className="text-gray-700">{section.content}</p>
            </div>
          )
        )}

        <div className="mt-6 p-6 border border-gray-700 rounded-lg bg-white text-black">
          <h3 className="text-lg font-semibold mb-2">
            {t("privacyPolicy.contactTitle")}
          </h3>
          <p className=" mb-1">
            {t("privacyPolicy.contactEmail")}: nazraglasses@gmail.com
          </p>
          <p className="">
            {t("privacyPolicy.contactPhone")}: +212 638 995 117
          </p>
        </div>
      </div>
    </section>
  );
}
