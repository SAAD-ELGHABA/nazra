import React from "react";
import AdminPageContainer from "@/components/admin/page/AdminPageContainer";
import AdminPageHeader from "@/components/admin/page/AdminPageHeader";
import VisitorAnalytics from "@/components/Dashboard/VisitorAnalytics";
import { DASHBOARDANALYTICS, DASHBOARDHOME } from "@/constant/routerConstants";
import { useAdminPageMeta } from "@/context/AdminPageContext";

export default function DashboardAnalytics() {
  useAdminPageMeta({
    title: "Analytics",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Analytics", href: DASHBOARDANALYTICS },
    ],
  });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Analytics"
        description="Review real visitor sources and browser usage."
      />
      <VisitorAnalytics />
    </AdminPageContainer>
  );
}
