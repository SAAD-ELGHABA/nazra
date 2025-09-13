import React, { useState, useEffect } from "react";
import { getProducts, getOrders, getProductsAsAdmin } from "../api/api";
import { TrendingUp, TrendingDown, Eye, ShoppingCart } from "lucide-react";

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'year'

  useEffect(() => {
    fetchTopProducts(); // fixed syntax: removed stray "fixe any error or error synthax" comment
  }, [timeRange]);

  const getProductImage = (product) => {
    if (product.colors?.[0]?.images?.[0]?.url)
      return product.colors[0].images[0].url;
    if (product.images?.[0]?.url) return product.images[0].url;
    if (product.images?.[0]) return product.images[0];
    return "/api/placeholder/40/40";
  };

  const estimateViews = (sales) => {
    const minViews = sales * 20;
    const maxViews = sales * 50;
    return Math.floor(Math.random() * (maxViews - minViews + 1)) + minViews;
  };

  const calculateTrend = () => (Math.random() > 0.5 ? "up" : "down");
  const calculateTrendValue = () => Math.floor(Math.random() * 20) + 1;

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      const productsResponse = await getProductsAsAdmin();
      const ordersResponse = await getOrders();

      const productsData = productsResponse?.data?.products || [];
      const ordersData = ordersResponse?.data?.orders || [];

      const productsWithSales = productsData.map((product) => {
        let sales = 0;
        let revenue = 0;

        ordersData.forEach((order) => {
          if (order.products && order.status !== "cancelled") {
            order.products.forEach((item) => {
              if (item.product?._id === product._id) {
                sales += item.quantity;
                const price =
                  item.product.sale_price || item.product.original_price;
                revenue += item.quantity * price;
              }
            });
          }
        });

        return {
          id: product._id,
          name: product.name,
          image: getProductImage(product),
          sales,
          revenue,
          trend: calculateTrend(),
          trendValue: calculateTrendValue(),
          stock: product.stock || 0,
          views: product?.views,
          isActive: product?.isActive,
        };
      });

      const topProducts = productsWithSales
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setProducts(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const TrendIcon = ({ trend }) =>
    trend === "up" ? (
      <TrendingUp className="text-green-500 w-4 h-4" />
    ) : (
      <TrendingDown className="text-red-500 w-4 h-4" />
    );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow w-full max-w-3xl mx-auto flex items-center justify-center h-64">
        <div className="w-full">
          <div className="h-1 bg-gray-200 rounded overflow-hidden mb-2">
            <div className="w-full h-1 bg-blue-500 animate-pulse"></div>
          </div>
          <p className="text-center text-sm text-gray-600">
            Loading top products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded p-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <div className="flex flex-wrap gap-2">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              className={`px-2 py-1 text-xs sm:text-sm rounded ${
                timeRange === range
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-black/30">
              <th className="px-2 py-1 font-semibold text-left">Product</th>
              <th className="px-2 py-1 font-semibold text-right">Sales</th>
              <th className="px-2 py-1 font-semibold text-right">Trend</th>
              <th className="px-2 py-1 font-semibold text-right">Views</th>
              <th className="px-2 py-1 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-2 py-2 flex items-center gap-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="truncate max-w-xs">{product.name}</span>
                </td>
                <td>
                  <h1 className="px-2 py-2 text-right flex items-center justify-end gap-1">
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                    {product.sales}
                  </h1>
                </td>
                <td>
                  <h1 className="px-2 py-2 text-right flex items-center justify-end gap-1">
                    <TrendIcon trend={product.trend} />
                    <span>{product.trendValue}%</span>
                  </h1>
                </td>
                <td>
                  <h1 className="px-2 py-2 text-right flex items-center justify-end gap-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                    {product.views.toLocaleString()}
                  </h1>
                </td>
                <td >
                  <h1
                    className={`px-2 py-2 text-right flex items-center justify-end gap-1 rounded ${
                      product.isActive
                        ? " text-green-800"
                        : " text-red-800"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </h1>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="py-4 text-center text-gray-500 text-sm">
          No products data available
        </div>
      )}
    </div>
  );
};

export default TopProducts;
