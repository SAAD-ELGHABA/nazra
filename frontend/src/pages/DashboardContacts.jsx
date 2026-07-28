import React from "react";
import AdminFeatureListPage from "./AdminFeatureListPage";
import { contactsConfig } from "./adminFeatureConfigs";

export default function DashboardContacts() {
  return <AdminFeatureListPage config={contactsConfig} />;
}
