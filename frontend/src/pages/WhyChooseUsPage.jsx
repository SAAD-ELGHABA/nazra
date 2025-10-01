import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import en from "../locales/en/translation.json";
import fr from "../locales/fr/translation.json";
import ar from "../locales/ar/translation.json";
import {
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
} from "lucide-react";

const WhyChooseUsPage = () => {
  const iconsMap = {
    CheckCircleIcon,
    TruckIcon,
    ShieldCheckIcon,
    HeartIcon,
  };

  const { t, i18n } = useTranslation();
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    {
      i18n.language === "en"
        ? setFeatures(en?.WhyChooseUsPage?.features)
        : i18n.language === "fr"
        ? setFeatures(fr?.WhyChooseUsPage?.features)
        : setFeatures(ar?.WhyChooseUsPage?.features);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [i18n.language]);

  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            {t("WhyChooseUsPage.header.subtitle")}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            {t("WhyChooseUsPage.header.title")}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            {t("WhyChooseUsPage.header.description")}
          </p>
        </div>

        <div className="mt-16">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-12">
            {features?.map((feature) => {
              const Icon = iconsMap[feature.icon];
              return (
                <div key={feature.title} className="relative">
                  <dt>
                    <div
                      className={`absolute flex items-center justify-center h-12 w-12 rounded-md ${feature?.color} bg-opacity-10 text-white`}
                    >
                      <Icon
                        className={`h-6 w-6 ${feature.color}`}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature?.title}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature?.description}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* Guarantee/Call to Action Block (Optional) */}
        <div className="mt-20 bg-white shadow-lg rounded-lg p-8 text-center border-t-4 border-indigo-600">
          <h3 className="text-2xl font-bold text-gray-900">
            {t("WhyChooseUsPage.cta.title")}
          </h3>
          <p className="mt-4 text-gray-600">
            {t("WhyChooseUsPage.cta.description")}
          </p>
          <a
            href="/store/products" // Link to your main shop page
            className="mt-6 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
          >
            {t("WhyChooseUsPage.cta.button")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUsPage;
