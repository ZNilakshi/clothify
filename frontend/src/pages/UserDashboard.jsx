import {
    Box,
    Typography,
    Collapse,
} from "@mui/material";
import {
    Person,
    Email,
    Phone,
    LocationOn,
    ShoppingBag,
    ArrowForward,
    ArrowBack,
    ExpandMore,
    CheckCircleOutline,
    RadioButtonUnchecked,
    HourglassEmpty,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import authService from "../services/authService";
import axios from "axios";

/* ─── Config ─────────────────────────────────────────────────── */
const API = "http://localhost:8080";
const getUser    = () => authService.getCurrentUser();
const getHeaders = () => { const u = getUser(); return u?.token ? { Authorization: `Bearer ${u.token}` } : {}; };

const resolveImg = (url) => {
    if (!url) return null;
    const s = String(url).trim();
    if (!s) return null;
    if (s.startsWith("http")) return s;
    return `${API}${s.startsWith("/") ? s : `/${s}`}`;
};

const extractImage = (obj) => {
    if (!obj) return null;
    const fields = ["imageUrl","image","productImage","product_image","img","thumbnail","photo","pictureUrl","picture","coverImage","itemImage","itemImageUrl"];
    for (const f of fields) { const r = resolveImg(obj[f]); if (r) return r; }
    if (obj.product) {
        for (const f of fields) { const r = resolveImg(obj.product[f]); if (r) return r; }
    }
    return null;
};

const extractPrice = (item) => {
    for (const f of ["unitPrice","unit_price","price","itemPrice","sellingPrice","salePrice"]) {
        const n = parseFloat(item[f] ?? item.product?.[f]);
        if (!isNaN(n) && n > 0) return n;
    }
    return 0;
};

const extractTotal = (order) => {
    for (const f of ["totalAmount","total","orderTotal","grandTotal","amount","totalPrice"]) {
        const n = parseFloat(order[f]);
        if (!isNaN(n) && n >= 0) return n;
    }
    return 0;
};

const parseDelivery = (raw = "") => {
    const s = String(raw).toLowerCase().replace(/[_-]/g, " ").trim();
    if (!s || ["n/a","null","undefined"].includes(s)) return { isDelivery: false, label: raw || "N/A" };
    if (s.includes("deliver") || s === "home") return { isDelivery: true,  label: "Home Delivery" };
    if (s.includes("pickup") || s.includes("store"))  return { isDelivery: false, label: "Store Pickup" };
    return { isDelivery: false, label: raw };
};

/* ─── Fonts & Styles ─────────────────────────────────────────── */
if (!document.head.querySelector('link[href*="Fraunces"]')) {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,700;1,9..144,900&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#ud7")) {
    const s = document.createElement("style");
    s.id = "ud7";
    s.textContent = `
        @keyframes udFadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes udSlideIn  { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes udSpin     { to{transform:rotate(360deg)} }
        @keyframes udPulse    { 0%,100%{opacity:1} 50%{opacity:.35} }

        .ud7-nav {
            display:flex; align-items:center; gap:12px; padding:13px 22px;
            cursor:pointer; border-left:3px solid transparent;
            transition:background .15s,border-color .15s; user-select:none;
        }
        .ud7-nav:hover  { background:rgba(255,255,255,.05); border-left-color:rgba(255,255,255,.25); }
        .ud7-nav.active { background:rgba(255,255,255,.1);  border-left-color:#f8f8f6; }

        .ud7-card {
            background:#fff; border:1px solid #e8e8e4; margin-bottom:14px;
            transition:border-color .2s,box-shadow .2s,transform .18s;
        }
        .ud7-card:hover { border-color:#0a0a0a; box-shadow:0 8px 28px rgba(0,0,0,.09); transform:translateY(-1px); }

        .ud7-toggle {
            display:flex; align-items:center; justify-content:space-between;
            padding:13px 22px; cursor:pointer; transition:background .15s;
        }
        .ud7-toggle:hover { background:#f9f9f7; }

        .ud7-chevron {
            width:28px; height:28px; border:1px solid #e0e0e0;
            display:flex; align-items:center; justify-content:center;
            transition:transform .24s,background .15s,border-color .15s;
        }
        .ud7-chevron.open { transform:rotate(180deg); background:#0a0a0a; border-color:#0a0a0a; }
        .ud7-chevron.open svg { color:#fff !important; }

        .ud7-item {
            display:grid; grid-template-columns:82px 1fr auto;
            gap:16px; align-items:center;
            padding:15px 22px; border-top:1px solid #f2f2f0;
            transition:background .15s;
        }
        .ud7-item.link { cursor:pointer; }
        .ud7-item.link:hover { background:#fafaf8; }

        .ud7-badge {
            display:inline-flex; align-items:center; gap:5px;
            padding:3px 9px; font-family:'Space Mono',monospace;
            font-size:8px; font-weight:700; letter-spacing:.11em;
            text-transform:uppercase; line-height:1.5;
        }

        .ud7-stat {
            background:#fff; border:1px solid #e8e8e4;
            padding:22px 18px; position:relative; overflow:hidden;
            transition:border-color .2s,box-shadow .18s;
        }
        .ud7-stat:hover { border-color:#0a0a0a; box-shadow:0 4px 14px rgba(0,0,0,.07); }
        .ud7-stat .ghost {
            position:absolute; bottom:-12px; right:-2px;
            font-family:'Fraunces',serif; font-weight:900; font-style:italic;
            font-size:78px; line-height:1; color:rgba(0,0,0,.04);
            user-select:none; pointer-events:none;
        }

        .ud7-cta {
            display:inline-flex; align-items:center; gap:10px;
            padding:13px 28px; background:#0a0a0a; color:#fff;
            font-family:'Space Mono',monospace; font-size:10px;
            font-weight:700; letter-spacing:.11em; text-transform:uppercase;
            cursor:pointer; border:2px solid #0a0a0a;
            transition:background .18s,color .18s;
        }
        .ud7-cta:hover { background:#fff; color:#0a0a0a; }

        .ud7-img {
            position:relative; overflow:hidden;
            background:#f4f4f2; border:1px solid #eaeae8; flex-shrink:0;
        }
        .ud7-img img {
            position:absolute; inset:0; width:100%; height:100%;
            object-fit:cover; display:block; z-index:1;
        }
        .ud7-img-fb {
            position:absolute; inset:0; display:flex;
            align-items:center; justify-content:center; z-index:0;
        }

        .ud7-scroll::-webkit-scrollbar { width:4px; }
        .ud7-scroll::-webkit-scrollbar-track { background:transparent; }
        .ud7-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,.12); border-radius:2px; }
    `;
    document.head.appendChild(s);
}

/* ─── Tokens ─────────────────────────────────────────────────── */
const serif = "'Fraunces',serif";
const mono  = "'Space Mono',monospace";

const COLOR_HEX = {
    BLACK:"#000",WHITE:"#FFF",RED:"#EF4444",BLUE:"#3B82F6",GREEN:"#22C55E",
    YELLOW:"#EAB308",PURPLE:"#A855F7",PINK:"#EC4899",ORANGE:"#F97316",
    GRAY:"#6B7280",GREY:"#6B7280",BROWN:"#92400E",NAVY:"#1E3A5F",
    BEIGE:"#D4A76A",CREAM:"#FFFDD0",TEAL:"#008080",GOLD:"#FFD700",
    SILVER:"#C0C0C0",MAROON:"#800000",
};
const LIGHT_COLORS = new Set(["WHITE","IVORY","CREAM","BEIGE","YELLOW","SILVER","GOLD"]);

const Mono = ({ children, sx = {} }) => (
    <Typography sx={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: ".13em", textTransform: "uppercase", color: "#999", lineHeight: 1.4, ...sx }}>
        {children}
    </Typography>
);

