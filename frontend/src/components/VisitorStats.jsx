import React from 'react';
import { 
  Typography, 
  Box, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const VisitorStats = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const visitorData = [
    { day: 'Mon', visitors: 150, pageViews: 450 },
    { day: 'Tue', visitors: 180, pageViews: 520 },
    { day: 'Wed', visitors: 220, pageViews: 680 },
    { day: 'Thu', visitors: 190, pageViews: 570 },
    { day: 'Fri', visitors: 250, pageViews: 750 },
    { day: 'Sat', visitors: 300, pageViews: 900 },
    { day: 'Sun', visitors: 280, pageViews: 840 }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 1,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#8884d8' }}>
            Visitors: {payload[0]?.value}
          </Typography>
          <Typography variant="body2" sx={{ color: '#82ca9d' }}>
            Page Views: {payload[1]?.value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', p: isMobile ? 0 : 1 }}>
      <Typography 
        variant={isMobile ? "h6" : "h6"} 
        component="h2" 
        gutterBottom 
        sx={{ textAlign: isMobile ? 'center' : 'left' }}
      >
        Visitor Analytics (Last 7 Days)
      </Typography>
      
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <BarChart 
          data={visitorData}
          margin={isMobile ? { top: 10, right: 5, left: 0, bottom: 5 } : { top: 10, right: 20, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis 
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {!isMobile && <Legend />}
          <Bar 
            dataKey="visitors" 
            fill="#8884d8" 
            name="Visitors"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="pageViews" 
            fill="#82ca9d" 
            name="Page Views"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Mobile legend */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#8884d8', mr: 1 }} />
            <Typography variant="caption">Visitors</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#82ca9d', mr: 1 }} />
            <Typography variant="caption">Page Views</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VisitorStats;