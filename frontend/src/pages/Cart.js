import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    IconButton,
    Paper,
    Divider,
    Card,
    CardContent,
    Alert,
    Chip,
} from "@mui/material";
import {
    Add,
    Remove,
    Delete,
    ShoppingCartOutlined,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import cartService from "../services/cartService";

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
        setLoading(false);
    }, []);

    const loadCart = () => {
        const currentCart = cartService.getCart();
        setCart(currentCart);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `http://localhost:8080${imageUrl}`;
    };

    const handleQuantityChange = (cartItemKey, change, stockQuantity) => {
        const item = cart.find((item) => item.cartItemKey === cartItemKey);
        if (!item) return;

        const newQuantity = item.quantity + change;
        if (newQuantity < 1) return;

        if (newQuantity > stockQuantity) {
            alert(`Only ${stockQuantity} units available in stock`);
            return;
        }

        cartService.updateQuantity(cartItemKey, newQuantity);
        loadCart();
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const handleRemoveItem = (cartItemKey, displayName) => {
        if (window.confirm(`Remove ${displayName} from cart?`)) {
            cartService.removeFromCart(cartItemKey);
            loadCart();
            window.dispatchEvent(new Event("cartUpdated"));
        }
    };

    const handleClearCart = () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            cartService.clearCart();
            loadCart();
            window.dispatchEvent(new Event("cartUpdated"));
        }
    };

    const getItemPrice = (item) => {
        return parseFloat(item.discountPrice || item.sellingPrice || item.price || 0);
    };

    const calculateSubtotal = () =>
        cart.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);

    const calculateTax = () => calculateSubtotal() * 0.1;
    const calculateTotal = () => calculateSubtotal() + calculateTax();

    const handleCheckout = () => navigate("/checkout");

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f4f4" }}>
                <Navbar />
                <Container sx={{ mt: 4 }}>
                    <Typography>Loading...</Typography>
                </Container>
            </Box>
        );
    }

    if (cart.length === 0) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f4f4" }}>
                <Navbar />
                <Container sx={{ mt: 6 }}>
                    <Paper
                        sx={{
                            p: 10,
                            textAlign: "center",
                            borderRadius: 4,
                            backgroundColor: "#fff",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                            border: "1px solid #f0f0f0",
                        }}
                    >
                        <ShoppingCartOutlined
                            sx={{ fontSize: 80, mb: 2, color: "#bbb" }}
                        />
                        <Typography variant="h5" fontWeight="bold" mb={2}>
                            Your cart is empty
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate("/")}
                            sx={{
                                backgroundColor: "#000",
                                color: "#fff",
                                px: 5,
                                py: 1.5,
                                borderRadius: "50px",
                                textTransform: "none",
                                "&:hover": { backgroundColor: "#222" },
                            }}
                        >
                            Continue Shopping
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f4f4" }}>
            <Navbar />

            <Container maxWidth="lg" sx={{ mt: 5, mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold">
                        Shopping Cart ({cart.length}{" "}
                        {cart.length === 1 ? "item" : "items"})
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleClearCart}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Clear Cart
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    {/* CART ITEMS */}
                    <Grid item xs={12} md={8}>
                        {cart.map((item) => {
                            const itemPrice = getItemPrice(item);
                            const hasDiscount = item.discount && parseFloat(item.discount) > 0;
                            const originalPrice = parseFloat(item.sellingPrice || item.price || 0);
                            const displayName = item.displayName || item.productName;
                            
                            // Get stock quantity for this variant
                            const stockQuantity = item.selectedColor && item.selectedSize
                                ? (item.variants?.find(v => 
                                    v.color === item.selectedColor && 
                                    v.size === item.selectedSize
                                  )?.quantity || item.stockQuantity || 0)
                                : item.stockQuantity || 0;

                            return (
                                <Card
                                    key={item.cartItemKey}
                                    sx={{
                                        mb: 3,
                                        borderRadius: 4,
                                        backgroundColor: "#fff",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                                        border: "1px solid #f0f0f0",
                                        transition: "0.25s ease",
                                        cursor: "pointer",
                                        "&:hover": {
                                            boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
                                            transform: "translateY(-4px)",
                                        },
                                    }}
                                    onClick={() => navigate(`/product/${item.productId}`)}
                                >
                                    <CardContent>
                                        <Grid container spacing={3} alignItems="center">
                                            {/* IMAGE */}
                                            <Grid item xs={12} sm={3}>
                                                <Box
                                                    sx={{
                                                        height: 130,
                                                        borderRadius: 3,
                                                        overflow: "hidden",
                                                        backgroundColor: "#fafafa",
                                                        "& img": {
                                                            transition: "0.4s ease",
                                                        },
                                                        "&:hover img": {
                                                            transform: "scale(1.05)",
                                                        },
                                                    }}
                                                >
                                                    {item.imageUrl && (
                                                        <img
                                                            src={getImageUrl(item.imageUrl)}
                                                            alt={item.productName}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Grid>

                                            {/* INFO */}
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {item.productName}
                                                </Typography>
                                                
                                                {/* Variant chips */}
                                                {item.selectedColor && item.selectedSize && (
                                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1, mb: 1 }}>
                                                        <Chip 
                                                            label={item.selectedColor} 
                                                            size="small"
                                                            sx={{ 
                                                                backgroundColor: "#f0f0f0",
                                                                fontSize: 11,
                                                                height: 20,
                                                            }}
                                                        />
                                                        <Chip 
                                                            label={item.selectedSize} 
                                                            size="small"
                                                            sx={{ 
                                                                backgroundColor: "#f0f0f0",
                                                                fontSize: 11,
                                                                height: 20,
                                                            }}
                                                        />
                                                    </Box>
                                                )}

                                                <Typography variant="body2" color="text.secondary">
                                                    {item.categoryName}
                                                </Typography>

                                                {/* Price */}
                                                <Box sx={{ mt: 1 }}>
                                                    {hasDiscount ? (
                                                        <>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    textDecoration: "line-through",
                                                                    color: "text.secondary",
                                                                    mr: 1,
                                                                }}
                                                            >
                                                                ${originalPrice.toFixed(2)}
                                                            </Typography>
                                                            <Typography
                                                                component="span"
                                                                fontWeight="bold"
                                                                color="#d32f2f"
                                                            >
                                                                ${itemPrice.toFixed(2)}
                                                            </Typography>
                                                            <Chip
                                                                label={`${parseFloat(item.discount).toFixed(0)}% OFF`}
                                                                size="small"
                                                                sx={{
                                                                    ml: 1,
                                                                    backgroundColor: "#fde8e8",
                                                                    color: "#d32f2f",
                                                                    fontSize: 10,
                                                                    height: 18,
                                                                    fontWeight: "bold",
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <Typography fontWeight="bold">
                                                            ${itemPrice.toFixed(2)}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {/* Stock warning */}
                                                {stockQuantity <= 5 && stockQuantity > 0 && (
                                                    <Typography 
                                                        variant="caption" 
                                                        color="warning.main"
                                                        sx={{ display: 'block', mt: 0.5 }}
                                                    >
                                                        Only {stockQuantity} left in stock
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* QUANTITY */}
                                            <Grid item xs={12} sm={3}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleQuantityChange(
                                                                item.cartItemKey,
                                                                -1,
                                                                stockQuantity
                                                            );
                                                        }}
                                                        disabled={item.quantity <= 1}
                                                        sx={{
                                                            border: "1px solid #e0e0e0",
                                                            borderRadius: 2,
                                                            "&:hover": {
                                                                backgroundColor: "#000",
                                                                color: "#fff",
                                                            },
                                                        }}
                                                    >
                                                        <Remove />
                                                    </IconButton>

                                                    <Typography fontWeight="bold" fontSize={18}>
                                                        {item.quantity}
                                                    </Typography>

                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleQuantityChange(
                                                                item.cartItemKey,
                                                                1,
                                                                stockQuantity
                                                            );
                                                        }}
                                                        disabled={item.quantity >= stockQuantity}
                                                        sx={{
                                                            border: "1px solid #e0e0e0",
                                                            borderRadius: 2,
                                                            "&:hover": {
                                                                backgroundColor: "#000",
                                                                color: "#fff",
                                                            },
                                                        }}
                                                    >
                                                        <Add />
                                                    </IconButton>
                                                </Box>
                                            </Grid>

                                            {/* SUBTOTAL */}
                                            <Grid item xs={12} sm={2}>
                                                <Typography fontWeight="bold" textAlign="center">
                                                    ${(itemPrice * item.quantity).toFixed(2)}
                                                </Typography>
                                                <Box 
                                                    textAlign="center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveItem(
                                                                item.cartItemKey,
                                                                displayName
                                                            );
                                                        }}
                                                        sx={{
                                                            color: "#d32f2f",
                                                            "&:hover": {
                                                                backgroundColor: "#fde8e8",
                                                            },
                                                        }}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Grid>

                    {/* SUMMARY */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                p: 5,
                                borderRadius: 4,
                                backgroundColor: "#fff",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                                border: "1px solid #f0f0f0",
                                position: "sticky",
                                top: 120,
                            }}
                        >
                            <Typography variant="h5" fontWeight="bold" mb={3}>
                                Order Summary
                            </Typography>

                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Subtotal</Typography>
                                <Typography fontWeight="bold">
                                    ${calculateSubtotal().toFixed(2)}
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography color="text.secondary">Tax (10%)</Typography>
                                <Typography fontWeight="bold">
                                    ${calculateTax().toFixed(2)}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                mb={3}
                                sx={{
                                    backgroundColor: "#fafafa",
                                    p: 2,
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold">
                                    Total
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    ${calculateTotal().toFixed(2)}
                                </Typography>
                            </Box>

                            <Button
                                fullWidth
                                onClick={handleCheckout}
                                sx={{
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    py: 1.8,
                                    borderRadius: "50px",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    fontSize: 16,
                                    "&:hover": {
                                        backgroundColor: "#222",
                                    },
                                }}
                            >
                                Proceed to Checkout
                            </Button>

                            <Alert
                                sx={{
                                    mt: 3,
                                    backgroundColor: "#f9f9f9",
                                    border: "1px solid #eee",
                                }}
                            >
                                Free shipping on orders over $50
                            </Alert>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Cart;