const STATUS_CFG = {
    PENDING:    { bg: "#f0f0ee", color: "#777",  label: "Pending"    },
    PROCESSING: { bg: "#dededc", color: "#333",  label: "Processing" },
    SHIPPED:    { bg: "#1a1a1a", color: "#fff",  label: "Shipped"    },
    DELIVERED:  { bg: "#0a0a0a", color: "#fff",  label: "Delivered"  },
    CANCELLED:  { bg: "#f5f5f5", color: "#bbb",  label: "Cancelled"  },
};
const PAY_CFG = {
    PENDING:   { border: "#ddd",    color: "#aaa"    },
    PAID:      { border: "#0a0a0a", color: "#0a0a0a" },
    COMPLETED: { border: "#0a0a0a", color: "#0a0a0a" },
    FAILED:    { border: "#ccc",    color: "#ccc"    },
};

const StatusIcon = ({ status }) => {
    if (status === "DELIVERED") return <CheckCircleOutline sx={{ fontSize: 10 }} />;
    if (status === "CANCELLED") return <RadioButtonUnchecked sx={{ fontSize: 10 }} />;
    return <HourglassEmpty sx={{ fontSize: 10 }} />;
};

/* ═══════════════════════════════════════════════════════════════
   ORDER ITEM ROW
   Fetches /api/products/{productId} to get image + color + size
   since the backend order-item DTO only returns the bare minimum.
   ═══════════════════════════════════════════════════════════════ */
