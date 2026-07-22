import React from "react";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createWhatsAppLink, SITE_CONFIG } from "../../config/site";

const SOCIAL_LINKS = [
  [Instagram, "Instagram", SITE_CONFIG.social.instagram],
  [Facebook, "Facebook", SITE_CONFIG.social.facebook],
];

export default function CommunitySection() {
  const { t } = useTranslation();

  return (
    <section className="bg-[#151515] py-8 text-white" aria-label={t("about.community.label")}>
      <div className="nazra-container grid items-center gap-7 lg:min-h-[180px] lg:grid-cols-[1.15fr_2fr_.75fr] lg:gap-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#d7b58c]">{t("about.community.eyebrow")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">{t("about.community.title")}</h2>
          <a href={createWhatsAppLink(t("about.community.whatsappMessage"))} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 border border-white/30 px-4 text-[11px] font-semibold transition hover:bg-white hover:text-black">
            <MessageCircle size={15} aria-hidden="true" /> {t("about.community.whatsappCta")}
          </a>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((number) => (
            <figure key={number} className="overflow-hidden bg-white/5">
              <img src={`/assets/images/home/ugc-0${number}.webp`} alt={t("about.community.imageAlt", { number })} width="600" height="800" loading="lazy" className="aspect-square h-full w-full object-cover transition duration-500 hover:scale-[1.025]" />
            </figure>
          ))}
        </div>

        <div className="border-t border-white/15 pt-5 lg:border-s lg:border-t-0 lg:ps-7 lg:pt-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/50">{t("about.community.follow")}</p>
          <div className="mt-3 flex gap-2">
            {SOCIAL_LINKS.map(([icon, label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="grid h-11 w-11 place-items-center border border-white/25 transition hover:border-white hover:bg-white hover:text-black" aria-label={t("about.community.socialLabel", { network: label })}>
                {React.createElement(icon, { size: 17, "aria-hidden": true })}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
