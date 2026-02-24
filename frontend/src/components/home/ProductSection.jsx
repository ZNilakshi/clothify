import {
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
    Badge,
    Box,
    Container
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import authService from "../../services/authService";
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
/* ─── Backend cart fetch ─────────────────────────────────────── */
const API = "http://localhost:8080";

const fetchCartMap = async () => {
    const user = authService.getCurrentUser();
    if (!user?.customerId) return {};
    try {
        const res  = await axios.get(
            `${API}/api/cart/customer/${user.customerId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const data  = res.data;
        const items = Array.isArray(data)
            ? data
            : (data.items ?? data.cartItems ?? data.cart ?? []);

        /* Build productId → total quantity map (sums across all variants) */
        const map = {};
        for (const item of items) {
            const pid = item.productId ?? item.product?.productId;
            if (!pid) continue;
            map[pid] = (map[pid] ?? 0) + (item.quantity ?? 1);
        }
        return map;
    } catch (_) {
        return {};
    }
};

/* ─── Main Component ─────────────────────────────────────────── */
const ProductSection = ({
    products,
    getImageUrl,
    getCartQuantity, /* kept for API compatibility, overridden by backend data */
    handleProductClick,
}) => {
    const [cartMap, setCartMap] = useState({});

    const refreshCart = useCallback(async () => {
        const map = await fetchCartMap();
        setCartMap(map);
    }, []);

    useEffect(() => {
        refreshCart();
        window.addEventListener("cartUpdated", refreshCart);
        return () => window.removeEventListener("cartUpdated", refreshCart);
    }, [refreshCart]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={2} justifyContent="center">
                    {products.map((product) => {
                        /* Backend cart count; falls back to prop while map is loading */
                        const cartQty = cartMap[product.productId]
                            ?? getCartQuantity?.(product.productId)
                            ?? 0;

                        const hasDiscount   = product.discount && parseFloat(product.discount) > 0;
                        const originalPrice = parseFloat(product.sellingPrice || product.price || 0);
                        const finalPrice    = hasDiscount && product.discountPrice
                            ? parseFloat(product.discountPrice)
                            : originalPrice;
                        const isOutOfStock  = product.stockQuantity <= 0;

                        return (
                            <Grid
                                item
                                key={product.productId}
                                sx={{
                                    flexBasis: { xs: "50%", sm: "33.33%", md: "20%" },
                                    maxWidth:  { xs: "50%", sm: "33.33%", md: "20%" },
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Card
                                    sx={{
                                        width: "100%",
                                        borderRadius: 4,
                                        cursor: "pointer",
                                        position: "relative",
                                        display: "flex",
                                        flexDirection: "column",
                                        transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                        opacity: isOutOfStock ? 0.6 : 1,
                                        /* Subtle border highlight when item is in cart */
                                        outline: cartQty > 0 ? "2px solid #000" : "none",
                                        outlineOffset: "-2px",
                                        "&:hover": {
                                            transform: "translateY(-10px)",
                                            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                                        },
                                    }}
                                    onClick={() => handleProductClick(product.productId)}
                                >
                                    {/* ── TOP BADGES ── */}
                                    <Box sx={{
                                        position: "absolute",
                                        top: 8, left: 8, right: 8,
                                        zIndex: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                    }}>
                                        {/* Left side */}
                                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                            {hasDiscount && (
                                                <Chip
                                                    label={`${parseFloat(product.discount).toFixed(0)}% OFF`}
                                                    size="small"
                                                    sx={{ backgroundColor: "#d32f2f", color: "#fff", fontWeight: "bold", fontSize: 10, height: 22 }}
                                                />
                                            )}
                                            {isOutOfStock && (
                                                <Chip
                                                    label="Out of Stock"
                                                    size="small"
                                                    sx={{ backgroundColor: "#616161", color: "#fff", fontWeight: "bold", fontSize: 10, height: 22 }}
                                                />
                                            )}
                                            {!isOutOfStock && product.stockQuantity <= 5 && (
                                                <Chip
                                                    label={`Only ${product.stockQuantity} left!`}
                                                    size="small"
                                                    sx={{ backgroundColor: "#ff9800", color: "#fff", fontWeight: "bold", fontSize: 10, height: 22 }}
                                                />
                                            )}
                                        </Box>

                                        {/* Right side — in-cart chip */}
                                        {cartQty > 0 && (
                                            <Chip
                                                label={`${cartQty} in cart`}
                                                size="small"
                                                icon={<ShoppingCart sx={{ fontSize: "12px !important", color: "#fff !important" }} />}
                                                sx={{
                                                    ml: "auto",
                                                    backgroundColor: "#000",
                                                    color: "#fff",
                                                    fontWeight: "bold",
                                                    fontSize: 10,
                                                    height: 22,
                                                    "& .MuiChip-icon": { color: "#fff" },
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <CardMedia
                                        component="img"
                                        sx={{
                                            height: 260,
                                            objectFit: "cover",
                                            filter: isOutOfStock ? "grayscale(50%)" : "none",
                                        }}
                                        image={getImageUrl(product.imageUrl)}
                                        alt={product.productName}
                                    />

                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                        {/* Name */}
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="700"
                                            noWrap
                                            sx={{
                                                mb: 0.5,
                                                textTransform: "uppercase",
                                                letterSpacing: 1,
                                                fontFamily: "'Playfair Display', serif", // ← applied
                                            }}
                                        >
                                            {product.productName}
                                        </Typography>

                                        {/* Description */}
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                height: "40px",
                                                lineHeight: "20px",
                                                fontFamily: "'IBM Plex Mono', monospace", // ← applied
                                            }}
                                        >
                                            {product.productDescription || "No description available for this premium item."}
                                        </Typography>

                                        {/* Price + cart indicator */}
                                        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                            {/* Price block */}
                                            <Box>
                                                {hasDiscount ? (
                                                    <>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                textDecoration: "line-through",
                                                                color: "text.secondary",
                                                                display: "block",
                                                                lineHeight: 1.2,
                                                                fontFamily: "'IBM Plex Mono', monospace", // ← applied
                                                            }}
                                                        >
                                                            Rs {originalPrice.toFixed(2)}
                                                        </Typography>
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="800"
                                                            color="#000"
                                                            lineHeight={1.2}
                                                            sx={{ fontFamily: "'IBM Plex Mono', monospace" }} // ← applied
                                                        >
                                                            Rs {finalPrice.toFixed(2)}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            fontWeight="bold"
                                                            color="#d32f2f"
                                                            display="block"
                                                            sx={{ fontFamily: "'IBM Plex Mono', monospace" }} // ← applied
                                                        >
                                                            Save Rs {(originalPrice - finalPrice).toFixed(2)}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Typography
                                                        color="#000"
                                                        fontWeight="800"
                                                        variant="h6"
                                                        sx={{ fontFamily: "'IBM Plex Mono', monospace" }} // ← applied
                                                    >
                                                        Rs {originalPrice.toFixed(2)}
                                                    </Typography>
                                                )}

                                                {/* Stock status */}
                                                {isOutOfStock ? (
                                                    <Typography
                                                        variant="caption"
                                                        color="error"
                                                        fontWeight="bold"
                                                        sx={{ fontFamily: "'IBM Plex Mono', monospace" }} // ← applied
                                                    >
                                                        Out of stock
                                                    </Typography>
                                                ) : product.stockQuantity <= 5 ? (
                                                    <Typography
                                                        variant="caption"
                                                        color="warning.main"
                                                        sx={{ fontFamily: "'IBM Plex Mono', monospace" }} // ← applied
                                                    >
                                                        Only {product.stockQuantity} left
                                                    </Typography>
                                                ) : (
                                                    <Typography
                                                        variant="caption"
                                                        color="success.main"
                                                        sx={{ fontFamily: "'IBM Plex Mono', monospace" }} // ← applied
                                                    >
                                                        In stock
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Cart indicator circle */}
                                            <Box sx={{
                                                width: 40, height: 40,
                                                borderRadius: "50%",
                                                backgroundColor: cartQty > 0 ? "#000" : "#f5f5f5",
                                                color: cartQty > 0 ? "#fff" : "#000",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "all 0.3s",
                                            }}>
                                                <Badge
                                                    badgeContent={cartQty > 0 ? cartQty : null}
                                                    color="error"
                                                    sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 18, minWidth: 18 } }}
                                                >
                                                    <ShoppingCart fontSize="small" />
                                                </Badge>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
        </Box>
    );
};

export default ProductSection;