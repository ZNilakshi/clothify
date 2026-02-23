import {
    Box,
    Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ArrowBack } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductSection from "../components/home/ProductSection";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import cartService from "../services/cartService";

/* ─── Google Fonts ───────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
if (!document.head.querySelector('link[href*="Playfair"]')) {
    document.head.appendChild(fontLink);
}

/* ─── Injected CSS ───────────────────────────────────────────── */
const styleEl = document.createElement("style");
styleEl.textContent = `
    @keyframes cpHeroImgReveal {
        from { transform: scale(1.07); filter: grayscale(80%) brightness(0.4); }
        to   { transform: scale(1);    filter: grayscale(25%) brightness(0.52); }
    }
    @keyframes cpHeroTextUp {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cpContentFadeIn {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cpSpin {
        to { transform: rotate(360deg); }
    }
`;
if (!document.head.querySelector("#cp-styles")) {
    styleEl.id = "cp-styles";
    document.head.appendChild(styleEl);
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

/* ─── Corner Decoration ──────────────────────────────────────── */
const CornerMark = ({ top, bottom, left, right }) => (
    <Box sx={{
        position: "absolute",
        top, bottom, left, right,
        width: 22, height: 22,
        borderTop:    bottom !== undefined ? "none" : "1.5px solid rgba(255,255,255,0.35)",
        borderBottom: top    !== undefined ? "none" : "1.5px solid rgba(255,255,255,0.35)",
        borderLeft:   right  !== undefined ? "none" : "1.5px solid rgba(255,255,255,0.35)",
        borderRight:  left   !== undefined ? "none" : "1.5px solid rgba(255,255,255,0.35)",
        zIndex: 4,
    }} />
);

/* ─── Main ───────────────────────────────────────────────────── */
const CategoryProducts = () => {
    const { categoryId } = useParams();
    const navigate        = useNavigate();

    const [products, setProducts]   = useState([]);
    const [category, setCategory]   = useState(null);
    const [loading,  setLoading]    = useState(true);

    useEffect(() => { fetchData(); }, [categoryId]);

    useEffect(() => {
        const sync = () => setProducts(p => [...p]);
        window.addEventListener("cartUpdated", sync);
        return () => window.removeEventListener("cartUpdated", sync);
    }, []);

    const fetchData = async () => {
        try {
            const cat = await categoryService.getCategoryById(categoryId);
            setCategory(cat);
            const all = await productService.getActiveProducts();
            setProducts(all.filter(p => p.categoryId === parseInt(categoryId)));
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `http://localhost:8080${url.startsWith("/") ? url : `/${url}`}`;
    };

    const getCartQuantity    = (id) => cartService.getProductTotalQuantity(id);
    const handleProductClick = (id) => navigate(`/product/${id}`);

    /* ── Loading ── */
    if (loading) {
        return (
            <ThemeProvider theme={bwTheme}>
                <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f0" }}>
                    <Navbar />
                    <Box sx={{
                        display: "flex", alignItems: "center",
                        justifyContent: "center", height: "80vh",
                    }}>
                        <Box sx={{ textAlign: "center" }}>
                            <Box sx={{
                                width: 34, height: 34,
                                border: "2px solid #000",
                                borderTopColor: "transparent",
                                borderRadius: "50%",
                                mx: "auto", mb: 2,
                                animation: "cpSpin 0.7s linear infinite",
                            }} />
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 10, letterSpacing: "0.14em",
                                textTransform: "uppercase", color: "#aaa",
                            }}>
                                Loading...
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </ThemeProvider>
        );
    }

    const heroImg = getImageUrl(category?.imageUrl);

    return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f5f0",
                fontFamily: "'IBM Plex Mono', monospace",
            }}>
                <Navbar />

                {/* ════════════════════════════════════════════
                    HERO — full width, 50vh
                ════════════════════════════════════════════ */}
                <Box sx={{
                    position: "relative",
                    width: "100%",
                    height: "50vh",
                    minHeight: 340,
                    maxHeight: 580,
                    overflow: "hidden",
                    backgroundColor: "#0a0a0a",
                }}>
                    {/* Photo / fallback */}
                    {heroImg ? (
                        <Box
                            component="img"
                            src={heroImg}
                            alt={category?.categoryName}
                            sx={{
                                position: "absolute", inset: 0,
                                width: "100%", height: "100%",
                                objectFit: "cover", display: "block",
                                animation: "cpHeroImgReveal 1.1s ease forwards",
                            }}
                        />
                    ) : (
                        <Box sx={{
                            position: "absolute", inset: 0,
                            backgroundColor: "#0e0e0e",
                            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
                            backgroundSize: "32px 32px",
                        }} />
                    )}

                    {/* Dual vignette */}
                    <Box sx={{
                        position: "absolute", inset: 0, zIndex: 1,
                        background: `linear-gradient(to bottom,
                            rgba(0,0,0,0.55) 0%,
                            rgba(0,0,0,0.15) 35%,
                            rgba(0,0,0,0.15) 55%,
                            rgba(0,0,0,0.72) 100%
                        )`,
                    }} />

                    {/* Corner marks */}
                    <CornerMark top={20}    left={20}  />
                    <CornerMark top={20}    right={20} />
                    <CornerMark bottom={20} left={20}  />
                    <CornerMark bottom={20} right={20} />

                    {/* Back nav */}
                    <Box
                        onClick={() => navigate("/")}
                        sx={{
                            position: "absolute", top: 28, left: { xs: 24, md: 44 },
                            zIndex: 5,
                            display: "flex", alignItems: "center", gap: 1,
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.55)",
                            "&:hover": { color: "#fff" },
                            transition: "color 0.2s",
                        }}
                    >
                        <ArrowBack sx={{ fontSize: 13 }} />
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10, letterSpacing: "0.12em",
                            textTransform: "uppercase",
                        }}>
                            Back to Home
                        </Typography>
                    </Box>

                    {/* Centered text */}
                    <Box sx={{
                        position: "absolute", inset: 0, zIndex: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        px: { xs: 3, sm: 6, md: 14 },
                    }}>
                        {/* Category label */}
                        <Typography sx={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: { xs: 9, md: 10 },
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.45)",
                            mb: 1.8,
                            animation: "cpHeroTextUp 0.65s 0.15s ease both",
                        }}>
                            Category
                        </Typography>

                        {/* Main title */}
                        <Typography sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 900,
                            fontStyle: "italic",
                            fontSize: { xs: 40, sm: 58, md: 80 },
                            letterSpacing: "-0.03em",
                            lineHeight: 0.88,
                            color: "#fff",
                            animation: "cpHeroTextUp 0.65s 0.24s ease both",
                            mb: 3.5,
                        }}>
                            {category?.categoryName}
                        </Typography>

                        {/* Diamond ornament */}
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 2,
                            mb: category?.categoryDescription ? 3 : 3.5,
                            animation: "cpHeroTextUp 0.65s 0.32s ease both",
                        }}>
                            <Box sx={{ width: 32, height: 1, backgroundColor: "rgba(255,255,255,0.35)" }} />
                            <Box sx={{
                                width: 5, height: 5,
                                border: "1px solid rgba(255,255,255,0.45)",
                                transform: "rotate(45deg)",
                            }} />
                            <Box sx={{ width: 32, height: 1, backgroundColor: "rgba(255,255,255,0.35)" }} />
                        </Box>

                        {/* Description */}
                        {category?.categoryDescription && (
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: { xs: 11, md: 13 },
                                color: "rgba(255,255,255,0.65)",
                                lineHeight: 1.8,
                                maxWidth: 540,
                                mb: 4,
                                animation: "cpHeroTextUp 0.65s 0.38s ease both",
                            }}>
                                {category.categoryDescription}
                            </Typography>
                        )}

                        {/* Count badge */}
                        <Box sx={{
                            display: "inline-flex", alignItems: "center", gap: 2,
                            border: "1px solid rgba(255,255,255,0.28)",
                            backgroundColor: "rgba(0,0,0,0.35)",
                            backdropFilter: "blur(6px)",
                            px: 3, py: 1,
                            animation: "cpHeroTextUp 0.65s 0.46s ease both",
                        }}>
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 700, fontSize: 20,
                                color: "#fff", lineHeight: 1,
                            }}>
                                {products.length}
                            </Typography>
                            <Box sx={{ width: 1, height: 16, backgroundColor: "rgba(255,255,255,0.25)" }} />
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 10, letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,0.5)",
                            }}>
                                Product{products.length !== 1 ? "s" : ""}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Bottom border */}
                    <Box sx={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        height: 2, backgroundColor: "#000", zIndex: 5,
                    }} />
                </Box>

                {/* ════════════════════════════════════════════
                    PRODUCTS
                ════════════════════════════════════════════ */}
                <Box sx={{ animation: "cpContentFadeIn 0.5s 0.3s ease both" }}>
                    {products.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 16, backgroundColor: "#f5f5f0" }}>
                            {/* Watermark letter */}
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 900, fontStyle: "italic",
                                fontSize: 120,
                                color: "rgba(0,0,0,0.04)",
                                lineHeight: 1, userSelect: "none", mb: -4,
                            }}>
                                {category?.categoryName?.[0] || "?"}
                            </Typography>
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 700, fontSize: 22,
                                color: "#000", mb: 1,
                                position: "relative", zIndex: 1,
                            }}>
                                No Products Yet
                            </Typography>
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11, color: "#aaa",
                                letterSpacing: "0.06em",
                                position: "relative", zIndex: 1,
                            }}>
                                This category has no active products at this time
                            </Typography>
                            <Box
                                onClick={() => navigate("/")}
                                sx={{
                                    display: "inline-flex", alignItems: "center", gap: 1.2,
                                    mt: 5, border: "1px solid #000",
                                    px: 3.5, py: 1.4, cursor: "pointer",
                                    position: "relative", zIndex: 1,
                                    "&:hover": { backgroundColor: "#000", color: "#fff" },
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <ArrowBack sx={{ fontSize: 13 }} />
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 11, fontWeight: 600,
                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                }}>
                                    Back to Home
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <ProductSection
                            products={products}
                            getImageUrl={getImageUrl}
                            getCartQuantity={getCartQuantity}
                            handleProductClick={handleProductClick}
                        />
                    )}
                </Box>

                {/* ── Footer ────────────────────────────────── */}
                <Box sx={{
                    borderTop: "1px solid #e0e0e0",
                    backgroundColor: "#fff",
                    py: 2.5, px: { xs: 3, md: 5 },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap", gap: 1,
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, color: "#ccc",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                        © {new Date().getFullYear()} Your Company — All Rights Reserved
                    </Typography>
                    <Box
                        onClick={() => navigate("/")}
                        sx={{
                            display: "flex", alignItems: "center", gap: 0.8,
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 9, color: "#bbb",
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            cursor: "pointer",
                            "&:hover": { color: "#000" },
                            transition: "color 0.15s",
                        }}
                    >
                        <ArrowBack sx={{ fontSize: 11 }} />
                        Back to Home
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default CategoryProducts;