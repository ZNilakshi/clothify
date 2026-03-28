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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Tooltip,
    Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    Edit,
    Delete,
    Add,
    Search,
    Close,
    Category,
    CloudUpload,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import categoryService from "../../services/categoryService";
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
                        "& fieldset":             { borderColor: "#d8d8d8", borderWidth: 1 },
                        "&:hover fieldset":        { borderColor: "#000",   borderWidth: 1 },
                        "&.Mui-focused fieldset":  { borderColor: "#000",   borderWidth: 2 },
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
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    border: "1px solid",
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
                    padding: "14px 16px",
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
                    padding: "14px 16px",
                },
            },
        },
        MuiPaper:      { styleOverrides: { root: { borderRadius: 0 } } },
        MuiDialog:     { styleOverrides: { paper: { borderRadius: 0 } } },
        MuiIconButton: { styleOverrides: { root: { borderRadius: 0 } } },
    },
});

/* ─── Shared button styles ───────────────────────────────────── */
const primaryBtnSx = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderRadius: 0,
    px: 5,
    py: 1.2,
    backgroundColor: "#000",
    color: "#fff",
    "&:hover": { backgroundColor: "#222" },
    "&:disabled": { backgroundColor: "#e0e0e0", color: "#aaa" },
};

const cancelBtnSx = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderRadius: 0,
    border: "1px solid #e0e0e0",
    color: "#555",
    px: 4,
    py: 1.2,
    "&:hover": { border: "1px solid #000", color: "#000", backgroundColor: "#f5f5f5" },
};