const OrderItemRow = ({ item, onProductClick }) => {
    const productId   = item.productId   ?? item.product?.productId;
    const productName = item.productName ?? item.product?.productName ?? item.name ?? "Unknown";
    const qty         = parseInt(item.quantity ?? item.qty ?? 1);
    const unitPrice   = extractPrice(item);
    const initial     = productName.charAt(0).toUpperCase();

    // Optimistically try inline fields first
    const [imgSrc,  setImgSrc]  = useState(() => extractImage(item));
    const [imgFail, setImgFail] = useState(false);
    const [color,   setColor]   = useState(
        item.color ?? item.selectedColor ?? item.variantColor ??
        item.colorName ?? item.variant?.color ?? null
    );
    const [size, setSize] = useState(
        item.size ?? item.selectedSize ?? item.variantSize ??
        item.sizeName ?? item.variant?.size ?? null
    );

    useEffect(() => {
        if (!productId) return;
        // Only fetch if we're missing at least something
        if (imgSrc && color && size) return;

        axios.get(`${API}/api/products/${productId}`, { headers: getHeaders() })
            .then(({ data: p }) => {
                // Image
                if (!imgSrc) {
                    const r = extractImage(p);
                    if (r) setImgSrc(r);
                }
                // Color
                if (!color) {
                    const c = p?.color ?? p?.selectedColor ?? p?.defaultColor
                           ?? p?.colorName ?? p?.variants?.[0]?.color ?? null;
                    if (c) setColor(c);
                }
                // Size
                if (!size) {
                    const s = p?.size ?? p?.selectedSize ?? p?.defaultSize
                           ?? p?.sizeName ?? p?.variants?.[0]?.size ?? null;
                    if (s) setSize(s);
                }
            })
            .catch(() => {});
    }, [productId]);

    const colorKey  = color ? color.trim().toUpperCase() : null;
    const colorHex  = colorKey ? (COLOR_HEX[colorKey] ?? null) : null;
    const isLight   = colorKey ? LIGHT_COLORS.has(colorKey) : false;

    return (
        <Box
            className={`ud7-item${productId ? " link" : ""}`}
            onClick={() => productId && onProductClick(productId)}
        >
            {/* Image */}
            <Box className="ud7-img" sx={{ width: 82, height: 96 }}>
                <Box className="ud7-img-fb">
                    <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: 32, color: "rgba(0,0,0,.08)", lineHeight: 1 }}>
                        {initial}
                    </Typography>
                </Box>
                {imgSrc && !imgFail && (
                    <img src={imgSrc} alt={productName} onError={() => setImgFail(true)} />
                )}
            </Box>

            {/* Info */}
            <Box>
                <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: 14, sm: 15 }, color: "#0a0a0a", lineHeight: 1.3, mb: .7 }}>
                    {productName}
                </Typography>

                {/* Color + Size chips */}
                <Box sx={{ display: "flex", gap: .6, flexWrap: "wrap", mb: .8, minHeight: 20 }}>
                    {color && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: .6, border: "1px solid #e8e8e8", px: "8px", py: "3px", background: "#fafafa" }}>
                            <Box sx={{
                                width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                                background: colorHex ?? color.toLowerCase(),
                                border: isLight ? "1.5px solid #c0c0c0" : "1px solid rgba(0,0,0,.12)",
                            }} />
                            <Mono sx={{ color: "#444", fontSize: 8 }}>{color}</Mono>
                        </Box>
                    )}
                    {size && (
                        <Box sx={{ background: "#0a0a0a", px: "10px", py: "3px" }}>
                            <Mono sx={{ color: "#fff", fontSize: 8 }}>{size}</Mono>
                        </Box>
                    )}
                    {!color && !size && (
                        <Mono sx={{ color: "#ddd", fontSize: 8 }}>—</Mono>
                    )}
                </Box>

                <Mono sx={{ color: "#bbb" }}>{qty} × Rs {unitPrice.toFixed(2)}</Mono>
            </Box>

            {/* Line total */}
            <Typography sx={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: { xs: 14, sm: 17 }, color: "#0a0a0a", whiteSpace: "nowrap" }}>
                Rs {(unitPrice * qty).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </Typography>
        </Box>
    );
};

