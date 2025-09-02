import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VisitorStats = () => {
  const visitorData = [
    { day: 'Mon', visitors: 150, pageViews: 450 },
    { day: 'Tue', visitors: 180, pageViews: 520 },
    { day: 'Wed', visitors: 220, pageViews: 680 },
    { day: 'Thu', visitors: 190, pageViews: 570 },
    { day: 'Fri', visitors: 250, pageViews: 750 },
    { day: 'Sat', visitors: 300, pageViews: 900 },
    { day: 'Sun', visitors: 280, pageViews: 840 }
  ];

  return (
    <Box width={500}>
      <Typography variant="h6" gutterBottom>
        Visitor Analytics (Last 7 Days)
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={visitorData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="visitors" fill="#8884d8" />
          <Bar dataKey="pageViews" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default VisitorStats;