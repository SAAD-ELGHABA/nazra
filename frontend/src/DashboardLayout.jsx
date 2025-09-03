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
  ArrowBack
} from "@mui/icons-material";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const year = new Date().getFullYear();

  const handleLogOut = () => {
    localStorage.removeItem("token");
    console.log("Logged out successfully");
    navigate("/login");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const currentPath = (url) => {
    return location.pathname === url ? "border-b-2 border-primary" : "text-gray-700";
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home /> },
    { path: "/dashboard/products", label: "Products", icon: <ShoppingBag /> },
    { path: "/dashboard/orders", label: "Orders", icon: <ShoppingCart /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h6"   component="div">
          NAZRA Dashboard
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.path} 
            disablePadding
            sx={{
              borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : "none",
              backgroundColor: location.pathname === item.path ? "action.selected" : "transparent"
            }}
          >
            <Button
              component={Link}
              to={item.path}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                px: 3,
                py: 1.5,
                color: location.pathname === item.path ? "primary.main" : "text.primary"
              }}
              onClick={() => setDrawerOpen(false)}
              startIcon={item.icon}
            >
              {item.label}
            </Button>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <Button
            fullWidth
            sx={{ justifyContent: "flex-start", px: 3, py: 1.5 }}
            onClick={handleLogOut}
            startIcon={<ExitToApp />}
            color="error"
          >
            Logout
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NAZRA Dashboard
          </Typography>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                component={Link}
                to="/"
                target="_blank"
                variant="outlined"
                size="small"
                startIcon={<ArrowBack />}
              >
                Visit Nazra
              </Button>
              
              <Box sx={{ display: "flex", gap: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    color={location.pathname === item.path ? "primary" : "inherit"}
                    sx={{
                      borderBottom: location.pathname === item.path ? `2px solid ${theme.palette.primary.main}` : "none",
                      borderRadius: 0
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              <Button
                color="inherit"
                onClick={handleLogOut}
                startIcon={<ExitToApp />}
              >
                Logout
              </Button>
            </Box>
          )}

          {isMobile && (
            <>
              <Button
                component={Link}
                to="/"
                target="_blank"
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
              >
                Visit
              </Button>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
              >
                <ExitToApp />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogOut}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 1 : 3 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2
        }}
      >
        <Box
          component="img"
          src="/Main-logo.jpeg"
          sx={{
            height: isMobile ? 80 : 120,
            objectFit: "contain"
          }}
          alt="Nazra Sunglasses Logo"
        />
        <Typography variant="body2" color="text.secondary">
          © {year} Nazra Sunglasses.
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardLayout;