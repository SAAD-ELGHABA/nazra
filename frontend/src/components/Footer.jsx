import React, { useState } from "react";
import { Facebook, Instagram, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { storeEmail } from "../api/api";
import { createWhatsAppLink, SITE_CONFIG } from "../config/site";
import { useConsent } from "../context/ConsentContext";
import BrandLogo from "./BrandLogo";
import WhatsAppGlyph from "./common/WhatsAppGlyph";

const FOOTER_GROUPS = [
  { title: "shop", links: [["men", "/store/products?category=Men"], ["women", "/store/products?category=Women"], ["collections", "/store/products"], ["bestSellers", "/#best-sellers"], ["all", "/store/products"]] },
  { title: "help", links: [["shipping", "/shipping-info"], ["payment", "/help-center"], ["returns", "/returns-policy"], ["faq", "/help-center"]] },
  { title: "about", links: [["story", "/about"], ["commitments", "/discover"], ["contact", "/contact-us"]] },
];

/** Legal documents, surfaced on every page via the footer bottom bar. */
const LEGAL_LINKS = [
  ["legal.terms.title", "/terms-and-conditions"],
  ["legal.termsOfUse.title", "/terms-of-use"],
  ["legal.privacy.title", "/privacy-policy"],
  ["legal.cookiePolicy.title", "/cookie-policy"],
  ["home.footer.returns", "/returns-policy"],
  ["home.footer.shipping", "/shipping-info"],
];

function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error"); setMessage(t("home.newsletter.required")); return;
    }
    setStatus("loading"); setMessage("");
    try {
      await storeEmail(email);
      setEmail(""); setStatus("success"); setMessage(t("home.newsletter.success"));
    } catch (error) {
      setStatus("error");
      setMessage(error?.response?.data?.message || t("home.newsletter.error"));
    }
  };

  return (
    <section className="bg-[#151918] text-white" aria-labelledby="newsletter-title">
      <div className="nazra-container flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">
        <div><h2 id="newsletter-title" className="font-display text-xl">{t("home.newsletter.title")}</h2><p className="mt-1 text-[11px] text-white/60">{t("home.newsletter.copy")}</p></div>
        <form onSubmit={submit} className="w-full md:max-w-lg" noValidate>
          <div className="flex"><label htmlFor="newsletter-email" className="sr-only">{t("home.newsletter.label")}</label><input id="newsletter-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("home.newsletter.placeholder")} disabled={status === "loading"} aria-describedby="newsletter-status" className="min-h-11 min-w-0 flex-1 border border-white/20 bg-white/5 px-4 text-xs text-white outline-none placeholder:text-white/50 focus:border-white" /><button disabled={status === "loading"} className="flex min-h-11 min-w-28 items-center justify-center bg-[#8d643d] px-5 text-xs font-semibold transition hover:bg-[#a97849] disabled:opacity-60">{status === "loading" ? <LoaderCircle size={16} className="animate-spin" aria-label={t("home.newsletter.loading")} /> : t("home.newsletter.submit")}</button></div>
          <p id="newsletter-status" role="status" className={`mt-2 min-h-4 text-[11px] ${status === "error" ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
        </form>
      </div>
    </section>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const { openPreferences } = useConsent();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#101413] text-white">
      <Newsletter />
      <div className="nazra-container grid gap-10 border-t border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.25fr]">
        <div><Link to="/" className="inline-flex w-[170px]" aria-label="NAZRA home"><BrandLogo variant="light" /></Link><p className="mt-4 max-w-52 text-xs leading-5 text-white/55">{t("home.footer.tagline")}</p><div className="mt-5 flex gap-2"><a href={SITE_CONFIG.social.instagram} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center border border-white/20" aria-label="Instagram"><Instagram size={15} /></a><a href={SITE_CONFIG.social.facebook} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center border border-white/20" aria-label="Facebook"><Facebook size={15} /></a></div></div>
        {FOOTER_GROUPS.map((group) => <div key={group.title}><h2 className="text-xs font-semibold">{t(`home.footer.${group.title}`)}</h2><ul className="mt-4 space-y-2.5">{group.links.map(([key, href]) => <li key={key}><Link to={href} className="text-[11px] text-white/55 transition hover:text-white">{t(`home.footer.${key}`)}</Link></li>)}</ul></div>)}
        <div><h2 className="text-xs font-semibold">{t("home.footer.support")}</h2><a href={createWhatsAppLink(t("home.whatsapp.message"))} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-xs text-white/70 hover:text-white"><WhatsAppGlyph className="h-4 w-4 text-[#25D366]" /> <span dir="ltr">{SITE_CONFIG.whatsapp}</span></a><a href={`mailto:${SITE_CONFIG.email}`} className="mt-3 block break-all text-[11px] text-white/55 hover:text-white">{SITE_CONFIG.email}</a></div>
      </div>
      <div className="border-t border-white/10">
        <div className="nazra-container py-5">
          <nav aria-label={t("home.footer.legal")}>
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              {LEGAL_LINKS.map(([key, href], index) => (
                <li key={href + key} className="flex items-center gap-x-3">
                  {index > 0 && (
                    <span aria-hidden="true" className="h-3 w-px bg-white/20" />
                  )}
                  <Link to={href} className="text-white/55 transition hover:text-white hover:underline underline-offset-4">
                    {t(key)}
                  </Link>
                </li>
              ))}
              {/* Consent has to be withdrawable, so the panel needs an entry
                  point on every page. A button, not a Link — it opens a dialog
                  rather than navigating. */}
              <li className="flex items-center gap-x-3">
                <span aria-hidden="true" className="h-3 w-px bg-white/20" />
                <button
                  type="button"
                  onClick={openPreferences}
                  className="text-white/55 transition hover:text-white hover:underline underline-offset-4"
                >
                  {t("cookies.footer.preferences")}
                </button>
              </li>
            </ul>
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} NAZRA. {t("home.footer.rights")}</p>
            <p>{t("home.footer.secure")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
