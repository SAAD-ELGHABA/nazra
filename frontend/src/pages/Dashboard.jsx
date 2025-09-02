import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ShoppingCart,
  People,
  Visibility,
  TrendingUp,
  Inventory,
  AttachMoney
} from '@mui/icons-material';
import OrderStats from '../components/OrderStats';
import ProductStats from '../components/ProductStats';
import VisitorStats from '../components/VisitorStats';
import RecentOrders from '../components/RecentOrders';
import TopProducts from '../components/TopProducts';
import { getOrders, getProducts } from '../api/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalViews, setTotalViews] = useState(1000) // Estimated visitor count
  const [conversionRate, setConversionRate] = useState(0)
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getUniqueEmail = (orders = []) => {
    const uniqueEmail = new Set()
    orders.forEach(order => {
      if (order.email) {
        uniqueEmail.add(order.email.toLowerCase())
      }
    })
    return uniqueEmail.size
  }

  const calculateRevenue = (orders = []) => {
    let totalRevenue = 0;
    orders.forEach(order => {
      const orderRevenue = order.products.reduce((sum, productItem) => {
        const price = productItem.product.sale_price || productItem.product.original_price;
        return sum + (productItem.quantity * price);
      }, 0);
      totalRevenue += orderRevenue;
    });
    return totalRevenue
  }

  const calculateConversionRate = (ordersCount, visitorsCount) => {
    if (visitorsCount === 0) return 0;
    return ((ordersCount / visitorsCount) * 100).toFixed(2);
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const orders = await getOrders();
      const products = await getProducts()
      
      const ordersCount = orders?.data?.orders?.length || 0;
      const productsCount = products?.data?.products?.length || 0;
      const customersCount = getUniqueEmail(orders?.data?.orders);
      const revenue = calculateRevenue(orders?.data?.orders);
      const conversion = calculateConversionRate(ordersCount, totalViews);
      
      setTotalOrders(ordersCount);
      setTotalProducts(productsCount);
      setTotalCustomers(customersCount);
      setTotalRevenue(revenue);
      setConversionRate(conversion);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: <ShoppingCart />,
      color: '#1976d2'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <AttachMoney />,
      color: '#2e7d32'
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: <Inventory />,
      color: '#ed6c02'
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: <People />,
      color: '#9c27b0'
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: <Visibility />,
      color: '#0288d1'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: <TrendingUp />,
      color: '#d32f2f'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: isMobile ? 1 : 3 }} >
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ mb: 2 }}>
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 2 : 3} justifyContent={'center'} sx={{ mb: 3 }} >
        {statCards.map((card, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={index} >
            <StatCard {...card} isMobile={isMobile} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={isMobile ? 1 : 3} justifyContent={'center'}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: isMobile ? 1 : 2 }}>
            <OrderStats />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: isMobile ? 1 : 2, mt: isMobile ? 1 : 0 }}>
            <ProductStats />
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Sections */}
      <Grid container spacing={isMobile ? 1 : 3} sx={{ mt: 1 }} justifyContent={'center'}>
        <Grid item xs={12}>
          <Paper sx={{ p: isMobile ? 1 : 2 }}>
            <VisitorStats />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: isMobile ? 1 : 2, mt: isMobile ? 1 : 0 }}>
            <RecentOrders />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: isMobile ? 1 : 2, mt: isMobile ? 1 : 0 }}>
            <TopProducts />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const StatCard = ({ title, value, icon, color, isMobile }) => (
  <Card sx={{
    background: `linear-gradient(45deg, ${color} 30%, ${color}dd 90%)`,
    color: 'white',
    borderRadius: 2,
    boxShadow: 2,
    height: isMobile ? '90px' : '110px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <CardContent sx={{ p: isMobile ? 1 : 2, width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isMobile ? 'center' : 'space-between', 
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left',
        gap: isMobile ? 0.5 : 0
      }}>
        <Box sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
          {icon}
        </Box>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="div" 
          sx={{ 
            fontWeight: 'bold', 
            fontSize: isMobile ? '16px' : 'inherit'
          }}
        >
          {value}
        </Typography>
      </Box>
      <Typography 
        variant="body2" 
        sx={{ 
          opacity: 0.9, 
          textAlign: 'center',
          fontSize: isMobile ? '0.7rem' : '0.8rem',
          mt: isMobile ? 0.5 : 1
        }}
      >
        {title}
      </Typography>
    </CardContent>
  </Card>
);

export default Dashboard;