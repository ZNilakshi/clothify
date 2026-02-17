import React from 'react';
import { Box, Typography, Stack } from "@mui/material";

const CategorySection = ({ categories, getImageUrl }) => {
    return (
        <Box 
            sx={{ 
                height: "100vh", // Fixed to window height
                display: "flex", 
                alignItems: "center", // Vertical center
                justifyContent: "center", 
            }}
        >
            <Stack 
                direction="row" 
                spacing={1} // The small gap between the two photos
                sx={{ 
                    width: "100%", 
                    height: "85vh", // Fixed photo height (adjust as needed)
                    maxWidth: "1800px" 
                }}
            >
                {categories.slice(0, 2).map((category) => (
                    <Box
                        key={category.categoryId}
                        sx={{
                            position: "relative",
                            flex: 1, // This divides the window into 2 equal parts
                            borderRadius: "30px", // The radius from your image
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover img": {
                                transform: "scale(1.03)",
                            },
                        }}
                    >
                        {/* Background Image - Set to fill the half-width exactly */}
                        <Box
                            component="img"
                            src={getImageUrl(category.imageUrl)}
                            alt={category.categoryName}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover", // Forces image to fill the fixed size
                                transition: "transform 0.7s ease",
                            }}
                        />

                        {/* Text Overlay */}
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(0, 0, 0, 0.1)", // Subtle tint
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    color: "#fff",
                                    fontWeight: 1000,
                                    letterSpacing: 1,
                                    textTransform: "uppercase",
                                    fontSize: { xs: "1.5rem", md: "3.5rem" },
                                    userSelect: "none"
                                }}
                            >
                                {category.categoryName}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default CategorySection;