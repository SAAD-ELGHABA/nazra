import React from "react";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createWhatsAppLink } from "../../config/site";

export default function ProductWhatsAppCTA({ product, color, lens }) {
  const { t } = useTranslation();
  const lensPart = lens?.name ? t("productDetails.whatsappLens", { lens: lens.name }) : "";
  const variant = color?.name ? t("productDetails.whatsappVariant", { color: color.name, lens: lensPart }) : "";
  const href = createWhatsAppLink(t("productDetails.whatsappMessage", { name: product.name, variant }));
  return (
    <aside className="nazra-container pb-3" aria-label={t("productDetails.whatsappTitle")}>
      <div className="flex flex-col items-start justify-between gap-4 rounded-[6px] bg-[#0c0e0d] px-5 py-5 text-white sm:flex-row sm:items-center sm:px-8">
        <div className="flex items-center gap-4"><MessageCircle className="h-8 w-8 shrink-0 text-[#7dcc96]" /><div><h2 className="font-display text-base font-semibold">{t("productDetails.whatsappTitle")}</h2><p className="mt-1 text-[10px] text-white/60">{t("productDetails.whatsappCopy")}</p></div></div>
        <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-10 w-full items-center justify-center border border-white/60 px-6 text-[9px] font-semibold transition hover:bg-white hover:text-black sm:w-auto"><MessageCircle className="me-2 h-4 w-4" />{t("productDetails.whatsappCta")}</a>
      </div>
    </aside>
  );
}
