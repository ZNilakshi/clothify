import {
    Box,
    Container,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import CategorySection from "../components/home/CategorySection";
import SubCategorySection from "../components/home/SubCategorySection";
import ProductSection from "../components/home/ProductSection";

import productService from "../services/productService";
import categoryService from "../services/categoryService";
import subCategoryService from "../services/subCategoryService";

/* ─── Fonts & CSS ────────────────────────────────────────────── */
if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#home-styles")) {
    const s = document.createElement("style");
    s.id = "home-styles";
    s.textContent = `
        @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
        }
        @keyframes homeFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes homeLineGrow {
            from { width: 0; }
            to   { width: 100%; }
        }
        .home-section { animation: homeFadeUp 0.5s ease both; }
    `;
    document.head.appendChild(s);
}

/* ─── Sub-components ─────────────────────────────────────────── */

/* Running ticker strip */
const MarqueeStrip = ({ items, speed = 28, inverted = false }) => {
    const repeated = [...items, ...items]; /* duplicate so scroll is seamless */
    return (
        <Box sx={{
            overflow: "hidden",
            backgroundColor: inverted ? "#000" : "#fff",
            borderTop:    "1px solid",
            borderBottom: "1px solid",
            borderColor:  inverted ? "#333" : "#e8e8e8",
            py: 1.2,
            whiteSpace: "nowrap",
        }}>
            <Box sx={{
                display: "inline-flex", gap: 0,
                animation: `marquee ${speed}s linear infinite`,
            }}>
                {repeated.map((item, i) => (
                    <Box key={i} sx={{ display: "inline-flex", alignItems: "center" }}>
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10, fontWeight: 600,
                            letterSpacing: "0.18em", textTransform: "uppercase",
                            color: inverted ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.3)",
                            px: 4,
                        }}>
                            {item}
                        </Typography>
                        <Box sx={{
                            width: 4, height: 4,
                            backgroundColor: inverted ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                            transform: "rotate(45deg)",
                            flexShrink: 0,
                        }} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

/* Editorial section header */
const SectionHeader = ({ eyebrow, title, count, align = "left", inverted = false }) => (
    <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "flex-end" },
        justifyContent: "space-between",
        gap: 2,
        mb: 5,
        pb: 3,
        borderBottom: "2px solid",
        borderColor: inverted ? "#333" : "#000",
    }}>
        <Box>
            <Typography sx={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9, fontWeight: 600,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: inverted ? "rgba(255,255,255,0.4)" : "#aaa",
                mb: 0.8,
            }}>
                {eyebrow}
            </Typography>
            <Typography sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900, fontStyle: "italic",
                fontSize: { xs: 32, md: 48 },
                letterSpacing: "-0.03em", lineHeight: 0.9,
                color: inverted ? "#fff" : "#000",
            }}>
                {title}
            </Typography>
        </Box>
        {count !== undefined && (
            <Box sx={{
                border: "1px solid",
                borderColor: inverted ? "#444" : "#000",
                px: 2.5, py: 1,
                display: "flex", alignItems: "baseline", gap: 1.5,
                flexShrink: 0,
            }}>
                <Typography sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900, fontSize: 28, lineHeight: 1,
                    color: inverted ? "#fff" : "#000",
                }}>
                    {String(count).padStart(2, "0")}
                </Typography>
                <Typography sx={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: inverted ? "rgba(255,255,255,0.4)" : "#aaa",
                }}>
                    items
                </Typography>
            </Box>
        )}
    </Box>
);

/* Skeleton loader card */
const SkeletonCard = () => (
    <Box sx={{
        backgroundColor: "#f0f0eb",
        height: 340,
        position: "relative", overflow: "hidden",
        "&::after": {
            content: '""',
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
            animation: "marquee 1.2s linear infinite",
        },
    }} />
);

const MARQUEE_ITEMS = [
    "New Arrivals", "Free Shipping over Rs 5000", "Exclusive Styles",
    "Premium Fabrics", "Curated Collections", "Seasonal Drops",
    "Members Save 10%", "Handcrafted Quality",
];

