import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ChevronDown, Menu, X, ShoppingCart, ChevronLeft, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { useFavorites } from "../context/FavoritesContext";
import CardModal from "./CardModal";
import CollectionDropdown from "./CollectionDropdown";
import { useCard } from "../context/CardContext";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const { favorites } = useFavorites();
  const { cardItems } = useCard();
  const [toggleCart, setToggleCart] = useState(false);
  return (
    <header className="h-[60px] w-full flex items-center justify-between px-4 md:px-6 bg-white shadow-md sticky top-0 z-50">
      <ArrowLeft className='md:hidden' onClick={() => navigate(-1)} />
      <Link className="overflow-hidden h-full flex-1 flex pl-10 md:p-0 items-center justify-center md:flex-none bg-orang-600">
        <img
          src="/S.svg"
          alt="Nazra"
          className="object-cover w-[100px] h-[50px] md:w-full md:h-full"
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
            <Link to={"/store"} className="hover:text-gray-600">
              {t("navbar.shop")}
            </Link>
          </li>
          <li>
            <Link to={"/about"} className="hover:text-gray-600">
              {t("navbar.about")}
            </Link>
          </li>
          <li>
            <CollectionDropdown />
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <Link className="relative" to={"/favorites"}>
            <Heart className="cursor-pointer hover:fill-black" color="black" />
            {favorites.length > 0 && (
              <span className="absolute top-0 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
                {favorites.length}
              </span>
            )}
          </Link>
          <button
            className="cursor-pointer relative"
            onClick={() => {
              setToggleCart(!toggleCart);
            }}
          >
            <ShoppingCart className="hover:fill-black" />
            {cardItems.length > 0 && (
              <span className="absolute top-0 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
                {cardItems.length}
              </span>
            )}
          </button>

          <LanguageSwitcher />
        </div>
      </nav>
      <div className='md:hidden flex items-center gap-2'>
         <Link className="relative" to={"/favorites"}>
              <Heart
                className="cursor-pointer hover:fill-black"
                color="black"
              />
              {favorites.length > 0 && (
                <span className="absolute top-0 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button
              className=""
              onClick={() => {
                // toggleMobileMenu();
                setToggleCart(!toggleCart);
              }}
            >
              <ShoppingCart />
              {cardItems.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[12px] rounded-full px-1">
                  {cardItems.length}
                </span>
              )}
            </button>
        <button className="" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className={`
        md:hidden absolute top-[60px] left-0 right-0 bg-white shadow-lg py-4 px-6 z-40 mobile-menu
        ${isMobileMenuOpen ? "open" : ""}
        `}
        >
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
                to={"/store"}
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
              <CollectionDropdown />
            </li>
          </ul>
          {/* <div className="flex items-center gap-4 mt-4 pt-4 border-t">
           
          </div> */}
          <LanguageSwitcher />
        </div>
      )}

      {toggleCart && (
        <CardModal isOpen={toggleCart} onClose={() => setToggleCart(false)}>
          <p>This is the content of your card modal.</p>
        </CardModal>
      )}
    </header>
  );
};

export default NavBar;
