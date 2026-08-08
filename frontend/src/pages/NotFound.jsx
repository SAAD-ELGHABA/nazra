import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNoIndex } from "../hooks/usePageSeo";

function NotFound() {
  const { t } = useTranslation();

  // The SPA answers unknown paths with HTTP 200, so this meta tag is the only
  // signal telling Google the URL carries no content worth indexing.
  useNoIndex("Page Not Found - Nazra");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center text-center px-4">
      <h1
        className="font-bold text-[32px] md:text-[56px]"
        style={{ lineHeight: "1.2", letterSpacing: "4px" }}
      >
        404
      </h1>
      <p className="text-lg text-gray-600 mb-6">{t("notFound.message")}</p>
      <Link
        to="/"
        className="px-6 py-2 border rounded hover:bg-black hover:text-white transition"
      >
        {t("notFound.goBack")}
      </Link>
    </div>
  );
}

export default NotFound;
