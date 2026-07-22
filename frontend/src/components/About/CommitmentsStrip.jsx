import React from "react";
import { Gem, Headphones, RotateCcw, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

const COMMITMENTS = [
  [Gem, "quality"],
  [RotateCcw, "exchange"],
  [Truck, "delivery"],
  [Headphones, "support"],
];

export default function CommitmentsStrip() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-[#ded3c5] bg-[#f6efe5]" aria-labelledby="about-commitments-title">
      <div className="nazra-container grid lg:grid-cols-[1.35fr_repeat(4,1fr)]">
        <div className="flex min-h-44 flex-col justify-center border-b border-[#ded3c5] py-8 lg:border-b-0 lg:border-e lg:pe-8">
          <p className="nazra-eyebrow">{t("about.commitments.eyebrow")}</p>
          <h2 id="about-commitments-title" className="mt-2 max-w-xs font-display text-2xl font-semibold leading-tight tracking-[-.03em] sm:text-3xl">
            {t("about.commitments.title")}
          </h2>
        </div>
        <div className="col-span-full grid grid-cols-2 lg:col-span-4 lg:grid-cols-4">
          {COMMITMENTS.map(([icon, key], index) => (
            <div key={key} className={`flex min-h-36 flex-col justify-center border-[#ded3c5] px-4 py-6 text-start sm:px-6 lg:min-h-44 ${index % 2 === 0 ? "border-e" : ""} ${index < 2 ? "border-b lg:border-b-0" : ""} ${index > 0 ? "lg:border-s" : ""}`}>
              {React.createElement(icon, { className: "h-6 w-6 stroke-[1.35] text-[#8a6543]", "aria-hidden": true })}
              <h3 className="mt-3 font-display text-sm font-semibold">{t(`about.commitments.${key}.title`)}</h3>
              <p className="mt-1 text-[11px] leading-5 text-stone-600">{t(`about.commitments.${key}.copy`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
