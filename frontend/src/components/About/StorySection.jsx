import React from "react";
import { Feather, Gem, ShieldCheck, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

const BENEFITS = [
  [Sun, "morocco"],
  [Feather, "comfort"],
  [ShieldCheck, "protection"],
  [Gem, "design"],
];

export default function StorySection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-14 sm:py-16 lg:py-20" aria-labelledby="about-mission-title">
      <div className="nazra-container grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="overflow-hidden bg-stone-100">
          <img
            src="/assets/images/about/about-marrakech.webp"
            alt={t("about.mission.imageAlt")}
            width="1456"
            height="1092"
            loading="lazy"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center lg:py-3">
          <p className="nazra-eyebrow">{t("about.mission.eyebrow")}</p>
          <h2 id="about-mission-title" className="mt-3 max-w-xl font-display text-[clamp(2rem,3.5vw,3.5rem)] font-semibold leading-[1.03] tracking-[-.04em] text-[#111]">
            {t("about.mission.title")}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-600">{t("about.mission.copy")}</p>
          <ul className="mt-7 grid grid-cols-2 border-s border-t border-stone-200">
            {BENEFITS.map(([icon, benefit]) => (
              <li key={benefit} className="min-h-28 border-b border-e border-stone-200 p-4 sm:p-5">
                {React.createElement(icon, { className: "h-5 w-5 stroke-[1.4] text-[#906941]", "aria-hidden": true })}
                <p className="mt-3 text-xs font-semibold leading-5 text-stone-800">{t(`about.mission.benefits.${benefit}`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
