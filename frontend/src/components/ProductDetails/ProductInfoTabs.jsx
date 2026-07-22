import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SITE_CONFIG } from "../../config/site";

const SIZE_KEYS = new Set(["frameWidth", "lensWidth", "bridgeWidth", "templeLength"]);
const units = (key, value, t) => SIZE_KEYS.has(key) ? t("productDetails.millimeters", { value }) : key === "weight" ? t("productDetails.grams", { value }) : value;

export default function ProductInfoTabs({ product }) {
  const { t } = useTranslation();
  const specs = useMemo(() => Object.entries(product.specifications || {}).filter(([, value]) => value !== null && value !== undefined && value !== ""), [product.specifications]);
  const hasSize = specs.some(([key]) => SIZE_KEYS.has(key));
  const tabs = [
    { key: "description", label: t("productDetails.descriptionTab") },
    { key: "delivery", label: t("productDetails.deliveryTab") },
    ...(hasSize ? [{ key: "size", label: t("productDetails.sizeTab") }] : []),
  ];
  const [active, setActive] = useState("description");
  return (
    <section className="min-w-0" aria-label={t("productDetails.detailsTitle")}>
      <div role="tablist" className="flex overflow-x-auto border-b border-stone-200">
        {tabs.map((tab) => <button key={tab.key} type="button" role="tab" aria-selected={active === tab.key} aria-controls={`product-panel-${tab.key}`} id={`product-tab-${tab.key}`} onClick={() => setActive(tab.key)} className={`min-h-11 shrink-0 border-b-2 px-4 text-[9px] font-semibold uppercase tracking-wide transition ${active === tab.key ? "border-[#9b7444] text-black" : "border-transparent text-stone-500 hover:text-black"}`}>{tab.label}</button>)}
      </div>
      <div role="tabpanel" id={`product-panel-${active}`} aria-labelledby={`product-tab-${active}`} className="min-h-[180px] py-5 text-[11px] leading-5 text-stone-700">
        {active === "description" && <>
          {product.descriptionText && <p className="max-w-2xl whitespace-pre-line">{product.descriptionText}</p>}
          {specs.length > 0 && <dl className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">{specs.map(([key, value]) => <div key={key} className="flex justify-between gap-4 border-b border-stone-100 py-1.5"><dt className="text-stone-500">{t(`productDetails.specs.${key}`)}</dt><dd className="font-medium text-stone-900">{units(key, value, t)}</dd></div>)}</dl>}
        </>}
        {active === "delivery" && <div className="space-y-3"><p>{t("productDetails.deliveryDetails", { days: SITE_CONFIG.policies.deliveryBusinessDays })}</p><p>{t("productDetails.returnDetails", { days: SITE_CONFIG.policies.returnsDays })}</p><Link to="/returns-policy" className="inline-flex min-h-9 items-center border-b border-black font-semibold text-black">{t("productDetails.viewPolicy")}</Link></div>}
        {active === "size" && <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">{specs.filter(([key]) => SIZE_KEYS.has(key)).map(([key, value]) => <div key={key} className="flex justify-between border-b border-stone-100 py-2"><dt>{t(`productDetails.specs.${key}`)}</dt><dd className="font-semibold">{units(key, value, t)}</dd></div>)}</dl>}
      </div>
    </section>
  );
}
