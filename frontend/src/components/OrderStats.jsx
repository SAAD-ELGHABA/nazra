import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOrders } from '../api/api';

const OrderStats = () => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthRange, setMonthRange] = useState('6'); // Default to last 6 months
  const [allOrders, setAllOrders] = useState([]);

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
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
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
    <Box width={600} maxHeight={500}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Monthly Orders
        </Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orderData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} orders`, 'Orders']}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Bar 
              dataKey="orders" 
              fill="#1976d2" 
              name="Orders"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography variant="body2" color="text.secondary">
            No orders found for the selected period
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OrderStats;