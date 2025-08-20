import React from "react";
import { DraftingCompass, Glasses, Kanban } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function UnmatchedSection() {
  const { t } = useTranslation();

  return (
    <div className="md:p-10 p-4 w-full min-h-screen overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-6 text-center md:text-left">
        <h5>{t("unmatched.intro")}</h5>
        <h1
          className="font-bold text-[32px] md:text-[56px] w-full max-w-3xl"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          {t("unmatched.title")}
        </h1>
        <h5>{t("unmatched.subtitle")}</h5>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 w-full mt-6">
        {/* First Card */}
        <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 border p-6 flex flex-col justify-between w-full">
          <div className="flex flex-col gap-4">
            <DraftingCompass className="h-10 w-10" />
            <h2
              className="font-bold text-[25px] md:text-[36px] lg:text-[46px]"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              {t("unmatched.cards.crafted.title")}
            </h2>
            <p className="text-sm md:text-base lg:text-lg">
              {t("unmatched.cards.crafted.description")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Link
              to="/shop"
              className="px-6 py-3 border rounded transition-colors duration-300 hover:bg-black hover:text-white"
            >
              {t("unmatched.cards.crafted.shop")}
            </Link>
            <Link
              to="/learn"
              className="px-6 py-3 rounded transition-all duration-300 transform hover:bg-black/10"
            >
              {t("unmatched.cards.crafted.learnMore")}
            </Link>
          </div>
        </div>

        {/* Second Card */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 border p-6 flex flex-col justify-between w-full">
          <div className="flex flex-col gap-4">
            <Glasses className="h-10 w-10" />
            <h2
              className="font-bold text-[20px] md:text-[24px] lg:text-[26px]"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              {t("unmatched.cards.why.title")}
            </h2>
            <p className="text-sm md:text-base">
              {t("unmatched.cards.why.description")}
            </p>
          </div>
          <Link
            to="/discover"
            className="px-6 py-3 border rounded transition-colors duration-300 hover:bg-black hover:text-white text-center mt-4"
          >
            {t("unmatched.cards.why.discover")}
          </Link>
        </div>

        {/* Third Card */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 border p-6 flex flex-col justify-between w-full">
          <div className="flex flex-col gap-4">
            <Kanban className="h-10 w-10" />
            <h2
              className="font-bold text-[20px] md:text-[24px] lg:text-[26px]"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              {t("unmatched.cards.protect.title")}
            </h2>
            <p className="text-sm md:text-base">
              {t("unmatched.cards.protect.description")}
            </p>
          </div>
          <Link
            to="/explore"
            className="px-6 py-3 border rounded transition-colors duration-300 hover:bg-black hover:text-white text-center mt-4"
          >
            {t("unmatched.cards.protect.explore")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnmatchedSection;
