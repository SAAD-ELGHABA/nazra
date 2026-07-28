import React, { useState } from "react";
import { Facebook, Instagram, LoaderCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { storeEmail } from "../api/api";
import { createWhatsAppLink, SITE_CONFIG } from "../config/site";
import BrandLogo from "./BrandLogo";

const FOOTER_GROUPS = [
  { title: "shop", links: [["men", "/store/products?category=Men"], ["women", "/store/products?category=Women"], ["collections", "/store/products"], ["bestSellers", "/#best-sellers"], ["all", "/store/products"]] },
  { title: "help", links: [["shipping", "/shipping-info"], ["payment", "/help-center"], ["returns", "/returns-policy"], ["faq", "/help-center"]] },
  { title: "about", links: [["story", "/about"], ["commitments", "/discover"], ["contact", "/contact-us"]] },
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
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#101413] text-white">
      <Newsletter />
      <div className="nazra-container grid gap-10 border-t border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.25fr]">
        <div><Link to="/" className="inline-flex w-[170px]" aria-label="NAZRA home"><BrandLogo variant="light" /></Link><p className="mt-4 max-w-52 text-xs leading-5 text-white/55">{t("home.footer.tagline")}</p><div className="mt-5 flex gap-2"><a href={SITE_CONFIG.social.instagram} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center border border-white/20" aria-label="Instagram"><Instagram size={15} /></a><a href={SITE_CONFIG.social.facebook} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center border border-white/20" aria-label="Facebook"><Facebook size={15} /></a></div></div>
        {FOOTER_GROUPS.map((group) => <div key={group.title}><h2 className="text-xs font-semibold">{t(`home.footer.${group.title}`)}</h2><ul className="mt-4 space-y-2.5">{group.links.map(([key, href]) => <li key={key}><Link to={href} className="text-[11px] text-white/55 transition hover:text-white">{t(`home.footer.${key}`)}</Link></li>)}</ul></div>)}
        <div><h2 className="text-xs font-semibold">{t("home.footer.support")}</h2><a href={createWhatsAppLink(t("home.whatsapp.message"))} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-xs text-white/70 hover:text-white"><MessageCircle size={16} /> {SITE_CONFIG.whatsapp}</a><a href={`mailto:${SITE_CONFIG.email}`} className="mt-3 block break-all text-[11px] text-white/55 hover:text-white">{SITE_CONFIG.email}</a></div>
      </div>
      <div className="border-t border-white/10"><div className="nazra-container flex flex-col gap-2 py-4 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between"><p>© {year} NAZRA. {t("home.footer.rights")}</p><p>{t("home.footer.secure")}</p></div></div>
    </footer>
  );
}
