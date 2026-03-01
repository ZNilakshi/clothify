import React from 'react';
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#cat-styles")) {
    const s = document.createElement("style");
    s.id = "cat-styles";
    s.textContent = `
        @keyframes catFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .cat-card { animation: catFadeUp 0.6s ease both; }
        .cat-card:hover .cat-img {
            transform: scale(1.06) !important;
            filter: grayscale(0%) brightness(0.5) !important;
        }
        .cat-card:hover .cat-label { letter-spacing: 0.32em !important; }
        .cat-card:hover .cat-line  { width: 56px !important; }
        .cat-card:hover .cat-arrow { opacity: 1 !important; transform: translateX(0) !important; }
        .cat-card:active { transform: scale(0.985) !important; }
    `;
    document.head.appendChild(s);
}

const CategorySection = ({ categories, getImageUrl }) => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            backgroundColor: "#000",
            px: { xs: 1.5, sm: 3, md: 4 },
            pb: { xs: 4, md: 6 },
        }}>
            {/* Grid: 1 col on xs, 2 cols on sm+ */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: { xs: 1.5, sm: 2, md: 3 },
                maxWidth: "1400px",
                mx: "auto",
            }}>
                {categories.slice(0, 2).map((category, index) => (
                    <Box
                        key={category.categoryId}
                        className="cat-card"
                        onClick={() => navigate(`/category/${category.categoryId}`)}
                        sx={{
                            animationDelay: `${index * 0.12}s`,
                            position: "relative",
                            /* Tall on mobile, fixed on desktop */
                            height: { xs: "60vw", sm: "55vw", md: "680px" },
                            maxHeight: { md: "720px" },
                            overflow: "hidden",
                            cursor: "pointer",
                            border: "1px solid rgba(255,255,255,0.07)",
                            transition: "border-color 0.4s ease, box-shadow 0.4s ease",
                            "&:hover": {
                                borderColor: "rgba(255,255,255,0.28)",
                                boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
                            },
                        }}
                    >
                        {/* Image */}
                        <Box
                            component="img"
                            className="cat-img"
                            src={getImageUrl(category.imageUrl)}
                            alt={category.categoryName}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                filter: "grayscale(100%) brightness(0.45)",
                                transition: "transform 0.7s ease, filter 0.5s ease",
                            }}
                        />

                        {/* Gradient */}
                        <Box sx={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
                        }} />


                        {/* Bottom text block */}
                        <Box sx={{
                            position: "absolute",
                            bottom: 0, left: 0, right: 0,
                            padding: { xs: "24px 24px", sm: "28px 32px", md: "36px 40px" },
                        }}>
                            {/* Animated line */}
                            <Box
                                className="cat-line"
                                sx={{
                                    width: "28px", height: "2px",
                                    backgroundColor: "#fff",
                                    mb: { xs: 1.5, md: 2 },
                                    transition: "width 0.4s ease",
                                }}
                            />

                            <Typography
                                className="cat-label"
                                sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 900,
                                    fontStyle: "italic",
                                    color: "#fff",
                                    fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
                                    lineHeight: 1.05,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    userSelect: "none",
                                    transition: "letter-spacing 0.4s ease",
                                    mb: 1.2,
                                }}
                            >
                                {category.categoryName}
                            </Typography>

                            {/* Explore row */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: { xs: "0.6rem", md: "0.68rem" },
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.4)",
                                    userSelect: "none",
                                }}>
                                    Explore
                                </Typography>
                                <Box
                                    className="cat-arrow"
                                    sx={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: "0.65rem",
                                        color: "rgba(255,255,255,0.4)",
                                        opacity: 0,
                                        transform: "translateX(-6px)",
                                        transition: "opacity 0.3s ease, transform 0.3s ease",
                                        userSelect: "none",
                                    }}
                                >
                                    →
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default CategorySection;