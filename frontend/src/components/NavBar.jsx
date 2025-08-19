import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronDown, Menu, X } from "lucide-react";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleClickCart = () => {
    console.log("i clicked");
  };

  const handleClickHeart = () => {
    console.log("handle click");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="h-[60px] w-full  flex items-center justify-between px-4 md:px-6 bg-white shadow-md sticky top-0 z-50">
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
            <Link to={"#"} className="hover:text-gray-600">
              Home Page
            </Link>
          </li>
          <li>
            <Link to={"#"} className="hover:text-gray-600">
              Shop Now
            </Link>
          </li>
          <li>
            <Link to={"#"} className="hover:text-gray-600">
              About Us
            </Link>
          </li>
          <li>
            <Link
              to={"#"}
              className="flex items-center gap-1 hover:text-gray-600"
            >
              Collection <ChevronDown size={16} />
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-2">
          <Heart
            className="cursor-pointer hover:scale-105"
            color="black"
            onClick={handleClickHeart}
          />
          <button
            className="bg-black text-white px-4 py-2 shadow-sm hover:text-black border border-black hover:bg-transparent transition-colors duration-300"
            onClick={handleClickCart}
          >
            Cart
          </button>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button className="md:hidden p-2" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[60px] overflow-hidden left-0 right-0 bg-white shadow-lg py-4 px-6">
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                to={"#"}
                className="block py-2 hover:text-gray-600"
                onClick={toggleMobileMenu}
              >
                Home Page
              </Link>
            </li>
            <li>
              <Link
                to={"#"}
                className="block py-2 hover:text-gray-600"
                onClick={toggleMobileMenu}
              >
                Shop Now
              </Link>
            </li>
            <li>
              <Link
                to={"#"}
                className="block py-2 hover:text-gray-600"
                onClick={toggleMobileMenu}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to={"#"}
                className="flex items-center gap-1 py-2 hover:text-gray-600"
                onClick={toggleMobileMenu}
              >
                Collection <ChevronDown size={16} />
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
              Cart
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
