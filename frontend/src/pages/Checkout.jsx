import {
    Box,
    Typography,
    Button,
    TextField,
    Switch,
    Divider,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
    Avatar,
} from "@mui/material";
import {
    ArrowBackIos,
    LocalShipping,
    Store,
    CreditCard,
    Delete,
    ArrowForwardIos,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import cartService from "../services/cartService";
import authService from "../services/authService";
import axios from "axios";

const FLAT_RATE_SHIPPING = 350;

// ─── Payment Toggle Row ───────────────────────────────────────────────────────
const PaymentOption = ({ label, subLabel, active, onToggle, badgeText, badgeColor }) => (
    <Box sx={{ mb: 1 }}>
        <Box
            onClick={onToggle}
            sx={{
                border: "1px solid #2e2e2e",
                borderRadius: 2,
                px: 2,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                backgroundColor: active ? "#1c1c1c" : "transparent",
                transition: "background-color 0.2s",
                "&:hover": { backgroundColor: "#1a1a1a" },
            }}
        >
            <Typography variant="body2" fontWeight="bold" color="#fff" sx={{ letterSpacing: 1.2, fontSize: 12 }}>
                {label}
            </Typography>
            <Switch
                checked={active}
                size="small"
                onClick={(e) => e.stopPropagation()}
                onChange={onToggle}
                sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#fff" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#555" },
                }}
            />
        </Box>
        {active && subLabel && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, px: 1, pt: 0.5 }}>
                <Typography variant="caption" color="#888">{subLabel}</Typography>
                {badgeText && (
                    <Typography variant="caption" fontWeight="bold" sx={{ color: badgeColor || "#e67e22" }}>
                        {badgeText}
                    </Typography>
                )}
            </Box>
        )}
    </Box>
);

// ─── Section Heading ──────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
    <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="caption" fontWeight="bold" sx={{ letterSpacing: 2.5, color: "#111", fontSize: 11 }}>
            {children}
        </Typography>
        <Divider sx={{ mt: 1, borderColor: "#e8e8e8" }} />
    </Box>
);

// ─── Shared Input Style ───────────────────────────────────────────────────────
const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 1.5,
        fontSize: 13,
        backgroundColor: "#fff",
        "& fieldset": { borderColor: "#e0e0e0" },
        "&:hover fieldset": { borderColor: "#bbb" },
        "&.Mui-focused fieldset": { borderColor: "#111", borderWidth: 1.5 },
    },
    "& input::placeholder, & textarea::placeholder": { color: "#bbb", opacity: 1 },
};

