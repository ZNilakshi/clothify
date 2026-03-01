import {
    Box,
    Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    Inventory,
    Category,
    AccountTree,
    ShoppingCart,
    LocalShipping,

} from "@mui/icons-material";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ProductList from "../components/admin/ProductList";
import CategoryManagement from "../components/admin/CategoryManagement";
import SubCategoryManagement from "../components/admin/SubCategoryManagement";
import PurchaseOrder from "../components/admin/PurchaseOrder";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import subCategoryService from "../services/subCategoryService";
import OrderManagement from "../components/admin/OrderManagement";
import orderService from "../services/orderService";
/* ─── Google Fonts ───────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
if (!document.head.querySelector('link[href*="Playfair"]')) {
    document.head.appendChild(fontLink);
}

/* ─── CSS injected once ──────────────────────────────────────── */
const styleTag = document.createElement("style");
styleTag.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(18px); }
        to   { opacity: 1; transform: translateX(0);    }
    }
    @keyframes tickerScroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
    }
`;
if (!document.head.querySelector("#bw-dashboard-styles")) {
    styleTag.id = "bw-dashboard-styles";
    document.head.appendChild(styleTag);
}

/* ─── MUI Theme ──────────────────────────────────────────────── */
const bwTheme = createTheme({
    palette: {
        mode: "light",
        primary:    { main: "#000" },
        background: { default: "#f5f5f0", paper: "#fff" },
        text:       { primary: "#000", secondary: "#666" },
    },
    typography: { fontFamily: "'IBM Plex Mono', monospace" },
});

/* ─── Data ───────────────────────────────────────────────────── */
const SECTIONS = [
    {
        id: 0,
        label:    "Products",
        shortLabel: "PROD",
        roman:    "I",
        icon:     Inventory,
        countKey: "products",
        desc:     "Inventory catalogue",
    },
    {
        id: 1,
        label:    "Categories",
        shortLabel: "CAT",
        roman:    "II",
        icon:     Category,
        countKey: "categories",
        desc:     "Taxonomy — top level",
    },
    {
        id: 2,
        label:    "Sub Categories",
        shortLabel: "SUB",
        roman:    "III",
        icon:     AccountTree,
        countKey: "subCategories",
        desc:     "Taxonomy — nested",
    },
    {
        id: 3,
        label:    "Orders",
        shortLabel: "ORD",
        roman:    "IV",
        icon:     LocalShipping,
        countKey: "orders",
        desc:     "Customer orders & tracking",
    },
    {
        id: 4,
        label:    "Purchase Orders",
        shortLabel: "PO",
        roman:    "V",
        icon:     ShoppingCart,
        countKey: "purchaseOrders",
        desc:     "Procurement ledger",
    },
];

const TICKER_TEXT = [
    "PRODUCTS", "·", "CATEGORIES", "·", "SUB CATEGORIES", "·",
    "ORDERS", "·", "PURCHASE ORDERS", "·", "ADMIN DASHBOARD", "·",
    "PRODUCTS", "·", "CATEGORIES", "·", "SUB CATEGORIES", "·",
    "ORDERS", "·", "PURCHASE ORDERS", "·", "ADMIN DASHBOARD", "·",
].join("  ");

/* ─── Ticker ─────────────────────────────────────────────────── */
const Ticker = () => (
    <Box sx={{
        overflow: "hidden",
        borderTop:    "1px solid #000",
        borderBottom: "1px solid #000",
        backgroundColor: "#000",
        py: 1,
        flexShrink: 0,
    }}>
        <Box sx={{
            display: "flex",
            gap: 0,
            whiteSpace: "nowrap",
            animation: "tickerScroll 28s linear infinite",
        }}>
            {[TICKER_TEXT, TICKER_TEXT].map((t, i) => (
                <Typography key={i} component="span" sx={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    color: "#fff",
                    px: 3,
                    flexShrink: 0,
                }}>
                    {t}
                </Typography>
            ))}
        </Box>
    </Box>
);

/* ─── Sidebar nav item ───────────────────────────────────────── */
const NavItem = ({ section, active, onClick, count }) => {
    const Icon = section.icon;
    return (
        <Box
            onClick={onClick}
            sx={{
                position: "relative",
                px: 3,
                py: 3,
                cursor: "pointer",
                borderBottom: "1px solid #e0e0e0",
                backgroundColor: active ? "#000" : "transparent",
                transition: "background-color 0.2s ease",
                overflow: "hidden",
                "&:hover": {
                    backgroundColor: active ? "#000" : "#f0f0eb",
                },
                "&::before": active ? {
                    content: '""',
                    position: "absolute",
                    left: 0, top: 0, bottom: 0,
                    width: 4,
                    backgroundColor: "#fff",
                } : {},
            }}
        >
            {/* Roman numeral watermark */}
            <Typography sx={{
                position: "absolute",
                right: -6,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontSize: 72,
                lineHeight: 1,
                color: active ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                userSelect: "none",
                pointerEvents: "none",
                letterSpacing: "-0.04em",
            }}>
                {section.roman}
            </Typography>

            {/* Top row: index + count */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    color: active ? "rgba(255,255,255,0.4)" : "#bbb",
                    textTransform: "uppercase",
                }}>
                    {section.shortLabel}
                </Typography>
                <Box sx={{
                    border: "1px solid",
                    borderColor: active ? "rgba(255,255,255,0.2)" : "#e0e0e0",
                    px: 0.8, py: 0.15,
                    display: "flex", alignItems: "center",
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9,
                        color: active ? "rgba(255,255,255,0.5)" : "#bbb",
                        lineHeight: 1,
                    }}>
                        {String(count).padStart(2, "0")}
                    </Typography>
                </Box>
            </Box>

            {/* Icon + label */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Icon sx={{ fontSize: 15, color: active ? "#fff" : "#888", flexShrink: 0 }} />
                <Typography sx={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: active ? "#fff" : "#000",
                    lineHeight: 1.2,
                }}>
                    {section.label}
                </Typography>
            </Box>

            {/* Description */}
            <Typography sx={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: active ? "rgba(255,255,255,0.4)" : "#aaa",
                mt: 0.8,
                letterSpacing: "0.02em",
            }}>
                {section.desc}
            </Typography>
        </Box>
    );
};

/* ─── Main Component ─────────────────────────────────────────── */
const AdminDashboard = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [counts, setCounts] = useState({
        products: 0, categories: 0,orders: 0,
        subCategories: 0, purchaseOrders: 0,
    });

    useEffect(() => {
        const fetchCounts = async () => {
            const [products, categories, subCategories, orders] = await Promise.allSettled([
                productService.getAllProducts(),
                categoryService.getAllCategories(),
                subCategoryService.getAllSubCategories(),
                orderService.getAllOrders(),

            ]);
            setCounts(prev => ({
                ...prev,
                products:      products.status      === "fulfilled" ? products.value.length      : 0,
                categories:    categories.status    === "fulfilled" ? categories.value.length    : 0,
                subCategories: subCategories.status === "fulfilled" ? subCategories.value.length : 0,
                orders:        orders.status        === "fulfilled" ? orders.value.length        : 0,

            }));
        };
        fetchCounts();
    }, []);

    const panels = [
        <ProductList />,
        <CategoryManagement />,
        <SubCategoryManagement />,
        <OrderManagement />,

        <PurchaseOrder />,
    ];

    const active = SECTIONS[currentTab];

    return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f5f0",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'IBM Plex Mono', monospace",
            }}>
                <Navbar />

                {/* Ticker tape */}
                <Ticker />

                {/* Main layout: sidebar + content */}
                <Box sx={{
                    display: "flex",
                    flex: 1,
                    minHeight: 0,
                }}>

                    {/* ── SIDEBAR ──────────────────────────────── */}
                    <Box sx={{
                        width: 240,
                        flexShrink: 0,
                        borderRight: "2px solid #000",
                        backgroundColor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        position: "sticky",
                        top: 0,
                        height: "calc(100vh - 48px)",   // subtract ticker
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}>
                        {/* Sidebar header */}
                        <Box sx={{
                            px: 3, py: 3,
                            borderBottom: "2px solid #000",
                        }}>
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 900,
                                fontSize: 22,
                                letterSpacing: "-0.02em",
                                lineHeight: 1,
                                color: "#000",
                                mb: 0.5,
                            }}>
                                Admin
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {/* Live dot */}
                                <Box sx={{
                                    width: 6, height: 6,
                                    backgroundColor: "#000",
                                    borderRadius: "50%",
                                    animation: "pulse 2s ease infinite",
                                }} />
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 9,
                                    letterSpacing: "0.12em",
                                    textTransform: "uppercase",
                                    color: "#888",
                                }}>
                                    Live system
                                </Typography>
                            </Box>
                        </Box>

                        {/* Nav items */}
                        <Box sx={{ flex: 1 }}>
                            {SECTIONS.map((section) => (
                                <NavItem
                                    key={section.id}
                                    section={section}
                                    active={currentTab === section.id}
                                    count={counts[section.countKey]}
                                    onClick={() => setCurrentTab(section.id)}
                                />
                            ))}
                        </Box>

                        {/* Sidebar footer */}
                        <Box sx={{
                            p: 3,
                            borderTop: "1px solid #e0e0e0",
                            mt: "auto",
                        }}>
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 9,
                                color: "#ccc",
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                lineHeight: 1.8,
                            }}>
                                {new Date().toLocaleDateString("en-US", {
                                    day: "2-digit", month: "short", year: "numeric"
                                }).toUpperCase()}
                                <br />
                                Ver 1.0.0
                            </Typography>
                        </Box>
                    </Box>

                    {/* ── CONTENT AREA ─────────────────────────── */}
                    <Box sx={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        {/* Content header bar */}
                        <Box sx={{
                            px: { xs: 3, md: 5 },
                            py: 0,
                            borderBottom: "2px solid #000",
                            backgroundColor: "#fff",
                            display: "flex",
                            alignItems: "stretch",
                            gap: 0,
                            flexShrink: 0,
                        }}>
                            {/* Big roman numeral */}
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                px: 3,
                                borderRight: "1px solid #e8e8e8",
                                flexShrink: 0,
                            }}>
                                <Typography sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 900,
                                    fontSize: 48,
                                    lineHeight: 1,
                                    color: "#000",
                                    letterSpacing: "-0.03em",
                                    py: 1.5,
                                }}>
                                    {active.roman}
                                </Typography>
                            </Box>

                            {/* Section label */}
                            <Box sx={{
                                px: 3,
                                py: 2,
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 9,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color: "#aaa",
                                    mb: 0.5,
                                }}>
                                    Section {active.shortLabel} — {active.desc}
                                </Typography>
                                <Typography sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 900,
                                    fontSize: { xs: 24, md: 34 },
                                    letterSpacing: "-0.02em",
                                    lineHeight: 1,
                                    color: "#000",
                                }}>
                                    {active.label.toUpperCase()}
                                </Typography>
                            </Box>

                            {/* Aggregate stats strip — right side */}
                            <Box sx={{
                                display: { xs: "none", lg: "flex" },
                                borderLeft: "1px solid #e8e8e8",
                                flexShrink: 0,
                            }}>
                                {SECTIONS.map((s) => (
                                    <Box
                                        key={s.id}
                                        onClick={() => setCurrentTab(s.id)}
                                        sx={{
                                            px: 2.5,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRight: "1px solid #e8e8e8",
                                            cursor: "pointer",
                                            backgroundColor: currentTab === s.id ? "#000" : "transparent",
                                            transition: "background-color 0.15s",
                                            "&:hover": {
                                                backgroundColor: currentTab === s.id ? "#000" : "#f5f5f0",
                                            },
                                            minWidth: 64,
                                        }}
                                    >
                                        <Typography sx={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontWeight: 900,
                                            fontSize: 20,
                                            color: currentTab === s.id ? "#fff" : "#000",
                                            lineHeight: 1,
                                        }}>
                                            {String(counts[s.countKey]).padStart(2, "0")}
                                        </Typography>
                                        <Typography sx={{
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontSize: 8,
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                            color: currentTab === s.id ? "rgba(255,255,255,0.5)" : "#bbb",
                                            mt: 0.5,
                                        }}>
                                            {s.shortLabel}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Section content */}
                        <Box
                            key={currentTab}
                            sx={{
                                flex: 1,
                                px: { xs: 2, md: 4 },
                                py: 3,
                                overflowY: "auto",
                                animation: "slideIn 0.22s ease",
                                backgroundColor: "#f5f5f0",
                            }}
                        >
                            {/* Breadcrumb */}
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 3,
                            }}>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 10,
                                    color: "#bbb",
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                }}>
                                    Dashboard
                                </Typography>
                                <Typography sx={{ color: "#ccc", fontSize: 10 }}>›</Typography>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 10,
                                    color: "#000",
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                }}>
                                    {active.label}
                                </Typography>
                            </Box>

                            {/* The panel itself */}
                            {panels[currentTab]}
                        </Box>

                        {/* Content footer */}
                        <Box sx={{
                            px: { xs: 3, md: 5 },
                            py: 2,
                            borderTop: "1px solid #e0e0e0",
                            backgroundColor: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                            flexShrink: 0,
                        }}>
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 9,
                                color: "#ccc",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                            }}>
                                © {new Date().getFullYear()} Your Company — All Rights Reserved
                            </Typography>

                            {/* Section page indicators */}
                            <Box sx={{ display: "flex", gap: 0.8, alignItems: "center" }}>
                                {SECTIONS.map((s) => (
                                    <Box
                                        key={s.id}
                                        onClick={() => setCurrentTab(s.id)}
                                        sx={{
                                            width: currentTab === s.id ? 24 : 8,
                                            height: 2,
                                            backgroundColor: currentTab === s.id ? "#000" : "#ddd",
                                            cursor: "pointer",
                                            transition: "all 0.25s ease",
                                            "&:hover": { backgroundColor: "#000" },
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default AdminDashboard;