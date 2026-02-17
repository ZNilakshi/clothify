import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    MenuItem,
    Alert,
    CircularProgress,
    Grid,
    IconButton,
    Chip,
    Divider,
    InputAdornment,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import {
    CloudUpload,
    Delete,
    Add,
    Close,
    Image as ImageIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import subCategoryService from "../../services/subCategoryService";
import api from "../../services/api";

// ── Predefined options ──────────────────────────────────────────
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

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL",
    "28", "30", "32", "34", "36", "38", "40",
    "6", "7", "8", "9", "10", "11", "12",
    "ONE SIZE"];

const UNITS = ["UNIT", "KG", "GRAM", "LITER", "METER", "PIECE", "BOX", "PACK"];

const AddProduct = () => {
    const [categories, setCategories]         = useState([]);
    const [subCategories, setSubCategories]   = useState([]);
    const [loading, setLoading]               = useState(false);
    const [success, setSuccess]               = useState("");
    const [error, setError]                   = useState("");
    const [uploading, setUploading]           = useState(false);

    // Multiple images
    const [imageFiles, setImageFiles]         = useState([]);   // File[]
    const [imagePreviews, setImagePreviews]   = useState([]);   // string[]

    // Variants: [{ color, size, quantity, sku }]
    const [variants, setVariants]             = useState([]);
    const [variantForm, setVariantForm]       = useState({
        color: "", size: "", quantity: "", sku: "",
    });
    const [variantError, setVariantError]     = useState("");

    const [formData, setFormData] = useState({
        productName:        "",
        productDescription: "",
        unitPrice:          "",   // cost / purchase price
        sellingPrice:       "",   // selling price
        categoryId:         "",
        subCategoryId:      "",
        initialStock:       "",
        reorderLevel:       "",
        unitOfMeasure:      "UNIT",
        sku:                "",   // global SKU (optional if using variant SKUs)
    });

    // Derived margin
    const margin = (() => {
        const unit    = parseFloat(formData.unitPrice);
        const selling = parseFloat(formData.sellingPrice);
        if (!unit || !selling || unit <= 0) return null;
        return (((selling - unit) / selling) * 100).toFixed(1);
    })();

    const marginColor = margin === null ? "text.secondary"
        : parseFloat(margin) < 0  ? "error.main"
        : parseFloat(margin) < 20 ? "warning.main"
        : "success.main";

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch {
            setError("Failed to load categories");
        }
    };

    const handleCategoryChange = async (categoryId) => {
        setFormData((prev) => ({ ...prev, categoryId, subCategoryId: "" }));
        setSubCategories([]);
        if (!categoryId) return;
        try {
            const data = await subCategoryService.getSubCategoriesByCategory(categoryId);
            setSubCategories(data);
        } catch {
            console.error("Failed to load sub categories");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "categoryId") { handleCategoryChange(value); return; }
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
        setSuccess("");
    };

    // ── Images ──────────────────────────────────────────────────
    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const valid = files.filter((f) => {
            if (!f.type.startsWith("image/")) return false;
            if (f.size > 5 * 1024 * 1024) return false;
            return true;
        });

        if (imageFiles.length + valid.length > 6) {
            setError("Maximum 6 images allowed");
            return;
        }

        const previews = valid.map((f) => URL.createObjectURL(f));
        setImageFiles((prev) => [...prev, ...valid]);
        setImagePreviews((prev) => [...prev, ...previews]);
        setError("");
    };

    const handleRemoveImage = (index) => {
        setImageFiles((prev)    => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

    // ── Variants ────────────────────────────────────────────────
    const handleAddVariant = () => {
        if (!variantForm.color)    { setVariantError("Color is required");    return; }
        if (!variantForm.size)     { setVariantError("Size is required");     return; }
        if (!variantForm.quantity) { setVariantError("Quantity is required"); return; }

        const exists = variants.find(
            (v) => v.color === variantForm.color && v.size === variantForm.size
        );
        if (exists) {
            setVariantError("This color + size combination already exists");
            return;
        }

        setVariants((prev) => [...prev, { ...variantForm }]);
        setVariantForm({ color: "", size: "", quantity: "", sku: "" });
        setVariantError("");
    };

    const handleRemoveVariant = (index) => {
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const totalStock = variants.reduce(
        (sum, v) => sum + (parseInt(v.quantity) || 0), 0
    );

    // ── Submit ──────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.productName.trim()) { setError("Product name is required"); return; }
        if (!formData.categoryId)         { setError("Category is required");     return; }
        if (!formData.sellingPrice)       { setError("Selling price is required");return; }
        if (imageFiles.length === 0)      { setError("At least one image is required"); return; }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            setUploading(true);
            const imageUrls = await uploadAllImages();
            setUploading(false);

            const productData = {
                productName:        formData.productName,
                productDescription: formData.productDescription,
                price:              parseFloat(formData.sellingPrice),
                unitPrice:          parseFloat(formData.unitPrice) || null,
                sellingPrice:       parseFloat(formData.sellingPrice),
                margin:             margin ? parseFloat(margin) : null,
                categoryId:         parseInt(formData.categoryId),
                subCategoryId:      formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
                initialStock:       variants.length > 0 ? totalStock : parseInt(formData.initialStock) || 0,
                reorderLevel:       formData.reorderLevel ? parseInt(formData.reorderLevel) : null,
                unitOfMeasure:      formData.unitOfMeasure,
                sku:                formData.sku || null,
                imageUrl:           imageUrls[0],          // primary image
                imageUrls:          imageUrls,             // all images
                variants:           variants,
            };

            await productService.createProduct(productData);
            setSuccess("Product added successfully!");

            // Reset
            setFormData({
                productName: "", productDescription: "", unitPrice: "",
                sellingPrice: "", categoryId: "", subCategoryId: "",
                initialStock: "", reorderLevel: "", unitOfMeasure: "UNIT", sku: "",
            });
            setImageFiles([]);
            setImagePreviews([]);
            setVariants([]);
            setSubCategories([]);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to add product");
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const sectionTitle = (title) => (
        <Typography variant="subtitle1" fontWeight="bold"
            sx={{ mb: 2, pb: 1, borderBottom: "2px solid #e0e0e0", color: "#2b2b2b" }}>
            {title}
        </Typography>
    );

    return (
        <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: "#fdfdfd" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
                Add New Product
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>

                {/* ── SECTION 1: Images ───────────────────── */}
                {sectionTitle("📷 Product Images (up to 6)")}

                <Box sx={{ mb: 4 }}>
                    {/* Upload button */}
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        sx={{
                            py: 2, px: 4, borderStyle: "dashed",
                            borderWidth: 2, borderRadius: 2, mb: 2,
                        }}
                    >
                        Select Images ({imageFiles.length}/6)
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={handleImagesChange}
                        />
                    </Button>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        First image will be the primary image · Max 5MB each · JPG, PNG, GIF
                    </Typography>

                    {/* Image previews grid */}
                    {imagePreviews.length > 0 && (
                        <Grid container spacing={2}>
                            {imagePreviews.map((src, idx) => (
                                <Grid item key={idx}>
                                    <Box sx={{ position: "relative" }}>
                                        <Box
                                            component="img"
                                            src={src}
                                            sx={{
                                                width: 100, height: 100,
                                                borderRadius: 2,
                                                objectFit: "cover",
                                                border: idx === 0
                                                    ? "3px solid #3a7d44"
                                                    : "2px solid #e0e0e0",
                                            }}
                                        />
                                        {idx === 0 && (
                                            <Chip
                                                label="Primary"
                                                size="small"
                                                sx={{
                                                    position: "absolute", top: -10, left: 0,
                                                    backgroundColor: "#3a7d44", color: "#fff",
                                                    fontSize: 10, height: 20,
                                                }}
                                            />
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveImage(idx)}
                                            sx={{
                                                position: "absolute", top: -8, right: -8,
                                                backgroundColor: "#d32f2f", color: "#fff",
                                                width: 22, height: 22,
                                                "&:hover": { backgroundColor: "#b71c1c" },
                                            }}
                                        >
                                            <Close sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}

                            {/* Add more placeholder */}
                            {imageFiles.length < 6 && (
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{
                                            width: 100, height: 100,
                                            borderStyle: "dashed", borderRadius: 2,
                                            display: "flex", flexDirection: "column", gap: 0.5,
                                        }}
                                    >
                                        <ImageIcon sx={{ color: "text.secondary" }} />
                                        <Typography variant="caption" color="text.secondary">Add more</Typography>
                                        <input
                                            type="file" accept="image/*"
                                            multiple hidden onChange={handleImagesChange}
                                        />
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Box>

                {/* ── SECTION 2: Basic Info ─────────────────── */}
                {sectionTitle("📋 Basic Information")}

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={8}>
                        <TextField
                            label="Product Name"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            fullWidth required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="SKU (Stock Keeping Unit)"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            fullWidth
                            placeholder="e.g. SHIRT-BLK-M"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Description"
                            name="productDescription"
                            value={formData.productDescription}
                            onChange={handleChange}
                            fullWidth multiline rows={3}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Category"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            select fullWidth required
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat.categoryId} value={cat.categoryId}>
                                    {cat.categoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Sub Category"
                            name="subCategoryId"
                            value={formData.subCategoryId}
                            onChange={handleChange}
                            select fullWidth
                            disabled={!formData.categoryId || subCategories.length === 0}
                            helperText={formData.categoryId && subCategories.length === 0
                                ? "No sub categories for this category"
                                : ""}
                        >
                            <MenuItem value="">None</MenuItem>
                            {subCategories.map((sc) => (
                                <MenuItem key={sc.subCategoryId} value={sc.subCategoryId}>
                                    {sc.subCategoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            label="Unit of Measure"
                            name="unitOfMeasure"
                            value={formData.unitOfMeasure}
                            onChange={handleChange}
                            select fullWidth
                        >
                            {UNITS.map((u) => (
                                <MenuItem key={u} value={u}>{u}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            label="Reorder Level"
                            name="reorderLevel"
                            type="number"
                            value={formData.reorderLevel}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ min: "0" }}
                        />
                    </Grid>
                </Grid>

                {/* ── SECTION 3: Pricing ───────────────────── */}
                {sectionTitle("💰 Pricing")}

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Unit Price (Cost)"
                            name="unitPrice"
                            type="number"
                            value={formData.unitPrice}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: "0.01", min: "0" }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            helperText="What you paid (purchase cost)"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Selling Price"
                            name="sellingPrice"
                            type="number"
                            value={formData.sellingPrice}
                            onChange={handleChange}
                            fullWidth required
                            inputProps={{ step: "0.01", min: "0" }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            helperText="What customers pay"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        {/* Margin display */}
                        <Box
                            sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                p: 2,
                                height: "56px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: margin === null ? "#fafafa"
                                    : parseFloat(margin) < 0 ? "#fff5f5"
                                    : parseFloat(margin) < 20 ? "#fffbea"
                                    : "#f0fdf4",
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Profit Margin
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ color: marginColor }}
                            >
                                {margin === null ? "—" : `${margin}%`}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color={marginColor} display="block" sx={{ mt: 0.5, px: 0.5 }}>
                            {margin === null ? "Enter both prices to calculate"
                                : parseFloat(margin) < 0  ? "⚠ Selling below cost!"
                                : parseFloat(margin) < 20 ? "⚠ Low margin"
                                : "✓ Healthy margin"}
                        </Typography>
                    </Grid>
                </Grid>

                {/* ── SECTION 4: Variants (Color + Size + Qty) */}
                {sectionTitle("🎨 Variants (Color / Size / Quantity)")}

                <Box sx={{ mb: 1 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                        {/* Color */}
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Color"
                                value={variantForm.color}
                                onChange={(e) => {
                                    setVariantForm((p) => ({ ...p, color: e.target.value }));
                                    setVariantError("");
                                }}
                                select fullWidth size="small"
                            >
                                {AVAILABLE_COLORS.map((c) => (
                                    <MenuItem key={c.value} value={c.value}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{
                                                width: 16, height: 16,
                                                borderRadius: "50%",
                                                backgroundColor: c.hex,
                                                border: "1px solid #ccc",
                                            }} />
                                            {c.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Size */}
                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Size"
                                value={variantForm.size}
                                onChange={(e) => {
                                    setVariantForm((p) => ({ ...p, size: e.target.value }));
                                    setVariantError("");
                                }}
                                select fullWidth size="small"
                            >
                                {AVAILABLE_SIZES.map((s) => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Quantity */}
                        <Grid item xs={6} sm={2}>
                            <TextField
                                label="Quantity"
                                type="number"
                                value={variantForm.quantity}
                                onChange={(e) => {
                                    setVariantForm((p) => ({ ...p, quantity: e.target.value }));
                                    setVariantError("");
                                }}
                                fullWidth size="small"
                                inputProps={{ min: "0" }}
                            />
                        </Grid>

                        {/* SKU */}
                        <Grid item xs={6} sm={3}>
                            <TextField
                                label="Variant SKU (optional)"
                                value={variantForm.sku}
                                onChange={(e) =>
                                    setVariantForm((p) => ({ ...p, sku: e.target.value }))
                                }
                                fullWidth size="small"
                                placeholder="e.g. SHIRT-BLK-M"
                            />
                        </Grid>

                        {/* Add button */}
                        <Grid item xs={12} sm={2}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddVariant}
                                fullWidth
                                sx={{
                                    backgroundColor: "#3a7d44",
                                    textTransform: "none",
                                    "&:hover": { backgroundColor: "#2d6336" },
                                }}
                            >
                                Add
                            </Button>
                        </Grid>
                    </Grid>

                    {variantError && (
                        <Alert severity="error" sx={{ mt: 1 }}>{variantError}</Alert>
                    )}
                </Box>

                {/* Variants table */}
                {variants.length > 0 && (
                    <Paper variant="outlined" sx={{ borderRadius: 2, mt: 2, mb: 3, overflow: "hidden" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableCell><strong>Color</strong></TableCell>
                                    <TableCell><strong>Size</strong></TableCell>
                                    <TableCell><strong>Quantity</strong></TableCell>
                                    <TableCell><strong>SKU</strong></TableCell>
                                    <TableCell align="center"><strong>Remove</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {variants.map((v, idx) => {
                                    const colorDef = AVAILABLE_COLORS.find(c => c.value === v.color);
                                    return (
                                        <TableRow key={idx}
                                            sx={{ "&:nth-of-type(even)": { backgroundColor: "#fafafa" } }}>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Box sx={{
                                                        width: 16, height: 16,
                                                        borderRadius: "50%",
                                                        backgroundColor: colorDef?.hex || "#ccc",
                                                        border: "1px solid #ccc",
                                                    }} />
                                                    {colorDef?.label || v.color}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={v.size} size="small"
                                                    sx={{ backgroundColor: "#e8f5e9", color: "#3a7d44" }} />
                                            </TableCell>
                                            <TableCell><strong>{v.quantity}</strong></TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {v.sku || "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveVariant(idx)}
                                                    sx={{ color: "#d32f2f" }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {/* Total row */}
                                <TableRow sx={{ backgroundColor: "#f0fdf4" }}>
                                    <TableCell colSpan={2}>
                                        <strong>Total Stock</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>{totalStock}</strong>
                                    </TableCell>
                                    <TableCell colSpan={2} />
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>
                )}

                {/* Stock field if no variants */}
                {variants.length === 0 && (
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Initial Stock"
                            name="initialStock"
                            type="number"
                            value={formData.initialStock}
                            onChange={handleChange}
                            inputProps={{ min: "0" }}
                            helperText="Or add variants above to auto-calculate stock"
                            sx={{ width: 200 }}
                        />
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Submit */}
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || uploading}
                    sx={{
                        backgroundColor: "#2b2b2b",
                        py: 1.5,
                        borderRadius: "999px",
                        textTransform: "none",
                        fontSize: 16,
                        "&:hover": { backgroundColor: "#000" },
                    }}
                >
                    {uploading ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                            Uploading images...
                        </Box>
                    ) : loading ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                            Saving product...
                        </Box>
                    ) : (
                        "Add Product"
                    )}
                </Button>
            </form>
        </Paper>
    );
};

export default AddProduct;