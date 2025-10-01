import React, { useEffect, useState } from "react";
import { SunIcon, EyeIcon, ShieldIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import uv_points_en from "../locales/en/translation.json";
import uv_points_fr from "../locales/fr/translation.json";
import uv_points_ar from "../locales/ar/translation.json";
const UVProtectionPage = () => {
  const { t, i18n } = useTranslation();
  const [points, setPoints] = useState([]);
  const [whyUVMattersFeatures, setWhyUVMattersFeatures] = useState([]);
  const icons = {
    SunIcon,
    EyeIcon,
    ShieldIcon,
  };
  useEffect(() => {
    window.scrollTo({top:0,behavior: "smooth"})
    if (i18n.language === "en") {
      setPoints(uv_points_en?.ExplorePage?.whatIsUV?.points);
      setWhyUVMattersFeatures(
        uv_points_en?.ExplorePage?.whyUVMatters?.features
      );
    } else if (i18n.language === "fr") {
      setPoints(uv_points_fr?.ExplorePage?.whatIsUV?.points);
      setWhyUVMattersFeatures(
        uv_points_fr?.ExplorePage?.whyUVMatters?.features
      );
    } else if (i18n.language === "ar") {
      setPoints(uv_points_ar?.ExplorePage?.whatIsUV?.points);
      setWhyUVMattersFeatures(
        uv_points_ar?.ExplorePage?.whyUVMatters?.features
      );
    }
  }, [i18n.language]);

  return (
    <div className="bg-gray-50">
      <div className="relative isolate overflow-hidden bg-white pt-6 pb-10 ">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        ></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-black text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-base font-semibold leading-7">
              {t("ExplorePage.hero.smallTitle")}
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
              {t("ExplorePage.hero.title")}
            </p>
            <p className="mt-6 text-lg leading-8">
              {t("ExplorePage.hero.description")}
            </p>
            <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                to="/store/products"
                className="rounded-md bg-black px-6 py-3.5 text-sm text-white font-semibold  shadow-sm hover:bg-white hover:text-black border  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition duration-300"
              >
                {t("ExplorePage.hero.primaryButton")}
              </Link>
              <Link
                to="#what-is-uv"
                className="text-sm font-semibold leading-6 text-black hover:text-white hover:bg-black transition duration-300"
              >
                {t("ExplorePage.hero.secondaryButton")}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div
          id="what-is-uv"
          className="lg:flex lg:items-center lg:gap-x-10 mb-20"
        >
          <div className="lg:flex-auto">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t("ExplorePage.whatIsUV.title")}
            </h3>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {t("ExplorePage.whatIsUV.description")}
            </p>
            <ul className="mt-8 space-y-4 text-gray-700">
              {points?.map((p) => (
                <li className="flex items-start">
                  <ShieldIcon className="h-6 w-6 flex-shrink-0 text-indigo-600 mr-2 mt-1" />
                  <span>
                    <strong className="text-gray-900"> {p?.title}:</strong>{" "}
                    {p?.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 lg:mt-0 lg:flex-shrink-0 lg:w-1/2">
            <img
              src="/slider/uv.jpg"
              alt="Sun emitting UV rays"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
            {t("ExplorePage.whyUVMatters.title")}
          </h3>
          <p className="mt-6 text-xl leading-8 text-gray-600 text-center max-w-3xl mx-auto">
            {t("ExplorePage.whyUVMatters.description")}
          </p>

          <div className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-6 lg:gap-x-8">
            {whyUVMattersFeatures?.map((f) => {
              const Icon = icons[f.icon];
              return (
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h4 className="mt-6 text-xl font-semibold text-gray-900">
                    {f?.title}
                  </h4>
                  <p className="mt-4 text-base text-gray-600">
                    {f?.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 bg-green-600 text-white rounded-lg p-10 text-center shadow-xl">
          <h3 className="text-3xl font-bold">
            {t("ExplorePage.nazraPromise.title")}
          </h3>
          <p className="mt-4 text-sm">
            {t("ExplorePage.nazraPromise.description")}
          </p>
          <Link
            to="/store/products"
            className="mt-8 inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-green-600 bg-white hover:bg-gray-100 transition duration-300"
          >
            {t("ExplorePage.nazraPromise.button")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UVProtectionPage;
