import React from "react";
import AdminFeatureListPage from "./AdminFeatureListPage";
import { exportsConfig } from "./adminFeatureConfigs";

export default function DashboardExports() {
  return <AdminFeatureListPage config={exportsConfig} />;
}
