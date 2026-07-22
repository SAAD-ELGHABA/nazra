import React from "react";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createWhatsAppLink } from "../../config/site";

export default function ContactWhatsAppCTA() {
  const { t } = useTranslation();
  return (
    <section className="relative isolate overflow-hidden bg-[#111] text-white" aria-labelledby="contact-whatsapp-title">
      <div className="absolute inset-0 opacity-[.11]" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle at 10% 50%, #c19560 0 2px, transparent 3px), radial-gradient(circle at 90% 50%, #c19560 0 2px, transparent 3px)", backgroundSize: "26px 26px" }} />
      <div className="nazra-container relative flex flex-col items-center justify-between gap-5 py-6 text-center sm:flex-row sm:text-start">
        <div className="flex items-center gap-4">
          <MessageCircle size={35} className="shrink-0 text-[#c39762]" strokeWidth="1.5" aria-hidden="true" />
          <div><h2 id="contact-whatsapp-title" className="font-display text-xl font-medium">{t("contactPage.whatsapp.title")}</h2><p className="mt-1 text-[11px] text-white/65">{t("contactPage.whatsapp.copy")}</p></div>
        </div>
        <a href={createWhatsAppLink(t("contactPage.whatsapp.message"))} target="_blank" rel="noreferrer" className="nazra-button w-full border border-[#c39762] bg-[#a47743] text-white hover:bg-[#bd8c52] sm:w-auto">
          <MessageCircle size={15} className="me-2" aria-hidden="true" /> {t("contactPage.whatsapp.cta")}
        </a>
      </div>
    </section>
  );
}
