import React, { useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContactUs() {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = "Contact Us - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
    // here the promise ...
  }, []);
  return (
    <section className="w-full text-black py-16 px-4 md:px-12 lg:px-20">
      <div className="md:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start md:items-center">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-wide uppercase">
            {t("contact.title")}
          </h2>
          <p className="text-gray-800 text-sm md:text-base">
            {t("contact.subtitle")}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-white" />
              <span className="text-gray-700">{t("contact.address")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-white" />
              <span className="text-gray-700">{t("contact.phone")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-white" />
              <span className="text-gray-700">{t("contact.email")}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-gray-400">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-gray-400">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-gray-400">
              <Twitter className="w-6 h-6" />
            </a>
          </div>

          <div className="mt-6 text-gray-400 text-sm md:text-base">
            {t("contact.suggestions")}
          </div>
        </div>

        <div className="bg-white text-black rounded-2xl shadow-lg p-8">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("contact.form.name")}
              </label>
              <input
                type="text"
                placeholder={t("contact.form.namePlaceholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("contact.form.email")}
              </label>
              <input
                type="email"
                placeholder={t("contact.form.emailPlaceholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("contact.form.message")}
              </label>
              <textarea
                rows="2"
                placeholder={t("contact.form.messagePlaceholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg border border-black hover:bg-white hover:text-black transition-colors duration-300"
            >
              {t("contact.form.submit")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
