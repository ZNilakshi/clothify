import {
    Box,
    Container,
    Grid,
    Typography,
    Collapse,
} from "@mui/material";
import {
    Person,
    Email,
    Phone,
    LocationOn,
    ShoppingBag,
    LocalShipping,
    Store,
    ExpandMore,
    Payment,
    ArrowForward,
    ArrowBack,
    BugReport,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import authService from "../services/authService";
import axios from "axios";

/* ─── Config ─────────────────────────────────────────────────── */
const API = "http://localhost:8080";
const getUser    = () => authService.getCurrentUser();
const getHeaders = () => {
    const u = getUser();
    return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
};

const resolveImg = (url) => {
    if (!url) return null;
    const s = String(url).trim();
    if (!s) return null;
    if (s.startsWith("http")) return s;
    return `${API}${s.startsWith("/") ? s : `/${s}`}`;
};

/* Try every possible image field */
const extractImage = (item) => {
    const candidates = [
        item?.imageUrl,
        item?.image,
        item?.productImage,
        item?.product_image,
        item?.img,
        item?.thumbnail,
        item?.photo,
        item?.product?.imageUrl,
        item?.product?.image,
        item?.product?.productImage,
        item?.product?.img,
        item?.product?.thumbnail,
    ];
    for (const c of candidates) {
        const r = resolveImg(c);
        if (r) return r;
    }
    return null;
};

/* Try every possible price field */
const extractPrice = (item) => {
    const candidates = [
        item?.unitPrice,
        item?.unit_price,
        item?.price,
        item?.itemPrice,
        item?.sellingPrice,
        item?.salePrice,
        item?.product?.sellingPrice,
        item?.product?.price,
        item?.product?.salePrice,
    ];
    for (const c of candidates) {
        const n = parseFloat(c);
        if (!isNaN(n) && n > 0) return n;
    }
    return 0;
};

/* Try every possible total field */
const extractTotal = (order) => {
    const candidates = [
        order?.totalAmount,
        order?.total,
        order?.orderTotal,
        order?.grandTotal,
        order?.amount,
        order?.totalPrice,
    ];
    for (const c of candidates) {
        const n = parseFloat(c);
        if (!isNaN(n) && n >= 0) return n;
    }
    return 0;
};

/* Normalise delivery method */
const parseDelivery = (raw = "") => {
    const s = String(raw).toLowerCase().replace(/[_-]/g, " ").trim();
    if (!s || s === "n/a" || s === "null" || s === "undefined")
        return { isDelivery: false, label: raw || "N/A" };
    if (s.includes("deliver") || s === "home")
        return { isDelivery: true,  label: "Home Delivery" };
    if (s.includes("pickup") || s.includes("store") || s === "pickup")
        return { isDelivery: false, label: "Store Pickup" };
    return { isDelivery: false, label: raw };
};

/* ─── Fonts & keyframes ──────────────────────────────────────── */
if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#ud4-styles")) {
    const s = document.createElement("style");
    s.id = "ud4-styles";
    s.textContent = `
        @keyframes udUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes udSpin { to{transform:rotate(360deg)} }
    `;
    document.head.appendChild(s);
}

const mono  = "'IBM Plex Mono', monospace";
const serif = "'Playfair Display', serif";

