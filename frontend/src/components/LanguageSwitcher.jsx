import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "ar", label: "العربية" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lng", lng);
    setOpen(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className} w-full `}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 border border-gray-300 rounded-md px-3 cursor-pointer bg-black shadow-sm hover:bg-black/90 text-white transition py-3 md:py-2 w-full md:w-auto justify-center mt-4 md:mt-0"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">
          {languages.find((l) => l.code === i18n.language)?.label || "Language"}
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 top-full">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                i18n.language === lang.code ? "bg-gray-50 font-medium" : ""
              }`}
            >
              {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