/* ═══════════════════════════════════════════════════════════════
   ORDER CARD
   ═══════════════════════════════════════════════════════════════ */
const OrderCard = ({ order, index, onProductClick }) => {
    const [open, setOpen] = useState(false);

    const items       = order.orderItems || order.items || [];
    const payment     = order.payment || {};
    const payMethod   = order.paymentMethod || payment.paymentMethod || "N/A";
    const payStatus   = order.paymentStatus || payment.paymentStatus || "PENDING";
    const orderStatus = order.orderStatus   || order.status;
    const orderDate   = order.orderDate     || order.createdAt;
    const total       = extractTotal(order);
    const { isDelivery, label: dmLabel } = parseDelivery(order.deliveryMethod);

    const sc = STATUS_CFG[orderStatus] || { bg: "#e8e8e8", color: "#555", label: orderStatus };
    const pc = PAY_CFG[payStatus]      || { border: "#ccc", color: "#aaa" };
    const isDark = sc.bg === "#0a0a0a" || sc.bg === "#1a1a1a";

    return (
        <Box className="ud7-card" sx={{ animation: `udFadeUp .34s ${Math.min(index * .07, .4)}s ease both` }}>

            {/* Top accent stripe */}
            <Box sx={{ height: 3, background: isDark ? "#0a0a0a" : "#e8e8e4" }} />

            {/* Header */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr auto" }, gap: 2, p: "18px 22px 15px", borderBottom: "1px solid #f2f2f0" }}>
                <Box>
                    <Mono sx={{ mb: .5, color: "#ccc" }}>Order ID</Mono>
                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: { xs: 22, sm: 27 }, letterSpacing: "-.02em", lineHeight: 1, color: "#0a0a0a" }}>
                        #{order.orderId}
                    </Typography>
                    {orderDate && (
                        <Mono sx={{ mt: .7, color: "#bbb" }}>
                            {new Date(orderDate).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })}
                        </Mono>
                    )}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", sm: "flex-end" }, gap: 1 }}>
                    <Box className="ud7-badge" sx={{ background: sc.bg, color: sc.color }}>
                        <StatusIcon status={orderStatus} />
                        {sc.label}
                    </Box>
                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: { xs: 19, sm: 25 }, color: "#0a0a0a", lineHeight: 1 }}>
                        Rs {total.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </Typography>
                </Box>
            </Box>

            {/* Meta strip */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f2f2f0" }}>
                <Box sx={{ p: "11px 22px", borderRight: "1px solid #f2f2f0" }}>
                    <Mono sx={{ mb: .6 }}>Payment</Mono>
                    <Typography sx={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#0a0a0a", mb: .6 }}>{payMethod}</Typography>
                    <Box className="ud7-badge" sx={{ border: `1.5px solid ${pc.border}`, color: pc.color, background: "transparent" }}>
                        {payStatus}
                    </Box>
                </Box>
                <Box sx={{ p: "11px 22px" }}>
                    <Mono sx={{ mb: .6 }}>Fulfilment</Mono>
                    <Typography sx={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#0a0a0a" }}>{dmLabel}</Typography>
                </Box>
            </Box>

            {/* Toggle */}
            <Box className="ud7-toggle" onClick={() => setOpen(!open)}>
                <Mono sx={{ color: "#aaa" }}>{items.length} item{items.length !== 1 ? "s" : ""} — {open ? "hide" : "view"} details</Mono>
                <Box className={`ud7-chevron${open ? " open" : ""}`}>
                    <ExpandMore sx={{ fontSize: 14, color: "#888" }} />
                </Box>
            </Box>

            {/* Expanded items */}
            <Collapse in={open} timeout="auto">
                <Box>
                    {items.length === 0 && (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                            <Mono sx={{ color: "#ccc" }}>No items in this order</Mono>
                        </Box>
                    )}
                    {items.map((item, idx) => (
                        <OrderItemRow
                            key={item.orderItemId ?? item.id ?? idx}
                            item={item}
                            onProductClick={onProductClick}
                        />
                    ))}

                    {/* Delivery address */}
                    {isDelivery && (order.street || order.city) && (
                        <Box sx={{ m: "0 22px 18px", p: "14px 18px", border: "1px solid #e8e8e8", background: "#fafaf8" }}>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1.2 }}>
                                <LocationOn sx={{ fontSize: 12, color: "#bbb" }} />
                                <Mono sx={{ color: "#aaa" }}>Delivery Address</Mono>
                            </Box>
                            <Typography sx={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#0a0a0a", mb: .4 }}>
                                {order.firstName} {order.lastName}
                            </Typography>
                            <Typography sx={{ fontFamily: mono, fontSize: 10, color: "#666", lineHeight: 1.8 }}>
                                {order.street}{order.apartment && `, ${order.apartment}`}<br />
                                {order.city}{order.postal && `, ${order.postal}`}
                            </Typography>
                        </Box>
                    )}

                    {order.orderNote && (
                        <Box sx={{ mx: "22px", mb: "18px", p: "13px 18px", border: "1px dashed #e0e0e0" }}>
                            <Mono sx={{ display: "block", mb: 1, color: "#bbb" }}>Order Note</Mono>
                            <Typography sx={{ fontFamily: mono, fontSize: 11, color: "#555", lineHeight: 1.7 }}>{order.orderNote}</Typography>
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const UserDashboard = () => {
    const navigate = useNavigate();
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
            setOrders(Array.isArray(oRes.data) ? oRes.data : []);
        } catch (e) {
            console.error(e);
            setError("Failed to load your information. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* Loading */
    if (loading) return (
        <Box sx={{ minHeight: "100vh", background: "#f8f8f6" }}>
            <Navbar />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", flexDirection: "column", gap: 2 }}>
                <Box sx={{ width: 22, height: 22, border: "2.5px solid #0a0a0a", borderTopColor: "transparent", borderRadius: "50%", animation: "udSpin .65s linear infinite" }} />
                <Mono sx={{ animation: "udPulse 1.5s ease infinite" }}>Loading account…</Mono>
            </Box>
        </Box>
    );

    /* Error */
    if (error) return (
        <Box sx={{ minHeight: "100vh", background: "#f8f8f6" }}>
            <Navbar />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", px: 3 }}>
                <Box sx={{ background: "#fff", border: "1px solid #e0e0e0", p: 6, maxWidth: 420, width: "100%", textAlign: "center" }}>
                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: "#0a0a0a", mb: 1.5 }}>Something went wrong</Typography>
                    <Mono sx={{ display: "block", mb: 4 }}>{error}</Mono>
                    <Box onClick={() => navigate("/")} className="ud7-cta">Go Home <ArrowForward sx={{ fontSize: 13 }} /></Box>
                </Box>
            </Box>
        </Box>
    );

    const delivered    = orders.filter(o => o.orderStatus === "DELIVERED").length;
    const inProgress   = orders.filter(o => ["PENDING","PROCESSING","SHIPPED"].includes(o.orderStatus)).length;
    const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));
    const initials     = customer?.customerName?.charAt(0).toUpperCase() || "?";

    return (
        <Box sx={{ minHeight: "100vh", background: "#f8f8f6" }}>
            <Navbar />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "268px 1fr" }, minHeight: "calc(100vh - 64px)" }}>

                {/* ════════ SIDEBAR ════════ */}
                <Box className="ud7-scroll" sx={{
                    background: "#0a0a0a", display: "flex", flexDirection: "column",
                    position: { md: "sticky" }, top: 0,
                    height: { md: "calc(100vh - 64px)" }, overflowY: "auto",
                    animation: "udSlideIn .4s ease both",
                }}>
                    {/* Profile */}
                    <Box sx={{ p: "34px 22px 26px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                        <Box sx={{ position: "relative", width: 66, height: 66, mb: 2.5 }}>
                            <Box sx={{ width: 66, height: 66, border: "1.5px solid rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: 32, color: "#fff", lineHeight: 1 }}>
                                    {initials}
                                </Typography>
                            </Box>
                            {/* Corner pip */}
                            <Box sx={{ position: "absolute", top: -2, right: -2, width: 9, height: 9, background: "#f8f8f6" }} />
                        </Box>
                        <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: "#fff", lineHeight: 1.25, mb: .5 }}>
                            {customer?.customerName}
                        </Typography>
                        <Mono sx={{ color: "rgba(255,255,255,.26)", mb: .6 }}>ID #{customer?.customerId}</Mono>
                        {customer?.email && (
                            <Typography sx={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,.2)", wordBreak: "break-all", lineHeight: 1.6 }}>
                                {customer.email}
                            </Typography>
                        )}
                    </Box>

                    {/* Stats */}
                    <Box sx={{ p: "16px 22px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                        <Mono sx={{ color: "rgba(255,255,255,.2)", display: "block", mb: 1.4 }}>Overview</Mono>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
                            {[{ n: orders.length, l: "Total" }, { n: delivered, l: "Done" }, { n: inProgress, l: "Active" }].map(({ n, l }) => (
                                <Box key={l} sx={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.07)", p: "9px 6px", textAlign: "center" }}>
                                    <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: 23, color: "#fff", lineHeight: 1 }}>{n}</Typography>
                                    <Mono sx={{ color: "rgba(255,255,255,.26)", fontSize: 7, mt: .3 }}>{l}</Mono>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Nav */}
                    <Box sx={{ py: 1, flex: 1 }}>
                        <Mono sx={{ color: "rgba(255,255,255,.18)", px: "22px", mb: .4, display: "block" }}>Menu</Mono>
                        {[
                            { label: "Profile",       Icon: Person,      t: 0 },
                            { label: "Order History", Icon: ShoppingBag, t: 1, count: orders.length },
                        ].map(({ label, Icon, t, count }) => (
                            <Box key={label} className={`ud7-nav${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                                <Icon sx={{ fontSize: 13, color: tab === t ? "#fff" : "rgba(255,255,255,.28)", transition: "color .15s" }} />
                                <Typography sx={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: tab === t ? "#fff" : "rgba(255,255,255,.28)", flex: 1, transition: "color .15s" }}>
                                    {label}
                                </Typography>
                                {count !== undefined && count > 0 && (
                                    <Box sx={{ background: tab === t ? "rgba(255,255,255,.17)" : "rgba(255,255,255,.07)", px: 1, py: .25 }}>
                                        <Mono sx={{ color: tab === t ? "#fff" : "rgba(255,255,255,.28)", fontSize: 7 }}>{count}</Mono>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>

                    {/* Back to shop */}
                    <Box onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 1, p: "16px 22px", borderTop: "1px solid rgba(255,255,255,.06)", cursor: "pointer", "&:hover": { background: "rgba(255,255,255,.04)" }, transition: "background .15s" }}>
                        <ArrowBack sx={{ fontSize: 11, color: "rgba(255,255,255,.2)" }} />
                        <Mono sx={{ color: "rgba(255,255,255,.2)" }}>Back to Shop</Mono>
                    </Box>
                </Box>

                {/* ════════ CONTENT ════════ */}
                <Box sx={{ p: { xs: "22px 14px", md: "42px 42px 80px" } }}>

                    {/* ── PROFILE TAB ── */}
                    {tab === 0 && (
                        <Box sx={{ animation: "udFadeUp .34s ease both" }}>
                            <Box sx={{ mb: 5 }}>
                                <Mono sx={{ display: "block", mb: 1, color: "#bbb" }}>— Account</Mono>
                                <Typography sx={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: { xs: 33, md: 46 }, letterSpacing: "-.025em", lineHeight: .93, color: "#0a0a0a" }}>
                                    Your Profile
                                </Typography>
                            </Box>

                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 2, mb: 5 }}>
                                {[
                                    { n: orders.length, l: "Orders placed", d: 0    },
                                    { n: delivered,     l: "Delivered",      d: .07  },
                                    { n: inProgress,    l: "In progress",    d: .14  },
                                ].map(({ n, l, d }) => (
                                    <Box key={l} className="ud7-stat" sx={{ animation: `udFadeUp .34s ${d}s ease both` }}>
                                        <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: { xs: 44, md: 56 }, lineHeight: 1, color: "#0a0a0a", mb: .5 }}>
                                            {String(n).padStart(2, "0")}
                                        </Typography>
                                        <Mono>{l}</Mono>
                                        <span className="ghost">{String(n).padStart(2, "0")}</span>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ background: "#fff", border: "1px solid #e8e8e4" }}>
                                <Box sx={{ borderBottom: "2px solid #0a0a0a", px: 3, py: 2.5 }}>
                                    <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: "#0a0a0a" }}>Contact Information</Typography>
                                </Box>
                                {[
                                    { Icon: Person, label: "Full Name", value: customer?.customerName },
                                    { Icon: Email,  label: "Email",     value: customer?.email         },
                                    { Icon: Phone,  label: "Phone",     value: customer?.phoneNumber   },
                                ].map(({ Icon, label, value }, i, arr) => (
                                    <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 2.5, px: 3, py: 2.5, borderBottom: i < arr.length - 1 ? "1px solid #f2f2f0" : "none" }}>
                                        <Box sx={{ width: 40, height: 40, border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fafaf8" }}>
                                            <Icon sx={{ fontSize: 14, color: "#bbb" }} />
                                        </Box>
                                        <Box>
                                            <Mono sx={{ display: "block", mb: .5 }}>{label}</Mono>
                                            <Typography sx={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: "#0a0a0a" }}>
                                                {value || "Not provided"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ── ORDERS TAB ── */}
                    {tab === 1 && (
                        <Box sx={{ animation: "udFadeUp .34s ease both" }}>
                            <Box sx={{ mb: 5 }}>
                                <Mono sx={{ display: "block", mb: 1, color: "#bbb" }}>— History</Mono>
                                <Typography sx={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: { xs: 33, md: 46 }, letterSpacing: "-.025em", lineHeight: .93, color: "#0a0a0a" }}>
                                    Your Orders
                                </Typography>
                            </Box>

                            {sortedOrders.length === 0 ? (
                                <Box sx={{ background: "#fff", border: "1px solid #e8e8e4", p: { xs: 6, md: 10 }, textAlign: "center", position: "relative", overflow: "hidden" }}>
                                    <Typography sx={{ fontFamily: serif, fontWeight: 900, fontStyle: "italic", fontSize: { xs: 80, md: 128 }, color: "rgba(0,0,0,.03)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none", lineHeight: 1 }}>
                                        Empty
                                    </Typography>
                                    <Box sx={{ position: "relative", zIndex: 1 }}>
                                        <Box sx={{ width: 54, height: 54, border: "1.5px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                                            <ShoppingBag sx={{ fontSize: 21, color: "#ccc" }} />
                                        </Box>
                                        <Typography sx={{ fontFamily: serif, fontWeight: 700, fontSize: 25, color: "#0a0a0a", mb: 1 }}>No orders yet</Typography>
                                        <Mono sx={{ display: "block", mb: 5, color: "#bbb" }}>Start shopping to see your orders here</Mono>
                                        <Box onClick={() => navigate("/")} className="ud7-cta">
                                            Start Shopping <ArrowForward sx={{ fontSize: 13 }} />
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 3 }}>
                                        <Typography sx={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: 20, color: "#0a0a0a" }}>
                                            {sortedOrders.length} order{sortedOrders.length !== 1 ? "s" : ""}
                                        </Typography>
                                        <Mono sx={{ color: "#ccc" }}>Recent first</Mono>
                                    </Box>
                                    {sortedOrders.map((order, idx) => (
                                        <OrderCard key={order.orderId} order={order} index={idx} onProductClick={(pid) => navigate(`/product/${pid}`)} />
                                    ))}
                                </>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ borderTop: "1px solid #e8e8e4", background: "#fff", py: 2.5, px: { xs: 3, md: 6 }, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Mono sx={{ color: "#d8d8d8" }}>© {new Date().getFullYear()} CLOTHIFY</Mono>
                <Box onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: .8, cursor: "pointer", "&:hover": { opacity: .6 }, transition: "opacity .15s" }}>
                    <ArrowBack sx={{ fontSize: 11, color: "#bbb" }} />
                    <Mono>Home</Mono>
                </Box>
            </Box>
        </Box>
    );
};

export default UserDashboard;