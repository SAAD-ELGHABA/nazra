import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getProducts } from '../api/api';

const ProductStats = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    try {
      setLoading(true);
      const response = await getProducts();

      if (response.status === 200) {
        const products = response.data.products || response.data;
        const activeCount = products.filter((p) => p.isActive === true).length;
        const inactiveCount = products.length - activeCount;
        const totalCount = products.length;

        const activePercentage = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
        const inactivePercentage = totalCount > 0 ? (inactiveCount / totalCount) * 100 : 0;

        setProductData([
          {
            name: 'Active Products',
            value: activeCount,
            percentage: activePercentage,
            color: '#00C49F',
          },
          {
            name: 'Inactive Products',
            value: inactiveCount,
            percentage: inactivePercentage,
            color: '#FF8042',
          },
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product statistics');
      console.error('Error fetching product stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-300 rounded text-sm">
          <p>{`${data.name}: ${data.value}`}</p>
          <p>{`${data.percentage.toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = ({ payload }) => (
    <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-2 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm font-medium">
            {entry.value}: {productData[index]?.value || 0}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white  p-4 w-full max-w-lg mx-auto">
      

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : productData.length > 0 ? (
        <div className="w-full h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage.toFixed(1)}%`}
                outerRadius={80}
                innerRadius={50}
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
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-sm text-center">No product data available</p>
        </div>
      )}
    </div>
  );
};

export default ProductStats;
