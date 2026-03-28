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
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
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

/* ─── Google Fonts ───────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap";
if (!document.head.querySelector('link[href*="Syne"]')) {
    document.head.appendChild(fontLink);
}

/* ─── MUI Theme ──────────────────────────────────────────────── */
const bwTheme = createTheme({
    palette: {
        mode: "light",
        primary:    { main: "#000000" },
        secondary:  { main: "#ffffff" },
        error:      { main: "#000000" },
        background: { default: "#f9f9f9", paper: "#ffffff" },
        text:       { primary: "#000000", secondary: "#555555" },
    },
    typography: { fontFamily: "'Syne', sans-serif" },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 13,
                        borderRadius: 0,
                        "& fieldset": { borderColor: "#d8d8d8", borderWidth: 1 },
                        "&:hover fieldset": { borderColor: "#000", borderWidth: 1 },
                        "&.Mui-focused fieldset": { borderColor: "#000", borderWidth: 2 },
                    },
                    "& .MuiInputLabel-root": {
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 13,
                        letterSpacing: "0.04em",
                        color: "#888",
                        "&.Mui-focused": { color: "#000" },
                    },
                    "& .MuiFormHelperText-root": {
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        color: "#999",
                    },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    "&.Mui-selected": { backgroundColor: "#000", color: "#fff",
                        "&:hover": { backgroundColor: "#222" } },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 0, fontFamily: "'DM Mono', monospace", fontSize: 11 },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    border: "1px solid #000",
                },
                standardSuccess: {
                    backgroundColor: "#fff",
                    borderColor: "#000",
                    color: "#000",
                    "& .MuiAlert-icon": { color: "#000" },
                },
                standardError: {
                    backgroundColor: "#fff",
                    borderColor: "#000",
                    color: "#000",
                    "& .MuiAlert-icon": { color: "#000" },
                },
                standardWarning: {
                    backgroundColor: "#fff",
                    borderColor: "#888",
                    color: "#000",
                    "& .MuiAlert-icon": { color: "#555" },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    borderBottom: "1px solid #ebebeb",
                    padding: "12px 14px",
                },
                head: {
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    backgroundColor: "#000",
                    color: "#fff",
                    borderBottom: "none",
                    padding: "14px",
                },
            },
        },
        MuiPaper:      { styleOverrides: { root: { borderRadius: 0 } } },
        MuiDialog:     { styleOverrides: { paper: { borderRadius: 0 } } },
        MuiIconButton: { styleOverrides: { root: { borderRadius: 0 } } },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    "&.Mui-checked":                          { color: "#000" },
                    "&.Mui-checked + .MuiSwitch-track":       { backgroundColor: "#000" },
                },
            },
        },
    },
});

/* ─── Data ───────────────────────────────────────────────────── */
const AVAILABLE_COLORS = [
    { label: "Black",  value: "BLACK",  hex: "#000000" },
    { label: "White",  value: "WHITE",  hex: "#FFFFFF" },
    { label: "Red",    value: "RED",    hex: "#EF4444" },
    { label: "Blue",   value: "BLUE",   hex: "#3B82F6" },
    { label: "Green",  value: "GREEN",  hex: "#22C55E" },
    { label: "Yellow", value: "YELLOW", hex: "#EAB308" },
    { label: "Purple", value: "PURPLE", hex: "#A855F7" },
    { label: "Pink",   value: "PINK",   hex: "#EC4899" },
    { label: "Orange", value: "ORANGE", hex: "#F97316" },
    { label: "Gray",   value: "GRAY",   hex: "#6B7280" },
    { label: "Brown",  value: "BROWN",  hex: "#92400E" },
    { label: "Navy",   value: "NAVY",   hex: "#1E3A5F" },
];

const AVAILABLE_SIZES = [
    "XS","S","M","L","XL","XXL","XXXL",
    "28","30","32","34","36","38","40",
    "6","7","8","9","10","11","12","ONE SIZE",
];

const UNITS = ["UNIT","KG","GRAM","LITER","METER","PIECE","BOX","PACK"];

const emptyForm = {
    productName:"", productDescription:"", unitPrice:"", sellingPrice:"",
    discount:"", discountPrice:"", categoryId:"", subCategoryId:"",
    initialStock:"", reorderLevel:"", unitOfMeasure:"UNIT", sku:"",
    imageUrl:"", isActive:true,
};

/* ─── Section Header ─────────────────────────────────────────── */
const SectionTitle = ({ children, number }) => (
    <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:2.5, mt:3.5,
        "&:first-of-type": { mt:0 } }}>
        <Box sx={{
            width:28, height:28, backgroundColor:"#000", color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:12, flexShrink:0,
        }}>
            {number}
        </Box>
        <Typography sx={{
            fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:11,
            letterSpacing:"0.12em", textTransform:"uppercase", color:"#000",
        }}>
            {children}
        </Typography>
        <Box sx={{ flexGrow:1, height:"1px", backgroundColor:"#e8e8e8" }} />
    </Box>
);

/* ─── Color Selector ─────────────────────────────────────────── */
const ColorSelector = ({ selectedColors, onToggleColor }) => (
    <Box sx={{ display:"flex", flexWrap:"wrap", gap:1, mb:3 }}>
        {AVAILABLE_COLORS.map((c) => {
            const sel = selectedColors.includes(c.value);
            return (
                <Tooltip key={c.value} title={c.label} arrow>
                    <Box
                        onClick={() => onToggleColor(c.value)}
                        sx={{
                            width:34, height:34,
                            backgroundColor: c.hex,
                            border: sel ? "3px solid #000" : "1px solid #ddd",
                            cursor:"pointer",
                            outline: sel ? "1px solid #000" : "none",
                            outlineOffset: "2px",
                            transition:"all 0.15s ease",
                            "&:hover": { transform:"scale(1.12)" },
                        }}
                    />
                </Tooltip>
            );
        })}
    </Box>
);

