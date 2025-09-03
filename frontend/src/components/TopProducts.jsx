import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  ShoppingCart
} from '@mui/icons-material';
import { getProducts, getOrders } from '../api/api';

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchTopProducts();
  }, [timeRange]);

  // Function to get product image safely
  const getProductImage = (product) => {
    // Try to get image from colors array
    if (product.colors && product.colors.length > 0 && 
        product.colors[0].images && product.colors[0].images.length > 0) {
      return product.colors[0].images[0].url;
    }
    
    // Try to get image from images array directly on product
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    
    // Fallback to placeholder
    return '/api/placeholder/40/40';
  };

  // Function to estimate views based on sales
  const estimateViews = (sales) => {
    // Assuming a conversion rate of around 2-5%, we'll estimate views
    const minViews = sales * 20; // 5% conversion rate
    const maxViews = sales * 50; // 2% conversion rate
    return Math.floor(Math.random() * (maxViews - minViews + 1)) + minViews;
  };

  // Function to calculate sales trend (random for demo purposes)
  const calculateTrend = () => {
    return Math.random() > 0.5 ? 'up' : 'down';
  };

  // Function to calculate trend value (random for demo purposes)
  const calculateTrendValue = () => {
    return Math.floor(Math.random() * 20) + 1;
  };

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch products and orders from API
      const productsResponse = await getProducts();
      const ordersResponse = await getOrders();
      
      const productsData = productsResponse?.data?.products || [];
      const ordersData = ordersResponse?.data?.orders || [];
      
      // Calculate sales for each product
      const productsWithSales = productsData.map(product => {
        let sales = 0;
        let revenue = 0;
        
        // Calculate sales and revenue from orders
        ordersData.forEach(order => {
          if (order.products && order.status !== 'cancelled') {
            order.products.forEach(item => {
              if (item.product && item.product._id === product._id) {
                sales += item.quantity;
                const price = item.product.sale_price || item.product.original_price;
                revenue += item.quantity * price;
              }
            });
          }
        });
        
        // Estimate views based on sales
        const views = estimateViews(sales);
        
        return {
          id: product._id,
          name: product.name,
          image: getProductImage(product),
          sales: sales,
          revenue: revenue,
          trend: calculateTrend(),
          trendValue: calculateTrendValue(),
          stock: product.stock || 0,
          views: views
        };
      });
      
      // Sort by sales (descending) and take top 5
      const topProducts = productsWithSales
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
      
      setProducts(topProducts);
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' 
      ? <TrendingUp color="success" sx={{ fontSize: 18 }} /> 
      : <TrendingDown color="error" sx={{ fontSize: 18 }} />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Loading top products...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, width:1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Top Selling Products
        </Typography>
        <Box>
          {['week', 'month', 'year'].map((range) => (
            <Chip
              key={range}
              label={range.charAt(0).toUpperCase() + range.slice(1)}
              color={timeRange === range ? 'primary' : 'default'}
              onClick={() => setTimeRange(range)}
              size="small"
              sx={{ ml: 1 }}
            />
          ))}
        </Box>
      </Box>

      <TableContainer>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Sales</TableCell>
              <TableCell align="right">Revenue</TableCell>
              <TableCell align="right">Trend</TableCell>
              {/* <TableCell align="right">Stock</TableCell> */}
              <TableCell align="right">Views</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={product.image} 
                      alt={product.name}
                      sx={{ width: 40, height: 40, mr: 2 }}
                      variant="rounded"
                    />
                    <Typography variant="body2">
                      {product.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <ShoppingCart sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    {product.sales}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(product.revenue)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {getTrendIcon(product.trend)}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {product.trendValue}%
                    </Typography>
                  </Box>
                </TableCell>
                {/* <TableCell align="right">
                  <Chip 
                    label={product.stock} 
                    size="small" 
                    color={product.stock < 10 ? 'error' : product.stock < 50 ? 'warning' : 'success'}
                    variant={product.stock < 10 ? 'filled' : 'outlined'}
                  />
                </TableCell> */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Visibility sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    {product.views.toLocaleString()}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {products.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No products data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TopProducts;