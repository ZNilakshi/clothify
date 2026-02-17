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

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        setUser(authService.getCurrentUser());
        updateCartCount();

        window.addEventListener("cartUpdated", updateCartCount);
        return () => window.removeEventListener("cartUpdated", updateCartCount);
    }, []);

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

            {["Shop", "Women", "Men", "Accessories", "Offers"].map((text) => (
                <ListItem
                    button
                    key={text}
                    onClick={() => {
                        navigate("/");
                        setMobileOpen(false);
                    }}
                >
                    <ListItemText primary={text} />
                </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            {user ? (
                <>
                    <ListItem
                        button
                        onClick={() => {
                            navigate("/dashboard/");
                            setMobileOpen(false);
                        }}
                    >
                        <ListItemText primary="Dashboard" />
                    </ListItem>

                    <ListItem
                        button
                        onClick={() => {
                            handleLogout();
                            setMobileOpen(false);
                        }}
                    >
                        <ListItemText primary="Logout" />
                    </ListItem>
                </>
            ) : (
                <ListItem
                    button
                    onClick={() => {
                        navigate("/login");
                        setMobileOpen(false);
                    }}
                >
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
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        {/* Mobile menu */}
                        <IconButton
                            sx={{
                                color: "#fff",
                                display: { xs: "flex", md: "none" },
                            }}
                            onClick={toggleMobileMenu}
                        >
                            <MenuOutlined />
                        </IconButton>

                        {/* Desktop home */}
                        <Typography
                            onClick={() => navigate("/")}
                            sx={{
                                color: "#fff",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: { xs: "none", md: "block" },
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
                        {["SHOP", "WOMEN", "MEN", "ACCESSORIES", "OFFERS"].map(
                            (item) => (
                                <Typography
                                    key={item}
                                    sx={{
                                        color: "#fff",
                                        fontSize: 14,
                                        cursor: "pointer",
                                        opacity: 0.85,
                                        "&:hover": { opacity: 1 },
                                    }}
                                >
                                    {item}
                                </Typography>
                            )
                        )}

                        <Typography
                            sx={{
                                color: "#fff",
                                fontWeight: 700,
                                letterSpacing: 2,
                                mx: 2,
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/")}
                        >
                            CLOTHIFY
                        </Typography>
                    </Box>

                    {/* RIGHT */}
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 2,
                        }}
                    >
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
                                            new CustomEvent("navbarSearch", {
                                                detail: e.target.value,
                                            })
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
                            <IconButton
                                sx={{ color: "#fff" }}
                                onClick={() => setSearchOpen(true)}
                            >
                                <SearchOutlined />
                            </IconButton>
                        )}


                        <IconButton
                            sx={{ color: "#fff" }}
                            onClick={() => navigate("/cart")}
                        >
                            <Badge badgeContent={cartItemCount} color="error">
                                <ShoppingCartOutlined />
                            </Badge>
                        </IconButton>

                        <IconButton
                            sx={{ color: "#fff" }}
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                        >
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
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                        >
                            {user ? (
                                <>
                                    <MenuItem
                                        onClick={() => navigate("/admin/dashboard")}
                                    >
                                        <Dashboard sx={{ mr: 1 }} />
                                        Dashboard
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Logout sx={{ mr: 1 }} />
                                        Logout
                                    </MenuItem>
                                </>
                            ) : (
                                <MenuItem
                                    onClick={() => navigate("/login")}
                                >
                                    Sign In
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

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
