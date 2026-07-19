import React from "react";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createWhatsAppLink } from "../../config/site";

export default function WhatsAppCTA() {
  const { t } = useTranslation();
  return (
    <aside className="nazra-container pb-7" aria-label={t("home.whatsapp.title")}>
      <div className="flex flex-col items-start justify-between gap-5 rounded-sm border border-[#ded3c5] bg-[#f8f3ea] p-5 sm:flex-row sm:items-center sm:px-8">
        <div className="flex items-center gap-4">
          <MessageCircle className="h-8 w-8 shrink-0 text-[#28894b]" aria-hidden="true" />
          <div><h2 className="text-sm font-semibold">{t("home.whatsapp.title")}</h2><p className="mt-1 text-xs text-stone-600">{t("home.whatsapp.copy")}</p></div>
        </div>
        <a href={createWhatsAppLink(t("home.whatsapp.message"))} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#111] px-5 text-xs font-semibold text-white transition hover:bg-stone-700 sm:w-auto">
          <MessageCircle size={16} aria-hidden="true" /> {t("home.whatsapp.cta")}
        </a>
      </div>
    </aside>
  );
}