/* ─── Helpers ────────────────────────────────────────────────── */
const MonoLabel = ({ children, sx = {} }) => (
    <Typography sx={{ fontFamily: mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", lineHeight: 1.4, ...sx }}>
        {children}
    </Typography>
);

const SectionBar = ({ title }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 3 }}>
        <Box sx={{ width: 3, height: 22, backgroundColor: "#000", flexShrink: 0 }} />
        <Typography sx={{ fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#000" }}>
            {title}
        </Typography>
        <Box sx={{ flex: 1, height: 1, backgroundColor: "#e8e8e8" }} />
    </Box>
);

const OrderStatus = ({ status }) => {
    const map = { PENDING: "#000", PROCESSING: "#333", SHIPPED: "#444", DELIVERED: "#111", CANCELLED: "#999" };
    return (
        <Box sx={{ display: "inline-flex", backgroundColor: map[status] || "#666", px: 1.2, py: 0.3 }}>
            <Typography sx={{ fontFamily: mono, fontSize: 8, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", lineHeight: 1.5 }}>
                {status || "—"}
            </Typography>
        </Box>
    );
};

const PayStatus = ({ status }) => {
    const map = { PENDING: "#999", PAID: "#000", COMPLETED: "#000", FAILED: "#aaa" };
    const color = map[status] || "#aaa";
    return (
        <Box sx={{ display: "inline-flex", border: "1px solid", borderColor: color, px: 1, py: 0.25 }}>
            <Typography sx={{ fontFamily: mono, fontSize: 8, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color, lineHeight: 1.5 }}>
                {status || "—"}
            </Typography>
        </Box>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 2, borderBottom: "1px solid #f0f0eb", "&:last-child": { borderBottom: "none" } }}>
        <Box sx={{ width: 34, height: 34, border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon sx={{ fontSize: 14, color: "#aaa" }} />
        </Box>
        <Box>
            <MonoLabel sx={{ mb: 0.5 }}>{label}</MonoLabel>
            <Typography sx={{ fontFamily: mono, fontSize: 12, fontWeight: 500, color: "#000" }}>{value || "Not provided"}</Typography>
        </Box>
    </Box>
);

const Stat = ({ number, label, delay = 0 }) => (
    <Box sx={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", p: 3, textAlign: "center", animation: `udUp 0.4s ${delay}s ease both` }}>
        <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: 52, lineHeight: 1, color: "#000" }}>
            {String(number).padStart(2, "0")}
        </Typography>
        <MonoLabel sx={{ mt: 1 }}>{label}</MonoLabel>
    </Box>
);

/* ─── ON-SCREEN DEBUG PANEL ──────────────────────────────────── */
const DebugPanel = ({ orders }) => {
    const [open, setOpen] = useState(true);
    if (!orders?.length) return null;

    const first     = orders[0];
    const firstItem = (first.orderItems || first.items || [])[0];

  
};

/* ─── Order Card ─────────────────────────────────────────────── */
const OrderCard = ({ order, index, onProductClick }) => {
    const [open, setOpen] = useState(false);

    const items       = order.orderItems || order.items || [];
    const payment     = order.payment    || {};
    const payMethod   = order.paymentMethod  || payment.paymentMethod  || "N/A";
    const payStatus   = order.paymentStatus  || payment.paymentStatus  || "PENDING";
    const orderStatus = order.orderStatus    || order.status;
    const orderDate   = order.orderDate      || order.createdAt;
    const total       = extractTotal(order);
    const { isDelivery, label: dmLabel } = parseDelivery(order.deliveryMethod);

    return (
        <Box sx={{
            backgroundColor: "#fff", border: "1px solid #e8e8e8", mb: 2,
            animation: `udUp 0.4s ${Math.min(index * 0.06, 0.36)}s ease both`,
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:hover": { borderColor: "#000", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
        }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: { xs: 2.5, sm: 3.5 }, borderBottom: "1px solid #f0f0eb", flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <MonoLabel sx={{ mb: 0.6 }}>Order ID</MonoLabel>
                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: { xs: 24, sm: 30 }, letterSpacing: "-0.02em", lineHeight: 1, color: "#000" }}>
                        #{order.orderId}
                    </Typography>
                    {orderDate && (
                        <MonoLabel sx={{ mt: 0.8, color: "#ccc" }}>
                            {new Date(orderDate).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                        </MonoLabel>
                    )}
                </Box>
                <Box sx={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                    <OrderStatus status={orderStatus} />
                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: { xs: 22, sm: 28 }, color: "#000", lineHeight: 1 }}>
                        Rs {total.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </Typography>
                </Box>
            </Box>

            {/* Payment + Delivery */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, borderBottom: "1px solid #f0f0eb" }}>
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, borderRight: { xs: "none", sm: "1px solid #f0f0eb" }, borderBottom: { xs: "1px solid #f0f0eb", sm: "none" } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <Payment sx={{ fontSize: 13, color: "#bbb" }} />
                        <MonoLabel>Payment</MonoLabel>
                    </Box>
                    <Typography sx={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#000", mb: 1 }}>{payMethod}</Typography>
                    <PayStatus status={payStatus} />
                </Box>
               
            </Box>


            {/* Expand toggle */}
            <Box onClick={() => setOpen(!open)} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: { xs: 2, sm: 3 }, cursor: "pointer", "&:hover": { backgroundColor: "#fafafa" }, transition: "background-color 0.15s" }}>
                <MonoLabel sx={{ color: "#666" }}>{items.length} item{items.length !== 1 ? "s" : ""} — click to {open ? "hide" : "view"}</MonoLabel>
                <Box sx={{ width: 28, height: 28, border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.25s ease" }}>
                    <ExpandMore sx={{ fontSize: 16 }} />
                </Box>
            </Box>

            {/* Items */}
            <Collapse in={open} timeout="auto">
                <Box sx={{ borderTop: "1px solid #f0f0eb" }}>
                    {items.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center" }}><MonoLabel>No items found</MonoLabel></Box>
                    ) : items.map((item, idx) => {
                        const productId   = item.productId   ?? item.product?.productId;
                        const productName = item.productName ?? item.product?.productName ?? item.name ?? "Unknown Product";
                        const qty         = parseInt(item.quantity ?? item.qty ?? 1);
                        const unitPrice   = extractPrice(item);
                        const imgSrc      = extractImage(item);
                        const size        = item.size  ?? item.selectedSize  ?? item.variantSize  ?? item.variant?.size  ?? null;
                        const color       = item.color ?? item.selectedColor ?? item.variantColor ?? item.variant?.color ?? null;

                        return (
                            <Box key={item.orderItemId ?? item.id ?? idx} onClick={() => productId && onProductClick(productId)}
                                sx={{ display: "flex", gap: { xs: 1.5, sm: 2.5 }, p: { xs: 2, sm: 3 }, borderBottom: idx < items.length - 1 ? "1px solid #f0f0eb" : "none", cursor: productId ? "pointer" : "default", "&:hover": productId ? { backgroundColor: "#fafafa" } : {}, transition: "background-color 0.15s" }}>

                                {/* Image */}
                                <Box sx={{ width: { xs: 72, sm: 88 }, height: { xs: 72, sm: 88 }, flexShrink: 0, border: "1px solid #e8e8e8", overflow: "hidden", position: "relative", backgroundColor: "#f5f5f0" }}>
                                    {imgSrc ? (
                                        <Box component="img" src={imgSrc} alt={productName}
                                            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                const fb = e.target.parentElement.querySelector(".ud-fb");
                                                if (fb) fb.style.display = "flex";
                                            }}
                                        />
                                    ) : null}
                                    <Box className="ud-fb" sx={{ display: imgSrc ? "none" : "flex", position: imgSrc ? "absolute" : "static", inset: 0, width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                                        <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: 32, color: "rgba(0,0,0,0.12)" }}>
                                            {productName.charAt(0).toUpperCase()}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontFamily: mono, fontWeight: 600, fontSize: { xs: 10, sm: 11 }, letterSpacing: "0.05em", textTransform: "uppercase", color: "#000", mb: 0.7, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                        {productName}
                                    </Typography>
                                    {(color || size) && (
                                        <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap", mb: 0.8 }}>
                                            {color && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, border: "1px solid #e8e8e8", px: 0.8, py: 0.2 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, backgroundColor: ["white","beige","cream","ivory"].includes(color.toLowerCase()) ? "#ebebeb" : color.toLowerCase(), border: "1px solid rgba(0,0,0,0.1)" }} />
                                                    <MonoLabel sx={{ color: "#888" }}>{color}</MonoLabel>
                                                </Box>
                                            )}
                                            {size && (
                                                <Box sx={{ border: "1px solid #e8e8e8", px: 0.8, py: 0.2 }}>
                                                    <MonoLabel sx={{ color: "#888" }}>Size: {size}</MonoLabel>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                    <MonoLabel sx={{ color: "#bbb" }}>{qty} × Rs {unitPrice.toFixed(2)}</MonoLabel>
                                </Box>

                                {/* Total */}
                                <Box sx={{ flexShrink: 0, textAlign: "right" }}>
                                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: { xs: 14, sm: 17 }, color: "#000" }}>
                                        Rs {(unitPrice * qty).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}

                    {isDelivery && (order.street || order.city) && (
                        <Box sx={{ m: { xs: 2, sm: 3 }, mt: 0, p: { xs: 2, sm: 2.5 }, border: "1px solid #e8e8e8", backgroundColor: "#fafafa" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                <LocationOn sx={{ fontSize: 12, color: "#bbb" }} />
                                <MonoLabel>Delivery Address</MonoLabel>
                            </Box>
                            <Typography sx={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#000", mb: 0.4 }}>{order.firstName} {order.lastName}</Typography>
                            <Typography sx={{ fontFamily: mono, fontSize: 11, color: "#666", lineHeight: 1.7 }}>
                                {order.street}{order.apartment && `, ${order.apartment}`}<br />
                                {order.city}{order.postal && `, ${order.postal}`}
                            </Typography>
                            {order.phoneNumber && <Typography sx={{ fontFamily: mono, fontSize: 11, color: "#aaa", mt: 0.5 }}>{order.phoneNumber}</Typography>}
                        </Box>
                    )}
                    {order.orderNote && (
                        <Box sx={{ mx: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, p: { xs: 2, sm: 2.5 }, border: "1px solid #e8e8e8" }}>
                            <MonoLabel sx={{ mb: 1 }}>Order Note</MonoLabel>
                            <Typography sx={{ fontFamily: mono, fontSize: 11, color: "#666" }}>{order.orderNote}</Typography>
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

/* ─── Main ───────────────────────────────────────────────────── */
const UserDashboard = () => {
    const navigate   = useNavigate();
    const [tab,      setTab]      = useState(0);
    const [loading,  setLoading]  = useState(true);
    const [customer, setCustomer] = useState(null);
    const [orders,   setOrders]   = useState([]);
    const [error,    setError]    = useState(null);

    useEffect(() => {
        const user = getUser();
        if (!user?.customerId) { navigate("/login"); return; }
        loadData();
    }, []);

    const loadData = async () => {
        const user = getUser();
        try {
            const [cRes, oRes] = await Promise.all([
                axios.get(`${API}/api/customers/${user.customerId}`,       { headers: getHeaders() }),
                axios.get(`${API}/api/orders/customer/${user.customerId}`, { headers: getHeaders() }),
            ]);
            setCustomer(cRes.data);
            setOrders(oRes.data);
        } catch (e) {
            console.error(e);
            setError("Failed to load your information. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>
            <Navbar />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
                <Box sx={{ textAlign: "center" }}>
                    <Box sx={{ width: 34, height: 34, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", mx: "auto", mb: 2, animation: "udSpin 0.7s linear infinite" }} />
                    <MonoLabel>Loading account...</MonoLabel>
                </Box>
            </Box>
        </Box>
    );

    if (error) return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>
            <Navbar />
            <Container maxWidth="md" sx={{ pt: 6 }}>
                <Box sx={{ border: "1px solid #e0e0e0", backgroundColor: "#fff", p: 5, textAlign: "center" }}>
                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: 20, mb: 1 }}>Something went wrong</Typography>
                    <MonoLabel>{error}</MonoLabel>
                </Box>
            </Container>
        </Box>
    );

    const delivered    = orders.filter(o => o.orderStatus === "DELIVERED").length;
    const inProgress   = orders.filter(o => ["PENDING","PROCESSING"].includes(o.orderStatus)).length;
    const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0", fontFamily: mono }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ pt: 5, pb: 12 }}>

                {/* Page header */}
                <Box sx={{ borderBottom: "2px solid #000", pb: 3, mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2, animation: "udUp 0.4s ease both" }}>
                    <Box>
                        <MonoLabel sx={{ mb: 0.8 }}>Welcome back</MonoLabel>
                        <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: { xs: 38, md: 56 }, letterSpacing: "-0.03em", lineHeight: 0.9, color: "#000" }}>
                            My Dashboard
                        </Typography>
                    </Box>
                    {customer && (
                        <Box sx={{ border: "1px solid #000", px: 2.5, py: 1.2, display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 36, height: 36, backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: "#fff" }}>
                                    {customer.customerName?.charAt(0).toUpperCase()}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#000" }}>{customer.customerName}</Typography>
                                <MonoLabel sx={{ color: "#bbb" }}>ID #{customer.customerId}</MonoLabel>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Tabs */}
                <Box sx={{ display: "flex", mb: 5, borderBottom: "1px solid #e0e0e0", animation: "udUp 0.4s 0.05s ease both" }}>
                    {[{ label: "Profile", Icon: Person }, { label: "Order History", Icon: ShoppingBag }].map(({ label, Icon }, i) => (
                        <Box key={label} onClick={() => setTab(i)} sx={{ display: "flex", alignItems: "center", gap: 1, px: { xs: 2, sm: 3.5 }, py: 2, cursor: "pointer", borderBottom: "2px solid", borderColor: tab === i ? "#000" : "transparent", mb: "-1px", transition: "border-color 0.15s", "&:hover": { borderColor: tab === i ? "#000" : "#ccc" } }}>
                            <Icon sx={{ fontSize: 14, color: tab === i ? "#000" : "#ccc" }} />
                            <Typography sx={{ fontFamily: mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: tab === i ? "#000" : "#ccc" }}>{label}</Typography>
                            {label === "Order History" && orders.length > 0 && (
                                <Box sx={{ backgroundColor: tab === i ? "#000" : "#e0e0e0", width: 18, height: 18, ml: 0.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography sx={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: tab === i ? "#fff" : "#888" }}>{orders.length}</Typography>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>

                {/* Profile tab */}
                {tab === 0 && (
                    <Box sx={{ animation: "udUp 0.35s ease both" }}>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={4}><Stat number={orders.length} label="Total Orders" delay={0} /></Grid>
                            <Grid item xs={12} sm={4}><Stat number={delivered}     label="Delivered"    delay={0.06} /></Grid>
                            <Grid item xs={12} sm={4}><Stat number={inProgress}    label="In Progress"  delay={0.12} /></Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <Box sx={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", p: { xs: 2.5, sm: 4 } }}>
                                    <SectionBar title="Contact Information" />
                                    <InfoRow icon={Person}    label="Full Name" value={customer?.customerName} />
                                    <InfoRow icon={Email}     label="Email"     value={customer?.email} />
                                    <InfoRow icon={Phone}     label="Phone"     value={customer?.phoneNumber} />
                                     </Box>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Box sx={{ backgroundColor: "#000", p: 5, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 220 }}>
                                    <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: 80, lineHeight: 1, color: "#fff", userSelect: "none" }}>
                                        {customer?.customerName?.charAt(0).toUpperCase() || "?"}
                                    </Typography>
                                    <Typography sx={{ fontFamily: mono, fontSize: 14, fontWeight: 600, color: "#fff", mt: 2 }}>{customer?.customerName}</Typography>
                                    <MonoLabel sx={{ color: "rgba(255,255,255,0.3)", mt: 0.5 }}>Customer #{customer?.customerId}</MonoLabel>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Orders tab */}
                {tab === 1 && (
                    <Box sx={{ animation: "udUp 0.35s ease both" }}>
                        {/* ← RED DEBUG PANEL — shows raw backend data on screen */}
                        <DebugPanel orders={sortedOrders} />

                        {sortedOrders.length === 0 ? (
                            <Box sx={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", p: { xs: 6, md: 10 }, textAlign: "center" }}>
                                <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: { xs: 72, md: 120 }, color: "rgba(0,0,0,0.04)", lineHeight: 1, userSelect: "none", mb: 4 }}>Orders</Typography>
                                <Box sx={{ width: 56, height: 56, border: "2px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                                    <ShoppingBag sx={{ fontSize: 24, color: "#ccc" }} />
                                </Box>
                                <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: "#000", mb: 1 }}>No orders yet</Typography>
                                <MonoLabel sx={{ mb: 5 }}>Start shopping to see your orders here</MonoLabel>
                                <Box onClick={() => navigate("/")} sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, backgroundColor: "#000", px: 4, py: 1.6, cursor: "pointer", "&:hover": { backgroundColor: "#222" }, transition: "background-color 0.15s" }}>
                                    <Typography sx={{ fontFamily: mono, fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>Start Shopping</Typography>
                                    <ArrowForward sx={{ fontSize: 14, color: "#fff" }} />
                                </Box>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 3 }}>
                                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: 24, color: "#000" }}>
                                        {sortedOrders.length} Order{sortedOrders.length !== 1 ? "s" : ""}
                                    </Typography>
                                    <MonoLabel>Most recent first</MonoLabel>
                                </Box>
                                {sortedOrders.map((order, idx) => (
                                    <OrderCard key={order.orderId} order={order} index={idx} onProductClick={(pid) => navigate(`/product/${pid}`)} />
                                ))}
                            </>
                        )}
                    </Box>
                )}
            </Container>

            <Box sx={{ borderTop: "1px solid #e0e0e0", backgroundColor: "#fff", py: 2.5, px: { xs: 3, md: 6 }, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <MonoLabel>© {new Date().getFullYear()} CLOTHIFY — All Rights Reserved</MonoLabel>
                <Box onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer", "&:hover": { opacity: 0.6 }, transition: "opacity 0.15s" }}>
                    <ArrowBack sx={{ fontSize: 11, color: "#bbb" }} />
                    <MonoLabel>Home</MonoLabel>
                </Box>
            </Box>
        </Box>
    );
};

export default UserDashboard;