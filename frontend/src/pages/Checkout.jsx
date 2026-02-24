import {
    Box,
    Typography,
    TextField,
    Divider,
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    ArrowBack,
    ArrowForward,
    LocalShipping,
    Store,
    CreditCard,
    Delete,
    CheckCircle,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import authService from "../services/authService";
import axios from "axios";

/* ─── Config ─────────────────────────────────────────────────── */
const API               = "http://localhost:8080";
const FLAT_RATE_SHIPPING = 350;

const getUser    = () => authService.getCurrentUser();
const getCid     = () => getUser()?.customerId ?? null;
const getHeaders = () => {
    const u = getUser();
    return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
};
const unpackCart = (data) => {
    if (Array.isArray(data)) return data;
    return data?.items ?? data?.cartItems ?? data?.cart ?? [];
};
const resolveImg = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API}${url.startsWith("/") ? url : `/${url}`}`;
};

/* ─── Fonts & keyframes ──────────────────────────────────────── */
if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#co-styles")) {
    const s = document.createElement("style");
    s.id = "co-styles";
    s.textContent = `
        @keyframes coUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes coSpin { to{transform:rotate(360deg)} }
    `;
    document.head.appendChild(s);
}

const mono  = "'IBM Plex Mono', monospace";
const serif = "'Playfair Display', serif";

/* ─── Shared primitives ──────────────────────────────────────── */
const MonoLabel = ({ children, sx = {} }) => (
    <Typography sx={{
        fontFamily: mono, fontSize: 9, fontWeight: 600,
        letterSpacing: "0.15em", textTransform: "uppercase",
        color: "#aaa", lineHeight: 1.4, ...sx,
    }}>
        {children}
    </Typography>
);

const SectionBar = ({ title, light = false }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5, mt: 3 }}>
        <Box sx={{ width: 3, height: 20, backgroundColor: light ? "#fff" : "#000", flexShrink: 0 }} />
        <Typography sx={{
            fontFamily: mono, fontSize: 10, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: light ? "rgba(255,255,255,0.7)" : "#000",
        }}>
            {title}
        </Typography>
        <Box sx={{ flex: 1, height: 1, backgroundColor: light ? "rgba(255,255,255,0.08)" : "#e8e8e8" }} />
    </Box>
);

/* Shared text-field style — white bg, mono font */
const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 0,
        fontFamily: mono,
        fontSize: 12,
        backgroundColor: "#fff",
        "& fieldset": { borderColor: "#e0e0e0", borderWidth: 1 },
        "&:hover fieldset": { borderColor: "#000" },
        "&.Mui-focused fieldset": { borderColor: "#000", borderWidth: 1.5 },
    },
    "& .MuiInputLabel-root": { fontFamily: mono, fontSize: 11 },
    "& input, & textarea": {
        fontFamily: `${mono} !important`,
        fontSize: "12px !important",
    },
};

/* ─── Toggle method button ───────────────────────────────────── */
const MethodBtn = ({ active, onClick, icon: Icon, label }) => (
    <Box
        onClick={onClick}
        sx={{
            display: "flex", alignItems: "center", gap: 1.5,
            border: "1px solid",
            borderColor: active ? "#000" : "#e0e0e0",
            backgroundColor: active ? "#000" : "#fff",
            px: 2.5, py: 1.5,
            cursor: "pointer",
            transition: "all 0.18s",
            "&:hover": { borderColor: "#000", backgroundColor: active ? "#111" : "#f5f5f0" },
        }}
    >
        <Icon sx={{ fontSize: 15, color: active ? "#fff" : "#bbb" }} />
        <Typography sx={{
            fontFamily: mono, fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: active ? "#fff" : "#999",
        }}>
            {label}
        </Typography>
        {active && <CheckCircle sx={{ fontSize: 12, color: "#fff", ml: "auto" }} />}
    </Box>
);

/* ─── Payment option row ─────────────────────────────────────── */
const PaymentRow = ({ label, sub, active, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            border: "1px solid",
            borderColor: active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.08)",
            backgroundColor: active ? "rgba(255,255,255,0.07)" : "transparent",
            px: 2.5, py: 1.8, mb: 1,
            cursor: "pointer",
            transition: "all 0.18s",
            "&:hover": { borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.04)" },
        }}
    >
        <Box>
            <Typography sx={{
                fontFamily: mono, fontSize: 10, fontWeight: 600,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
            }}>
                {label}
            </Typography>
            {sub && active && (
                <Typography sx={{
                    fontFamily: mono, fontSize: 8,
                    color: "rgba(255,255,255,0.35)", mt: 0.4, letterSpacing: "0.08em",
                }}>
                    {sub}
                </Typography>
            )}
        </Box>
        <Box sx={{
            width: 18, height: 18,
            border: "1px solid",
            borderColor: active ? "#fff" : "rgba(255,255,255,0.2)",
            backgroundColor: active ? "#fff" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.15s",
        }}>
            {active && <Box sx={{ width: 8, height: 8, backgroundColor: "#000", borderRadius: "50%" }} />}
        </Box>
    </Box>
);

/* ─── Main Component ─────────────────────────────────────────── */
const Checkout = () => {
    const navigate = useNavigate();

    const [cart,           setCart]           = useState([]);
    const [cartLoading,    setCartLoading]     = useState(true);
    const [deliveryMethod, setDeliveryMethod] = useState("delivery");
    const [shipTo,         setShipTo]         = useState("billing");
    const [loading,        setLoading]        = useState(false);
    const [payment,        setPayment]        = useState({ cod: false, bank: false, visa: false });

    const [form, setForm] = useState({
        firstName: "", lastName: "",
        street: "", apartment: "", city: "", postal: "",
        diffStreet: "", diffApartment: "", diffCity: "", diffPostal: "",
        email: "", phone: "", secondaryPhone: "", orderNote: "",
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const showToast = (message, severity = "success") => setSnackbar({ open: true, message, severity });

    useEffect(() => {
        loadCart();
        const user = getUser();
        if (user) setForm(p => ({ ...p, firstName: user.username || "", email: user.email || "" }));
    }, []);

    const loadCart = async () => {
        const cid = getCid();
        if (!cid) { setCartLoading(false); return; }
        try {
            const res = await axios.get(`${API}/api/cart/customer/${cid}`, { headers: getHeaders() });
            setCart(unpackCart(res.data));
        } catch {
            showToast("Failed to load cart items", "error");
        } finally {
            setCartLoading(false);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            await axios.delete(`${API}/api/cart/customer/${getCid()}/item/${cartItemId}`, { headers: getHeaders() });
            await loadCart();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch {
            showToast("Failed to remove item", "error");
        }
    };

    const getItemPrice = (item) =>
        parseFloat(item.discountPrice || item.unitPrice || item.sellingPrice || item.price || 0);

    const subtotal     = cart.reduce((s, i) => s + getItemPrice(i) * (i.quantity || 1), 0);
    const shippingCost = deliveryMethod === "delivery" ? FLAT_RATE_SHIPPING : 0;
    const total        = subtotal + shippingCost;

    const togglePayment = (key) => setPayment({ cod: false, bank: false, visa: false, [key]: true });
    const handleChange  = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

    const validateForm = () => {
        if (!form.firstName || !form.lastName)
            return showToast("Please enter your first and last name", "error"), false;
        if (!form.email || !form.phone)
            return showToast("Please enter email and phone number", "error"), false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return showToast("Please enter a valid email address", "error"), false;
        if (deliveryMethod === "delivery" && (!form.street || !form.city || !form.postal))
            return showToast("Please enter complete delivery address", "error"), false;
        if (!payment.cod && !payment.bank && !payment.visa)
            return showToast("Please select a payment method", "error"), false;
        if (cart.length === 0)
            return showToast("Your cart is empty", "error"), false;
        return true;
    };

    const handlePlaceOrder = async () => {
        const user = getUser();
        if (!user) { showToast("Please login to place an order", "error"); setTimeout(() => navigate("/login"), 2000); return; }
        if (!user.customerId) { showToast("Customer ID not found. Please re-login.", "error"); authService.logout(); setTimeout(() => navigate("/login"), 2000); return; }
        if (!validateForm()) return;

        setLoading(true);
        try {
            const paymentMethod = payment.cod ? "COD" : payment.bank ? "BANK_TRANSFER" : "CARD";

            const checkoutData = {
                customerId: user.customerId,
                firstName: form.firstName, lastName: form.lastName,
                email: form.email, phone: form.phone,
                secondaryPhone: form.secondaryPhone || null,
                deliveryMethod,
                street: form.street || null, apartment: form.apartment || null,
                city: form.city || null, postal: form.postal || null,
                shipTo,
                diffStreet:    shipTo === "different" ? form.diffStreet    : null,
                diffApartment: shipTo === "different" ? form.diffApartment : null,
                diffCity:      shipTo === "different" ? form.diffCity      : null,
                diffPostal:    shipTo === "different" ? form.diffPostal    : null,
                paymentMethod, orderNote: form.orderNote || null, cityId: null,
            };

            const res = await axios.post(`${API}/api/orders/checkout`, checkoutData, { headers: getHeaders() });
            await axios.delete(`${API}/api/cart/customer/${user.customerId}/clear`, { headers: getHeaders() });
            window.dispatchEvent(new Event("cartUpdated"));

            showToast(`Order #${res.data.orderId} placed! Check your email.`, "success");
            setTimeout(() => navigate("/"), 2500);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || "Failed to place order. Please try again.";
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const user = getUser();

    /* ── Cart items ── */
    const cartItems = cart.map(item => ({
        cartItemId:  item.cartItemId ?? item.id ?? item.cartId,
        productId:   item.productId  ?? item.product?.productId,
        productName: item.productName ?? item.product?.productName ?? "Product",
        imageUrl:    item.imageUrl    ?? item.product?.imageUrl ?? null,
        size:        item.size        ?? item.selectedSize  ?? null,
        color:       item.color       ?? item.selectedColor ?? null,
        quantity:    item.quantity    ?? 1,
        price:       getItemPrice(item),
    }));

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0", fontFamily: mono }}>
            <Navbar />

            <Box sx={{ maxWidth: 1260, mx: "auto", px: { xs: 2, sm: 3, md: 5 }, pt: 5, pb: 12 }}>

                {/* ── Page header ── */}
                <Box sx={{
                    borderBottom: "2px solid #000", pb: 3, mb: 5,
                    display: "flex", alignItems: "flex-end",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 2,
                    animation: "coUp 0.4s ease both",
                }}>
                    <Box>
                        <MonoLabel sx={{ mb: 0.8 }}>Almost there</MonoLabel>
                        <Typography sx={{
                            fontFamily: serif, fontWeight: 900, fontStyle: "italic",
                            fontSize: { xs: 36, md: 54 },
                            letterSpacing: "-0.03em", lineHeight: 0.9, color: "#000",
                        }}>
                            Checkout
                        </Typography>
                    </Box>

                    <Box
                        onClick={() => navigate("/cart")}
                        sx={{
                            display: "flex", alignItems: "center", gap: 1,
                            cursor: "pointer", color: "#aaa",
                            "&:hover": { color: "#000" }, transition: "color 0.15s",
                        }}
                    >
                        <ArrowBack sx={{ fontSize: 13 }} />
                        <MonoLabel sx={{ color: "inherit" }}>Back to Cart</MonoLabel>
                    </Box>
                </Box>

                <Box sx={{
                    display: "flex", gap: { xs: 3, lg: 5 },
                    alignItems: "flex-start",
                    flexDirection: { xs: "column", md: "row" },
                }}>

                    {/* ════ LEFT — FORM ════ */}
                    <Box sx={{
                        flex: "3 1 0%", minWidth: 0,
                        width: { xs: "100%", md: "auto" },
                        animation: "coUp 0.4s 0.06s ease both",
                    }}>
                        <Box sx={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", p: { xs: 3, sm: 4.5 } }}>

                            {/* User badge */}
                            {user && (
                                <Box sx={{
                                    display: "flex", alignItems: "center", gap: 2,
                                    border: "1px solid #e8e8e8", p: 2, mb: 3,
                                    backgroundColor: "#fafafa",
                                }}>
                                    <Box sx={{
                                        width: 36, height: 36, backgroundColor: "#000",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: 14, color: "#fff" }}>
                                            {user.username?.charAt(0).toUpperCase()}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#000" }}>
                                            {user.username}
                                        </Typography>
                                        {user.email && <MonoLabel sx={{ color: "#bbb" }}>{user.email}</MonoLabel>}
                                    </Box>
                                </Box>
                            )}

                            {/* ── Billing details ── */}
                            <SectionBar title="Billing Details" />
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                                <TextField fullWidth placeholder="First Name *" size="small"
                                    value={form.firstName} onChange={handleChange("firstName")} sx={fieldSx} />
                                <TextField fullWidth placeholder="Last Name *" size="small"
                                    value={form.lastName}  onChange={handleChange("lastName")}  sx={fieldSx} />
                            </Box>

                            {/* ── Delivery toggle ── */}
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 3 }}>
                                <MethodBtn active={deliveryMethod === "delivery"} onClick={() => setDeliveryMethod("delivery")}
                                    icon={LocalShipping} label="Home Delivery" />
                                <MethodBtn active={deliveryMethod === "pickup"}   onClick={() => setDeliveryMethod("pickup")}
                                    icon={Store}         label="Store Pickup" />
                            </Box>

                            {/* ── Delivery address ── */}
                            {deliveryMethod === "delivery" && (
                                <>
                                    <SectionBar title="Delivery Address" />
                                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                                        <TextField fullWidth placeholder="Street address *" size="small"
                                            value={form.street} onChange={handleChange("street")} sx={fieldSx} />
                                        <TextField fullWidth placeholder="Apartment / suite (optional)" size="small"
                                            value={form.apartment} onChange={handleChange("apartment")} sx={fieldSx} />
                                        <TextField fullWidth placeholder="Town / City *" size="small"
                                            value={form.city} onChange={handleChange("city")} sx={fieldSx} />
                                        <TextField fullWidth placeholder="Postal Code *" size="small"
                                            value={form.postal} onChange={handleChange("postal")} sx={fieldSx} />
                                    </Box>
                                    <Box sx={{
                                        mt: 1.5, px: 2, py: 1,
                                        border: "1px solid #e8e8e8",
                                        backgroundColor: "#fafafa",
                                        display: "flex", alignItems: "center", gap: 1,
                                    }}>
                                        <Box sx={{ width: 6, height: 6, backgroundColor: "#000", flexShrink: 0 }} />
                                        <Typography sx={{ fontFamily: mono, fontSize: 9, color: "#888", letterSpacing: "0.06em" }}>
                                            Sri Lanka only — we currently ship within Sri Lanka
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            {/* ── Contact information ── */}
                            <SectionBar title="Contact Information" />
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                                <TextField fullWidth placeholder="Email address *" size="small" type="email"
                                    value={form.email} onChange={handleChange("email")} sx={fieldSx} />
                                <TextField fullWidth placeholder="Phone *" size="small"
                                    value={form.phone} onChange={handleChange("phone")} sx={fieldSx} />
                                <TextField fullWidth placeholder="Secondary phone (optional)" size="small"
                                    value={form.secondaryPhone} onChange={handleChange("secondaryPhone")} sx={fieldSx} />
                            </Box>

                            {/* ── Ship-to selector ── */}
                            {deliveryMethod === "delivery" && (
                                <>
                                    <SectionBar title="Ship To" />
                                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                                        <MethodBtn active={shipTo === "billing"}   onClick={() => setShipTo("billing")}
                                            icon={CreditCard}     label="Billing Address" />
                                        <MethodBtn active={shipTo === "different"} onClick={() => setShipTo("different")}
                                            icon={LocalShipping}  label="Different Address" />
                                    </Box>

                                    {shipTo === "different" && (
                                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 2 }}>
                                            <TextField fullWidth placeholder="Street address *" size="small"
                                                value={form.diffStreet}    onChange={handleChange("diffStreet")}    sx={fieldSx} />
                                            <TextField fullWidth placeholder="Apartment / suite" size="small"
                                                value={form.diffApartment} onChange={handleChange("diffApartment")} sx={fieldSx} />
                                            <TextField fullWidth placeholder="Town / City *" size="small"
                                                value={form.diffCity}      onChange={handleChange("diffCity")}      sx={fieldSx} />
                                            <TextField fullWidth placeholder="Postal Code *" size="small"
                                                value={form.diffPostal}    onChange={handleChange("diffPostal")}    sx={fieldSx} />
                                        </Box>
                                    )}
                                </>
                            )}

                            {/* ── Order note ── */}
                            <SectionBar title="Order Note (optional)" />
                            <TextField fullWidth multiline rows={3} placeholder="Any special instructions for your order..."
                                value={form.orderNote} onChange={handleChange("orderNote")} sx={fieldSx} />
                        </Box>
                    </Box>

                    {/* ════ RIGHT — ORDER SUMMARY ════ */}
                    <Box sx={{
                        flex: "2 1 0%", minWidth: 0,
                        width: { xs: "100%", md: "auto" },
                        position: { md: "sticky" }, top: 24,
                        animation: "coUp 0.4s 0.1s ease both",
                    }}>
                        {/* Dark summary card */}
                        <Box sx={{ backgroundColor: "#0d0d0d", p: { xs: 3, sm: 4 } }}>

                            {/* Header */}
                            <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.07)", pb: 2.5, mb: 2.5 }}>
                                <MonoLabel sx={{ color: "rgba(255,255,255,0.3)", mb: 0.5 }}>Your</MonoLabel>
                                <Typography sx={{
                                    fontFamily: serif, fontWeight: 700, fontStyle: "italic",
                                    fontSize: 30, lineHeight: 1, color: "#fff",
                                }}>
                                    Order Summary
                                </Typography>
                            </Box>

                            {/* ── Cart items ── */}
                            {cartLoading ? (
                                <Box sx={{ textAlign: "center", py: 5 }}>
                                    <Box sx={{
                                        width: 28, height: 28,
                                        border: "2px solid rgba(255,255,255,0.2)",
                                        borderTopColor: "#fff", borderRadius: "50%",
                                        mx: "auto", mb: 1.5,
                                        animation: "coSpin 0.7s linear infinite",
                                    }} />
                                    <MonoLabel sx={{ color: "rgba(255,255,255,0.2)" }}>Loading...</MonoLabel>
                                </Box>
                            ) : cart.length === 0 ? (
                                <Box sx={{ textAlign: "center", py: 5 }}>
                                    <MonoLabel sx={{ color: "rgba(255,255,255,0.2)" }}>Cart is empty</MonoLabel>
                                </Box>
                            ) : cartItems.map((item, idx) => (
                                <Box key={item.cartItemId}>
                                    <Box sx={{ display: "flex", gap: 2, py: 2.5, alignItems: "flex-start" }}>
                                        {/* Image */}
                                        <Box
                                            onClick={() => item.productId && navigate(`/product/${item.productId}`)}
                                            sx={{
                                                width: 72, height: 88, flexShrink: 0,
                                                overflow: "hidden",
                                                backgroundColor: "#1a1a1a",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                                cursor: item.productId ? "pointer" : "default",
                                                position: "relative",
                                            }}
                                        >
                                            {resolveImg(item.imageUrl) ? (
                                                <Box
                                                    component="img"
                                                    src={resolveImg(item.imageUrl)}
                                                    alt={item.productName}
                                                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                                    onError={(e) => { e.target.style.display = "none"; }}
                                                />
                                            ) : (
                                                <Box sx={{
                                                    width: "100%", height: "100%",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                }}>
                                                    <Typography sx={{
                                                        fontFamily: serif, fontWeight: 900, fontStyle: "italic",
                                                        fontSize: 28, color: "rgba(255,255,255,0.08)",
                                                    }}>
                                                        {item.productName.charAt(0)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Info */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{
                                                fontFamily: mono, fontWeight: 600, fontSize: 10,
                                                letterSpacing: "0.05em", textTransform: "uppercase",
                                                color: "#fff", mb: 0.6, lineHeight: 1.4,
                                                overflow: "hidden",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                            }}>
                                                {item.productName}
                                            </Typography>

                                            {/* Variant chips */}
                                            {(item.color || item.size) && (
                                                <Box sx={{ display: "flex", gap: 0.6, mb: 0.8, flexWrap: "wrap" }}>
                                                    {item.color && (
                                                        <Box sx={{
                                                            display: "flex", alignItems: "center", gap: 0.5,
                                                            border: "1px solid rgba(255,255,255,0.1)",
                                                            px: 0.7, py: 0.2,
                                                        }}>
                                                            <Box sx={{
                                                                width: 7, height: 7, borderRadius: "50%",
                                                                backgroundColor: ["white","beige","cream"].includes(item.color.toLowerCase())
                                                                    ? "#ebebeb" : item.color.toLowerCase(),
                                                                border: "1px solid rgba(255,255,255,0.15)",
                                                                flexShrink: 0,
                                                            }} />
                                                            <MonoLabel sx={{ color: "rgba(255,255,255,0.35)", fontSize: 8 }}>
                                                                {item.color}
                                                            </MonoLabel>
                                                        </Box>
                                                    )}
                                                    {item.size && (
                                                        <Box sx={{ border: "1px solid rgba(255,255,255,0.1)", px: 0.7, py: 0.2 }}>
                                                            <MonoLabel sx={{ color: "rgba(255,255,255,0.35)", fontSize: 8 }}>
                                                                Size: {item.size}
                                                            </MonoLabel>
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            <MonoLabel sx={{ color: "rgba(255,255,255,0.25)" }}>
                                                Qty: {item.quantity}
                                            </MonoLabel>
                                        </Box>

                                        {/* Price + delete */}
                                        <Box sx={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                                            <Typography sx={{
                                                fontFamily: serif, fontWeight: 700, fontSize: 15,
                                                color: "#fff", lineHeight: 1,
                                            }}>
                                                Rs {(item.price * item.quantity).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                                            </Typography>
                                            <Box
                                                onClick={() => handleRemoveItem(item.cartItemId)}
                                                sx={{
                                                    width: 24, height: 24,
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer",
                                                    "&:hover": { borderColor: "#e57373", backgroundColor: "rgba(229,115,115,0.1)" },
                                                    transition: "all 0.15s",
                                                }}
                                            >
                                                <Delete sx={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }} />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {idx < cartItems.length - 1 && (
                                        <Box sx={{ height: 1, backgroundColor: "rgba(255,255,255,0.05)" }} />
                                    )}
                                </Box>
                            ))}

                            {/* ── Totals ── */}
                            <Box sx={{
                                borderTop: "1px solid rgba(255,255,255,0.07)",
                                pt: 2.5, mt: 2, mb: 3,
                            }}>
                                {[
                                    { label: `Subtotal (${cart.length} item${cart.length !== 1 ? "s" : ""})`, value: `Rs ${subtotal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}` },
                                    {
                                        label: "Shipping",
                                        value: deliveryMethod === "delivery"
                                            ? `Rs ${FLAT_RATE_SHIPPING.toLocaleString()}`
                                            : "Free",
                                        valueColor: deliveryMethod !== "delivery" ? "#4ade80" : "#fff",
                                    },
                                ].map(({ label, value, valueColor = "#fff" }) => (
                                    <Box key={label} sx={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "baseline", mb: 1.2,
                                    }}>
                                        <MonoLabel sx={{ color: "rgba(255,255,255,0.3)" }}>{label}</MonoLabel>
                                        <Typography sx={{ fontFamily: mono, fontSize: 12, fontWeight: 500, color: valueColor }}>
                                            {value}
                                        </Typography>
                                    </Box>
                                ))}

                                <Box sx={{
                                    height: 1, backgroundColor: "rgba(255,255,255,0.07)", my: 2,
                                }} />

                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <MonoLabel sx={{ color: "rgba(255,255,255,0.5)" }}>Total</MonoLabel>
                                    <Typography sx={{
                                        fontFamily: serif, fontWeight: 700, fontSize: 28,
                                        color: "#fff", lineHeight: 1,
                                    }}>
                                        Rs {total.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Delivery note */}
                            <Box sx={{
                                border: "1px solid rgba(255,255,255,0.07)",
                                backgroundColor: "rgba(255,255,255,0.03)",
                                px: 2, py: 1.5, mb: 3,
                                display: "flex", gap: 1.2, alignItems: "flex-start",
                            }}>
                                {deliveryMethod === "delivery"
                                    ? <LocalShipping sx={{ fontSize: 12, color: "rgba(255,255,255,0.2)", mt: 0.15 }} />
                                    : <Store         sx={{ fontSize: 12, color: "rgba(255,255,255,0.2)", mt: 0.15 }} />
                                }
                                <Typography sx={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
                                    {deliveryMethod === "delivery"
                                        ? "Typically delivered within 2–5 business days across Sri Lanka."
                                        : "Your order will be ready for pickup at our store."}
                                </Typography>
                            </Box>

                            {/* ── Payment method ── */}
                            <SectionBar title="Payment Method" light />
                            <Box sx={{ mb: 3 }}>
                                <PaymentRow label="Cash on Delivery"            active={payment.cod}  onClick={() => togglePayment("cod")}  />
                                <PaymentRow label="Bank Transfer"               active={payment.bank} onClick={() => togglePayment("bank")} />
                                <PaymentRow label="Visa / Mastercard — PayHere" sub="Secure card payment via PayHere"
                                    active={payment.visa} onClick={() => togglePayment("visa")} />
                            </Box>

                            {/* Privacy note */}
                            <Typography sx={{
                                fontFamily: mono, fontSize: 8,
                                color: "rgba(255,255,255,0.2)", lineHeight: 1.8,
                                mb: 3, letterSpacing: "0.04em",
                            }}>
                                Your personal data will be used to process your order and support your
                                experience as described in our{" "}
                                <span style={{ textDecoration: "underline", cursor: "pointer", color: "rgba(255,255,255,0.35)" }}>
                                    privacy policy
                                </span>.
                            </Typography>

                            {/* Place order button */}
                            <Box
                                onClick={!loading && cart.length > 0 && !cartLoading ? handlePlaceOrder : undefined}
                                sx={{
                                    width: "100%", py: 2,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
                                    backgroundColor: loading || cart.length === 0 ? "#333" : "#fff",
                                    cursor: loading || cart.length === 0 ? "not-allowed" : "pointer",
                                    transition: "background-color 0.2s",
                                    "&:hover": !loading && cart.length > 0 ? { backgroundColor: "#e8e8e8" } : {},
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Box sx={{
                                            width: 14, height: 14,
                                            border: "2px solid #000",
                                            borderTopColor: "transparent",
                                            borderRadius: "50%",
                                            animation: "coSpin 0.7s linear infinite",
                                        }} />
                                        <Typography sx={{
                                            fontFamily: mono, fontSize: 11, fontWeight: 600,
                                            letterSpacing: "0.14em", textTransform: "uppercase", color: "#888",
                                        }}>
                                            Processing…
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <Typography sx={{
                                            fontFamily: mono, fontSize: 11, fontWeight: 600,
                                            letterSpacing: "0.14em", textTransform: "uppercase",
                                            color: cart.length === 0 ? "#888" : "#000",
                                        }}>
                                            Place Order
                                        </Typography>
                                        <ArrowForward sx={{ fontSize: 14, color: cart.length === 0 ? "#888" : "#000" }} />
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{
                borderTop: "1px solid #e0e0e0", backgroundColor: "#fff",
                py: 2.5, px: { xs: 3, md: 6 },
                display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: 1,
            }}>
                <MonoLabel>© {new Date().getFullYear()} CLOTHIFY — All Rights Reserved</MonoLabel>
                <Box onClick={() => navigate("/")} sx={{ cursor: "pointer", "&:hover": { opacity: 0.6 }, transition: "opacity 0.15s" }}>
                    <MonoLabel>Home</MonoLabel>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{
                        borderRadius: 0, border: "1px solid #000",
                        backgroundColor: "#fff", color: "#000",
                        fontFamily: mono, fontSize: 12,
                        "& .MuiAlert-icon": { color: "#000" },
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Checkout;