/* ─── Size Selector ──────────────────────────────────────────── */
const SizeSelector = ({ selectedSizes, onToggleSize }) => (
    <Box sx={{ display:"flex", flexWrap:"wrap", gap:1, mb:3 }}>
        {AVAILABLE_SIZES.map((s) => {
            const sel = selectedSizes.includes(s);
            return (
                <Box
                    key={s}
                    onClick={() => onToggleSize(s)}
                    sx={{
                        px:1.5, py:0.6,
                        border: sel ? "2px solid #000" : "1px solid #ddd",
                        backgroundColor: sel ? "#000" : "#fff",
                        color: sel ? "#fff" : "#555",
                        fontFamily:"'DM Mono', monospace",
                        fontSize:12, cursor:"pointer",
                        transition:"all 0.15s ease",
                        "&:hover": {
                            borderColor:"#000",
                            backgroundColor: sel ? "#222" : "#f5f5f5",
                        },
                    }}
                >
                    {s}
                </Box>
            );
        })}
    </Box>
);

/* ─── Variant Grid ───────────────────────────────────────────── */
const VariantGrid = ({ selectedColors, selectedSizes, variantGrid, onUpdateVariant }) => {
    const total = useMemo(() =>
        Object.values(variantGrid).reduce((s,c) => s + (parseInt(c.qty)||0), 0),
        [variantGrid]
    );
    return (
        <>
            <Typography sx={{
                fontFamily:"'DM Mono', monospace", fontSize:10,
                letterSpacing:"0.1em", color:"#888", textTransform:"uppercase",
                mb:1.5, display:"block",
            }}>
                Step 3 — Enter Quantities
            </Typography>
            <Box sx={{ border:"1px solid #e8e8e8", overflow:"auto", mb:2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth:120 }}>Color \ Size</TableCell>
                            {selectedSizes.map(s => (
                                <TableCell key={s} align="center" sx={{ minWidth:72 }}>{s}</TableCell>
                            ))}
                            <TableCell align="center" sx={{ color:"#ccc !important" }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedColors.map((colorVal) => {
                            const colorDef = AVAILABLE_COLORS.find(c => c.value === colorVal);
                            const rowTotal = selectedSizes.reduce((sum, sizeVal) =>
                                sum + (parseInt(variantGrid[`${colorVal}_${sizeVal}`]?.qty)||0), 0);
                            return (
                                <TableRow key={colorVal}
                                    sx={{ "&:hover": { backgroundColor:"#fafafa" } }}>
                                    <TableCell>
                                        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                                            <Box sx={{
                                                width:14, height:14,
                                                backgroundColor: colorDef?.hex,
                                                border:"1px solid #ccc", flexShrink:0,
                                            }} />
                                            <span>{colorDef?.label}</span>
                                        </Box>
                                    </TableCell>
                                    {selectedSizes.map(sizeVal => {
                                        const key = `${colorVal}_${sizeVal}`;
                                        const qty = variantGrid[key]?.qty || "";
                                        return (
                                            <TableCell key={sizeVal} align="center" sx={{ p:0.5 }}>
                                                <TextField
                                                    placeholder="0"
                                                    type="number"
                                                    value={qty}
                                                    onChange={e => onUpdateVariant(colorVal, sizeVal, e.target.value)}
                                                    size="small"
                                                    inputProps={{ min:"0", style:{ textAlign:"center", padding:"7px 4px", fontSize:13 } }}
                                                    sx={{
                                                        width:66,
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius:0,
                                                            backgroundColor: qty && parseInt(qty) > 0 ? "#f5f5f5" : "#fff",
                                                        },
                                                    }}
                                                />
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell align="center">
                                        <Typography sx={{
                                            fontFamily:"'Syne', sans-serif", fontWeight:700,
                                            fontSize:13, color: rowTotal > 0 ? "#000" : "#ccc",
                                        }}>
                                            {rowTotal || "—"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {/* Total row */}
                        <TableRow sx={{ backgroundColor:"#000" }}>
                            <TableCell sx={{ color:"#fff !important", fontWeight:"700 !important",
                                fontSize:"11px !important", letterSpacing:"0.1em !important",
                                textTransform:"uppercase", borderBottom:"none !important" }}>
                                Total Stock
                            </TableCell>
                            {selectedSizes.map(sizeVal => {
                                const colTotal = selectedColors.reduce((sum, colorVal) =>
                                    sum + (parseInt(variantGrid[`${colorVal}_${sizeVal}`]?.qty)||0), 0);
                                return (
                                    <TableCell key={sizeVal} align="center"
                                        sx={{ color:"#fff !important", fontFamily:"'Syne', sans-serif !important",
                                            fontWeight:"700 !important", borderBottom:"none !important" }}>
                                        {colTotal || "—"}
                                    </TableCell>
                                );
                            })}
                            <TableCell align="center" sx={{
                                color:"#fff !important", fontFamily:"'Syne', sans-serif !important",
                                fontWeight:"800 !important", fontSize:"16px !important",
                                borderBottom:"none !important" }}>
                                {total}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        </>
    );
};

/* ─── Product Form ───────────────────────────────────────────── */
const ProductForm = ({
    formData, formError, imagePreviews, selectedColors, selectedSizes,
    variantGrid, categories, subCategories, handleCategoryChange, isEdit,
    margin, handleFormChange, handleToggleColor, handleToggleSize,
    handleUpdateVariant, handleImagesChange, handleRemoveImage, setFormError,
}) => {
    const marginStatus =
        margin === null        ? "neutral"
        : parseFloat(margin) < 0  ? "loss"
        : parseFloat(margin) < 20 ? "low"
        : "healthy";

    return (
        <Box>
            {formError && (
                <Alert severity="error" sx={{ mb:3 }}>✕&nbsp;&nbsp;{formError}</Alert>
            )}

            {/* Images */}
            <SectionTitle number="01">Product Images</SectionTitle>
            <Box sx={{ mb:1 }}>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload sx={{ fontSize:16 }} />}
                    sx={{
                        fontFamily:"'Syne', sans-serif", fontWeight:600, fontSize:12,
                        letterSpacing:"0.06em", textTransform:"uppercase", borderRadius:0,
                        border:"2px dashed #ccc", color:"#000", px:3, py:1.5, mb:1.5,
                        "&:hover": { border:"2px dashed #000", backgroundColor:"#f5f5f5" },
                    }}
                >
                    Select Images ({imagePreviews.length}/6)
                    <input type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
                </Button>
                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10,
                    color:"#bbb", letterSpacing:"0.04em", mb:2.5, display:"block" }}>
                    First image = primary · Max 5 MB · JPG / PNG / GIF
                </Typography>

                {imagePreviews.length > 0 && (
                    <Box sx={{ display:"flex", flexWrap:"wrap", gap:2 }}>
                        {imagePreviews.map((src, idx) => (
                            <Box key={idx} sx={{ position:"relative",
                                transition:"transform 0.15s", "&:hover":{ transform:"translateY(-2px)" } }}>
                                <Box component="img" src={src} sx={{
                                    width:88, height:88, objectFit:"cover", display:"block",
                                    border: idx === 0 ? "3px solid #000" : "1px solid #e0e0e0",
                                    filter: idx === 0 ? "none" : "grayscale(15%)",
                                }} />
                                {idx === 0 && (
                                    <Box sx={{
                                        position:"absolute", bottom:0, left:0,
                                        backgroundColor:"#000", color:"#fff",
                                        fontFamily:"'DM Mono', monospace", fontSize:8,
                                        letterSpacing:"0.08em", px:0.8, py:0.3,
                                    }}>PRIMARY</Box>
                                )}
                                <IconButton size="small" onClick={() => handleRemoveImage(idx)} sx={{
                                    position:"absolute", top:-9, right:-9, width:22, height:22,
                                    backgroundColor:"#000", color:"#fff", borderRadius:0,
                                    "&:hover":{ backgroundColor:"#333" },
                                }}>
                                    <Close sx={{ fontSize:12 }} />
                                </IconButton>
                            </Box>
                        ))}
                        {imagePreviews.length < 6 && (
                            <Button variant="outlined" component="label" sx={{
                                width:88, height:88, borderRadius:0, border:"1px dashed #ccc",
                                display:"flex", flexDirection:"column", gap:0.5, color:"#bbb",
                                minWidth:0, "&:hover":{ border:"1px dashed #000", color:"#000" },
                            }}>
                                <ImageIcon sx={{ fontSize:20 }} />
                                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:9 }}>add</Typography>
                                <input type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
                            </Button>
                        )}
                    </Box>
                )}
            </Box>

            {/* Basic Info */}
            <SectionTitle number="02">Basic Information</SectionTitle>
            <Grid container spacing={2} sx={{ mb:1 }}>
                <Grid item xs={8}>
                    <TextField label="Product Name" value={formData.productName}
                        onChange={e => { handleFormChange("productName", e.target.value); setFormError(""); }}
                        fullWidth required size="small" />
                </Grid>
                <Grid item xs={4}>
                    <TextField label="SKU" value={formData.sku}
                        onChange={e => handleFormChange("sku", e.target.value)}
                        fullWidth size="small" placeholder="e.g. PROD-001" />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Description" value={formData.productDescription}
                        onChange={e => handleFormChange("productDescription", e.target.value)}
                        fullWidth multiline rows={2} size="small" />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Category" value={formData.categoryId}
                        onChange={e => handleCategoryChange(e.target.value)}
                        select fullWidth required size="small">
                        {categories.map(c => (
                            <MenuItem key={c.categoryId} value={c.categoryId}>{c.categoryName}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Sub Category" value={formData.subCategoryId}
                        onChange={e => handleFormChange("subCategoryId", e.target.value)}
                        select fullWidth size="small"
                        disabled={!formData.categoryId || subCategories.length === 0}>
                        <MenuItem value="">None</MenuItem>
                        {subCategories.map(sc => (
                            <MenuItem key={sc.subCategoryId} value={sc.subCategoryId}>{sc.subCategoryName}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Unit of Measure" value={formData.unitOfMeasure}
                        onChange={e => handleFormChange("unitOfMeasure", e.target.value)}
                        select fullWidth size="small">
                        {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Reorder Level" type="number" value={formData.reorderLevel}
                        onChange={e => handleFormChange("reorderLevel", e.target.value)}
                        fullWidth size="small" inputProps={{ min:"0" }} />
                </Grid>
            </Grid>

            {/* Pricing */}
            <SectionTitle number="03">Pricing</SectionTitle>
            <Grid container spacing={2} sx={{ mb:1 }}>
                <Grid item xs={12} sm={4}>
                    <TextField label="Unit Price (Cost)" type="number" value={formData.unitPrice}
                        onChange={e => handleFormChange("unitPrice", e.target.value)}
                        fullWidth size="small" inputProps={{ step:"0.01", min:"0" }}
                        InputProps={{ startAdornment:
                            <InputAdornment position="start">
                                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:13, color:"#888" }}>$</Typography>
                            </InputAdornment>
                        }}
                        helperText="Purchase / cost price"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField label="Selling Price" type="number" value={formData.sellingPrice}
                        onChange={e => handleFormChange("sellingPrice", e.target.value)}
                        fullWidth required size="small" inputProps={{ step:"0.01", min:"0" }}
                        InputProps={{ startAdornment:
                            <InputAdornment position="start">
                                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:13, color:"#888" }}>$</Typography>
                            </InputAdornment>
                        }}
                        helperText="Customer pays"
                    />
                </Grid>
                {/* Margin */}
                <Grid item xs={12} sm={4}>
                    <Box sx={{
                        border:"1px solid",
                        borderColor: marginStatus === "loss" ? "#000" : "#e0e0e0",
                        px:2, height:"40px",
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        backgroundColor: marginStatus === "loss" ? "#000" : "#fafafa",
                        transition:"all 0.3s ease",
                    }}>
                        <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10,
                            letterSpacing:"0.08em", textTransform:"uppercase",
                            color: marginStatus === "loss" ? "#fff" : "#888" }}>
                            Margin
                        </Typography>
                        <Typography sx={{ fontFamily:"'Syne', sans-serif", fontWeight:800,
                            fontSize:18, color: marginStatus === "loss" ? "#fff" : "#000" }}>
                            {margin === null ? "—" : `${margin}%`}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10,
                        color:"#888", px:0.5, mt:0.5, display:"block" }}>
                        {marginStatus === "neutral" ? "Enter both prices"
                         : marginStatus === "loss"  ? "⚠ Selling below cost"
                         : marginStatus === "low"   ? "⚠ Low margin (<20%)"
                         : "✓ Healthy margin"}
                    </Typography>
                </Grid>
                {/* Discount */}
                <Grid item xs={12} sm={4}>
                    <TextField label="Discount (%)" type="number" value={formData.discount}
                        onChange={e => handleFormChange("discount", e.target.value)}
                        fullWidth size="small" inputProps={{ step:"0.01", min:"0", max:"100" }}
                        InputProps={{ endAdornment:
                            <InputAdornment position="end">
                                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:13, color:"#888" }}>%</Typography>
                            </InputAdornment>
                        }}
                        helperText="Optional"
                    />
                </Grid>
                {formData.discount && parseFloat(formData.discount) > 0 && (
                    <Grid item xs={12} sm={4}>
                        <Box sx={{
                            border:"1px solid #e0e0e0", px:2, height:"40px",
                            display:"flex", alignItems:"center", justifyContent:"space-between",
                            backgroundColor:"#fafafa",
                        }}>
                            <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                                After disc.
                            </Typography>
                            <Typography sx={{ fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:16 }}>
                                {formData.discountPrice ? `$${formData.discountPrice}` : "—"}
                            </Typography>
                        </Box>
                        <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#888", px:0.5, mt:0.5, display:"block" }}>
                            {formData.discountPrice && formData.sellingPrice
                                ? `Save $${(parseFloat(formData.sellingPrice) - parseFloat(formData.discountPrice)).toFixed(2)}`
                                : "Enter selling price first"}
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {/* Variants */}
            <SectionTitle number="04">Product Variants</SectionTitle>

            <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:"0.1em",
                color:"#888", textTransform:"uppercase", mb:1.5, display:"block" }}>
                Step 1 — Select Colors
            </Typography>
            <ColorSelector selectedColors={selectedColors} onToggleColor={handleToggleColor} />

            <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:"0.1em",
                color:"#888", textTransform:"uppercase", mb:1.5, display:"block" }}>
                Step 2 — Select Sizes
            </Typography>
            <SizeSelector selectedSizes={selectedSizes} onToggleSize={handleToggleSize} />

            {selectedColors.length > 0 && selectedSizes.length > 0 ? (
                <VariantGrid
                    selectedColors={selectedColors} selectedSizes={selectedSizes}
                    variantGrid={variantGrid} onUpdateVariant={handleUpdateVariant}
                />
            ) : (
                <Box sx={{
                    p:3, border:"2px dashed #e8e8e8", textAlign:"center", mb:2,
                    backgroundColor:"#fafafa",
                }}>
                    <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:12, color:"#bbb" }}>
                        {selectedColors.length === 0 && selectedSizes.length === 0
                            ? "Select colors and sizes above to build the variant table"
                            : selectedColors.length === 0 ? "← Select at least one color"
                            : "← Select at least one size"}
                    </Typography>
                </Box>
            )}

            {selectedColors.length === 0 && !isEdit && (
                <TextField
                    label="Initial Stock" type="number" value={formData.initialStock}
                    onChange={e => handleFormChange("initialStock", e.target.value)}
                    size="small" inputProps={{ min:"0" }}
                    sx={{ width:200, mt:1 }}
                    helperText="Skip if using variants above"
                />
            )}

            {isEdit && (
                <Box sx={{ mt:3, p:2, border:"1px solid #e8e8e8", backgroundColor:"#fafafa" }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isActive}
                                onChange={e => handleFormChange("isActive", e.target.checked)}
                            />
                        }
                        label={
                            <Typography sx={{ fontFamily:"'Syne', sans-serif", fontWeight:600, fontSize:13 }}>
                                {formData.isActive ? "✓ Product is Active" : "✗ Product is Inactive"}
                            </Typography>
                        }
                    />
                </Box>
            )}
        </Box>
    );
};