/* ─── Main Component ─────────────────────────────────────────── */
const Home = () => {
    const navigate = useNavigate();

    const [products,      setProducts]      = useState([]);
    const [categories,    setCategories]    = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [snackbar,      setSnackbar]      = useState({ open: false, message: "", severity: "success" });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [productsData, categoriesData, subCategoriesData] = await Promise.all([
                productService.getActiveProducts(),
                categoryService.getAllCategories(),
                subCategoryService.getAllSubCategories(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setSubCategories(subCategoriesData);
        } catch (err) {
            console.error("Error loading data:", err);
            setSnackbar({ open: true, message: "Failed to load data", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (id) => navigate(`/product/${id}`);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `http://localhost:8080${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>

            {/* ══ HERO ══════════════════════════════════════════ */}
            <Box sx={{
                backgroundImage: `url("/banner1.png")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: 5,
                mx: { xs: 1, md: 4 },
                minHeight: "90vh",
                mt: 2, pt: 2,
                position: "relative",
                overflow: "hidden",
                /* Dark gradient from bottom for text legibility */
                "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    height: "40%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
                    pointerEvents: "none",
                    borderRadius: "0 0 20px 20px",
                },
            }}>
                <Navbar />

                {/* Hero bottom text */}
                <Box sx={{
                    position: "absolute", bottom: 40, left: 48, zIndex: 1,
                    animation: "homeFadeUp 0.7s 0.2s ease both",
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: "rgba(255,255,255,0.6)", mb: 1,
                    }}>
                        New Season — 2025
                    </Typography>
                    <Typography sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900, fontStyle: "italic",
                        fontSize: { xs: 36, md: 64 },
                        letterSpacing: "-0.03em", lineHeight: 0.9,
                        color: "#fff",
                    }}>
                        Dress the<br />moment.
                    </Typography>
                </Box>

                {/* Hero bottom-right counter */}
                <Box sx={{
                    position: "absolute", bottom: 40, right: 48, zIndex: 1,
                    textAlign: "right",
                    animation: "homeFadeUp 0.7s 0.3s ease both",
                }}>
                    <Typography sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900, fontSize: 52,
                        color: "rgba(255,255,255,0.15)", lineHeight: 1,
                    }}>
                        {String(products.length).padStart(3, "0")}
                    </Typography>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.15em", textTransform: "uppercase",
                    }}>
                        Products
                    </Typography>
                </Box>
            </Box>

            {/* ══ MARQUEE STRIP ═════════════════════════════════ */}
            <Box sx={{ mt: 3 }}>
                <MarqueeStrip items={MARQUEE_ITEMS} speed={30} />
            </Box>

            {/* ══ SUBCATEGORIES SECTION ═════════════════════════ */}
            {!loading && subCategories.length > 0 && (
                <Box
                    className="home-section"
                    sx={{
                        backgroundColor: "#fff",
                        borderTop: "1px solid #e8e8e8",
                        borderBottom: "1px solid #e8e8e8",
                        mt: 0,
                        animationDelay: "0.1s",
                    }}
                >
                    <Container maxWidth="xl" sx={{ py: 6 }}>
                        <SectionHeader
                            eyebrow="Browse by"
                            title="Categories"
                            count={subCategories.length}
                        />
                        <SubCategorySection
                            subCategories={subCategories}
                            getImageUrl={getImageUrl}
                        />
                    </Container>
                </Box>
            )}

            {/* ══ INVERTED MARQUEE ══════════════════════════════ */}
            <MarqueeStrip items={MARQUEE_ITEMS.slice().reverse()} speed={24} inverted />

            {/* ══ PRODUCTS SECTION ══════════════════════════════ */}
            <Box
                className="home-section"
                sx={{
                    backgroundColor: "#f5f5f0",
                    animationDelay: "0.2s",
                }}
            >
                {loading ? (
                    /* Skeleton */
                    <Container maxWidth="xl" sx={{ py: 8 }}>
                        <SectionHeader eyebrow="Explore our" title="Collection" />
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1.5 }}>
                            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                        </Box>
                    </Container>
                ) : (
                    <Container maxWidth="xl" sx={{ pt: 8, pb: 2 }}>
                        <SectionHeader
                            eyebrow="Explore our"
                            title="Collection"
                            count={products.length}
                        />
                    </Container>
                )}

                {!loading && (
                    <ProductSection
                        products={products}
                        getImageUrl={getImageUrl}
                        handleProductClick={handleProductClick}
                        getCartQuantity={() => 0}
                    />
                )}
            </Box>

            {/* ══ BOTTOM BAND ═══════════════════════════════════ */}
            {!loading && (
                <Box sx={{
                    backgroundColor: "#000",
                    borderTop: "2px solid #000",
                    py: 5, px: { xs: 3, md: 8 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 3,
                }}>
                    <Typography sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900, fontStyle: "italic",
                        fontSize: { xs: 28, md: 42 },
                        letterSpacing: "-0.03em", lineHeight: 0.9,
                        color: "#fff",
                    }}>
                        Find your<br />signature look.
                    </Typography>

                    <Box sx={{ display: "flex", gap: 4 }}>
                        {[
                            { number: String(products.length).padStart(2,"0"),     label: "Products"    },
                            { number: String(categories.length).padStart(2,"0"),   label: "Categories"  },
                            { number: String(subCategories.length).padStart(2,"0"),label: "Collections" },
                        ].map(({ number, label }) => (
                            <Box key={label} sx={{ textAlign: "center" }}>
                                <Typography sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 900, fontSize: 40, lineHeight: 1, color: "#fff",
                                }}>
                                    {number}
                                </Typography>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 9, letterSpacing: "0.14em",
                                    textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
                                    mt: 0.5,
                                }}>
                                    {label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* ══ FOOTER ════════════════════════════════════════ */}
            <Box sx={{
                borderTop: "1px solid #e0e0e0", backgroundColor: "#fff",
                py: 2.5, px: { xs: 3, md: 8 },
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
                <Typography sx={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9, color: "#ccc", letterSpacing: "0.08em",
                }}>
                    Premium Fashion · Curated Collections
                </Typography>
            </Box>

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
                        borderRadius: 0, border: "1px solid #000",
                        backgroundColor: "#fff", color: "#000",
                        fontFamily: "'IBM Plex Mono', monospace",
                        "& .MuiAlert-icon": { color: "#000" },
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Home;