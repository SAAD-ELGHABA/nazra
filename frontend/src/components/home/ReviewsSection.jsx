import React from "react";
import { MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ReviewsSection() {
  const { t } = useTranslation();
  return (
    <section className="nazra-section bg-white" aria-labelledby="reviews-title">
      <div className="nazra-container">
        <h2 id="reviews-title" className="nazra-heading">{t("home.reviews.title")}</h2>
        <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-sm border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center">
          <MessageSquareText className="h-7 w-7 text-stone-500" aria-hidden="true" />
          <h3 className="mt-3 font-display text-lg font-semibold">{t("home.reviews.emptyTitle")}</h3>
          <p className="mt-2 max-w-xl text-xs leading-5 text-stone-600">{t("home.reviews.emptyCopy")}</p>
        </div>
      </div>
    </section>
  );
}
