import {
    Box,
    Container,
    Grid,
    Typography,
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Add, Remove, ShoppingCart, ArrowBack, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductSection from "../components/home/ProductSection";
import productService from "../services/productService";
import axios from "axios";
import authService from "../services/authService";

/* ─── API helpers ────────────────────────────────────────────── */
const API = "http://localhost:8080";

const getUser    = () => authService.getCurrentUser();
const getHeaders = () => {
    const u = getUser();
    return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
};

/*
  Backend cart endpoints:
  GET  /api/cart/customer/{cid}                        → CartDTO { items: [...] }
  POST /api/cart/customer/{cid}/add                    body: { productId, quantity, color, size }
*/

/* ─── Color map ──────────────────────────────────────────────── */
const COLOR_HEX = {
    BLACK: "#000000", WHITE: "#FFFFFF", RED: "#EF4444", BLUE: "#3B82F6",
    GREEN: "#22C55E", YELLOW: "#EAB308", PURPLE: "#A855F7", PINK: "#EC4899",
    ORANGE: "#F97316", GRAY: "#6B7280", BROWN: "#92400E", NAVY: "#1E3A5F",
};

/* ─── Google Fonts ───────────────────────────────────────────── */
if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#pd-styles")) {
    const s = document.createElement("style");
    s.id = "pd-styles";
    s.textContent = `
        @keyframes pdImgIn  { from{opacity:0;transform:scale(1.04)} to{opacity:1;transform:scale(1)} }
        @keyframes pdFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pdSpin   { to{transform:rotate(360deg)} }
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

/* ─── Image helpers ──────────────────────────────────────────── */
const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API}${url.startsWith("/") ? url : `/${url}`}`;
};

const collectImages = (product) => {
    const imgs = [];
    const push = (u) => {
        const r = resolveUrl(u);
        if (r && !imgs.includes(r) && imgs.length < 6) imgs.push(r);
    };
    push(product.imageUrl);
    [product.imageUrl2, product.imageUrl3, product.imageUrl4, product.imageUrl5, product.imageUrl6].forEach(push);
    [product.image2,    product.image3,    product.image4,    product.image5,    product.image6].forEach(push);
    if (Array.isArray(product.images))    product.images.forEach(push);
    if (Array.isArray(product.imageUrls)) product.imageUrls.forEach(push);
    return imgs;
};

/* ─── Cart quantity helpers ──────────────────────────────────── */
/*  Given the backend CartDTO items array, find how many units of
    this product (+ optional color/size) are already in the cart.  */
const getInCartQty = (cartItems, productId, color, size) => {
    if (!cartItems?.length) return 0;
    return cartItems
        .filter(item => {
            const pid   = item.productId ?? item.product?.productId;
            const iColor = item.color ?? item.selectedColor ?? null;
            const iSize  = item.size  ?? item.selectedSize  ?? null;
            if (pid !== productId) return false;
            /* If color/size are specified, match them exactly */
            if (color && size) return iColor === color && iSize === size;
            /* No variant — match product-level */
            return true;
        })
        .reduce((sum, item) => sum + (item.quantity ?? 1), 0);
};

/* ─── Small components ───────────────────────────────────────── */
const MonoLabel = ({ children, sx = {} }) => (
    <Typography sx={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10, fontWeight: 600,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "#888", ...sx,
    }}>
        {children}
    </Typography>
);

const SectionDivider = ({ label }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 5 }}>
        <Box sx={{ width: 3, height: 28, backgroundColor: "#000", flexShrink: 0 }} />
        <Typography sx={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#000",
        }}>
            {label}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }} />
    </Box>
);