/* ─── Main Component ─────────────────────────────────────────── */
const CategoryManagement = () => {
    const [categories, setCategories]             = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [searchTerm, setSearchTerm]             = useState("");
    const [alert, setAlert]                       = useState({ show: false, message: "", severity: "success" });

    const [addDialogOpen, setAddDialogOpen]       = useState(false);
    const [editDialogOpen, setEditDialogOpen]     = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formLoading, setFormLoading]           = useState(false);

    const [imageFile, setImageFile]       = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading]       = useState(false);

    const [formData, setFormData] = useState({
        categoryName: "",
        categoryDescription: "",
        imageUrl: "",
    });
    const [formError, setFormError] = useState("");

    useEffect(() => { fetchCategories(); }, []);

    useEffect(() => {
        setFilteredCategories(
            categories.filter(
                (cat) =>
                    cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (cat.categoryDescription &&
                        cat.categoryDescription.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    }, [searchTerm, categories]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
            setFilteredCategories(data);
        } catch { showAlert("Failed to load categories", "error"); }
        finally { setLoading(false); }
    };

    const showAlert = (message, severity = "success") => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: "", severity: "success" }), 4000);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `http://localhost:8080${imageUrl}`;
    };

    const resetForm = () => {
        setFormData({ categoryName: "", categoryDescription: "", imageUrl: "" });
        setFormError("");
        setImageFile(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { setFormError("Please select an image file"); return; }
        if (file.size > 5 * 1024 * 1024)    { setFormError("Image size must be less than 5MB"); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setFormError("");
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData((p) => ({ ...p, imageUrl: "" }));
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        setUploading(true);
        const fd = new FormData();
        fd.append("file", imageFile);
        try {
            const res = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
            return res.data.fileUrl;
        } catch { throw new Error("Failed to upload image"); }
        finally { setUploading(false); }
    };

    /* Add */
    const handleOpenAddDialog  = () => { resetForm(); setAddDialogOpen(true); };
    const handleCloseAddDialog = () => { setAddDialogOpen(false); resetForm(); };

    const handleAddCategory = async () => {
        if (!formData.categoryName.trim()) { setFormError("Category name is required"); return; }
        setFormLoading(true);
        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) imageUrl = await uploadImage();
            await categoryService.createCategory({ ...formData, imageUrl });
            showAlert("Category created successfully!");
            handleCloseAddDialog();
            fetchCategories();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to create category");
        } finally { setFormLoading(false); }
    };

    /* Edit */
    const handleOpenEditDialog = (category) => {
        setSelectedCategory(category);
        setFormData({
            categoryName:        category.categoryName,
            categoryDescription: category.categoryDescription || "",
            imageUrl:            category.imageUrl || "",
        });
        setImagePreview(category.imageUrl ? getImageUrl(category.imageUrl) : null);
        setImageFile(null);
        setFormError("");
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => { setEditDialogOpen(false); setSelectedCategory(null); resetForm(); };

    const handleEditCategory = async () => {
        if (!formData.categoryName.trim()) { setFormError("Category name is required"); return; }
        setFormLoading(true);
        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) imageUrl = await uploadImage();
            await categoryService.updateCategory(selectedCategory.categoryId, { ...formData, imageUrl });
            showAlert("Category updated successfully!");
            handleCloseEditDialog();
            fetchCategories();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to update category");
        } finally { setFormLoading(false); }
    };

    /* Delete */
    const handleOpenDeleteDialog  = (cat) => { setSelectedCategory(cat); setDeleteDialogOpen(true); };
    const handleCloseDeleteDialog = ()    => { setDeleteDialogOpen(false); setSelectedCategory(null); };

    const handleDeleteCategory = async () => {
        setFormLoading(true);
        try {
            await categoryService.deleteCategory(selectedCategory.categoryId);
            showAlert("Category deleted successfully!");
            handleCloseDeleteDialog();
            fetchCategories();
        } catch (err) {
            showAlert(err.response?.data?.message || "Cannot delete category with existing products", "error");
            handleCloseDeleteDialog();
        } finally { setFormLoading(false); }
    };

    /* ── Form ── */
    const CategoryForm = () => (
        <Box>
            {formError && (
                <Alert severity="error" sx={{ mb: 3 }}>✕&nbsp;&nbsp;{formError}</Alert>
            )}

            {/* Image upload */}
            <Box sx={{ mb: 3.5 }}>
                <Typography sx={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "#888", mb: 1.5, display: "block",
                }}>
                    Category Image
                </Typography>

                {imagePreview ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                            <Box
                                component="img"
                                src={imagePreview}
                                sx={{
                                    width: 100, height: 100,
                                    objectFit: "cover",
                                    border: "3px solid #000",
                                    display: "block",
                                }}
                            />
                            <Box sx={{
                                position: "absolute", bottom: 0, left: 0,
                                backgroundColor: "#000", color: "#fff",
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 8, letterSpacing: "0.08em",
                                px: 0.8, py: 0.3,
                            }}>
                                PREVIEW
                            </Box>
                        </Box>
                        <Box>
                            <Button
                                component="label"
                                sx={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 600, fontSize: 11,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 0, color: "#555",
                                    px: 2, py: 1, mb: 1, display: "block",
                                    "&:hover": { border: "1px solid #000", color: "#000" },
                                }}
                            >
                                Replace Image
                                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                            </Button>
                            <Button
                                onClick={handleRemoveImage}
                                sx={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 600, fontSize: 11,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 0, color: "#888",
                                    px: 2, py: 1, display: "block",
                                    "&:hover": { border: "1px solid #000", color: "#000", backgroundColor: "#f5f5f5" },
                                }}
                            >
                                Remove
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload sx={{ fontSize: 16 }} />}
                        sx={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 600, fontSize: 12,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            borderRadius: 0,
                            border: "2px dashed #ccc",
                            color: "#000", py: 2.5, width: "100%",
                            "&:hover": { border: "2px dashed #000", backgroundColor: "#f5f5f5" },
                        }}
                    >
                        Upload Category Image
                        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </Button>
                )}
                <Typography sx={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: "#bbb", letterSpacing: "0.04em", mt: 1, display: "block",
                }}>
                    Max 5 MB · JPG / PNG / GIF
                </Typography>
            </Box>

            <TextField
                label="Category Name"
                value={formData.categoryName}
                onChange={(e) => { setFormData({ ...formData, categoryName: e.target.value }); setFormError(""); }}
                fullWidth required
                sx={{ mb: 2.5 }}
                placeholder="e.g. Electronics"
            />
            <TextField
                label="Description"
                value={formData.categoryDescription}
                onChange={(e) => setFormData({ ...formData, categoryDescription: e.target.value })}
                fullWidth multiline rows={3}
                placeholder="Brief description of the category..."
            />
        </Box>
    );

    return (
        <ThemeProvider theme={bwTheme}>
            <Box sx={{
                p: { xs: 2, md: 3 },
                fontFamily: "'Syne', sans-serif",
                minHeight: "100vh",
                backgroundColor: "#f9f9f9",
            }}>
                {/* Alert */}
                {alert.show && (
                    <Alert severity={alert.severity} sx={{ mb: 3 }}>
                        {alert.severity === "success" ? "✓" : "✕"}&nbsp;&nbsp;{alert.message}
                    </Alert>
                )}

                {/* ── HEADER ─────────────────────────────────── */}
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    mb: 4, pb: 3,
                    borderBottom: "3px solid #000",
                    flexWrap: "wrap", gap: 2,
                }}>
                    <Box>
                        <Typography sx={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 800,
                            fontSize: { xs: 26, md: 38 },
                            letterSpacing: "-0.02em",
                            lineHeight: 1,
                            color: "#000", mb: 0.5,
                        }}>
                            CATEGORIES
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Typography sx={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 11, color: "#aaa",
                                letterSpacing: "0.06em",
                            }}>
                                CATALOG TAXONOMY
                            </Typography>
                            <Box sx={{
                                border: "1px solid #e0e0e0", px: 1.5, py: 0.3,
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 11, color: "#888",
                            }}>
                                {categories.length} items
                            </Box>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<Add sx={{ fontSize: 16 }} />}
                        onClick={handleOpenAddDialog}
                        sx={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 700, fontSize: 12,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            borderRadius: 0,
                            px: 4, py: 1.5,
                            backgroundColor: "#000", color: "#fff",
                            "&:hover": { backgroundColor: "#222" },
                            transition: "all 0.2s ease",
                        }}
                    >
                        New Category
                    </Button>
                </Box>

                {/* ── SEARCH ─────────────────────────────────── */}
                <Box sx={{
                    mb: 3,
                    border: "1px solid #e0e0e0",
                    "&:focus-within": { border: "1px solid #000" },
                    transition: "border 0.2s",
                }}>
                    <TextField
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: "#bbb", fontSize: 18 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                                        <Close fontSize="small" sx={{ color: "#bbb" }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: { "& .MuiOutlinedInput-notchedOutline": { border: "none" } },
                        }}
                    />
                </Box>

                {/* ── TABLE ──────────────────────────────────── */}
                <Paper elevation={0} sx={{ border: "1px solid #e8e8e8", overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["#", "Image", "Category Name", "Description", "Products", ""].map((h) => (
                                        <TableCell
                                            key={h}
                                            align={h === "" ? "center" : "left"}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <CircularProgress size={28} sx={{ color: "#000" }} />
                                            <Typography sx={{
                                                fontFamily: "'DM Mono', monospace",
                                                color: "#bbb", mt: 2, fontSize: 12,
                                            }}>
                                                Loading categories...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <Category sx={{ fontSize: 56, color: "#e8e8e8", mb: 2, display: "block", mx: "auto" }} />
                                            <Typography sx={{
                                                fontFamily: "'Syne', sans-serif",
                                                fontWeight: 700, fontSize: 18, color: "#000",
                                            }}>
                                                {searchTerm ? "No results found" : "No categories yet"}
                                            </Typography>
                                            <Typography sx={{
                                                fontFamily: "'DM Mono', monospace",
                                                fontSize: 12, color: "#aaa", mt: 1,
                                            }}>
                                                {searchTerm
                                                    ? "Try a different search term"
                                                    : "Click 'New Category' to get started"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category, index) => (
                                        <TableRow
                                            key={category.categoryId}
                                            sx={{
                                                "&:hover": { backgroundColor: "#fafafa" },
                                                transition: "background 0.15s ease",
                                            }}
                                        >
                                            {/* Index */}
                                            <TableCell>
                                                <Typography sx={{
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontSize: 12, color: "#ccc",
                                                }}>
                                                    {String(index + 1).padStart(2, "0")}
                                                </Typography>
                                            </TableCell>

                                            {/* Image */}
                                            <TableCell>
                                                <Avatar
                                                    src={getImageUrl(category.imageUrl)}
                                                    variant="square"
                                                    sx={{
                                                        width: 52, height: 52,
                                                        backgroundColor: "#f5f5f5",
                                                        border: "1px solid #e8e8e8",
                                                    }}
                                                >
                                                    <Category sx={{ color: "#ccc" }} />
                                                </Avatar>
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell>
                                                <Typography sx={{
                                                    fontFamily: "'Syne', sans-serif",
                                                    fontWeight: 700, fontSize: 14, color: "#000",
                                                }}>
                                                    {category.categoryName}
                                                </Typography>
                                            </TableCell>

                                            {/* Description */}
                                            <TableCell>
                                                <Typography sx={{
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontSize: 12, color: "#888",
                                                    maxWidth: 260,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}>
                                                    {category.categoryDescription || "—"}
                                                </Typography>
                                            </TableCell>

                                            {/* Product count */}
                                            <TableCell>
                                                <Box component="span" sx={{
                                                    fontFamily: "'Syne', sans-serif",
                                                    fontWeight: 700, fontSize: 14,
                                                    border: "1px solid",
                                                    borderColor: category.productCount > 0 ? "#000" : "#e0e0e0",
                                                    backgroundColor: category.productCount > 0 ? "#000" : "transparent",
                                                    color: category.productCount > 0 ? "#fff" : "#ccc",
                                                    px: 1.2, py: 0.4,
                                                    display: "inline-block",
                                                    minWidth: 32,
                                                    textAlign: "center",
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontSize: 12,
                                                }}>
                                                    {category.productCount || 0}
                                                </Box>
                                                <Typography component="span" sx={{
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontSize: 10, color: "#bbb",
                                                    letterSpacing: "0.04em", ml: 1,
                                                }}>
                                                    {category.productCount === 1 ? "product" : "products"}
                                                </Typography>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell align="center">
                                                <Tooltip title="Edit" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEditDialog(category)}
                                                        sx={{
                                                            mr: 0.5, color: "#000",
                                                            "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                            transition: "all 0.15s ease",
                                                        }}
                                                    >
                                                        <Edit sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={
                                                        category.productCount > 0
                                                            ? "Cannot delete — has products"
                                                            : "Delete"
                                                    }
                                                    arrow
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenDeleteDialog(category)}
                                                            disabled={category.productCount > 0}
                                                            sx={{
                                                                color: "#ccc",
                                                                "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                                "&:disabled": { color: "#e8e8e8" },
                                                                transition: "all 0.15s ease",
                                                            }}
                                                        >
                                                            <Delete sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* ── ADD DIALOG ──────────────────────────────── */}
                <Dialog
                    open={addDialogOpen}
                    onClose={handleCloseAddDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}
                >
                    <DialogTitle sx={{ p: 3, pb: 2, borderBottom: "2px solid #000" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 800, fontSize: 22,
                                    letterSpacing: "-0.02em",
                                }}>
                                    ADD CATEGORY
                                </Typography>
                                <Typography sx={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 10, color: "#aaa",
                                    letterSpacing: "0.06em",
                                }}>
                                    CATALOG — NEW ENTRY
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={handleCloseAddDialog}
                                sx={{ color: "#000", "&:hover": { backgroundColor: "#000", color: "#fff" }, transition: "all 0.15s" }}
                            >
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3, pt: 3 }}>
                        <CategoryForm />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseAddDialog} variant="outlined" sx={cancelBtnSx}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddCategory}
                            disabled={formLoading || uploading}
                            sx={primaryBtnSx}
                        >
                            {formLoading || uploading ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CircularProgress size={16} color="inherit" />
                                    <span>{uploading ? "Uploading..." : "Saving..."}</span>
                                </Box>
                            ) : "Add Category"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── EDIT DIALOG ──────────────────────────────── */}
                <Dialog
                    open={editDialogOpen}
                    onClose={handleCloseEditDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}
                >
                    <DialogTitle sx={{ p: 3, pb: 2, borderBottom: "2px solid #000" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 800, fontSize: 22,
                                    letterSpacing: "-0.02em",
                                }}>
                                    EDIT CATEGORY
                                </Typography>
                                <Typography sx={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 10, color: "#aaa",
                                    letterSpacing: "0.06em",
                                }}>
                                    {selectedCategory?.categoryName}
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={handleCloseEditDialog}
                                sx={{ color: "#000", "&:hover": { backgroundColor: "#000", color: "#fff" }, transition: "all 0.15s" }}
                            >
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3, pt: 3 }}>
                        <CategoryForm />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseEditDialog} variant="outlined" sx={cancelBtnSx}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditCategory}
                            disabled={formLoading || uploading}
                            sx={primaryBtnSx}
                        >
                            {formLoading || uploading ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CircularProgress size={16} color="inherit" />
                                    <span>{uploading ? "Uploading..." : "Saving..."}</span>
                                </Box>
                            ) : "Save Changes"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── DELETE DIALOG ────────────────────────────── */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}
                >
                    <DialogTitle sx={{ p: 3, pb: 2, borderBottom: "2px solid #000" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{
                                fontFamily: "'Syne', sans-serif",
                                fontWeight: 800, fontSize: 20,
                                letterSpacing: "-0.01em",
                            }}>
                                DELETE CATEGORY
                            </Typography>
                            <IconButton
                                onClick={handleCloseDeleteDialog}
                                sx={{ color: "#000", "&:hover": { backgroundColor: "#000", color: "#fff" }, transition: "all 0.15s" }}
                            >
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                        {/* Category preview card */}
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 2,
                            mb: 3, p: 2,
                            border: "1px solid #e8e8e8",
                            backgroundColor: "#fafafa",
                        }}>
                            <Avatar
                                src={getImageUrl(selectedCategory?.imageUrl)}
                                variant="square"
                                sx={{
                                    width: 56, height: 56,
                                    backgroundColor: "#f0f0f0",
                                    border: "1px solid #e8e8e8",
                                    flexShrink: 0,
                                }}
                            >
                                <Category sx={{ color: "#ccc" }} />
                            </Avatar>
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 700, fontSize: 15,
                                }}>
                                    {selectedCategory?.categoryName}
                                </Typography>
                                {selectedCategory?.categoryDescription && (
                                    <Typography sx={{
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: 11, color: "#888", mt: 0.3,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: 200,
                                    }}>
                                        {selectedCategory.categoryDescription}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Alert severity="warning">This action cannot be undone.</Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={cancelBtnSx}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteCategory}
                            disabled={formLoading}
                            sx={primaryBtnSx}
                        >
                            {formLoading
                                ? <CircularProgress size={16} color="inherit" />
                                : "Delete"}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </ThemeProvider>
    );
};

export default CategoryManagement;