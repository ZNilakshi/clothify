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

/* ─── API base ───────────────────────────────────────────────── */
const API = "http://localhost:8080";

const getUser    = () => authService.getCurrentUser();
const getCid     = () => getUser()?.customerId ?? null;
const getHeaders = () => {
    const u = getUser();
    return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
};

const cartGet = (cid) =>
    axios.get(`${API}/api/cart/customer/${cid}`, { headers: getHeaders() });

const cartUpdateQty = (cid, cartItemId, quantity) =>
    axios.put(
        `${API}/api/cart/customer/${cid}/item/${cartItemId}`,
        null,
        { params: { quantity }, headers: getHeaders() }
    );

const cartDeleteItem = (cid, cartItemId) =>
    axios.delete(`${API}/api/cart/customer/${cid}/item/${cartItemId}`, { headers: getHeaders() });

const cartClear = (cid) =>
    axios.delete(`${API}/api/cart/customer/${cid}/clear`, { headers: getHeaders() });

/* ─── Unpack CartDTO → items array ──────────────────────────── */
const unpackCart = (data) => {
    if (Array.isArray(data)) return data;
    return data?.items ?? data?.cartItems ?? data?.cart ?? [];
};

/* ═══════════════════════════════════════════════════════════════
   DEEP FIELD RESOLVERS
   ═══════════════════════════════════════════════════════════════ */

/** Normalize string for comparison */
const norm = (s) => (s ? String(s).trim().toUpperCase() : null);

/** Recursively flatten all key→value pairs from any nested object */
const flattenObject = (obj, prefix = "", depth = 0) => {
    if (depth > 6 || !obj || typeof obj !== "object") return {};
    return Object.entries(obj).reduce((acc, [k, v]) => {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
            Object.assign(acc, flattenObject(v, key, depth + 1));
        } else if (Array.isArray(v)) {
            v.forEach((item, i) => {
                if (item && typeof item === "object") {
                    Object.assign(acc, flattenObject(item, `${key}[${i}]`, depth + 1));
                } else {
                    acc[`${key}[${i}]`] = item;
                }
            });
        } else {
            acc[key] = v;
        }
        return acc;
    }, {});
};

/** Get all string values from a flattened object */
const allStrings = (obj) =>
    Object.values(flattenObject(obj))
        .filter(v => typeof v === "string" && v.trim().length > 0)
        .map(v => v.trim().toUpperCase());

/** Get all number values */
const allNumbers = (obj) =>
    Object.values(flattenObject(obj))
        .filter(v => typeof v === "number" && !isNaN(v));

/* ─── DEBUG: logs full structure of first cart item once ─────── */
let _debugged = false;
const debugCartItem = (item) => {
    if (_debugged) return;
    _debugged = true;
    console.group("🛒 CART ITEM DEBUG — full structure");
    console.log("Raw item:", JSON.parse(JSON.stringify(item)));
    console.log("Flattened:", flattenObject(item));
    console.log("All strings found:", allStrings(item));
    console.log("color field:", item.color, "| selectedColor:", item.selectedColor,
                "| variant?.color:", item.variant?.color, "| product?.color:", item.product?.color);
    console.log("size field:", item.size, "| selectedSize:", item.selectedSize,
                "| variant?.size:", item.variant?.size, "| product?.size:", item.product?.size);
    console.log("stockQuantity:", item.stockQuantity, "| product?.stockQuantity:", item.product?.stockQuantity,
                "| variant:", item.variant);
    console.groupEnd();
};

/* ─── Known color names ──────────────────────────────────────── */
const KNOWN_COLORS = new Set([
    "BLACK","WHITE","RED","BLUE","GREEN","YELLOW","PURPLE","PINK",
    "ORANGE","GRAY","GREY","BROWN","NAVY","BEIGE","CREAM","IVORY",
    "MAROON","TEAL","CYAN","MAGENTA","GOLD","SILVER","KHAKI",
    "CORAL","SALMON","LAVENDER","MINT","TURQUOISE","INDIGO","VIOLET",
]);

/** Known size tokens */
const KNOWN_SIZES = new Set([
    "XS","S","M","L","XL","XXL","XXXL","2XL","3XL","4XL",
    "6","7","8","9","10","11","12","13","14",
    "36","37","38","39","40","41","42","43","44","45",
    "FREE SIZE","ONE SIZE","FREESIZE","ONESIZE",
]);

/* ─── Find variant by variantId in product's variants array ───── */
const findVariantById = (item) => {
    const vid = item.variantId ?? item.variant?.variantId ?? item.variant?.id ?? null;
    if (!vid) return null;
    const variants = item.product?.variants ?? item.variants ?? [];
    return variants.find(v => (v.variantId ?? v.id) === vid) ?? null;
};

