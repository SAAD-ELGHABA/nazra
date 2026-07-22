import React from "react";
import { CreditCard, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SITE_CONFIG } from "../../config/site";

export default function ProductTrustCard() {
  const { t } = useTranslation();
  const items = [
    [Truck, "deliveryTitle", "deliveryCopy", { days: SITE_CONFIG.policies.deliveryBusinessDays }],
    [CreditCard, "paymentTitle", "paymentCopy", {}],
    [RefreshCw, "exchangeTitle", "exchangeCopy", { days: SITE_CONFIG.policies.returnsDays }],
    [ShieldCheck, "qualityTitle", "qualityCopy", {}],
  ];
  return (
    <aside className="h-fit rounded-[7px] border border-stone-200 bg-white px-5 py-3 lg:mt-[255px]" aria-label={t("home.nav.help")}>
      {items.map(([Icon, title, copy, values], index) => (
        <div key={title} className={`flex gap-3 py-4 ${index ? "border-t border-stone-100" : ""}`}>
          {React.createElement(Icon, { className: "mt-0.5 h-[18px] w-[18px] shrink-0 stroke-[1.5]", "aria-hidden": true })}
          <div><h2 className="text-[11px] font-semibold">{t(`productDetails.${title}`)}</h2><p className="mt-1 text-[9px] leading-[1.45] text-stone-600">{t(`productDetails.${copy}`, values)}</p></div>
        </div>
      ))}
    </aside>
  );
}
