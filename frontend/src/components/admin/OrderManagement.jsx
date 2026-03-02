import {
    Box, Typography, TextField, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, MenuItem, IconButton, Chip,
    Snackbar, Alert, useMediaQuery, useTheme, Drawer,
} from "@mui/material";
import {
    LocalShipping, Visibility, Edit, Close, Search, FilterList, ExpandMore,
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

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'Playfair Display', serif";

const OrderManagement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [trackingData, setTrackingData] = useState({
        trackingNumber: "", carrier: "", estimatedDelivery: "", trackingUrl: "",
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => { fetchOrders(); }, []);
    useEffect(() => { filterOrders(); }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch {
            setSnackbar({ open: true, message: "Failed to fetch orders", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];
        if (statusFilter !== "ALL") filtered = filtered.filter(o => o.orderStatus === statusFilter);
        if (searchTerm) {
            filtered = filtered.filter(o =>
                o.orderId.toString().includes(searchTerm) ||
                o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredOrders(filtered);
    };

    const handleViewOrder = async (orderId) => {
        try {
            const orderDetails = await orderService.getOrderById(orderId);
            setSelectedOrder(orderDetails);
            setViewDialogOpen(true);
        } catch {
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
            const updated = await orderService.addTrackingDetails(selectedOrder.orderId, trackingData);
            // FIX: refresh selectedOrder so dialog shows new tracking immediately
            setSelectedOrder(updated);
            await fetchOrders();
            setTrackingDialogOpen(false);
            setSnackbar({ open: true, message: "Tracking details updated", severity: "success" });
        } catch {
            setSnackbar({ open: true, message: "Failed to update tracking", severity: "error" });
        }
    };

    // FIX: update selectedOrder state after status change so dialog refreshes
    const handleStatusChange = async (orderId, newStatus) => {
        setStatusUpdating(true);
        try {
            const updated = await orderService.updateOrderStatus(orderId, newStatus);
            // Update selectedOrder if dialog is open
            if (selectedOrder?.orderId === orderId) {
                setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
            }
            await fetchOrders();
            setSnackbar({ open: true, message: `Status updated to ${newStatus}`, severity: "success" });
        } catch {
            setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
        } finally {
            setStatusUpdating(false);
        }
    };

    const imgUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${API}${url.startsWith("/") ? url : `/${url}`}`;
    };

    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <Typography sx={{ fontFamily: MONO, color: "#888", fontSize: 12 }}>Loading orders...</Typography>
        </Box>
    );

    // ── Mobile Order Card ──
    const MobileOrderCard = ({ order }) => (
        <Box sx={{ border: "1px solid #e0e0e0", mb: 1.5, backgroundColor: "#fff" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box>
                        <Typography sx={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "#000" }}>
                            #{order.orderId}
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#888", mt: 0.25 }}>
                            {new Date(order.orderDate).toLocaleDateString()}
                        </Typography>
                    </Box>
                    <Chip label={order.orderStatus} size="small" sx={{ backgroundColor: STATUS_COLORS[order.orderStatus] || "#888", color: "#fff", fontFamily: MONO, fontSize: 9, fontWeight: 700, height: 20, "& .MuiChip-label": { px: 1 } }} />
                </Box>
                <Typography sx={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: "#000" }}>
                    {order.customerName}
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#888" }}>{order.email}</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#666" }}>
                        {order.items?.length || 0} items
                    </Typography>
                    <Typography sx={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: "#000" }}>
                        Rs {order.totalAmount?.toFixed(2)}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: "flex", borderTop: "1px solid #f0f0f0" }}>
                <Box
                    onClick={() => handleViewOrder(order.orderId)}
                    sx={{ flex: 1, p: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer", borderRight: "1px solid #f0f0f0", "&:hover": { backgroundColor: "#f8f8f5" } }}
                >
                    <Visibility sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>View</Typography>
                </Box>
                <Box
                    onClick={() => handleOpenTrackingDialog(order)}
                    sx={{ flex: 1, p: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f8f8f5" } }}
                >
                    <LocalShipping sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>Tracking</Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box>
            {/* ── Filters ── */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", p: { xs: 2, md: 3 }, backgroundColor: "#fff", border: "1px solid #e0e0e0" }}>
                <TextField
                    size="small"
                    placeholder={isMobile ? "Search orders..." : "Search by order ID, customer, or tracking..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <Search sx={{ fontSize: 16, mr: 1, color: "#888" }} /> }}
                    sx={{ flex: 1, minWidth: isMobile ? 140 : 250, "& .MuiOutlinedInput-root": { fontFamily: MONO, fontSize: 11 } }}
                />
                <TextField
                    select size="small" value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { fontFamily: MONO, fontSize: 11 } }}
                >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="PROCESSING">Processing</MenuItem>
                    <MenuItem value="SHIPPED">Shipped</MenuItem>
                    <MenuItem value="DELIVERED">Delivered</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>
                <Box sx={{ display: "flex", alignItems: "center", px: 1.5, borderLeft: "1px solid #e0e0e0" }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#888", letterSpacing: "0.08em" }}>
                        {filteredOrders.length} orders
                    </Typography>
                </Box>
            </Box>

            {/* ── Table (desktop) / Cards (mobile) ── */}
            {isMobile ? (
                <Box sx={{ px: 0 }}>
                    {filteredOrders.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: "center", backgroundColor: "#fff", border: "1px solid #e0e0e0" }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: 12, color: "#888" }}>No orders found</Typography>
                        </Box>
                    ) : (
                        filteredOrders.map(order => <MobileOrderCard key={order.orderId} order={order} />)
                    )}
                </Box>
            ) : (
                <Box sx={{ backgroundColor: "#fff", border: "1px solid #e0e0e0" }}>
                    {/* Header */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "90px 130px 1fr 100px 120px 140px 110px", gap: 2, p: 2, borderBottom: "2px solid #000", backgroundColor: "#f8f8f5" }}>
                        {["Order ID", "Date", "Customer", "Items", "Total", "Status", "Actions"].map(h => (
                            <Typography key={h} sx={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000" }}>{h}</Typography>
                        ))}
                    </Box>
                    {filteredOrders.length === 0 ? (
                        <Box sx={{ p: 8, textAlign: "center" }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: 12, color: "#888" }}>No orders found</Typography>
                        </Box>
                    ) : (
                        filteredOrders.map(order => (
                            <Box key={order.orderId} sx={{ display: "grid", gridTemplateColumns: "90px 130px 1fr 100px 120px 140px 110px", gap: 2, p: 2, borderBottom: "1px solid #e0e0e0", "&:hover": { backgroundColor: "#f8f8f5" }, transition: "background-color 0.15s", alignItems: "center" }}>
                                <Typography sx={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "#000" }}>#{order.orderId}</Typography>
                                <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "#666" }}>{new Date(order.orderDate).toLocaleDateString()}</Typography>
                                <Box>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "#000" }}>{order.customerName}</Typography>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#888" }}>{order.email}</Typography>
                                </Box>
                                <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "#666" }}>{order.items?.length || 0} items</Typography>
                                <Typography sx={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: "#000" }}>Rs {order.totalAmount?.toFixed(2)}</Typography>
                                <Chip label={order.orderStatus} size="small" sx={{ backgroundColor: STATUS_COLORS[order.orderStatus] || "#888", color: "#fff", fontFamily: MONO, fontSize: 9, fontWeight: 700, height: 22, "& .MuiChip-label": { px: 1 } }} />
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <IconButton size="small" onClick={() => handleViewOrder(order.orderId)} sx={{ border: "1px solid #e0e0e0", borderRadius: 0, "&:hover": { backgroundColor: "#000", color: "#fff" } }}>
                                        <Visibility sx={{ fontSize: 15 }} />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleOpenTrackingDialog(order)} sx={{ border: "1px solid #e0e0e0", borderRadius: 0, "&:hover": { backgroundColor: "#000", color: "#fff" } }}>
                                        <LocalShipping sx={{ fontSize: 15 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>
            )}

            {/* ── View Order Dialog ── */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md" fullWidth
                fullScreen={isMobile}
                PaperProps={{ sx: { borderRadius: 0, border: isMobile ? "none" : "2px solid #000" } }}
            >
                <DialogTitle sx={{ borderBottom: "2px solid #000", backgroundColor: "#000", color: "#fff", fontFamily: SERIF, fontWeight: 900, display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, px: 2.5 }}>
                    <span>Order #{selectedOrder?.orderId}</span>
                    <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: "#fff" }}><Close /></IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 2, md: 3 }, overflowX: "hidden" }}>
                    {selectedOrder && (
                        <Box>
                            {/* Customer Info */}
                            <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                                <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", mb: 1.5 }}>Customer Information</Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>Name:</strong> {selectedOrder.customerName}</Typography>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>Email:</strong> {selectedOrder.email || "—"}</Typography>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>Phone:</strong> {selectedOrder.phone || "—"}</Typography>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>City:</strong> {selectedOrder.cityName || "—"}</Typography>
                                    {selectedOrder.deliveryAddress && (
                                        <Typography sx={{ fontFamily: MONO, fontSize: 12, gridColumn: { sm: "span 2" } }}>
                                            <strong>Address:</strong> {selectedOrder.deliveryAddress}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Order Info */}
                            <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                                <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", mb: 1.5 }}>Order Information</Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, mb: 2 }}>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</Typography>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>Delivery:</strong> {selectedOrder.deliveryMethod || "—"}</Typography>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>Total:</strong> Rs {selectedOrder.totalAmount?.toFixed(2)}</Typography>
<Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
    <Box sx={{ fontFamily: MONO, fontSize: 12 }}>
        <strong>Payment:</strong> {selectedOrder.payment?.paymentMethod || "—"}
    </Box>
    <Chip
        label={selectedOrder.payment?.paymentStatus || "N/A"} size="small"
        sx={{
            height: 18, fontSize: 9, fontFamily: MONO, color: "#fff",
            "& .MuiChip-label": { px: 1 },
            backgroundColor:
                selectedOrder.payment?.paymentStatus === "COMPLETED" ? "#22c55e" :
                selectedOrder.payment?.paymentStatus === "REFUNDED" ? "#ef4444" : "#f59e0b"
        }}
    />
</Box>
                                </Box>

                                {/* FIX: status dropdown with loading state + immediate UI update */}
                                <Box>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", mb: 1 }}>Update Order Status</Typography>
                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                        {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
                                            <Box
                                                key={s}
                                                onClick={() => !statusUpdating && handleStatusChange(selectedOrder.orderId, s)}
                                                sx={{
                                                    px: 1.5, py: 0.75, cursor: statusUpdating ? "not-allowed" : "pointer",
                                                    border: selectedOrder.orderStatus === s ? "2px solid #000" : "1px solid #e0e0e0",
                                                    backgroundColor: selectedOrder.orderStatus === s ? "#000" : "#fff",
                                                    opacity: statusUpdating ? 0.6 : 1,
                                                    transition: "all 0.15s",
                                                    "&:hover": { borderColor: "#000", backgroundColor: selectedOrder.orderStatus === s ? "#000" : "#f8f8f5" },
                                                }}
                                            >
                                                <Typography sx={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: selectedOrder.orderStatus === s ? "#fff" : "#000" }}>
                                                    {s}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Tracking Info */}
                            <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>Tracking</Typography>
                                    <Button size="small" startIcon={<Edit sx={{ fontSize: 11 }} />}
                                        onClick={() => { setViewDialogOpen(false); handleOpenTrackingDialog(selectedOrder); }}
                                        sx={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", border: "1px solid #000", borderRadius: 0, px: 1.5, "&:hover": { backgroundColor: "#000", color: "#fff" } }}>
                                        {selectedOrder.trackingNumber ? "Edit" : "Add"} Tracking
                                    </Button>
                                </Box>
                                {selectedOrder.trackingNumber ? (
                                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, p: 2, backgroundColor: "#f8f8f5", border: "1px solid #e0e0e0" }}>
                                        <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>Tracking #:</strong> {selectedOrder.trackingNumber}</Typography>
                                        <Typography sx={{ fontFamily: MONO, fontSize: 12 }}><strong>Carrier:</strong> {selectedOrder.carrier || "—"}</Typography>
                                        <Typography sx={{ fontFamily: MONO, fontSize: 12 }}>
                                            <strong>Est. Delivery:</strong> {selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toLocaleDateString() : "—"}
                                        </Typography>
                                        {selectedOrder.trackingUrl && (
                                            <Button size="small" href={selectedOrder.trackingUrl} target="_blank"
                                                sx={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", border: "1px solid #000", borderRadius: 0 }}>
                                                Track Package →
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "#aaa" }}>No tracking details added yet.</Typography>
                                )}
                            </Box>

                            {/* Order Items */}
                            <Box>
                                <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", mb: 1.5 }}>
                                    Order Items ({selectedOrder.items?.length || 0})
                                </Typography>
                                {selectedOrder.items?.map((item, index) => (
                                    <Box key={index} sx={{ display: "flex", gap: 2, p: { xs: 1.5, md: 2 }, border: "1px solid #e0e0e0", mb: 1, "&:hover": { backgroundColor: "#f8f8f5" } }}>
                                        {item.imageUrl && (
                                            <Box component="img" src={imgUrl(item.imageUrl)}
                                                sx={{ width: { xs: 52, md: 64 }, height: { xs: 52, md: 64 }, objectFit: "cover", backgroundColor: "#f0f0f0", flexShrink: 0 }}
                                            />
                                        )}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontFamily: MONO, fontSize: { xs: 11, md: 12 }, fontWeight: 700, mb: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {item.productName}
                                            </Typography>
                                            {item.sku && (
                                                <Typography sx={{ fontFamily: MONO, fontSize: 9, color: "#aaa", mb: 0.5, letterSpacing: "0.05em" }}>SKU: {item.sku}</Typography>
                                            )}
                                            <Box sx={{ display: "flex", gap: 0.75, mb: 0.75, flexWrap: "wrap" }}>
                                                {item.color && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, border: "1px solid #e0e0e0", px: 1, py: 0.25, backgroundColor: "#fafafa" }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color.toLowerCase(), border: "1px solid rgba(0,0,0,.15)", flexShrink: 0 }} />
                                                        <Typography sx={{ fontFamily: MONO, fontSize: 8, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.color}</Typography>
                                                    </Box>
                                                )}
                                                {item.size && (
                                                    <Box sx={{ backgroundColor: "#000", px: 1, py: 0.25 }}>
                                                        <Typography sx={{ fontFamily: MONO, fontSize: 8, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.size}</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                            <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#666" }}>
                                                Qty: {item.quantity} × Rs {item.unitPrice?.toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontFamily: SERIF, fontSize: { xs: 13, md: 14 }, fontWeight: 700, alignSelf: "center", whiteSpace: "nowrap" }}>
                                            Rs {item.lineTotal?.toFixed(2)}
                                        </Typography>
                                    </Box>
                                ))}
                                <Box sx={{ mt: 2, p: 2, backgroundColor: "#000", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</Typography>
                                    <Typography sx={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700 }}>Rs {selectedOrder.totalAmount?.toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Tracking Dialog ── */}
            <Dialog open={trackingDialogOpen} onClose={() => setTrackingDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}
                PaperProps={{ sx: { borderRadius: 0, border: isMobile ? "none" : "2px solid #000" } }}>
                <DialogTitle sx={{ borderBottom: "2px solid #000", backgroundColor: "#000", color: "#fff", fontFamily: SERIF, fontWeight: 900, display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, px: 2.5 }}>
                    <span>Add Tracking Details</span>
                    <IconButton onClick={() => setTrackingDialogOpen(false)} sx={{ color: "#fff" }}><Close /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField label="Tracking Number" fullWidth value={trackingData.trackingNumber}
                            onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                            sx={{ "& .MuiOutlinedInput-root": { fontFamily: MONO } }} />
                        <TextField label="Carrier" fullWidth value={trackingData.carrier}
                            onChange={(e) => setTrackingData({ ...trackingData, carrier: e.target.value })}
                            placeholder="e.g., DHL, FedEx, Sri Lanka Post"
                            sx={{ "& .MuiOutlinedInput-root": { fontFamily: MONO } }} />
                        <TextField label="Estimated Delivery" type="date" fullWidth value={trackingData.estimatedDelivery}
                            onChange={(e) => setTrackingData({ ...trackingData, estimatedDelivery: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ "& .MuiOutlinedInput-root": { fontFamily: MONO } }} />
                        <TextField label="Tracking URL" fullWidth value={trackingData.trackingUrl}
                            onChange={(e) => setTrackingData({ ...trackingData, trackingUrl: e.target.value })}
                            placeholder="https://..."
                            sx={{ "& .MuiOutlinedInput-root": { fontFamily: MONO } }} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, md: 3 }, borderTop: "1px solid #e0e0e0", gap: 1 }}>
                    <Button onClick={() => setTrackingDialogOpen(false)} sx={{ fontFamily: MONO, fontSize: 11, color: "#666", textTransform: "uppercase" }}>Cancel</Button>
                    <Button onClick={handleSaveTracking} variant="contained"
                        sx={{ backgroundColor: "#000", color: "#fff", fontFamily: MONO, fontSize: 11, textTransform: "uppercase", borderRadius: 0, "&:hover": { backgroundColor: "#333" } }}>
                        Save Tracking
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}
                    sx={{ borderRadius: 0, fontFamily: MONO, fontSize: 12, border: "1px solid #000" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrderManagement;