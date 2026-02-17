import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Alert,
    Avatar,
    CircularProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    InputAdornment,
    Tooltip,
    Switch,
    FormControlLabel,
    Grid,
    alpha,
} from "@mui/material";
import {
    Delete,
    Edit,
    Add,
    Search,
    Close,
    CloudUpload,
    Inventory,
    Image as ImageIcon,
    TrendingUp,
    TrendingDown,
    LocalOffer,
    Category,
    Straighten,
} from "@mui/icons-material";
import { useState, useEffect, useCallback, useMemo } from "react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import subCategoryService from "../../services/subCategoryService";
import api from "../../services/api";

const AVAILABLE_COLORS = [
    { label: "Black", value: "BLACK", hex: "#000000" },
    { label: "White", value: "WHITE", hex: "#FFFFFF" },
    { label: "Red", value: "RED", hex: "#EF4444" },
    { label: "Blue", value: "BLUE", hex: "#3B82F6" },
    { label: "Green", value: "GREEN", hex: "#22C55E" },
    { label: "Yellow", value: "YELLOW", hex: "#EAB308" },
    { label: "Purple", value: "PURPLE", hex: "#A855F7" },
    { label: "Pink", value: "PINK", hex: "#EC4899" },
    { label: "Orange", value: "ORANGE", hex: "#F97316" },
    { label: "Gray", value: "GRAY", hex: "#6B7280" },
    { label: "Brown", value: "BROWN", hex: "#92400E" },
    { label: "Navy", value: "NAVY", hex: "#1E3A5F" },
];

const AVAILABLE_SIZES = [
    "XS", "S", "M", "L", "XL", "XXL", "XXXL",
    "28", "30", "32", "34", "36", "38", "40",
    "6", "7", "8", "9", "10", "11", "12", "ONE SIZE",
];

const UNITS = ["UNIT", "KG", "GRAM", "LITER", "METER", "PIECE", "BOX", "PACK"];

const emptyForm = {
    productName: "",
    productDescription: "",
    unitPrice: "",
    sellingPrice: "",
    discount: "",
    discountPrice: "",
    categoryId: "",
    subCategoryId: "",
    initialStock: "",
    reorderLevel: "",
    unitOfMeasure: "UNIT",
    sku: "",
    imageUrl: "",
    isActive: true,
};

// Memoized section title component
const SectionTitle = ({ children, icon: Icon }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 2, 
        mt: 3,
        '&:first-of-type': { mt: 0 }
    }}>
        {Icon && <Icon sx={{ color: '#3a7d44', fontSize: 20 }} />}
        <Typography 
            variant="subtitle2" 
            fontWeight="600"
            sx={{ 
                color: '#1e293b',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
            }}
        >
            {children}
        </Typography>
        <Box sx={{ 
            flex: 1, 
            height: '2px', 
            background: 'linear-gradient(90deg, #3a7d44 0%, #e0e0e0 100%)',
            ml: 1
        }} />
    </Box>
);

// Memoized color selector component
const ColorSelector = ({ selectedColors, onToggleColor }) => {
    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {AVAILABLE_COLORS.map((c) => {
                const isSelected = selectedColors.includes(c.value);
                return (
                    <Tooltip key={c.value} title={c.label} arrow>
                        <Box
                            onClick={() => onToggleColor(c.value)}
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "12px",
                                backgroundColor: c.hex,
                                border: isSelected ? "3px solid #3a7d44" : "2px solid #e0e0e0",
                                cursor: "pointer",
                                boxShadow: isSelected ? `0 0 0 2px ${alpha('#3a7d44', 0.3)}` : "none",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                    transform: "scale(1.1)",
                                    boxShadow: `0 4px 8px ${alpha(c.hex, 0.3)}`,
                                },
                            }}
                        />
                    </Tooltip>
                );
            })}
        </Box>
    );
};

// Memoized size selector component
const SizeSelector = ({ selectedSizes, onToggleSize }) => {
    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {AVAILABLE_SIZES.map((s) => {
                const isSelected = selectedSizes.includes(s);
                return (
                    <Box
                        key={s}
                        onClick={() => onToggleSize(s)}
                        sx={{
                            px: 2,
                            py: 0.75,
                            borderRadius: "10px",
                            border: isSelected ? "2px solid #3a7d44" : "1px solid #e0e0e0",
                            backgroundColor: isSelected ? alpha('#3a7d44', 0.1) : "#fff",
                            color: isSelected ? "#3a7d44" : "#64748b",
                            cursor: "pointer",
                            fontSize: "0.8125rem",
                            fontWeight: isSelected ? "600" : "500",
                            transition: "all 0.2s",
                            "&:hover": {
                                borderColor: "#3a7d44",
                                backgroundColor: isSelected ? alpha('#3a7d44', 0.15) : alpha('#3a7d44', 0.05),
                            },
                        }}
                    >
                        {s}
                    </Box>
                );
            })}
        </Box>
    );
};

