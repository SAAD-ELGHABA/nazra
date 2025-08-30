import { Ban } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
export default function ProductNotAvailable() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-black/10 text-black p-4 rounded-full">
            <Ban size={40} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {t("product.notFoundMsg")}
        </h1>
        <p className="text-gray-500 mb-6">{t("product.notFoundDescription")}</p>
        <a
          href="/store"
          className="px-6 py-3 text-white  rounded transition-colors duration-300 hover:bg-white border bg-black hover:text-black text-center flex items-center justify-center"
        >
          {t("product.notFoundBtn")}
        </a>
      </div>
    </div>
  );
}
