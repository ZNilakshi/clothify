import {
    Box, Button, TextField, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    MenuItem, InputAdornment, Tooltip, Switch, FormControlLabel,
    Grid, Autocomplete, CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    Delete, Add, Search, Close, CloudUpload, Inventory,
    Image as ImageIcon, Person, Phone, LocationOn,
    CheckCircle, Pending, Receipt as ReceiptIcon, AttachMoney,
    CreditCard, AccountBalance, Save, History, CalendarToday,
    Refresh,
} from "@mui/icons-material";
import { useState, useEffect, useCallback, useMemo } from "react";

/* ─── Google Fonts ───────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap";
if (!document.head.querySelector('link[href*="Syne"]')) document.head.appendChild(fontLink);

/* ─── API Base ───────────────────────────────────────────────── */
const API_BASE = "http://localhost:8080/api";

/* ─── Auth helper — reads JWT the same way ProductList does ──── */
const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

/* ─── Product API ────────────────────────────────────────────── */
const productApi = {
    getAll: async (search = "") => {
        const url = search
            ? `${API_BASE}/products?search=${encodeURIComponent(search)}`
            : `${API_BASE}/products`;
        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
        const data = await res.json();
        // Handle both paginated { content: [...] } and plain array responses
        return Array.isArray(data) ? data : (data.content ?? []);
    },
};

