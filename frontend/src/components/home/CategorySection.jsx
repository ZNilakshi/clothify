import React from 'react';
import { Box, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CategorySection = ({ categories, getImageUrl }) => {
    const navigate = useNavigate();

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`);
    };

    return (
        <Box 
            sx={{ 
                height: "100vh",
                display: "flex", 
                alignItems: "center",
                justifyContent: "center", 
            }}
        >
            <Stack 
                direction="row" 
                spacing={1}
                sx={{ 
                    width: "100%", 
                    height: "85vh",
                    maxWidth: "1800px" 
                }}
            >
                {categories.slice(0, 2).map((category) => (
                    <Box
                        key={category.categoryId}
                        onClick={() => handleCategoryClick(category.categoryId)}
                        sx={{
                            position: "relative",
                            flex: 1,
                            borderRadius: "30px",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                            },
                            "&:hover img": {
                                transform: "scale(1.05)",
                            },
                            "&:active": {
                                transform: "scale(0.98)",
                            },
                        }}
                    >
                        {/* Background Image */}
                        <Box
                            component="img"
                            src={getImageUrl(category.imageUrl)}
                            alt={category.categoryName}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
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
                                background: "rgba(0, 0, 0, 0.1)",
                                transition: "background 0.3s ease",
                                "&:hover": {
                                    background: "rgba(0, 0, 0, 0.2)",
                                },
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
                                    userSelect: "none",
                                    textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
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