/* ─── Main Component ─────────────────────────────────────────── */
const ProductList = () => {
    const [products, setProducts]             = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories]         = useState([]);
    const [subCategories, setSubCategories]   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [searchTerm, setSearchTerm]         = useState("");
    const [alert, setAlert]                   = useState({ show:false, message:"", severity:"success" });

    const [addDialogOpen, setAddDialogOpen]   = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formLoading, setFormLoading]       = useState(false);

    const [imageFiles, setImageFiles]         = useState([]);
    const [imagePreviews, setImagePreviews]   = useState([]);
    const [uploading, setUploading]           = useState(false);

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes]   = useState([]);
    const [variantGrid, setVariantGrid]       = useState({});

    const [formData, setFormData]             = useState(emptyForm);
    const [formError, setFormError]           = useState("");

    const margin = useMemo(() => {
        const unit = parseFloat(formData.unitPrice);
        const sell = parseFloat(formData.sellingPrice);
        if (!unit || !sell || unit <= 0) return null;
        return (((sell - unit) / sell) * 100).toFixed(1);
    }, [formData.unitPrice, formData.sellingPrice]);

    const gridTotalStock = useMemo(() =>
        Object.values(variantGrid).reduce((s,c) => s + (parseInt(c.qty)||0), 0),
        [variantGrid]
    );

    const calcDiscountPrice = useCallback((sellingPrice, discount) => {
        const s = parseFloat(sellingPrice);
        const d = parseFloat(discount);
        if (!s || !d || d <= 0) return "";
        return (s - (s * d / 100)).toFixed(2);
    }, []);

    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => {
            if (field === "sellingPrice" || field === "discount") {
                const sp = field === "sellingPrice" ? value : prev.sellingPrice;
                const di = field === "discount"      ? value : prev.discount;
                return { ...prev, [field]: value, discountPrice: calcDiscountPrice(sp, di) };
            }
            return { ...prev, [field]: value };
        });
    }, [calcDiscountPrice]);

    const handleToggleColor = useCallback((v) =>
        setSelectedColors(p => p.includes(v) ? p.filter(c => c !== v) : [...p, v]), []);
    const handleToggleSize  = useCallback((v) =>
        setSelectedSizes(p => p.includes(v) ? p.filter(s => s !== v) : [...p, v]),  []);
    const handleUpdateVariant = useCallback((colorVal, sizeVal, value) =>
        setVariantGrid(p => ({ ...p, [`${colorVal}_${sizeVal}`]: { qty:value } })), []);

    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    useEffect(() => {
        setFilteredProducts(products.filter(p =>
            p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try { const d = await productService.getAllProducts(); setProducts(d); setFilteredProducts(d); }
        catch { showAlert("Failed to load products","error"); }
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

    const showAlert = (message, severity="success") => {
        setAlert({ show:true, message, severity });
        setTimeout(() => setAlert({ show:false, message:"", severity:"success" }), 4000);
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `http://localhost:8080${url}`;
    };

    const resetForm = () => {
        setFormData(emptyForm); setFormError(""); setImageFiles([]);
        setImagePreviews([]); setSelectedColors([]); setSelectedSizes([]);
        setVariantGrid({}); setSubCategories([]);
    };

    const handleCategoryChange = (categoryId) => {
        setFormData(p => ({ ...p, categoryId, subCategoryId:"" }));
        fetchSubCategories(categoryId);
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files).filter(
            f => f.type.startsWith("image/") && f.size <= 5*1024*1024
        );
        if (imageFiles.length + files.length > 6) { setFormError("Max 6 images"); return; }
        setImageFiles(p => [...p, ...files]);
        setImagePreviews(p => [...p, ...files.map(URL.createObjectURL)]);
    };

    const handleRemoveImage = (idx) => {
        setImageFiles(p => p.filter((_,i) => i !== idx));
        setImagePreviews(p => p.filter((_,i) => i !== idx));
    };

    const uploadAllImages = async () => {
        const urls = [];
        for (const file of imageFiles) {
            const fd = new FormData();
            fd.append("file", file);
            const res = await api.post("/files/upload", fd, { headers: { "Content-Type":"multipart/form-data" } });
            urls.push(res.data.fileUrl);
        }
        return urls;
    };

    const getVariantsFromGrid = () => {
        const result = [];
        selectedColors.forEach(colorVal =>
            selectedSizes.forEach(sizeVal => {
                const cell = variantGrid[`${colorVal}_${sizeVal}`];
                if (cell?.qty && parseInt(cell.qty) > 0)
                    result.push({ color:colorVal, size:sizeVal, quantity:parseInt(cell.qty) });
            })
        );
        return result;
    };

    const populateGridFromVariants = (variants) => {
        const colors = [...new Set(variants.map(v => v.color))];
        const sizes  = [...new Set(variants.map(v => v.size))];
        const grid   = {};
        variants.forEach(v => { grid[`${v.color}_${v.size}`] = { qty: String(v.quantity) }; });
        setSelectedColors(colors); setSelectedSizes(sizes); setVariantGrid(grid);
    };

    const handleOpenAddDialog  = () => { resetForm(); setAddDialogOpen(true); };
    const handleCloseAddDialog = () => { setAddDialogOpen(false); resetForm(); };

    const handleAddProduct = async () => {
        if (!formData.productName.trim()) { setFormError("Product name is required"); return; }
        if (!formData.sellingPrice)       { setFormError("Selling price is required"); return; }
        if (!formData.categoryId)         { setFormError("Category is required");      return; }
        if (imageFiles.length === 0)      { setFormError("At least one image is required"); return; }

        setFormLoading(true);
        try {
            setUploading(true);
            const imageUrls = await uploadAllImages();
            setUploading(false);
            const gridVariants = getVariantsFromGrid();
            await productService.createProduct({
                ...formData,
                price:         parseFloat(formData.sellingPrice),
                unitPrice:     parseFloat(formData.unitPrice) || null,
                sellingPrice:  parseFloat(formData.sellingPrice),
                margin:        margin ? parseFloat(margin) : null,
                discount:      formData.discount ? parseFloat(formData.discount) : null,
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                categoryId:    parseInt(formData.categoryId),
                subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
                initialStock:  gridVariants.length > 0 ? gridTotalStock : parseInt(formData.initialStock)||0,
                reorderLevel:  formData.reorderLevel ? parseInt(formData.reorderLevel) : null,
                imageUrl:      imageUrls[0],
                imageUrls,
                variants:      gridVariants,
            });
            showAlert("Product created successfully!");
            handleCloseAddDialog(); fetchProducts();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to create product");
        } finally { setFormLoading(false); setUploading(false); }
    };

    const handleOpenEditDialog = async (product) => {
        setSelectedProduct(product);
        setFormData({
            productName:        product.productName || "",
            productDescription: product.productDescription || "",
            unitPrice:          product.unitPrice || "",
            sellingPrice:       product.sellingPrice || product.price || "",
            discount:           product.discount || "",
            discountPrice:      product.discountPrice || "",
            categoryId:         product.categoryId || "",
            subCategoryId:      product.subCategoryId || "",
            initialStock:       product.stockQuantity || "",
            reorderLevel:       product.reorderLevel || "",
            unitOfMeasure:      product.unitOfMeasure || "UNIT",
            sku:                product.sku || "",
            imageUrl:           product.imageUrl || "",
            isActive:           product.isActive ?? true,
        });
        const existingUrls = product.imageUrls?.length > 0
            ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
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
        if (!formData.sellingPrice)       { setFormError("Selling price is required"); return; }
        setFormLoading(true);
        try {
            let imageUrls = imagePreviews
                .filter(p => p.startsWith("http://localhost:8080") || p.startsWith("/uploads"))
                .map(p => p.replace("http://localhost:8080",""));
            if (imageFiles.length > 0) {
                setUploading(true);
                const newUrls = await uploadAllImages();
                setUploading(false);
                imageUrls = [...imageUrls, ...newUrls];
            }
            const gridVariants = getVariantsFromGrid();
            await productService.updateProduct(selectedProduct.productId, {
                productName:        formData.productName,
                productDescription: formData.productDescription,
                price:              parseFloat(formData.sellingPrice),
                unitPrice:          parseFloat(formData.unitPrice) || null,
                sellingPrice:       parseFloat(formData.sellingPrice),
                margin:             margin ? parseFloat(margin) : null,
                discount:           formData.discount ? parseFloat(formData.discount) : null,
                discountPrice:      formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                categoryId:         parseInt(formData.categoryId),
                subCategoryId:      formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
                reorderLevel:       formData.reorderLevel ? parseInt(formData.reorderLevel) : null,
                unitOfMeasure:      formData.unitOfMeasure,
                sku:                formData.sku || null,
                isActive:           formData.isActive,
                imageUrl:           imageUrls[0] || formData.imageUrl,
                imageUrls,
                variants:           gridVariants,
            });
            showAlert("Product updated successfully!");
            handleCloseEditDialog(); fetchProducts();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to update product");
        } finally { setFormLoading(false); setUploading(false); }
    };

    const handleOpenDeleteDialog  = (p) => { setSelectedProduct(p); setDeleteDialogOpen(true); };
    const handleCloseDeleteDialog = ()  => { setDeleteDialogOpen(false); setSelectedProduct(null); };

    const handleDeleteProduct = async () => {
        setFormLoading(true);
        try {
            await productService.deleteProduct(selectedProduct.productId);
            showAlert("Product deleted successfully!");
            handleCloseDeleteDialog(); fetchProducts();
        } catch (err) {
            showAlert(err.response?.data?.message || "Failed to delete product","error");
            handleCloseDeleteDialog();
        } finally { setFormLoading(false); }
    };

    /* ── Shared dialog action styles ── */
    const cancelBtnSx = {
        fontFamily:"'Syne', sans-serif", fontWeight:600, fontSize:12,
        letterSpacing:"0.06em", textTransform:"uppercase", borderRadius:0,
        border:"1px solid #e0e0e0", color:"#555", px:4, py:1.2,
        "&:hover":{ border:"1px solid #000", color:"#000", backgroundColor:"#f5f5f5" },
    };

    return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ p:{ xs:2, md:3 }, fontFamily:"'Syne', sans-serif", minHeight:"100vh", backgroundColor:"#f9f9f9" }}>

                {/* Alert */}
                {alert.show && (
                    <Alert severity={alert.severity} sx={{ mb:3 }}>
                        {alert.severity === "success" ? "✓" : "✕"}&nbsp;&nbsp;{alert.message}
                    </Alert>
                )}

                {/* ── HEADER ─────────────────────────────────── */}
                <Box sx={{
                    display:"flex", justifyContent:"space-between", alignItems:"flex-end",
                    mb:4, pb:3, borderBottom:"3px solid #000", flexWrap:"wrap", gap:2,
                }}>
                    <Box>
                        <Typography sx={{
                            fontFamily:"'Syne', sans-serif", fontWeight:800,
                            fontSize:{ xs:26, md:38 }, letterSpacing:"-0.02em",
                            lineHeight:1, color:"#000", mb:0.5,
                        }}>
                            PRODUCTS
                        </Typography>
                        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
                            <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"#aaa", letterSpacing:"0.06em" }}>
                                CATALOG MANAGEMENT
                            </Typography>
                            <Box sx={{
                                border:"1px solid #e0e0e0", px:1.5, py:0.3,
                                fontFamily:"'DM Mono', monospace", fontSize:11, color:"#888",
                            }}>
                                {products.length} items
                            </Box>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add sx={{ fontSize:16 }} />}
                        onClick={handleOpenAddDialog}
                        sx={{
                            fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:12,
                            letterSpacing:"0.08em", textTransform:"uppercase", borderRadius:0,
                            px:4, py:1.5, backgroundColor:"#000", color:"#fff",
                            "&:hover":{ backgroundColor:"#222" },
                            transition:"all 0.2s ease",
                        }}
                    >
                        New Product
                    </Button>
                </Box>

                {/* ── SEARCH ─────────────────────────────────── */}
                <Box sx={{ mb:3, border:"1px solid #e0e0e0", "&:focus-within":{ border:"1px solid #000" }, transition:"border 0.2s" }}>
                    <TextField
                        placeholder="Search by name, category, SKU..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color:"#bbb", fontSize:18 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                                        <Close fontSize="small" sx={{ color:"#bbb" }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: { "& .MuiOutlinedInput-notchedOutline":{ border:"none" } },
                        }}
                    />
                </Box>

                {/* ── TABLE ──────────────────────────────────── */}
                <Paper elevation={0} sx={{ border:"1px solid #e8e8e8", overflow:"hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["Image","Name / SKU","Category","Cost","Price","Discount","Margin","Stock","Status",""].map(h => (
                                        <TableCell key={h} align={h === "" ? "center" : "left"}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py:10 }}>
                                            <CircularProgress size={28} sx={{ color:"#000" }} />
                                            <Typography sx={{ fontFamily:"'DM Mono', monospace", color:"#bbb", mt:2, fontSize:12 }}>
                                                Loading products...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py:10 }}>
                                            <Inventory sx={{ fontSize:56, color:"#e8e8e8", mb:2, display:"block", mx:"auto" }} />
                                            <Typography sx={{ fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:18, color:"#000" }}>
                                                {searchTerm ? "No results found" : "No products yet"}
                                            </Typography>
                                            <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:12, color:"#aaa", mt:1 }}>
                                                {searchTerm ? "Try a different search term" : "Click 'New Product' to get started"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.map((product) => {
                                    const m = product.margin ??
                                        (product.unitPrice && product.sellingPrice
                                            ? (((product.sellingPrice - product.unitPrice) / product.sellingPrice) * 100).toFixed(1)
                                            : null);
                                    return (
                                        <TableRow key={product.productId} sx={{
                                            "&:hover":{ backgroundColor:"#fafafa" },
                                            transition:"background 0.15s ease",
                                        }}>
                                            {/* Image */}
                                            <TableCell>
                                                <Avatar variant="square" src={getImageUrl(product.imageUrl)}
                                                    sx={{ width:52, height:52, backgroundColor:"#f5f5f5",
                                                        border:"1px solid #e8e8e8" }}>
                                                    <ImageIcon sx={{ color:"#ccc" }} />
                                                </Avatar>
                                            </TableCell>

                                            {/* Name / SKU */}
                                            <TableCell>
                                                <Typography sx={{ fontFamily:"'Syne', sans-serif",
                                                    fontWeight:600, fontSize:13, color:"#000" }}>
                                                    {product.productName}
                                                </Typography>
                                                {product.sku && (
                                                    <Box component="span" sx={{
                                                        fontFamily:"'DM Mono', monospace", fontSize:10,
                                                        color:"#aaa", border:"1px solid #e8e8e8",
                                                        px:0.8, py:0.2, mt:0.5, display:"inline-block",
                                                    }}>
                                                        {product.sku}
                                                    </Box>
                                                )}
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell>
                                                <Box component="span" sx={{
                                                    border:"1px solid #e0e0e0",
                                                    px:1, py:0.3,
                                                    fontFamily:"'DM Mono', monospace", fontSize:11,
                                                }}>
                                                    {product.categoryName}
                                                </Box>
                                                {product.subCategoryName && (
                                                    <Typography sx={{ fontFamily:"'DM Mono', monospace",
                                                        fontSize:10, color:"#aaa", mt:0.5 }}>
                                                        {product.subCategoryName}
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            {/* Cost */}
                                            <TableCell>
                                                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:13, color:"#888" }}>
                                                    {product.unitPrice ? `$${parseFloat(product.unitPrice).toFixed(2)}` : "—"}
                                                </Typography>
                                            </TableCell>

                                            {/* Sell Price */}
                                            <TableCell>
                                                <Typography sx={{ fontFamily:"'Syne', sans-serif",
                                                    fontWeight:700, fontSize:14 }}>
                                                    ${(product.sellingPrice || product.price || 0).toFixed(2)}
                                                </Typography>
                                            </TableCell>

                                            {/* Discount */}
                                            <TableCell>
                                                {product.discount && parseFloat(product.discount) > 0 ? (
                                                    <Box>
                                                        <Box component="span" sx={{
                                                            backgroundColor:"#000", color:"#fff",
                                                            fontFamily:"'DM Mono', monospace",
                                                            fontSize:10, letterSpacing:"0.04em",
                                                            px:1, py:0.4, display:"inline-block",
                                                        }}>
                                                            {product.discount}% OFF
                                                        </Box>
                                                        {product.discountPrice && (
                                                            <Typography sx={{ fontFamily:"'Syne', sans-serif",
                                                                fontSize:12, fontWeight:600, mt:0.5 }}>
                                                                ${parseFloat(product.discountPrice).toFixed(2)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:12, color:"#ddd" }}>—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Margin */}
                                            <TableCell>
                                                {m !== null ? (
                                                    <Box component="span" sx={{
                                                        border:"1px solid",
                                                        borderColor: parseFloat(m) < 0 ? "#000"
                                                            : parseFloat(m) < 20 ? "#888" : "#000",
                                                        backgroundColor: parseFloat(m) < 0 ? "#000" : "transparent",
                                                        color: parseFloat(m) < 0 ? "#fff" : "#000",
                                                        fontFamily:"'DM Mono', monospace",
                                                        fontSize:12, px:1, py:0.3,
                                                        display:"inline-block",
                                                    }}>
                                                        {m}%
                                                    </Box>
                                                ) : (
                                                    <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:12, color:"#ddd" }}>—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Stock */}
                                            <TableCell>
                                                <Box component="span" sx={{
                                                    fontFamily:"'Syne', sans-serif", fontWeight:700,
                                                    fontSize:14,
                                                    color: product.stockQuantity > 10 ? "#000"
                                                         : product.stockQuantity > 0  ? "#888" : "#ccc",
                                                }}>
                                                    {product.stockQuantity}
                                                </Box>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <Box component="span" sx={{
                                                    fontFamily:"'DM Mono', monospace", fontSize:10,
                                                    letterSpacing:"0.06em", textTransform:"uppercase",
                                                    border:"1px solid",
                                                    borderColor: product.isActive ? "#000" : "#e0e0e0",
                                                    backgroundColor: product.isActive ? "#000" : "transparent",
                                                    color: product.isActive ? "#fff" : "#bbb",
                                                    px:1, py:0.3, display:"inline-block",
                                                }}>
                                                    {product.isActive ? "Active" : "Inactive"}
                                                </Box>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell align="center">
                                                <Tooltip title="Edit" arrow>
                                                    <IconButton size="small"
                                                        onClick={() => handleOpenEditDialog(product)}
                                                        sx={{
                                                            mr:0.5, color:"#000",
                                                            "&:hover":{ backgroundColor:"#000", color:"#fff" },
                                                            transition:"all 0.15s ease",
                                                        }}>
                                                        <Edit sx={{ fontSize:16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete" arrow>
                                                    <IconButton size="small"
                                                        onClick={() => handleOpenDeleteDialog(product)}
                                                        sx={{
                                                            color:"#ccc",
                                                            "&:hover":{ backgroundColor:"#000", color:"#fff" },
                                                            transition:"all 0.15s ease",
                                                        }}>
                                                        <Delete sx={{ fontSize:16 }} />
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

                {/* ── ADD DIALOG ──────────────────────────────── */}
                <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="md" fullWidth
                    PaperProps={{ sx: { borderRadius:0, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" } }}>
                    <DialogTitle sx={{ p:3, pb:2, borderBottom:"2px solid #000" }}>
                        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <Box>
                                <Typography sx={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.02em" }}>
                                    ADD NEW PRODUCT
                                </Typography>
                                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#aaa", letterSpacing:"0.06em" }}>
                                    CATALOG — NEW ENTRY
                                </Typography>
                            </Box>
                            <IconButton onClick={handleCloseAddDialog}
                                sx={{ color:"#000", "&:hover":{ backgroundColor:"#000", color:"#fff" }, transition:"all 0.15s" }}>
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ p:3 }}>
                        <ProductForm
                            formData={formData} formError={formError} setFormError={setFormError}
                            imagePreviews={imagePreviews} selectedColors={selectedColors}
                            selectedSizes={selectedSizes} variantGrid={variantGrid}
                            categories={categories} subCategories={subCategories}
                            handleCategoryChange={handleCategoryChange} margin={margin}
                            handleFormChange={handleFormChange} handleToggleColor={handleToggleColor}
                            handleToggleSize={handleToggleSize} handleUpdateVariant={handleUpdateVariant}
                            handleImagesChange={handleImagesChange} handleRemoveImage={handleRemoveImage}
                            isEdit={false}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p:3, gap:1.5, borderTop:"1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseAddDialog} variant="outlined" sx={cancelBtnSx}>Cancel</Button>
                        <Button onClick={handleAddProduct} disabled={formLoading || uploading}
                            sx={{
                                fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:12,
                                letterSpacing:"0.08em", textTransform:"uppercase", borderRadius:0,
                                px:5, py:1.2, backgroundColor:"#000", color:"#fff",
                                "&:hover":{ backgroundColor:"#222" },
                                "&:disabled":{ backgroundColor:"#e0e0e0", color:"#aaa" },
                            }}>
                            {formLoading || uploading
                                ? <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                                    <CircularProgress size={16} color="inherit" />
                                    <span>{uploading ? "Uploading..." : "Saving..."}</span>
                                  </Box>
                                : "Add Product"
                            }
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── EDIT DIALOG ──────────────────────────────── */}
                <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth
                    PaperProps={{ sx: { borderRadius:0, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" } }}>
                    <DialogTitle sx={{ p:3, pb:2, borderBottom:"2px solid #000" }}>
                        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <Box>
                                <Typography sx={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.02em" }}>
                                    EDIT PRODUCT
                                </Typography>
                                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#aaa", letterSpacing:"0.06em" }}>
                                    {selectedProduct?.productName}
                                </Typography>
                            </Box>
                            <IconButton onClick={handleCloseEditDialog}
                                sx={{ color:"#000", "&:hover":{ backgroundColor:"#000", color:"#fff" }, transition:"all 0.15s" }}>
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ p:3 }}>
                        <ProductForm
                            formData={formData} formError={formError} setFormError={setFormError}
                            imagePreviews={imagePreviews} selectedColors={selectedColors}
                            selectedSizes={selectedSizes} variantGrid={variantGrid}
                            categories={categories} subCategories={subCategories}
                            handleCategoryChange={handleCategoryChange} margin={margin}
                            handleFormChange={handleFormChange} handleToggleColor={handleToggleColor}
                            handleToggleSize={handleToggleSize} handleUpdateVariant={handleUpdateVariant}
                            handleImagesChange={handleImagesChange} handleRemoveImage={handleRemoveImage}
                            isEdit={true}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p:3, gap:1.5, borderTop:"1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseEditDialog} variant="outlined" sx={cancelBtnSx}>Cancel</Button>
                        <Button onClick={handleEditProduct} disabled={formLoading || uploading}
                            sx={{
                                fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:12,
                                letterSpacing:"0.08em", textTransform:"uppercase", borderRadius:0,
                                px:5, py:1.2, backgroundColor:"#000", color:"#fff",
                                "&:hover":{ backgroundColor:"#222" },
                                "&:disabled":{ backgroundColor:"#e0e0e0", color:"#aaa" },
                            }}>
                            {formLoading || uploading
                                ? <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                                    <CircularProgress size={16} color="inherit" />
                                    <span>{uploading ? "Uploading..." : "Saving..."}</span>
                                  </Box>
                                : "Save Changes"
                            }
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── DELETE DIALOG ────────────────────────────── */}
                <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth
                    PaperProps={{ sx: { borderRadius:0, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" } }}>
                    <DialogTitle sx={{ p:3, pb:2, borderBottom:"2px solid #000" }}>
                        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <Typography sx={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-0.01em" }}>
                                DELETE PRODUCT
                            </Typography>
                            <IconButton onClick={handleCloseDeleteDialog}
                                sx={{ color:"#000", "&:hover":{ backgroundColor:"#000", color:"#fff" }, transition:"all 0.15s" }}>
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ p:3 }}>
                        <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:3, p:2, border:"1px solid #e8e8e8" }}>
                            <Avatar variant="square" src={getImageUrl(selectedProduct?.imageUrl)}
                                sx={{ width:56, height:56, backgroundColor:"#f5f5f5", border:"1px solid #e8e8e8" }}>
                                <ImageIcon sx={{ color:"#ccc" }} />
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:14 }}>
                                    {selectedProduct?.productName}
                                </Typography>
                                <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:12, color:"#888" }}>
                                    ${(selectedProduct?.sellingPrice || selectedProduct?.price || 0).toFixed(2)}
                                </Typography>
                                {selectedProduct?.sku && (
                                    <Typography sx={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#bbb", mt:0.3 }}>
                                        {selectedProduct.sku}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Alert severity="warning">This action cannot be undone.</Alert>
                    </DialogContent>
                    <DialogActions sx={{ p:3, gap:1.5, borderTop:"1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={cancelBtnSx}>Cancel</Button>
                        <Button onClick={handleDeleteProduct} disabled={formLoading}
                            sx={{
                                fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:12,
                                letterSpacing:"0.08em", textTransform:"uppercase", borderRadius:0,
                                px:5, py:1.2, backgroundColor:"#000", color:"#fff",
                                "&:hover":{ backgroundColor:"#333" },
                                "&:disabled":{ backgroundColor:"#e0e0e0", color:"#aaa" },
                            }}>
                            {formLoading ? <CircularProgress size={16} color="inherit" /> : "Delete"}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </ThemeProvider>
    );
};

export default ProductList;