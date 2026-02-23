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
import { useState, useEffect } from "react";
import authService from "../services/authService";
import cartService from "../services/cartService";
import categoryService from "../services/categoryService";
import subCategoryService from "../services/subCategoryService";

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [megaMenuAnchor, setMegaMenuAnchor] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        console.log("🧑 Navbar user object:", currentUser); // 👈 ADD THIS
        updateCartCount();
        fetchCategories();
        fetchSubCategories();
    
        window.addEventListener("cartUpdated", updateCartCount);
        return () => window.removeEventListener("cartUpdated", updateCartCount);
    }, []);

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

    const updateCartCount = () => {
        setCartItemCount(cartService.getCartItemCount());
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setAnchorEl(null);
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
        const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
        return `http://localhost:8080${cleanPath}`;
    };

    const getSubCategoriesForCategory = (categoryId) => {
        return subCategories.filter((sub) => sub.categoryId === categoryId);
    };

    const toggleMobileMenu = () => {
        setMobileOpen(!mobileOpen);
    };

    const mobileDrawer = (
        <Box sx={{ width: 260 }}>
            <Box sx={{ p: 2 }}>
                <Typography fontWeight={700} letterSpacing={2}>
                    CLOTHIFY
                </Typography>
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
                            onClick={() => {
                                handleSubCategoryClick(sub.subCategoryId);
                                setMobileOpen(false);
                            }}
                        >
                            <ListItemText primary={sub.subCategoryName} secondary="" />
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
                sx={{
                    background: "transparent",
                    px: { xs: 1, md: 6 },
                    pt: 3,
                }}
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
                                color: "#fff",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: { xs: "none", md: "block" },
                                "&:hover": { opacity: 0.8 },
                            }}
                        >
                            HOME
                        </Typography>
                    </Box>

                    {/* CENTER */}
                    <Box
                        sx={{
                            flex: 2,
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                        }}
                    >
                        {categories.map((category) => (
                            <Typography
                                key={category.categoryId}
                                onMouseEnter={(e) => handleCategoryHover(e, category)}
                                onClick={() => handleCategoryClick(category.categoryId)}
                                sx={{
                                    color: "#fff",
                                    fontSize: 14,
                                    cursor: "pointer",
                                    opacity: 0.85,
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                    transition: "all 0.3s",
                                    "&:hover": {
                                        opacity: 1,
                                        transform: "translateY(-2px)",
                                    },
                                }}
                            >
                                {category.categoryName}
                            </Typography>
                        ))}

                        <Typography
                            sx={{
                                color: "#fff",
                                fontWeight: 700,
                                letterSpacing: 2,
                                mx: 2,
                                cursor: "pointer",
                                "&:hover": { opacity: 0.8 },
                            }}
                            onClick={() => navigate("/")}
                        >
                            CLOTHIFY
                        </Typography>
                    </Box>

                    {/* RIGHT */}
                    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        {searchOpen ? (
                            <Box
                                sx={{
                                    backgroundColor: "#fff",
                                    borderRadius: 20,
                                    px: 2,
                                    py: 0.5,
                                    display: "flex",
                                    alignItems: "center",
                                    width: 180,
                                }}
                            >
                                <input
                                    autoFocus
                                    value={searchValue}
                                    onChange={(e) => {
                                        setSearchValue(e.target.value);
                                        window.dispatchEvent(
                                            new CustomEvent("navbarSearch", { detail: e.target.value })
                                        );
                                    }}
                                    onBlur={() => setSearchOpen(false)}
                                    placeholder="Search..."
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        width: "100%",
                                        fontSize: 14,
                                    }}
                                />
                            </Box>
                        ) : (
                            <IconButton sx={{ color: "#fff" }} onClick={() => setSearchOpen(true)}>
                                <SearchOutlined />
                            </IconButton>
                        )}

                        <IconButton sx={{ color: "#fff" }} onClick={() => navigate("/cart")}>
                            <Badge badgeContent={cartItemCount} color="error">
                                <ShoppingCartOutlined />
                            </Badge>
                        </IconButton>

                        <IconButton sx={{ color: "#fff" }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                            {user ? (
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: "#fff",
                                        color: "#000",
                                        fontSize: 14,
                                    }}
                                >
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
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            {user ? (
                                <>
                                    <MenuItem onClick={() => { navigate("/admin/dashboard"); setAnchorEl(null); }}>
                                        <Dashboard sx={{ mr: 1 }} />
                                        Dashboard
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Logout sx={{ mr: 1 }} />
                                        Logout
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
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                disableRestoreFocus
                sx={{
                    pointerEvents: "none",
                    "& .MuiPopover-paper": {
                        pointerEvents: "auto",
                        mt: 2,
                        borderRadius: 4,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        overflow: "visible",
                    },
                }}
                PaperProps={{
                    onMouseLeave: handleCloseMegaMenu,
                    sx: {
                        backgroundColor: "#000",
                        color: "#fff",
                        minWidth: 800,
                        maxWidth: 1000,
                    },
                }}
            >
                {selectedCategory && (
                    <Grid container sx={{ p: 4 }}>
                        {/* LEFT - Category Image */}
                        <Grid item xs={5}>
                            <Box
                                sx={{
                                    width: "100%",
                                    height: 400,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    backgroundColor: "#1a1a1a",
                                }}
                            >
                                {selectedCategory.imageUrl && (
                                    <img
                                        src={getImageUrl(selectedCategory.imageUrl)}
                                        alt={selectedCategory.categoryName}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </Box>
                        </Grid>
{/* RIGHT - Subcategories */}
<Grid item xs={7} sx={{ pl: 4 }}>
    <Typography
        variant="h5"
        fontWeight="bold"
        sx={{
            mb: 3,
            letterSpacing: 2,
            textTransform: "uppercase",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            pb: 1,
        }}
    >
        {selectedCategory.categoryName}
    </Typography>

    {/* Using CSS Grid instead of MUI Grid for strict column control */}
    <Box
        sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)", // 👈 This FORCES 3 equal columns
            gap: 2, // Space between items
            width: "100%",
        }}
    >
        {getSubCategoriesForCategory(selectedCategory.categoryId).map((sub) => (
            <Typography
                key={sub.subCategoryId}
                onClick={() => handleSubCategoryClick(sub.subCategoryId)}
                sx={{
                    color: "#fff",
                    fontSize: 13,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    py: 1,
                    transition: "all 0.2s",
                    "&:hover": {
                        color: "#ccc",
                        transform: "translateX(5px)",
                    },
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
                sx={{
                    "& .MuiDrawer-paper": {
                        borderTopRightRadius: 16,
                        borderBottomRightRadius: 16,
                    },
                }}
            >
                {mobileDrawer}
            </Drawer>
        </>
    );
};

export default Navbar;