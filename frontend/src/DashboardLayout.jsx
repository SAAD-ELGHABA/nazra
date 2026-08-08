import React from "react";
import AdminShell from "./components/admin/shell/AdminShell";
import { useNoIndex } from "./hooks/usePageSeo";

const DashboardLayout = () => {
  // Every /admins/* route renders through here, so one call keeps the whole
  // back office out of the index. Authentication remains the actual barrier.
  useNoIndex();

  return <AdminShell />;
};

export default DashboardLayout;