/* ─── Thumbnail strip ────────────────────────────────────────── */
const ThumbStrip = ({ images, active, onChange }) => (
    <Box sx={{
        display: "flex",
        flexDirection: { xs: "row", md: "column" },
        gap: 1, flexShrink: 0,
        overflowX: { xs: "auto", md: "visible" },
        overflowY: { xs: "visible", md: "auto" },
        maxHeight: { md: 520 },
        pb: { xs: 0.5, md: 0 },
        "&::-webkit-scrollbar": { display: "none" },
    }}>
        {images.map((src, i) => (
            <Box key={i} onClick={() => onChange(i)} sx={{
                flexShrink: 0,
                width:  { xs: 60, md: 68 },
                height: { xs: 60, md: 68 },
                border: "2px solid",
                borderColor: active === i ? "#000" : "#e0e0e0",
                overflow: "hidden", cursor: "pointer", position: "relative",
                opacity: active === i ? 1 : 0.5,
                transition: "border-color 0.15s, opacity 0.15s",
                "&:hover": { borderColor: "#000", opacity: 1 },
            }}>
                <Box component="img" src={src} sx={{
                    width: "100%", height: "100%", objectFit: "cover", display: "block",
                    filter: active === i ? "grayscale(0%)" : "grayscale(25%)",
                    transition: "filter 0.2s",
                }} />
                {active === i && (
                    <Box sx={{ position: "absolute", bottom: 3, right: 3, width: 5, height: 5, backgroundColor: "#000" }} />
                )}
            </Box>
        ))}
    </Box>
);

/* ─── Main image ─────────────────────────────────────────────── */
const MainImage = ({ src, index, total, onPrev, onNext, discountLabel }) => (
    <Box sx={{
        position: "relative", width: "100%",
        height: { xs: 320, md: 520 },
        overflow: "hidden", backgroundColor: "#f0f0eb",
    }}>
        <Box key={src} component="img" src={src} alt="" sx={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            animation: "pdImgIn 0.3s ease both",
            transition: "transform 0.4s ease",
            "&:hover": { transform: "scale(1.03)" },
        }} />

        {discountLabel && (
            <Box sx={{
                position: "absolute", top: 0, left: 0,
                backgroundColor: "#000", color: "#fff",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                px: 1.5, py: 0.7,
            }}>
                {discountLabel}
            </Box>
        )}

        <Box sx={{
            position: "absolute", bottom: 10, left: 10,
            backgroundColor: "rgba(0,0,0,0.5)", px: 1.5, py: 0.5,
        }}>
            <Typography sx={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9, letterSpacing: "0.12em", color: "#fff",
            }}>
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </Typography>
        </Box>

        {total > 1 && [
            { side: "left",  icon: <ChevronLeft  sx={{ fontSize: 20 }} />, action: onPrev },
            { side: "right", icon: <ChevronRight sx={{ fontSize: 20 }} />, action: onNext },
        ].map(({ side, icon, action }) => (
            <Box key={side} onClick={action} sx={{
                position: "absolute", [side]: 10,
                top: "50%", transform: "translateY(-50%)",
                width: 36, height: 36,
                backgroundColor: "rgba(255,255,255,0.85)",
                border: "1px solid #e0e0e0",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
                "&:hover": { backgroundColor: "#000", color: "#fff", border: "1px solid #000" },
            }}>
                {icon}
            </Box>
        ))}
    </Box>
);

