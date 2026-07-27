import React from "react";
import AdminPageContainer from "@/components/admin/page/AdminPageContainer";
import AdminPageHeader from "@/components/admin/page/AdminPageHeader";
import SubEmails from "@/components/Dashboard/SubEmails";
import { DASHBOARDHOME, DASHBOARDSUBSCRIBERS } from "@/constant/routerConstants";
import { useAdminPageMeta } from "@/context/AdminPageContext";

export default function DashboardSubscribers() {
  useAdminPageMeta({
    title: "Subscribers",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Subscribers", href: DASHBOARDSUBSCRIBERS },
    ],
  });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Subscribers"
        description="View people who explicitly consented to receive NAZRA updates."
      />
      <SubEmails />
    </AdminPageContainer>
  );
}
