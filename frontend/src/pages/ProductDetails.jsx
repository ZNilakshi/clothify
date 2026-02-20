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

// Color hex mapping
const COLOR_HEX = {
    BLACK: "#000000", WHITE: "#FFFFFF", RED: "#EF4444", BLUE: "#3B82F6",
    GREEN: "#22C55E", YELLOW: "#EAB308", PURPLE: "#A855F7", PINK: "#EC4899",
    ORANGE: "#F97316", GRAY: "#6B7280", BROWN: "#92400E", NAVY: "#1E3A5F",
};

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [cartQuantityForVariant, setCartQuantityForVariant] = useState(0);
    
    // Variant selection
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    // Update cart quantity when variant selection changes
    useEffect(() => {
        if (product) {
            updateCartQuantityForVariant();
        }
    }, [product, selectedColor, selectedSize]);

    // Listen for cart updates
    useEffect(() => {
        const handleCartUpdate = () => {
            updateCartQuantityForVariant();
        };
        
        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdate);
        };
    }, [selectedColor, selectedSize]);

    const updateCartQuantityForVariant = () => {
        if (!product) return;
        
        const hasVariants = product.variants?.length > 0;
        
        if (hasVariants && selectedColor && selectedSize) {
            // Get quantity for this specific variant
            const qty = cartService.getVariantQuantity(
                parseInt(id), 
                selectedColor, 
                selectedSize
            );
            setCartQuantityForVariant(qty);
        } else if (!hasVariants) {
            // No variants - get total for product
            const qty = cartService.getProductTotalQuantity(parseInt(id));
            setCartQuantityForVariant(qty);
        } else {
            setCartQuantityForVariant(0);
        }
    };

    const fetchProduct = async () => {
        try {
            const data = await productService.getProductById(id);
            setProduct(data);
            
            // Auto-select first available variant if exists
            if (data.variants?.length > 0) {
                const firstAvailable = data.variants.find(v => v.quantity > 0);
                if (firstAvailable) {
                    setSelectedColor(firstAvailable.color);
                    setSelectedSize(firstAvailable.size);
                } else {
                    setSelectedColor(data.variants[0].color);
                    setSelectedSize(data.variants[0].size);
                }
            }
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

    const getAvailableColors = () => {
        if (!product?.variants?.length) return [];
        return [...new Set(product.variants.map((v) => v.color))];
    };

    const getAvailableSizes = () => {
        if (!product?.variants?.length) return [];
        if (!selectedColor) return [];
        return product.variants
            .filter((v) => v.color === selectedColor)
            .map((v) => v.size);
    };

    const getSelectedVariantStock = () => {
        if (!product?.variants?.length) {
            return product?.stockQuantity || 0;
        }
        
        if (!selectedColor || !selectedSize) return 0;
        
        const variant = product.variants.find(
            (v) => v.color === selectedColor && v.size === selectedSize
        );
        return variant?.quantity || 0;
    };

    const getAvailableStock = () => {
        const variantStock = getSelectedVariantStock();
        return Math.max(0, variantStock - cartQuantityForVariant);
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        const availableStock = getAvailableStock();
        if (newQuantity >= 1 && newQuantity <= availableStock) {
            setQuantity(newQuantity);
        }
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        const sizesForColor = product.variants
            .filter((v) => v.color === color)
            .map((v) => v.size);
        
        if (!sizesForColor.includes(selectedSize)) {
            const firstAvailable = product.variants.find(
                v => v.color === color && v.quantity > 0
            );
            setSelectedSize(firstAvailable ? firstAvailable.size : sizesForColor[0]);
        }
        setQuantity(1);
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setQuantity(1);
    };

    const handleAddToCart = () => {
        const hasVariants = product.variants?.length > 0;
        
        if (hasVariants && (!selectedColor || !selectedSize)) {
            setSnackbar({
                open: true,
                message: "Please select color and size",
                severity: "warning",
            });
            return;
        }

        const availableStock = getAvailableStock();
        if (availableStock <= 0) {
            setSnackbar({
                open: true,
                message: hasVariants 
                    ? "This variant is out of stock or all in cart" 
                    : "Product is out of stock",
                severity: "error",
            });
            return;
        }

        if (quantity > availableStock) {
            setSnackbar({
                open: true,
                message: `Only ${availableStock} available`,
                severity: "error",
            });
            return;
        }

        const productToAdd = {
            ...product,
            ...(hasVariants && {
                selectedColor,
                selectedSize,
                displayName: `${product.productName} - ${selectedColor} / ${selectedSize}`,
            }),
        };

        cartService.addToCart(productToAdd, quantity);

        const variantText = hasVariants 
            ? ` (${selectedColor} / ${selectedSize})` 
            : '';

        setSnackbar({
            open: true,
            message: `${quantity} item(s) added to cart${variantText}`,
            severity: "success",
        });

        setQuantity(1);
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

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
    const totalVariantStock = getSelectedVariantStock();
    
    const hasDiscount = product.discount && parseFloat(product.discount) > 0;
    const originalPrice = parseFloat(product.sellingPrice || product.price || 0);
    const finalPrice = hasDiscount && product.discountPrice
        ? parseFloat(product.discountPrice)
        : originalPrice;
    
    const availableColors = getAvailableColors();
    const availableSizes = getAvailableSizes();
    const hasVariants = product.variants?.length > 0;

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f8f8" }}>
            <Navbar />

            <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
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
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    width: "100%",
                                    height: 450,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    backgroundColor: "#f2f2f2",
                                    position: "relative",
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

                                {hasDiscount && (
                                    <Chip
                                        label={`${parseFloat(product.discount).toFixed(0)}% OFF`}
                                        sx={{
                                            position: "absolute",
                                            top: 16,
                                            left: 16,
                                            backgroundColor: "#d32f2f",
                                            color: "#fff",
                                            fontWeight: "bold",
                                            fontSize: 14,
                                        }}
                                    />
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
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

                            <Box sx={{ mb: 3 }}>
                                {hasDiscount ? (
                                    <>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                textDecoration: "line-through",
                                                color: "text.secondary",
                                                mb: 0.5,
                                            }}
                                        >
                                            ${originalPrice.toFixed(2)}
                                        </Typography>
                                        <Typography variant="h3" fontWeight="bold" color="#000">
                                            ${finalPrice.toFixed(2)}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            fontWeight="bold"
                                            color="#d32f2f"
                                            sx={{ mt: 0.5 }}
                                        >
                                            You save ${(originalPrice - finalPrice).toFixed(2)}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="h3" fontWeight="bold">
                                        ${originalPrice.toFixed(2)}
                                    </Typography>
                                )}
                            </Box>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 4, lineHeight: 1.7 }}
                            >
                                {product.productDescription || "No description available"}
                            </Typography>

                            {/* COLOR SELECTION */}
                            {hasVariants && availableColors.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography fontWeight="bold" sx={{ mb: 1.5 }}>
                                        Select Color
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                        {availableColors.map((color) => {
                                            const isSelected = selectedColor === color;
                                            const hasStock = product.variants.some(
                                                v => v.color === color && v.quantity > 0
                                            );
                                            
                                            return (
                                                <Box
                                                    key={color}
                                                    onClick={() => handleColorSelect(color)}
                                                    sx={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: "50%",
                                                        backgroundColor: COLOR_HEX[color] || "#ccc",
                                                        border: isSelected
                                                            ? "4px solid #000"
                                                            : "2px solid #ddd",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                        boxShadow: isSelected
                                                            ? "0 0 0 3px #fff, 0 0 0 5px #000"
                                                            : "none",
                                                        opacity: hasStock ? 1 : 0.3,
                                                        "&:hover": {
                                                            transform: "scale(1.1)",
                                                        },
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                    {selectedColor && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                            Selected: {selectedColor}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* SIZE SELECTION */}
                            {hasVariants && availableSizes.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography fontWeight="bold" sx={{ mb: 1.5 }}>
                                        Select Size
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                        {availableSizes.map((size) => {
                                            const isSelected = selectedSize === size;
                                            const variant = product.variants.find(
                                                (v) => v.color === selectedColor && v.size === size
                                            );
                                            const isAvailable = variant && variant.quantity > 0;

                                            return (
                                                <Chip
                                                    key={size}
                                                    label={size}
                                                    onClick={() => isAvailable && handleSizeSelect(size)}
                                                    disabled={!isAvailable}
                                                    sx={{
                                                        px: 2,
                                                        py: 2.5,
                                                        fontSize: 14,
                                                        fontWeight: "bold",
                                                        border: isSelected
                                                            ? "2px solid #000"
                                                            : "1px solid #ddd",
                                                        backgroundColor: isSelected
                                                            ? "#000"
                                                            : "#fff",
                                                        color: isSelected ? "#fff" : "#000",
                                                        cursor: isAvailable ? "pointer" : "not-allowed",
                                                        opacity: isAvailable ? 1 : 0.3,
                                                        "&:hover": isAvailable
                                                            ? {
                                                                  backgroundColor: isSelected ? "#000" : "#f5f5f5",
                                                                  borderColor: "#000",
                                                              }
                                                            : {},
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                    {selectedSize && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Stock: {totalVariantStock} units
                                            </Typography>
                                            {cartQuantityForVariant > 0 && (
                                                <Typography variant="caption" color="success.main" fontWeight="bold" display="block">
                                                    {cartQuantityForVariant} already in cart
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )}

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
                                        <Typography fontWeight="bold">Quantity</Typography>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                border: "1px solid #ddd",
                                                borderRadius: 3,
                                            }}
                                        >
                                            <IconButton
                                                onClick={() => handleQuantityChange(-1)}
                                                disabled={quantity <= 1}
                                                sx={{
                                                    "&:hover": {
                                                        backgroundColor: "#000",
                                                        color: "#fff",
                                                    },
                                                }}
                                            >
                                                <Remove />
                                            </IconButton>

                                            <Typography sx={{ px: 3, fontWeight: "bold" }}>
                                                {quantity}
                                            </Typography>

                                            <IconButton
                                                onClick={() => handleQuantityChange(1)}
                                                disabled={quantity >= availableStock}
                                                sx={{
                                                    "&:hover": {
                                                        backgroundColor: "#000",
                                                        color: "#fff",
                                                    },
                                                }}
                                            >
                                                <Add />
                                            </IconButton>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary">
                                            {availableStock} available
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        startIcon={<ShoppingCart />}
                                        onClick={handleAddToCart}
                                        disabled={hasVariants && (!selectedColor || !selectedSize)}
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
                                            "&:disabled": {
                                                backgroundColor: "#e0e0e0",
                                                color: "#9e9e9e",
                                            },
                                        }}
                                    >
                                        {hasVariants && (!selectedColor || !selectedSize)
                                            ? "Select Color & Size"
                                            : "Add to Cart"}
                                    </Button>
                                </>
                            ) : (
                                <Alert
                                    severity="error"
                                    sx={{
                                        backgroundColor: "#fde8e8",
                                        color: "#d32f2f",
                                        border: "1px solid #d32f2f",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {hasVariants && selectedColor && selectedSize
                                        ? `${selectedColor} / ${selectedSize} is out of stock or all in cart`
                                        : hasVariants && (!selectedColor || !selectedSize)
                                        ? "Please select color and size"
                                        : "Out of stock"}
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
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductDetails;