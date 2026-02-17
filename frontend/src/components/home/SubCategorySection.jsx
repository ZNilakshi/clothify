import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Box, Container } from "@mui/material";

const SubCategorySection = ({ subCategories, getImageUrl }) => {
    return (
        <Container maxWidth="xl" sx={{ py: 1 }}>
    
            <Grid container spacing={1}     justifyContent="center"   // ✅ Center horizontally
            >
                {subCategories.map((sub) => (
                    <Grid 
                        item 
                        key={sub.subCategoryId}
                        // Forces exactly 4 items per line (100% / 4 = 25%)
                        sx={{ 
                            flexBasis: { xs: '100%', sm: '50%', md: '24%' }, 
                            maxWidth: { xs: '100%', sm: '50%', md: '24%' } 
                        }}
                    >
                      <Card
    sx={{
        width: '100%',
        height: 400,
        borderRadius: '40px',
        cursor: "pointer",
        overflow: 'hidden',
        position: 'relative',   
        transition: "all 0.5s ease",
        border: '1px solid #f0f0f0',
        "&:hover": {
            transform: "translateY(-10px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
        },
        "&:hover img": {
            transform: "scale(1.1)",
        }
    }}
>
    {/* Image */}
    <CardMedia
        component="img"
        image={getImageUrl(sub.imageUrl)}
        alt={sub.subCategoryName}
        sx={{ 
            height: "100%", 
            width: "100%", 
            objectFit: "cover",
            transition: "transform 0.8s ease"
        }}
    />

    {/* Dark Overlay */}
    <Box
        sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.35)", // semi dark overlay
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 2
        }}
    >
        <Typography
            variant="h5"
            fontWeight="900"
            sx={{
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: 4
            }}
        >
            {sub.subCategoryName}
        </Typography>
    </Box>
</Card>

                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default SubCategorySection;