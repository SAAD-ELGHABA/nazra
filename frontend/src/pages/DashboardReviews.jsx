import React from "react";
import AdminFeatureListPage from "./AdminFeatureListPage";
import { reviewsConfig } from "./adminFeatureConfigs";

export default function DashboardReviews() {
  return <AdminFeatureListPage config={reviewsConfig} />;
}
