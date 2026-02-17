import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Chip,
    Paper,
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";
import { Add, Remove, ShoppingCart, ArrowBack } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import productService from "../services/productService";
import cartService from "../services/cartService";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [cartQuantity, setCartQuantity] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        fetchProduct();
        updateCartQuantity();
        window.addEventListener("cartUpdated", updateCartQuantity);
        return () => {
            window.removeEventListener("cartUpdated", updateCartQuantity);
        };
    }, [id]);

    const updateCartQuantity = () => {
        const cart = cartService.getCart();
        const cartItem = cart.find(
            (item) => item.productId === parseInt(id)
        );
        setCartQuantity(cartItem ? cartItem.quantity : 0);
    };

    const fetchProduct = async () => {
        try {
            const data = await productService.getProductById(id);
            setProduct(data);
        } catch (err) {
            console.error("Error fetching product:", err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `http://localhost:8080${imageUrl}`;
    };

    const getAvailableStock = () => {
        if (!product) return 0;
        return product.stockQuantity - cartQuantity;
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        const availableStock = getAvailableStock();
        if (newQuantity >= 1 && newQuantity <= availableStock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        const availableStock = getAvailableStock();
        if (availableStock <= 0) {
            setSnackbar({
                open: true,
                message: "No more stock available",
                severity: "error",
            });
            return;
        }

        cartService.addToCart(product, quantity);

        setSnackbar({
            open: true,
            message: `${quantity} item(s) added to cart`,
            severity: "success",
        });

        updateCartQuantity();
        setQuantity(1);
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const handleCloseSnackbar = () =>
        setSnackbar({ ...snackbar, open: false });

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f8f8" }}>
                <Navbar />
                <Container sx={{ mt: 4 }}>
                    <Typography>Loading...</Typography>
                </Container>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f8f8" }}>
                <Navbar />
                <Container sx={{ mt: 4 }}>
                    <Typography>Product not found</Typography>
                </Container>
            </Box>
        );
    }

    const availableStock = getAvailableStock();

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f8f8" }}>
            <Navbar />

            <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    variant="outlined"
                    onClick={() => navigate("/")}
                    sx={{
                        mb: 3,
                        borderColor: "#000",
                        color: "#000",
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "#000",
                            color: "#fff",
                            borderColor: "#000",
                        },
                    }}
                >
                    Back to Products
                </Button>

                <Paper
                    sx={{
                        p: 5,
                        borderRadius: 4,
                        backgroundColor: "#fff",
                        border: "1px solid #e5e5e5",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
                    }}
                >
                    <Grid container spacing={5}>
                        {/* Image */}
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    width: "100%",
                                    height: 450,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    backgroundColor: "#f2f2f2",
                                }}
                            >
                                {product.imageUrl && (
                                    <img
                                        src={getImageUrl(product.imageUrl)}
                                        alt={product.productName}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </Box>
                        </Grid>

                        {/* Info */}
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                sx={{ mb: 2 }}
                            >
                                {product.productName}
                            </Typography>

                            <Chip
                                label={product.categoryName}
                                sx={{
                                    mb: 3,
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            />

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{ mb: 3 }}
                            >
                                ${product.price.toFixed(2)}
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 4, lineHeight: 1.7 }}
                            >
                                {product.productDescription ||
                                    "No description available"}
                            </Typography>

                            {/* Quantity Selector */}
                            {availableStock > 0 ? (
                                <>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            mb: 4,
                                        }}
                                    >
                                        <Typography fontWeight="bold">
                                            Quantity
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                border:
                                                    "1px solid #ddd",
                                                borderRadius: 3,
                                            }}
                                        >
                                            <IconButton
                                                onClick={() =>
                                                    handleQuantityChange(-1)
                                                }
                                                disabled={quantity <= 1}
                                                sx={{
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#000",
                                                        color: "#fff",
                                                    },
                                                }}
                                            >
                                                <Remove />
                                            </IconButton>

                                            <Typography
                                                sx={{
                                                    px: 3,
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {quantity}
                                            </Typography>

                                            <IconButton
                                                onClick={() =>
                                                    handleQuantityChange(1)
                                                }
                                                disabled={
                                                    quantity >=
                                                    availableStock
                                                }
                                                sx={{
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#000",
                                                        color: "#fff",
                                                    },
                                                }}
                                            >
                                                <Add />
                                            </IconButton>
                                        </Box>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {availableStock} available
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        startIcon={<ShoppingCart />}
                                        onClick={handleAddToCart}
                                        sx={{
                                            backgroundColor: "#000",
                                            color: "#fff",
                                            py: 1.6,
                                            borderRadius: 3,
                                            textTransform: "none",
                                            fontSize: 16,
                                            "&:hover": {
                                                backgroundColor: "#111",
                                            },
                                        }}
                                    >
                                        Add to Cart
                                    </Button>
                                </>
                            ) : (
                                <Alert
                                    sx={{
                                        backgroundColor: "#f5f5f5",
                                        color: "#000",
                                        border:
                                            "1px solid #e0e0e0",
                                    }}
                                >
                                    Out of stock
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        borderRadius: 2,
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductDetails;