// Optimized variant grid component
const VariantGrid = ({ 
    selectedColors, 
    selectedSizes, 
    variantGrid, 
    onUpdateVariant 
}) => {
    const gridTotalStock = useMemo(() => 
        Object.values(variantGrid).reduce((s, c) => s + (parseInt(c.qty) || 0), 0),
        [variantGrid]
    );

    return (
        <>
            <Typography 
                variant="caption" 
                sx={{ 
                    mb: 1.5, 
                    display: "block",
                    color: "#64748b",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                }}
            >
                STEP 3 — ENTER QUANTITIES
            </Typography>
            <Paper 
                variant="outlined" 
                sx={{ 
                    borderRadius: 3, 
                    overflow: "auto", 
                    mb: 2,
                    borderColor: "#e0e0e0",
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                            <TableCell sx={{ 
                                fontWeight: 600, 
                                whiteSpace: "nowrap", 
                                minWidth: 120,
                                color: "#1e293b",
                                borderBottom: "2px solid #e0e0e0",
                            }}>
                                Color \ Size
                            </TableCell>
                            {selectedSizes.map((s) => (
                                <TableCell 
                                    key={s} 
                                    align="center"
                                    sx={{ 
                                        fontWeight: 600, 
                                        minWidth: 80, 
                                        whiteSpace: "nowrap",
                                        color: "#1e293b",
                                        borderBottom: "2px solid #e0e0e0",
                                    }}
                                >
                                    {s}
                                </TableCell>
                            ))}
                            <TableCell 
                                align="center"
                                sx={{ 
                                    fontWeight: 600, 
                                    color: "#3a7d44",
                                    whiteSpace: "nowrap",
                                    borderBottom: "2px solid #e0e0e0",
                                }}
                            >
                                Total
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedColors.map((colorVal) => {
                            const colorDef = AVAILABLE_COLORS.find((c) => c.value === colorVal);
                            const rowTotal = selectedSizes.reduce((sum, sizeVal) => {
                                const key = `${colorVal}_${sizeVal}`;
                                return sum + (parseInt(variantGrid[key]?.qty) || 0);
                            }, 0);
                            
                            return (
                                <TableRow 
                                    key={colorVal}
                                    sx={{ 
                                        "&:hover": { backgroundColor: "#f8fafc" },
                                        "&:last-child td": { borderBottom: "2px solid #e0e0e0" }
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Box sx={{ 
                                                width: 24, 
                                                height: 24, 
                                                borderRadius: "8px",
                                                backgroundColor: colorDef?.hex,
                                                border: "2px solid #fff",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            }} />
                                            <Typography variant="body2" fontWeight="500">
                                                {colorDef?.label}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    {selectedSizes.map((sizeVal) => {
                                        const key = `${colorVal}_${sizeVal}`;
                                        const qty = variantGrid[key]?.qty || "";
                                        return (
                                            <TableCell key={sizeVal} align="center" sx={{ p: 0.5 }}>
                                                <TextField
                                                    placeholder="0"
                                                    type="number"
                                                    value={qty}
                                                    onChange={(e) => onUpdateVariant(colorVal, sizeVal, e.target.value)}
                                                    size="small"
                                                    inputProps={{ 
                                                        min: "0", 
                                                        style: { 
                                                            textAlign: "center", 
                                                            padding: "8px 4px",
                                                            fontSize: "0.875rem",
                                                        } 
                                                    }}
                                                    sx={{
                                                        width: 70,
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: 2,
                                                            backgroundColor: qty && parseInt(qty) > 0 
                                                                ? alpha('#3a7d44', 0.05)
                                                                : "#fff",
                                                            "&:hover": {
                                                                backgroundColor: "#fff",
                                                            },
                                                        },
                                                    }}
                                                />
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell align="center">
                                        <Typography 
                                            variant="body2" 
                                            fontWeight="600"
                                            sx={{ color: rowTotal > 0 ? "#3a7d44" : "#94a3b8" }}
                                        >
                                            {rowTotal || "—"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow sx={{ backgroundColor: alpha('#3a7d44', 0.08) }}>
                            <TableCell>
                                <Typography variant="body2" fontWeight="600" color="#3a7d44">
                                    Total Stock
                                </Typography>
                            </TableCell>
                            {selectedSizes.map((sizeVal) => {
                                const colTotal = selectedColors.reduce((sum, colorVal) => {
                                    const key = `${colorVal}_${sizeVal}`;
                                    return sum + (parseInt(variantGrid[key]?.qty) || 0);
                                }, 0);
                                return (
                                    <TableCell key={sizeVal} align="center">
                                        <Typography 
                                            variant="body2" 
                                            fontWeight="600"
                                            sx={{ color: colTotal > 0 ? "#3a7d44" : "#94a3b8" }}
                                        >
                                            {colTotal || "—"}
                                        </Typography>
                                    </TableCell>
                                );
                            })}
                            <TableCell align="center">
                                <Chip 
                                    label={`${gridTotalStock} units`}
                                    size="small"
                                    sx={{ 
                                        backgroundColor: "#3a7d44",
                                        color: "#fff",
                                        fontWeight: 600,
                                        fontSize: "0.75rem",
                                        height: 24,
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
        </>
    );
};

// Move ProductForm OUTSIDE ProductList
const ProductForm = ({ 
    formData, 
    formError,
    imagePreviews,
    selectedColors,
    selectedSizes,
    variantGrid,
    categories,
    subCategories,
    handleCategoryChange,
    isEdit = false,
    margin,
    marginColor,
    handleFormChange,
    handleToggleColor,
    handleToggleSize,
    handleUpdateVariant,
    handleImagesChange,
    handleRemoveImage,
    setFormError
}) => {
    return (
        <Box>
            {formError && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': { alignItems: 'center' }
                    }}
                >
                    {formError}
                </Alert>
            )}

            {/* Images Section */}
            <SectionTitle icon={ImageIcon}>Product Images</SectionTitle>
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{
                        py: 1.5,
                        px: 3,
                        borderStyle: "dashed",
                        borderWidth: 2,
                        borderRadius: 3,
                        mb: 1.5,
                        borderColor: "#e0e0e0",
                        color: "#64748b",
                        '&:hover': {
                            borderColor: "#3a7d44",
                            backgroundColor: alpha('#3a7d44', 0.05),
                        }
                    }}
                >
                    Select Images ({imagePreviews.length}/6)
                    <input type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
                </Button>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 2 }}>
                    First image is primary · Max 5MB each · JPG, PNG, GIF
                </Typography>

                {imagePreviews.length > 0 && (
                    <Grid container spacing={1.5}>
                        {imagePreviews.map((src, idx) => (
                            <Grid item key={idx}>
                                <Box sx={{ position: "relative" }}>
                                    <Box
                                        component="img"
                                        src={src}
                                        sx={{
                                            width: 90,
                                            height: 90,
                                            borderRadius: 2.5,
                                            objectFit: "cover",
                                            border: idx === 0 ? "3px solid #3a7d44" : "2px solid #e0e0e0",
                                            boxShadow: idx === 0 ? `0 4px 12px ${alpha('#3a7d44', 0.3)}` : 'none',
                                        }}
                                    />
                                    {idx === 0 && (
                                        <Chip
                                            label="Main"
                                            size="small"
                                            sx={{
                                                position: "absolute",
                                                top: -8,
                                                left: -4,
                                                backgroundColor: "#3a7d44",
                                                color: "#fff",
                                                fontSize: 9,
                                                height: 18,
                                                fontWeight: 600,
                                            }}
                                        />
                                    )}
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveImage(idx)}
                                        sx={{
                                            position: "absolute",
                                            top: -8,
                                            right: -8,
                                            backgroundColor: "#ef4444",
                                            color: "#fff",
                                            width: 24,
                                            height: 24,
                                            '&:hover': {
                                                backgroundColor: "#dc2626",
                                                transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <Close sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                        {imagePreviews.length < 6 && (
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{
                                        width: 90,
                                        height: 90,
                                        borderStyle: "dashed",
                                        borderRadius: 2.5,
                                        flexDirection: "column",
                                        gap: 0.5,
                                        minWidth: "unset",
                                        borderColor: "#e0e0e0",
                                        '&:hover': {
                                            borderColor: "#3a7d44",
                                            backgroundColor: alpha('#3a7d44', 0.05),
                                        }
                                    }}
                                >
                                    <ImageIcon sx={{ fontSize: 24, color: "#94a3b8" }} />
                                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: 10 }}>
                                        Add
                                    </Typography>
                                    <input type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>

            {/* Basic Info Section */}
            <SectionTitle icon={Category}>Basic Information</SectionTitle>
            <Grid container spacing={2.5} sx={{ mb: 1 }}>
                <Grid item xs={8}>
                    <TextField
                        label="Product Name"
                        value={formData.productName}
                        onChange={(e) => {
                            handleFormChange('productName', e.target.value);
                            setFormError("");
                        }}
                        fullWidth
                        required
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="SKU"
                        value={formData.sku}
                        onChange={(e) => handleFormChange('sku', e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="e.g. PROD-001"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Description"
                        value={formData.productDescription}
                        onChange={(e) => handleFormChange('productDescription', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Category"
                        value={formData.categoryId}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        select
                        fullWidth
                        required
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    >
                        {categories.map((c) => (
                            <MenuItem key={c.categoryId} value={c.categoryId}>
                                {c.categoryName}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Sub Category"
                        value={formData.subCategoryId}
                        onChange={(e) => handleFormChange('subCategoryId', e.target.value)}
                        select
                        fullWidth
                        size="small"
                        disabled={!formData.categoryId || subCategories.length === 0}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    >
                        <MenuItem value="">None</MenuItem>
                        {subCategories.map((sc) => (
                            <MenuItem key={sc.subCategoryId} value={sc.subCategoryId}>
                                {sc.subCategoryName}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Unit of Measure"
                        value={formData.unitOfMeasure}
                        onChange={(e) => handleFormChange('unitOfMeasure', e.target.value)}
                        select
                        fullWidth
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    >
                        {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Reorder Level"
                        type="number"
                        value={formData.reorderLevel}
                        onChange={(e) => handleFormChange('reorderLevel', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ min: "0" }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    />
                </Grid>
            </Grid>

            {/* Pricing Section */}
            <SectionTitle icon={LocalOffer}>Pricing</SectionTitle>
            <Grid container spacing={2.5} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Unit Price (Cost)"
                        type="number"
                        value={formData.unitPrice}
                        onChange={(e) => handleFormChange('unitPrice', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: "0.01", min: "0" }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        helperText="Purchase / cost price"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Selling Price"
                        type="number"
                        value={formData.sellingPrice}
                        onChange={(e) => handleFormChange('sellingPrice', e.target.value)}
                        fullWidth
                        required
                        size="small"
                        inputProps={{ step: "0.01", min: "0" }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        helperText="Customer pays"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Box sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        px: 2,
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: margin === null ? "#f8fafc"
                            : parseFloat(margin) < 0 ? "#fef2f2"
                                : parseFloat(margin) < 20 ? "#fff7ed" : "#f0fdf4",
                    }}>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>Margin</Typography>
                        <Typography variant="subtitle1" fontWeight="600" sx={{ color: marginColor }}>
                            {margin === null ? "—" : `${margin}%`}
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: marginColor, px: 0.5, mt: 0.5, display: 'block' }}>
                        {margin === null ? "Enter both prices"
                            : parseFloat(margin) < 0 ? <><TrendingDown sx={{ fontSize: 12, mr: 0.5 }} /> Selling below cost!</>
                                : parseFloat(margin) < 20 ? <><TrendingUp sx={{ fontSize: 12, mr: 0.5 }} /> Low margin</>
                                    : "✓ Healthy margin"}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Discount (%)"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => handleFormChange('discount', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: "0.01", min: "0", max: "100" }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        helperText="Optional — leave empty for no discount"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#3a7d44' },
                            }
                        }}
                    />
                </Grid>
                {formData.discount && parseFloat(formData.discount) > 0 && (
                    <>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{
                                border: "1px solid #ffe082",
                                borderRadius: 2,
                                px: 2,
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: "#fffbeb",
                            }}>
                                <Typography variant="body2" sx={{ color: "#92400e" }}>
                                    After discount
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="600" sx={{ color: "#d97706" }}>
                                    {formData.discountPrice ? `$${formData.discountPrice}` : "—"}
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#d97706", px: 0.5, mt: 0.5, display: 'block' }}>
                                {formData.discountPrice && formData.sellingPrice
                                    ? `Save $${(parseFloat(formData.sellingPrice) - parseFloat(formData.discountPrice)).toFixed(2)}`
                                    : "Enter selling price first"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: 2,
                                px: 2,
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: "#f8fafc",
                            }}>
                                <Typography variant="body2" sx={{ color: "#64748b" }}>Badge</Typography>
                                <Chip
                                    label={`${formData.discount}% OFF`}
                                    size="small"
                                    sx={{
                                        backgroundColor: "#ef4444",
                                        color: "#fff",
                                        fontWeight: "600",
                                        fontSize: "0.75rem",
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ color: "#64748b", px: 0.5, mt: 0.5, display: 'block' }}>
                                Shown on product card
                            </Typography>
                        </Grid>
                    </>
                )}
            </Grid>

            {/* Variants Section */}
            <SectionTitle icon={Straighten}>Product Variants</SectionTitle>
            
            <Typography 
                variant="caption" 
                sx={{ 
                    mb: 1.5, 
                    display: "block",
                    color: "#64748b",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                }}
            >
                STEP 1 — SELECT COLORS
            </Typography>
            <ColorSelector 
                selectedColors={selectedColors} 
                onToggleColor={handleToggleColor} 
            />

            <Typography 
                variant="caption" 
                sx={{ 
                    mb: 1.5, 
                    display: "block",
                    color: "#64748b",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                }}
            >
                STEP 2 — SELECT SIZES
            </Typography>
            <SizeSelector 
                selectedSizes={selectedSizes} 
                onToggleSize={handleToggleSize} 
            />

            {selectedColors.length > 0 && selectedSizes.length > 0 ? (
                <VariantGrid 
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    variantGrid={variantGrid}
                    onUpdateVariant={handleUpdateVariant}
                />
            ) : (
                <Box sx={{
                    p: 3,
                    backgroundColor: "#f8fafc",
                    borderRadius: 3,
                    border: "2px dashed #e0e0e0",
                    textAlign: "center",
                    mb: 2,
                }}>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        {selectedColors.length === 0 && selectedSizes.length === 0
                            ? "Select colors and sizes above to build the variant table"
                            : selectedColors.length === 0 ? "✨ Now select at least one color"
                                : "✨ Now select at least one size"}
                    </Typography>
                </Box>
            )}

            {selectedColors.length === 0 && !isEdit && (
                <TextField
                    label="Initial Stock"
                    type="number"
                    value={formData.initialStock}
                    onChange={(e) => handleFormChange('initialStock', e.target.value)}
                    size="small"
                    inputProps={{ min: "0" }}
                    sx={{
                        width: 200,
                        mt: 1,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#3a7d44' },
                        }
                    }}
                    helperText="Skip if using variants above"
                />
            )}

            {isEdit && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: "#f8fafc", borderRadius: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isActive}
                                onChange={(e) => handleFormChange('isActive', e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#3a7d44',
                                        '&:hover': { backgroundColor: alpha('#3a7d44', 0.1) },
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#3a7d44',
                                    },
                                }}
                            />
                        }
                        label={
                            <Typography variant="body2" fontWeight="600">
                                {formData.isActive ? "✓ Product is Active" : "✗ Product is Inactive"}
                            </Typography>
                        }
                    />
                </Box>
            )}
        </Box>
    );
};

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [variantGrid, setVariantGrid] = useState({});

    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");

    // Memoized calculations
    const margin = useMemo(() => {
        const unit = parseFloat(formData.unitPrice);
        const selling = parseFloat(formData.sellingPrice);
        if (!unit || !selling || unit <= 0) return null;
        return (((selling - unit) / selling) * 100).toFixed(1);
    }, [formData.unitPrice, formData.sellingPrice]);

    const marginColor = useMemo(() => {
        if (margin === null) return "text.secondary";
        const m = parseFloat(margin);
        return m < 0 ? "error.main" : m < 20 ? "warning.main" : "success.main";
    }, [margin]);

    const gridTotalStock = useMemo(() => 
        Object.values(variantGrid).reduce((s, c) => s + (parseInt(c.qty) || 0), 0),
        [variantGrid]
    );

    const calcDiscountPrice = useCallback((sellingPrice, discount) => {
        const s = parseFloat(sellingPrice);
        const d = parseFloat(discount);
        if (!s || !d || d <= 0) return "";
        return (s - (s * d / 100)).toFixed(2);
    }, []);

    // Optimized form update handlers
    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => {
            if (field === 'sellingPrice' || field === 'discount') {
                const sellingPrice = field === 'sellingPrice' ? value : prev.sellingPrice;
                const discount = field === 'discount' ? value : prev.discount;
                const discountPrice = calcDiscountPrice(sellingPrice, discount);
                return { ...prev, [field]: value, discountPrice };
            }
            return { ...prev, [field]: value };
        });
    }, [calcDiscountPrice]);

    const handleToggleColor = useCallback((colorVal) => {
        setSelectedColors(prev => 
            prev.includes(colorVal) ? prev.filter(c => c !== colorVal) : [...prev, colorVal]
        );
    }, []);

    const handleToggleSize = useCallback((sizeVal) => {
        setSelectedSizes(prev => 
            prev.includes(sizeVal) ? prev.filter(s => s !== sizeVal) : [...prev, sizeVal]
        );
    }, []);

    const handleUpdateVariant = useCallback((colorVal, sizeVal, value) => {
        setVariantGrid(prev => ({
            ...prev,
            [`${colorVal}_${sizeVal}`]: { qty: value },
        }));
    }, []);

    // Rest of your existing functions remain the same...
    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    useEffect(() => {
        const filtered = products.filter(
            (p) =>
                p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch { showAlert("Failed to load products", "error"); }
        finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try { setCategories(await categoryService.getAllCategories()); }
        catch { console.error("Failed to load categories"); }
    };

    const fetchSubCategories = async (categoryId) => {
        if (!categoryId) { setSubCategories([]); return; }
        try { setSubCategories(await subCategoryService.getSubCategoriesByCategory(categoryId)); }
        catch { setSubCategories([]); }
    };

    const showAlert = (message, severity = "success") => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: "", severity: "success" }), 4000);
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `http://localhost:8080${url}`;
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setFormError("");
        setImageFiles([]);
        setImagePreviews([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setVariantGrid({});
        setSubCategories([]);
    };

    const handleCategoryChange = (categoryId) => {
        setFormData((p) => ({ ...p, categoryId, subCategoryId: "" }));
        fetchSubCategories(categoryId);
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files).filter(
            (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024
        );
        if (imageFiles.length + files.length > 6) { setFormError("Max 6 images"); return; }
        setImageFiles((p) => [...p, ...files]);
        setImagePreviews((p) => [...p, ...files.map(URL.createObjectURL)]);
    };

    const handleRemoveImage = (idx) => {
        setImageFiles((p) => p.filter((_, i) => i !== idx));
        setImagePreviews((p) => p.filter((_, i) => i !== idx));
    };

    const uploadAllImages = async () => {
        const urls = [];
        for (const file of imageFiles) {
            const fd = new FormData();
            fd.append("file", file);
            const res = await api.post("/files/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            urls.push(res.data.fileUrl);
        }
        return urls;
    };

    const getVariantsFromGrid = () => {
        const result = [];
        selectedColors.forEach((colorVal) => {
            selectedSizes.forEach((sizeVal) => {
                const key = `${colorVal}_${sizeVal}`;
                const cell = variantGrid[key];
                if (cell?.qty && parseInt(cell.qty) > 0) {
                    result.push({ color: colorVal, size: sizeVal, quantity: parseInt(cell.qty) });
                }
            });
        });
        return result;
    };

    const populateGridFromVariants = (variants) => {
        const colors = [...new Set(variants.map((v) => v.color))];
        const sizes = [...new Set(variants.map((v) => v.size))];
        const grid = {};
        variants.forEach((v) => { grid[`${v.color}_${v.size}`] = { qty: String(v.quantity) }; });
        setSelectedColors(colors);
        setSelectedSizes(sizes);
        setVariantGrid(grid);
    };

    const handleOpenAddDialog = () => { resetForm(); setAddDialogOpen(true); };
    const handleCloseAddDialog = () => { setAddDialogOpen(false); resetForm(); };

    const handleAddProduct = async () => {
        if (!formData.productName.trim()) { setFormError("Product name is required"); return; }
        if (!formData.sellingPrice) { setFormError("Selling price is required"); return; }
        if (!formData.categoryId) { setFormError("Category is required"); return; }
        if (imageFiles.length === 0) { setFormError("At least one image is required"); return; }

        setFormLoading(true);
        try {
            setUploading(true);
            const imageUrls = await uploadAllImages();
            setUploading(false);

            const gridVariants = getVariantsFromGrid();

            await productService.createProduct({
                ...formData,
                price: parseFloat(formData.sellingPrice),
                unitPrice: parseFloat(formData.unitPrice) || null,
                sellingPrice: parseFloat(formData.sellingPrice),
                margin: margin ? parseFloat(margin) : null,
                discount: formData.discount ? parseFloat(formData.discount) : null,
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                categoryId: parseInt(formData.categoryId),
                subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
                initialStock: gridVariants.length > 0 ? gridTotalStock : parseInt(formData.initialStock) || 0,
                reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : null,
                imageUrl: imageUrls[0],
                imageUrls,
                variants: gridVariants,
            });
            showAlert("Product created successfully!");
            handleCloseAddDialog();
            fetchProducts();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to create product");
        } finally { setFormLoading(false); setUploading(false); }
    };

    const handleOpenEditDialog = async (product) => {
        setSelectedProduct(product);
        setFormData({
            productName: product.productName || "",
            productDescription: product.productDescription || "",
            unitPrice: product.unitPrice || "",
            sellingPrice: product.sellingPrice || product.price || "",
            discount: product.discount || "",
            discountPrice: product.discountPrice || "",
            categoryId: product.categoryId || "",
            subCategoryId: product.subCategoryId || "",
            initialStock: product.stockQuantity || "",
            reorderLevel: product.reorderLevel || "",
            unitOfMeasure: product.unitOfMeasure || "UNIT",
            sku: product.sku || "",
            imageUrl: product.imageUrl || "",
            isActive: product.isActive ?? true,
        });

        const existingUrls = product.imageUrls?.length > 0
            ? product.imageUrls
            : product.imageUrl ? [product.imageUrl] : [];
        setImageFiles([]);
        setImagePreviews(existingUrls.map(getImageUrl).filter(Boolean));

        if (product.variants?.length > 0) populateGridFromVariants(product.variants);
        else { setSelectedColors([]); setSelectedSizes([]); setVariantGrid({}); }

        setFormError("");
        if (product.categoryId) await fetchSubCategories(product.categoryId);
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => { setEditDialogOpen(false); setSelectedProduct(null); resetForm(); };

    const handleEditProduct = async () => {
        if (!formData.productName.trim()) { setFormError("Product name is required"); return; }
        if (!formData.sellingPrice) { setFormError("Selling price is required"); return; }

        setFormLoading(true);
        try {
            let imageUrls = imagePreviews
                .filter((p) => p.startsWith("http://localhost:8080") || p.startsWith("/uploads"))
                .map((p) => p.replace("http://localhost:8080", ""));

            if (imageFiles.length > 0) {
                setUploading(true);
                const newUrls = await uploadAllImages();
                setUploading(false);
                imageUrls = [...imageUrls, ...newUrls];
            }

            const gridVariants = getVariantsFromGrid();

            await productService.updateProduct(selectedProduct.productId, {
                productName: formData.productName,
                productDescription: formData.productDescription,
                price: parseFloat(formData.sellingPrice),
                unitPrice: parseFloat(formData.unitPrice) || null,
                sellingPrice: parseFloat(formData.sellingPrice),
                margin: margin ? parseFloat(margin) : null,
                discount: formData.discount ? parseFloat(formData.discount) : null,
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                categoryId: parseInt(formData.categoryId),
                subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
                reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : null,
                unitOfMeasure: formData.unitOfMeasure,
                sku: formData.sku || null,
                isActive: formData.isActive,
                imageUrl: imageUrls[0] || formData.imageUrl,
                imageUrls,
                variants: gridVariants,
            });
            showAlert("Product updated successfully!");
            handleCloseEditDialog();
            fetchProducts();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to update product");
        } finally { setFormLoading(false); setUploading(false); }
    };

    const handleOpenDeleteDialog = (p) => { setSelectedProduct(p); setDeleteDialogOpen(true); };
    const handleCloseDeleteDialog = () => { setDeleteDialogOpen(false); setSelectedProduct(null); };

    const handleDeleteProduct = async () => {
        setFormLoading(true);
        try {
            await productService.deleteProduct(selectedProduct.productId);
            showAlert("Product deleted successfully!");
            handleCloseDeleteDialog();
            fetchProducts();
        } catch (err) {
            showAlert(err.response?.data?.message || "Failed to delete product", "error");
            handleCloseDeleteDialog();
        } finally { setFormLoading(false); }
    };

    // Main render
    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {alert.show && (
                <Alert 
                    severity={alert.severity} 
                    sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        animation: 'slideDown 0.3s ease',
                        '@keyframes slideDown': {
                            from: { transform: 'translateY(-100%)', opacity: 0 },
                            to: { transform: 'translateY(0)', opacity: 1 },
                        }
                    }}
                >
                    {alert.message}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                flexWrap: "wrap",
                gap: 2,
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{
                        backgroundColor: alpha('#3a7d44', 0.1),
                        borderRadius: 3,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Inventory sx={{ color: "#3a7d44", fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight="700" sx={{ color: "#1e293b", letterSpacing: '-0.5px' }}>
                            Products
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                            Manage your product inventory
                        </Typography>
                    </Box>
                    <Chip
                        label={`${products.length} total`}
                        sx={{
                            backgroundColor: alpha('#3a7d44', 0.1),
                            color: "#3a7d44",
                            fontWeight: 600,
                            borderRadius: 2,
                            ml: 2,
                        }}
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenAddDialog}
                    sx={{
                        backgroundColor: "#3a7d44",
                        borderRadius: 3,
                        textTransform: "none",
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: `0 8px 16px ${alpha('#3a7d44', 0.3)}`,
                        '&:hover': {
                            backgroundColor: "#2d6336",
                            transform: 'translateY(-2px)',
                            boxShadow: `0 12px 20px ${alpha('#3a7d44', 0.4)}`,
                        },
                        transition: 'all 0.3s',
                    }}
                >
                    Add Product
                </Button>
            </Box>

            {/* Search */}
            <Paper
                elevation={0}
                sx={{
                    p: 0.5,
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    '&:hover': { borderColor: '#3a7d44' },
                }}
            >
                <TextField
                    placeholder="Search by name, category, SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: "#94a3b8" }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm("")}>
                                    <Close fontSize="small" sx={{ color: "#94a3b8" }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 3,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        }
                    }}
                />
            </Paper>

            {/* Table */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: '1px solid #e0e0e0',
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#1e293b" }}>
                                {["Image", "Name / SKU", "Category", "Unit Price", "Sell Price", "Discount", "Margin", "Stock", "Status", "Actions"]
                                    .map((h) => (
                                        <TableCell
                                            key={h}
                                            sx={{
                                                color: "#fff",
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                py: 2,
                                            }}
                                            align={h === "Actions" ? "center" : "left"}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                                        <CircularProgress sx={{ color: "#3a7d44" }} />
                                        <Typography sx={{ color: "#64748b", mt: 2 }}>
                                            Loading products...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                                        <Inventory sx={{ fontSize: 60, color: "#e0e0e0", mb: 2 }} />
                                        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                                            {searchTerm ? "No products found" : "No products yet"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#64748b", mt: 1 }}>
                                            {searchTerm ? "Try a different search term" : "Click 'Add Product' to create your first product"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.map((product) => {
                                const m = product.margin ?? (
                                    product.unitPrice && product.sellingPrice
                                        ? (((product.sellingPrice - product.unitPrice) / product.sellingPrice) * 100).toFixed(1)
                                        : null
                                );
                                return (
                                    <TableRow
                                        key={product.productId}
                                        sx={{
                                            '&:hover': { backgroundColor: "#f8fafc" },
                                            transition: 'background-color 0.2s',
                                        }}
                                    >
                                        <TableCell>
                                            <Avatar
                                                variant="rounded"
                                                src={getImageUrl(product.imageUrl)}
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 2.5,
                                                    backgroundColor: "#f1f5f9",
                                                    border: '2px solid #fff',
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                                                }}
                                            >
                                                <ImageIcon sx={{ color: "#94a3b8" }} />
                                            </Avatar>
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight="600" variant="body2" sx={{ color: "#1e293b" }}>
                                                {product.productName}
                                            </Typography>
                                            {product.sku && (
                                                <Chip
                                                    label={product.sku}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "#f1f5f9",
                                                        fontSize: "0.675rem",
                                                        height: 20,
                                                        mt: 0.5,
                                                        color: "#64748b",
                                                    }}
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={product.categoryName}
                                                size="small"
                                                sx={{
                                                    backgroundColor: alpha('#3a7d44', 0.1),
                                                    color: "#3a7d44",
                                                    fontWeight: 500,
                                                }}
                                            />
                                            {product.subCategoryName && (
                                                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                                                    {product.subCategoryName}
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                                                {product.unitPrice ? `$${parseFloat(product.unitPrice).toFixed(2)}` : "—"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography fontWeight="600" sx={{ color: "#3a7d44" }}>
                                                    ${(product.sellingPrice || product.price || 0).toFixed(2)}
                                                </Typography>
                                                {product.discount && parseFloat(product.discount) > 0 && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            textDecoration: "line-through",
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        ${(product.sellingPrice || product.price || 0).toFixed(2)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            {product.discount && parseFloat(product.discount) > 0 ? (
                                                <Box>
                                                    <Chip
                                                        label={`${product.discount}% OFF`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: "#ef4444",
                                                            color: "#fff",
                                                            fontWeight: "600",
                                                            fontSize: "0.675rem",
                                                        }}
                                                    />
                                                    {product.discountPrice && (
                                                        <Typography
                                                            variant="caption"
                                                            display="block"
                                                            fontWeight="600"
                                                            sx={{ color: "#ef4444", mt: 0.5 }}
                                                        >
                                                            ${parseFloat(product.discountPrice).toFixed(2)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>—</Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {m !== null ? (
                                                <Chip
                                                    label={`${m}%`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: parseFloat(m) < 0 ? "#fef2f2"
                                                            : parseFloat(m) < 20 ? "#fff7ed" : "#f0fdf4",
                                                        color: parseFloat(m) < 0 ? "#dc2626"
                                                            : parseFloat(m) < 20 ? "#ea580c" : "#16a34a",
                                                        fontWeight: "600",
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>—</Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={product.stockQuantity}
                                                size="small"
                                                sx={{
                                                    backgroundColor: product.stockQuantity > 10 ? "#f0fdf4"
                                                        : product.stockQuantity > 0 ? "#fff7ed" : "#fef2f2",
                                                    color: product.stockQuantity > 10 ? "#16a34a"
                                                        : product.stockQuantity > 0 ? "#ea580c" : "#dc2626",
                                                    fontWeight: "600",
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={product.isActive ? "Active" : "Inactive"}
                                                size="small"
                                                sx={{
                                                    backgroundColor: product.isActive ? alpha('#3a7d44', 0.1) : "#f1f5f9",
                                                    color: product.isActive ? "#3a7d44" : "#64748b",
                                                    fontWeight: 500,
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <Tooltip title="Edit" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenEditDialog(product)}
                                                    sx={{
                                                        color: "#3b82f6",
                                                        mr: 1,
                                                        '&:hover': {
                                                            backgroundColor: alpha('#3b82f6', 0.1),
                                                            transform: 'scale(1.1)',
                                                        },
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDeleteDialog(product)}
                                                    sx={{
                                                        color: "#ef4444",
                                                        '&:hover': {
                                                            backgroundColor: alpha('#ef4444', 0.1),
                                                            transform: 'scale(1.1)',
                                                        },
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={handleCloseAddDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        boxShadow: `0 20px 40px ${alpha('#000', 0.2)}`,
                    }
                }}
            >
                <DialogTitle sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h5" fontWeight="700" sx={{ color: "#1e293b" }}>
                            Add New Product
                        </Typography>
                        <IconButton onClick={handleCloseAddDialog} sx={{ color: "#64748b" }}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3 }}>
                    <ProductForm 
                        formData={formData}
                        formError={formError}
                        setFormError={setFormError}
                        imagePreviews={imagePreviews}
                        selectedColors={selectedColors}
                        selectedSizes={selectedSizes}
                        variantGrid={variantGrid}
                        categories={categories}
                        subCategories={subCategories}
                        handleCategoryChange={handleCategoryChange}
                        margin={margin}
                        marginColor={marginColor}
                        handleFormChange={handleFormChange}
                        handleToggleColor={handleToggleColor}
                        handleToggleSize={handleToggleSize}
                        handleUpdateVariant={handleUpdateVariant}
                        handleImagesChange={handleImagesChange}
                        handleRemoveImage={handleRemoveImage}
                        isEdit={false}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={handleCloseAddDialog}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2.5,
                            px: 4,
                            py: 1,
                            borderColor: "#e0e0e0",
                            color: "#64748b",
                            '&:hover': {
                                borderColor: "#94a3b8",
                                backgroundColor: "#f8fafc",
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddProduct}
                        variant="contained"
                        disabled={formLoading || uploading}
                        sx={{
                            backgroundColor: "#3a7d44",
                            textTransform: "none",
                            borderRadius: 2.5,
                            px: 4,
                            py: 1,
                            fontWeight: 600,
                            '&:hover': { backgroundColor: "#2d6336" },
                        }}
                    >
                        {formLoading || uploading ? <CircularProgress size={20} color="inherit" /> : "Add Product"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        boxShadow: `0 20px 40px ${alpha('#000', 0.2)}`,
                    }
                }}
            >
                <DialogTitle sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h5" fontWeight="700" sx={{ color: "#1e293b" }}>
                            Edit Product
                        </Typography>
                        <IconButton onClick={handleCloseEditDialog} sx={{ color: "#64748b" }}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3 }}>
                    <ProductForm 
                        formData={formData}
                        formError={formError}
                        setFormError={setFormError}
                        imagePreviews={imagePreviews}
                        selectedColors={selectedColors}
                        selectedSizes={selectedSizes}
                        variantGrid={variantGrid}
                        categories={categories}
                        subCategories={subCategories}
                        handleCategoryChange={handleCategoryChange}
                        margin={margin}
                        marginColor={marginColor}
                        handleFormChange={handleFormChange}
                        handleToggleColor={handleToggleColor}
                        handleToggleSize={handleToggleSize}
                        handleUpdateVariant={handleUpdateVariant}
                        handleImagesChange={handleImagesChange}
                        handleRemoveImage={handleRemoveImage}
                        isEdit={true}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={handleCloseEditDialog}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2.5,
                            px: 4,
                            py: 1,
                            borderColor: "#e0e0e0",
                            color: "#64748b",
                            '&:hover': {
                                borderColor: "#94a3b8",
                                backgroundColor: "#f8fafc",
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditProduct}
                        variant="contained"
                        disabled={formLoading || uploading}
                        sx={{
                            backgroundColor: "#3b82f6",
                            textTransform: "none",
                            borderRadius: 2.5,
                            px: 4,
                            py: 1,
                            fontWeight: 600,
                            '&:hover': { backgroundColor: "#2563eb" },
                        }}
                    >
                        {formLoading || uploading ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        boxShadow: `0 20px 40px ${alpha('#000', 0.2)}`,
                    }
                }}
            >
                <DialogTitle sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h5" fontWeight="700" sx={{ color: "#ef4444" }}>
                            Delete Product
                        </Typography>
                        <IconButton onClick={handleCloseDeleteDialog} sx={{ color: "#64748b" }}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                        <Avatar
                            variant="rounded"
                            src={getImageUrl(selectedProduct?.imageUrl)}
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 2.5,
                                backgroundColor: "#f1f5f9",
                            }}
                        >
                            <ImageIcon sx={{ color: "#94a3b8" }} />
                        </Avatar>
                        <Box>
                            <Typography fontWeight="700" sx={{ color: "#1e293b" }}>
                                {selectedProduct?.productName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                                ${(selectedProduct?.sellingPrice || selectedProduct?.price || 0).toFixed(2)}
                            </Typography>
                            {selectedProduct?.sku && (
                                <Chip
                                    label={selectedProduct.sku}
                                    size="small"
                                    sx={{
                                        backgroundColor: "#f1f5f9",
                                        fontSize: "0.675rem",
                                        height: 20,
                                        mt: 0.5,
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                    <Alert
                        severity="warning"
                        sx={{
                            borderRadius: 2,
                            '& .MuiAlert-icon': { alignItems: 'center' }
                        }}
                    >
                        This action cannot be undone!
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2.5,
                            px: 4,
                            py: 1,
                            borderColor: "#e0e0e0",
                            color: "#64748b",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteProduct}
                        variant="contained"
                        color="error"
                        disabled={formLoading}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2.5,
                            px: 4,
                            py: 1,
                            fontWeight: 600,
                        }}
                    >
                        {formLoading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductList;