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

/* ═══════════════════════════════════════════════════════════════════════════
   API CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */
const API = "http://localhost:8080";

const getUser = () => authService.getCurrentUser();
const getHeaders = () => {
    const u = getUser();
    return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const COLOR_HEX = {
    BLACK: "#000000", WHITE: "#FFFFFF", RED: "#EF4444", BLUE: "#3B82F6",
    GREEN: "#22C55E", YELLOW: "#EAB308", PURPLE: "#A855F7", PINK: "#EC4899",
    ORANGE: "#F97316", GRAY: "#6B7280", BROWN: "#92400E", NAVY: "#1E3A5F",
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
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

const bwTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#000" },
        background: { default: "#f5f5f0", paper: "#fff" },
        text: { primary: "#000", secondary: "#666" },
    },
    typography: { fontFamily: "'IBM Plex Mono', monospace" },
});

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

// Image URL resolver
const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API}${url.startsWith("/") ? url : `/${url}`}`;
};

// Collect all product images
const collectImages = (product) => {
    const imgs = [];
    const push = (u) => {
        const r = resolveUrl(u);
        if (r && !imgs.includes(r) && imgs.length < 6) imgs.push(r);
    };
    push(product.imageUrl);
    [product.imageUrl2, product.imageUrl3, product.imageUrl4, product.imageUrl5, product.imageUrl6].forEach(push);
    [product.image2, product.image3, product.image4, product.image5, product.image6].forEach(push);
    if (Array.isArray(product.images)) product.images.forEach(push);
    if (Array.isArray(product.imageUrls)) product.imageUrls.forEach(push);
    return imgs;
};

// Normalize string for comparison - CRITICAL for variant matching
const normalize = (str) => {
    if (!str) return null;
    return String(str).trim().toUpperCase();
};

// Extract color from cart item (handles all field variations)
const getItemColor = (item) => {
    return normalize(
        item.color || 
        item.selectedColor || 
        item.variant?.color || 
        item.product?.color ||
        null
    );
};

// Extract size from cart item (handles all field variations)
const getItemSize = (item) => {
    return normalize(
        item.size || 
        item.selectedSize || 
        item.variant?.size || 
        item.product?.size ||
        null
    );
};

// Get cart quantity for specific variant - IMPROVED VERSION
const getInCartQty = (cartItems, productId, color, size) => {
    if (!cartItems?.length) {
        console.log("🔍 Cart is empty");
        return 0;
    }

    const normalizedColor = normalize(color);
    const normalizedSize = normalize(size);

    console.log("🔍 Looking for variant:", {
        productId,
        color: normalizedColor,
        size: normalizedSize,
        totalCartItems: cartItems.length
    });

    const matchingItems = cartItems.filter(item => {
        const pid = item.productId ?? item.product?.productId;
        const itemColor = getItemColor(item);
        const itemSize = getItemSize(item);

        console.log(`  Checking item:`, {
            cartItemId: item.cartItemId ?? item.id,
            pid,
            itemColor,
            itemSize,
            qty: item.quantity
        });

        // Must match product ID
        if (pid !== productId) {
            console.log(`    ❌ Product ID mismatch (${pid} !== ${productId})`);
            return false;
        }

        // If checking for specific variant (has color AND size)
        if (normalizedColor && normalizedSize) {
            const colorMatch = itemColor === normalizedColor;
            const sizeMatch = itemSize === normalizedSize;
            const matches = colorMatch && sizeMatch;
            
            console.log(`    ${matches ? '✅' : '❌'} Variant: ${itemColor}/${itemSize} ${matches ? '==' : '!='} ${normalizedColor}/${normalizedSize}`);
            return matches;
        }

        // For non-variant products, only match items without color/size
        const noVariant = !itemColor && !itemSize;
        console.log(`    ${noVariant ? '✅' : '❌'} No-variant match: ${!itemColor && !itemSize}`);
        return noVariant;
    });

    const totalQty = matchingItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    
    console.log(`📊 Total quantity in cart for this variant: ${totalQty}`);
    console.log(`📦 Matching items:`, matchingItems.map(i => ({
        id: i.cartItemId ?? i.id,
        color: getItemColor(i),
        size: getItemSize(i),
        qty: i.quantity
    })));

    return totalQty;
};

// Find specific cart item for a variant - IMPROVED VERSION
const getCartItemForVariant = (cartItems, productId, color, size) => {
    if (!cartItems?.length) return null;

    const normalizedColor = normalize(color);
    const normalizedSize = normalize(size);

    console.log("🔎 Finding cart item for:", { productId, color: normalizedColor, size: normalizedSize });

    const found = cartItems.find(item => {
        const pid = item.productId ?? item.product?.productId;
        const itemColor = getItemColor(item);
        const itemSize = getItemSize(item);

        if (pid !== productId) return false;

        if (normalizedColor && normalizedSize) {
            return itemColor === normalizedColor && itemSize === normalizedSize;
        }

        return !itemColor && !itemSize;
    });

    if (found) {
        console.log("✅ Found cart item:", {
            cartItemId: found.cartItemId ?? found.id,
            color: getItemColor(found),
            size: getItemSize(found),
            quantity: found.quantity
        });
    } else {
        console.log("❌ Cart item not found");
    }

    return found;
};

/* ═══════════════════════════════════════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

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
                width: { xs: 60, md: 68 },
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
            { side: "left", icon: <ChevronLeft sx={{ fontSize: 20 }} />, action: onPrev },
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

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Product state
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Gallery state
    const [images, setImages] = useState([]);
    const [activeImg, setActiveImg] = useState(0);

    // Selection state
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Cart state
    const [cartItems, setCartItems] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);

    // UI state
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    /* ───────────────────────────────────────────────────────────────────────
       FETCH CART
       ─────────────────────────────────────────────────────────────────────── */
    const fetchCart = useCallback(async () => {
        const user = getUser();
        if (!user?.customerId) return;
        
        try {
            const res = await axios.get(`${API}/api/cart/customer/${user.customerId}`, { headers: getHeaders() });
            const data = res.data;
            const items = Array.isArray(data) ? data : (data.items ?? data.cartItems ?? data.cart ?? []);
            setCartItems(items);
            console.log("✅ Cart fetched:", items);
        } catch (err) {
            console.error("❌ Cart fetch failed:", err);
        }
    }, []);

    /* ───────────────────────────────────────────────────────────────────────
       FETCH PRODUCT
       ─────────────────────────────────────────────────────────────────────── */
    const fetchProduct = async () => {
        try {
            const data = await productService.getProductById(id);
            setProduct(data);
            setImages(collectImages(data));

            // Auto-select first available variant
            if (data.variants?.length > 0) {
                const first = data.variants.find(v => v.quantity > 0) || data.variants[0];
                setSelectedColor(first.color);
                setSelectedSize(first.size);
            }

            // Load related products
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

    /* ───────────────────────────────────────────────────────────────────────
       EFFECTS
       ─────────────────────────────────────────────────────────────────────── */
    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        fetchCart();
        const handler = () => fetchCart();
        window.addEventListener("cartUpdated", handler);
        return () => window.removeEventListener("cartUpdated", handler);
    }, [fetchCart]);

    // Debug: Log cart items whenever they change
    useEffect(() => {
        if (cartItems.length > 0) {
            console.log("🛒 Current Cart State:");
            console.table(cartItems.map(item => ({
                CartItemId: item.cartItemId ?? item.id,
                ProductId: item.productId ?? item.product?.productId,
                Color: getItemColor(item),
                Size: getItemSize(item),
                Quantity: item.quantity,
                RawColor: item.color || item.selectedColor || 'null',
                RawSize: item.size || item.selectedSize || 'null'
            })));
        }
    }, [cartItems]);

    /* ───────────────────────────────────────────────────────────────────────
       COMPUTED VALUES
       ─────────────────────────────────────────────────────────────────────── */
    const productId = product?.productId || product?.id;
    const hasVariants = product?.variants?.length > 0;
    
    const availableColors = [...new Set((product?.variants || []).map(v => v.color))];
    const availableSizes = (() => {
        if (!hasVariants || !selectedColor) return [];
        return product.variants.filter(v => v.color === selectedColor).map(v => v.size);
    })();

    const variantStock = (() => {
        if (!product) return 0;
        if (!hasVariants) return product.stockQuantity || 0;
        if (!selectedColor || !selectedSize) return 0;
        return product.variants.find(v => v.color === selectedColor && v.size === selectedSize)?.quantity || 0;
    })();

    const inCartQty = (() => {
        if (!product) return 0;
        if (hasVariants && selectedColor && selectedSize) {
            return getInCartQty(cartItems, productId, selectedColor, selectedSize);
        }
        if (!hasVariants) {
            return getInCartQty(cartItems, productId, null, null);
        }
        return 0;
    })();

    const availableToAdd = Math.max(0, variantStock - inCartQty);
    const cantAdd = hasVariants && (!selectedColor || !selectedSize);

    const hasDiscount = product?.discount && parseFloat(product.discount) > 0;
    const originalPrice = parseFloat(product?.sellingPrice || product?.price || 0);
    const finalPrice = hasDiscount && product?.discountPrice ? parseFloat(product.discountPrice) : originalPrice;

    // Debug: Log selected variant
    useEffect(() => {
        if (selectedColor && selectedSize) {
            console.log("🎨 Selected Variant:", {
                color: normalize(selectedColor),
                size: normalize(selectedSize),
                stock: variantStock,
                inCart: inCartQty,
                available: availableToAdd
            });
        }
    }, [selectedColor, selectedSize, variantStock, inCartQty, availableToAdd]);

    /* ───────────────────────────────────────────────────────────────────────
       HANDLERS
       ─────────────────────────────────────────────────────────────────────── */
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

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setQuantity(1);
    };

    const handleAddToCart = async () => {
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
            setSnackbar({ 
                open: true, 
                message: `No more stock available. You already have ${inCartQty} in cart.`, 
                severity: "warning" 
            });
            return;
        }

        console.log("➕ Adding to cart:", {
            productId,
            quantity,
            color: selectedColor,
            size: selectedSize,
            currentInCart: inCartQty,
            stock: variantStock,
            availableToAdd
        });

        setAddingToCart(true);
        try {
            const payload = { 
                productId, 
                quantity, 
                color: selectedColor || null, 
                size: selectedSize || null 
            };

            console.log("📤 API Request:", payload);

            const response = await axios.post(
                `${API}/api/cart/customer/${user.customerId}/add`,
                payload,
                { headers: getHeaders() }
            );
            
            console.log("📥 API Response:", response.data);
            
            await fetchCart();
            window.dispatchEvent(new Event("cartUpdated"));
            
            setSnackbar({ 
                open: true, 
                message: `${quantity} item${quantity > 1 ? "s" : ""} added to cart`, 
                severity: "success" 
            });
            setQuantity(1);
        } catch (err) {
            console.error("❌ Add to cart error:", err);
            console.error("Error response:", err.response?.data);
            setSnackbar({ 
                open: true, 
                message: err.response?.data?.message || "Failed to add item to cart", 
                severity: "error" 
            });
        } finally {
            setAddingToCart(false);
        }
    };

    const handleUpdateCartQty = async (delta) => {
        const user = getUser();
        if (!user?.customerId) return;

        const cartItem = getCartItemForVariant(cartItems, productId, selectedColor, selectedSize);
        if (!cartItem) {
            console.error("❌ Cart item not found for variant:", {
                productId,
                color: normalize(selectedColor),
                size: normalize(selectedSize)
            });
            setSnackbar({ open: true, message: "Item not found in cart", severity: "error" });
            return;
        }

        const cartItemId = cartItem.cartItemId ?? cartItem.id;
        const newQty = cartItem.quantity + delta;

        console.log("🔄 Updating cart quantity:", {
            cartItemId,
            currentQty: cartItem.quantity,
            delta,
            newQty,
            stock: variantStock
        });

        // Validate new quantity
        if (newQty > variantStock) {
            setSnackbar({ 
                open: true, 
                message: `Only ${variantStock} available in stock`, 
                severity: "warning" 
            });
            return;
        }

        if (newQty <= 0) {
            // Remove item
            try {
                console.log("🗑️ Removing item from cart");
                await axios.delete(
                    `${API}/api/cart/customer/${user.customerId}/item/${cartItemId}`,
                    { headers: getHeaders() }
                );
                await fetchCart();
                window.dispatchEvent(new Event("cartUpdated"));
                setSnackbar({ open: true, message: "Item removed from cart", severity: "success" });
            } catch (err) {
                console.error("❌ Remove error:", err);
                setSnackbar({ open: true, message: "Failed to remove item", severity: "error" });
            }
        } else {
            // Update quantity
            try {
                console.log("📝 Updating quantity to:", newQty);
                await axios.put(
                    `${API}/api/cart/customer/${user.customerId}/item/${cartItemId}`,
                    null,
                    { params: { quantity: newQty }, headers: getHeaders() }
                );
                await fetchCart();
                window.dispatchEvent(new Event("cartUpdated"));
            } catch (err) {
                console.error("❌ Update error:", err);
                setSnackbar({ open: true, message: "Failed to update quantity", severity: "error" });
            }
        }
    };

    /* ───────────────────────────────────────────────────────────────────────
       LOADING / ERROR STATES
       ─────────────────────────────────────────────────────────────────────── */
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

    /* ───────────────────────────────────────────────────────────────────────
       RENDER
       ─────────────────────────────────────────────────────────────────────── */
    return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0", fontFamily: "'IBM Plex Mono', monospace" }}>
                <Navbar />

                <Container maxWidth="lg" sx={{ pt: 4, pb: 0 }}>
                    {/* Back Button */}
                    <Box onClick={() => navigate(-1)} sx={{
                        display: "inline-flex", alignItems: "center", gap: 1,
                        mb: 4, cursor: "pointer", color: "#aaa",
                        "&:hover": { color: "#000" }, transition: "color 0.15s",
                    }}>
                        <ArrowBack sx={{ fontSize: 13 }} />
                        <MonoLabel sx={{ color: "inherit" }}>Back to Products</MonoLabel>
                    </Box>

                    {/* Product Card */}
                    <Box sx={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        animation: "pdFadeUp 0.45s ease both",
                        mb: 8,
                    }}>
                        <Grid container>
                            {/* Gallery */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{
                                    borderRight: { xs: "none", md: "1px solid #e0e0e0" },
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

                                            <Box sx={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                mt: 2, pt: 1.5, borderTop: "1px solid #f0f0eb",
                                            }}>
                                                <MonoLabel sx={{ color: "#ccc" }}>{images.length} / 6 photos</MonoLabel>
                                                <Box sx={{ display: "flex", gap: 0.7, alignItems: "center" }}>
                                                    {Array.from({ length: 6 }).map((_, i) => (
                                                        <Box key={i} onClick={() => i < images.length && setActiveImg(i)} sx={{
                                                            width: activeImg === i ? 18 : 6, height: 4,
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

                            {/* Product Info */}
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

                                    {/* Product Name */}
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

                                    {/* Color Selection */}
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
                                                    const hasStock = product.variants.some(v => v.color === color && v.quantity > 0);
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

                                    {/* Size Selection */}
                                    {hasVariants && availableSizes.length > 0 && (
                                        <Box sx={{ mb: 3 }}>
                                            <MonoLabel sx={{ mb: 1.5 }}>Size</MonoLabel>
                                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                {availableSizes.map((size) => {
                                                    const isSelected = selectedSize === size;
                                                    const variant = product.variants.find(v => v.color === selectedColor && v.size === size);
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

                                    {/* Stock Status */}
                                    {!cantAdd && (
                                        <Box sx={{
                                            display: "flex", gap: 2, flexWrap: "wrap",
                                            mb: 3, p: 1.5,
                                            backgroundColor: "#f8f8f5",
                                            border: "1px solid #ebebeb",
                                        }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box sx={{
                                                    width: 6, height: 6,
                                                    backgroundColor: variantStock === 0 ? "#e53935"
                                                        : variantStock <= 5 ? "#f59e0b" : "#22c55e",
                                                    borderRadius: "50%",
                                                    flexShrink: 0,
                                                }} />
                                                <MonoLabel sx={{ color: "#666" }}>
                                                    {variantStock === 0 ? "Out of stock"
                                                        : variantStock <= 5 ? `Only ${variantStock} left`
                                                        : `${variantStock} in stock`}
                                                </MonoLabel>
                                            </Box>

                                            {inCartQty > 0 && (
                                                <>
                                                    <Box sx={{ width: "1px", backgroundColor: "#e0e0e0", flexShrink: 0 }} />
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <ShoppingCart sx={{ fontSize: 11, color: "#000" }} />
                                                        <MonoLabel sx={{ color: "#000" }}>
                                                            {inCartQty} in your cart
                                                        </MonoLabel>
                                                    </Box>
                                                </>
                                            )}

                                            {availableToAdd > 0 && (
                                                <>
                                                    <Box sx={{ width: "1px", backgroundColor: "#e0e0e0", flexShrink: 0 }} />
                                                    <MonoLabel sx={{ color: "#aaa" }}>
                                                        {availableToAdd} more available
                                                    </MonoLabel>
                                                </>
                                            )}
                                        </Box>
                                    )}

                                    {/* Cart Controls */}
                                    {!cantAdd ? (
                                        <Box sx={{ mt: "auto" }}>
                                            {/* In Cart Section */}
                                            {inCartQty > 0 && (
                                                <Box sx={{ mb: 3, p: 2, backgroundColor: "#f0f7ff", border: "1px solid #e3f2fd", borderRadius: 1 }}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                                        <Typography sx={{
                                                            fontFamily: "'IBM Plex Mono', monospace",
                                                            fontSize: 10, fontWeight: 600,
                                                            letterSpacing: "0.1em", textTransform: "uppercase",
                                                            color: "#1976d2",
                                                        }}>
                                                            In Your Cart
                                                        </Typography>

                                                        {/* Variant Badges */}
                                                        {hasVariants && selectedColor && selectedSize && (
                                                            <Box sx={{ display: "flex", gap: 0.8 }}>
                                                                <Box sx={{
                                                                    display: "flex", alignItems: "center", gap: 0.5,
                                                                    px: 0.8, py: 0.3,
                                                                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                                                                    borderRadius: 0.5,
                                                                }}>
                                                                    <Box sx={{
                                                                        width: 8, height: 8,
                                                                        backgroundColor: COLOR_HEX[selectedColor] || "#ccc",
                                                                        border: "1px solid rgba(0,0,0,0.2)",
                                                                        borderRadius: "50%",
                                                                    }} />
                                                                    <Typography sx={{
                                                                        fontFamily: "'IBM Plex Mono', monospace",
                                                                        fontSize: 8, color: "#1976d2", fontWeight: 600,
                                                                    }}>
                                                                        {selectedColor}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{
                                                                    px: 0.8, py: 0.3,
                                                                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                                                                    borderRadius: 0.5,
                                                                }}>
                                                                    <Typography sx={{
                                                                        fontFamily: "'IBM Plex Mono', monospace",
                                                                        fontSize: 8, color: "#1976d2", fontWeight: 600,
                                                                    }}>
                                                                        {selectedSize}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", border: "2px solid #1976d2" }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleUpdateCartQty(-1)}
                                                                sx={{
                                                                    borderRadius: 0, px: 2, py: 1.2,
                                                                    color: "#1976d2",
                                                                    "&:hover": { backgroundColor: "#1976d2", color: "#fff" },
                                                                    transition: "all 0.15s",
                                                                }}
                                                            >
                                                                <Remove sx={{ fontSize: 16 }} />
                                                            </IconButton>

                                                            <Typography sx={{
                                                                fontFamily: "'Playfair Display', serif",
                                                                fontWeight: 700, fontSize: 20,
                                                                px: 3, minWidth: 60, textAlign: "center",
                                                                borderLeft: "2px solid #1976d2",
                                                                borderRight: "2px solid #1976d2",
                                                                color: "#1976d2",
                                                            }}>
                                                                {inCartQty}
                                                            </Typography>

                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    if (availableToAdd <= 0) {
                                                                        setSnackbar({ 
                                                                            open: true, 
                                                                            message: "No more stock available", 
                                                                            severity: "warning" 
                                                                        });
                                                                        return;
                                                                    }
                                                                    handleUpdateCartQty(1);
                                                                }}
                                                                disabled={availableToAdd <= 0}
                                                                sx={{
                                                                    borderRadius: 0, px: 2, py: 1.2,
                                                                    color: "#1976d2",
                                                                    "&:hover": { backgroundColor: "#1976d2", color: "#fff" },
                                                                    "&:disabled": { color: "#ccc" },
                                                                    transition: "all 0.15s",
                                                                }}
                                                            >
                                                                <Add sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        </Box>

                                                        <Box>
                                                            <MonoLabel sx={{ color: "#1976d2" }}>
                                                                {inCartQty === 1 ? "item" : "items"} in cart
                                                            </MonoLabel>
                                                            {availableToAdd > 0 && (
                                                                <MonoLabel sx={{ color: "#aaa", mt: 0.3 }}>
                                                                    {availableToAdd} more available
                                                                </MonoLabel>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Add to Cart Section */}
                                            {(inCartQty === 0 || availableToAdd > 0) && (
                                                <>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
                                                        <MonoLabel>{inCartQty > 0 ? "Add More" : "Qty"}</MonoLabel>
                                                        <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #e0e0e0" }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleQuantityChange(-1)}
                                                                disabled={quantity <= 1}
                                                                sx={{
                                                                    borderRadius: 0, px: 1.5, py: 1,
                                                                    "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                                    "&:disabled": { color: "#ddd" },
                                                                    transition: "all 0.15s",
                                                                }}
                                                            >
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
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleQuantityChange(1)}
                                                                disabled={quantity >= availableToAdd}
                                                                sx={{
                                                                    borderRadius: 0, px: 1.5, py: 1,
                                                                    "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                                    "&:disabled": { color: "#ddd" },
                                                                    transition: "all 0.15s",
                                                                }}
                                                            >
                                                                <Add sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Box>
                                                        <MonoLabel sx={{ color: "#bbb" }}>
                                                            {availableToAdd} available
                                                        </MonoLabel>
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
                                                            {addingToCart ? "Adding…" : inCartQty > 0 ? "Add More to Cart" : "Add to Cart"}
                                                        </Typography>
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ mt: "auto", border: "1px solid #000", p: 2, backgroundColor: "#f5f5f0" }}>
                                            <Typography sx={{
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: 11, fontWeight: 600,
                                                letterSpacing: "0.08em", textTransform: "uppercase", color: "#000",
                                            }}>
                                                {cantAdd ? "Select color and size"
                                                    : inCartQty > 0 && availableToAdd === 0 ? `Max quantity in cart (${inCartQty})`
                                                    : hasVariants && selectedColor && selectedSize ? `${selectedColor} / ${selectedSize} — Out of stock`
                                                    : "Out of stock"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>

                {/* Related Products */}
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