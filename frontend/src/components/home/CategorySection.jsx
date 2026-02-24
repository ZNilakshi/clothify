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
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000000",
                padding: "40px 20px",
            }}
        >
            {/* Header */}
            <Box sx={{ position: "absolute", top: 40, left: 60 }}>
                <Typography
                    sx={{
                        color: "#fff",
                        fontSize: "0.75rem",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        opacity: 0.4,
                    }}
                >
                    Browse Collection
                </Typography>
            </Box>

            <Stack
                direction="row"
                spacing={3}
                sx={{
                    width: "100%",
                    maxWidth: "1400px",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {categories.slice(0, 2).map((category, index) => (
                    <Box
                        key={category.categoryId}
                        onClick={() => handleCategoryClick(category.categoryId)}
                        sx={{
                            position: "relative",
                            width: "580px",
                            height: "720px",
                            flexShrink: 0,
                            borderRadius: "4px",
                            overflow: "hidden",
                            cursor: "pointer",
                            border: "1px solid rgba(255,255,255,0.08)",
                            transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                            "&:hover": {
                                border: "1px solid rgba(255,255,255,0.3)",
                                boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
                                transform: "translateY(-6px)",
                            },
                            "&:hover img": {
                                transform: "scale(1.06)",
                                filter: "grayscale(0%) brightness(0.55)",
                            },
                            "&:hover .category-label": {
                                letterSpacing: "0.35em",
                            },
                            "&:hover .category-line": {
                                width: "60px",
                            },
                            "&:active": {
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        {/* Background Image — fixed grayscale */}
                        <Box
                            component="img"
                            src={getImageUrl(category.imageUrl)}
                            alt={category.categoryName}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: "grayscale(100%) brightness(0.45)",
                                transition: "transform 0.7s ease, filter 0.5s ease",
                            }}
                        />

                        {/* Gradient Overlay */}
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                background:
                                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                            }}
                        />

                        {/* Top index number */}
                        <Typography
                            sx={{
                                position: "absolute",
                                top: 28,
                                right: 32,
                                color: "rgba(255,255,255,0.15)",
                                fontSize: "4rem",
                                fontWeight: 900,
                                lineHeight: 1,
                                userSelect: "none",
                                letterSpacing: "-2px",
                            }}
                        >
                            0{index + 1}
                        </Typography>

                        {/* Bottom Text Block */}
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: "36px 40px",
                            }}
                        >
                            {/* Animated line */}
                            <Box
                                className="category-line"
                                sx={{
                                    width: "32px",
                                    height: "2px",
                                    backgroundColor: "#ffffff",
                                    mb: 2,
                                    transition: "width 0.4s ease",
                                }}
                            />

                            <Typography
                                className="category-label"
                                variant="h3"
                                sx={{
                                    color: "#ffffff",
                                    fontWeight: 800,
                                    letterSpacing: "0.25em",
                                    textTransform: "uppercase",
                                    fontSize: "2rem",
                                    userSelect: "none",
                                    transition: "letter-spacing 0.4s ease",
                                    lineHeight: 1.1,
                                    mb: 1.5,
                                }}
                            >
                                {category.categoryName}
                            </Typography>

                            <Typography
                                sx={{
                                    color: "rgba(255,255,255,0.45)",
                                    fontSize: "0.7rem",
                                    letterSpacing: "0.25em",
                                    textTransform: "uppercase",
                                    userSelect: "none",
                                }}
                            >
                                Explore →
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default CategorySection;