/* ─── Resolve COLOR ────────────────────────────────────────────── */
const resolveColor = (item) => {
    // Pass 1: direct fields (every name we've seen from Spring Boot backends)
    const v = item.color ?? item.selectedColor ?? item.colorName ?? item.colour ??
              item.selectedColour ?? item.variantColor ?? item.color_name ??
              item.variant?.color ?? item.variant?.colorName ?? item.variant?.colour ??
              item.product?.color ?? item.product?.colorName ?? item.product?.colour ?? null;
    if (v && String(v).trim()) return String(v).trim();

    // Pass 2: look up by variantId
    const byId = findVariantById(item);
    if (byId?.color ?? byId?.colorName) return byId.color ?? byId.colorName;

    // Pass 3: deep scan — any string that matches a known color
    const strings = allStrings(item);
    const found = strings.find(s => KNOWN_COLORS.has(s));
    return found ?? null;
};

/* ─── Resolve SIZE ─────────────────────────────────────────────── */
const resolveSize = (item) => {
    // Pass 1: direct fields
    const v = item.size ?? item.selectedSize ?? item.sizeName ?? item.sizeValue ??
              item.variantSize ?? item.size_name ?? item.sizeCode ??
              item.variant?.size ?? item.variant?.sizeName ?? item.variant?.sizeValue ??
              item.product?.size ?? item.product?.sizeName ?? null;
    if (v && String(v).trim()) return String(v).trim();

    // Pass 2: look up by variantId
    const byId = findVariantById(item);
    if (byId?.size ?? byId?.sizeName) return byId.size ?? byId.sizeName;

    // Pass 3: deep scan — any string that matches a known size
    const strings = allStrings(item);
    const found = strings.find(s => KNOWN_SIZES.has(s));
    return found ?? null;
};

/* ─── Resolve STOCK ────────────────────────────────────────────── */
const resolveStock = (item) => {
    const color = norm(resolveColor(item));
    const size  = norm(resolveSize(item));

    // Priority 1: match variant by color+size or by variantId → use its stock
    const variants = item.variants ?? item.product?.variants ?? item.productVariants ?? [];
    if (Array.isArray(variants) && variants.length > 0) {
        let matched = null;

        // Try variantId match first (most reliable)
        const vid = item.variantId ?? item.variant?.variantId ?? item.variant?.id ?? null;
        if (vid) matched = variants.find(v => (v.variantId ?? v.id) === vid);

        // Try color+size match
        if (!matched && color && size) {
            matched = variants.find(v =>
                norm(v.color ?? v.colorName) === color &&
                norm(v.size  ?? v.sizeName)  === size
            );
        }

        if (matched) {
            const s = matched.quantity ?? matched.stock ?? matched.stockQuantity ??
                      matched.availableQty ?? matched.stockQty ?? null;
            const n = parseInt(s, 10);
            if (!isNaN(n)) return n;
        }
    }

    // Priority 2: variant sub-object directly on item
    const vObj = item.variant ?? null;
    if (vObj) {
        const s = vObj.quantity ?? vObj.stock ?? vObj.stockQuantity ?? vObj.availableQty ?? null;
        const n = parseInt(s, 10);
        if (!isNaN(n)) return n;
    }

    // Priority 3: item-level stock fields
    for (const s of [
        item.stockQuantity, item.stock, item.availableQuantity,
        item.availableStock, item.inventoryCount, item.remainingStock,
        item.variantStock, item.variantQuantity,
    ]) {
        const n = parseInt(s, 10);
        if (!isNaN(n)) return n;
    }

    // Priority 4: product-level
    for (const s of [
        item.product?.stockQuantity, item.product?.stock,
        item.product?.availableQuantity, item.product?.availableStock,
        item.product?.inventoryCount,
    ]) {
        const n = parseInt(s, 10);
        if (!isNaN(n)) return n;
    }

    return null;
};

/* ─── Resolve PRICE fields ─────────────────────────────────────── */
const resolveUnitPrice = (item) =>
    parseFloat(item.discountPrice ?? item.unitPrice ?? item.sellingPrice ?? item.price ?? 0);

const resolveOriginalPrice = (item) =>
    parseFloat(item.sellingPrice ?? item.product?.sellingPrice ?? item.originalPrice ?? item.price ?? 0);

