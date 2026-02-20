import {
    Box,
    Container,
    Typography,
    Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import cartService from "../services/cartService";
import ProductSection from "../components/home/ProductSection";

const CategoryProducts = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [categoryId]);

    // Listen for cart updates
    useEffect(() => {
        const handleCartUpdate = () => {
            setProducts((prev) => [...prev]); // Force re-render
        };
        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, []);

    const fetchData = async () => {
        try {
            const categoryData = await categoryService.getCategoryById(categoryId);
            setCategory(categoryData);

            const allProducts = await productService.getActiveProducts();
            const filteredProducts = allProducts.filter(
                (p) => p.categoryId === parseInt(categoryId)
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

                {/* Category Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" fontWeight="bold" mb={1}>
                        {category?.categoryName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {products.length} product{products.length !== 1 ? "s" : ""} found
                    </Typography>
                </Box>

                {/* Products */}
                {products.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <Typography variant="h6" color="text.secondary">
                            No products found in this category
                        </Typography>
                    </Box>
                ) : (
                    <ProductSection
                        products={products}
                        getImageUrl={getImageUrl}
                        getCartQuantity={getCartQuantity}
                        handleProductClick={handleProductClick}
                    />
                )}
            </Container>
        </Box>
    );
};

export default CategoryProducts;