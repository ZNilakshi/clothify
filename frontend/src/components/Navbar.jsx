import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Typography,
    Badge,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Divider,
    Popover,
    Grid,
} from "@mui/material";
import {
    ShoppingCartOutlined,
    SearchOutlined,
    PersonOutline,
    Dashboard,
    Logout,
    MenuOutlined,
    ArrowOutward,
    ReceiptLongOutlined,
    FavoriteBorderOutlined,
    SettingsOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import authService from "../services/authService";
import categoryService from "../services/categoryService";
import subCategoryService from "../services/subCategoryService";

/* ─── Fonts ──────────────────────────────────────────────────── */
if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#nb-styles")) {
    const s = document.createElement("style");
    s.id = "nb-styles";
    s.textContent = `
        @keyframes profileIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        .profile-panel { animation: profileIn 0.22s cubic-bezier(0.4,0,0.2,1) both; }
        .profile-menu-item:hover .profile-arrow { opacity: 1 !important; transform: translate(0,0) !important; }
        .profile-menu-item:hover { background: #f5f5f0 !important; }
    `;
    document.head.appendChild(s);
}

/* ─── Backend cart count ─────────────────────────────────────── */
const API = "http://localhost:8080";

const fetchCartCount = async () => {
    const user = authService.getCurrentUser();
    if (!user?.customerId || !user?.token) return 0;
    try {
        const res   = await axios.get(
            `${API}/api/cart/customer/${user.customerId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const data  = res.data;
        const items = Array.isArray(data)
            ? data
            : (data.items ?? data.cartItems ?? data.cart ?? []);
        return items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    } catch (_) { return 0; }
};

/* ─── Profile Panel ──────────────────────────────────────────── */
const ProfilePanel = ({ user, onClose, onLogout, navigate }) => {
    const isAdmin = user?.role === "ADMIN" || user?.roles?.includes("ADMIN");
    const dashboardPath = isAdmin ? "/admin/dashboard" : "/dashboard";

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : "U";

    const menuItems = isAdmin
        ? [
            { icon: <Dashboard sx={{ fontSize: 15 }} />, label: "Admin Dashboard", path: "/admin/dashboard" },
        ]
        : [
            { icon: <Dashboard sx={{ fontSize: 15 }} />,           label: "My Dashboard",  path: "/dashboard" },
              ];

    return (
        <Box
            className="profile-panel"
            sx={{
                width: 300,
                backgroundColor: "#fff",
                border: "1px solid #e8e8e0",
                boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
                overflow: "hidden",
            }}
        >
            {/* ── Header ── */}
            <Box sx={{
                backgroundColor: "#000",
                px: 3, pt: 3, pb: 3,
                position: "relative",
            }}>
                {/* Avatar circle */}
                <Box sx={{
                    width: 52, height: 52,
                    border: "2px solid rgba(255,255,255,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mb: 2,
                }}>
                    <Typography sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900, fontStyle: "italic",
                        fontSize: 20, color: "#fff",
                        letterSpacing: "-0.02em",
                    }}>
                        {initials}
                    </Typography>
                </Box>

                <Typography sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700, fontStyle: "italic",
                    fontSize: 18, color: "#fff",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                }}>
                    {user?.username || "Guest"}
                </Typography>

                <Typography sx={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9, color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    mt: 0.6,
                }}>
                    {isAdmin ? "Administrator" : "Member"}
                </Typography>

                {/* Role pill */}
                <Box sx={{
                    position: "absolute", top: 16, right: 16,
                    border: "1px solid rgba(255,255,255,0.2)",
                    px: 1.2, py: 0.4,
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 8, color: "rgba(255,255,255,0.55)",
                        letterSpacing: "0.18em", textTransform: "uppercase",
                    }}>
                        {isAdmin ? "Admin" : "User"}
                    </Typography>
                </Box>
            </Box>

            {/* ── Divider rule ── */}
            <Box sx={{ height: "2px", backgroundColor: "#000" }} />

            {/* ── Menu items ── */}
            <Box sx={{ py: 1 }}>
                {menuItems.map(({ icon, label, path }) => (
                    <Box
                        key={path}
                        className="profile-menu-item"
                        onClick={() => { navigate(path); onClose(); }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 3, py: 1.6,
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                            borderBottom: "1px solid #f0f0eb",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ color: "#888", display: "flex", alignItems: "center" }}>
                                {icon}
                            </Box>
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11, fontWeight: 500,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                color: "#000",
                            }}>
                                {label}
                            </Typography>
                        </Box>
                        <ArrowOutward
                            className="profile-arrow"
                            sx={{
                                fontSize: 13, color: "#000",
                                opacity: 0,
                                transform: "translate(-4px, 4px)",
                                transition: "opacity 0.2s ease, transform 0.2s ease",
                            }}
                        />
                    </Box>
                ))}
            </Box>

            {/* ── Footer: email + logout ── */}
            {user?.email && (
                <Box sx={{
                    px: 3, py: 1.5,
                    borderTop: "1px solid #e8e8e0",
                    backgroundColor: "#fafaf8",
                }}>
                    <Typography sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, color: "#bbb",
                        letterSpacing: "0.08em",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                        {user.email}
                    </Typography>
                </Box>
            )}

            <Box
                onClick={onLogout}
                sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    px: 3, py: 2,
                    borderTop: "1px solid #e8e8e0",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    "&:hover": { backgroundColor: "#000", "& *": { color: "#fff !important" } },
                }}
            >
                <Logout sx={{ fontSize: 15, color: "#888", transition: "color 0.2s ease" }} />
                <Typography sx={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: "#000", transition: "color 0.2s ease",
                }}>
                    Sign Out
                </Typography>
            </Box>
        </Box>
    );
};

/* ─── Navbar ─────────────────────────────────────────────────── */
const Navbar = () => {
    const navigate = useNavigate();
    const [user,             setUser]             = useState(null);
    const [profileAnchor,    setProfileAnchor]    = useState(null);
    const [cartItemCount,    setCartItemCount]    = useState(0);
    const [mobileOpen,       setMobileOpen]       = useState(false);
    const [searchOpen,       setSearchOpen]       = useState(false);
    const [searchValue,      setSearchValue]      = useState("");
    const [categories,       setCategories]       = useState([]);
    const [subCategories,    setSubCategories]    = useState([]);
    const [megaMenuAnchor,   setMegaMenuAnchor]   = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const updateCartCount = useCallback(async () => {
        const count = await fetchCartCount();
        setCartItemCount(count);
    }, []);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        updateCartCount();
        fetchCategories();
        fetchSubCategories();
        window.addEventListener("cartUpdated", updateCartCount);
        return () => window.removeEventListener("cartUpdated", updateCartCount);
    }, [updateCartCount]);

    const fetchCategories = async () => {
        try { setCategories(await categoryService.getAllCategories()); }
        catch (err) { console.error(err); }
    };
    const fetchSubCategories = async () => {
        try { setSubCategories(await subCategoryService.getAllSubCategories()); }
        catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setProfileAnchor(null);
        setCartItemCount(0);
        navigate("/");
        window.location.reload();
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`);
        handleCloseMegaMenu();
        setMobileOpen(false);
    };
    const handleSubCategoryClick = (subCategoryId) => {
        navigate(`/subcategory/${subCategoryId}`);
        handleCloseMegaMenu();
    };
    const handleCategoryHover = (event, category) => {
        setMegaMenuAnchor(event.currentTarget);
        setSelectedCategory(category);
    };
    const handleCloseMegaMenu = () => {
        setMegaMenuAnchor(null);
        setSelectedCategory(null);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `${API}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
    };

    const getSubCategoriesForCategory = (categoryId) =>
        subCategories.filter((sub) => sub.categoryId === categoryId);

    /* ── Mobile drawer ── */
    const mobileDrawer = (
        <Box sx={{ width: 280, fontFamily: "'IBM Plex Mono', monospace" }}>
            <Box sx={{ p: 3, backgroundColor: "#000" }}>
                <Typography sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900, fontStyle: "italic",
                    fontSize: 22, color: "#fff", letterSpacing: "-0.02em",
                }}>
                    Clothify
                </Typography>
            </Box>

            <Box sx={{ p: 2 }}>
                <Box
                    onClick={() => { navigate("/"); setMobileOpen(false); }}
                    sx={{
                        py: 1.5, px: 2, cursor: "pointer",
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
                        borderBottom: "1px solid #f0f0eb",
                        "&:hover": { backgroundColor: "#f5f5f0" },
                    }}
                >
                    Home
                </Box>

                {categories.map((category) => (
                    <Box key={category.categoryId}>
                        <Box
                            onClick={() => handleCategoryClick(category.categoryId)}
                            sx={{
                                py: 1.5, px: 2, cursor: "pointer",
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
                                borderBottom: "1px solid #f0f0eb",
                                "&:hover": { backgroundColor: "#f5f5f0" },
                            }}
                        >
                            {category.categoryName}
                        </Box>
                        {getSubCategoriesForCategory(category.categoryId).map((sub) => (
                            <Box
                                key={sub.subCategoryId}
                                onClick={() => { handleSubCategoryClick(sub.subCategoryId); setMobileOpen(false); }}
                                sx={{
                                    py: 1.2, pl: 5, pr: 2, cursor: "pointer",
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                                    color: "#888",
                                    borderBottom: "1px solid #f8f8f5",
                                    "&:hover": { backgroundColor: "#f5f5f0", color: "#000" },
                                }}
                            >
                                → {sub.subCategoryName}
                            </Box>
                        ))}
                    </Box>
                ))}

                <Box sx={{ mt: 2 }}>
                    {user ? (
                        <>
                            <Box
                                onClick={() => {
                                    const isAdmin = user?.role === "ADMIN" || user?.roles?.includes("ADMIN");
                                    navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
                                    setMobileOpen(false);
                                }}
                                sx={{
                                    py: 1.5, px: 2, cursor: "pointer",
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
                                    borderBottom: "1px solid #f0f0eb",
                                    "&:hover": { backgroundColor: "#f5f5f0" },
                                }}
                            >
                                Dashboard
                            </Box>
                            <Box
                                onClick={() => { handleLogout(); setMobileOpen(false); }}
                                sx={{
                                    py: 1.5, px: 2, cursor: "pointer",
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
                                    "&:hover": { backgroundColor: "#000", color: "#fff" },
                                }}
                            >
                                Sign Out
                            </Box>
                        </>
                    ) : (
                        <Box
                            onClick={() => { navigate("/login"); setMobileOpen(false); }}
                            sx={{
                                py: 1.5, px: 2, cursor: "pointer",
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
                                "&:hover": { backgroundColor: "#f5f5f0" },
                            }}
                        >
                            Sign In
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{ background: "transparent", px: { xs: 1, md: 6 }, pt: 3 }}
            >
                <Toolbar
                    sx={{
                        backgroundColor: "#000",
                        borderRadius: "999px",
                        minHeight: 64,
                        px: 4,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {/* LEFT */}
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                            sx={{ color: "#fff", display: { xs: "flex", md: "none" } }}
                            onClick={() => setMobileOpen(true)}
                        >
                            <MenuOutlined />
                        </IconButton>
                        <Typography
                            onClick={() => navigate("/")}
                            sx={{
                                color: "#fff", fontWeight: 600, cursor: "pointer",
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
                                display: { xs: "none", md: "block" },
                                opacity: 0.7,
                                "&:hover": { opacity: 1 },
                            }}
                        >
                            Home
                        </Typography>
                    </Box>

                    {/* CENTER */}
                    <Box sx={{
                        flex: 2,
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                    }}>
                        {categories.map((category) => (
                            <Typography
                                key={category.categoryId}
                                onMouseEnter={(e) => handleCategoryHover(e, category)}
                                onClick={() => handleCategoryClick(category.categoryId)}
                                sx={{
                                    color: "#fff", cursor: "pointer",
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
                                    opacity: 0.7,
                                    transition: "opacity 0.2s",
                                    "&:hover": { opacity: 1 },
                                }}
                            >
                                {category.categoryName}
                            </Typography>
                        ))}

                        <Typography
                            onClick={() => navigate("/")}
                            sx={{
                                color: "#fff", cursor: "pointer", mx: 2,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 900, fontStyle: "italic",
                                fontSize: 20, letterSpacing: "-0.02em",
                                "&:hover": { opacity: 0.8 },
                            }}
                        >
                            Clothify
                        </Typography>
                    </Box>

                    {/* RIGHT */}
                    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                        {searchOpen ? (
                            <Box sx={{
                                backgroundColor: "rgba(255,255,255,0.12)",
                                borderBottom: "1px solid rgba(255,255,255,0.4)",
                                px: 2, py: 0.5,
                                display: "flex", alignItems: "center", width: 160,
                            }}>
                                <input
                                    autoFocus
                                    value={searchValue}
                                    onChange={(e) => {
                                        setSearchValue(e.target.value);
                                        window.dispatchEvent(new CustomEvent("navbarSearch", { detail: e.target.value }));
                                    }}
                                    onBlur={() => setSearchOpen(false)}
                                    placeholder="Search..."
                                    style={{
                                        border: "none", outline: "none", width: "100%",
                                        fontSize: 12, background: "transparent", color: "#fff",
                                        fontFamily: "'IBM Plex Mono', monospace",
                                    }}
                                />
                            </Box>
                        ) : (
                            <IconButton sx={{ color: "#fff", opacity: 0.7, "&:hover": { opacity: 1 } }} onClick={() => setSearchOpen(true)}>
                                <SearchOutlined sx={{ fontSize: 20 }} />
                            </IconButton>
                        )}

                        <IconButton sx={{ color: "#fff", opacity: 0.7, "&:hover": { opacity: 1 } }} onClick={() => navigate("/cart")}>
                            <Badge
                                badgeContent={cartItemCount > 0 ? cartItemCount : null}
                                color="error"
                                sx={{ "& .MuiBadge-badge": { fontSize: 9, height: 17, minWidth: 17 } }}
                            >
                                <ShoppingCartOutlined sx={{ fontSize: 20 }} />
                            </Badge>
                        </IconButton>

                        {/* Profile button */}
                        <IconButton
                            onClick={(e) => setProfileAnchor(e.currentTarget)}
                            sx={{
                                color: "#fff",
                                p: 0.5,
                                border: profileAnchor ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                                borderRadius: "50%",
                                transition: "border-color 0.2s ease",
                                "&:hover": { borderColor: "rgba(255,255,255,0.3)" },
                            }}
                        >
                            {user ? (
                                <Box sx={{
                                    width: 32, height: 32,
                                    backgroundColor: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    borderRadius: "50%",
                                }}>
                                    <Typography sx={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontWeight: 900, fontStyle: "italic",
                                        fontSize: 13, color: "#000",
                                        lineHeight: 1,
                                    }}>
                                        {user.username?.charAt(0).toUpperCase()}
                                    </Typography>
                                </Box>
                            ) : (
                                <PersonOutline sx={{ fontSize: 20, opacity: 0.7 }} />
                            )}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ── Profile Popover ── */}
            <Popover
                open={Boolean(profileAnchor)}
                anchorEl={profileAnchor}
                onClose={() => setProfileAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top",   horizontal: "right" }}
                sx={{ mt: 1.5 }}
                PaperProps={{
                    sx: {
                        borderRadius: 0,
                        boxShadow: "none",
                        overflow: "visible",
                        backgroundColor: "transparent",
                    },
                }}
            >
                {user ? (
                    <ProfilePanel
                        user={user}
                        navigate={navigate}
                        onClose={() => setProfileAnchor(null)}
                        onLogout={handleLogout}
                    />
                ) : (
                    /* Not logged in — simple sign-in panel */
                    <Box
                        className="profile-panel"
                        sx={{
                            width: 260,
                            backgroundColor: "#fff",
                            border: "1px solid #e8e8e0",
                            boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
                        }}
                    >
                        <Box sx={{ backgroundColor: "#000", px: 3, py: 3 }}>
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 900, fontStyle: "italic",
                                fontSize: 20, color: "#fff",
                            }}>
                                Welcome.
                            </Typography>
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 9, color: "rgba(255,255,255,0.4)",
                                letterSpacing: "0.16em", textTransform: "uppercase",
                                mt: 0.6,
                            }}>
                                Sign in to your account
                            </Typography>
                        </Box>
                        <Box sx={{ height: "2px", backgroundColor: "#000" }} />
                        <Box
                            onClick={() => { navigate("/login"); setProfileAnchor(null); }}
                            sx={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                px: 3, py: 2.5, cursor: "pointer",
                                transition: "background 0.2s ease",
                                "&:hover": { backgroundColor: "#000", "& *": { color: "#fff !important" } },
                            }}
                        >
                            <Typography sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11, fontWeight: 600,
                                letterSpacing: "0.14em", textTransform: "uppercase",
                                color: "#000", transition: "color 0.2s ease",
                            }}>
                                Sign In
                            </Typography>
                            <ArrowOutward sx={{ fontSize: 14, color: "#000", transition: "color 0.2s ease" }} />
                        </Box>
                    </Box>
                )}
            </Popover>

            {/* ── Mega Menu ── */}
            <Popover
                open={Boolean(megaMenuAnchor)}
                anchorEl={megaMenuAnchor}
                onClose={handleCloseMegaMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top",   horizontal: "center" }}
                disableRestoreFocus
                sx={{
                    pointerEvents: "none",
                    "& .MuiPopover-paper": { pointerEvents: "auto", mt: 2, borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
                }}
                PaperProps={{
                    onMouseLeave: handleCloseMegaMenu,
                    sx: { backgroundColor: "#000", color: "#fff", minWidth: 800, maxWidth: 1000 },
                }}
            >
                {selectedCategory && (
                    <Grid container sx={{ p: 4 }}>
                        <Grid item xs={5}>
                            <Box sx={{ width: "100%", height: 360, overflow: "hidden", backgroundColor: "#111" }}>
                                {selectedCategory.imageUrl && (
                                    <Box
                                        component="img"
                                        src={getImageUrl(selectedCategory.imageUrl)}
                                        alt={selectedCategory.categoryName}
                                        sx={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(20%)" }}
                                    />
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={7} sx={{ pl: 4 }}>
                            <Typography sx={{
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 900, fontStyle: "italic",
                                fontSize: 28, color: "#fff",
                                letterSpacing: "-0.02em",
                                borderBottom: "2px solid #fff",
                                pb: 2, mb: 3,
                            }}>
                                {selectedCategory.categoryName}
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                                {getSubCategoriesForCategory(selectedCategory.categoryId).map((sub) => (
                                    <Typography
                                        key={sub.subCategoryId}
                                        onClick={() => handleSubCategoryClick(sub.subCategoryId)}
                                        sx={{
                                            color: "rgba(255,255,255,0.6)", cursor: "pointer",
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                                            py: 1.2,
                                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                                            transition: "color 0.2s, padding-left 0.2s",
                                            "&:hover": { color: "#fff", paddingLeft: "6px" },
                                        }}
                                    >
                                        {sub.subCategoryName}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Popover>

            {/* ── Mobile Drawer ── */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{ "& .MuiDrawer-paper": { borderRadius: 0 } }}
            >
                {mobileDrawer}
            </Drawer>
        </>
    );
};

export default Navbar;