// ─── Toggle Button ────────────────────────────────────────────────────────────
const ToggleBtn = ({ active, onClick, startIcon, children }) => (
    <Button
        fullWidth
        startIcon={startIcon}
        onClick={onClick}
        sx={{
            py: 1.4,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
            letterSpacing: 1.2,
            fontSize: 12,
            backgroundColor: active ? "#111" : "#fff",
            color: active ? "#fff" : "#555",
            border: "1px solid",
            borderColor: active ? "#111" : "#ddd",
            "&:hover": {
                backgroundColor: active ? "#333" : "#f5f5f5",
                borderColor: active ? "#333" : "#bbb",
            },
            transition: "all 0.2s",
        }}
    >
        {children}
    </Button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [deliveryMethod, setDeliveryMethod] = useState("delivery");
    const [shipTo, setShipTo] = useState("billing");
    const [loading, setLoading] = useState(false);
    const [payment, setPayment] = useState({
        cod: false,
        bank: false,
        visa: false,
    });
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        street: "",
        apartment: "",
        city: "",
        postal: "",
        diffStreet: "",
        diffApartment: "",
        diffCity: "",
        diffPostal: "",
        email: "",
        phone: "",
        secondaryPhone: "",
        orderNote: "",
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        // Load cart
        setCart(cartService.getCart());
        
        // Pre-fill user details if logged in
        const user = authService.getCurrentUser();
        console.log("Logged in user:", user); // Debug
        
        if (user) {
            // Pre-fill form with user details
            setForm(prev => ({
                ...prev,
                firstName: user.username || prev.firstName,
                email: user.email || prev.email,
            }));
        }
    }, []);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `http://localhost:8080${imageUrl}`;
    };

    const getItemPrice = (item) =>
        parseFloat(item.discountPrice || item.sellingPrice || item.price || 0);

    const subtotal = cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
    const shippingCost = deliveryMethod === "delivery" ? FLAT_RATE_SHIPPING : 0;
    const total = subtotal + shippingCost;

    const handleRemoveItem = (cartItemKey) => {
        cartService.removeFromCart(cartItemKey);
        setCart(cartService.getCart());
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const handleItemClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const togglePayment = (key) => {
        setPayment({
            cod: key === "cod",
            bank: key === "bank",
            visa: key === "visa",
        });
    };

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleCloseSnackbar = () =>
        setSnackbar({ ...snackbar, open: false });

    const validateForm = () => {
        if (!form.firstName || !form.lastName) {
            setSnackbar({
                open: true,
                message: "Please enter your first and last name",
                severity: "error",
            });
            return false;
        }

        if (!form.email || !form.phone) {
            setSnackbar({
                open: true,
                message: "Please enter your email and phone number",
                severity: "error",
            });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setSnackbar({
                open: true,
                message: "Please enter a valid email address",
                severity: "error",
            });
            return false;
        }

        if (deliveryMethod === "delivery") {
            if (!form.street || !form.city || !form.postal) {
                setSnackbar({
                    open: true,
                    message: "Please enter complete delivery address",
                    severity: "error",
                });
                return false;
            }
        }

        if (!payment.cod && !payment.bank && !payment.visa) {
            setSnackbar({
                open: true,
                message: "Please select a payment method",
                severity: "error",
            });
            return false;
        }

        if (cart.length === 0) {
            setSnackbar({
                open: true,
                message: "Your cart is empty",
                severity: "error",
            });
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        // Check authentication first
        const user = authService.getCurrentUser();
        
        console.log("User when placing order:", user); // Debug
        
        if (!user) {
            setSnackbar({
                open: true,
                message: "Please login to place an order",
                severity: "error",
            });
            setTimeout(() => navigate("/login"), 2000);
            return;
        }

        if (!user.customerId) {
            setSnackbar({
                open: true,
                message: "Customer ID not found. Please re-login.",
                severity: "error",
            });
            authService.logout();
            setTimeout(() => navigate("/login"), 2000);
            return;
        }

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Determine payment method
            let paymentMethod = "COD";
            if (payment.cod) paymentMethod = "COD";
            else if (payment.bank) paymentMethod = "BANK_TRANSFER";
            else if (payment.visa) paymentMethod = "CARD";

            // Prepare checkout data
            const checkoutData = {
                customerId: user.userId,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                secondaryPhone: form.secondaryPhone || null,
                deliveryMethod: deliveryMethod,
                street: form.street || null,
                apartment: form.apartment || null,
                city: form.city || null,
                postal: form.postal || null,
                shipTo: shipTo,
                diffStreet: shipTo === "different" ? form.diffStreet : null,
                diffApartment: shipTo === "different" ? form.diffApartment : null,
                diffCity: shipTo === "different" ? form.diffCity : null,
                diffPostal: shipTo === "different" ? form.diffPostal : null,
                paymentMethod: paymentMethod,
                orderNote: form.orderNote || null,
                cityId: null,
            };

            console.log("Sending checkout data:", checkoutData);

            const response = await axios.post(
                "http://localhost:8080/api/orders/checkout",
                checkoutData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            console.log("Order response:", response.data);

            // Clear cart
            cartService.clearCart();
            window.dispatchEvent(new Event("cartUpdated"));

            // Show success message
            setSnackbar({
                open: true,
                message: `Order placed successfully! Order #${response.data.orderId}. Check your email!`,
                severity: "success",
            });

            // Redirect to home after 2 seconds
            setTimeout(() => {
                navigate("/");
            }, 2000);

        } catch (error) {
            console.error("Checkout error:", error);
            
            let errorMessage = "Failed to place order. Please try again.";
            
            if (error.response?.data) {
                errorMessage = error.response.data.message || 
                              error.response.data.error || 
                              JSON.stringify(error.response.data);
            } else if (error.message) {
                errorMessage = error.message;
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
            <Navbar />

            <Box sx={{ maxWidth: 1300, mx: "auto", px: { xs: 2, sm: 3, md: 5 }, pt: 3, pb: 10 }}>
                <Button
                    startIcon={<ArrowBackIos sx={{ fontSize: 11 }} />}
                    onClick={() => navigate("/cart")}
                    disableRipple
                    sx={{
                        textTransform: "none",
                        color: "#666",
                        fontSize: 12,
                        letterSpacing: 1,
                        mb: 3,
                        px: 0,
                        fontWeight: "bold",
                        "&:hover": { color: "#000", backgroundColor: "transparent" },
                    }}
                >
                    BACK TO CART
                </Button>

                <Box sx={{
                    display: "flex",
                    gap: 3,
                    alignItems: "flex-start",
                    flexDirection: { xs: "column", md: "row" },
                }}>
                    {/* LEFT — BILLING FORM */}
                    <Box sx={{ flex: "3 1 0%", minWidth: 0, width: { xs: "100%", md: "auto" } }}>
                        <Box sx={{
                            backgroundColor: "#fff",
                            borderRadius: 3,
                            p: { xs: 2.5, sm: 4 },
                            boxShadow: "0 2px 20px rgba(0,0,0,0.05)",
                        }}>
                            {/* User Welcome Badge */}
                            {(() => {
                                const user = authService.getCurrentUser();
                                return user ? (
                                    <Box sx={{ 
                                        mb: 3, 
                                        p: 2, 
                                        backgroundColor: "#f5f5f5", 
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}>
                                        <Avatar sx={{ bgcolor: "#111", width: 40, height: 40 }}>
                                            {user.username?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold" color="#111">
                                                {user.username}
                                            </Typography>
                                            {user.email && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                ) : null;
                            })()}

                            <SectionTitle>BILLING DETAILS</SectionTitle>

                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                <TextField 
                                    fullWidth 
                                    placeholder="First Name*" 
                                    size="small"
                                    required
                                    value={form.firstName} 
                                    onChange={handleChange("firstName")} 
                                    sx={inputSx} 
                                />
                                <TextField 
                                    fullWidth 
                                    placeholder="Last Name*" 
                                    size="small"
                                    required
                                    value={form.lastName} 
                                    onChange={handleChange("lastName")} 
                                    sx={inputSx} 
                                />
                            </Box>

                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>
                                <ToggleBtn
                                    active={deliveryMethod === "delivery"}
                                    onClick={() => setDeliveryMethod("delivery")}
                                    startIcon={<LocalShipping />}
                                >
                                    DELIVERY
                                </ToggleBtn>
                                <ToggleBtn
                                    active={deliveryMethod === "pickup"}
                                    onClick={() => setDeliveryMethod("pickup")}
                                    startIcon={<Store />}
                                >
                                    STORE PICKUP
                                </ToggleBtn>
                            </Box>

                            {deliveryMethod === "delivery" && (
                                <>
                                    <SectionTitle>ADDRESS</SectionTitle>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                        <TextField 
                                            fullWidth 
                                            placeholder="Street address*" 
                                            size="small"
                                            required
                                            value={form.street} 
                                            onChange={handleChange("street")} 
                                            sx={inputSx} 
                                        />
                                        <TextField 
                                            fullWidth 
                                            placeholder="Apartment, suite, unit, etc. (optional)" 
                                            size="small"
                                            value={form.apartment} 
                                            onChange={handleChange("apartment")} 
                                            sx={inputSx} 
                                        />
                                        <TextField 
                                            fullWidth 
                                            placeholder="Town / City*" 
                                            size="small"
                                            required
                                            value={form.city} 
                                            onChange={handleChange("city")} 
                                            sx={inputSx} 
                                        />
                                        <TextField 
                                            fullWidth 
                                            placeholder="Postal Code*" 
                                            size="small"
                                            required
                                            value={form.postal} 
                                            onChange={handleChange("postal")} 
                                            sx={inputSx} 
                                        />
                                    </Box>
                                    <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "#555" }}>
                                        <strong>Sri Lanka</strong> –{" "}
                                        <span style={{ color: "#e53935" }}>Currently we only ship within Sri Lanka!</span>
                                    </Typography>
                                </>
                            )}

                            <SectionTitle>CONTACT INFORMATION</SectionTitle>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                <TextField 
                                    fullWidth 
                                    placeholder="Email address*" 
                                    size="small"
                                    type="email"
                                    required
                                    value={form.email} 
                                    onChange={handleChange("email")} 
                                    sx={inputSx} 
                                />
                                <TextField 
                                    fullWidth 
                                    placeholder="Phone*" 
                                    size="small"
                                    required
                                    value={form.phone} 
                                    onChange={handleChange("phone")} 
                                    sx={inputSx} 
                                />
                                <TextField 
                                    placeholder="Secondary Phone (optional)" 
                                    size="small"
                                    value={form.secondaryPhone} 
                                    onChange={handleChange("secondaryPhone")} 
                                    sx={inputSx} 
                                />
                            </Box>

                            <Divider sx={{ my: 3, borderColor: "#f0f0f0" }} />

                            {deliveryMethod === "delivery" && (
                                <>
                                    <SectionTitle>SHIP TO?</SectionTitle>

                                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                        <ToggleBtn
                                            active={shipTo === "billing"}
                                            onClick={() => setShipTo("billing")}
                                            startIcon={<CreditCard />}
                                        >
                                            BILLING ADDRESS
                                        </ToggleBtn>
                                        <ToggleBtn
                                            active={shipTo === "different"}
                                            onClick={() => setShipTo("different")}
                                            startIcon={<LocalShipping />}
                                        >
                                            DIFFERENT ADDRESS
                                        </ToggleBtn>
                                    </Box>

                                    {shipTo === "different" && (
                                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>
                                            <TextField fullWidth placeholder="Street address*" size="small"
                                                value={form.diffStreet} onChange={handleChange("diffStreet")} sx={inputSx} />
                                            <TextField fullWidth placeholder="Apartment, suite, unit, etc." size="small"
                                                value={form.diffApartment} onChange={handleChange("diffApartment")} sx={inputSx} />
                                            <TextField fullWidth placeholder="Town / City*" size="small"
                                                value={form.diffCity} onChange={handleChange("diffCity")} sx={inputSx} />
                                            <TextField fullWidth placeholder="Postal Code*" size="small"
                                                value={form.diffPostal} onChange={handleChange("diffPostal")} sx={inputSx} />
                                        </Box>
                                    )}
                                </>
                            )}

                            <Typography variant="caption" fontWeight="bold"
                                sx={{ letterSpacing: 2, color: "#111", display: "block", mt: 4, mb: 1, fontSize: 11 }}>
                                ORDER NOTE (OPTIONAL)
                            </Typography>
                            <TextField
                                fullWidth multiline rows={4} placeholder="Order note"
                                value={form.orderNote} onChange={handleChange("orderNote")} sx={inputSx}
                            />
                        </Box>
                    </Box>

                    {/* RIGHT — ORDER SUMMARY */}
                    <Box sx={{
                        flex: "2 1 0%",
                        minWidth: 0,
                        width: { xs: "100%", md: "auto" },
                        position: { md: "sticky" },
                        top: 90,
                    }}>
                        <Box sx={{
                            backgroundColor: "#111",
                            borderRadius: 3,
                            p: { xs: 2.5, sm: 3.5 },
                        }}>
                            {cart.length === 0 ? (
                                <Typography color="#555" variant="body2" textAlign="center" py={4}>
                                    Your cart is empty.
                                </Typography>
                            ) : (
                                cart.map((item) => {
                                    const itemPrice = getItemPrice(item);
                                    const lineTotal = itemPrice * item.quantity;
                                    return (
                                        <Box key={item.cartItemKey}>
                                            <Box 
                                                onClick={() => handleItemClick(item.productId)}
                                                sx={{ 
                                                    display: "flex", 
                                                    gap: 2, 
                                                    alignItems: "flex-start", 
                                                    py: 2,
                                                    cursor: "pointer",
                                                    borderRadius: 2,
                                                    transition: "background-color 0.2s",
                                                    "&:hover": {
                                                        backgroundColor: "#1a1a1a",
                                                    }
                                                }}
                                            >
                                                <Box sx={{
                                                    width: 82, height: 100, borderRadius: 2,
                                                    overflow: "hidden", flexShrink: 0, backgroundColor: "#222",
                                                }}>
                                                    {item.imageUrl && (
                                                        <img
                                                            src={getImageUrl(item.imageUrl)}
                                                            alt={item.productName}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        />
                                                    )}
                                                </Box>

                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    {item.productCode && (
                                                        <Typography variant="caption" color="#555" sx={{ display: "block", mb: 0.3 }}>
                                                            Code: {item.productCode}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body2" fontWeight="bold" color="#fff"
                                                        sx={{
                                                            lineHeight: 1.4, mb: 0.5,
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: "vertical",
                                                            overflow: "hidden",
                                                        }}>
                                                        {item.productName}
                                                    </Typography>
                                                    <Typography variant="caption" color="#666" sx={{ display: "block" }}>
                                                        {[
                                                            item.selectedSize && `Size: ${item.selectedSize}`,
                                                            item.selectedColor && `Color: ${item.selectedColor}`,
                                                        ].filter(Boolean).join("  |  ")}
                                                    </Typography>
                                                    <Typography variant="caption" color="#555" sx={{ display: "block", mb: 0.8 }}>
                                                        x {item.quantity}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold" color="#fff">
                                                        Rs {lineTotal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                                                    </Typography>
                                                </Box>

                                                <IconButton 
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveItem(item.cartItemKey);
                                                    }}
                                                    sx={{ 
                                                        color: "#555", 
                                                        mt: 0.5, 
                                                        flexShrink: 0, 
                                                        "&:hover": { 
                                                            color: "#e57373",
                                                            backgroundColor: "#2a2a2a",
                                                        } 
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            <Divider sx={{ borderColor: "#222" }} />
                                        </Box>
                                    );
                                })
                            )}

                            <Box sx={{ mt: 2.5 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
                                    <Typography variant="caption" color="#888" sx={{ letterSpacing: 1.5, fontWeight: "bold" }}>
                                        SUBTOTAL
                                    </Typography>
                                    <Typography variant="body2" color="#fff" fontWeight="bold">
                                        Rs {subtotal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>

                                <Typography variant="caption" color="#888"
                                    sx={{ display: "block", letterSpacing: 1.5, fontWeight: "bold", mb: 0.5 }}>
                                    SHIPPING
                                </Typography>

                                {deliveryMethod === "delivery" ? (
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                        <Typography variant="caption" color="#555">FLAT RATE:</Typography>
                                        <Typography variant="body2" color="#fff" fontWeight="bold">
                                            Rs {FLAT_RATE_SHIPPING.toLocaleString()}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                        <Typography variant="caption" color="#555">STORE PICKUP:</Typography>
                                        <Typography variant="body2" color="#4caf50" fontWeight="bold">FREE</Typography>
                                    </Box>
                                )}

                                <Divider sx={{ borderColor: "#222", mb: 1.5 }} />

                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <Typography variant="caption" color="#888" sx={{ letterSpacing: 1.5, fontWeight: "bold" }}>
                                        TOTAL
                                    </Typography>
                                    <Typography variant="body1" color="#fff" fontWeight="bold">
                                        Rs {total.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>

                                <Box sx={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 2, p: 1.5, mb: 3 }}>
                                    <Typography variant="caption" color="#555">
                                        {deliveryMethod === "delivery"
                                            ? "Orders are typically delivered within 2–5 business days."
                                            : "You can pick up your order from our store at your convenience."}
                                    </Typography>
                                </Box>
                            </Box>

                            <Typography variant="caption" color="#888" sx={{ display: "block", mb: 1, letterSpacing: 1.5, fontWeight: "bold" }}>
                                PAYMENT METHOD *
                            </Typography>
                            <PaymentOption label="CASH ON DELIVERY"
                                active={payment.cod} onToggle={() => togglePayment("cod")} />
                            <PaymentOption label="BANK TRANSFER"
                                active={payment.bank} onToggle={() => togglePayment("bank")} />
                            <PaymentOption label="VISA / MASTERCARD BY PayHere"
                                active={payment.visa} onToggle={() => togglePayment("visa")}
                                subLabel="Secure card payment via" badgeText="PayHere" badgeColor="#e67e22" />
                          
                            <Typography variant="caption" color="#444"
                                sx={{ display: "block", mt: 2, mb: 3, lineHeight: 1.7 }}>
                                Your personal data will be used to process your order, support your experience
                                throughout this website, and for other purposes described in our{" "}
                                <span style={{ textDecoration: "underline", cursor: "pointer", color: "#777" }}>
                                    privacy policy
                                </span>.
                            </Typography>

                            <Button
                                fullWidth
                                onClick={handlePlaceOrder}
                                disabled={loading || cart.length === 0}
                                endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIos sx={{ fontSize: 13 }} />}
                                sx={{
                                    backgroundColor: "#fff",
                                    color: "#000",
                                    py: 1.8,
                                    borderRadius: "50px",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    fontSize: 14,
                                    letterSpacing: 1,
                                    "&:hover": { backgroundColor: "#e8e8e8" },
                                    "&:disabled": { 
                                        backgroundColor: "#ccc",
                                        color: "#666",
                                    },
                                    transition: "background-color 0.2s",
                                }}
                            >
                                {loading ? "PROCESSING..." : "PLACE AN ORDER"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Checkout;