import React, { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import CardModal from "./CardModal";
import BrandLogo from "./BrandLogo";
import { useFavorites } from "../context/FavoritesContext";
import { useCard } from "../context/CardContext";

const NAV_LINKS = [
  ["home.nav.men", "/store/products?category=Men"],
  ["home.nav.women", "/store/products?category=Women"],
  ["home.nav.collections", "/store/products"],
  ["home.nav.bestSellers", "/#best-sellers"],
  ["home.nav.about", "/about"],
  ["home.nav.contact", "/contact-us"],
];

export default function NavBar() {
  const { t } = useTranslation();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const { favorites } = useFavorites();
  const { cardItems } = useCard();
  const isAboutPage = pathname === "/about";
  const isContactPage = pathname === "/contact-us";

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname, search, hash]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(`/store/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="bg-[#111] text-white">
        <div className="nazra-container flex h-7 items-center justify-center overflow-hidden text-[9px] tracking-wide sm:justify-between sm:text-[10px]">
          <span>{t("home.announcement.delivery")}</span><span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{t("home.announcement.cod")}</span><span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{t("home.announcement.exchange")}</span>
        </div>
      </div>
      <div className="border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="nazra-container grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 lg:h-[70px]">
          <Link to="/" className="inline-flex w-[132px] items-center sm:w-[150px]" aria-label="NAZRA — accueil"><BrandLogo /></Link>
          <nav className="hidden justify-self-center lg:block" aria-label="Navigation principale">
            <ul className="flex items-center gap-6 xl:gap-8">
              {NAV_LINKS.map(([key, href]) => {
                const isActive = (href === "/about" && isAboutPage) || (href === "/contact-us" && isContactPage);
                return <li key={key}><Link to={href} aria-current={isActive ? "page" : undefined} className={`text-[11px] font-medium transition hover:text-stone-500 ${isActive ? "border-b border-black pb-1" : ""}`}>{t(key)}</Link></li>;
              })}
            </ul>
          </nav>
          <div className="flex items-center justify-self-end">
            <LanguageSwitcher className="hidden sm:block" />
            <button type="button" onClick={() => setSearchOpen((value) => !value)} className="grid h-10 w-9 place-items-center hover:bg-stone-100" aria-label={t("home.nav.search")} aria-expanded={searchOpen}><Search size={17} /></button>
            <button type="button" disabled className="hidden h-10 w-9 cursor-not-allowed place-items-center text-stone-400 sm:grid" aria-label={t("store.accountSoon")} title={t("store.accountSoon")}><UserRound size={17} /></button>
            <Link to="/favorites" className="relative grid h-10 w-9 place-items-center hover:bg-stone-100" aria-label={t("navbar.wishlist")}><Heart size={17} />{favorites.length > 0 && <span className="nazra-count">{favorites.length}</span>}</Link>
            <button type="button" onClick={() => setCartOpen(true)} className="relative grid h-10 w-9 place-items-center hover:bg-stone-100" aria-label={t("navbar.cart")}><ShoppingBag size={17} />{cardItems.length > 0 && <span className="nazra-count">{cardItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}</span>}</button>
            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="grid h-10 w-9 place-items-center lg:hidden" aria-label={t(menuOpen ? "home.nav.close" : "home.nav.menu")} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
      </div>
      {searchOpen && <form onSubmit={submitSearch} className="absolute inset-x-0 top-full border-b border-stone-200 bg-white p-4 shadow-lg"><div className="nazra-container flex"><label htmlFor="site-search" className="sr-only">{t("home.nav.search")}</label><input id="site-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("home.nav.search")} className="min-h-11 flex-1 border border-stone-300 px-4 text-sm outline-none focus:border-black" /><button className="min-h-11 bg-black px-5 text-white" aria-label={t("home.nav.search")}><Search size={17} /></button></div></form>}
      {menuOpen && <nav className="fixed inset-x-0 bottom-0 top-[92px] overflow-y-auto bg-white p-6 lg:hidden" aria-label="Navigation mobile"><ul className="divide-y divide-stone-200">{NAV_LINKS.map(([key, href]) => {
        const isActive = (href === "/about" && isAboutPage) || (href === "/contact-us" && isContactPage);
        return <li key={key}><Link to={href} aria-current={isActive ? "page" : undefined} className={`block py-5 font-display text-2xl ${isActive ? "text-[#906941]" : ""}`}>{t(key)}</Link></li>;
      })}</ul><LanguageSwitcher className="mt-6 sm:hidden" /></nav>}
      {cartOpen && <CardModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />}
    </header>
  );
}
