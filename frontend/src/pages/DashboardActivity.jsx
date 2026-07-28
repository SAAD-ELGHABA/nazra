import React from "react";
import AdminFeatureListPage from "./AdminFeatureListPage";
import { activityConfig } from "./adminFeatureConfigs";

export default function DashboardActivity() {
  return <AdminFeatureListPage config={activityConfig} />;
}
