import { ShoppingCart, Home, ShoppingBasket, ShieldUser, Rss, User2, ChevronUp, SquareArrowOutUpRight, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import { DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenu } from "@/components/ui/dropdown-menu";
import { DASHBOARDHOME, DASHBOARDPRODUCTS, DASHBOARDORDERS, DASHBOARDADMINS, DASHBOARDBLOG, LOGIN } from "@/constant/routerConstants";
import { clearAuthStorage } from "@/utils/auth";

const items = [
  {
    title: "Dashboard",
    url: DASHBOARDHOME,
    icon: Home,
    capability: "dashboard.view",
  },
  {
    title: "Products",
    url: DASHBOARDPRODUCTS,
    icon: ShoppingBasket,
    capability: "products.read",
  },
  {
    title: "Orders",
    url: DASHBOARDORDERS,
    icon: ShoppingCart,
    capability: "orders.read",
  },
  {
    title: "Admins",
    url: DASHBOARDADMINS,
    icon: ShieldUser,
    capability: "admins.manage",
  },
  {
    title: "Blog",
    url: DASHBOARDBLOG,
    icon: Rss,
    capability: "blog.manage",
  },
];

export function AppSidebar({ currentUser, capabilities = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const capabilitySet = new Set(capabilities);
  const visibleItems = items.filter((item) => capabilitySet.has(item.capability));

  const currentPath = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(`${url}/`)
      ? "bg-slate-500 text-gray-50 shadow-md"
      : "";
  };

  const handleLogout = () => {
    clearAuthStorage();
    navigate(LOGIN, { replace: true });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="underline font-bold">NAZRA BACK-OFFICE</h1>
        <div className="flex items-center justify-between">
          <h1 className="text-sm italic font-bold text-slate-500">SEE OUR WEBSITE</h1>
          <Link to="/" target="_blank" rel="noreferrer" aria-label="Open public website">
            <SquareArrowOutUpRight size={16} />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={currentPath(item.url)}>
                    <Link to={item.url} aria-current={currentPath(item.url) ? "page" : undefined}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {currentUser?.name || "Administrator"}
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {currentUser?.role || "admin"}
                    </span>
                  </span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                {currentUser?.email && (
                  <DropdownMenuItem disabled>
                    <span className="truncate text-xs">{currentUser.email}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
