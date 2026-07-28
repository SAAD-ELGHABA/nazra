import React from "react";
import AdminFeatureListPage from "./AdminFeatureListPage";
import { customersConfig } from "./adminFeatureConfigs";

export default function DashboardCustomers() {
  return <AdminFeatureListPage config={customersConfig} />;
}
