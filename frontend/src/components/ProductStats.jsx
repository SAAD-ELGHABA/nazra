import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getProducts, getProductsAsAdmin } from '../api/api'; 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Package, PackageCheck, PackageX, TrendingUp } from 'lucide-react';

const ProductStats = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chart');
  const [rawProducts, setRawProducts] = useState([]);

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    try {
      setLoading(true);
      const response = await getProductsAsAdmin();
      
      if (response.status === 200) {
        const products = response.data.products || response.data;
        setRawProducts(products);
        
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
            color: '#10b981', // Emerald-500
            icon: PackageCheck,
          },
          {
            name: 'Inactive Products',
            value: inactiveCount,
            percentage: inactivePercentage,
            color: '#ef4444', // Red-500
            icon: PackageX,
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
      const IconComponent = data.icon;
      
      return (
        <Card className="p-3 shadow-lg border">
          <div className="flex items-center gap-2 mb-2">
            {IconComponent && <IconComponent className="h-4 w-4" style={{ color: data.color }} />}
            <p className="font-semibold text-sm">{data.name}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Count:</span>
              <span className="font-medium">{data.value}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </p>
          </div>
        </Card>
      );
    }
    return null;
  };

  const renderLegend = ({ payload }) => (
    <div className="flex flex-col items-center gap-3 mt-6">
      {payload.map((entry, index) => {
        const data = productData[index];
        const IconComponent = data?.icon;
        
        return (
          <div 
            key={`legend-${index}`} 
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 w-full max-w-xs"
          >
            <div
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            ></div>
            {IconComponent && (
              <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm font-medium flex-1">{entry.value}</span>
            <Badge variant="secondary" className="ml-auto">
              {data?.value || 0}
            </Badge>
          </div>
        );
      })}
    </div>
  );

  const getTotalProducts = () => {
    return productData.reduce((sum, item) => sum + item.value, 0);
  };

  const getActiveProductPercentage = () => {
    const activeProduct = productData.find(item => item.name === 'Active Products');
    return activeProduct ? activeProduct.percentage : 0;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-center items-center h-64">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="space-y-2 mt-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Product Status
            </CardTitle>
            <CardDescription>
              Overview of active and inactive products
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            Total: {getTotalProducts()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Summary */}
        {productData.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <PackageCheck className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-700">
                {productData[0]?.value || 0}
              </p>
              <p className="text-xs text-emerald-600 font-medium">Active</p>
            </div>
            <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <PackageX className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-700">
                {productData[1]?.value || 0}
              </p>
              <p className="text-xs text-red-600 font-medium">Inactive</p>
            </div>
          </div>
        )}

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 ">
            <TabsTrigger value="chart" className="text-xs">
              Chart View
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs">
              Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-2">
            {productData.length > 0 ? (
              <div className="space-y-4">
                <div className="w-full h-64 ">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage, name }) => 
                          `${percentage.toFixed(1)}%`
                        }
                        outerRadius={80}
                        innerRadius={50}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--background))"
                      >
                        {productData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            className="transition-opacity hover:opacity-80 cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={renderLegend} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm text-center">No product data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Product Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Products:</span>
                    <span className="font-medium">{getTotalProducts()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Rate:</span>
                    <span className="font-medium text-emerald-600">
                      {getActiveProductPercentage().toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inactive Rate:</span>
                    <span className="font-medium text-red-600">
                      {(100 - getActiveProductPercentage()).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {rawProducts.length > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProductStats;