import React from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

function ComingSoonPage() {
  const { t, i18n } = useTranslation();

  // Change language dynamically
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 text-center px-4"
    >
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full">
        <Clock
          size={48}
          className="mx-auto text-black mb-4 animate-pulse"
        />

        <h1 className="text-3xl font-bold text-black mb-2">
          {t("comingSoon.title")}
        </h1>
        <p className="text-gray-600 mb-6">{t("comingSoon.description")}</p>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => changeLanguage("en")}
            className="px-3 py-1 bg-black text-white rounded-full text-sm hover:bg-black/80"
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage("fr")}
            className="px-3 py-1 bg-black text-white rounded-full text-sm hover:bg-black/80"
          >
            FR
          </button>
          <button
            onClick={() => changeLanguage("ar")}
            className="px-3 py-1 bg-black text-white rounded-full text-sm hover:bg-black/80"
          >
            AR
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonPage;
