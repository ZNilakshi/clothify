import {
    Box,
    Container,
    Grid,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    Add,
    Remove,
    Delete,
    ShoppingCartOutlined,
    ArrowForward,
    ArrowBack,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import authService from "../services/authService";

/* ─── API ────────────────────────────────────────────────────── */
const API = "http://localhost:8080";

const getUser    = () => authService.getCurrentUser();
const getCid     = () => getUser()?.customerId ?? null;
const getHeaders = () => { const u = getUser(); return u?.token ? { Authorization: `Bearer ${u.token}` } : {}; };

const cartGet        = (cid)                       => axios.get(`${API}/api/cart/customer/${cid}`, { headers: getHeaders() });
const cartUpdateQty  = (cid, cartItemId, quantity)  => axios.put(`${API}/api/cart/customer/${cid}/item/${cartItemId}`, null, { params: { quantity }, headers: getHeaders() });
const cartDeleteItem = (cid, cartItemId)            => axios.delete(`${API}/api/cart/customer/${cid}/item/${cartItemId}`, { headers: getHeaders() });
const cartClear      = (cid)                        => axios.delete(`${API}/api/cart/customer/${cid}/clear`, { headers: getHeaders() });

const unpackCart = (data) => {
    if (Array.isArray(data)) return data;
    return data?.items ?? data?.cartItems ?? data?.cart ?? [];
};

const resolveColor = (item) => item.color ?? item.selectedColor ?? item.colorName ?? item.variant?.color ?? null;
const resolveSize  = (item) => item.size  ?? item.selectedSize  ?? item.sizeName  ?? item.variant?.size  ?? null;
const resolveUnitPrice     = (item) => parseFloat(item.unitPrice ?? item.discountPrice ?? item.sellingPrice ?? item.price ?? 0);
const resolveOriginalPrice = (item) => parseFloat(item.sellingPrice ?? item.originalPrice ?? item.price ?? 0);

const resolveStock = (item) => {
    const variants = item.variants ?? item.product?.variants ?? [];
    if (variants.length > 0) {
        const c = item.color ?? item.selectedColor;
        const s = item.size  ?? item.selectedSize;
        if (c && s) {
            const match = variants.find(v =>
                v.color?.toUpperCase() === c?.toUpperCase() &&
                v.size?.toUpperCase()  === s?.toUpperCase()
            );
            if (match) {
                const n = parseInt(match.quantity ?? match.stock ?? match.stockQuantity, 10);
                if (!isNaN(n)) return n;
            }
        }
    }
    for (const s of [item.stockQuantity, item.stock, item.product?.stockQuantity, item.product?.stock]) {
        const n = parseInt(s, 10);
        if (!isNaN(n)) return n;
    }
    return null;
};

const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API}${url.startsWith("/") ? url : `/${url}`}`;
};

const COLOR_HEX = {
    BLACK:"#000000", WHITE:"#FFFFFF", RED:"#EF4444", BLUE:"#3B82F6",
    GREEN:"#22C55E", YELLOW:"#EAB308", PURPLE:"#A855F7", PINK:"#EC4899",
    ORANGE:"#F97316", GRAY:"#6B7280", GREY:"#6B7280", BROWN:"#92400E",
    NAVY:"#1E3A5F", BEIGE:"#D4A76A", CREAM:"#FFFDD0", IVORY:"#FFFFF0",
    MAROON:"#800000", TEAL:"#008080", CYAN:"#00BCD4", GOLD:"#FFD700",
    SILVER:"#C0C0C0", KHAKI:"#C3B091", CORAL:"#FF7F7F", LAVENDER:"#E6E6FA",
    MINT:"#98FF98", TURQUOISE:"#40E0D0", INDIGO:"#4B0082", VIOLET:"#EE82EE",
};

/* ─── Fonts & Animations ─────────────────────────────────────── */
if (!document.head.querySelector('link[href*="Cormorant"]')) {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap";
    document.head.appendChild(l);
}

if (!document.head.querySelector("#cart-v8")) {
    const s = document.createElement("style");
    s.id = "cart-v8";
    s.textContent = `
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn  { from { opacity:0; transform:translateX(-12px) } to { opacity:1; transform:translateX(0) } }
        @keyframes spin     { to { transform: rotate(360deg) } }
        @keyframes shimmer  { 0%,100%{opacity:0.5} 50%{opacity:1} }

        .cart-item-row {
            background: #fff;
            border: 1px solid #e2e2e2;
            transition: background 0.18s;
            position: relative;
        }
        .cart-item-row::before {
            content: '';
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: 3px;
            background: #000;
            transform: scaleY(0);
            transform-origin: bottom;
            transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .cart-item-row:hover::before { transform: scaleY(1); }
        .cart-item-row:hover { background: #fafafa; }

        .cart-item-row.over-stock { border-bottom-color: #000; }
        .cart-item-row.over-stock::before { background: #111; transform: scaleY(1); }

        .qty-btn {
            width: 34px; height: 34px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
            border: none;
            background: transparent;
        }
        .qty-btn:hover:not(:disabled) { background: #000; color: #fff !important; }
        .qty-btn:disabled { cursor: not-allowed; opacity: 0.25; }

        .remove-btn {
            width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.15s;
            border: 1px solid #e0e0e0;
            color: #bbb;
        }
        .remove-btn:hover { background: #000; color: #fff; border-color: #000; }

        .proceed-btn {
            width: 100%;
            padding: 16px;
            background: #000;
            color: #fff;
            display: flex; align-items: center; justify-content: center;
            gap: 10px;
            cursor: pointer;
            letter-spacing: 0.12em;
            font-family: 'DM Mono', monospace;
            font-size: 10px;
            font-weight: 500;
            text-transform: uppercase;
            border: 2px solid #000;
            transition: all 0.2s;
        }
        .proceed-btn:hover { background: #fff; color: #000; }

        .clear-btn {
            display: flex; align-items: center; gap: 6px;
            padding: 7px 14px;
            border: 1px solid #d8d8d8;
            cursor: pointer;
            transition: all 0.15s;
            background: transparent;
        }
        .clear-btn:hover { border-color: #000; background: #000; }
        .clear-btn:hover * { color: #fff !important; }

        .tag-mono {
            font-family: 'DM Mono', monospace;
            font-size: 9px;
            font-weight: 500;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #999;
            line-height: 1.4;
        }

        .continue-link {
            display: inline-flex; align-items: center; gap: 6px;
            cursor: pointer; color: #bbb;
            transition: color 0.15s;
        }
        .continue-link:hover { color: #000; }

        .img-wrap { overflow: hidden; }
        .img-wrap img { transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94); display: block; }
        .cart-item-row:hover .img-wrap img { transform: scale(1.05); }

        .progress-bar-fill { transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }
    `;
    document.head.appendChild(s);
}

const bwTheme = createTheme({
    palette: { mode: "light", primary: { main: "#000" }, background: { default: "#f6f6f4", paper: "#fff" } },
    typography: { fontFamily: "'DM Mono', monospace" },
});

/* Micro label */
const Tag = ({ children, sx = {} }) => (
    <span className="tag-mono" style={sx}>{children}</span>
);

/* ═══════════════════════════════════════════════════════════════
   CART ITEM ROW
   ═══════════════════════════════════════════════════════════════ */
const CartItemRow = ({ item, index, onIncrease, onDecrease, onRemove, onNavigate }) => {
    const productId   = item.productId   ?? item.product?.productId;
    const productName = item.productName ?? item.product?.productName ?? "Product";
    const imageUrl    = item.imageUrl    ?? item.product?.imageUrl;
    const category    = item.categoryName ?? item.product?.categoryName;

    const unitPrice     = resolveUnitPrice(item);
    const originalPrice = resolveOriginalPrice(item);
    const discount      = item.discount ?? item.product?.discount;
    const hasDiscount   = discount && parseFloat(discount) > 0 && unitPrice < originalPrice;

    const qty      = item.quantity ?? 1;
    const stock    = resolveStock(item);
    const hasStock = stock !== null;
    const isAtMax  = hasStock && qty >= stock;
    const isOver   = hasStock && qty > stock;

    const color    = resolveColor(item);
    const size     = resolveSize(item);
    const colorKey = color ? color.trim().toUpperCase() : null;
    const colorHex = colorKey ? (COLOR_HEX[colorKey] ?? null) : null;
    const isLight  = ["WHITE", "IVORY", "CREAM", "BEIGE", "YELLOW"].includes(colorKey);

    const cartItemId = item.cartItemId ?? item.id ?? item.cartId;

    return (
        <Box
            className={`cart-item-row${isOver ? " over-stock" : ""}`}
            sx={{
                animation: `slideIn 0.32s ${index * 0.06}s ease both`,
                display: "grid",
                gridTemplateColumns: { xs: "80px 1fr", sm: "90px 1fr auto auto" },
                gridTemplateRows: { xs: "auto auto", sm: "1fr" },
            }}
        >
            {/* Stock warning banner */}
            {isOver && (
                <Box sx={{ gridColumn: "1 / -1", background: "#111", px: 2.5, py: 0.8 }}>
                    <Tag sx={{ color: "#fff" }}>⚠ Only {stock} units available — quantity adjusted</Tag>
                </Box>
            )}

            {/* ── Image ── */}
            <Box
                className="img-wrap"
                onClick={() => productId && onNavigate(productId)}
                sx={{
                    width: { xs: 80, sm: 90 },
                    height: { xs: 100, sm: 120 },
                    cursor: "pointer",
                    flexShrink: 0,
                    background: "#f0f0ee",
                    gridRow: { xs: "2", sm: "1" },
                    gridColumn: "1 / 2",
                }}
            >
                {imageUrl ? (
                    <img
                        src={resolveImage(imageUrl)}
                        alt={productName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: "italic", fontSize: 42, color: "rgba(0,0,0,0.08)" }}>
                            {productName?.[0]?.toUpperCase()}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Product Info ── */}
            <Box sx={{ p: { xs: "10px 14px", sm: "16px 20px" }, display: "flex", flexDirection: "column", gap: 1, gridRow: { xs: "2", sm: "1" }, gridColumn: "2 / 3", minWidth: 0 }}>
                {category && (
                    <Tag sx={{ color: "#bbb" }}>{category}</Tag>
                )}

                <Typography
                    onClick={() => productId && onNavigate(productId)}
                    sx={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontSize: { xs: 15, sm: 17 },
                        letterSpacing: "0.01em",
                        color: "#000",
                        cursor: "pointer",
                        lineHeight: 1.3,
                        "&:hover": { textDecoration: "underline", textUnderlineOffset: "3px" },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {productName}
                </Typography>

                {/* Variant chips */}
                <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center" }}>
                    {color ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, border: "1px solid #e8e8e8", px: 1.2, py: 0.5, background: "#fafafa" }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: colorHex ?? "#ccc", border: isLight ? "1.5px solid #bbb" : "1.5px solid rgba(0,0,0,0.12)", flexShrink: 0 }} />
                            <Tag sx={{ color: "#333" }}>{color}</Tag>
                        </Box>
                    ) : null}
                    {size ? (
                        <Box sx={{ border: "1.5px solid #000", px: 1.4, py: 0.5, background: "#000" }}>
                            <Tag sx={{ color: "#fff" }}>{size}</Tag>
                        </Box>
                    ) : null}
                </Box>

                {/* Price */}
                <Box sx={{ mt: "auto", pt: 0.5 }}>
                    {hasDiscount ? (
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
                            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 18, color: "#000", lineHeight: 1 }}>
                                Rs {unitPrice.toFixed(2)}
                            </Typography>
                            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#bbb", textDecoration: "line-through" }}>
                                Rs {originalPrice.toFixed(2)}
                            </Typography>
                            <Box sx={{ background: "#000", px: 0.8, py: 0.3 }}>
                                <Tag sx={{ color: "#fff", fontSize: 8 }}>{parseFloat(discount).toFixed(0)}% off</Tag>
                            </Box>
                        </Box>
                    ) : (
                        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 18, color: "#000", lineHeight: 1 }}>
                            Rs {unitPrice.toFixed(2)}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* ── Qty Stepper ── */}
            <Box sx={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                px: { xs: 1.5, sm: 2.5 }, py: 2,
                borderLeft: { xs: "none", sm: "1px solid #ebebeb" },
                borderTop: { xs: "1px solid #ebebeb", sm: "none" },
                gap: 1,
                gridRow: { xs: "3", sm: "1" },
                gridColumn: { xs: "1 / 2", sm: "3 / 4" },
            }}>
                <Tag>Qty</Tag>
                <Box sx={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", overflow: "hidden" }}>
                    <button
                        className="qty-btn"
                        disabled={qty <= 1}
                        onClick={() => qty > 1 && onDecrease(cartItemId, qty)}
                        style={{ borderRight: "1.5px solid #e0e0e0", color: "#000" }}
                    >
                        <Remove sx={{ fontSize: 12 }} />
                    </button>
                    <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: "italic", fontSize: 22, minWidth: 40, textAlign: "center", lineHeight: 1, color: isOver ? "#555" : "#000", px: 0.5 }}>
                        {qty}
                    </Typography>
                    <button
                        className="qty-btn"
                        disabled={isAtMax}
                        onClick={() => !isAtMax && onIncrease(cartItemId, qty)}
                        style={{ borderLeft: "1.5px solid #e0e0e0", color: "#000" }}
                    >
                        <Add sx={{ fontSize: 12 }} />
                    </button>
                </Box>
                <Tag sx={{ color: !hasStock ? "transparent" : isAtMax ? "#555" : stock <= 5 ? "#888" : "#ccc", fontSize: 8 }}>
                    {!hasStock ? "·" : isAtMax ? "Max stock" : `${stock - qty} left`}
                </Tag>
            </Box>

            {/* ── Line Total + Remove ── */}
            <Box sx={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                px: { xs: 1.5, sm: 2.5 }, py: 2,
                borderLeft: "1px solid #ebebeb",
                borderTop: { xs: "1px solid #ebebeb", sm: "none" },
                gap: 1,
                gridRow: { xs: "3", sm: "1" },
                gridColumn: { xs: "2 / 3", sm: "4 / 5" },
            }}>
                <Tag>Total</Tag>
                <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: "italic", fontSize: 22, color: "#000", lineHeight: 1, whiteSpace: "nowrap" }}>
                    Rs {(unitPrice * qty).toFixed(2)}
                </Typography>
                <Box className="remove-btn" onClick={() => onRemove(cartItemId)}>
                    <Delete sx={{ fontSize: 12 }} />
                </Box>
            </Box>
        </Box>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const Cart = () => {
    const navigate = useNavigate();
    const [cart,     setCart]     = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [removing, setRemoving] = useState(null);
    const [toast,    setToast]    = useState({ open: false, message: "", severity: "info" });

    const showToast = (msg, sev = "info") => setToast({ open: true, message: msg, severity: sev });

    useEffect(() => { loadCart(); }, []);

    const autoReduceOverstock = async (items) => {
        const cid = getCid();
        const over = items.filter(i => { const s = resolveStock(i); return s !== null && (i.quantity ?? 1) > s; });
        if (!over.length) return items;
        showToast(`${over.length} item${over.length > 1 ? "s" : ""} exceeded stock — adjusted automatically.`, "warning");
        const results = await Promise.allSettled(over.map(i => cartUpdateQty(cid, i.cartItemId ?? i.id ?? i.cartId, resolveStock(i))));
        let latest = items;
        results.forEach((r, idx) => {
            if (r.status === "fulfilled") { latest = unpackCart(r.value.data); }
            else { const it = over[idx]; const id = it.cartItemId ?? it.id ?? it.cartId; latest = latest.map(i => (i.cartItemId ?? i.id ?? i.cartId) === id ? { ...i, quantity: resolveStock(it) } : i); }
        });
        return latest;
    };

    const loadCart = async () => {
        const cid = getCid();
        if (!cid) { setError("Please log in to view your cart."); setLoading(false); return; }
        try {
            const res   = await cartGet(cid);
            const items = await autoReduceOverstock(unpackCart(res.data));
            setCart(items); setError(null);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (e) {
            console.error(e); setError("Could not load your cart. Please try again.");
        } finally { setLoading(false); }
    };

    const handleIncrease = async (cartItemId, currentQty) => {
        const item  = cart.find(i => (i.cartItemId ?? i.id ?? i.cartId) === cartItemId);
        const stock = resolveStock(item);
        if (stock !== null && currentQty >= stock) { showToast(`Only ${stock} in stock — maximum reached`, "warning"); return; }
        try {
            const items = await autoReduceOverstock(unpackCart((await cartUpdateQty(getCid(), cartItemId, currentQty + 1)).data));
            setCart(items); window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            const backendMsg = err?.response?.data?.message ?? err?.response?.data?.error ?? null;
            if (backendMsg && typeof backendMsg === "string") { showToast(backendMsg, "warning"); }
            else {
                const s = resolveStock(cart.find(i => (i.cartItemId ?? i.id ?? i.cartId) === cartItemId));
                showToast(s !== null ? `Only ${s} in stock — max reached` : "Max stock reached", "warning");
            }
        }
    };

    const handleDecrease = async (cartItemId, currentQty) => {
        if (currentQty <= 1) return;
        try { const items = await autoReduceOverstock(unpackCart((await cartUpdateQty(getCid(), cartItemId, currentQty - 1)).data)); setCart(items); window.dispatchEvent(new Event("cartUpdated")); }
        catch { showToast("Failed to update quantity.", "error"); }
    };

    const handleRemove = async (cartItemId) => {
        setRemoving(cartItemId);
        try {
            const items = await autoReduceOverstock(unpackCart((await cartDeleteItem(getCid(), cartItemId)).data));
            setTimeout(() => { setCart(items); setRemoving(null); window.dispatchEvent(new Event("cartUpdated")); }, 260);
        } catch { showToast("Failed to remove item.", "error"); setRemoving(null); }
    };

    const handleClearCart = async () => {
        try { await cartClear(getCid()); setCart([]); window.dispatchEvent(new Event("cartUpdated")); }
        catch { showToast("Failed to clear cart.", "error"); }
    };

    const subtotal = cart.reduce((t, i) => t + resolveUnitPrice(i) * (i.quantity ?? 1), 0);
    const shippingProgress = Math.min((subtotal / 5000) * 100, 100);
    const freeShipping = subtotal >= 5000;

    /* ─── Loading ─── */
    if (loading) return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", background: "#f6f6f4" }}><Navbar />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Box sx={{ width: 24, height: 24, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", mx: "auto", mb: 2, animation: "spin 0.65s linear infinite" }} />
                        <Tag>Loading cart…</Tag>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );

    /* ─── Error ─── */
    if (error) return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", background: "#f6f6f4" }}><Navbar />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "75vh", px: 4, animation: "fadeUp 0.4s ease both" }}>
                    <Box sx={{ background: "#fff", border: "1px solid #e0e0e0", p: { xs: 4, sm: 6 }, maxWidth: 400, width: "100%", textAlign: "center" }}>
                        <Box sx={{ width: 48, height: 48, border: "1.5px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                            <ShoppingCartOutlined sx={{ fontSize: 22, color: "#ccc" }} />
                        </Box>
                        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 22, color: "#000", mb: 1 }}>
                            {error.includes("log in") ? "Sign in to continue" : "Something went wrong"}
                        </Typography>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa", mb: 4, lineHeight: 1.7 }}>{error}</Typography>
                        <Box onClick={() => navigate("/login")} className="proceed-btn" style={{ display: "inline-flex", width: "auto", padding: "12px 28px" }}>
                            <span>Log In</span><ArrowForward sx={{ fontSize: 14 }} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );

    /* ─── Empty ─── */
    if (cart.length === 0) return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", background: "#f6f6f4" }}><Navbar />
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "75vh", position: "relative", overflow: "hidden", animation: "fadeUp 0.4s ease both" }}>
                    {/* Ghost text */}
                    <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 900, fontStyle: "italic", fontSize: { xs: 110, md: 180 }, color: "rgba(0,0,0,0.035)", lineHeight: 1, userSelect: "none", position: "absolute", pointerEvents: "none", whiteSpace: "nowrap" }}>
                        Empty
                    </Typography>
                    <Box sx={{ textAlign: "center", position: "relative", zIndex: 1, px: 4 }}>
                        <Box sx={{ width: 60, height: 60, border: "1.5px solid #d8d8d8", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                            <ShoppingCartOutlined sx={{ fontSize: 24, color: "#ccc" }} />
                        </Box>
                        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 28, color: "#000", mb: 1.5 }}>Your cart is empty</Typography>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#bbb", mb: 4, display: "block", letterSpacing: "0.08em" }}>Add items to begin</Typography>
                        <Box onClick={() => navigate("/")} className="proceed-btn" style={{ display: "inline-flex", width: "auto", padding: "13px 32px" }}>
                            <span>Explore Products</span><ArrowForward sx={{ fontSize: 13 }} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );

    /* ─── Full Cart ─── */
    return (
        <ThemeProvider theme={bwTheme}>
        <Box sx={{ minHeight: "100vh", background: "#f6f6f4" }}>
            <Navbar />

            <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 }, pb: 10, px: { xs: 2, md: 4 } }}>

                {/* ── Page Header ── */}
                <Box sx={{ mb: { xs: 4, md: 6 }, animation: "fadeUp 0.4s ease both" }}>
                    <Tag sx={{ display: "block", mb: 1.5, color: "#bbb" }}>— Your Selection</Tag>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2, borderBottom: "2px solid #000", pb: 3 }}>
                        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: "italic", fontSize: { xs: 38, md: 58 }, letterSpacing: "-0.02em", lineHeight: 0.9, color: "#000" }}>
                            Shopping Cart
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 0.5 }}>
                            <Box sx={{ border: "1.5px solid #000", px: 2, py: 0.9, display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, lineHeight: 1, color: "#000" }}>{cart.length}</Typography>
                                <Tag>{`Item${cart.length !== 1 ? "s" : ""}`}</Tag>
                            </Box>
                            <Box className="clear-btn" onClick={handleClearCart}>
                                <Delete sx={{ fontSize: 12, color: "#888" }} />
                                <Tag sx={{ color: "#888" }}>Clear All</Tag>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Grid container spacing={{ xs: 3, md: 5 }}>

                    {/* ── Items List ── */}
                    <Grid item xs={12} lg={8} sx={{ animation: "fadeUp 0.4s 0.08s ease both" }}>

                        {/* Column headers */}
                        <Box sx={{ display: { xs: "none", sm: "grid" }, gridTemplateColumns: "90px 1fr 110px 110px", mb: 1.5, px: 0 }}>
                            {[{ l: "Photo", a: "left" }, { l: "Product", a: "left" }, { l: "Quantity", a: "center" }, { l: "Total", a: "center" }].map(h => (
                                <Tag key={h.l} sx={{ textAlign: h.a, paddingLeft: h.a === "left" && h.l === "Product" ? "20px" : 0 }}>{h.l}</Tag>
                            ))}
                        </Box>

                        {/* Items */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {cart.map((item, idx) => {
                                const itemId = item.cartItemId ?? item.id ?? item.cartId ?? idx;
                                return (
                                    <Box
                                        key={itemId}
                                        sx={{
                                            opacity: removing === itemId ? 0 : 1,
                                            transform: removing === itemId ? "translateX(-16px)" : "none",
                                            transition: "opacity 0.24s, transform 0.24s",
                                        }}
                                    >
                                        <CartItemRow
                                            item={item}
                                            index={idx}
                                            onIncrease={handleIncrease}
                                            onDecrease={handleDecrease}
                                            onRemove={handleRemove}
                                            onNavigate={(pid) => navigate(`/product/${pid}`)}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <Box className="continue-link" onClick={() => navigate("/")}>
                                <ArrowBack sx={{ fontSize: 12 }} />
                                <Tag sx={{ color: "inherit" }}>Continue Shopping</Tag>
                            </Box>
                        </Box>
                    </Grid>

                    {/* ── Order Summary ── */}
                    <Grid item xs={12} lg={4} sx={{ animation: "fadeUp 0.4s 0.15s ease both" }}>
                        <Box sx={{ background: "#fff", border: "1px solid #e0e0e0", position: { lg: "sticky" }, top: { lg: 24 } }}>

                            {/* Summary header */}
                            <Box sx={{ borderBottom: "2px solid #000", px: 3, py: 2.5 }}>
                                <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: "#000", letterSpacing: "0.01em" }}>
                                    Order Summary
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                {/* Line items */}
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <Tag>{`Subtotal · ${cart.length} item${cart.length !== 1 ? "s" : ""}`}</Tag>
                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#444" }}>Rs {subtotal.toFixed(2)}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <Tag>Shipping</Tag>
                                        <Tag sx={{ color: freeShipping ? "#000" : "#aaa" }}>
                                            {freeShipping ? "Free" : "Calculated at checkout"}
                                        </Tag>
                                    </Box>
                                </Box>

                                {/* Divider */}
                                <Box sx={{ height: "1.5px", background: "linear-gradient(90deg, #000 0%, #000 60%, #e0e0e0 100%)", mb: 3 }} />

                                {/* Total */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 3.5 }}>
                                    <Tag sx={{ color: "#000", fontSize: 10 }}>Total</Tag>
                                    <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: "italic", fontSize: 34, color: "#000", lineHeight: 1 }}>
                                        Rs {subtotal.toFixed(2)}
                                    </Typography>
                                </Box>

                                {/* CTA */}
                                <Box className="proceed-btn" onClick={() => navigate("/checkout")}>
                                    <span>Proceed to Checkout</span>
                                    <ArrowForward sx={{ fontSize: 14 }} />
                                </Box>

                                {/* Shipping progress */}
                                <Box sx={{ mt: 2.5 }}>
                                    {freeShipping ? (
                                        <Box sx={{ p: 2, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                            <Tag sx={{ color: "#fff" }}>✓ Free Shipping Unlocked</Tag>
                                        </Box>
                                    ) : (
                                        <Box sx={{ p: 2, background: "#f6f6f4", border: "1px solid #ebebeb" }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
                                                <Tag sx={{ color: "#999" }}>Free shipping threshold</Tag>
                                                <Tag sx={{ color: "#555" }}>Rs {(5000 - subtotal).toFixed(0)} away</Tag>
                                            </Box>
                                            <Box sx={{ height: 2, background: "#e8e8e8", position: "relative" }}>
                                                <Box
                                                    className="progress-bar-fill"
                                                    sx={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${shippingProgress}%`, background: "#000" }}
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </Box>

                                {/* Trust line */}
                                <Box sx={{ mt: 2.5, display: "flex", justifyContent: "center", gap: 3 }}>
                                    {["Secure Checkout", "Easy Returns", "Support 24/7"].map(txt => (
                                        <Tag key={txt} sx={{ color: "#ccc", fontSize: 8 }}>{txt}</Tag>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* ── Footer ── */}
            <Box sx={{ borderTop: "1px solid #e8e8e8", background: "#fff", py: 2.5, px: { xs: 3, md: 5 }, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                <Tag sx={{ color: "#d8d8d8" }}>© {new Date().getFullYear()} CLOTHIFY</Tag>
                <Box className="continue-link" onClick={() => navigate("/")}>
                    <ArrowBack sx={{ fontSize: 11 }} />
                    <Tag sx={{ color: "inherit" }}>Back to Home</Tag>
                </Box>
            </Box>

            {/* ── Toast ── */}
            <Snackbar
                open={toast.open}
                autoHideDuration={3500}
                onClose={() => setToast(t => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    severity={toast.severity}
                    onClose={() => setToast(t => ({ ...t, open: false }))}
                    sx={{
                        borderRadius: 0,
                        border: "1.5px solid #000",
                        background: "#fff",
                        color: "#000",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        letterSpacing: "0.04em",
                        "& .MuiAlert-icon": { color: "#000" },
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
        </ThemeProvider>
    );
};

export default Cart;