import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronDown, Menu, X, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleClickCart = () => {
    console.log("i clicked");
  };

  const handleClickHeart = () => {
    console.log("handle click");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lng", lng);
  };

  return (
    <header className="h-[60px] w-full flex items-center justify-between px-4 md:px-6 bg-white shadow-md sticky top-0 z-50">
      <Link className="overflow-hidden h-full">
        <img
          src="/Main-logo.jpeg"
          alt="Nazra"
          className="object-cover w-[120px] h-full md:w-[180px] mt-2"
        />
      </Link>

      <nav className="hidden md:flex items-center h-full gap-8 lg:gap-16">
        <ul className="flex items-center gap-4 lg:gap-6">
          <li>
            <Link to={"/"} className="hover:text-gray-600">
              {t("navbar.home")}
            </Link>
          </li>
          <li>
            <Link to={"#"} className="hover:text-gray-600">
              {t("navbar.shop")}
            </Link>
          </li>
          <li>
            <Link to={"/about"} className="hover:text-gray-600">
              {t("navbar.about")}
            </Link>
          </li>
          <li>
            <Link
              to={"#"}
              className="flex items-center gap-1 hover:text-gray-600"
            >
              {t("navbar.collection")} <ChevronDown size={16} />
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <Link>
            <Heart
              className="cursor-pointer hover:fill-black"
              color="black"
              onClick={handleClickHeart}
            />
          </Link>
          <Link
            onClick={handleClickCart}
          >
            <ShoppingCart className="hover:fill-black"/>
          </Link>

          <LanguageSwitcher />
        </div>
      </nav>

      <button className="md:hidden p-2" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-white shadow-lg py-4 px-6 z-40">
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                to={"/"}
                className="block py-2 hover:text-gray-600"
                onClick={toggleMobileMenu}
              >
                {t("navbar.home")}
              </Link>
            </li>
            <li>
              <Link
                to={"#"}
                className="block py-2 hover:text-gray-600"
                onClick={toggleMobileMenu}
              >
                {t("navbar.shop")}
              </Link>
            </li>
            <li>
              <Link
                to={"/about"}
                className="block py-2 hover:text-gray-600"
                onClick={toggleMobileMenu}
              >
                {t("navbar.about")}
              </Link>
            </li>
            <li>
              <Link
                to={"#"}
                className="flex items-center gap-1 py-2 hover:text-gray-600"
                onClick={toggleMobileMenu}
              >
                {t("navbar.collection")} <ChevronDown size={16} />
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <Heart
              className="cursor-pointer hover:scale-105"
              color="black"
              onClick={() => {
                handleClickHeart();
                toggleMobileMenu();
              }}
            />
            <button
              className="bg-black text-white px-4 py-2 shadow-sm hover:text-black border border-black hover:bg-transparent transition-colors duration-300 flex-1"
              onClick={() => {
                handleClickCart();
                toggleMobileMenu();
              }}
            >
              {t("navbar.cart")}
            </button>
          </div>

          <LanguageSwitcher />
        </div>
      )}
    </header>
  );
};

export default NavBar;
