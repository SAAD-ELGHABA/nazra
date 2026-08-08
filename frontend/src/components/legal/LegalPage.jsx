import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Mail, PhoneCall, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "../../config/site";
import usePageSeo from "../../hooks/usePageSeo";
import WhatsAppGlyph from "../common/WhatsAppGlyph";

/**
 * Shared layout for the legal documents (privacy, terms of use, terms of sale).
 *
 * One component so the three pages cannot drift apart in style, and so the
 * contact block, company identity and cross-links come from a single source.
 */

const RELATED = [
  ["privacy", "/privacy-policy"],
  ["cookiePolicy", "/cookie-policy"],
  ["termsOfUse", "/terms-of-use"],
  ["terms", "/terms-and-conditions"],
];

const IDENTITY_FIELDS = ["companyName", "legalForm", "address", "rc", "ice", "if", "cndpDeclaration"];

function formatDate(iso, language) {
  try {
    return new Intl.DateTimeFormat(language, { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export default function LegalPage({ documentKey, path }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;
  const base = `legal.${documentKey}`;
  const url = `${SITE_CONFIG.url}${path}`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [documentKey]);

  const interpolation = useMemo(
    () => ({
      brand: SITE_CONFIG.name,
      site: SITE_CONFIG.url.replace(/^https?:\/\//, ""),
      email: SITE_CONFIG.email,
      phone: SITE_CONFIG.phone,
      returnDays: SITE_CONFIG.policies.returnsDays,
      withdrawalDays: SITE_CONFIG.policies.legalWithdrawalDays,
      refundDays: SITE_CONFIG.policies.refundDays,
      deliveryDays: SITE_CONFIG.policies.deliveryBusinessDays,
    }),
    [],
  );

  const sections = useMemo(() => {
    const raw = t(`${base}.sections`, { returnObjects: true, ...interpolation });
    return Array.isArray(raw) ? raw : [];
  }, [t, base, interpolation]);

  const updated = formatDate(SITE_CONFIG.legal.lastUpdated, language);

  usePageSeo({
    title: t(`${base}.seoTitle`, interpolation),
    description: t(`${base}.seoDescription`, interpolation),
    canonical: url,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": url,
      name: t(`${base}.title`, interpolation),
      description: t(`${base}.seoDescription`, interpolation),
      inLanguage: language,
      dateModified: SITE_CONFIG.legal.lastUpdated,
      isPartOf: { "@id": `${SITE_CONFIG.url}/#website` },
      publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
    },
  });

  const identityRows = IDENTITY_FIELDS.filter((field) => SITE_CONFIG.legal[field]);

  return (
    <main className="bg-white text-[#151515]">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="border-b border-stone-200 bg-[#fbf8f3]">
        <div className="nazra-container py-12 sm:py-14">
          <p className="nazra-eyebrow">{t("legal.eyebrow")}</p>
          <h1 className="font-display max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
            {t(`${base}.title`, interpolation)}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">
            {t(`${base}.intro`, interpolation)}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600">
            <FileText className="h-3.5 w-3.5 text-[#906941]" aria-hidden="true" />
            {t("legal.updated", { date: updated })}
          </p>
        </div>
      </header>

      <div className="nazra-container grid gap-10 py-12 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-14 lg:py-16">
        {/* ── Table of contents ───────────────────────────────── */}
        <nav aria-label={t("legal.tocLabel")} className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">
            {t("legal.toc")}
          </h2>
          <ol className="mt-4 space-y-2.5 border-s border-stone-200 ps-4">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-xs leading-5 text-stone-600 transition hover:text-[#906941] hover:underline underline-offset-4"
                >
                  <span className="font-semibold text-stone-400">
                    {String(index + 1).padStart(2, "0")}.
                  </span>{" "}
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Document body ───────────────────────────────────── */}
        <div>
          {identityRows.length > 0 && (
            <section className="mb-10 rounded-sm border border-stone-200 bg-[#fcfaf7] p-5 sm:p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide">
                {t("legal.identity")}
              </h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {identityRows.map((field) => (
                  <div key={field}>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                      {t(`legal.identityFields.${field}`)}
                    </dt>
                    <dd className="mt-0.5 text-sm text-stone-800">{SITE_CONFIG.legal[field]}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="space-y-10">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-lg font-semibold sm:text-xl">
                  <span className="text-[#906941]">{String(index + 1).padStart(2, "0")}.</span>{" "}
                  {section.heading}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-7 text-stone-700">
                    {paragraph}
                  </p>
                ))}

                {section.bullets?.length ? (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet.slice(0, 40)}
                        className="relative ps-5 text-sm leading-7 text-stone-700"
                      >
                        <span
                          className="absolute start-0 top-[13px] h-1.5 w-1.5 rounded-full bg-[#906941]"
                          aria-hidden="true"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {/* ── Contact ─────────────────────────────────────────── */}
          <section className="mt-12 rounded-sm border border-[#dfd6c7] bg-[#faf6f0] p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#906941]" aria-hidden="true" />
              <div>
                <h2 className="font-display text-base font-semibold">{t("legal.contactTitle")}</h2>
                <p className="mt-1.5 text-sm leading-6 text-stone-600">{t("legal.contactCopy")}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-medium text-stone-800 transition hover:border-stone-800"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span dir="ltr">{SITE_CONFIG.email}</span>
              </a>
              <a
                href={`tel:${SITE_CONFIG.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-medium text-stone-800 transition hover:border-stone-800"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                <span dir="ltr">{SITE_CONFIG.phone}</span>
              </a>
              <Link
                to="/contact-us"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-black px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                <WhatsAppGlyph className="h-4 w-4" />
                {t("legal.contactCta")}
              </Link>
            </div>
          </section>

          {/* ── Related documents ───────────────────────────────── */}
          <nav aria-label={t("legal.relatedLabel")} className="mt-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">
              {t("legal.related")}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {RELATED.filter(([key]) => key !== documentKey).map(([key, href]) => (
                <li key={key}>
                  <Link
                    to={href}
                    className="inline-flex min-h-10 items-center rounded-full border border-stone-300 px-4 text-xs font-medium text-stone-700 transition hover:border-stone-800 hover:text-black"
                  >
                    {t(`legal.${key}.title`, interpolation)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/returns-policy"
                  className="inline-flex min-h-10 items-center rounded-full border border-stone-300 px-4 text-xs font-medium text-stone-700 transition hover:border-stone-800 hover:text-black"
                >
                  {t("legal.returnsPolicy")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}
