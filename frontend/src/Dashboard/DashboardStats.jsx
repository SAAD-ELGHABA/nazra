import React, { useState, useEffect } from "react";
import { ShoppingCart, Package, Eye } from "lucide-react";

const DashboardStats = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, []);

  const stats = {
    products: 120,
    orders: 45,
    visitors: 1023,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 gap-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-75"></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-150"></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-300"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <div className="bg-white shadow rounded-lg p-5 flex items-center gap-4">
        <ShoppingCart className="w-6 h-6 text-blue-600" />
        <div>
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-xl font-semibold text-gray-900">{stats.products}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-5 flex items-center gap-4">
        <Package className="w-6 h-6 text-green-600" />
        <div>
          <p className="text-sm text-gray-500">Orders</p>
          <p className="text-xl font-semibold text-gray-900">{stats.orders}</p>
        </div>
      </div>


      <div className="bg-white shadow rounded-lg p-5 flex items-center gap-4">
        <Eye className="w-6 h-6 text-red-600" />
        <div>
          <p className="text-sm text-gray-500">Visitors</p>
          <p className="text-xl font-semibold text-gray-900">{stats.visitors}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