/* ─── Resolve IMAGE url ─────────────────────────────────────────── */
const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API}${url.startsWith("/") ? url : `/${url}`}`;
};

/* ─── COLOR_HEX map for known colors ───────────────────────────── */
const COLOR_HEX = {
    BLACK:"#000000", WHITE:"#FFFFFF", RED:"#EF4444", BLUE:"#3B82F6",
    GREEN:"#22C55E", YELLOW:"#EAB308", PURPLE:"#A855F7", PINK:"#EC4899",
    ORANGE:"#F97316", GRAY:"#6B7280", GREY:"#6B7280", BROWN:"#92400E",
    NAVY:"#1E3A5F", BEIGE:"#D4A76A", CREAM:"#FFFDD0", IVORY:"#FFFFF0",
    MAROON:"#800000", TEAL:"#008080", CYAN:"#00BCD4", GOLD:"#FFD700",
    SILVER:"#C0C0C0", KHAKI:"#C3B091", CORAL:"#FF7F7F", LAVENDER:"#E6E6FA",
    MINT:"#98FF98", TURQUOISE:"#40E0D0", INDIGO:"#4B0082", VIOLET:"#EE82EE",
};

/* ─── Google Fonts ───────────────────────────────────────────── */
if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l = document.createElement("link");
    l.rel   = "stylesheet";
    l.href  = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#cart-v5")) {
    const s = document.createElement("style");
    s.id = "cart-v5";
    s.textContent = `
        @keyframes cFadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cItemIn  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes cSpin    { to{transform:rotate(360deg)} }
        @keyframes cPulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
    `;
    document.head.appendChild(s);
}

/* ─── Theme ──────────────────────────────────────────────────── */
const bwTheme = createTheme({
    palette: {
        mode: "light",
        primary:    { main: "#000" },
        background: { default: "#f5f5f0", paper: "#fff" },
        text:       { primary: "#000", secondary: "#666" },
    },
    typography: { fontFamily: "'IBM Plex Mono', monospace" },
});

const MonoLabel = ({ children, sx = {} }) => (
    <Typography sx={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9, fontWeight: 600,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "#aaa", ...sx,
    }}>
        {children}
    </Typography>
);

/* ─── Cart Item Row ──────────────────────────────────────────── */
const CartItem = ({ item, index, onIncrease, onDecrease, onRemove, onNavigate }) => {
    // 🔍 Logs full item structure to browser console (first item only, one time)
    debugCartItem(item);

    const productId   = item.productId   ?? item.product?.productId;
    const productName = item.productName ?? item.product?.productName ?? item.name ?? "Product";
    const imageUrl    = item.imageUrl    ?? item.product?.imageUrl ?? item.image ?? item.product?.image;
    const category    = item.categoryName ?? item.product?.categoryName;

    const unitPrice     = resolveUnitPrice(item);
    const originalPrice = resolveOriginalPrice(item);
    const discount      = item.discount ?? item.product?.discount;
    const hasDiscount   = discount && parseFloat(discount) > 0 && unitPrice < originalPrice;

    const qty     = item.quantity ?? 1;
    const stock   = resolveStock(item);       // null = unknown
    const hasStock = stock !== null;
    const isAtMax  = hasStock && qty >= stock;
    const isOver   = hasStock && qty > stock;

    const color = resolveColor(item);
    const size  = resolveSize(item);

    // Color swatch hex — use map or fall back to CSS color name
    const colorKey  = norm(color);
    const colorHex  = colorKey ? (COLOR_HEX[colorKey] ?? color?.toLowerCase()) : null;
    const isLight   = colorKey === "WHITE" || colorKey === "IVORY" || colorKey === "CREAM" || colorKey === "BEIGE";

    const cartItemId = item.cartItemId ?? item.id ?? item.cartId;

    return (
        <Box sx={{
            backgroundColor: "#fff",
            border: `1px solid ${isOver ? "#e53935" : "#e8e8e8"}`,
            mb: 1.5,
            animation: `cItemIn 0.35s ${index * 0.06}s ease both`,
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:hover": { borderColor: isOver ? "#e53935" : "#000", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" },
        }}>
            {/* Over-stock warning banner */}
            {isOver && (
                <Box sx={{ backgroundColor: "#e53935", px: 2, py: 0.8 }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
                        textTransform: "uppercase", color: "#fff",
                    }}>
                        ⚠ Only {stock} in stock — reducing automatically…
                    </Typography>
                </Box>
            )}

            <Grid container alignItems="stretch">

                {/* ── Image ── */}
                <Grid item xs={3} sm={2}>
                    <Box
                        onClick={() => productId && onNavigate(productId)}
                        sx={{
                            height: 150, overflow: "hidden",
                            cursor: "pointer", backgroundColor: "#f5f5f0",
                            borderRight: "1px solid #e8e8e8",
                        }}
                    >
                        {imageUrl ? (
                            <Box
                                component="img"
                                src={resolveImage(imageUrl)}
                                alt={productName}
                                sx={{
                                    width: "100%", height: "100%",
                                    objectFit: "cover", display: "block",
                                    filter: "grayscale(10%)",
                                    transition: "transform 0.3s, filter 0.3s",
                                    "&:hover": { transform: "scale(1.06)", filter: "grayscale(0%)" },
                                }}
                            />
                        ) : (
                            <Box sx={{
                                width: "100%", height: "100%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Typography sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 900, fontStyle: "italic",
                                    fontSize: 36, color: "rgba(0,0,0,0.08)",
                                }}>
                                    {productName?.[0]?.toUpperCase()}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>

                {/* ── Product info ── */}
                <Grid item xs={9} sm={5}>
                    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                        {/* Category */}
                        {category && (
                            <MonoLabel sx={{ mb: 0.5, color: "#bbb" }}>{category}</MonoLabel>
                        )}

                        {/* Name */}
                        <Typography
                            onClick={() => productId && onNavigate(productId)}
                            sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontWeight: 600, fontSize: { xs: 11, sm: 12 },
                                letterSpacing: "0.05em", textTransform: "uppercase",
                                color: "#000", cursor: "pointer", mb: 1.2,
                                lineHeight: 1.4,
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            {productName}
                        </Typography>

                        {/* ── Variant chips (color + size) ────────────────── */}
                        {(color || size) && (
                            <Box sx={{ display: "flex", gap: 0.8, mb: 1.5, flexWrap: "wrap" }}>
                                {color && (
                                    <Box sx={{
                                        display: "flex", alignItems: "center", gap: 0.7,
                                        border: "1px solid #e0e0e0",
                                        backgroundColor: "#fafafa",
                                        px: 1.2, py: 0.4,
                                    }}>
                                        {/* Color swatch */}
                                        <Box sx={{
                                            width: 11, height: 11,
                                            borderRadius: "50%",
                                            backgroundColor: colorHex ?? "#ccc",
                                            border: isLight
                                                ? "1.5px solid #ccc"
                                                : "1.5px solid rgba(0,0,0,0.12)",
                                            flexShrink: 0,
                                        }} />
                                        <Typography sx={{
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontSize: 9, letterSpacing: "0.1em",
                                            textTransform: "uppercase", color: "#333",
                                            fontWeight: 600,
                                        }}>
                                            {color}
                                        </Typography>
                                    </Box>
                                )}
                                {size && (
                                    <Box sx={{
                                        border: "1px solid #e0e0e0",
                                        backgroundColor: "#fafafa",
                                        px: 1.2, py: 0.4,
                                    }}>
                                        <Typography sx={{
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontSize: 9, letterSpacing: "0.1em",
                                            textTransform: "uppercase", color: "#333",
                                            fontWeight: 600,
                                        }}>
                                            {size}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* ── Price ── */}
                        <Box>
                            {hasDiscount ? (
                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
                                    <Typography sx={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontWeight: 700, fontSize: 16, color: "#000",
                                    }}>
                                        Rs {unitPrice.toFixed(2)}
                                    </Typography>
                                    <Typography sx={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 10, color: "#ccc", textDecoration: "line-through",
                                    }}>
                                        Rs {originalPrice.toFixed(2)}
                                    </Typography>
                                    <Box sx={{
                                        backgroundColor: "#000", color: "#fff",
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 8, fontWeight: 600, letterSpacing: "0.08em",
                                        px: 0.8, py: 0.2,
                                    }}>
                                        {parseFloat(discount).toFixed(0)}% OFF
                                    </Box>
                                </Box>
                            ) : (
                                <Typography sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 700, fontSize: 16, color: "#000",
                                }}>
                                    Rs {unitPrice.toFixed(2)}
                                </Typography>
                            )}
                        </Box>

                        {/* ── Stock badge ── */}
                        <Box sx={{ mt: 1 }}>
                            {!hasStock ? (
                                <MonoLabel sx={{ color: "#ccc" }}>Stock info unavailable</MonoLabel>
                            ) : stock === 0 ? (
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                                    letterSpacing: "0.08em", color: "#e53935",
                                    animation: "cPulse 2s ease infinite",
                                }}>
                                    ✕ Out of stock
                                </Typography>
                            ) : stock <= 5 ? (
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                                    letterSpacing: "0.08em", color: "#e68a00",
                                    animation: "cPulse 2.5s ease infinite",
                                }}>
                                    ⚠ Only {stock} left in stock
                                </Typography>
                            ) : (
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                                    letterSpacing: "0.08em", color: "#4caf50",
                                }}>
                                    ✓ {stock} in stock
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Grid>

                {/* ── Quantity stepper ── */}
                <Grid item xs={6} sm={3}>
                    <Box sx={{
                        height: "100%",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        borderLeft: { xs: "none", sm: "1px solid #e8e8e8" },
                        borderTop:  { xs: "1px solid #e8e8e8", sm: "none" },
                        p: 2, gap: 0.5,
                    }}>
                        <MonoLabel>Qty</MonoLabel>
                        <Box sx={{ display: "flex", alignItems: "center", border: "2px solid #000", mt: 0.5 }}>
                            {/* − */}
                            <Box
                                onClick={() => qty > 1 && onDecrease(cartItemId, qty)}
                                sx={{
                                    width: 34, height: 34,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: qty <= 1 ? "not-allowed" : "pointer",
                                    color: qty <= 1 ? "#ddd" : "#000",
                                    borderRight: "2px solid #000",
                                    "&:hover": qty > 1 ? { backgroundColor: "#000", color: "#fff" } : {},
                                    transition: "all 0.15s",
                                }}
                            >
                                <Remove sx={{ fontSize: 13 }} />
                            </Box>

                            {/* count */}
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 700, fontSize: 18,
                                minWidth: 40, textAlign: "center", lineHeight: 1,
                                color: isOver ? "#e53935" : "#000",
                                px: 1,
                            }}>
                                {qty}
                            </Typography>

                            {/* + */}
                            <Box
                                onClick={() => !isAtMax && onIncrease(cartItemId, qty)}
                                sx={{
                                    width: 34, height: 34,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: isAtMax ? "not-allowed" : "pointer",
                                    color: isAtMax ? "#ccc" : "#000",
                                    borderLeft: "2px solid #000",
                                    "&:hover": !isAtMax ? { backgroundColor: "#000", color: "#fff" } : {},
                                    transition: "all 0.15s",
                                }}
                            >
                                <Add sx={{ fontSize: 13 }} />
                            </Box>
                        </Box>

                        {/* Stock availability label */}
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 8, mt: 0.6, letterSpacing: "0.06em",
                            color: !hasStock
                                ? "#ccc"
                                : isAtMax
                                    ? "#e53935"
                                    : stock <= 5
                                        ? "#e68a00"
                                        : "#888",
                        }}>
                            {!hasStock
                                ? ""
                                : isAtMax
                                    ? "Max stock reached"
                                    : `${stock - qty} more available`}
                        </Typography>
                    </Box>
                </Grid>

                {/* ── Line total + delete ── */}
                <Grid item xs={6} sm={2}>
                    <Box sx={{
                        height: "100%",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        borderLeft: "1px solid #e8e8e8",
                        borderTop:  { xs: "1px solid #e8e8e8", sm: "none" },
                        p: 2, gap: 0.5,
                    }}>
                        <MonoLabel>Total</MonoLabel>
                        <Typography sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700, fontSize: 18, color: "#000",
                            lineHeight: 1, mt: 0.5,
                        }}>
                            Rs {(unitPrice * qty).toFixed(2)}
                        </Typography>
                        <Box
                            onClick={() => onRemove(cartItemId, productName)}
                            sx={{
                                mt: 1, width: 30, height: 30,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                border: "1px solid #e0e0e0", cursor: "pointer", color: "#ccc",
                                "&:hover": { backgroundColor: "#e53935", color: "#fff", borderColor: "#e53935" },
                                transition: "all 0.15s",
                            }}
                        >
                            <Delete sx={{ fontSize: 13 }} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

/* ─── Main Component ─────────────────────────────────────────── */
const Cart = () => {
    const navigate = useNavigate();
    const [cart,     setCart]     = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [removing, setRemoving] = useState(null);
    const [toast,    setToast]    = useState({ open: false, message: "", severity: "info" });

    const showToast = (msg, sev = "info") => setToast({ open: true, message: msg, severity: sev });

    useEffect(() => { loadCart(); }, []);

    /* ── Auto-reduce items whose qty exceeds their variant stock ── */
    const autoReduceOverstock = async (items) => {
        const cid = getCid();
        const overcrowded = items.filter(item => {
            const stock = resolveStock(item);
            return stock !== null && (item.quantity ?? 1) > stock;
        });

        if (overcrowded.length === 0) return items;

        showToast(
            `${overcrowded.length} item${overcrowded.length > 1 ? "s" : ""} exceeded stock — quantities adjusted automatically.`,
            "warning"
        );

        const results = await Promise.allSettled(
            overcrowded.map(item => {
                const cartItemId = item.cartItemId ?? item.id ?? item.cartId;
                const stock      = resolveStock(item);
                return cartUpdateQty(cid, cartItemId, stock);
            })
        );

        let latestItems = items;
        results.forEach((result, idx) => {
            if (result.status === "fulfilled") {
                latestItems = unpackCart(result.value.data);
            } else {
                const item       = overcrowded[idx];
                const cartItemId = item.cartItemId ?? item.id ?? item.cartId;
                const stock      = resolveStock(item);
                latestItems = latestItems.map(i =>
                    (i.cartItemId ?? i.id ?? i.cartId) === cartItemId
                        ? { ...i, quantity: stock }
                        : i
                );
            }
        });

        return latestItems;
    };

    /* ── GET cart ── */
    const loadCart = async () => {
        const cid = getCid();
        if (!cid) {
            setError("Please log in to view your cart.");
            setLoading(false);
            return;
        }
        try {
            const res        = await cartGet(cid);
            const rawItems   = unpackCart(res.data);
            const finalItems = await autoReduceOverstock(rawItems);
            setCart(finalItems);
            setError(null);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            console.error("Load cart failed:", err);
            setError("Could not load your cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ── PUT increase ── */
    const handleIncrease = async (cartItemId, currentQty) => {
        const item  = cart.find(i => (i.cartItemId ?? i.id ?? i.cartId) === cartItemId);
        const stock = resolveStock(item);

        if (stock !== null && currentQty >= stock) {
            showToast(`Only ${stock} units available in stock`, "warning");
            return;
        }
        try {
            const res        = await cartUpdateQty(getCid(), cartItemId, currentQty + 1);
            const rawItems   = unpackCart(res.data);
            const finalItems = await autoReduceOverstock(rawItems);
            setCart(finalItems);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            console.error("Increase qty failed:", err);
            showToast("Failed to update quantity. Please try again.", "error");
        }
    };

    /* ── PUT decrease ── */
    const handleDecrease = async (cartItemId, currentQty) => {
        if (currentQty <= 1) return;
        try {
            const res        = await cartUpdateQty(getCid(), cartItemId, currentQty - 1);
            const rawItems   = unpackCart(res.data);
            const finalItems = await autoReduceOverstock(rawItems);
            setCart(finalItems);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            console.error("Decrease qty failed:", err);
            showToast("Failed to update quantity. Please try again.", "error");
        }
    };

    /* ── DELETE item ── */
    const handleRemove = async (cartItemId, name) => {
        setRemoving(cartItemId);
        try {
            const res        = await cartDeleteItem(getCid(), cartItemId);
            const rawItems   = unpackCart(res.data);
            const finalItems = await autoReduceOverstock(rawItems);
            setTimeout(() => {
                setCart(finalItems);
                setRemoving(null);
                window.dispatchEvent(new Event("cartUpdated"));
            }, 260);
        } catch (err) {
            console.error("Remove item failed:", err);
            showToast("Failed to remove item. Please try again.", "error");
            setRemoving(null);
        }
    };

    /* ── DELETE clear ── */
    const handleClearCart = async () => {
        try {
            await cartClear(getCid());
            setCart([]);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            console.error("Clear cart failed:", err);
            showToast("Failed to clear cart. Please try again.", "error");
        }
    };

    /* ── Totals ── */
    const subtotal = cart.reduce((t, item) => t + resolveUnitPrice(item) * (item.quantity ?? 1), 0);

    /* ── Loading ── */
    if (loading) return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>
                <Navbar />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Box sx={{
                            width: 32, height: 32,
                            border: "2px solid #000", borderTopColor: "transparent",
                            borderRadius: "50%", mx: "auto", mb: 2,
                            animation: "cSpin 0.7s linear infinite",
                        }} />
                        <MonoLabel>Loading cart...</MonoLabel>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );

    /* ── Error ── */
    if (error) return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>
                <Navbar />
                <Box sx={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    minHeight: "70vh", textAlign: "center", px: 4,
                    animation: "cFadeIn 0.4s ease both",
                }}>
                    <Box sx={{ border: "1px solid #e0e0e0", p: 4, backgroundColor: "#fff", maxWidth: 420 }}>
                        <Typography sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700, fontSize: 20, color: "#000", mb: 1,
                        }}>
                            {error.includes("log in") ? "Not Logged In" : "Something went wrong"}
                        </Typography>
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11, color: "#aaa", mb: 3,
                        }}>
                            {error}
                        </Typography>
                        <Box onClick={() => navigate("/login")} sx={{
                            display: "inline-flex", alignItems: "center", gap: 1.5,
                            border: "1px solid #000", px: 3, py: 1.2,
                            backgroundColor: "#000", color: "#fff", cursor: "pointer",
                            "&:hover": { backgroundColor: "#222" }, transition: "background-color 0.15s",
                        }}>
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11, fontWeight: 600,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                            }}>
                                Log In
                            </Typography>
                            <ArrowForward sx={{ fontSize: 14 }} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );

    /* ── Empty ── */
    if (cart.length === 0) return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>
                <Navbar />
                <Box sx={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    minHeight: "75vh", position: "relative",
                    animation: "cFadeIn 0.4s ease both",
                }}>
                    <Typography sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900, fontStyle: "italic",
                        fontSize: { xs: 100, md: 160 },
                        color: "rgba(0,0,0,0.04)", lineHeight: 1,
                        userSelect: "none", position: "absolute",
                    }}>
                        Cart
                    </Typography>
                    <Box sx={{ textAlign: "center", position: "relative", zIndex: 1, px: 4 }}>
                        <Box sx={{
                            width: 64, height: 64, border: "2px solid #e0e0e0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            mx: "auto", mb: 3,
                        }}>
                            <ShoppingCartOutlined sx={{ fontSize: 28, color: "#ccc" }} />
                        </Box>
                        <Typography sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700, fontSize: 26, color: "#000", mb: 1,
                        }}>
                            Your cart is empty
                        </Typography>
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11, color: "#aaa", letterSpacing: "0.04em", mb: 4,
                        }}>
                            Add items to get started
                        </Typography>
                        <Box onClick={() => navigate("/")} sx={{
                            display: "inline-flex", alignItems: "center", gap: 1.5,
                            border: "1px solid #000", px: 4, py: 1.5, cursor: "pointer",
                            backgroundColor: "#000", color: "#fff",
                            "&:hover": { backgroundColor: "#222" }, transition: "background-color 0.15s",
                        }}>
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11, fontWeight: 600,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                            }}>
                                Continue Shopping
                            </Typography>
                            <ArrowForward sx={{ fontSize: 14 }} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );

    /* ── Full cart view ── */
    return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0", fontFamily: "'IBM Plex Mono', monospace" }}>
                <Navbar />

                <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>

                    {/* Header */}
                    <Box sx={{
                        borderBottom: "2px solid #000", pb: 2.5, mb: 4,
                        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                        flexWrap: "wrap", gap: 2,
                        animation: "cFadeIn 0.4s ease both",
                    }}>
                        <Box>
                            <MonoLabel sx={{ mb: 0.8 }}>Your</MonoLabel>
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 900, fontStyle: "italic",
                                fontSize: { xs: 34, md: 48 },
                                letterSpacing: "-0.03em", lineHeight: 0.9, color: "#000",
                            }}>
                                Shopping Cart
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                            <Box sx={{
                                border: "1px solid #000", px: 2, py: 0.8,
                                display: "flex", alignItems: "center", gap: 1.5,
                            }}>
                                <Typography sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 700, fontSize: 20, lineHeight: 1, color: "#000",
                                }}>
                                    {cart.length}
                                </Typography>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 9, letterSpacing: "0.1em",
                                    textTransform: "uppercase", color: "#888",
                                }}>
                                    item{cart.length !== 1 ? "s" : ""}
                                </Typography>
                            </Box>

                            <Box onClick={handleClearCart} sx={{
                                display: "flex", alignItems: "center", gap: 1,
                                border: "1px solid #e0e0e0", px: 2, py: 0.8, cursor: "pointer",
                                "&:hover": { borderColor: "#e53935", backgroundColor: "#e53935", color: "#fff" },
                                transition: "all 0.15s",
                            }}>
                                <Delete sx={{ fontSize: 13 }} />
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 9, fontWeight: 600,
                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                }}>
                                    Clear All
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Grid container spacing={4}>

                        {/* ── Items list ── */}
                        <Grid item xs={12} md={8} sx={{ animation: "cFadeIn 0.4s 0.1s ease both" }}>
                            <Box sx={{
                                display: { xs: "none", sm: "grid" },
                                gridTemplateColumns: "calc(16.67%) calc(41.67%) calc(25%) calc(16.67%)",
                                mb: 1,
                            }}>
                                {["Photo", "Product", "Qty", "Total"].map(h => (
                                    <MonoLabel key={h} sx={{
                                        textAlign: h === "Total" || h === "Qty" ? "center" : "left",
                                        pl: h === "Photo" ? 1.5 : 0,
                                    }}>
                                        {h}
                                    </MonoLabel>
                                ))}
                            </Box>

                            {cart.map((item, idx) => {
                                const itemId = item.cartItemId ?? item.id ?? item.cartId ?? idx;
                                return (
                                    <Box
                                        key={itemId}
                                        sx={{
                                            opacity:   removing === itemId ? 0 : 1,
                                            transform: removing === itemId ? "translateX(-20px)" : "none",
                                            transition: "opacity 0.25s, transform 0.25s",
                                        }}
                                    >
                                        <CartItem
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

                            <Box onClick={() => navigate("/")} sx={{
                                display: "inline-flex", alignItems: "center", gap: 1,
                                mt: 3, cursor: "pointer", color: "#aaa",
                                "&:hover": { color: "#000" }, transition: "color 0.15s",
                            }}>
                                <ArrowBack sx={{ fontSize: 13 }} />
                                <MonoLabel sx={{ color: "inherit" }}>Continue Shopping</MonoLabel>
                            </Box>
                        </Grid>

                        {/* ── Order summary ── */}
                        <Grid item xs={12} md={4} sx={{ animation: "cFadeIn 0.4s 0.2s ease both" }}>
                            <Box sx={{
                                backgroundColor: "#fff", border: "1px solid #e0e0e0",
                                position: { md: "sticky" }, top: { md: 24 },
                            }}>
                                <Box sx={{ backgroundColor: "#000", px: 3, py: 2 }}>
                                    <Typography sx={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 11, fontWeight: 600,
                                        letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff",
                                    }}>
                                        Order Summary
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 3 }}>
                                    <Box sx={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "baseline", mb: 1.5,
                                    }}>
                                        <MonoLabel>{`Subtotal (${cart.length} item${cart.length !== 1 ? "s" : ""})`}</MonoLabel>
                                        <Typography sx={{
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontSize: 13, color: "#444",
                                        }}>
                                            Rs {subtotal.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ borderTop: "1px solid #000", my: 2.5 }} />

                                    <Box sx={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "baseline", mb: 3,
                                    }}>
                                        <MonoLabel sx={{ color: "#000" }}>Total</MonoLabel>
                                        <Typography sx={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontWeight: 700, fontSize: 28, color: "#000", lineHeight: 1,
                                        }}>
                                            Rs {subtotal.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box onClick={() => navigate("/checkout")} sx={{
                                        width: "100%", py: 2,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5,
                                        backgroundColor: "#000", color: "#fff", cursor: "pointer",
                                        "&:hover": { backgroundColor: "#222" }, transition: "background-color 0.2s",
                                    }}>
                                        <Typography sx={{
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontWeight: 600, fontSize: 12,
                                            letterSpacing: "0.1em", textTransform: "uppercase",
                                        }}>
                                            Proceed to Checkout
                                        </Typography>
                                        <ArrowForward sx={{ fontSize: 15 }} />
                                    </Box>

                                    {subtotal < 5000 ? (
                                        <Box sx={{ mt: 2, p: 1.5, backgroundColor: "#f5f5f0", border: "1px solid #e8e8e8" }}>
                                            <Typography sx={{
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: 9, letterSpacing: "0.08em",
                                                color: "#888", textAlign: "center",
                                            }}>
                                                Add Rs {(5000 - subtotal).toFixed(2)} more for free shipping
                                            </Typography>
                                            <Box sx={{ mt: 1, height: 2, backgroundColor: "#e8e8e8", position: "relative" }}>
                                                <Box sx={{
                                                    position: "absolute", left: 0, top: 0, height: "100%",
                                                    width: `${Math.min((subtotal / 5000) * 100, 100)}%`,
                                                    backgroundColor: "#000", transition: "width 0.4s ease",
                                                }} />
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            mt: 2, p: 1.5, backgroundColor: "#000",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <Typography sx={{
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: 9, letterSpacing: "0.1em",
                                                textTransform: "uppercase", color: "#fff",
                                            }}>
                                                ✓ Free Shipping Applied
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>

                {/* Footer */}
                <Box sx={{
                    borderTop: "1px solid #e0e0e0", backgroundColor: "#fff",
                    py: 2.5, px: { xs: 3, md: 5 },
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", flexWrap: "wrap", gap: 1,
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, color: "#ccc", letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                        © {new Date().getFullYear()} CLOTHIFY — All Rights Reserved
                    </Typography>
                    <Box onClick={() => navigate("/")} sx={{
                        display: "flex", alignItems: "center", gap: 0.8,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase",
                        cursor: "pointer", "&:hover": { color: "#000" }, transition: "color 0.15s",
                    }}>
                        <ArrowBack sx={{ fontSize: 11 }} />
                        Home
                    </Box>
                </Box>

                {/* Toast */}
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
                            borderRadius: 0, border: "1px solid #000",
                            backgroundColor: "#fff", color: "#000",
                            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
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