/* ─── API Service ────────────────────────────────────────────── */
const supplierApi = {
    getAll: async (name = "") => {
        const url = name ? `${API_BASE}/suppliers?name=${encodeURIComponent(name)}` : `${API_BASE}/suppliers`;
        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) throw new Error(`Failed to load suppliers (${res.status})`);
        return res.json();
    },
    create: async (data) => {
        const res = await fetch(`${API_BASE}/suppliers`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Failed to create supplier (${res.status})`);
        }
        return res.json();
    },
    update: async (id, data) => {
        const res = await fetch(`${API_BASE}/suppliers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Failed to update supplier (${res.status})`);
        return res.json();
    },
    delete: async (id) => {
        const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`Failed to delete supplier (${res.status})`);
    },
};

const purchaseOrderApi = {
    save: async (poData) => {
        const res = await fetch(`${API_BASE}/purchase-orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(poData),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Failed to save purchase order (${res.status})`);
        }
        return res.json();
    },
};

/* ─── Theme ──────────────────────────────────────────────────── */
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
                        fontFamily: "'DM Mono', monospace", fontSize: 13, borderRadius: 0,
                        "& fieldset": { borderColor: "#d8d8d8", borderWidth: 1 },
                        "&:hover fieldset": { borderColor: "#000", borderWidth: 1 },
                        "&.Mui-focused fieldset": { borderColor: "#000", borderWidth: 2 },
                    },
                    "& .MuiInputLabel-root": {
                        fontFamily: "'Syne', sans-serif", fontSize: 13,
                        letterSpacing: "0.04em", color: "#888",
                        "&.Mui-focused": { color: "#000" },
                    },
                    "& .MuiFormHelperText-root": { fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#999" },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontFamily: "'DM Mono', monospace", fontSize: 13,
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    "&.Mui-selected": { backgroundColor: "#000", color: "#fff", "&:hover": { backgroundColor: "#222" } },
                },
            },
        },
        MuiChip:       { styleOverrides: { root: { borderRadius: 0, fontFamily: "'DM Mono', monospace", fontSize: 11 } } },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 0, fontFamily: "'DM Mono', monospace", fontSize: 13, border: "1px solid #000" },
                standardSuccess: { backgroundColor: "#fff", borderColor: "#000", color: "#000", "& .MuiAlert-icon": { color: "#000" } },
                standardError:   { backgroundColor: "#fff", borderColor: "#000", color: "#000", "& .MuiAlert-icon": { color: "#000" } },
                standardWarning: { backgroundColor: "#fff", borderColor: "#888", color: "#000", "& .MuiAlert-icon": { color: "#555" } },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: { fontFamily: "'DM Mono', monospace", fontSize: 13, borderBottom: "1px solid #ebebeb", padding: "12px 14px" },
                head: {
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    backgroundColor: "#000", color: "#fff", borderBottom: "none", padding: "14px",
                },
            },
        },
        MuiPaper:      { styleOverrides: { root: { borderRadius: 0 } } },
        MuiDialog:     { styleOverrides: { paper: { borderRadius: 0 } } },
        MuiIconButton: { styleOverrides: { root: { borderRadius: 0 } } },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    "&.Mui-checked": { color: "#000" },
                    "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#000" },
                },
            },
        },
    },
});

/* ─── Static Data ────────────────────────────────────────────── */
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
const AVAILABLE_SIZES = ["XS","S","M","L","XL","XXL","XXXL","28","30","32","34","36","38","40","6","7","8","9","10","11","12","ONE SIZE"];
const UNITS = ["UNIT","KG","GRAM","LITER","METER","PIECE","BOX","PACK"];
const PAYMENT_METHODS = [
    { value: "CASH",          label: "Cash",          Icon: AttachMoney    },
    { value: "CHEQUE",        label: "Cheque",         Icon: ReceiptIcon    },
    { value: "BANK_TRANSFER", label: "Bank Transfer",  Icon: AccountBalance },
    { value: "CREDIT_CARD",   label: "Credit Card",    Icon: CreditCard     },
];
const PAYMENT_STATUS = [
    { value: "PAID",    label: "Paid",    Icon: CheckCircle },
    { value: "PARTIAL", label: "Partial", Icon: Pending     },
    { value: "PENDING", label: "Pending", Icon: Close       },
];
const PURCHASE_STATUS = [
    { value: "DRAFT",     label: "Draft"     },
    { value: "ORDERED",   label: "Ordered"   },
    { value: "RECEIVED",  label: "Received"  },
    { value: "CANCELLED", label: "Cancelled" },
];
const MOCK_CATEGORIES = [
    { categoryId: "1", categoryName: "Apparel"     },
    { categoryId: "2", categoryName: "Footwear"    },
    { categoryId: "3", categoryName: "Accessories" },
    { categoryId: "4", categoryName: "Electronics" },
];
const emptyNewForm = {
    productName: "", productDescription: "", unitPrice: "", sellingPrice: "",
    discount: "", discountPrice: "", categoryId: "", subCategoryId: "",
    initialStock: "", reorderLevel: "", unitOfMeasure: "UNIT", sku: "",
};

/* ─── Shared Helpers ─────────────────────────────────────────── */
const btnSx  = { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 0 };
const cancelSx = { ...btnSx, border: "1px solid #e0e0e0", color: "#555", px: 4, py: 1.2, "&:hover": { border: "1px solid #000", color: "#000", backgroundColor: "#f5f5f5" } };
const primaryBtnSx = { ...btnSx, px: 5, py: 1.2, backgroundColor: "#000", color: "#fff", "&:hover": { backgroundColor: "#222" }, "&:disabled": { backgroundColor: "#e0e0e0", color: "#aaa" } };

/* ─── DateInput ──────────────────────────────────────────────── */
const DateInput = ({ label, value, onChange }) => {
    const fmt = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
    };
    return (
        <TextField label={label} type="date" value={fmt(value)}
            onChange={e => onChange(e.target.value ? new Date(e.target.value) : null)}
            fullWidth size="small" InputLabelProps={{ shrink: true }}
            InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday sx={{ fontSize: 16, color: "#aaa" }} /></InputAdornment> }}
        />
    );
};

/* ─── SectionTitle ───────────────────────────────────────────── */
const SectionTitle = ({ children, number }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5, mt: 3.5, "&:first-of-type": { mt: 0 } }}>
        <Box sx={{ width: 28, height: 28, backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
            {number}
        </Box>
        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#000" }}>
            {children}
        </Typography>
        <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#e8e8e8" }} />
    </Box>
);

/* ─── ColorSelector ──────────────────────────────────────────── */
const ColorSelector = ({ selectedColors, onToggleColor }) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {AVAILABLE_COLORS.map((c) => {
            const sel = selectedColors.includes(c.value);
            return (
                <Tooltip key={c.value} title={c.label} arrow>
                    <Box onClick={() => onToggleColor(c.value)} sx={{
                        width: 34, height: 34, backgroundColor: c.hex,
                        border: sel ? "3px solid #000" : "1px solid #ddd",
                        cursor: "pointer", outline: sel ? "1px solid #000" : "none", outlineOffset: "2px",
                        transition: "all 0.15s ease", "&:hover": { transform: "scale(1.12)" },
                    }} />
                </Tooltip>
            );
        })}
    </Box>
);

/* ─── SizeSelector ───────────────────────────────────────────── */
const SizeSelector = ({ selectedSizes, onToggleSize }) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {AVAILABLE_SIZES.map((s) => {
            const sel = selectedSizes.includes(s);
            return (
                <Box key={s} onClick={() => onToggleSize(s)} sx={{
                    px: 1.5, py: 0.6,
                    border: sel ? "2px solid #000" : "1px solid #ddd",
                    backgroundColor: sel ? "#000" : "#fff", color: sel ? "#fff" : "#555",
                    fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": { borderColor: "#000", backgroundColor: sel ? "#222" : "#f5f5f5" },
                }}>{s}</Box>
            );
        })}
    </Box>
);

/* ─── VariantGrid ────────────────────────────────────────────── */
const VariantGrid = ({ selectedColors, selectedSizes, variantGrid, onUpdateVariant }) => {
    const total = useMemo(() =>
        Object.values(variantGrid).reduce((s, c) => s + (parseInt(c.qty) || 0), 0), [variantGrid]);
    return (
        <>
            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", mb: 1.5, display: "block" }}>
                Step 3 — Enter Quantities
            </Typography>
            <Box sx={{ border: "1px solid #e8e8e8", overflow: "auto", mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 120 }}>Color \ Size</TableCell>
                            {selectedSizes.map(s => <TableCell key={s} align="center" sx={{ minWidth: 72 }}>{s}</TableCell>)}
                            <TableCell align="center" sx={{ color: "#ccc !important" }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedColors.map((colorVal) => {
                            const colorDef = AVAILABLE_COLORS.find(c => c.value === colorVal);
                            const rowTotal = selectedSizes.reduce((sum, sv) =>
                                sum + (parseInt(variantGrid[`${colorVal}_${sv}`]?.qty) || 0), 0);
                            return (
                                <TableRow key={colorVal} sx={{ "&:hover": { backgroundColor: "#fafafa" } }}>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{ width: 14, height: 14, backgroundColor: colorDef?.hex, border: "1px solid #ccc", flexShrink: 0 }} />
                                            <span>{colorDef?.label}</span>
                                        </Box>
                                    </TableCell>
                                    {selectedSizes.map(sizeVal => {
                                        const key = `${colorVal}_${sizeVal}`;
                                        const qty = variantGrid[key]?.qty || "";
                                        return (
                                            <TableCell key={sizeVal} align="center" sx={{ p: 0.5 }}>
                                                <TextField placeholder="0" type="number" value={qty}
                                                    onChange={e => onUpdateVariant(colorVal, sizeVal, e.target.value)}
                                                    size="small"
                                                    inputProps={{ min: "0", style: { textAlign: "center", padding: "7px 4px", fontSize: 13 } }}
                                                    sx={{ width: 66, "& .MuiOutlinedInput-root": { borderRadius: 0, backgroundColor: qty && parseInt(qty) > 0 ? "#f5f5f5" : "#fff" } }}
                                                />
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell align="center">
                                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: rowTotal > 0 ? "#000" : "#ccc" }}>
                                            {rowTotal || "—"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow sx={{ backgroundColor: "#000" }}>
                            <TableCell sx={{ color: "#fff !important", fontWeight: "700 !important", fontSize: "11px !important", letterSpacing: "0.1em !important", textTransform: "uppercase", borderBottom: "none !important" }}>
                                Total Stock
                            </TableCell>
                            {selectedSizes.map(sizeVal => {
                                const colTotal = selectedColors.reduce((sum, cv) =>
                                    sum + (parseInt(variantGrid[`${cv}_${sizeVal}`]?.qty) || 0), 0);
                                return (
                                    <TableCell key={sizeVal} align="center" sx={{ color: "#fff !important", fontFamily: "'Syne', sans-serif !important", fontWeight: "700 !important", borderBottom: "none !important" }}>
                                        {colTotal || "—"}
                                    </TableCell>
                                );
                            })}
                            <TableCell align="center" sx={{ color: "#fff !important", fontFamily: "'Syne', sans-serif !important", fontWeight: "800 !important", fontSize: "16px !important", borderBottom: "none !important" }}>
                                {total}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        </>
    );
};

/* ─── ProductForm ────────────────────────────────────────────── */
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
            {formError && <Alert severity="error" sx={{ mb: 3 }}>✕&nbsp;&nbsp;{formError}</Alert>}
            <SectionTitle number="01">Product Images</SectionTitle>
            <Box sx={{ mb: 1 }}>
                <Button variant="outlined" component="label"
                    startIcon={<CloudUpload sx={{ fontSize: 16 }} />}
                    sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: 0, border: "2px dashed #ccc", color: "#000", px: 3, py: 1.5, mb: 1.5, "&:hover": { border: "2px dashed #000", backgroundColor: "#f5f5f5" } }}>
                    Select Images ({imagePreviews.length}/6)
                    <input type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
                </Button>
                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#bbb", letterSpacing: "0.04em", mb: 2.5, display: "block" }}>
                    First image = primary · Max 5 MB · JPG / PNG / GIF
                </Typography>
                {imagePreviews.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {imagePreviews.map((src, idx) => (
                            <Box key={idx} sx={{ position: "relative", transition: "transform 0.15s", "&:hover": { transform: "translateY(-2px)" } }}>
                                <Box component="img" src={src} sx={{ width: 88, height: 88, objectFit: "cover", display: "block", border: idx === 0 ? "3px solid #000" : "1px solid #e0e0e0", filter: idx === 0 ? "none" : "grayscale(15%)" }} />
                                {idx === 0 && <Box sx={{ position: "absolute", bottom: 0, left: 0, backgroundColor: "#000", color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: "0.08em", px: 0.8, py: 0.3 }}>PRIMARY</Box>}
                                <IconButton size="small" onClick={() => handleRemoveImage(idx)} sx={{ position: "absolute", top: -9, right: -9, width: 22, height: 22, backgroundColor: "#000", color: "#fff", borderRadius: 0, "&:hover": { backgroundColor: "#333" } }}>
                                    <Close sx={{ fontSize: 12 }} />
                                </IconButton>
                            </Box>
                        ))}
                        {imagePreviews.length < 6 && (
                            <Button variant="outlined" component="label" sx={{ width: 88, height: 88, borderRadius: 0, border: "1px dashed #ccc", display: "flex", flexDirection: "column", gap: 0.5, color: "#bbb", minWidth: 0, "&:hover": { border: "1px dashed #000", color: "#000" } }}>
                                <ImageIcon sx={{ fontSize: 20 }} />
                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 9 }}>add</Typography>
                                <input type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
                            </Button>
                        )}
                    </Box>
                )}
            </Box>
            <SectionTitle number="02">Basic Information</SectionTitle>
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={8}>
                    <TextField label="Product Name" value={formData.productName}
                        onChange={e => { handleFormChange("productName", e.target.value); setFormError(""); }}
                        fullWidth required size="small" />
                </Grid>
                <Grid item xs={4}>
                    <TextField label="SKU" value={formData.sku} onChange={e => handleFormChange("sku", e.target.value)} fullWidth size="small" placeholder="e.g. PROD-001" />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Description" value={formData.productDescription} onChange={e => handleFormChange("productDescription", e.target.value)} fullWidth multiline rows={2} size="small" />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Category" value={formData.categoryId} onChange={e => handleCategoryChange(e.target.value)} select fullWidth required size="small">
                        {categories.map(c => <MenuItem key={c.categoryId} value={c.categoryId}>{c.categoryName}</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Sub Category" value={formData.subCategoryId} onChange={e => handleFormChange("subCategoryId", e.target.value)} select fullWidth size="small" disabled={!formData.categoryId || subCategories.length === 0}>
                        <MenuItem value="">None</MenuItem>
                        {subCategories.map(sc => <MenuItem key={sc.subCategoryId} value={sc.subCategoryId}>{sc.subCategoryName}</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Unit of Measure" value={formData.unitOfMeasure} onChange={e => handleFormChange("unitOfMeasure", e.target.value)} select fullWidth size="small">
                        {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Reorder Level" type="number" value={formData.reorderLevel} onChange={e => handleFormChange("reorderLevel", e.target.value)} fullWidth size="small" inputProps={{ min: "0" }} />
                </Grid>
            </Grid>
            <SectionTitle number="03">Pricing</SectionTitle>
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4}>
                    <TextField label="Unit Price (Cost)" type="number" value={formData.unitPrice} onChange={e => handleFormChange("unitPrice", e.target.value)} fullWidth size="small" inputProps={{ step: "0.01", min: "0" }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#888" }}>$</Typography></InputAdornment> }} helperText="Purchase / cost price" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField label="Selling Price" type="number" value={formData.sellingPrice} onChange={e => handleFormChange("sellingPrice", e.target.value)} fullWidth required size="small" inputProps={{ step: "0.01", min: "0" }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#888" }}>$</Typography></InputAdornment> }} helperText="Customer pays" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Box sx={{ border: "1px solid", borderColor: marginStatus === "loss" ? "#000" : "#e0e0e0", px: 2, height: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: marginStatus === "loss" ? "#000" : "#fafafa", transition: "all 0.3s ease" }}>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: marginStatus === "loss" ? "#fff" : "#888" }}>Margin</Typography>
                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: marginStatus === "loss" ? "#fff" : "#000" }}>
                            {margin === null ? "—" : `${margin}%`}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#888", px: 0.5, mt: 0.5, display: "block" }}>
                        {marginStatus === "neutral" ? "Enter both prices" : marginStatus === "loss" ? "⚠ Selling below cost" : marginStatus === "low" ? "⚠ Low margin (<20%)" : "✓ Healthy margin"}
                    </Typography>
                </Grid>
            </Grid>
            <SectionTitle number="04">Product Variants</SectionTitle>
            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", mb: 1.5, display: "block" }}>Step 1 — Select Colors</Typography>
            <ColorSelector selectedColors={selectedColors} onToggleColor={handleToggleColor} />
            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", mb: 1.5, display: "block" }}>Step 2 — Select Sizes</Typography>
            <SizeSelector selectedSizes={selectedSizes} onToggleSize={handleToggleSize} />
            {selectedColors.length > 0 && selectedSizes.length > 0 ? (
                <VariantGrid selectedColors={selectedColors} selectedSizes={selectedSizes} variantGrid={variantGrid} onUpdateVariant={handleUpdateVariant} />
            ) : (
                <Box sx={{ p: 3, border: "2px dashed #e8e8e8", textAlign: "center", mb: 2, backgroundColor: "#fafafa" }}>
                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#bbb" }}>
                        {selectedColors.length === 0 && selectedSizes.length === 0 ? "Select colors and sizes above to build the variant table"
                            : selectedColors.length === 0 ? "← Select at least one color" : "← Select at least one size"}
                    </Typography>
                </Box>
            )}
            {selectedColors.length === 0 && !isEdit && (
                <TextField label="Initial Stock" type="number" value={formData.initialStock} onChange={e => handleFormChange("initialStock", e.target.value)} size="small" inputProps={{ min: "0" }} sx={{ width: 200, mt: 1 }} helperText="Skip if using variants above" />
            )}
            {isEdit && (
                <Box sx={{ mt: 3, p: 2, border: "1px solid #e8e8e8", backgroundColor: "#fafafa" }}>
                    <FormControlLabel
                        control={<Switch checked={formData.isActive} onChange={e => handleFormChange("isActive", e.target.checked)} />}
                        label={<Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>{formData.isActive ? "✓ Product is Active" : "✗ Product is Inactive"}</Typography>}
                    />
                </Box>
            )}
        </Box>
    );
};

/* ══════════════════════════════════════════════════════════════
   ADD ITEM DIALOG
══════════════════════════════════════════════════════════════ */
const AddItemDialog = ({ open, onClose, onAdd }) => {
    const [mode, setMode]             = useState("search");
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults]       = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError,   setProductsError]   = useState("");
    const [selected, setSelected]     = useState(null);
    const [step, setStep]             = useState(1);
    const [selColors, setSelColors]   = useState([]);
    const [selSizes,  setSelSizes]    = useState([]);
    const [varGrid,   setVarGrid]     = useState({});
    const [simpleQty, setSimpleQty]   = useState(1);
    const [overridePrice, setOverridePrice] = useState("");
    const [formData,      setFormData]      = useState(emptyNewForm);
    const [formError,     setFormError]     = useState("");
    const [imageFiles,    setImageFiles]    = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes,  setSelectedSizes]  = useState([]);
    const [variantGrid,    setVariantGrid]    = useState({});

    const margin = useMemo(() => {
        const unit = parseFloat(formData.unitPrice), sell = parseFloat(formData.sellingPrice);
        if (!unit || !sell || unit <= 0) return null;
        return (((sell - unit) / sell) * 100).toFixed(1);
    }, [formData.unitPrice, formData.sellingPrice]);

    const calcDiscountPrice = useCallback((sp, disc) => {
        const s = parseFloat(sp), d = parseFloat(disc);
        if (!s || !d || d <= 0) return "";
        return (s - (s * d / 100)).toFixed(2);
    }, []);

    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => {
            if (field === "sellingPrice" || field === "discount") {
                const sp = field === "sellingPrice" ? value : prev.sellingPrice;
                const di = field === "discount" ? value : prev.discount;
                return { ...prev, [field]: value, discountPrice: calcDiscountPrice(sp, di) };
            }
            return { ...prev, [field]: value };
        });
    }, [calcDiscountPrice]);

    const handleToggleColor   = useCallback((v) => setSelectedColors(p => p.includes(v) ? p.filter(c => c !== v) : [...p, v]), []);
    const handleToggleSize    = useCallback((v) => setSelectedSizes(p =>  p.includes(v) ? p.filter(s => s !== v) : [...p, v]),  []);
    const handleUpdateVariant = useCallback((cv, sv, val) =>
        setVariantGrid(p => ({ ...p, [`${cv}_${sv}`]: { qty: val } })), []);

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
        if (imageFiles.length + files.length > 6) { setFormError("Max 6 images"); return; }
        setImageFiles(p => [...p, ...files]);
        setImagePreviews(p => [...p, ...files.map(URL.createObjectURL)]);
    };
    const handleRemoveImage = (idx) => {
        setImageFiles(p => p.filter((_, i) => i !== idx));
        setImagePreviews(p => p.filter((_, i) => i !== idx));
    };

    // Load products from API — debounced on searchTerm, triggered when dialog opens
    useEffect(() => {
        if (!open || mode !== "search") return;
        setProductsError("");
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setProductsLoading(true);
            try {
                const data = await productApi.getAll(searchTerm);
                if (!controller.signal.aborted) setResults(data);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setProductsError(err.message);
                    setResults([]);
                }
            } finally {
                if (!controller.signal.aborted) setProductsLoading(false);
            }
        }, 350);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [searchTerm, open, mode]);

    const reset = () => {
        setMode("search"); setStep(1); setSelected(null); setSearchTerm(""); setResults([]);
        setProductsLoading(false); setProductsError("");
        setSelColors([]); setSelSizes([]); setVarGrid({}); setSimpleQty(1); setOverridePrice("");
        setFormData(emptyNewForm); setFormError(""); setImageFiles([]); setImagePreviews([]);
        setSelectedColors([]); setSelectedSizes([]); setVariantGrid({});
    };
    const handleClose = () => { onClose(); reset(); };
    const handleSelectProduct = (p) => { setSelected(p); setOverridePrice(String(p.unitPrice)); setStep(2); };

    const variantTotal   = useMemo(() => Object.values(varGrid).reduce((s, v) => s + (parseInt(v?.qty) || 0), 0), [varGrid]);
    const gridTotalStock = useMemo(() => Object.values(variantGrid).reduce((s, c) => s + (parseInt(c.qty) || 0), 0), [variantGrid]);

    const handleConfirmSearch = () => {
        if (!selected) return;
        const price = parseFloat(overridePrice) || selected.unitPrice;
        if (selColors.length > 0 && selSizes.length > 0) {
            selColors.forEach(cv => selSizes.forEach(sv => {
                const qty = parseInt(varGrid[`${cv}_${sv}`]?.qty) || 0;
                if (qty > 0) {
                    const cd = AVAILABLE_COLORS.find(c => c.value === cv);
                    onAdd({ productId: selected.productId, productName: `${selected.productName} / ${cd?.label} / ${sv}`, sku: `${selected.sku}-${cv}-${sv}`, unitPrice: price, quantity: qty, total: price * qty });
                }
            }));
        } else {
            onAdd({ productId: selected.productId, productName: selected.productName, sku: selected.sku, unitPrice: price, quantity: simpleQty, total: price * simpleQty });
        }
        handleClose();
    };

    const handleConfirmNew = () => {
        if (!formData.productName.trim()) { setFormError("Product name is required"); return; }
        if (!formData.sellingPrice)       { setFormError("Selling price is required"); return; }
        const price = parseFloat(formData.unitPrice) || 0;
        const hasVariants = selectedColors.length > 0 && selectedSizes.length > 0;
        if (hasVariants && gridTotalStock > 0) {
            selectedColors.forEach(cv => selectedSizes.forEach(sv => {
                const qty = parseInt(variantGrid[`${cv}_${sv}`]?.qty) || 0;
                if (qty > 0) {
                    const cd = AVAILABLE_COLORS.find(c => c.value === cv);
                    onAdd({ productId: `new_${Date.now()}_${cv}_${sv}`, productName: `${formData.productName} / ${cd?.label} / ${sv}`, sku: (formData.sku || `MAN-${Date.now().toString().slice(-4)}`) + `-${cv}-${sv}`, unitPrice: price, quantity: qty, total: price * qty });
                }
            }));
        } else {
            const qty = parseInt(formData.initialStock) || 1;
            onAdd({ productId: `new_${Date.now()}`, productName: formData.productName, sku: formData.sku || `MAN-${Date.now().toString().slice(-5)}`, unitPrice: price, quantity: qty, total: price * qty });
        }
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}>
            <DialogTitle sx={{ p: 3, pb: 2, borderBottom: "2px solid #000" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>ADD ITEM TO ORDER</Typography>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.06em" }}>
                            {mode === "search" ? (step === 1 ? "STEP 1 — SELECT FROM CATALOG" : `STEP 2 — CONFIGURE · ${selected?.productName}`) : "NEW PRODUCT — CATALOG ENTRY"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0, mt: 2 }}>
                            {[["search","Search Catalog"],["new","New Product"]].map(([val, label]) => (
                                <Box key={val} onClick={() => { setMode(val); setStep(1); setSelected(null); }}
                                    sx={{ px: 2.5, py: 0.8, cursor: "pointer", backgroundColor: mode === val ? "#000" : "transparent", color: mode === val ? "#fff" : "#888", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid", borderColor: mode === val ? "#000" : "#e0e0e0", transition: "all 0.15s", "&:hover": mode !== val ? { borderColor: "#000", color: "#000" } : {} }}>
                                    {label}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <IconButton onClick={handleClose} sx={{ color: "#000", "&:hover": { backgroundColor: "#000", color: "#fff" }, transition: "all 0.15s" }}><Close /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {mode === "search" && step === 1 && (
                    <Box>
                        <Box sx={{ border: "2px solid #000", display: "flex", mb: 3, backgroundColor: "#fff" }}>
                            <Box sx={{ display: "flex", alignItems: "center", px: 2 }}><Search sx={{ color: "#bbb", fontSize: 20 }} /></Box>
                            <TextField value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, SKU, or category..." fullWidth InputProps={{ sx: { "& .MuiOutlinedInput-notchedOutline": { border: "none" } } }} />
                            {searchTerm && <IconButton onClick={() => setSearchTerm("")} sx={{ mx: 0.5 }}><Close sx={{ fontSize: 16 }} /></IconButton>}
                        </Box>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa", letterSpacing: "0.06em", mb: 1.5 }}>
                            {productsLoading ? "LOADING…" : `${results.length} PRODUCT${results.length !== 1 ? "S" : ""} FOUND`}
                        </Typography>

                        {productsError && (
                            <Alert severity="warning" sx={{ mb: 2 }}>⚠&nbsp;&nbsp;{productsError}</Alert>
                        )}

                        {productsLoading ? (
                            <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                <CircularProgress size={32} sx={{ color: "#000" }} />
                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#aaa" }}>Loading products…</Typography>
                            </Box>
                        ) : results.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: "center" }}>
                                <Inventory sx={{ fontSize: 48, color: "#e0e0e0", mb: 2 }} />
                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>No products found</Typography>
                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#aaa", mt: 1 }}>Try a different search or switch to "New Product"</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 1.5 }}>
                                {results.map(p => (
                                    <Box key={p.productId} onClick={() => handleSelectProduct(p)} sx={{ border: "1px solid #e8e8e8", backgroundColor: "#fff", cursor: "pointer", transition: "all 0.15s", position: "relative", "&:hover": { border: "2px solid #000" }, "&:hover .sel-overlay": { opacity: 1 } }}>
                                        <Box sx={{ height: 96, backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #f0f0f0", position: "relative" }}>
                                            <ImageIcon sx={{ fontSize: 34, color: "#ddd" }} />
                                            {p.hasVariants && <Box sx={{ position: "absolute", top: 6, right: 6, backgroundColor: "#000", color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: "0.06em", px: 0.8, py: 0.3 }}>VARIANTS</Box>}
                                        </Box>
                                        <Box sx={{ p: 1.5 }}>
                                            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, lineHeight: 1.3, mb: 0.5 }}>{p.productName}</Typography>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                                <Box sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", border: "1px solid #eee", px: 0.8, py: 0.2 }}>{p.sku}</Box>
                                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#888" }}>{p.categoryName}</Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14 }}>${p.unitPrice?.toFixed(2)}</Typography>
                                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: p.stockQuantity > 20 ? "#22c55e" : "#888" }}>{p.stockQuantity} in stock</Typography>
                                            </Box>
                                        </Box>
                                        <Box className="sel-overlay" sx={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}>
                                            <Box sx={{ backgroundColor: "#000", color: "#fff", px: 2, py: 0.8, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em" }}>SELECT →</Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
                {mode === "search" && step === 2 && selected && (
                    <Box>
                        <Box sx={{ border: "2px solid #000", display: "flex", alignItems: "center", gap: 2, p: 2, mb: 3 }}>
                            <Box sx={{ width: 48, height: 48, backgroundColor: "#f5f5f5", border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <ImageIcon sx={{ color: "#ddd", fontSize: 20 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>{selected.productName}</Typography>
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Box sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", border: "1px solid #eee", px: 0.8, py: 0.2, display: "inline-block" }}>{selected.sku}</Box>
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888" }}>{selected.categoryName}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>${selected.unitPrice.toFixed(2)}</Typography>
                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa" }}>cost price</Typography>
                            </Box>
                            <Button onClick={() => { setStep(1); setSelected(null); setSelColors([]); setSelSizes([]); setVarGrid({}); }} sx={{ ...btnSx, border: "1px solid #e0e0e0", color: "#555", px: 2, py: 1, "&:hover": { border: "1px solid #000", color: "#000" } }}>← Change</Button>
                        </Box>
                        <SectionTitle number="01">Purchase Unit Price</SectionTitle>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 0.5 }}>
                            <TextField label="Unit Price" type="number" value={overridePrice} onChange={e => setOverridePrice(e.target.value)} size="small" sx={{ width: 160 }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#888" }}>$</Typography></InputAdornment> }} />
                            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa" }}>
                                Selling price: <strong style={{ color: "#000" }}>${selected.sellingPrice.toFixed(2)}</strong>
                                {overridePrice && parseFloat(overridePrice) > 0 ? ` · Margin: ${(((selected.sellingPrice - parseFloat(overridePrice)) / selected.sellingPrice) * 100).toFixed(1)}%` : ""}
                            </Typography>
                        </Box>
                        {/* ── Colors ── */}
                        <SectionTitle number="02">Colors <Box component="span" sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</Box></SectionTitle>
                        <ColorSelector selectedColors={selColors} onToggleColor={v => setSelColors(p => p.includes(v) ? p.filter(c => c !== v) : [...p, v])} />

                        {/* ── Sizes ── */}
                        <SectionTitle number="03">Sizes <Box component="span" sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</Box></SectionTitle>
                        <SizeSelector selectedSizes={selSizes} onToggleSize={v => setSelSizes(p => p.includes(v) ? p.filter(s => s !== v) : [...p, v])} />

                        {/* ── Variant grid — shown when both colors AND sizes are picked ── */}
                        {selColors.length > 0 && selSizes.length > 0 ? (
                            <>
                                <VariantGrid
                                    selectedColors={selColors} selectedSizes={selSizes}
                                    variantGrid={varGrid}
                                    onUpdateVariant={(cv, sv, val) => setVarGrid(p => ({ ...p, [`${cv}_${sv}`]: { qty: val } }))}
                                />
                                {variantTotal > 0 && (
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                                        <Box sx={{ border: "1px solid #000", px: 2.5, py: 1.2, display: "flex", gap: 2, alignItems: "baseline" }}>
                                            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888" }}>TOTAL UNITS</Typography>
                                            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22 }}>{variantTotal}</Typography>
                                            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888" }}>= ${((parseFloat(overridePrice) || selected.unitPrice) * variantTotal).toFixed(2)}</Typography>
                                        </Box>
                                    </Box>
                                )}
                            </>
                        ) : (
                            /* ── Simple qty — shown when no variant grid is active ── */
                            <>
                                <SectionTitle number="04">Quantity</SectionTitle>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <TextField
                                        label="Quantity" type="number" value={simpleQty}
                                        onChange={e => setSimpleQty(Math.max(1, parseInt(e.target.value) || 1))}
                                        size="small" sx={{ width: 120 }}
                                        inputProps={{ min: 1, style: { textAlign: "center" } }}
                                    />
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>
                                        Subtotal:&nbsp;<strong style={{ color: "#000" }}>${((parseFloat(overridePrice) || selected.unitPrice) * simpleQty).toFixed(2)}</strong>
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#bbb", mt: 1 }}>
                                    ↑ Select colors + sizes above to enter per-variant quantities instead
                                </Typography>
                            </>
                        )}
                    </Box>
                )}
                {mode === "new" && (
                    <ProductForm formData={formData} formError={formError} setFormError={setFormError} imagePreviews={imagePreviews} selectedColors={selectedColors} selectedSizes={selectedSizes} variantGrid={variantGrid} categories={MOCK_CATEGORIES} subCategories={[]} handleCategoryChange={v => handleFormChange("categoryId", v)} margin={margin} handleFormChange={handleFormChange} handleToggleColor={handleToggleColor} handleToggleSize={handleToggleSize} handleUpdateVariant={handleUpdateVariant} handleImagesChange={handleImagesChange} handleRemoveImage={handleRemoveImage} isEdit={false} />
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "2px solid #000" }}>
                {mode === "search" && step === 2 && (
                    <Button onClick={() => { setStep(1); setSelected(null); setSelColors([]); setSelSizes([]); setVarGrid({}); }} sx={cancelSx}>← Back</Button>
                )}
                <Box sx={{ flex: 1 }} />
                <Button onClick={handleClose} sx={cancelSx}>Cancel</Button>
                {mode === "search" && step === 1 && (
                    <Button disabled sx={{ ...btnSx, px: 5, py: 1.2, backgroundColor: "#e0e0e0", color: "#aaa" }}>Select a Product →</Button>
                )}
                {mode === "search" && step === 2 && (
                    <Button onClick={handleConfirmSearch}
                        disabled={selColors.length > 0 && selSizes.length > 0 ? variantTotal === 0 : simpleQty < 1}
                        sx={primaryBtnSx}>
                        Add to Order →
                    </Button>
                )}
                {mode === "new" && (
                    <Button onClick={handleConfirmNew} disabled={!formData.productName || !formData.sellingPrice} sx={primaryBtnSx}>
                        Add to Order →
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

/* ══════════════════════════════════════════════════════════════
   NEW SUPPLIER DIALOG  —  with real API
══════════════════════════════════════════════════════════════ */
const NewSupplierDialog = ({ open, onClose, onSave }) => {
    const emptyForm = { name: "", phone: "", email: "", address: "", taxId: "", paymentTerms: "" };
    const [f, setF]           = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState("");

    const handleClose = () => { setF(emptyForm); setError(""); onClose(); };

    const handleSave = async () => {
        if (!f.name.trim()) { setError("Supplier name is required."); return; }
        setSaving(true); setError("");
        try {
            const saved = await supplierApi.create(f);
            onSave(saved);   // pass the real saved object (with supplierId) to parent
            handleClose();
        } catch (err) {
            setError(err.message || "Failed to save supplier. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}>
            <DialogTitle sx={{ p: 3, pb: 2, borderBottom: "2px solid #000" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>ADD SUPPLIER</Typography>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.06em" }}>NEW VENDOR ENTRY</Typography>
                    </Box>
                    <IconButton onClick={handleClose} sx={{ color: "#000", "&:hover": { backgroundColor: "#000", color: "#fff" } }}><Close /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
                        ✕&nbsp;&nbsp;{error}
                    </Alert>
                )}
                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        <TextField label="Supplier Name *" value={f.name} onChange={e => { setF({ ...f, name: e.target.value }); setError(""); }} fullWidth size="small"
                            error={!!error && !f.name.trim()}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 16, color: "#aaa" }} /></InputAdornment> }} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Phone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} fullWidth size="small"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 16, color: "#aaa" }} /></InputAdornment> }} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Email" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Address" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} fullWidth size="small" multiline rows={2}
                            InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ fontSize: 16, color: "#aaa" }} /></InputAdornment> }} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Tax ID / GST" value={f.taxId} onChange={e => setF({ ...f, taxId: e.target.value })} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Payment Terms" value={f.paymentTerms} onChange={e => setF({ ...f, paymentTerms: e.target.value })} fullWidth size="small" placeholder="e.g. Net 30" />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "1px solid #e8e8e8" }}>
                <Button onClick={handleClose} disabled={saving} sx={cancelSx}>Cancel</Button>
                <Button onClick={handleSave} disabled={!f.name.trim() || saving}
                    sx={{ ...btnSx, px: 5, py: 1.2, backgroundColor: "#000", color: "#fff", "&:hover": { backgroundColor: "#222" }, "&:disabled": { backgroundColor: "#e0e0e0", color: "#aaa" } }}>
                    {saving ? <><CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />Saving…</> : "Save Supplier"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ══════════════════════════════════════════════════════════════
   PURCHASE ORDER  —  main page
══════════════════════════════════════════════════════════════ */
const PurchaseOrder = () => {
    const [activeStep, setActiveStep] = useState(0);

    /* ── Supplier state ───────────────────────────────────────── */
    const [suppliers,         setSuppliers]         = useState([]);
    const [suppliersLoading,  setSuppliersLoading]  = useState(true);
    const [suppliersError,    setSuppliersError]    = useState("");
    const [selectedSupplier,  setSelectedSupplier]  = useState(null);
    const [supplierDialog,    setSupplierDialog]    = useState(false);
    const [supplierSearch,    setSupplierSearch]    = useState("");

    /* ── Dialog + alert state ─────────────────────────────────── */
    const [addItemDialog, setAddItemDialog] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });
    const [isSaving, setIsSaving] = useState(false);

    /* ── PO state ─────────────────────────────────────────────── */
    const [po, setPo] = useState({
        referenceNo: `PO-${Date.now().toString().slice(-6)}`,
        purchaseDate: new Date(), expectedDelivery: null,
        status: "DRAFT", notes: "", items: [],
        payment: { method: "CASH", status: "PENDING", paidAmount: 0, transactionId: "", chequeNo: "", bankName: "", dueDate: null },
        subtotal: 0, tax: 0, discount: 0, shipping: 0, total: 0,
    });

    /* ── Load suppliers from API ──────────────────────────────── */
    const loadSuppliers = useCallback(async (name = "") => {
        setSuppliersLoading(true); setSuppliersError("");
        try {
            const data = await supplierApi.getAll(name);
            setSuppliers(data);
        } catch (err) {
            setSuppliersError(err.message || "Failed to load suppliers");
            // Fallback to empty list so UI still works
            setSuppliers([]);
        } finally {
            setSuppliersLoading(false);
        }
    }, []);

    useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

    // Debounced search: re-fetch when supplier search term changes
    useEffect(() => {
        const t = setTimeout(() => loadSuppliers(supplierSearch), 350);
        return () => clearTimeout(t);
    }, [supplierSearch, loadSuppliers]);

    /* ── Totals ───────────────────────────────────────────────── */
    useEffect(() => {
        const sub = po.items.reduce((s, i) => s + (i.total || 0), 0);
        const tax = sub * 0.1;
        setPo(p => ({ ...p, subtotal: sub, tax, total: Math.max(0, sub + tax + p.shipping - p.discount) }));
    }, [po.items, po.shipping, po.discount]);

    const showAlert = (msg, sev = "success") => {
        setAlert({ show: true, message: msg, severity: sev });
        setTimeout(() => setAlert({ show: false, message: "", severity: "success" }), 4500);
    };

    /* ── Item CRUD ────────────────────────────────────────────── */
    const handleAddItem = (item) => setPo(p => ({ ...p, items: [...p.items, { ...item, itemId: `item_${Date.now()}_${Math.random()}` }] }));
    const updateQty     = (id, qty)   => setPo(p => ({ ...p, items: p.items.map(i => i.itemId === id ? { ...i, quantity: qty,   total: i.unitPrice * qty   } : i) }));
    const updatePrice   = (id, price) => setPo(p => ({ ...p, items: p.items.map(i => i.itemId === id ? { ...i, unitPrice: price, total: price * i.quantity } : i) }));
    const removeItem    = (id)        => setPo(p => ({ ...p, items: p.items.filter(i => i.itemId !== id) }));

    /* ── Save PO ──────────────────────────────────────────────── */
    const handleSavePO = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...po,
                supplierId: selectedSupplier?.supplierId,
                purchaseDate: po.purchaseDate?.toISOString(),
                expectedDelivery: po.expectedDelivery?.toISOString() || null,
            };
            await purchaseOrderApi.save(payload);
            showAlert("Purchase order saved successfully!");
        } catch (err) {
            showAlert(err.message || "Failed to save purchase order.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmPO = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...po,
                status: "ORDERED",
                supplierId: selectedSupplier?.supplierId,
                purchaseDate: po.purchaseDate?.toISOString(),
                expectedDelivery: po.expectedDelivery?.toISOString() || null,
            };
            await purchaseOrderApi.save(payload);
            setPo(p => ({ ...p, status: "ORDERED" }));
            showAlert("Purchase order confirmed and submitted!");
        } catch (err) {
            showAlert(err.message || "Failed to confirm purchase order.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const steps = ["Supplier", "Items", "Payment", "Review"];

    return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: "'Syne', sans-serif", minHeight: "100vh", backgroundColor: "#f9f9f9" }}>

                {/* Alert banner */}
                {alert.show && (
                    <Alert severity={alert.severity} sx={{ mb: 3 }} onClose={() => setAlert(a => ({ ...a, show: false }))}>
                        {alert.severity === "success" ? "✓" : "✕"}&nbsp;&nbsp;{alert.message}
                    </Alert>
                )}

                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4, pb: 3, borderBottom: "3px solid #000", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: { xs: 26, md: 38 }, letterSpacing: "-0.02em", lineHeight: 1 }}>
                            PURCHASE ORDER
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
                            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa", letterSpacing: "0.06em" }}>PROCUREMENT</Typography>
                            <Box sx={{ border: "1px solid #e0e0e0", px: 1.5, py: 0.3, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888" }}>{po.referenceNo}</Box>
                            <Box sx={{ border: "1px solid", borderColor: po.status === "DRAFT" ? "#ccc" : "#000", backgroundColor: po.status === "DRAFT" ? "transparent" : "#000", color: po.status === "DRAFT" ? "#aaa" : "#fff", px: 1.5, py: 0.3, fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.06em" }}>
                                {po.status}
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button sx={{ ...btnSx, border: "1px solid #e0e0e0", color: "#555", px: 3, py: 1.2, "&:hover": { border: "1px solid #000", color: "#000" } }} startIcon={<History sx={{ fontSize: 16 }} />}>History</Button>
                        <Button onClick={handleSavePO} disabled={isSaving}
                            sx={{ ...btnSx, px: 4, py: 1.2, backgroundColor: "#000", color: "#fff", "&:hover": { backgroundColor: "#222" }, "&:disabled": { backgroundColor: "#555", color: "#aaa" } }}
                            startIcon={isSaving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <Save sx={{ fontSize: 16 }} />}>
                            {isSaving ? "Saving…" : "Save Order"}
                        </Button>
                    </Box>
                </Box>

                {/* Stepper */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    {steps.map((label, i) => (
                        <Box key={label} sx={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                            <Box onClick={() => setActiveStep(i)} sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", opacity: activeStep === i ? 1 : 0.5, "&:hover": { opacity: 1 } }}>
                                <Box sx={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, backgroundColor: activeStep >= i ? "#000" : "transparent", color: activeStep >= i ? "#fff" : "#000", border: "2px solid", borderColor: activeStep >= i ? "#000" : "#e0e0e0", transition: "all 0.2s" }}>
                                    {activeStep > i ? "✓" : i + 1}
                                </Box>
                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: activeStep === i ? 700 : 500, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", display: { xs: "none", sm: "block" } }}>
                                    {label}
                                </Typography>
                            </Box>
                            {i < steps.length - 1 && <Box sx={{ flex: 1, height: 2, mx: 2, backgroundColor: activeStep > i ? "#000" : "#e8e8e8", transition: "background 0.3s" }} />}
                        </Box>
                    ))}
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={0} sx={{ border: "1px solid #e8e8e8", p: 3 }}>

                            {/* ── Step 0: Supplier ───────────────────────────────── */}
                            {activeStep === 0 && (
                                <Box>
                                    <SectionTitle number="01">Supplier Information</SectionTitle>

                                    {/* API error banner */}
                                    {suppliersError && (
                                        <Alert severity="warning" sx={{ mb: 2 }}
                                            action={<Button size="small" onClick={() => loadSuppliers()} sx={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700 }} startIcon={<Refresh sx={{ fontSize: 14 }} />}>Retry</Button>}>
                                            ⚠&nbsp;&nbsp;{suppliersError} — showing cached / empty list.
                                        </Alert>
                                    )}

                                    <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                                        <Autocomplete
                                            options={suppliers}
                                            getOptionLabel={o => o.name || ""}
                                            value={selectedSupplier}
                                            onChange={(_, v) => setSelectedSupplier(v)}
                                            inputValue={supplierSearch}
                                            onInputChange={(_, val) => setSupplierSearch(val)}
                                            loading={suppliersLoading}
                                            loadingText={
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
                                                    <CircularProgress size={14} sx={{ color: "#000" }} />
                                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>Loading suppliers…</Typography>
                                                </Box>
                                            }
                                            noOptionsText={
                                                <Box sx={{ p: 1 }}>
                                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#aaa" }}>No suppliers found</Typography>
                                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#bbb", mt: 0.5 }}>Click "+ New" to add one</Typography>
                                                </Box>
                                            }
                                            renderInput={params => (
                                                <TextField {...params} label="Search Supplier" size="small" placeholder="Type supplier name…"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {suppliersLoading ? <CircularProgress size={14} sx={{ color: "#888", mr: 1 }} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, o) => (
                                                <Box component="li" {...props} key={o.supplierId || o.id}>
                                                    <Box>
                                                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>{o.name}</Typography>
                                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888" }}>
                                                            {[o.phone, o.email].filter(Boolean).join(" · ") || "No contact info"}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                            isOptionEqualToValue={(opt, val) => (opt.supplierId || opt.id) === (val.supplierId || val.id)}
                                            sx={{ flex: 1 }}
                                        />
                                        <Button onClick={() => setSupplierDialog(true)}
                                            sx={{ ...btnSx, border: "1px solid #000", color: "#000", px: 2.5, py: 1, minWidth: 0, "&:hover": { backgroundColor: "#000", color: "#fff" } }}
                                            startIcon={<Add sx={{ fontSize: 15 }} />}>
                                            New
                                        </Button>
                                    </Box>

                                    {/* Selected supplier card */}
                                    {selectedSupplier && (
                                        <Box sx={{ border: "2px solid #000", p: 2.5, mb: 3, position: "relative" }}>
                                            <Box sx={{ position: "absolute", top: -1, right: -1, backgroundColor: "#000", color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 9, px: 1.2, py: 0.4, letterSpacing: "0.08em" }}>
                                                SELECTED
                                            </Box>
                                            <Grid container spacing={2}>
                                                {[
                                                    ["Name",    selectedSupplier.name],
                                                    ["Phone",   selectedSupplier.phone   || "—"],
                                                    ["Email",   selectedSupplier.email   || "—"],
                                                    ["Tax ID",  selectedSupplier.taxId   || "—"],
                                                    ["Payment Terms", selectedSupplier.paymentTerms || "—"],
                                                    ["Address", selectedSupplier.address || "—"],
                                                ].map(([k, v]) => (
                                                    <Grid key={k} item xs={k === "Address" ? 12 : 6}>
                                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>{k}</Typography>
                                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13, mt: 0.3 }}>{v}</Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    )}

                                    <Box sx={{ height: 1, backgroundColor: "#e8e8e8", mb: 3 }} />
                                    <Grid container spacing={2.5}>
                                        <Grid item xs={6}>
                                            <TextField label="Reference No." value={po.referenceNo} onChange={e => setPo({ ...po, referenceNo: e.target.value })} fullWidth size="small" />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField label="Status" value={po.status} onChange={e => setPo({ ...po, status: e.target.value })} select fullWidth size="small">
                                                {PURCHASE_STATUS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={6}><DateInput label="Purchase Date"      value={po.purchaseDate}     onChange={d => setPo({ ...po, purchaseDate: d })} /></Grid>
                                        <Grid item xs={6}><DateInput label="Expected Delivery"  value={po.expectedDelivery} onChange={d => setPo({ ...po, expectedDelivery: d })} /></Grid>
                                        <Grid item xs={12}>
                                            <TextField label="Notes" value={po.notes} onChange={e => setPo({ ...po, notes: e.target.value })} fullWidth multiline rows={2} size="small" placeholder="Additional notes…" />
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                                        <Button onClick={() => setActiveStep(1)} disabled={!selectedSupplier} sx={primaryBtnSx}>Next: Items →</Button>
                                    </Box>
                                </Box>
                            )}

                            {/* ── Step 1: Items ──────────────────────────────────── */}
                            {activeStep === 1 && (
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Box sx={{ width: 28, height: 28, backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12 }}>02</Box>
                                            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>Purchase Items</Typography>
                                            {po.items.length > 0 && <Box sx={{ border: "1px solid #000", px: 1.5, py: 0.3, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{po.items.length}</Box>}
                                        </Box>
                                        <Button onClick={() => setAddItemDialog(true)} startIcon={<Add sx={{ fontSize: 15 }} />}
                                            sx={{ ...btnSx, px: 3, py: 1, backgroundColor: "#000", color: "#fff", "&:hover": { backgroundColor: "#222" } }}>
                                            Add Item
                                        </Button>
                                    </Box>
                                    {po.items.length === 0 ? (
                                        <Box sx={{ py: 8, border: "2px dashed #e8e8e8", textAlign: "center", cursor: "pointer" }} onClick={() => setAddItemDialog(true)}>
                                            <Inventory sx={{ fontSize: 52, color: "#e8e8e8", mb: 2 }} />
                                            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, mb: 1 }}>No items yet</Typography>
                                            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#aaa", mb: 3 }}>Add products from your catalog</Typography>
                                            <Button sx={{ ...btnSx, border: "2px solid #000", color: "#000", px: 4, py: 1.2, "&:hover": { backgroundColor: "#000", color: "#fff" } }}>+ Add First Item</Button>
                                        </Box>
                                    ) : (
                                        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e8e8e8" }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>{["Product / SKU","Unit Price","Qty","Line Total",""].map(h => <TableCell key={h} align={h==="Qty"||h===""?"center":"left"}>{h}</TableCell>)}</TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {po.items.map(item => (
                                                        <TableRow key={item.itemId} sx={{ "&:hover": { backgroundColor: "#fafafa" } }}>
                                                            <TableCell>
                                                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>{item.productName}</Typography>
                                                                <Box sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", border: "1px solid #eee", px: 0.8, py: 0.2, display: "inline-block", mt: 0.3 }}>{item.sku}</Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField type="number" value={item.unitPrice} onChange={e => updatePrice(item.itemId, parseFloat(e.target.value)||0)} size="small" sx={{ width: 110 }}
                                                                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#888" }}>$</Typography></InputAdornment> }} />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <TextField type="number" value={item.quantity} onChange={e => updateQty(item.itemId, parseInt(e.target.value)||1)} size="small" inputProps={{ min: 1, style: { textAlign: "center" } }} sx={{ width: 68 }} />
                                                            </TableCell>
                                                            <TableCell><Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>${(item.total||0).toFixed(2)}</Typography></TableCell>
                                                            <TableCell align="center">
                                                                <IconButton size="small" onClick={() => removeItem(item.itemId)} sx={{ color: "#ccc", "&:hover": { backgroundColor: "#000", color: "#fff" } }}><Delete sx={{ fontSize: 16 }} /></IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                                        <Button onClick={() => setActiveStep(0)} sx={cancelSx}>← Back</Button>
                                        <Button onClick={() => setActiveStep(2)} disabled={po.items.length===0} sx={primaryBtnSx}>Next: Payment →</Button>
                                    </Box>
                                </Box>
                            )}

                            {/* ── Step 2: Payment ────────────────────────────────── */}
                            {activeStep === 2 && (
                                <Box>
                                    <SectionTitle number="03">Payment Details</SectionTitle>
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", mb: 1.5 }}>Payment Method</Typography>
                                    <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
                                        {PAYMENT_METHODS.map(({ value, label, Icon }) => {
                                            const sel = po.payment.method === value;
                                            return (
                                                <Box key={value} onClick={() => setPo({ ...po, payment: { ...po.payment, method: value } })}
                                                    sx={{ flex: 1, minWidth: 110, border: "2px solid", borderColor: sel ? "#000" : "#e0e0e0", backgroundColor: sel ? "#000" : "#fff", p: 2, cursor: "pointer", transition: "all 0.15s", "&:hover": { borderColor: "#000" } }}>
                                                    <Icon sx={{ color: sel ? "#fff" : "#aaa", fontSize: 20, mb: 0.5 }} />
                                                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: sel ? "#fff" : "#000" }}>{label}</Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", mb: 1.5 }}>Payment Status</Typography>
                                    <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
                                        {PAYMENT_STATUS.map(({ value, label }) => {
                                            const sel = po.payment.status === value;
                                            return (
                                                <Box key={value} onClick={() => setPo({ ...po, payment: { ...po.payment, status: value } })}
                                                    sx={{ flex: 1, minWidth: 90, border: "2px solid", borderColor: sel ? "#000" : "#e0e0e0", backgroundColor: sel ? "#000" : "#fff", p: 1.5, cursor: "pointer", transition: "all 0.15s", textAlign: "center", "&:hover": { borderColor: "#000" } }}>
                                                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: sel ? "#fff" : "#888" }}>{label}</Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                    {(po.payment.status === "PAID" || po.payment.status === "PARTIAL") && (
                                        <Grid container spacing={2.5}>
                                            <Grid item xs={6}>
                                                <TextField label="Amount Paid" type="number" value={po.payment.paidAmount}
                                                    onChange={e => setPo({ ...po, payment: { ...po.payment, paidAmount: parseFloat(e.target.value)||0 } })}
                                                    fullWidth size="small"
                                                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#888" }}>$</Typography></InputAdornment> }} />
                                            </Grid>
                                            {po.payment.method === "CHEQUE" && <>
                                                <Grid item xs={6}><TextField label="Cheque No."  value={po.payment.chequeNo}  onChange={e => setPo({ ...po, payment: { ...po.payment, chequeNo:  e.target.value } })} fullWidth size="small" /></Grid>
                                                <Grid item xs={6}><TextField label="Bank Name"   value={po.payment.bankName}  onChange={e => setPo({ ...po, payment: { ...po.payment, bankName:  e.target.value } })} fullWidth size="small" /></Grid>
                                            </>}
                                            {po.payment.method === "BANK_TRANSFER" && (
                                                <Grid item xs={6}><TextField label="Transaction ID" value={po.payment.transactionId} onChange={e => setPo({ ...po, payment: { ...po.payment, transactionId: e.target.value } })} fullWidth size="small" /></Grid>
                                            )}
                                            {po.payment.status === "PARTIAL" && (
                                                <Grid item xs={6}><DateInput label="Due Date" value={po.payment.dueDate} onChange={d => setPo({ ...po, payment: { ...po.payment, dueDate: d } })} /></Grid>
                                            )}
                                        </Grid>
                                    )}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                                        <Button onClick={() => setActiveStep(1)} sx={cancelSx}>← Back</Button>
                                        <Button onClick={() => setActiveStep(3)} sx={primaryBtnSx}>Next: Review →</Button>
                                    </Box>
                                </Box>
                            )}

                            {/* ── Step 3: Review ────────────────────────────────── */}
                            {activeStep === 3 && (
                                <Box>
                                    <SectionTitle number="04">Review & Confirm</SectionTitle>
                                    <Box sx={{ border: "1px solid #e8e8e8", p: 2.5, mb: 2.5 }}>
                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>Supplier</Typography>
                                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>{selectedSupplier?.name}</Typography>
                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888", mt: 0.3 }}>
                                            {[selectedSupplier?.phone, selectedSupplier?.address].filter(Boolean).join(" · ")}
                                        </Typography>
                                    </Box>
                                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e8e8e8", mb: 2.5 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>{["Item","SKU","Qty","Unit","Total"].map(h => <TableCell key={h} align={["Qty","Unit","Total"].includes(h)?"right":"left"}>{h}</TableCell>)}</TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {po.items.map(item => (
                                                    <TableRow key={item.itemId}>
                                                        <TableCell><Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>{item.productName}</Typography></TableCell>
                                                        <TableCell><Box sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", border: "1px solid #eee", px: 0.8, py: 0.2 }}>{item.sku}</Box></TableCell>
                                                        <TableCell align="right"><Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{item.quantity}</Typography></TableCell>
                                                        <TableCell align="right"><Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>${item.unitPrice.toFixed(2)}</Typography></TableCell>
                                                        <TableCell align="right"><Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>${(item.total||0).toFixed(2)}</Typography></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                        <Box sx={{ width: 300, border: "2px solid #000", p: 2.5 }}>
                                            {[["Subtotal",`$${po.subtotal.toFixed(2)}`],["Tax (10%)",`$${po.tax.toFixed(2)}`]].map(([k,v]) => (
                                                <Box key={k} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>{k}</Typography>
                                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{v}</Typography>
                                                </Box>
                                            ))}
                                            {[["Shipping","shipping"],["Discount","discount"]].map(([k,field]) => (
                                                <Box key={k} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>{k}</Typography>
                                                    <TextField type="number" value={po[field]} onChange={e => setPo({ ...po, [field]: parseFloat(e.target.value)||0 })} size="small" sx={{ width: 100 }}
                                                        InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#888" }}>$</Typography></InputAdornment> }} />
                                                </Box>
                                            ))}
                                            <Box sx={{ height: 2, backgroundColor: "#000", my: 2 }} />
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total</Typography>
                                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26 }}>${po.total.toFixed(2)}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                                        <Button onClick={() => setActiveStep(2)} sx={cancelSx}>← Back</Button>
                                        <Button onClick={handleConfirmPO} disabled={isSaving}
                                            sx={{ ...btnSx, px: 6, py: 1.5, fontSize: 12, backgroundColor: "#000", color: "#fff", "&:hover": { backgroundColor: "#222" }, "&:disabled": { backgroundColor: "#555", color: "#aaa" } }}>
                                            {isSaving ? <><CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />Submitting…</> : "Confirm Purchase ✓"}
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* ── Order Summary sidebar ──────────────────────────────── */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={0} sx={{ border: "2px solid #000", p: 3, position: "sticky", top: 24 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 3, pb: 2, borderBottom: "2px solid #000" }}>
                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>Order Summary</Typography>
                                <Box sx={{ backgroundColor: "#000", color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 10, px: 1.5, py: 0.4 }}>{po.referenceNo}</Box>
                            </Box>
                            {selectedSupplier && (
                                <Box sx={{ mb: 2.5 }}>
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.5 }}>Supplier</Typography>
                                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>{selectedSupplier.name}</Typography>
                                    {selectedSupplier.paymentTerms && (
                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888", mt: 0.3 }}>Terms: {selectedSupplier.paymentTerms}</Typography>
                                    )}
                                </Box>
                            )}
                            <Box sx={{ mb: 2.5 }}>
                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.5 }}>Items</Typography>
                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22 }}>{po.items.length}</Typography>
                            </Box>
                            <Box sx={{ height: 1, backgroundColor: "#e8e8e8", mb: 2 }} />
                            {[["Subtotal",`$${po.subtotal.toFixed(2)}`],["Tax (10%)",`$${po.tax.toFixed(2)}`],["Shipping",`$${po.shipping.toFixed(2)}`]].map(([k,v]) => (
                                <Box key={k} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>{k}</Typography>
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{v}</Typography>
                                </Box>
                            ))}
                            {po.discount > 0 && (
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>Discount</Typography>
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#555" }}>-${po.discount.toFixed(2)}</Typography>
                                </Box>
                            )}
                            <Box sx={{ height: 2, backgroundColor: "#000", my: 2 }} />
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total</Typography>
                                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28 }}>${po.total.toFixed(2)}</Typography>
                            </Box>
                            {po.payment.status === "PARTIAL" && po.payment.paidAmount > 0 && (
                                <Box sx={{ mt: 2.5, p: 2, border: "1px solid #000", backgroundColor: "#fafafa" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888" }}>Paid</Typography>
                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>${po.payment.paidAmount.toFixed(2)}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Balance Due</Typography>
                                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>${Math.max(0, po.total - po.payment.paidAmount).toFixed(2)}</Typography>
                                    </Box>
                                </Box>
                            )}
                            {po.payment.status === "PAID" && (
                                <Box sx={{ mt: 2.5, p: 2, border: "2px solid #000", backgroundColor: "#000", textAlign: "center" }}>
                                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>✓ Fully Paid</Typography>
                                </Box>
                            )}
                            {activeStep === 1 && (
                                <Button fullWidth onClick={() => setAddItemDialog(true)} startIcon={<Add sx={{ fontSize: 16 }} />}
                                    sx={{ ...btnSx, mt: 3, py: 1.5, border: "2px dashed #000", color: "#000", fontSize: 11, "&:hover": { backgroundColor: "#000", color: "#fff", border: "2px solid #000" } }}>
                                    + Add Item
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* ── Dialogs ───────────────────────────────────────────── */}
                <NewSupplierDialog
                    open={supplierDialog}
                    onClose={() => setSupplierDialog(false)}
                    onSave={(saved) => {
                        setSuppliers(prev => [saved, ...prev]);
                        setSelectedSupplier(saved);
                        showAlert(`Supplier "${saved.name}" added successfully!`);
                    }}
                />
                <AddItemDialog
                    open={addItemDialog}
                    onClose={() => setAddItemDialog(false)}
                    onAdd={handleAddItem}
                />
            </Box>
        </ThemeProvider>
    );
};

export default PurchaseOrder;