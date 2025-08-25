import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const CollectionDropdown = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">  {/* changed from <li> to <div> */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium"
      >
        {t("navbar.collection")} <ChevronDown size={16} />
      </button>

      <div
        className={`absolute top-full left-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50
                    transition-all duration-200 transform origin-top 
                    ${
                      open
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0 pointer-events-none"
                    }`}
      >
        <ul className="py-1">
          <li>
            <Link
              to="/eyeglasses"
              className="block px-4 py-2 text-black hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              {t("navbar.eyeglasses")}
            </Link>
          </li>
          <li>
            <Link
              to="/sunglasses"
              className="block px-4 py-2 text-black hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              {t("navbar.sunglasses")}
            </Link>
          </li>
        </ul>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default CollectionDropdown;
