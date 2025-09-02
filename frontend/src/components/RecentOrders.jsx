import React, { useEffect, useState } from 'react';
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
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import { getOrders } from '../api/api';

const RecentOrders = () => {
    const auth = window.localStorage.getItem('User_Data_token')


    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await getOrders();
                if (response.status === 200) {
                    setOrders(response?.data?.orders);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch orders');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'pending': return 'primary';
            case 'Processing': return 'warning';
            case 'Shipped': return 'info';
            case 'Cancelled': return 'error';
            default: return 'default';
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

            <Box sx={{ maxHeight: 340, overflow: 'auto', width:1 }}>
                <Typography variant="h6" gutterBottom>
                    Recent Orders
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <TableRow key={order._id || order.id} hover>
                                            <TableCell>#{order._id ? order._id.slice(-6).toUpperCase() : order.id}</TableCell>
                                            <TableCell>
                                                {order.fullName.toUpperCase()}
                                            </TableCell>
                                            <TableCell>${
                                                order.products?.reduce((sum, pro) =>
                                                    sum + (pro.quantity * pro.product?.sale_price)
                                                    , 0).toFixed(2)
                                            }
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status.charAt(0).toUpperCase()+order.status.slice(1)}
                                                    color={getStatusColor(order.status)}
                                                    size="small"
                                                    
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.createdAt || order.date)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No orders found
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