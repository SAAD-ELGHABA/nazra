import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ShieldUser,
  Rss,
  BarChart3,
  Mail,
  Archive,
  Contact,
  Images,
  Download,
  MessageSquare,
  Settings,
  Star,
  Users,
} from "lucide-react";
import {
  DASHBOARDHOME,
  DASHBOARDPRODUCTS,
  DASHBOARDORDERS,
  DASHBOARDADMINS,
  DASHBOARDBLOG,
  DASHBOARDANALYTICS,
  DASHBOARDSUBSCRIBERS,
  DASHBOARDACTIVITY,
  DASHBOARDCONTACTS,
  DASHBOARDCUSTOMERS,
  DASHBOARDEXPORTS,
  DASHBOARDINVENTORY,
  DASHBOARDMEDIA,
  DASHBOARDREVIEWS,
  DASHBOARDSETTINGS,
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
      {
        label: "Inventory",
        href: DASHBOARDINVENTORY,
        icon: Archive,
        requiredCapability: "inventory.read",
        activeMatchPatterns: [DASHBOARDINVENTORY],
        documentTitle: "Inventory",
      },
      {
        label: "Customers",
        href: DASHBOARDCUSTOMERS,
        icon: Users,
        requiredCapability: "customers.read",
        activeMatchPatterns: [DASHBOARDCUSTOMERS],
        documentTitle: "Customers",
      },
      {
        label: "Exports",
        href: DASHBOARDEXPORTS,
        icon: Download,
        requiredCapability: "orders.export",
        activeMatchPatterns: [DASHBOARDEXPORTS],
        documentTitle: "Exports",
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
        label: "Contacts",
        href: DASHBOARDCONTACTS,
        icon: Contact,
        requiredCapability: "contacts.read",
        activeMatchPatterns: [DASHBOARDCONTACTS],
        documentTitle: "Contacts",
      },
      {
        label: "Reviews",
        href: DASHBOARDREVIEWS,
        icon: Star,
        requiredCapability: "reviews.read",
        activeMatchPatterns: [DASHBOARDREVIEWS],
        documentTitle: "Reviews",
      },
      {
        label: "Blog",
        href: DASHBOARDBLOG,
        icon: Rss,
        requiredCapability: "blog.manage",
        activeMatchPatterns: ["/admins/dashboard/blogs"],
        documentTitle: "Blog",
      },
      {
        label: "Media Library",
        href: DASHBOARDMEDIA,
        icon: Images,
        requiredCapability: "media.manage",
        activeMatchPatterns: [DASHBOARDMEDIA],
        documentTitle: "Media Library",
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
      {
        label: "Activity Log",
        href: DASHBOARDACTIVITY,
        icon: MessageSquare,
        requiredCapability: "activity.read",
        activeMatchPatterns: [DASHBOARDACTIVITY],
        documentTitle: "Activity Log",
      },
      {
        label: "Settings",
        href: DASHBOARDSETTINGS,
        icon: Settings,
        requiredCapability: "settings.read",
        activeMatchPatterns: [DASHBOARDSETTINGS],
        documentTitle: "Settings",
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
