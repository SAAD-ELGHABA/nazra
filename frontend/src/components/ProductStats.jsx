import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getProducts, getProductsAsAdmin } from '../api/api'; 

const ProductStats = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    try {
      setLoading(true);
      const response = await getProductsAsAdmin();
      
      if (response.status === 200) {
        const products = response.data.products || response.data;
        
        const activeCount = products.filter(product => product.isActive === true).length;
        const inactiveCount = products.filter(product => product.isActive === false).length;
        const totalCount = products.length;
        
        const activePercentage = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
        const inactivePercentage = totalCount > 0 ? (inactiveCount / totalCount) * 100 : 0;
        
        setProductData([
          { 
            name: 'Active Products', 
            value: activeCount, 
            percentage: activePercentage,
            color: '#00C49F' 
          },
          { 
            name: 'Inactive Products', 
            value: inactiveCount, 
            percentage: inactivePercentage,
            color: '#FF8042' 
          }
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product statistics');
      console.error('Error fetching product stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#00C49F', '#FF8042'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          padding: '8px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: isMobile ? '12px' : '14px'
        }}>
          <Typography variant="body2" sx={{ fontSize: 'inherit' }}>{`${data.name}: ${data.value}`}</Typography>
          <Typography variant="body2" sx={{ fontSize: 'inherit' }}>{`${data.percentage.toFixed(1)}% of total`}</Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: isMobile ? 1 : 2, 
        mt: 2,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center'
      }}>
        {payload.map((entry, index) => (
          <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                backgroundColor: entry.color, 
                mr: 1,
                borderRadius: '2px'
              }} 
            />
            <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
              {entry.value}: {productData[index]?.value || 0}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', maxHeight: 500, p: isMobile ? 0 : 1 }}>
      <Typography variant={isMobile ? "h6" : "h6"} component="h2" gutterBottom sx={{ textAlign: isMobile ? 'center' : 'left' }}>
        Product Status
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: isMobile ? '12px' : '14px' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={isMobile ? 250 : 300}>
          <CircularProgress size={isMobile ? 24 : 32} />
        </Box>
      ) : productData.length > 0 ? (
        <Box sx={{ width: '100%', height: isMobile ? 280 : 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${percentage.toFixed(1)}%`}
                outerRadius={isMobile ? 70 : 80}
                innerRadius={isMobile ? 50 : 60}
                dataKey="value"
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height={isMobile ? 250 : 300}>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
            No product data available
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductStats;