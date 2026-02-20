import {
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
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
                        const cartQty       = getCartQuantity(product.productId);
                        const hasDiscount   = product.discount && parseFloat(product.discount) > 0;
                        const originalPrice = parseFloat(product.sellingPrice || product.price || 0);
                        const finalPrice    = hasDiscount && product.discountPrice
                            ? parseFloat(product.discountPrice)
                            : originalPrice;
                        
                        // Check stock status
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
                                    onClick={() => handleProductClick(product.productId)}
                                >
                                    {/* ── TOP BADGES ── */}
                                    <Box sx={{ 
                                        position: 'absolute', 
                                        top: 8, 
                                        left: 8, 
                                        right: 8, 
                                        zIndex: 2, 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: 0.5
                                    }}>
                                        {/* Left side badges */}
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {/* Discount badge */}
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

                                            {/* Out of stock badge */}
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

                                            {/* Low stock warning */}
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

                                        {/* Right side - Cart qty badge */}
                                        {cartQty > 0 && (
                                            <Chip
                                                label={`${cartQty} in cart`}
                                                size="small"
                                                sx={{
                                                    marginLeft: 'auto',
                                                    backgroundColor: "#000",
                                                    color: "#fff",
                                                    fontWeight: 'bold',
                                                    fontSize: 10,
                                                    height: 22,
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <CardMedia
                                        component="img"
                                        sx={{ 
                                            height: 260,
                                            objectFit: "cover",
                                            filter: isOutOfStock ? 'grayscale(50%)' : 'none',
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

                                        {/* Product Description */}
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                height: '40px',
                                                lineHeight: '20px'
                                            }}
                                        >
                                            {product.productDescription || "No description available for this premium item."}
                                        </Typography>

                                        {/* ── PRICE + CART INDICATOR ── */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            
                                            {/* Price block */}
                                            <Box>
                                                {hasDiscount ? (
                                                    <>
                                                        {/* Original price (strikethrough) */}
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

                                                        {/* Discounted price (big) */}
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="800"
                                                            color="#000"
                                                            lineHeight={1.2}
                                                        >
                                                            ${finalPrice.toFixed(2)}
                                                        </Typography>

                                                        {/* Save amount */}
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
                                                    // No discount - regular price
                                                    <Typography
                                                        color="#000"
                                                        fontWeight="800"
                                                        variant="h6"
                                                    >
                                                        ${originalPrice.toFixed(2)}
                                                    </Typography>
                                                )}

                                                {/* Stock status message */}
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

                                            {/* Cart indicator (not a button, just visual) */}
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    backgroundColor: cartQty > 0 ? "#000" : "#f5f5f5",
                                                    color: cartQty > 0 ? "#fff" : "#000",
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.3s',
                                                }}
                                            >
                                                <Badge 
                                                    badgeContent={cartQty > 0 ? cartQty : null} 
                                                    color="error"
                                                    sx={{
                                                        '& .MuiBadge-badge': {
                                                            fontSize: 10,
                                                            height: 18,
                                                            minWidth: 18,
                                                        }
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
            </Container>
        </Box>
    );
};

export default ProductSection;