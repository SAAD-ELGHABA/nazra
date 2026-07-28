import React from "react";
import AdminFeatureListPage from "./AdminFeatureListPage";
import { inventoryConfig } from "./adminFeatureConfigs";

export default function DashboardInventory() {
  return <AdminFeatureListPage config={inventoryConfig} />;
}
