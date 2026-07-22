import React from "react";
import { Globe2, Mail, MapPinned, MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createWhatsAppLink, SITE_CONFIG } from "../../config/site";

const contactItems = [
  { key: "whatsapp", icon: MessageCircle, href: (message) => createWhatsAppLink(message), value: SITE_CONFIG.whatsapp, external: true },
  { key: "phone", icon: Phone, href: () => `tel:${SITE_CONFIG.phone.replace(/\s/g, "")}`, value: SITE_CONFIG.phone },
  { key: "email", icon: Mail, href: () => `mailto:${SITE_CONFIG.email}`, value: SITE_CONFIG.email },
];

const displayPhone = (value) => value.replace(/^(\+212)(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");

export default function ContactInfo() {
  const { t } = useTranslation();
  const whatsappMessage = t("contactPage.whatsapp.message");

  return (
    <section className="border border-stone-200 bg-white p-4 shadow-[0_8px_28px_rgba(52,37,18,.04)] sm:p-5" aria-labelledby="contact-info-title">
      <h2 id="contact-info-title" className="font-display text-base font-semibold">{t("contactPage.info.title")}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-[.8fr_1.2fr] lg:grid-cols-1 xl:grid-cols-[.8fr_1.2fr]">
        <address className="space-y-4 not-italic">
          {contactItems.map(({ key, icon: Icon, href, value, external }) => (
            <div key={key} className="flex items-start gap-3">
              {React.createElement(Icon, { size: 19, className: "mt-0.5 shrink-0 text-[#a4763e]", strokeWidth: 1.6, "aria-hidden": true })}
              <div className="min-w-0">
                <h3 className="text-[11px] font-semibold">{t(`contactPage.info.${key}`)}</h3>
                <a href={href(whatsappMessage)} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="mt-0.5 block break-all text-[11px] text-stone-600 underline-offset-2 hover:text-black hover:underline">{key === "email" ? value : displayPhone(value)}</a>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <MapPinned size={19} className="mt-0.5 shrink-0 text-[#a4763e]" strokeWidth="1.6" aria-hidden="true" />
            <div><h3 className="text-[11px] font-semibold">{t("contactPage.info.coverage")}</h3><p className="mt-0.5 text-[11px] leading-4 text-stone-600">{t("contactPage.info.coverageValue")}</p></div>
          </div>
        </address>

        <div className="relative isolate flex min-h-[185px] overflow-hidden border border-[#d8c5aa] bg-[#dce7df] p-5" role="img" aria-label={t("contactPage.info.mapLabel")}>
          <div className="absolute inset-0 opacity-40" aria-hidden="true" style={{ backgroundImage: "linear-gradient(35deg, transparent 47%, rgba(255,255,255,.8) 48%, rgba(255,255,255,.8) 50%, transparent 51%), linear-gradient(125deg, transparent 47%, rgba(151,117,77,.22) 48%, rgba(151,117,77,.22) 50%, transparent 51%)", backgroundSize: "58px 58px" }} />
          <div className="absolute -end-12 -top-16 h-48 w-48 rounded-full bg-[#87bdd0]/45 blur-2xl" aria-hidden="true" />
          <div className="relative m-auto w-full max-w-60 border border-white/70 bg-white/90 p-4 text-center shadow-lg backdrop-blur-sm">
            <Globe2 size={28} className="mx-auto text-[#9a6e3b]" strokeWidth="1.4" aria-hidden="true" />
            <h3 className="mt-2 font-display text-base font-semibold">{t("contactPage.info.mapTitle")}</h3>
            <p className="mt-1 text-[10px] leading-4 text-stone-600">{t("contactPage.info.mapCopy")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
