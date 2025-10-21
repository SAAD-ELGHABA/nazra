import { ShoppingCart, Home, ShoppingBasket, ShieldUser, Rss, User2, ChevronUp, SquareArrowOutUpRight } from "lucide-react"
import { Link, useLocation, useNavigate } from 'react-router-dom'

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
} from "@/components/ui/sidebar"
import { DropdownMenuItem,DropdownMenuContent, DropdownMenuTrigger, DropdownMenu } from "@/components/ui/dropdown-menu"
import { DASHBOARDHOME, DASHBOARDPRODUCTS, DASHBOARDORDERS, DASHBOARDADMINS, DASHBOARDBLOG } from '@/constant/routerConstants'

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: DASHBOARDHOME,
    icon: Home,
  },
  {
    title: "Products",
    url: DASHBOARDPRODUCTS,
    icon: ShoppingBasket,
  },
  {
    title: "Orders",
    url: DASHBOARDORDERS,
    icon: ShoppingCart,
  },
  {
    title: "Admins",
    url: DASHBOARDADMINS,
    icon: ShieldUser,
  },
  {
    title: "Blog",
    url: DASHBOARDBLOG,
    icon: Rss,
  },
]

export function AppSidebar() {
    // const navigate = useNavigate()
      const location = useLocation();
    
      const currentPath = (url: string) => {
    return location.pathname === url ? "bg-slate-500 text-gray-50 shadow-md" : "";
  };
  return (
    <Sidebar>
        <SidebarHeader>
    <h1 className="underline font-bold">NAZRA BACK-OFFICE</h1>
    <div className="flex items-center justify-between">
        <h1 className="text-sm italic font-bold text-slate-500">SEE OUR WEBSITE</h1>
        <Link to={'/'} target="_tab"><SquareArrowOutUpRight size={16} /></Link>
    </div>
        </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={currentPath(item.url)}>
                    <Link to={item.url}>
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
                    <User2 /> Username
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}