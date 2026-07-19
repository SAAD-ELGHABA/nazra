import React from "react";
import { Diamond, Feather, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BENEFITS = [[Diamond, "materials"], [Sparkles, "design"], [Feather, "comfort"], [ShieldCheck, "protection"]];

export default function BrandStory() {
  const { t } = useTranslation();
  return (
    <section className="nazra-section border-y border-stone-200 bg-[#fcfaf7]" aria-labelledby="story-title">
      <div className="nazra-container">
        <div className="grid gap-7 lg:grid-cols-[1.15fr_2fr] lg:items-start">
          <div>
            <p className="nazra-eyebrow">{t("home.story.eyebrow")}</p>
            <h2 id="story-title" className="nazra-heading max-w-md">{t("home.story.title")}</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-stone-600">{t("home.story.copy")}</p>
            <Link to="/about" className="mt-4 inline-block text-xs font-semibold underline underline-offset-4">{t("home.story.about")}</Link>
          </div>
          <div className="grid grid-cols-2 gap-px bg-stone-200">
            {BENEFITS.map(([Icon, key]) => (
              <article key={key} className="min-h-44 bg-[#fcfaf7] p-5 sm:p-7">
                {React.createElement(Icon, { className: "h-7 w-7 stroke-[1.3] text-[#9a7044]", "aria-hidden": true })}
                <h3 className="mt-4 font-display text-lg font-semibold">{t(`home.story.${key}.title`)}</h3>
                <p className="mt-2 text-xs leading-5 text-stone-600">{t(`home.story.${key}.copy`)}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
