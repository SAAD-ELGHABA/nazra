import React from "react";
import { Clock3, Headphones, MessageCircle, PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SITE_CONFIG } from "../../config/site";

const BENEFITS = [[Headphones, "support"], [MessageCircle, "whatsapp"], [PackageCheck, "delivery"], [Clock3, "response"]];

export default function ContactBenefits() {
  const { t } = useTranslation();
  return (
    <section className="border-y border-[#eadfce] bg-[#f7f0e5]" aria-label={t("contactPage.benefits.label")}>
      <div className="nazra-container grid grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(([Icon, key]) => (
          <article key={key} className="flex min-h-24 items-center gap-3 border-b border-e border-[#e5d7c3] px-3 py-4 last:border-e-0 lg:border-b-0 sm:px-5">
            {React.createElement(Icon, { className: "h-7 w-7 shrink-0 text-[#a4763e]", strokeWidth: 1.45, "aria-hidden": true })}
            <div><h2 className="text-[11px] font-semibold">{t(`contactPage.benefits.${key}.title`)}</h2><p className="mt-1 text-[10px] leading-4 text-stone-600">{t(`contactPage.benefits.${key}.copy`, { days: SITE_CONFIG.policies.deliveryBusinessDays })}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
