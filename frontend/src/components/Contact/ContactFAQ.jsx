import React, { useId, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SITE_CONFIG } from "../../config/site";

const FAQ_KEYS = ["delivery", "returns", "cod", "warranty", "tracking"];

export default function ContactFAQ() {
  const { t } = useTranslation();
  const [openKey, setOpenKey] = useState(null);
  const baseId = useId();

  return (
    <section className="bg-[#fffdf9] py-7 sm:py-9" aria-labelledby="contact-faq-title">
      <div className="nazra-container max-w-[1220px]">
        <div className="text-center">
          <h2 id="contact-faq-title" className="font-display text-2xl font-medium sm:text-3xl">{t("contactPage.faq.title")}</h2>
          <Sparkles size={14} className="mx-auto mt-2 text-[#a4763e]" aria-hidden="true" />
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-2">
          {FAQ_KEYS.map((key, index) => {
            const open = openKey === key;
            const buttonId = `${baseId}-${key}-button`;
            const panelId = `${baseId}-${key}-panel`;
            return (
              <article key={key} className={`border border-stone-200 bg-white ${index === FAQ_KEYS.length - 1 ? "md:col-span-2 md:mx-auto md:w-1/2" : ""}`}>
                <h3>
                  <button id={buttonId} type="button" onClick={() => setOpenKey(open ? null : key)} aria-expanded={open} aria-controls={panelId} className="flex min-h-11 w-full items-center justify-between gap-4 px-4 text-start text-[11px] font-medium hover:bg-stone-50">
                    {t(`contactPage.faq.items.${key}.question`)}
                    <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open} className="border-t border-stone-100 px-4 py-3 text-[11px] leading-5 text-stone-600">
                  {t(`contactPage.faq.items.${key}.answer`, { deliveryDays: SITE_CONFIG.policies.deliveryBusinessDays, returnsDays: SITE_CONFIG.policies.returnsDays })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
