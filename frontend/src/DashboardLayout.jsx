import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  Box,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExitToApp,
  Home,
  ShoppingBag,
  ShoppingCart,
  ArrowBack,
  
} from "@mui/icons-material";
import { ScrollText, User } from 'lucide-react'
import { SidebarProvider, SidebarTrigger  } from './components/ui/sidebar'
import { AppSidebar   } from './components/app-sidebar'




const DashboardLayout = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const year = new Date().getFullYear();

  const handleLogOut = () => {
    localStorage.removeItem("User_Data_token");
    localStorage.removeItem("User_Data");
    console.log("Logged out successfully");
    navigate("/login");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // eslint-disable-next-line no-unused-vars




  return (
    <SidebarProvider>
<AppSidebar />
<main className="flex justify-center  flex-1">
  <SidebarTrigger />
  <Outlet />
</main>
    </SidebarProvider>
  )
};

export default DashboardLayout;