import {
    Typography,
    Chip,
    Box,
    Container
} from "@mui/material";
import { ShoppingCart, ArrowOutward } from "@mui/icons-material";
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
if (!document.head.querySelector("#ps-styles")) {
    const s = document.createElement("style");
    s.id = "ps-styles";
    s.textContent = `
        @keyframes psReveal {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes psImgZoom {
            from { transform: scale(1); }
            to   { transform: scale(1.06); }
        }
        .ps-card { animation: psReveal 0.5s ease both; }
        .ps-card:hover .ps-img { animation: psImgZoom 0.6s ease forwards; }
        .ps-card:hover .ps-overlay { opacity: 1 !important; }
        .ps-card:hover .ps-arrow  { opacity: 1 !important; transform: translate(0,0) !important; }
        .ps-card:hover .ps-name   { letter-spacing: 0.06em !important; }
        .ps-card:hover .ps-border-line { width: 100% !important; }
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

/* ─── Product Card ───────────────────────────────────────────── */
const ProductCard = ({ product, cartQty, getImageUrl, handleProductClick, index }) => {
    const hasDiscount   = product.discount && parseFloat(product.discount) > 0;
    const originalPrice = parseFloat(product.sellingPrice || product.price || 0);
    const finalPrice    = hasDiscount && product.discountPrice
        ? parseFloat(product.discountPrice)
        : originalPrice;
    const isOutOfStock  = product.stockQuantity <= 0;
    const isLowStock    = !isOutOfStock && product.stockQuantity <= 5;

    return (
        <Box
            className="ps-card"
            onClick={() => handleProductClick(product.productId)}
            sx={{
                animationDelay: `${(index % 10) * 0.05}s`,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                opacity: isOutOfStock ? 0.55 : 1,
                /* active cart highlight */
                "&::before": cartQty > 0 ? {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    border: "2px solid #000",
                    zIndex: 2,
                    pointerEvents: "none",
                } : {},
            }}
        >
            {/* ── Image container ── */}
            <Box sx={{
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#f0f0eb",
                aspectRatio: "3/4",
            }}>
                <Box
                    component="img"
                    className="ps-img"
                    src={getImageUrl(product.imageUrl)}
                    alt={product.productName}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        filter: isOutOfStock ? "grayscale(80%)" : "grayscale(15%)",
                        transition: "filter 0.5s ease",
                    }}
                />

                {/* Dark hover overlay */}
                <Box
                    className="ps-overlay"
                    sx={{
                        position: "absolute", inset: 0,
                        backgroundColor: "rgba(0,0,0,0.35)",
                        opacity: 0,
                        transition: "opacity 0.4s ease",
                    }}
                />

                {/* Arrow icon on hover */}
                <Box
                    className="ps-arrow"
                    sx={{
                        position: "absolute",
                        bottom: 16, right: 16,
                        width: 40, height: 40,
                        backgroundColor: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: 0,
                        transform: "translate(6px, 6px)",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                    }}
                >
                    <ArrowOutward sx={{ fontSize: 18, color: "#000" }} />
                </Box>

                {/* ── Badge strip top-left ── */}
                <Box sx={{
                    position: "absolute", top: 10, left: 10,
                    display: "flex", flexDirection: "column", gap: 0.5,
                    zIndex: 3,
                }}>
                    {hasDiscount && (
                        <Box sx={{
                            backgroundColor: "#000", color: "#fff",
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 9, fontWeight: 600,
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            px: 1.2, py: 0.5,
                        }}>
                            −{parseFloat(product.discount).toFixed(0)}%
                        </Box>
                    )}
                    {isOutOfStock && (
                        <Box sx={{
                            backgroundColor: "#555", color: "#fff",
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 9, fontWeight: 600,
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            px: 1.2, py: 0.5,
                        }}>
                            Sold Out
                        </Box>
                    )}
                    {isLowStock && (
                        <Box sx={{
                            backgroundColor: "#fff", color: "#000",
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 9, fontWeight: 600,
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            px: 1.2, py: 0.5,
                            border: "1px solid #000",
                        }}>
                            {product.stockQuantity} left
                        </Box>
                    )}
                </Box>

                {/* ── Cart badge top-right ── */}
                {cartQty > 0 && (
                    <Box sx={{
                        position: "absolute", top: 10, right: 10,
                        backgroundColor: "#000", color: "#fff",
                        width: 28, height: 28,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 3,
                    }}>
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10, fontWeight: 600,
                        }}>
                            {cartQty}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Info block ── */}
            <Box sx={{ pt: 2, pb: 1, px: 0 }}>
                {/* Animated underline */}
                <Box
                    className="ps-border-line"
                    sx={{
                        height: "1px",
                        backgroundColor: "#000",
                        width: "32px",
                        mb: 1.5,
                        transition: "width 0.4s ease",
                    }}
                />

                {/* Product name */}
                <Typography
                    className="ps-name"
                    sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        fontStyle: "italic",
                        fontSize: { xs: 14, md: 16 },
                        lineHeight: 1.2,
                        letterSpacing: "0.02em",
                        color: "#000",
                        mb: 0.8,
                        transition: "letter-spacing 0.3s ease",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {product.productName}
                </Typography>

                {/* Price row */}
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.2, mt: 1 }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontWeight: 600, fontSize: 14,
                        color: "#000", letterSpacing: "-0.02em",
                    }}>
                        Rs {finalPrice.toFixed(2)}
                    </Typography>
                    {hasDiscount && (
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontWeight: 400, fontSize: 11,
                            color: "#aaa",
                            textDecoration: "line-through",
                        }}>
                            Rs {originalPrice.toFixed(2)}
                        </Typography>
                    )}
                </Box>

                {/* Stock status */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: isOutOfStock ? "#999" : isLowStock ? "#888" : "#aaa",
                    }}>
                        {isOutOfStock ? "Unavailable" : isLowStock ? `Only ${product.stockQuantity} remaining` : "In stock"}
                    </Typography>

                    {cartQty > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <ShoppingCart sx={{ fontSize: 10, color: "#000" }} />
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 9, fontWeight: 600,
                                letterSpacing: "0.1em", color: "#000",
                            }}>
                                {cartQty} in cart
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

/* ─── Main Component ─────────────────────────────────────────── */
const ProductSection = ({
    products,
    getImageUrl,
    getCartQuantity,
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

    if (!products.length) return null;

    return (
        <Box sx={{ backgroundColor: "#f5f5f0", pb: 10 }}>
            <Container maxWidth="xl">
                {/* ── Grid ── */}
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(3, 1fr)",
                        md: "repeat(4, 1fr)",
                        lg: "repeat(5, 1fr)",
                    },
                    gap: { xs: 2, md: 3 },
                    /* Top border rule across full grid */
                    borderTop: "1px solid #d8d8d0",
                    pt: 4,
                }}>
                    {products.map((product, index) => {
                        const cartQty = cartMap[product.productId]
                            ?? getCartQuantity?.(product.productId)
                            ?? 0;
                        return (
                            <ProductCard
                                key={product.productId}
                                product={product}
                                cartQty={cartQty}
                                getImageUrl={getImageUrl}
                                handleProductClick={handleProductClick}
                                index={index}
                            />
                        );
                    })}
                </Box>

                {/* ── Footer rule ── */}
                <Box sx={{
                    mt: 8, pt: 3,
                    borderTop: "2px solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, letterSpacing: "0.18em",
                        textTransform: "uppercase", color: "#aaa",
                    }}>
                        {products.length} products shown
                    </Typography>
                    <Typography sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900, fontStyle: "italic",
                        fontSize: 11, color: "#ccc",
                        letterSpacing: "0.05em",
                    }}>
                        End of collection
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default ProductSection;