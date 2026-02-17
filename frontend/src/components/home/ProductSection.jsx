import {
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Badge,
    Box,
    Container
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";

const ProductSection = ({
    products,
    getImageUrl,
    getCartQuantity,
    handleProductClick,
    handleAddToCart,
}) => {
    return (
        <Box 
            sx={{ 
                minHeight: "100vh", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                py: 8,
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={2} justifyContent="center">
                    {products.map((product) => {
                        const cartQty = getCartQuantity(product.productId);

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
                                    sx={{
                                        width: '100%',
                                        borderRadius: 4,
                                        cursor: "pointer",
                                        position: "relative",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                        "&:hover": {
                                            transform: "translateY(-10px)",
                                            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                                        },
                                    }}
                                    onClick={() => handleProductClick(product.productId)}
                                >
                                    {cartQty > 0 && (
                                        <Chip
                                            label={cartQty}
                                            size="small"
                                            sx={{
                                                position: "absolute",
                                                right: 6,
                                                backgroundColor: "#000",
                                                color: "#fff",
                                                zIndex: 2,
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    )}

                                    <CardMedia
                                        component="img"
                                        sx={{ 
                                            height: 260, // Fixed height for image area
                                            objectFit: "cover" 
                                        }}
                                        image={getImageUrl(product.imageUrl)}
                                        alt={product.productName}
                                    />

                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                        {/* Product Name */}
                                        <Typography 
                                            variant="subtitle1" 
                                            fontWeight="700" 
                                            noWrap 
                                            sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}
                                        >
                                            {product.productName}
                                        </Typography>

                                        {/* Product Description (Truncated to 2 lines) */}
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                height: '40px', // Fixed height for description block
                                                lineHeight: '20px'
                                            }}
                                        >
                                            {product.productDescription || "No description available for this premium item."}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography
                                                color="#000"
                                                fontWeight="800"
                                                variant="h6"
                                            >
                                                ${product.price.toFixed(2)}
                                            </Typography>

                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product, e);
                                                }}
                                                disabled={product.stockQuantity <= 0}
                                                sx={{
                                                    backgroundColor: "#f5f5f5",
                                                    color: "#000",
                                                    "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                }}
                                            >
                                                <Badge badgeContent={cartQty} color="error">
                                                    <ShoppingCart fontSize="small" />
                                                </Badge>
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
        </Box>
    );
};

export default ProductSection;