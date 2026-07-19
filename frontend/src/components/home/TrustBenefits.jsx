import React from "react";
import { CreditCard, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

const BENEFITS = [
  [ShieldCheck, "uv"],
  [CreditCard, "payment"],
  [Truck, "delivery"],
  [RefreshCw, "exchange"],
];

export default function TrustBenefits() {
  const { t } = useTranslation();
  return (
    <section className="border-b border-stone-200 bg-[#faf8f4]" aria-label="Services NAZRA">
      <div className="nazra-container grid grid-cols-2 divide-x divide-y divide-stone-200 lg:grid-cols-4 lg:divide-y-0 rtl:divide-x-reverse">
        {BENEFITS.map(([Icon, key]) => (
          <div key={key} className="flex min-h-28 items-center gap-3 px-3 py-5 sm:px-6">
            {React.createElement(Icon, { className: "h-7 w-7 shrink-0 stroke-[1.4]", "aria-hidden": true })}
            <div>
              <h2 className="text-xs font-semibold sm:text-sm">{t(`home.trust.${key}.title`)}</h2>
              <p className="mt-1 text-[11px] leading-4 text-stone-600 sm:text-xs">{t(`home.trust.${key}.copy`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
