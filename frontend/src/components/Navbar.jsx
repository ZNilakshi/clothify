import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Typography,
    Badge,
    Menu,
    MenuItem,
    Avatar,
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import authService from "../services/authService";
import categoryService from "../services/categoryService";
import subCategoryService from "../services/subCategoryService";

/* ─── Backend cart count ─────────────────────────────────────── */
const API = "http://localhost:8080";

const fetchCartCount = async () => {
    const user = authService.getCurrentUser();
    if (!user?.customerId || !user?.token) return 0;
    try {
        const res  = await axios.get(
            `${API}/api/cart/customer/${user.customerId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const data  = res.data;
        const items = Array.isArray(data)
            ? data
            : (data.items ?? data.cartItems ?? data.cart ?? []);
        /* Sum all item quantities for total count */
        return items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    } catch (_) {
        return 0;
    }
};

/* ─── Navbar ─────────────────────────────────────────────────── */
const Navbar = () => {
    const navigate = useNavigate();
    const [user,            setUser]            = useState(null);
    const [anchorEl,        setAnchorEl]        = useState(null);
    const [cartItemCount,   setCartItemCount]   = useState(0);
    const [mobileOpen,      setMobileOpen]      = useState(false);
    const [searchOpen,      setSearchOpen]      = useState(false);
    const [searchValue,     setSearchValue]     = useState("");
    const [categories,      setCategories]      = useState([]);
    const [subCategories,   setSubCategories]   = useState([]);
    const [megaMenuAnchor,  setMegaMenuAnchor]  = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    /* Fetch and update cart badge count from backend */
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
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const fetchSubCategories = async () => {
        try {
            const data = await subCategoryService.getAllSubCategories();
            setSubCategories(data);
        } catch (err) {
            console.error("Error fetching subcategories:", err);
        }
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setAnchorEl(null);
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

    const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

    /* ── Mobile drawer ── */
    const mobileDrawer = (
        <Box sx={{ width: 260 }}>
            <Box sx={{ p: 2 }}>
                <Typography fontWeight={700} letterSpacing={2}>CLOTHIFY</Typography>
            </Box>
            <Divider />

            <ListItem button onClick={() => { navigate("/"); setMobileOpen(false); }}>
                <ListItemText primary="Home" />
            </ListItem>

            {categories.map((category) => (
                <Box key={category.categoryId}>
                    <ListItem button onClick={() => handleCategoryClick(category.categoryId)}>
                        <ListItemText primary={category.categoryName} />
                    </ListItem>
                    {getSubCategoriesForCategory(category.categoryId).map((sub) => (
                        <ListItem
                            key={sub.subCategoryId}
                            button
                            sx={{ pl: 4 }}
                            onClick={() => { handleSubCategoryClick(sub.subCategoryId); setMobileOpen(false); }}
                        >
                            <ListItemText primary={sub.subCategoryName} />
                        </ListItem>
                    ))}
                </Box>
            ))}

            <Divider sx={{ my: 1 }} />

            {user ? (
                <>
                    <ListItem button onClick={() => { navigate("/admin/dashboard"); setMobileOpen(false); }}>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button onClick={() => { handleLogout(); setMobileOpen(false); }}>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </>
            ) : (
                <ListItem button onClick={() => { navigate("/login"); setMobileOpen(false); }}>
                    <ListItemText primary="Sign In" />
                </ListItem>
            )}
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
                            onClick={toggleMobileMenu}
                        >
                            <MenuOutlined />
                        </IconButton>

                        <Typography
                            onClick={() => navigate("/")}
                            sx={{
                                color: "#fff", fontWeight: 600, cursor: "pointer",
                                display: { xs: "none", md: "block" },
                                "&:hover": { opacity: 0.8 },
                            }}
                        >
                            HOME
                        </Typography>
                    </Box>

                    {/* CENTER — categories */}
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
                                    color: "#fff", fontSize: 14, cursor: "pointer",
                                    opacity: 0.85, textTransform: "uppercase", letterSpacing: 1,
                                    transition: "all 0.3s",
                                    "&:hover": { opacity: 1, transform: "translateY(-2px)" },
                                }}
                            >
                                {category.categoryName}
                            </Typography>
                        ))}

                        <Typography
                            onClick={() => navigate("/")}
                            sx={{
                                color: "#fff", fontWeight: 700, letterSpacing: 2,
                                mx: 2, cursor: "pointer",
                                "&:hover": { opacity: 0.8 },
                            }}
                        >
                            CLOTHIFY
                        </Typography>
                    </Box>

                    {/* RIGHT */}
                    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        {/* Search */}
                        {searchOpen ? (
                            <Box sx={{
                                backgroundColor: "#fff", borderRadius: 20,
                                px: 2, py: 0.5,
                                display: "flex", alignItems: "center", width: 180,
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
                                    style={{ border: "none", outline: "none", width: "100%", fontSize: 14 }}
                                />
                            </Box>
                        ) : (
                            <IconButton sx={{ color: "#fff" }} onClick={() => setSearchOpen(true)}>
                                <SearchOutlined />
                            </IconButton>
                        )}

                        {/* Cart badge — count from backend */}
                        <IconButton sx={{ color: "#fff" }} onClick={() => navigate("/cart")}>
                            <Badge
                                badgeContent={cartItemCount > 0 ? cartItemCount : null}
                                color="error"
                                sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 18, minWidth: 18 } }}
                            >
                                <ShoppingCartOutlined />
                            </Badge>
                        </IconButton>

                        {/* User menu */}
                        <IconButton sx={{ color: "#fff" }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                            {user ? (
                                <Avatar sx={{ width: 32, height: 32, bgcolor: "#fff", color: "#000", fontSize: 14 }}>
                                    {user.username?.charAt(0).toUpperCase()}
                                </Avatar>
                            ) : (
                                <PersonOutline />
                            )}
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top",  horizontal: "right" }}
                        >
                            {user ? (
                                <>
                                    <MenuItem onClick={() => { navigate("/admin/dashboard"); setAnchorEl(null); }}>
                                        <Dashboard sx={{ mr: 1 }} /> Dashboard
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Logout sx={{ mr: 1 }} /> Logout
                                    </MenuItem>
                                </>
                            ) : (
                                <MenuItem onClick={() => { navigate("/login"); setAnchorEl(null); }}>
                                    Sign In
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* MEGA MENU */}
            <Popover
                open={Boolean(megaMenuAnchor)}
                anchorEl={megaMenuAnchor}
                onClose={handleCloseMegaMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top",   horizontal: "center" }}
                disableRestoreFocus
                sx={{
                    pointerEvents: "none",
                    "& .MuiPopover-paper": { pointerEvents: "auto", mt: 2, borderRadius: 4, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "visible" },
                }}
                PaperProps={{
                    onMouseLeave: handleCloseMegaMenu,
                    sx: { backgroundColor: "#000", color: "#fff", minWidth: 800, maxWidth: 1000 },
                }}
            >
                {selectedCategory && (
                    <Grid container sx={{ p: 4 }}>
                        {/* Category image */}
                        <Grid item xs={5}>
                            <Box sx={{ width: "100%", height: 400, borderRadius: 3, overflow: "hidden", backgroundColor: "#1a1a1a" }}>
                                {selectedCategory.imageUrl && (
                                    <Box
                                        component="img"
                                        src={getImageUrl(selectedCategory.imageUrl)}
                                        alt={selectedCategory.categoryName}
                                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                )}
                            </Box>
                        </Grid>

                        {/* Subcategories */}
                        <Grid item xs={7} sx={{ pl: 4 }}>
                            <Typography variant="h5" fontWeight="bold" sx={{
                                mb: 3, letterSpacing: 2, textTransform: "uppercase",
                                borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 1,
                            }}>
                                {selectedCategory.categoryName}
                            </Typography>

                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, width: "100%" }}>
                                {getSubCategoriesForCategory(selectedCategory.categoryId).map((sub) => (
                                    <Typography
                                        key={sub.subCategoryId}
                                        onClick={() => handleSubCategoryClick(sub.subCategoryId)}
                                        sx={{
                                            color: "#fff", fontSize: 13, cursor: "pointer",
                                            textTransform: "uppercase", letterSpacing: 1, py: 1,
                                            transition: "all 0.2s",
                                            "&:hover": { color: "#ccc", transform: "translateX(5px)" },
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

            {/* MOBILE DRAWER */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={toggleMobileMenu}
                sx={{ "& .MuiDrawer-paper": { borderTopRightRadius: 16, borderBottomRightRadius: 16 } }}
            >
                {mobileDrawer}
            </Drawer>
        </>
    );
};

export default Navbar;