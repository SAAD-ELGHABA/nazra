import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [{ code: "fr", label: "FR" }, { code: "ar", label: "AR" }, { code: "en", label: "EN" }];

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = i18n.resolvedLanguage?.split("-")[0] || "fr";

  useEffect(() => {
    const close = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-h-10 items-center gap-1 px-2 text-[11px] font-semibold tracking-wide hover:bg-stone-100" aria-haspopup="listbox" aria-expanded={open} aria-label="Changer de langue">
        {current.toUpperCase()} <ChevronDown size={12} aria-hidden="true" />
      </button>
      {open && (
        <div role="listbox" className="absolute end-0 top-full z-[70] min-w-20 border border-stone-200 bg-white py-1 shadow-lg">
          {LANGUAGES.map((language) => (
            <button key={language.code} type="button" role="option" aria-selected={current === language.code} onClick={() => { i18n.changeLanguage(language.code); setOpen(false); }} className={`block w-full px-4 py-2 text-start text-xs hover:bg-stone-100 ${current === language.code ? "font-bold" : ""}`}>{language.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