/* ─── Main Component ─────────────────────────────────────────── */
const ProductDetails = () => {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [product,  setProduct]  = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);

    /* Gallery */
    const [images,    setImages]    = useState([]);
    const [activeImg, setActiveImg] = useState(0);

    /* Variants */
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize,  setSelectedSize]  = useState(null);

    /* Backend cart state */
    const [cartItems,   setCartItems]   = useState([]);   /* raw items from CartDTO */
    const [addingToCart, setAddingToCart] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    /* ── Fetch backend cart ── */
    const fetchCart = useCallback(async () => {
        const user = getUser();
        if (!user?.customerId) return;
        try {
            const res  = await axios.get(`${API}/api/cart/customer/${user.customerId}`, { headers: getHeaders() });
            const data = res.data;
            const items = Array.isArray(data) ? data : (data.items ?? data.cartItems ?? data.cart ?? []);
            setCartItems(items);
        } catch (_) {
            /* Cart fetch failing silently is fine — we just show 0 in cart */
        }
    }, []);

    useEffect(() => { fetchProduct(); }, [id]);

    /* Re-fetch cart whenever another part of the app updates it */
    useEffect(() => {
        fetchCart();
        const handler = () => fetchCart();
        window.addEventListener("cartUpdated", handler);
        return () => window.removeEventListener("cartUpdated", handler);
    }, [fetchCart]);

    const fetchProduct = async () => {
        try {
            const data = await productService.getProductById(id);
            setProduct(data);
            setImages(collectImages(data));

            if (data.variants?.length > 0) {
                const first = data.variants.find(v => v.quantity > 0) || data.variants[0];
                setSelectedColor(first.color);
                setSelectedSize(first.size);
            }

            const all = await productService.getActiveProducts();
            setRelatedProducts(
                all.filter(p => p.categoryId === data.categoryId && p.productId !== data.productId).slice(0, 10)
            );
        } catch (err) {
            console.error("Error fetching product:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ── Derived cart quantities ── */
    const productId = product?.productId || product?.id;

    /* How many of this exact variant are already in the cart */
    const inCartQty = (() => {
        if (!product) return 0;
        const hasVariants = product.variants?.length > 0;
        if (hasVariants && selectedColor && selectedSize)
            return getInCartQty(cartItems, productId, selectedColor, selectedSize);
        if (!hasVariants)
            return getInCartQty(cartItems, productId, null, null);
        return 0;
    })();

    /* ── Stock helpers ── */
    const getAvailableColors = () => [...new Set((product?.variants || []).map(v => v.color))];
    const getAvailableSizes  = () => {
        if (!product?.variants?.length || !selectedColor) return [];
        return product.variants.filter(v => v.color === selectedColor).map(v => v.size);
    };

    const getVariantStock = () => {
        if (!product) return 0;
        if (!product.variants?.length) return product.stockQuantity || 0;
        if (!selectedColor || !selectedSize) return 0;
        return product.variants.find(v => v.color === selectedColor && v.size === selectedSize)?.quantity || 0;
    };

    /* Stock remaining after accounting for what's already in cart */
    const availableToAdd = Math.max(0, getVariantStock() - inCartQty);

    const handleQuantityChange = (delta) => {
        const next = quantity + delta;
        if (next >= 1 && next <= availableToAdd) setQuantity(next);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        const sizes = product.variants.filter(v => v.color === color).map(v => v.size);
        if (!sizes.includes(selectedSize)) {
            const first = product.variants.find(v => v.color === color && v.quantity > 0);
            setSelectedSize(first ? first.size : sizes[0]);
        }
        setQuantity(1);
    };

    const handleSizeSelect = (size) => { setSelectedSize(size); setQuantity(1); };

    /* ── Add to cart ── */
    const handleAddToCart = async () => {
        const hasVariants = product.variants?.length > 0;
        if (hasVariants && (!selectedColor || !selectedSize)) {
            setSnackbar({ open: true, message: "Please select color and size", severity: "warning" });
            return;
        }
        const user = getUser();
        if (!user) {
            setSnackbar({ open: true, message: "Please log in to add items to cart", severity: "error" });
            return;
        }
        if (availableToAdd <= 0) {
            setSnackbar({ open: true, message: "No more stock available", severity: "warning" });
            return;
        }

        setAddingToCart(true);
        try {
            await axios.post(
                `${API}/api/cart/customer/${user.customerId}/add`,
                { productId, quantity, color: selectedColor, size: selectedSize },
                { headers: getHeaders() }
            );
            /* Refresh cart from backend so counts are accurate */
            await fetchCart();
            window.dispatchEvent(new Event("cartUpdated"));
            setSnackbar({ open: true, message: `${quantity} item${quantity > 1 ? "s" : ""} added to cart`, severity: "success" });
            setQuantity(1);
        } catch {
            setSnackbar({ open: true, message: "Failed to add item to cart", severity: "error" });
        } finally {
            setAddingToCart(false);
        }
    };

    /* ── Loading / Not found ── */
    if (loading) return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>
                <Navbar />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Box sx={{
                            width: 34, height: 34, border: "2px solid #000",
                            borderTopColor: "transparent", borderRadius: "50%",
                            mx: "auto", mb: 2, animation: "pdSpin 0.7s linear infinite",
                        }} />
                        <MonoLabel>Loading product...</MonoLabel>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );

    if (!product) return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>
                <Navbar />
                <Box sx={{ textAlign: "center", py: 16 }}>
                    <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22 }}>
                        Product not found
                    </Typography>
                </Box>
            </Box>
        </ThemeProvider>
    );

    const hasVariants     = product.variants?.length > 0;
    const hasDiscount     = product.discount && parseFloat(product.discount) > 0;
    const originalPrice   = parseFloat(product.sellingPrice || product.price || 0);
    const finalPrice      = hasDiscount && product.discountPrice ? parseFloat(product.discountPrice) : originalPrice;
    const availableColors = getAvailableColors();
    const availableSizes  = getAvailableSizes();
    const variantStock    = getVariantStock();
    const cantAdd         = hasVariants && (!selectedColor || !selectedSize);

    return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0", fontFamily: "'IBM Plex Mono', monospace" }}>
                <Navbar />

                <Container maxWidth="lg" sx={{ pt: 4, pb: 0 }}>
                    {/* Back */}
                    <Box onClick={() => navigate(-1)} sx={{
                        display: "inline-flex", alignItems: "center", gap: 1,
                        mb: 4, cursor: "pointer", color: "#aaa",
                        "&:hover": { color: "#000" }, transition: "color 0.15s",
                    }}>
                        <ArrowBack sx={{ fontSize: 13 }} />
                        <MonoLabel sx={{ color: "inherit" }}>Back to Products</MonoLabel>
                    </Box>

                    {/* ════ PRODUCT CARD ════ */}
                    <Box sx={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        animation: "pdFadeUp 0.45s ease both",
                        mb: 8,
                    }}>
                        <Grid container>

                            {/* ── GALLERY ── */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{
                                    borderRight:  { xs: "none", md: "1px solid #e0e0e0" },
                                    borderBottom: { xs: "1px solid #e0e0e0", md: "none" },
                                    p: images.length > 0 ? { xs: 1.5, md: 2 } : 0,
                                }}>
                                    {images.length > 0 ? (
                                        <>
                                            <Box sx={{
                                                display: "flex",
                                                flexDirection: { xs: "column", md: "row" },
                                                gap: { xs: 1.5, md: 1.5 },
                                            }}>
                                                {images.length > 1 && (
                                                    <Box sx={{ order: { xs: 2, md: 1 } }}>
                                                        <ThumbStrip images={images} active={activeImg} onChange={setActiveImg} />
                                                    </Box>
                                                )}
                                                <Box sx={{ flex: 1, order: { xs: 1, md: 2 } }}>
                                                    <MainImage
                                                        src={images[activeImg]}
                                                        index={activeImg}
                                                        total={images.length}
                                                        discountLabel={hasDiscount ? `${parseFloat(product.discount).toFixed(0)}% OFF` : null}
                                                        onPrev={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                                                        onNext={() => setActiveImg(i => (i + 1) % images.length)}
                                                    />
                                                    {images.length > 1 && (
                                                        <Box sx={{
                                                            display: { xs: "flex", md: "none" },
                                                            justifyContent: "center", gap: 0.8, mt: 1.5,
                                                        }}>
                                                            {images.map((_, i) => (
                                                                <Box key={i} onClick={() => setActiveImg(i)} sx={{
                                                                    width: activeImg === i ? 20 : 6, height: 3,
                                                                    backgroundColor: activeImg === i ? "#000" : "#ccc",
                                                                    cursor: "pointer", transition: "all 0.2s ease",
                                                                }} />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>

                                            {/* Gallery footer */}
                                            <Box sx={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                mt: 2, pt: 1.5, borderTop: "1px solid #f0f0eb",
                                            }}>
                                                <MonoLabel sx={{ color: "#ccc" }}>{images.length} / 6 photos</MonoLabel>
                                                <Box sx={{ display: "flex", gap: 0.7, alignItems: "center" }}>
                                                    {Array.from({ length: 6 }).map((_, i) => (
                                                        <Box key={i} onClick={() => i < images.length && setActiveImg(i)} sx={{
                                                            width:  activeImg === i ? 18 : 6, height: 4,
                                                            backgroundColor: i < images.length
                                                                ? activeImg === i ? "#000" : "#ccc"
                                                                : "#ebebeb",
                                                            cursor: i < images.length ? "pointer" : "default",
                                                            transition: "all 0.2s ease",
                                                        }} />
                                                    ))}
                                                </Box>
                                            </Box>
                                        </>
                                    ) : (
                                        <Box sx={{
                                            height: { xs: 320, md: 520 },
                                            backgroundColor: "#ebebeb",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <Typography sx={{
                                                fontFamily: "'Playfair Display', serif",
                                                fontWeight: 900, fontStyle: "italic",
                                                fontSize: 80, color: "rgba(0,0,0,0.07)", userSelect: "none",
                                            }}>
                                                {product.productName?.[0] || "?"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>

                            {/* ── INFO PANEL ── */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ p: { xs: 3, md: 5 }, height: "100%", display: "flex", flexDirection: "column" }}>

                                    {/* Breadcrumb */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
                                        <Box sx={{
                                            border: "1px solid #e0e0e0", px: 1.2, py: 0.35,
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontSize: 10, color: "#888", letterSpacing: "0.08em",
                                        }}>
                                            {product.categoryName || "Category"}
                                        </Box>
                                        {product.subCategoryName && (
                                            <>
                                                <Typography sx={{ color: "#ccc", fontSize: 12 }}>›</Typography>
                                                <Box sx={{
                                                    border: "1px solid #e0e0e0", px: 1.2, py: 0.35,
                                                    fontFamily: "'IBM Plex Mono', monospace",
                                                    fontSize: 10, color: "#aaa", letterSpacing: "0.08em",
                                                }}>
                                                    {product.subCategoryName}
                                                </Box>
                                            </>
                                        )}
                                    </Box>

                                    {/* Name */}
                                    <Typography sx={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontWeight: 900,
                                        fontSize: { xs: 28, md: 38 },
                                        letterSpacing: "-0.02em",
                                        lineHeight: 1.05, color: "#000", mb: 3,
                                    }}>
                                        {product.productName}
                                    </Typography>

                                    {/* Price */}
                                    <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #f0f0eb" }}>
                                        {hasDiscount ? (
                                            <>
                                                <Typography sx={{
                                                    fontFamily: "'IBM Plex Mono', monospace",
                                                    fontSize: 13, color: "#bbb",
                                                    textDecoration: "line-through", mb: 0.4,
                                                }}>
                                                    Rs {originalPrice.toFixed(2)}
                                                </Typography>
                                                <Typography sx={{
                                                    fontFamily: "'Playfair Display', serif",
                                                    fontWeight: 700, fontSize: 40,
                                                    letterSpacing: "-0.02em", color: "#000", lineHeight: 1,
                                                }}>
                                                    Rs {finalPrice.toFixed(2)}
                                                </Typography>
                                                <MonoLabel sx={{ color: "#666", mt: 0.6 }}>
                                                    You save Rs {(originalPrice - finalPrice).toFixed(2)}
                                                </MonoLabel>
                                            </>
                                        ) : (
                                            <Typography sx={{
                                                fontFamily: "'Playfair Display', serif",
                                                fontWeight: 700, fontSize: 40,
                                                letterSpacing: "-0.02em", color: "#000", lineHeight: 1,
                                            }}>
                                                Rs {originalPrice.toFixed(2)}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Description */}
                                    <Typography sx={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 12, color: "#666", lineHeight: 1.85, mb: 4,
                                    }}>
                                        {product.productDescription || "No description available."}
                                    </Typography>

                                    {/* ── COLORS ── */}
                                    {hasVariants && availableColors.length > 0 && (
                                        <Box sx={{ mb: 3.5 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                                                <MonoLabel>Color</MonoLabel>
                                                {selectedColor && (
                                                    <Typography sx={{
                                                        fontFamily: "'IBM Plex Mono', monospace",
                                                        fontSize: 11, color: "#000", fontWeight: 600,
                                                    }}>
                                                        — {selectedColor}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                                {availableColors.map((color) => {
                                                    const isSelected = selectedColor === color;
                                                    const hasStock   = product.variants.some(v => v.color === color && v.quantity > 0);
                                                    return (
                                                        <Box key={color} onClick={() => handleColorSelect(color)} title={color} sx={{
                                                            width: 36, height: 36,
                                                            backgroundColor: COLOR_HEX[color] || "#ccc",
                                                            border: isSelected ? "3px solid #000" : "2px solid #e0e0e0",
                                                            outline: isSelected ? "2px solid #fff" : "none",
                                                            outlineOffset: "-4px",
                                                            cursor: "pointer",
                                                            opacity: hasStock ? 1 : 0.25,
                                                            transition: "all 0.15s ease",
                                                            "&:hover": { transform: "scale(1.12)" },
                                                            ...(color === "WHITE" && { borderColor: isSelected ? "#000" : "#ccc" }),
                                                        }} />
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* ── SIZES ── */}
                                    {hasVariants && availableSizes.length > 0 && (
                                        <Box sx={{ mb: 3 }}>
                                            <MonoLabel sx={{ mb: 1.5 }}>Size</MonoLabel>
                                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                {availableSizes.map((size) => {
                                                    const isSelected  = selectedSize === size;
                                                    const variant     = product.variants.find(v => v.color === selectedColor && v.size === size);
                                                    const isAvailable = variant && variant.quantity > 0;
                                                    return (
                                                        <Box key={size} onClick={() => isAvailable && handleSizeSelect(size)} sx={{
                                                            px: 2, py: 0.9,
                                                            border: "1px solid",
                                                            borderColor: isSelected ? "#000" : "#e0e0e0",
                                                            backgroundColor: isSelected ? "#000" : "#fff",
                                                            color: isSelected ? "#fff" : isAvailable ? "#000" : "#ccc",
                                                            fontFamily: "'IBM Plex Mono', monospace",
                                                            fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
                                                            cursor: isAvailable ? "pointer" : "not-allowed",
                                                            opacity: isAvailable ? 1 : 0.35,
                                                            transition: "all 0.15s ease",
                                                            "&:hover": isAvailable ? {
                                                                borderColor: "#000",
                                                                backgroundColor: isSelected ? "#000" : "#f5f5f0",
                                                            } : {},
                                                        }}>
                                                            {size}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* ── STOCK + CART STATUS ── */}
                                    {!cantAdd && (
                                        <Box sx={{
                                            display: "flex", gap: 2, flexWrap: "wrap",
                                            mb: 3, p: 1.5,
                                            backgroundColor: "#f8f8f5",
                                            border: "1px solid #ebebeb",
                                        }}>
                                            {/* Stock */}
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box sx={{
                                                    width: 6, height: 6,
                                                    backgroundColor: variantStock === 0 ? "#e53935"
                                                        : variantStock <= 5 ? "#f59e0b" : "#22c55e",
                                                    borderRadius: "50%",
                                                    flexShrink: 0,
                                                }} />
                                                <MonoLabel sx={{ color: "#666" }}>
                                                    {variantStock === 0
                                                        ? "Out of stock"
                                                        : variantStock <= 5
                                                        ? `Only ${variantStock} left`
                                                        : `${variantStock} in stock`}
                                                </MonoLabel>
                                            </Box>

                                            {/* Separator */}
                                            {inCartQty > 0 && <Box sx={{ width: "1px", backgroundColor: "#e0e0e0", flexShrink: 0 }} />}

                                            {/* Already in cart */}
                                            {inCartQty > 0 && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <ShoppingCart sx={{ fontSize: 11, color: "#000" }} />
                                                    <MonoLabel sx={{ color: "#000" }}>
                                                        {inCartQty} already in cart
                                                    </MonoLabel>
                                                </Box>
                                            )}

                                            {/* Can still add */}
                                            {inCartQty > 0 && availableToAdd > 0 && (
                                                <>
                                                    <Box sx={{ width: "1px", backgroundColor: "#e0e0e0", flexShrink: 0 }} />
                                                    <MonoLabel sx={{ color: "#aaa" }}>
                                                        {availableToAdd} more available
                                                    </MonoLabel>
                                                </>
                                            )}
                                        </Box>
                                    )}

                                    {/* ── QTY + ADD TO CART ── */}
                                    {availableToAdd > 0 && !cantAdd ? (
                                        <Box sx={{ mt: "auto" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
                                                <MonoLabel>Qty</MonoLabel>
                                                <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #e0e0e0" }}>
                                                    <IconButton size="small" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}
                                                        sx={{
                                                            borderRadius: 0, px: 1.5, py: 1,
                                                            "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                            "&:disabled": { color: "#ddd" }, transition: "all 0.15s",
                                                        }}>
                                                        <Remove sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                    <Typography sx={{
                                                        fontFamily: "'Playfair Display', serif",
                                                        fontWeight: 700, fontSize: 18,
                                                        px: 3, minWidth: 48, textAlign: "center",
                                                        borderLeft: "1px solid #e0e0e0",
                                                        borderRight: "1px solid #e0e0e0",
                                                        py: 0.8, lineHeight: 1.4,
                                                    }}>
                                                        {quantity}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => handleQuantityChange(1)} disabled={quantity >= availableToAdd}
                                                        sx={{
                                                            borderRadius: 0, px: 1.5, py: 1,
                                                            "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                            "&:disabled": { color: "#ddd" }, transition: "all 0.15s",
                                                        }}>
                                                        <Add sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Box>
                                                <MonoLabel sx={{ color: "#bbb" }}>{availableToAdd} available</MonoLabel>
                                            </Box>

                                            <Box
                                                onClick={!addingToCart ? handleAddToCart : undefined}
                                                sx={{
                                                    width: "100%", py: 2,
                                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5,
                                                    backgroundColor: addingToCart ? "#555" : "#000",
                                                    color: "#fff",
                                                    cursor: addingToCart ? "not-allowed" : "pointer",
                                                    transition: "background-color 0.2s ease",
                                                    "&:hover": !addingToCart ? { backgroundColor: "#222" } : {},
                                                }}
                                            >
                                                <ShoppingCart sx={{ fontSize: 16 }} />
                                                <Typography sx={{
                                                    fontFamily: "'IBM Plex Mono', monospace",
                                                    fontWeight: 600, fontSize: 12,
                                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                                }}>
                                                    {addingToCart ? "Adding…" : "Add to Cart"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ mt: "auto", border: "1px solid #000", p: 2, backgroundColor: "#f5f5f0" }}>
                                            <Typography sx={{
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: 11, fontWeight: 600,
                                                letterSpacing: "0.08em", textTransform: "uppercase", color: "#000",
                                            }}>
                                                {cantAdd
                                                    ? "Select color and size"
                                                    : inCartQty > 0 && availableToAdd === 0
                                                    ? `Max quantity in cart (${inCartQty})`
                                                    : hasVariants && selectedColor && selectedSize
                                                    ? `${selectedColor} / ${selectedSize} — Out of stock`
                                                    : "Out of stock"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>

                {/* ════ RELATED PRODUCTS ════ */}
                {relatedProducts.length > 0 && (
                    <Box sx={{
                        borderTop: "2px solid #000",
                        backgroundColor: "#f5f5f0",
                        animation: "pdFadeUp 0.5s 0.3s ease both",
                    }}>
                        <Container maxWidth="xl" sx={{ pt: 6 }}>
                            <SectionDivider label={`More from ${product.categoryName || "this category"}`} />
                        </Container>
                        <ProductSection
                            products={relatedProducts}
                            getImageUrl={resolveUrl}
                            getCartQuantity={() => 0}
                            handleProductClick={(pid) => {
                                navigate(`/product/${pid}`);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        />
                    </Box>
                )}

                {/* Footer */}
                <Box sx={{
                    borderTop: "1px solid #e0e0e0", backgroundColor: "#fff",
                    py: 2.5, px: { xs: 3, md: 5 },
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", flexWrap: "wrap", gap: 1,
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, color: "#ccc",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                        © {new Date().getFullYear()} CLOTHIFY — All Rights Reserved
                    </Typography>
                    <Box onClick={() => navigate(-1)} sx={{
                        display: "flex", alignItems: "center", gap: 0.8,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase",
                        cursor: "pointer", "&:hover": { color: "#000" }, transition: "color 0.15s",
                    }}>
                        <ArrowBack sx={{ fontSize: 11 }} />
                        Back
                    </Box>
                </Box>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    <Alert
                        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                        severity={snackbar.severity}
                        sx={{
                            borderRadius: 0,
                            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                            border: "1px solid #000",
                            backgroundColor: "#fff", color: "#000",
                            "& .MuiAlert-icon": { color: "#000" },
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default ProductDetails;