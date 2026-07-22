import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ProductBreadcrumbs({ product }) {
  const { t } = useTranslation();
  const category = product?.gender || product?.category;
  const categoryUrl = category ? `/store/products?gender=${encodeURIComponent(category)}` : "/store/products";
  return (
    <nav className="nazra-container py-4 text-[11px] text-stone-500" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><Link to="/" className="transition hover:text-black">{t("productDetails.home")}</Link></li>
        <li aria-hidden="true"><ChevronRight className="h-3 w-3 rtl:rotate-180" /></li>
        <li><Link to={categoryUrl} className="transition hover:text-black">{category || t("productDetails.catalog")}</Link></li>
        <li aria-hidden="true"><ChevronRight className="h-3 w-3 rtl:rotate-180" /></li>
        <li className="font-medium text-stone-900" aria-current="page">{product?.name}</li>
      </ol>
    </nav>
  );
}
