import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck,
  Banknote,
  ChevronDown,
  Eye,
  Glasses,
  Headset,
  Minus,
  Package,
  PhoneCall,
  Plus,
  RefreshCcw,
  Truck,
} from "lucide-react";
import { createWhatsAppLink, SITE_CONFIG } from "../config/site";
import usePageSeo from "../hooks/usePageSeo";
import WhatsAppGlyph from "../components/common/WhatsAppGlyph";

const DISCOVER_URL = `${SITE_CONFIG.url}/discover`;
const DISCOVER_IMAGE = `${SITE_CONFIG.url}/assets/images/home/hero-nazra.webp`;
const RETURN_DAYS = SITE_CONFIG.policies.returnsDays;
const DELIVERY_DAYS = SITE_CONFIG.policies.deliveryBusinessDays;

const STATS = [
  ["delivery", Truck, { days: DELIVERY_DAYS }],
  ["payment", Banknote, {}],
  ["returns", RefreshCcw, { days: RETURN_DAYS }],
  ["support", Headset, {}],
];

const COMMITMENTS = [
  ["selection", Glasses, {}],
  ["lenses", Eye, {}],
  ["payment", Banknote, {}],
  ["delivery", Truck, {}],
  ["returns", RefreshCcw, { days: RETURN_DAYS }],
  ["support", Headset, {}],
];

const STEPS = [
  ["choose", Glasses, {}],
  ["order", Package, {}],
  ["confirm", PhoneCall, {}],
  ["receive", Banknote, { days: RETURN_DAYS }],
];

const DELIVERY_ROWS = [
  ["zone", {}],
  ["time", { days: DELIVERY_DAYS }],
  ["cutoff", {}],
  ["tracking", {}],
];

const RETURN_ROWS = [
  ["window", { days: RETURN_DAYS }],
  ["condition", {}],
  ["how", {}],
  ["exclusions", {}],
];

const FACE_SHAPES = ["round", "square", "oval", "heart"];
const FAQ_COUNT = 8;

function SectionHeader({ id, eyebrow, title, copy }) {
  return (
    <header className="max-w-2xl">
      <p className="nazra-eyebrow">{eyebrow}</p>
      <h2 id={id} className="nazra-heading">
        {title}
      </h2>
      {copy ? <p className="mt-3 text-sm leading-6 text-stone-600">{copy}</p> : null}
    </header>
  );
}

