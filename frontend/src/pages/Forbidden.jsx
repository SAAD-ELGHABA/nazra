import React from "react";
import AdminForbiddenState from "@/components/admin/feedback/AdminForbiddenState";
import { DASHBOARDHOME } from "@/constant/routerConstants";
import { useAdminPageMeta } from "@/context/AdminPageContext";

const Forbidden = () => {
  useAdminPageMeta({
    title: "Access denied",
    documentTitle: "Access denied",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Access denied" },
    ],
  });

  return <AdminForbiddenState />;
};

export default Forbidden;
