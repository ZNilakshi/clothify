import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Badge,
} from "@mui/material";
import { ArrowBack, ShoppingCart } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import productService from "../services/productService";
import subCategoryService from "../services/subCategoryService";
import cartService from "../services/cartService";

const SubCategoryProducts = () => {
    const { subCategoryId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [subCategory, setSubCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [subCategoryId]);

    // Listen for cart updates
    useEffect(() => {
        const handleCartUpdate = () => {
            setProducts([...products]);
        };
        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, [products]);

    const fetchData = async () => {
        try {
            // Fetch subcategory details
            const subCategoryData = await subCategoryService.getSubCategoryById(subCategoryId);
            setSubCategory(subCategoryData);

            // Fetch all products and filter by subcategory
            const allProducts = await productService.getActiveProducts();
            const filteredProducts = allProducts.filter(
                (p) => p.subCategoryId === parseInt(subCategoryId)
            );
            setProducts(filteredProducts);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
        return `http://localhost:8080${cleanPath}`;
    };

    const getCartQuantity = (productId) => {
        return cartService.getProductTotalQuantity(productId);
    };

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#faf7f2" }}>
                <Navbar />
                <Container sx={{ mt: 4 }}>
                    <Typography>Loading...</Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#faf7f2" }}>
            <Navbar />

            <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
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
                    Back to Home
                </Button>

                {/* SubCategory Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" fontWeight="bold" mb={1}>
                        {subCategory?.subCategoryName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {products.length} product{products.length !== 1 ? "s" : ""} found
                    </Typography>
                </Box>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <Typography variant="h6" color="text.secondary">
                            No products found in this subcategory
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2} justifyContent="center">
                        {products.map((product) => {
                            const cartQty = getCartQuantity(product.productId);
                            const hasDiscount = product.discount && parseFloat(product.discount) > 0;
                            const originalPrice = parseFloat(product.sellingPrice || product.price || 0);
                            const finalPrice = hasDiscount && product.discountPrice
                                ? parseFloat(product.discountPrice)
                                : originalPrice;
                            const isOutOfStock = product.stockQuantity <= 0;

                            return (
                                <Grid
                                    item
                                    key={product.productId}
                                    sx={{ 
                                        flexBasis: { xs: '50%', sm: '33.33%', md: '20%' }, 
                                        maxWidth: { xs: '50%', sm: '33.33%', md: '20%' },
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Card
                                        onClick={() => handleProductClick(product.productId)}
                                        sx={{
                                            width: '100%',
                                            borderRadius: 4,
                                            cursor: "pointer",
                                            position: "relative",
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                            opacity: isOutOfStock ? 0.6 : 1,
                                            "&:hover": {
                                                transform: "translateY(-10px)",
                                                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                                            },
                                        }}
                                    >
                                        {/* Badges */}
                                        <Box sx={{
                                            position: "absolute",
                                            top: 8,
                                            left: 8,
                                            right: 8,
                                            zIndex: 2,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            flexWrap: "wrap",
                                            gap: 0.5,
                                        }}>
                                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                                {hasDiscount && (
                                                    <Chip
                                                        label={`${parseFloat(product.discount).toFixed(0)}% OFF`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: "#d32f2f",
                                                            color: "#fff",
                                                            fontWeight: "bold",
                                                            fontSize: 10,
                                                            height: 22,
                                                        }}
                                                    />
                                                )}
                                                {isOutOfStock && (
                                                    <Chip
                                                        label="Out of Stock"
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: "#616161",
                                                            color: "#fff",
                                                            fontWeight: "bold",
                                                            fontSize: 10,
                                                            height: 22,
                                                        }}
                                                    />
                                                )}
                                                {!isOutOfStock && product.stockQuantity <= 5 && (
                                                    <Chip
                                                        label={`Only ${product.stockQuantity} left!`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: "#ff9800",
                                                            color: "#fff",
                                                            fontWeight: "bold",
                                                            fontSize: 10,
                                                            height: 22,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            {cartQty > 0 && (
                                                <Chip
                                                    label={`${cartQty} in cart`}
                                                    size="small"
                                                    sx={{
                                                        marginLeft: "auto",
                                                        backgroundColor: "#000",
                                                        color: "#fff",
                                                        fontWeight: "bold",
                                                        fontSize: 10,
                                                        height: 22,
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        {/* Image */}
                                        <CardMedia
                                            component="img"
                                            sx={{
                                                height: 260,
                                                objectFit: "cover",
                                                filter: isOutOfStock ? "grayscale(50%)" : "none",
                                            }}
                                            image={getImageUrl(product.imageUrl)}
                                            alt={product.productName}
                                        />

                                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="700"
                                                noWrap
                                                sx={{ mb: 0.5, textTransform: "uppercase", letterSpacing: 1 }}
                                            >
                                                {product.productName}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    height: "40px",
                                                    lineHeight: "20px",
                                                }}
                                            >
                                                {product.productDescription || "No description available"}
                                            </Typography>

                                            {/* Price + Cart */}
                                            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                                <Box>
                                                    {hasDiscount ? (
                                                        <>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    textDecoration: "line-through",
                                                                    color: "text.secondary",
                                                                    display: "block",
                                                                    lineHeight: 1.2,
                                                                }}
                                                            >
                                                                ${originalPrice.toFixed(2)}
                                                            </Typography>
                                                            <Typography
                                                                variant="h6"
                                                                fontWeight="800"
                                                                color="#000"
                                                                lineHeight={1.2}
                                                            >
                                                                ${finalPrice.toFixed(2)}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                fontWeight="bold"
                                                                color="#d32f2f"
                                                                display="block"
                                                            >
                                                                Save ${(originalPrice - finalPrice).toFixed(2)}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <Typography color="#000" fontWeight="800" variant="h6">
                                                            ${originalPrice.toFixed(2)}
                                                        </Typography>
                                                    )}

                                                    {isOutOfStock ? (
                                                        <Typography variant="caption" color="error" fontWeight="bold">
                                                            Out of stock
                                                        </Typography>
                                                    ) : product.stockQuantity <= 5 ? (
                                                        <Typography variant="caption" color="warning.main">
                                                            Only {product.stockQuantity} left
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="caption" color="success.main">
                                                            In stock
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "50%",
                                                        backgroundColor: cartQty > 0 ? "#000" : "#f5f5f5",
                                                        color: cartQty > 0 ? "#fff" : "#000",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        transition: "all 0.3s",
                                                    }}
                                                >
                                                    <Badge
                                                        badgeContent={cartQty > 0 ? cartQty : null}
                                                        color="error"
                                                        sx={{
                                                            "& .MuiBadge-badge": {
                                                                fontSize: 10,
                                                                height: 18,
                                                                minWidth: 18,
                                                            },
                                                        }}
                                                    >
                                                        <ShoppingCart fontSize="small" />
                                                    </Badge>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default SubCategoryProducts;