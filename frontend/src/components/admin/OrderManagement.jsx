import {
    Box,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    IconButton,
    Chip,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    LocalShipping,
    Visibility,
    Edit,
    Close,
    Search,
    FilterList,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import orderService from "../../services/orderService";

const API = "http://localhost:8080";

const STATUS_COLORS = {
    PENDING: "#f59e0b",
    PROCESSING: "#3b82f6",
    SHIPPED: "#8b5cf6",
    DELIVERED: "#22c55e",
    CANCELLED: "#ef4444",
};

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
    
    const [trackingData, setTrackingData] = useState({
        trackingNumber: "",
        carrier: "",
        estimatedDelivery: "",
        trackingUrl: "",
    });
    
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setSnackbar({ open: true, message: "Failed to fetch orders", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Filter by status
        if (statusFilter !== "ALL") {
            filtered = filtered.filter(order => order.orderStatus === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.orderId.toString().includes(searchTerm) ||
                order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    };

    const handleViewOrder = async (orderId) => {
        try {
            const orderDetails = await orderService.getOrderById(orderId);
            setSelectedOrder(orderDetails);
            setViewDialogOpen(true);
        } catch (error) {
            console.error("Error fetching order details:", error);
            setSnackbar({ open: true, message: "Failed to fetch order details", severity: "error" });
        }
    };

    const handleOpenTrackingDialog = (order) => {
        setSelectedOrder(order);
        setTrackingData({
            trackingNumber: order.trackingNumber || "",
            carrier: order.carrier || "",
            estimatedDelivery: order.estimatedDelivery || "",
            trackingUrl: order.trackingUrl || "",
        });
        setTrackingDialogOpen(true);
    };

    const handleSaveTracking = async () => {
        try {
            await orderService.addTrackingDetails(selectedOrder.orderId, trackingData);
            await fetchOrders();
            setTrackingDialogOpen(false);
            setSnackbar({ open: true, message: "Tracking details updated successfully", severity: "success" });
        } catch (error) {
            console.error("Error updating tracking:", error);
            setSnackbar({ open: true, message: "Failed to update tracking details", severity: "error" });
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            await fetchOrders();
            setSnackbar({ open: true, message: "Order status updated", severity: "success" });
        } catch (error) {
            console.error("Error updating status:", error);
            setSnackbar({ open: true, message: "Failed to update order status", severity: "error" });
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${API}${url.startsWith("/") ? url : `/${url}`}`;
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", color: "#888" }}>
                    Loading orders...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header with filters */}
            <Box sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
                p: 3,
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
            }}>
                <TextField
                    size="small"
                    placeholder="Search by order ID, customer, or tracking..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <Search sx={{ fontSize: 18, mr: 1, color: "#888" }} />,
                    }}
                    sx={{
                        flex: 1,
                        minWidth: 250,
                        "& .MuiOutlinedInput-root": {
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 12,
                        },
                    }}
                />
                
                <TextField
                    select
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    InputProps={{
                        startAdornment: <FilterList sx={{ fontSize: 18, mr: 1, color: "#888" }} />,
                    }}
                    sx={{
                        minWidth: 150,
                        "& .MuiOutlinedInput-root": {
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 12,
                        },
                    }}
                >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="PROCESSING">Processing</MenuItem>
                    <MenuItem value="SHIPPED">Shipped</MenuItem>
                    <MenuItem value="DELIVERED">Delivered</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>

                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    borderLeft: "1px solid #e0e0e0",
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        color: "#888",
                        letterSpacing: "0.08em",
                    }}>
                        TOTAL: {filteredOrders.length}
                    </Typography>
                </Box>
            </Box>

            {/* Orders Table */}
            <Box sx={{
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
            }}>
                {/* Table Header */}
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "100px 150px 1fr 120px 120px 140px 120px",
                    gap: 2,
                    p: 2,
                    borderBottom: "2px solid #000",
                    backgroundColor: "#f8f8f5",
                }}>
                    {["Order ID", "Date", "Customer", "Items", "Total", "Status", "Actions"].map((header) => (
                        <Typography key={header} sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#000",
                        }}>
                            {header}
                        </Typography>
                    ))}
                </Box>

                {/* Table Body */}
                {filteredOrders.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: "center" }}>
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 12,
                            color: "#888",
                        }}>
                            No orders found
                        </Typography>
                    </Box>
                ) : (
                    filteredOrders.map((order) => (
                        <Box
                            key={order.orderId}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "100px 150px 1fr 120px 120px 140px 120px",
                                gap: 2,
                                p: 2,
                                borderBottom: "1px solid #e0e0e0",
                                "&:hover": { backgroundColor: "#f8f8f5" },
                                transition: "background-color 0.15s",
                            }}
                        >
                            {/* Order ID */}
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#000",
                            }}>
                                #{order.orderId}
                            </Typography>

                            {/* Date */}
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11,
                                color: "#666",
                            }}>
                                {new Date(order.orderDate).toLocaleDateString()}
                            </Typography>

                            {/* Customer */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "#000",
                                }}>
                                    {order.customerName || order.firstName + " " + order.lastName}
                                </Typography>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 10,
                                    color: "#888",
                                }}>
                                    {order.email}
                                </Typography>
                            </Box>

                            {/* Items Count */}
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11,
                                color: "#666",
                            }}>
                                {order.orderItems?.length || 0} items
                            </Typography>

                            {/* Total */}
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#000",
                            }}>
                                Rs {order.totalAmount?.toFixed(2)}
                            </Typography>

                            {/* Status */}
                            <Box>
                                <Chip
                                    label={order.orderStatus}
                                    size="small"
                                    sx={{
                                        backgroundColor: STATUS_COLORS[order.orderStatus] || "#888",
                                        color: "#fff",
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 9,
                                        fontWeight: 600,
                                        height: 22,
                                        "& .MuiChip-label": { px: 1 },
                                    }}
                                />
                            </Box>

                            {/* Actions */}
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleViewOrder(order.orderId)}
                                    sx={{
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 0,
                                        "&:hover": { backgroundColor: "#000", color: "#fff" },
                                    }}
                                >
                                    <Visibility sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenTrackingDialog(order)}
                                    sx={{
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 0,
                                        "&:hover": { backgroundColor: "#000", color: "#fff" },
                                    }}
                                >
                                    <LocalShipping sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {/* View Order Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 0,
                        border: "2px solid #000",
                    },
                }}
            >
                <DialogTitle sx={{
                    borderBottom: "2px solid #000",
                    backgroundColor: "#000",
                    color: "#fff",
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span>Order #{selectedOrder?.orderId}</span>
                    <IconButton
                        onClick={() => setViewDialogOpen(false)}
                        sx={{ color: "#fff" }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedOrder && (
                        <Box>
                            {/* Customer Info */}
                            <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 10,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "#888",
                                    mb: 1.5,
                                }}>
                                    Customer Information
                                </Typography>
                                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, mb: 0.5 }}>
                                    <strong>Name:</strong> {selectedOrder.firstName} {selectedOrder.lastName}
                                </Typography>
                                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, mb: 0.5 }}>
                                    <strong>Email:</strong> {selectedOrder.email}
                                </Typography>
                                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, mb: 0.5 }}>
                                    <strong>Phone:</strong> {selectedOrder.phone}
                                </Typography>
                                {selectedOrder.deliveryAddress && (
                                    <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                                        <strong>Address:</strong> {selectedOrder.deliveryAddress}
                                    </Typography>
                                )}
                            </Box>

                            {/* Order Status */}
                            <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 10,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "#888",
                                    mb: 1.5,
                                }}>
                                    Order Status
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={selectedOrder.orderStatus}
                                    onChange={(e) => handleStatusChange(selectedOrder.orderId, e.target.value)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            fontFamily: "'IBM Plex Mono', monospace",
                                        },
                                    }}
                                >
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="PROCESSING">Processing</MenuItem>
                                    <MenuItem value="SHIPPED">Shipped</MenuItem>
                                    <MenuItem value="DELIVERED">Delivered</MenuItem>
                                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                </TextField>
                            </Box>

                            {/* Order Items */}
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 10,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "#888",
                                    mb: 1.5,
                                }}>
                                    Order Items
                                </Typography>
                                {selectedOrder.orderItems?.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            gap: 2,
                                            p: 2,
                                            border: "1px solid #e0e0e0",
                                            mb: 1,
                                        }}
                                    >
                                        {item.imageUrl && (
                                            <Box
                                                component="img"
                                                src={getImageUrl(item.imageUrl)}
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    objectFit: "cover",
                                                    backgroundColor: "#f0f0f0",
                                                }}
                                            />
                                        )}
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                mb: 0.5,
                                            }}>
                                                {item.productName}
                                            </Typography>
                                            <Typography sx={{
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: 11,
                                                color: "#666",
                                            }}>
                                                {item.color && `Color: ${item.color} `}
                                                {item.size && `| Size: ${item.size}`}
                                            </Typography>
                                            <Typography sx={{
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: 11,
                                                color: "#666",
                                            }}>
                                                Qty: {item.quantity} × Rs {item.price?.toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontSize: 14,
                                            fontWeight: 700,
                                        }}>
                                            Rs {(item.quantity * item.price)?.toFixed(2)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Tracking Info */}
                            {selectedOrder.trackingNumber && (
                                <Box sx={{ p: 2, backgroundColor: "#f8f8f5", border: "1px solid #e0e0e0" }}>
                                    <Typography sx={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 10,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: "#888",
                                        mb: 1,
                                    }}>
                                        Tracking Information
                                    </Typography>
                                    <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, mb: 0.5 }}>
                                        <strong>Tracking #:</strong> {selectedOrder.trackingNumber}
                                    </Typography>
                                    <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, mb: 0.5 }}>
                                        <strong>Carrier:</strong> {selectedOrder.carrier}
                                    </Typography>
                                    {selectedOrder.trackingUrl && (
                                        <Button
                                            size="small"
                                            href={selectedOrder.trackingUrl}
                                            target="_blank"
                                            sx={{
                                                mt: 1,
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: 10,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Track Package
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Tracking Dialog */}
            <Dialog
                open={trackingDialogOpen}
                onClose={() => setTrackingDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 0,
                        border: "2px solid #000",
                    },
                }}
            >
                <DialogTitle sx={{
                    borderBottom: "2px solid #000",
                    backgroundColor: "#000",
                    color: "#fff",
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span>Add Tracking Details</span>
                    <IconButton
                        onClick={() => setTrackingDialogOpen(false)}
                        sx={{ color: "#fff" }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField
                            label="Tracking Number"
                            fullWidth
                            value={trackingData.trackingNumber}
                            onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontFamily: "'IBM Plex Mono', monospace",
                                },
                            }}
                        />
                        <TextField
                            label="Carrier"
                            fullWidth
                            value={trackingData.carrier}
                            onChange={(e) => setTrackingData({ ...trackingData, carrier: e.target.value })}
                            placeholder="e.g., DHL, FedEx, USPS"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontFamily: "'IBM Plex Mono', monospace",
                                },
                            }}
                        />
                        <TextField
                            label="Estimated Delivery"
                            type="date"
                            fullWidth
                            value={trackingData.estimatedDelivery}
                            onChange={(e) => setTrackingData({ ...trackingData, estimatedDelivery: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontFamily: "'IBM Plex Mono', monospace",
                                },
                            }}
                        />
                        <TextField
                            label="Tracking URL"
                            fullWidth
                            value={trackingData.trackingUrl}
                            onChange={(e) => setTrackingData({ ...trackingData, trackingUrl: e.target.value })}
                            placeholder="https://..."
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontFamily: "'IBM Plex Mono', monospace",
                                },
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
                    <Button
                        onClick={() => setTrackingDialogOpen(false)}
                        sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            color: "#666",
                            textTransform: "uppercase",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveTracking}
                        variant="contained"
                        sx={{
                            backgroundColor: "#000",
                            color: "#fff",
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            textTransform: "uppercase",
                            borderRadius: 0,
                            "&:hover": { backgroundColor: "#333" },
                        }}
                    >
                        Save Tracking
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{
                        borderRadius: 0,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        border: "1px solid #000",
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrderManagement;