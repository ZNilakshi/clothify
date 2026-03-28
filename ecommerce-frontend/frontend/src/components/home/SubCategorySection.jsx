import React from 'react';
import { Grid, Card, CardMedia, Typography, Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SubCategorySection = ({ subCategories, getImageUrl }) => {
    const navigate = useNavigate();

    const handleSubCategoryClick = (subCategoryId) => {
        navigate(`/subcategory/${subCategoryId}`);
    };

    return (
        <Box sx={{ backgroundColor: "#000000", minHeight: "100vh", py: 8 }}>
            {/* Section Header */}
            <Box sx={{ textAlign: "center", mb: 7 }}>
                <Typography
                    sx={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "0.7rem",
                        letterSpacing: "0.45em",
                        textTransform: "uppercase",
                        mb: 1.5,
                    }}
                >
                    Browse All
                </Typography>
                <Box
                    sx={{
                        width: "40px",
                        height: "1px",
                        backgroundColor: "rgba(255,255,255,0.25)",
                        margin: "0 auto",
                    }}
                />
            </Box>

            <Container maxWidth="xl">
                <Grid container spacing={2} justifyContent="center">
                    {subCategories.map((sub, index) => (
                        <Grid
                            item
                            key={sub.subCategoryId}
                            sx={{
                                flexBasis: { xs: '100%', sm: '50%', md: '25%' },
                                maxWidth: { xs: '100%', sm: '50%', md: '25%' },
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Card
                                onClick={() => handleSubCategoryClick(sub.subCategoryId)}
                                sx={{
                                    width: "320px",
                                    height: "420px",
                                    flexShrink: 0,
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    position: "relative",
                                    backgroundColor: "#000",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        border: "1px solid rgba(255,255,255,0.28)",
                                        boxShadow: "0 30px 70px rgba(0,0,0,0.9)",
                                    },
                                    "&:hover img": {
                                        transform: "scale(1.07)",
                                        filter: "grayscale(0%) brightness(0.45)",
                                    },
                                    "&:hover .sub-line": {
                                        width: "50px",
                                    },
                                    "&:hover .sub-label": {
                                        letterSpacing: "0.3em",
                                    },
                                    "&:active": {
                                        transform: "translateY(-3px)",
                                    },
                                }}
                            >
                                {/* Index Number */}
                                <Typography
                                    sx={{
                                        position: "absolute",
                                        top: 20,
                                        right: 24,
                                        color: "rgba(255,255,255,0.1)",
                                        fontSize: "3rem",
                                        fontWeight: 900,
                                        lineHeight: 1,
                                        userSelect: "none",
                                        letterSpacing: "-2px",
                                        zIndex: 2,
                                    }}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </Typography>

                                {/* Grayscale Image */}
                                <CardMedia
                                    component="img"
                                    image={getImageUrl(sub.imageUrl)}
                                    alt={sub.subCategoryName}
                                    sx={{
                                        height: "100%",
                                        width: "100%",
                                        objectFit: "cover",
                                        transition: "transform 0.7s ease, filter 0.5s ease",
                                    }}
                                />

                                {/* Gradient Overlay */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)",
                                    }}
                                />

                                {/* Bottom Text Block */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: "28px 28px",
                                    }}
                                >
                                    {/* Animated Line */}
                                    <Box
                                        className="sub-line"
                                        sx={{
                                            width: "24px",
                                            height: "1.5px",
                                            backgroundColor: "#ffffff",
                                            mb: 1.5,
                                            transition: "width 0.4s ease",
                                        }}
                                    />

                                    <Typography
                                        className="sub-label"
                                        variant="h6"
                                        sx={{
                                            color: "#ffffff",
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.2em",
                                            fontSize: "1rem",
                                            userSelect: "none",
                                            lineHeight: 1.2,
                                            mb: 1,
                                            transition: "letter-spacing 0.4s ease",
                                        }}
                                    >
                                        {sub.subCategoryName}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "rgba(255,255,255,0.35)",
                                            fontSize: "0.65rem",
                                            letterSpacing: "0.22em",
                                            textTransform: "uppercase",
                                            userSelect: "none",
                                        }}
                                    >
                                        Explore →
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default SubCategorySection;