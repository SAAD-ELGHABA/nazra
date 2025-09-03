import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOrders } from '../api/api';

const OrderStats = () => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthRange, setMonthRange] = useState('6'); // Default to last 6 months
  const [allOrders, setAllOrders] = useState([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (allOrders.length > 0) {
      processOrderData();
    }
  }, [allOrders, monthRange]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      
      if (response.status === 200) {
        setAllOrders(response.data.orders);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const processOrderData = () => {
    // Calculate date range based on months
    const months = monthRange === 'all' ? 120 : parseInt(monthRange); // 120 months = 10 years for "all"
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Filter orders by date range
    const filteredOrders = monthRange === 'all' 
      ? allOrders 
      : allOrders.filter(order => new Date(order.createdAt) >= startDate);
    
    // Group orders by month
    const ordersByMonth = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      // Use shorter month format for mobile
      const monthName = isMobile 
        ? date.toLocaleDateString('en-US', { month: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!ordersByMonth[monthYear]) {
        ordersByMonth[monthYear] = {
          month: monthName,
          monthKey: monthYear,
          orders: 0
        };
      }
      
      ordersByMonth[monthYear].orders += 1;
    });
    
    // Convert to array format for the chart and sort by month
    const formattedData = Object.values(ordersByMonth).sort((a, b) => 
      a.monthKey.localeCompare(b.monthKey)
    );
    
    setOrderData(formattedData);
  };

  return (
    <Box sx={{ width: '100%', maxHeight: 500, p: isMobile ? 0 : 1 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={isMobile ? 'flex-start' : 'center'} 
        flexDirection={isMobile ? 'column' : 'row'}
        gap={isMobile ? 1 : 0}
        mb={2}
      >
        <Typography variant={isMobile ? "h6" : "h6"} component="h2">
          Monthly Orders
        </Typography>
        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 140 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={monthRange}
            label="Time Range"
            onChange={(e) => setMonthRange(e.target.value)}
          >
            <MenuItem value="3">Last 3 Months</MenuItem>
            <MenuItem value="6">Last 6 Months</MenuItem>
            <MenuItem value="12">Last 12 Months</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : orderData.length > 0 ? (
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <BarChart 
            data={orderData}
            margin={isMobile ? { top: 10, right: 5, left: 0, bottom: 5 } : { top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? Math.ceil(orderData.length / 4) - 1 : 0}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip 
              formatter={(value) => [`${value} orders`, 'Orders']}
              labelStyle={{ fontWeight: 'bold', fontSize: isMobile ? 12 : 14 }}
              contentStyle={{ fontSize: isMobile ? 12 : 14 }}
            />
            <Bar 
              dataKey="orders" 
              fill="#1976d2" 
              name="Orders"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No orders found for the selected period
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OrderStats;