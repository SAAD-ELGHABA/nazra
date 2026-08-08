import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COOKIEPOLICY } from "../../constant/routerConstants";
import { useConsent } from "../../context/ConsentContext";

/** Only the optional categories get a toggle; `necessary` is shown locked. */
const OPTIONAL_CATEGORIES = ["analytics", "marketing"];

function CategoryRow({ id, title, copy, checked, disabled, badge, onChange }) {
  return (
    <div className="flex items-start gap-3 border-t border-black/10 py-4 first:border-t-0 first:pt-0">
      <input
        id={`consent-${id}`}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-black disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="min-w-0">
        <label
          htmlFor={`consent-${id}`}
          className={`flex flex-wrap items-center gap-2 text-xs font-semibold text-[#151515] ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {title}
          {badge && (
            <span className="bg-stone-100 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-stone-500">
              {badge}
            </span>
          )}
        </label>
        <p className="mt-1 text-[11px] leading-5 text-stone-600">{copy}</p>
      </div>
    </div>
  );
}

/**
 * Granular consent editor, reachable from the banner and from the footer link
 * on every page — the footer entry point is what makes consent withdrawable
 * rather than a one-time question.
 *
 * Built on the shared Radix dialog so focus trapping, Escape handling and the
 * overlay behave like every other modal in the app.
 */
export default function CookiePreferencesPanel() {
  const { t } = useTranslation();
  const {
    categories,
    isPanelOpen,
    closePreferences,
    savePreferences,
    acceptAll,
    refuseAll,
  } = useConsent();
  const [draft, setDraft] = useState(categories);

  // Reopening always starts from the decision currently in force, never from
  // whatever was left on screen last time.
  useEffect(() => {
    if (isPanelOpen) setDraft(categories);
  }, [isPanelOpen, categories]);

  return (
    <Dialog open={isPanelOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">{t("cookies.panel.title")}</DialogTitle>
          <DialogDescription className="text-[11px] leading-5">
            {t("cookies.panel.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <CategoryRow
            id="necessary"
            title={t("cookies.categories.necessary.title")}
            copy={t("cookies.categories.necessary.copy")}
            badge={t("cookies.panel.alwaysOn")}
            checked
            disabled
          />
          {OPTIONAL_CATEGORIES.map((category) => (
            <CategoryRow
              key={category}
              id={category}
              title={t(`cookies.categories.${category}.title`)}
              copy={t(`cookies.categories.${category}.copy`)}
              checked={draft[category] === true}
              onChange={(checked) => setDraft((current) => ({ ...current, [category]: checked }))}
            />
          ))}
        </div>

        <Link
          to={COOKIEPOLICY}
          onClick={closePreferences}
          className="mt-1 inline-block text-[11px] font-semibold text-[#8d643d] underline underline-offset-4 hover:text-[#a97849]"
        >
          {t("cookies.panel.policy")}
        </Link>

        <div className="mt-5 flex flex-col gap-2 border-t border-black/10 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={refuseAll}
            className="nazra-button flex-1 border border-black/25 bg-white text-black hover:border-black"
          >
            {t("cookies.panel.refuseAll")}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="nazra-button flex-1 border border-black/25 bg-white text-black hover:border-black"
          >
            {t("cookies.panel.acceptAll")}
          </button>
          <button
            type="button"
            onClick={() => savePreferences(draft)}
            className="nazra-button flex-1 bg-black text-white hover:bg-[#8d643d]"
          >
            {t("cookies.panel.save")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
