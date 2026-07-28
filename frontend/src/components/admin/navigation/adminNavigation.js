import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ShieldUser,
  Rss,
  BarChart3,
  Mail,
} from "lucide-react";
import {
  DASHBOARDHOME,
  DASHBOARDPRODUCTS,
  DASHBOARDORDERS,
  DASHBOARDADMINS,
  DASHBOARDBLOG,
  DASHBOARDANALYTICS,
  DASHBOARDSUBSCRIBERS,
} from "@/constant/routerConstants";

/**
 * Central admin navigation configuration.
 * Only include items whose pages exist and work.
 */
export const adminNavigation = [
  {
    label: "Overview",
    href: DASHBOARDHOME,
    icon: LayoutDashboard,
    requiredCapability: ["dashboard.view", "analytics.read"],
    exactMatch: true,
    documentTitle: "Overview",
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Orders",
        href: DASHBOARDORDERS,
        icon: ShoppingCart,
        requiredCapability: "orders.read",
        activeMatchPatterns: ["/admins/dashboard/orders"],
        documentTitle: "Orders",
      },
      {
        label: "Products",
        href: DASHBOARDPRODUCTS,
        icon: Package,
        requiredCapability: "products.read",
        activeMatchPatterns: [
          "/admins/dashboard/products",
        ],
        documentTitle: "Products",
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      {
        label: "Analytics",
        href: DASHBOARDANALYTICS,
        icon: BarChart3,
        requiredCapability: "analytics.read",
        activeMatchPatterns: [DASHBOARDANALYTICS],
        documentTitle: "Analytics",
      },
      {
        label: "Subscribers",
        href: DASHBOARDSUBSCRIBERS,
        icon: Mail,
        requiredCapability: "subscribers.read",
        activeMatchPatterns: [DASHBOARDSUBSCRIBERS],
        documentTitle: "Subscribers",
      },
      {
        label: "Blog",
        href: DASHBOARDBLOG,
        icon: Rss,
        requiredCapability: "blog.manage",
        activeMatchPatterns: ["/admins/dashboard/blogs"],
        documentTitle: "Blog",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Administrators",
        href: DASHBOARDADMINS,
        icon: ShieldUser,
        requiredCapability: "admins.manage",
        activeMatchPatterns: ["/admins/dashboard/admins"],
        documentTitle: "Administrators",
      },
    ],
  },
];

export const flattenNavigationItems = (navigation = adminNavigation) => {
  const items = [];

  navigation.forEach((entry) => {
    if (entry.href) items.push(entry);
    if (Array.isArray(entry.items)) items.push(...entry.items);
  });

  return items;
};
