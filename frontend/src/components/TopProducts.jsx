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
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
        .slice(0, isMobile ? 3 : 5);
      
      setProducts(topProducts);
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' 
      ? <TrendingUp color="success" sx={{ fontSize: isMobile ? 14 : 18 }} /> 
      : <TrendingDown color="error" sx={{ fontSize: isMobile ? 14 : 18 }} />;
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
      <Paper sx={{ p: isMobile ? 1 : 2, height: isMobile ? 300 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontSize: isMobile ? '12px' : '14px' }}>
            Loading top products...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: isMobile ? 1 : 2, width: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0,
        mb: 2 
      }}>
        <Typography variant={isMobile ? "h6" : "h6"} component="h2">
          Top Products
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {['week', 'month', 'year'].map((range) => (
            <Chip
              key={range}
              label={isMobile ? range.charAt(0).toUpperCase() : range.charAt(0).toUpperCase() + range.slice(1)}
              color={timeRange === range ? 'primary' : 'default'}
              onClick={() => setTimeRange(range)}
              size="small"
              sx={{ 
                fontSize: isMobile ? '10px' : '12px',
                height: isMobile ? 24 : 32
              }}
            />
          ))}
        </Box>
      </Box>

      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? 500 : 'auto' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>Product</TableCell>
              <TableCell align="right" sx={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>Sales</TableCell>
              <TableCell align="right" sx={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>Revenue</TableCell>
              <TableCell align="right" sx={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>Trend</TableCell>
              <TableCell align="right" sx={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>Views</TableCell>
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
                      sx={{ width: isMobile ? 30 : 40, height: isMobile ? 30 : 40, mr: isMobile ? 1 : 2 }}
                      variant="rounded"
                    />
                    <Typography variant="body2" sx={{ 
                      fontSize: isMobile ? '12px' : '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: isMobile ? 100 : 150
                    }}>
                      {product.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <ShoppingCart sx={{ fontSize: isMobile ? 14 : 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                      {product.sales}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    {formatCurrency(product.revenue)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {getTrendIcon(product.trend)}
                    <Typography variant="body2" sx={{ ml: 0.5, fontSize: isMobile ? '12px' : '14px' }}>
                      {product.trendValue}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Visibility sx={{ fontSize: isMobile ? 14 : 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                      {product.views.toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {products.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
            No products data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TopProducts;