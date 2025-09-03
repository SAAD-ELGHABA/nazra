import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress
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
    <Box sx={{ flexGrow: 1, p: 3 }} >
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={6} justifyContent={'center'} sx={{ mb: 4 }} >
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index} >
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} justifyContent={'center'}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <OrderStats />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <ProductStats />
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Sections */}
      <Grid container spacing={3} sx={{ mt: 2 }} justifyContent={'center'}>
        <Grid item xs={12} >
          <Paper sx={{ p: 2 }}>
            <VisitorStats />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper size={{ xs: 12 }} sx={{ p: 2 }}>
            <RecentOrders />
          </Paper>
        </Grid>
      </Grid>

      <Grid spacing={3} sx={{ mt: 2 }} justifyContent={'center'} >
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <TopProducts />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{
    background: `linear-gradient(45deg, ${color} 30%, ${color}dd 90%)`,
    color: 'white',
    borderRadius: 2,
    boxShadow: 3,
    padding:'4px',
    width:'150px'
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center',justifyContent:'space-between', mb: 2 }}>
        <Box sx={{  fontSize: '2rem' }}>
          {icon}
        </Box>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold',display:'flex',alignItems:'center', fontSize:'28px' }}>
          {value}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

export default Dashboard;