function FaqItem({ question, answer, open, onToggle, id }) {
  return (
    <div className="border-b border-stone-200">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-trigger`}
          className="flex w-full items-center justify-between gap-4 py-5 text-start transition hover:text-[#906941]"
        >
          <span className="font-display text-sm font-semibold sm:text-base">{question}</span>
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-stone-300 text-stone-600"
            aria-hidden="true"
          >
            {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!open}
        className="pb-5"
      >
        <p className="max-w-3xl text-sm leading-6 text-stone-600">{answer}</p>
      </div>
    </div>
  );
}

export default function WhyChooseUsPage() {
  const { t, i18n } = useTranslation();
  const [openFaq, setOpenFaq] = useState(0);
  const language = i18n.resolvedLanguage || i18n.language;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const faqs = useMemo(
    () =>
      Array.from({ length: FAQ_COUNT }, (_, index) => ({
        question: t(`discover.faq.items.${index}.q`),
        answer: t(`discover.faq.items.${index}.a`, {
          days: RETURN_DAYS,
          deliveryDays: DELIVERY_DAYS,
        }),
      })),
    [t],
  );

  // FAQPage schema mirrors exactly what is rendered above — no invented content.
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "FAQPage",
          "@id": `${DISCOVER_URL}#faq`,
          inLanguage: language,
          mainEntity: faqs.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_CONFIG.name, item: SITE_CONFIG.url },
            { "@type": "ListItem", position: 2, name: t("discover.hero.eyebrow"), item: DISCOVER_URL },
          ],
        },
      ],
    }),
    [faqs, language, t],
  );

  usePageSeo({
    title: t("discover.seoTitle"),
    description: t("discover.seoDescription"),
    canonical: DISCOVER_URL,
    image: DISCOVER_IMAGE,
    jsonLd,
  });

  return (
    <main className="bg-white text-[#151515]">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-[#fbf8f3]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 100% at 100% 0%, rgba(144,105,65,.14), transparent 60%)",
          }}
        />
        <div className="nazra-container relative py-14 sm:py-16 lg:py-20">
          <p className="nazra-eyebrow">{t("discover.hero.eyebrow")}</p>
          <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
            {t("discover.hero.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600">
            {t("discover.hero.lead")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/store/products" className="nazra-button bg-black text-white hover:bg-stone-800">
              {t("discover.hero.shop")}
            </Link>
            <Link
              to="/contact-us"
              className="nazra-button border border-stone-300 text-stone-800 hover:border-stone-800"
            >
              {t("discover.hero.contact")}
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-stone-200 bg-stone-200 lg:grid-cols-4">
            {STATS.map(([key, Icon, options]) => (
              <div key={key} className="bg-[#fbf8f3] p-5">
                {React.createElement(Icon, {
                  className: "h-5 w-5 stroke-[1.4] text-[#906941]",
                  "aria-hidden": true,
                })}
                <dt className="sr-only">{t(`discover.stats.${key}.label`)}</dt>
                <dd className="mt-3 font-display text-2xl font-semibold leading-none">
                  {t(`discover.stats.${key}.value`, options)}
                </dd>
                <p className="mt-2 text-[11px] leading-4 text-stone-500">
                  {t(`discover.stats.${key}.label`)}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Commitments ───────────────────────────────────────── */}
      <section className="nazra-section" aria-labelledby="commitments-title">
        <div className="nazra-container">
          <SectionHeader
            id="commitments-title"
            eyebrow={t("discover.commitments.eyebrow")}
            title={t("discover.commitments.title")}
            copy={t("discover.commitments.copy")}
          />

          <div className="mt-10 grid gap-px bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
            {COMMITMENTS.map(([key, Icon, options]) => (
              <article key={key} className="group bg-white p-6 transition hover:bg-[#fcfaf7] sm:p-7">
                <span className="grid h-11 w-11 place-items-center rounded-sm bg-[#f4ede3] text-[#906941] transition group-hover:bg-[#906941] group-hover:text-white">
                  {React.createElement(Icon, { className: "h-5 w-5 stroke-[1.4]", "aria-hidden": true })}
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">
                  {t(`discover.commitments.items.${key}.title`, options)}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-stone-600">
                  {t(`discover.commitments.items.${key}.copy`, options)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="nazra-section border-y border-stone-200 bg-[#fcfaf7]" aria-labelledby="steps-title">
        <div className="nazra-container">
          <SectionHeader
            id="steps-title"
            eyebrow={t("discover.steps.eyebrow")}
            title={t("discover.steps.title")}
            copy={t("discover.steps.copy")}
          />

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([key, Icon, options], index) => (
              <li key={key} className="relative">
                {/* Connector line between steps on wide screens */}
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute start-11 top-5 hidden h-px w-[calc(100%-1.5rem)] bg-stone-300 lg:block"
                  />
                )}
                <div className="relative flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black font-display text-xs font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {React.createElement(Icon, {
                    className: "h-5 w-5 stroke-[1.4] text-[#906941]",
                    "aria-hidden": true,
                  })}
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">
                  {t(`discover.steps.items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {t(`discover.steps.items.${key}.copy`, options)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Delivery & returns detail ─────────────────────────── */}
      <section className="nazra-section" aria-labelledby="logistics-title">
        <div className="nazra-container">
          <p className="nazra-eyebrow">{t("discover.logistics.eyebrow")}</p>
          <h2 id="logistics-title" className="nazra-heading max-w-2xl">
            {t("discover.logistics.delivery.title")} · {t("discover.logistics.returns.title")}
          </h2>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            {[
              ["delivery", Truck, DELIVERY_ROWS],
              ["returns", RefreshCcw, RETURN_ROWS],
            ].map(([group, Icon, rows]) => (
              <div key={group} className="rounded-sm border border-stone-200 p-6 sm:p-7">
                <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                  {React.createElement(Icon, {
                    className: "h-5 w-5 stroke-[1.4] text-[#906941]",
                    "aria-hidden": true,
                  })}
                  <h3 className="font-display text-lg font-semibold">
                    {t(`discover.logistics.${group}.title`)}
                  </h3>
                </div>
                <dl className="mt-4 space-y-4">
                  {rows.map(([row, options]) => (
                    <div key={row} className="grid gap-1 sm:grid-cols-[128px_1fr] sm:gap-4">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
                        {t(`discover.logistics.${group}.rows.${row}.term`)}
                      </dt>
                      <dd className="text-sm leading-6 text-stone-700">
                        {t(`discover.logistics.${group}.rows.${row}.detail`, options)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs leading-5 text-stone-500">
            {t("discover.logistics.note")}{" "}
            <Link to="/shipping-info" className="font-semibold underline underline-offset-4">
              {t("discover.logistics.shippingLink")}
            </Link>
            {" · "}
            <Link to="/returns-policy" className="font-semibold underline underline-offset-4">
              {t("discover.logistics.returnsLink")}
            </Link>
          </p>
        </div>
      </section>

      {/* ── Frame shape guide ─────────────────────────────────── */}
      <section className="nazra-section border-y border-stone-200 bg-[#0d0c0b] text-white" aria-labelledby="shapes-title">
        <div className="nazra-container">
          <div className="max-w-2xl">
            <p className="nazra-eyebrow !text-[#c79a63]">{t("discover.shapes.eyebrow")}</p>
            <h2 id="shapes-title" className="nazra-heading text-white">
              {t("discover.shapes.title")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">{t("discover.shapes.copy")}</p>
          </div>

          <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {FACE_SHAPES.map((shape) => (
              <article key={shape} className="bg-[#0d0c0b] p-6">
                <h3 className="font-display text-base font-semibold">
                  {t(`discover.shapes.items.${shape}.face`)}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-white/65">
                  {t(`discover.shapes.items.${shape}.advice`)}
                </p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c79a63]">
                  {t("discover.shapes.recommends")}
                </p>
                <p className="mt-1 text-sm text-white/90">
                  {t(`discover.shapes.items.${shape}.frames`)}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-6 inline-flex items-start gap-2 text-xs leading-5 text-white/50">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#c79a63]" aria-hidden="true" />
            {t("discover.shapes.tip")}
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="nazra-section" aria-labelledby="faq-title">
        <div className="nazra-container grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.5fr)] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="nazra-eyebrow">{t("discover.faq.eyebrow")}</p>
            <h2 id="faq-title" className="nazra-heading">
              {t("discover.faq.title")}
            </h2>
            <ChevronDown className="mt-5 hidden h-6 w-6 text-stone-300 lg:block" aria-hidden="true" />
          </div>

          <div className="border-t border-stone-200">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                id={`faq-${index}`}
                question={faq.question}
                answer={faq.answer}
                open={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────── */}
      <section className="nazra-container pb-14">
        <div className="flex flex-col items-start gap-6 rounded-lg border border-[#dfd6c7] bg-[#faf6f0] p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-3xl">
              {t("discover.cta.title")}
            </h2>
            <p className="mt-2.5 text-sm leading-6 text-stone-600">{t("discover.cta.copy")}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/store/products"
              className="nazra-button bg-black text-white hover:bg-stone-800"
            >
              {t("discover.cta.shop")}
            </Link>
            <a
              href={createWhatsAppLink(t("discover.cta.message"))}
              target="_blank"
              rel="noreferrer"
              className="nazra-button gap-2 bg-[#25D366] text-[#052e16] hover:bg-[#1fbe5b]"
            >
              <WhatsAppGlyph className="h-4 w-4" />
              {t("discover.cta.whatsapp")}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
