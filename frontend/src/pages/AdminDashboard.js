import {
    Box,
    Container,
    Tab,
    Tabs,
    Typography,
    Paper,
    Badge,
    alpha,
} from "@mui/material";
import {
    Inventory,
    Category,
    Subscriptions,
    ShoppingCart,
    Dashboard,
} from "@mui/icons-material";
import { useState } from "react";
import Navbar from "../components/Navbar";
import ProductList from "../components/admin/ProductList";
import CategoryManagement from "../components/admin/CategoryManagement";
import SubCategoryManagement from "../components/admin/SubCategoryManagement";
import PurchaseOrder from "../components/admin/PurchaseOrder";

const AdminDashboard = () => {
    const [currentTab, setCurrentTab] = useState(0);

    // Mock counts - replace with actual data from your API
    const counts = {
        products: 0,
        categories: 0,
        subCategories: 0,
        purchaseOrders: 0,
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ 
            minHeight: "100vh", 
            backgroundColor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
        }}>
            <Navbar />

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
                {/* Header with welcome message and stats */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        mb: 4, 
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #1e293b 0%, #2d3748 100%)",
                        color: "#fff",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Box sx={{ 
                            backgroundColor: alpha("#fff", 0.1),
                            borderRadius: 2,
                            p: 1,
                            display: "flex",
                        }}>
                            <Dashboard sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                Admin Dashboard
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.8 }}>
                                Welcome back! Manage your inventory and purchases
                            </Typography>
                        </Box>
                    </Box>

                    {/* Quick stats */}
                    <Box sx={{ 
                        display: "flex", 
                        gap: 3, 
                        mt: 3,
                        flexWrap: "wrap",
                    }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Inventory sx={{ fontSize: 20, opacity: 0.7 }} />
                            <Typography variant="body2">Total Products: {counts.products}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Category sx={{ fontSize: 20, opacity: 0.7 }} />
                            <Typography variant="body2">Categories: {counts.categories}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Subscriptions sx={{ fontSize: 20, opacity: 0.7 }} />
                            <Typography variant="body2">Sub Categories: {counts.subCategories}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <ShoppingCart sx={{ fontSize: 20, opacity: 0.7 }} />
                            <Typography variant="body2">Pending Orders: {counts.purchaseOrders}</Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Tabs navigation with icons */}
                <Box sx={{ borderBottom: "2px solid #e0e0e0", mb: 3 }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        sx={{
                            "& .MuiTab-root": { 
                                textTransform: "none",
                                fontSize: "1rem",
                                fontWeight: 500,
                                minWidth: 140,
                                py: 1.5,
                                transition: "all 0.2s",
                                "&:hover": {
                                    color: "#3a7d44",
                                    backgroundColor: alpha("#3a7d44", 0.04),
                                },
                            },
                            "& .Mui-selected": { 
                                color: "#3a7d44",
                                fontWeight: 600,
                            },
                            "& .MuiTabs-indicator": { 
                                backgroundColor: "#3a7d44",
                                height: 3,
                                borderRadius: "3px 3px 0 0",
                            },
                        }}
                    >
                        <Tab 
                            icon={<Inventory />} 
                            iconPosition="start"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    Products
                                    <Badge 
                                        badgeContent={counts.products} 
                                        color="success"
                                        sx={{ 
                                            "& .MuiBadge-badge": { 
                                                fontSize: "0.7rem",
                                                height: 18,
                                                minWidth: 18,
                                            }
                                        }}
                                    />
                                </Box>
                            } 
                        />
                        <Tab 
                            icon={<Category />} 
                            iconPosition="start"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    Categories
                                    <Badge 
                                        badgeContent={counts.categories} 
                                        color="info"
                                        sx={{ 
                                            "& .MuiBadge-badge": { 
                                                fontSize: "0.7rem",
                                                height: 18,
                                                minWidth: 18,
                                            }
                                        }}
                                    />
                                </Box>
                            } 
                        />
                        <Tab 
                            icon={<Subscriptions />} 
                            iconPosition="start"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    Sub Categories
                                    <Badge 
                                        badgeContent={counts.subCategories} 
                                        color="warning"
                                        sx={{ 
                                            "& .MuiBadge-badge": { 
                                                fontSize: "0.7rem",
                                                height: 18,
                                                minWidth: 18,
                                            }
                                        }}
                                    />
                                </Box>
                            } 
                        />
                        <Tab 
                            icon={<ShoppingCart />} 
                            iconPosition="start"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    Purchase Orders
                                    <Badge 
                                        badgeContent={counts.purchaseOrders} 
                                        color="error"
                                        sx={{ 
                                            "& .MuiBadge-badge": { 
                                                fontSize: "0.7rem",
                                                height: 18,
                                                minWidth: 18,
                                            }
                                        }}
                                    />
                                </Box>
                            } 
                        />
                    </Tabs>
                </Box>

                {/* Tab panels with animations */}
                <Box 
                    sx={{ 
                        mt: 3,
                        transition: "all 0.3s ease",
                    }}
                >
                    {currentTab === 0 && (
                        <Box
                            sx={{
                                animation: "fadeIn 0.3s ease",
                                "@keyframes fadeIn": {
                                    "0%": { opacity: 0, transform: "translateY(10px)" },
                                    "100%": { opacity: 1, transform: "translateY(0)" },
                                },
                            }}
                        >
                            <ProductList />
                        </Box>
                    )}
                    
                    {currentTab === 1 && (
                        <Box
                            sx={{
                                animation: "fadeIn 0.3s ease",
                                "@keyframes fadeIn": {
                                    "0%": { opacity: 0, transform: "translateY(10px)" },
                                    "100%": { opacity: 1, transform: "translateY(0)" },
                                },
                            }}
                        >
                            <CategoryManagement />
                        </Box>
                    )}
                    
                    {currentTab === 2 && (
                        <Box
                            sx={{
                                animation: "fadeIn 0.3s ease",
                                "@keyframes fadeIn": {
                                    "0%": { opacity: 0, transform: "translateY(10px)" },
                                    "100%": { opacity: 1, transform: "translateY(0)" },
                                },
                            }}
                        >
                            <SubCategoryManagement />
                        </Box>
                    )}
                    
                    {currentTab === 3 && (
                        <Box
                            sx={{
                                animation: "fadeIn 0.3s ease",
                                "@keyframes fadeIn": {
                                    "0%": { opacity: 0, transform: "translateY(10px)" },
                                    "100%": { opacity: 1, transform: "translateY(0)" },
                                },
                            }}
                        >
                            <PurchaseOrder />
                        </Box>
                    )}
                </Box>
            </Container>

            {/* Footer */}
            <Box 
                component="footer" 
                sx={{ 
                    py: 2.5, 
                    px: 3,
                    backgroundColor: "#fff",
                    borderTop: "1px solid #e0e0e0",
                    mt: "auto",
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                    }}>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                            © {new Date().getFullYear()} Your Company Name. All rights reserved.
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                            Version 1.0.0
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default AdminDashboard;