import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ProductDetailsModal from "../components/ProductDetailsModal";
import { getOrders } from "../api/api";

function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStatus, setEditingStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); // start loading
      try {
        const response = await getOrders();
        setOrders(response?.data?.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // stop loading
      }
    };
    fetchOrders();
  }, []);

  const showProductDetails = (products) => {
    setSelectedProducts(products);
    setModalOpen(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startEditing = (orderId, currentStatus) => {
    setEditingStatus({ orderId, status: currentStatus });
  };

  const updateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );

      const response = await updateOrderStatusInDatabase(orderId, newStatus);

      if (!response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: editingStatus.status } : o
          )
        );
      }
    } catch (err) {
      console.error(err);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: editingStatus.status } : o
        )
      );
      alert("Error updating status");
    } finally {
      setIsUpdating(false);
      setEditingStatus(null);
    }
  };

  const updateOrderStatusInDatabase = async (orderId, newStatus) => {
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true }; // Replace with real API call
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "All" || order.status === filterStatus;

    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products.some((p) =>
        p.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  const exportToExcel = () => {
    const dataForExport = filteredOrders.map((order) => ({
      "Order ID": order._id,
      Customer: order.fullName,
      Email: order.email,
      Phone: order.phone,
      Adresse: order.adresse,
      Date: new Date(order.createdAt).toLocaleDateString(),
      Products: order.products
        .map((p) => `${p.product?.name} (x${p.quantity}, ${p.color || "N/A"})`)
        .join(", "),
      Amount: order.products
        ?.reduce(
          (total, p) =>
            total + (p.product?.sale_price || 0) * (p.quantity || 1),
          0
        )
        .toFixed(2),
      Status: order.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl sm:truncate">
              Order Management
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage all customer orders and update their statuses.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="w-full md:w-1/3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, customer, or product"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="w-full md:w-1/4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="All">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-10 gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-150"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-300"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order?.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div
                          className="line-clamp-2 cursor-pointer text-blue-600 hover:underline"
                          onClick={() => showProductDetails(order?.products)}
                        >
                          {order.products.map((p, idx) => (
                            <span key={idx}>
                              {p.product?.name} (x{p.quantity},{" "}
                              {p.color || "N/A"})
                              {idx < order.products.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        MAD{" "}
                        {order.products
                          ?.reduce(
                            (total, p) =>
                              total +
                              (p.product?.sale_price || 0) * (p.quantity || 1),
                            0
                          )
                          .toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStatus?.orderId === order._id ? (
                          <div className="flex items-center">
                            <select
                              value={editingStatus.status}
                              onChange={(e) =>
                                setEditingStatus({
                                  ...editingStatus,
                                  status: e.target.value,
                                })
                              }
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              disabled={isUpdating}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                            <button
                              onClick={() =>
                                updateStatus(order._id, editingStatus.status)
                              }
                              disabled={isUpdating}
                              className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingStatus(null)}
                              disabled={isUpdating}
                              className="ml-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <button
                              onClick={() =>
                                startEditing(order._id, order.status)
                              }
                              className="ml-2 text-gray-500 hover:text-gray-700"
                              title="Edit status"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={selectedProducts}
      />
    </div>
  );
}

export default OrderManagementPage;
