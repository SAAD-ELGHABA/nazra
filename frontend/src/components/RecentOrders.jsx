import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { getOrders } from "../api/api";

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        if (response.status === 200) {
          setOrders(response?.data?.orders);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "success";
      case "pending":
        return "primary";
      case "processing":
        return "warning";
      case "shipped":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };
  // Format date if needed
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ maxHeight: 340, overflow: "auto", width: 1 }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
          >
            <CircularProgress size={isMobile ? 24 : 32} />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: "100%",
              overflowX: "auto",
            }}
          >
            <Table size="small" sx={{ minWidth: isMobile ? 500 : "auto" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: isMobile ? "12px" : "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Order ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: isMobile ? "12px" : "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: isMobile ? "12px" : "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: isMobile ? "12px" : "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: isMobile ? "12px" : "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length > 0 ? (
                  orders
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt || b.date) -
                        new Date(a.createdAt || a.date)
                    )
                    .slice(0, isMobile ? 5 : 10)
                    .map((order) => (
                      <TableRow key={order._id || order.id} hover>
                        <TableCell
                          sx={{
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        >
                          #
                          {order._id
                            ? order._id.slice(-6).toUpperCase()
                            : order.id}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        >
                          {order.fullName?.toUpperCase() || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        >
                          $
                          {order.products
                            ?.reduce(
                              (sum, pro) =>
                                sum +
                                pro.quantity *
                                  (pro.product?.sale_price ||
                                    pro.product?.original_price ||
                                    0),
                              0
                            )
                            .toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              order.status
                                ? order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)
                                : "Unknown"
                            }
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{
                              fontSize: isMobile ? "10px" : "10px",
                              height: isMobile ? 24 : 32,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        >
                          {formatDate(
                            order.createdAt || order.date || new Date()
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
};

export default RecentOrders;
