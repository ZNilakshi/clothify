import {
    Box,
    Container,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import CategorySection from "../components/home/CategorySection";
import SubCategorySection from "../components/home/SubCategorySection";
import ProductSection from "../components/home/ProductSection";

import productService from "../services/productService";
import categoryService from "../services/categoryService";
import subCategoryService from "../services/subCategoryService";
import cartService from "../services/cartService";

const Home = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        fetchData();
        updateCart();
        window.addEventListener("cartUpdated", updateCart);

        return () =>
            window.removeEventListener("cartUpdated", updateCart);
    }, []);

    const fetchData = async () => {
        try {
            const [productsData, categoriesData, subCategoriesData] =
                await Promise.all([
                    productService.getActiveProducts(),
                    categoryService.getAllCategories(),
                    subCategoryService.getAllSubCategories(),
                ]);

            setProducts(productsData);
            setCategories(categoriesData);
            setSubCategories(subCategoriesData);
        } catch (err) {
            console.error("Error loading data:", err);
            showSnackbar("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const updateCart = () => {
        setCart(cartService.getCart());
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const getCartQuantity = (productId) => {
        const item = cart.find((p) => p.productId === productId);
        return item ? item.quantity : 0;
    };

    const handleAddToCart = (product, e) => {
        e.stopPropagation();

        if (product.stockQuantity <= 0) {
            showSnackbar("Product is out of stock", "error");
            return;
        }

        cartService.addToCart(product, 1);
        updateCart();
        showSnackbar(`${product.productName} added to cart`);
    };

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;

        if (imageUrl.startsWith("http")) return imageUrl;

        const cleanPath = imageUrl.startsWith("/")
            ? imageUrl
            : `/${imageUrl}`;

        return `http://localhost:8080${cleanPath}`;
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#faf7f2" }}>
            {/* HERO SECTION */}
            <Box
                sx={{
                    backgroundImage: `url("/banner1.png")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 5,
                    mx: { xs: 1, md: 4 },
                    minHeight: "90vh",
                    mt: 2,
                    pt: 2,
                }}
            >
                <Navbar />
            </Box>

            <Container maxWidth="xxl" sx={{ mt: 1, mb: 1 }}>
              

                {loading ? (
                    <Typography>Loading...</Typography>
                ) : (
                    <>
                        <CategorySection
                            categories={categories}
                            getImageUrl={getImageUrl}
                        />

                        <SubCategorySection
                            subCategories={subCategories}
                            getImageUrl={getImageUrl}
                        />

                        <ProductSection
                            products={products}
                            getImageUrl={getImageUrl}
                            handleProductClick={handleProductClick}
                            handleAddToCart={handleAddToCart}
                            getCartQuantity={getCartQuantity}
                        />
                    </>
                )}
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Home;
