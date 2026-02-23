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
    MenuItem,
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
    AccountTree,
    CloudUpload,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import subCategoryService from "../../services/subCategoryService";
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
                        "& fieldset":            { borderColor: "#d8d8d8", borderWidth: 1 },
                        "&:hover fieldset":       { borderColor: "#000",   borderWidth: 1 },
                        "&.Mui-focused fieldset": { borderColor: "#000",   borderWidth: 2 },
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
                    "&.Mui-selected": {
                        backgroundColor: "#000", color: "#fff",
                        "&:hover": { backgroundColor: "#222" },
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
                    backgroundColor: "#fff", borderColor: "#000", color: "#000",
                    "& .MuiAlert-icon": { color: "#000" },
                },
                standardError: {
                    backgroundColor: "#fff", borderColor: "#000", color: "#000",
                    "& .MuiAlert-icon": { color: "#000" },
                },
                standardWarning: {
                    backgroundColor: "#fff", borderColor: "#888", color: "#000",
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
    fontWeight: 700, fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderRadius: 0, px: 5, py: 1.2,
    backgroundColor: "#000", color: "#fff",
    "&:hover": { backgroundColor: "#222" },
    "&:disabled": { backgroundColor: "#e0e0e0", color: "#aaa" },
};

const cancelBtnSx = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600, fontSize: 12,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderRadius: 0,
    border: "1px solid #e0e0e0",
    color: "#555", px: 4, py: 1.2,
    "&:hover": { border: "1px solid #000", color: "#000", backgroundColor: "#f5f5f5" },
};

/* ─── Main Component ─────────────────────────────────────────── */
const SubCategoryManagement = () => {
    const [subCategories, setSubCategories]               = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [categories, setCategories]                     = useState([]);
    const [loading, setLoading]                           = useState(true);
    const [searchTerm, setSearchTerm]                     = useState("");
    const [filterCategory, setFilterCategory]             = useState("");
    const [alert, setAlert]                               = useState({ show: false, message: "", severity: "success" });

    const [addDialogOpen, setAddDialogOpen]               = useState(false);
    const [editDialogOpen, setEditDialogOpen]             = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen]         = useState(false);
    const [selectedSubCategory, setSelectedSubCategory]   = useState(null);
    const [formLoading, setFormLoading]                   = useState(false);

    const [imageFile, setImageFile]       = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading]       = useState(false);

    const [formData, setFormData] = useState({
        subCategoryName: "", subCategoryDescription: "", categoryId: "", imageUrl: "",
    });
    const [formError, setFormError] = useState("");

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        let filtered = subCategories;
        if (searchTerm) {
            filtered = filtered.filter(
                (sc) =>
                    sc.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sc.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterCategory) {
            filtered = filtered.filter((sc) => sc.categoryId === parseInt(filterCategory));
        }
        setFilteredSubCategories(filtered);
    }, [searchTerm, filterCategory, subCategories]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subCatsData, catsData] = await Promise.all([
                subCategoryService.getAllSubCategories(),
                categoryService.getAllCategories(),
            ]);
            setSubCategories(subCatsData);
            setFilteredSubCategories(subCatsData);
            setCategories(catsData);
        } catch { showAlert("Failed to load data", "error"); }
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
        setFormData({ subCategoryName: "", subCategoryDescription: "", categoryId: "", imageUrl: "" });
        setFormError(""); setImageFile(null); setImagePreview(null);
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
        setImageFile(null); setImagePreview(null);
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

    const handleAddSubCategory = async () => {
        if (!formData.subCategoryName.trim()) { setFormError("Sub category name is required"); return; }
        if (!formData.categoryId)             { setFormError("Please select a category");      return; }
        setFormLoading(true);
        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) imageUrl = await uploadImage();
            await subCategoryService.createSubCategory({
                subCategoryName: formData.subCategoryName,
                subCategoryDescription: formData.subCategoryDescription,
                categoryId: parseInt(formData.categoryId),
                imageUrl,
            });
            showAlert("Sub category created successfully!");
            handleCloseAddDialog(); fetchData();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to create sub category");
        } finally { setFormLoading(false); }
    };

    /* Edit */
    const handleOpenEditDialog = (subCategory) => {
        setSelectedSubCategory(subCategory);
        setFormData({
            subCategoryName:        subCategory.subCategoryName,
            subCategoryDescription: subCategory.subCategoryDescription || "",
            categoryId:             subCategory.categoryId || "",
            imageUrl:               subCategory.imageUrl || "",
        });
        setImagePreview(subCategory.imageUrl ? getImageUrl(subCategory.imageUrl) : null);
        setImageFile(null); setFormError("");
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => { setEditDialogOpen(false); setSelectedSubCategory(null); resetForm(); };

    const handleEditSubCategory = async () => {
        if (!formData.subCategoryName.trim()) { setFormError("Sub category name is required"); return; }
        if (!formData.categoryId)             { setFormError("Please select a category");      return; }
        setFormLoading(true);
        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) imageUrl = await uploadImage();
            await subCategoryService.updateSubCategory(selectedSubCategory.subCategoryId, {
                subCategoryName: formData.subCategoryName,
                subCategoryDescription: formData.subCategoryDescription,
                categoryId: parseInt(formData.categoryId),
                imageUrl,
            });
            showAlert("Sub category updated successfully!");
            handleCloseEditDialog(); fetchData();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to update sub category");
        } finally { setFormLoading(false); }
    };

    /* Delete */
    const handleOpenDeleteDialog  = (sc) => { setSelectedSubCategory(sc); setDeleteDialogOpen(true); };
    const handleCloseDeleteDialog = ()   => { setDeleteDialogOpen(false); setSelectedSubCategory(null); };

    const handleDeleteSubCategory = async () => {
        setFormLoading(true);
        try {
            await subCategoryService.deleteSubCategory(selectedSubCategory.subCategoryId);
            showAlert("Sub category deleted successfully!");
            handleCloseDeleteDialog(); fetchData();
        } catch (err) {
            showAlert(err.response?.data?.message || "Failed to delete sub category", "error");
            handleCloseDeleteDialog();
        } finally { setFormLoading(false); }
    };

    /* ── Form ── */
    const SubCategoryForm = () => (
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
                    Sub Category Image
                </Typography>

                {imagePreview ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                            <Box
                                component="img" src={imagePreview}
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
                            <Button component="label" sx={{
                                fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 11,
                                letterSpacing: "0.06em", textTransform: "uppercase",
                                border: "1px solid #e0e0e0", borderRadius: 0, color: "#555",
                                px: 2, py: 1, mb: 1, display: "block",
                                "&:hover": { border: "1px solid #000", color: "#000" },
                            }}>
                                Replace Image
                                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                            </Button>
                            <Button onClick={handleRemoveImage} sx={{
                                fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 11,
                                letterSpacing: "0.06em", textTransform: "uppercase",
                                border: "1px solid #e0e0e0", borderRadius: 0, color: "#888",
                                px: 2, py: 1, display: "block",
                                "&:hover": { border: "1px solid #000", color: "#000", backgroundColor: "#f5f5f5" },
                            }}>
                                Remove
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Button
                        variant="outlined" component="label"
                        startIcon={<CloudUpload sx={{ fontSize: 16 }} />}
                        sx={{
                            fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 12,
                            letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: 0,
                            border: "2px dashed #ccc", color: "#000", py: 2.5, width: "100%",
                            "&:hover": { border: "2px dashed #000", backgroundColor: "#f5f5f5" },
                        }}
                    >
                        Upload Image
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

            {/* Parent category */}
            <TextField
                label="Parent Category"
                value={formData.categoryId}
                onChange={(e) => { setFormData({ ...formData, categoryId: e.target.value }); setFormError(""); }}
                select fullWidth required sx={{ mb: 2.5 }}
            >
                {categories.map((cat) => (
                    <MenuItem key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryName}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                label="Sub Category Name"
                value={formData.subCategoryName}
                onChange={(e) => { setFormData({ ...formData, subCategoryName: e.target.value }); setFormError(""); }}
                fullWidth required sx={{ mb: 2.5 }}
                placeholder="e.g. Smartphones"
            />

            <TextField
                label="Description"
                value={formData.subCategoryDescription}
                onChange={(e) => setFormData({ ...formData, subCategoryDescription: e.target.value })}
                fullWidth multiline rows={3}
                placeholder="Brief description..."
            />
        </Box>
    );

    /* ── Dialog chrome ── */
    const DialogHeader = ({ title, subtitle, onClose }) => (
        <DialogTitle sx={{ p: 3, pb: 2, borderBottom: "2px solid #000" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography sx={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 800,
                        fontSize: 22, letterSpacing: "-0.02em",
                    }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography sx={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 10, color: "#aaa", letterSpacing: "0.06em",
                        }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: "#000", "&:hover": { backgroundColor: "#000", color: "#fff" }, transition: "all 0.15s" }}
                >
                    <Close />
                </IconButton>
            </Box>
        </DialogTitle>
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
                    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                    mb: 4, pb: 3, borderBottom: "3px solid #000",
                    flexWrap: "wrap", gap: 2,
                }}>
                    <Box>
                        <Typography sx={{
                            fontFamily: "'Syne', sans-serif", fontWeight: 800,
                            fontSize: { xs: 26, md: 38 }, letterSpacing: "-0.02em",
                            lineHeight: 1, color: "#000", mb: 0.5,
                        }}>
                            SUB CATEGORIES
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Typography sx={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 11, color: "#aaa", letterSpacing: "0.06em",
                            }}>
                                CATALOG TAXONOMY
                            </Typography>
                            <Box sx={{
                                border: "1px solid #e0e0e0", px: 1.5, py: 0.3,
                                fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888",
                            }}>
                                {subCategories.length} items
                            </Box>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<Add sx={{ fontSize: 16 }} />}
                        onClick={handleOpenAddDialog}
                        sx={{
                            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            borderRadius: 0, px: 4, py: 1.5,
                            backgroundColor: "#000", color: "#fff",
                            "&:hover": { backgroundColor: "#222" },
                            transition: "all 0.2s ease",
                        }}
                    >
                        New Sub Category
                    </Button>
                </Box>

                {/* ── SEARCH & FILTER ─────────────────────────── */}
                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                    {/* Search */}
                    <Box sx={{
                        flex: 1, minWidth: 220,
                        border: "1px solid #e0e0e0",
                        "&:focus-within": { border: "1px solid #000" },
                        transition: "border 0.2s",
                    }}>
                        <TextField
                            placeholder="Search sub categories..."
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

                    {/* Category filter */}
                    <Box sx={{
                        minWidth: 220,
                        border: "1px solid #e0e0e0",
                        "&:focus-within": { border: "1px solid #000" },
                        transition: "border 0.2s",
                    }}>
                        <TextField
                            select
                            label="Filter by Category"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            fullWidth
                            sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.categoryId} value={cat.categoryId}>
                                    {cat.categoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {/* Clear filters */}
                    {(searchTerm || filterCategory) && (
                        <Button
                            onClick={() => { setSearchTerm(""); setFilterCategory(""); }}
                            sx={{
                                fontFamily: "'Syne', sans-serif", fontWeight: 600,
                                fontSize: 11, letterSpacing: "0.06em",
                                textTransform: "uppercase", borderRadius: 0,
                                border: "1px solid #e0e0e0", color: "#888", px: 3,
                                "&:hover": { border: "1px solid #000", color: "#000", backgroundColor: "#f5f5f5" },
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </Box>

                {/* ── TABLE ──────────────────────────────────── */}
                <Paper elevation={0} sx={{ border: "1px solid #e8e8e8", overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["#", "Image", "Sub Category", "Parent", "Description", ""].map((h) => (
                                        <TableCell key={h} align={h === "" ? "center" : "left"}>
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
                                                Loading sub categories...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredSubCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <AccountTree sx={{ fontSize: 56, color: "#e8e8e8", mb: 2, display: "block", mx: "auto" }} />
                                            <Typography sx={{
                                                fontFamily: "'Syne', sans-serif",
                                                fontWeight: 700, fontSize: 18, color: "#000",
                                            }}>
                                                {searchTerm || filterCategory ? "No results found" : "No sub categories yet"}
                                            </Typography>
                                            <Typography sx={{
                                                fontFamily: "'DM Mono', monospace",
                                                fontSize: 12, color: "#aaa", mt: 1,
                                            }}>
                                                {searchTerm || filterCategory
                                                    ? "Try clearing filters"
                                                    : "Click 'New Sub Category' to get started"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubCategories.map((sc, index) => (
                                        <TableRow
                                            key={sc.subCategoryId}
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
                                                    src={getImageUrl(sc.imageUrl)}
                                                    variant="square"
                                                    sx={{
                                                        width: 52, height: 52,
                                                        backgroundColor: "#f5f5f5",
                                                        border: "1px solid #e8e8e8",
                                                    }}
                                                >
                                                    <AccountTree sx={{ color: "#ccc" }} />
                                                </Avatar>
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell>
                                                <Typography sx={{
                                                    fontFamily: "'Syne', sans-serif",
                                                    fontWeight: 700, fontSize: 14, color: "#000",
                                                }}>
                                                    {sc.subCategoryName}
                                                </Typography>
                                            </TableCell>

                                            {/* Parent category */}
                                            <TableCell>
                                                <Box component="span" sx={{
                                                    border: "1px solid #e0e0e0",
                                                    px: 1.2, py: 0.4,
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontSize: 11, color: "#555",
                                                    display: "inline-block",
                                                }}>
                                                    {sc.categoryName || "—"}
                                                </Box>
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
                                                    {sc.subCategoryDescription || "—"}
                                                </Typography>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell align="center">
                                                <Tooltip title="Edit" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEditDialog(sc)}
                                                        sx={{
                                                            mr: 0.5, color: "#000",
                                                            "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                            transition: "all 0.15s ease",
                                                        }}
                                                    >
                                                        <Edit sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDeleteDialog(sc)}
                                                        sx={{
                                                            color: "#ccc",
                                                            "&:hover": { backgroundColor: "#000", color: "#fff" },
                                                            transition: "all 0.15s ease",
                                                        }}
                                                    >
                                                        <Delete sx={{ fontSize: 16 }} />
                                                    </IconButton>
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
                <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth
                    PaperProps={{ sx: { borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}>
                    <DialogHeader
                        title="ADD SUB CATEGORY"
                        subtitle="CATALOG — NEW ENTRY"
                        onClose={handleCloseAddDialog}
                    />
                    <DialogContent sx={{ p: 3, pt: 3 }}>
                        <SubCategoryForm />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseAddDialog} variant="outlined" sx={cancelBtnSx}>Cancel</Button>
                        <Button onClick={handleAddSubCategory} disabled={formLoading || uploading} sx={primaryBtnSx}>
                            {formLoading || uploading ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CircularProgress size={16} color="inherit" />
                                    <span>{uploading ? "Uploading..." : "Saving..."}</span>
                                </Box>
                            ) : "Add Sub Category"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── EDIT DIALOG ──────────────────────────────── */}
                <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth
                    PaperProps={{ sx: { borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}>
                    <DialogHeader
                        title="EDIT SUB CATEGORY"
                        subtitle={selectedSubCategory?.subCategoryName}
                        onClose={handleCloseEditDialog}
                    />
                    <DialogContent sx={{ p: 3, pt: 3 }}>
                        <SubCategoryForm />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseEditDialog} variant="outlined" sx={cancelBtnSx}>Cancel</Button>
                        <Button onClick={handleEditSubCategory} disabled={formLoading || uploading} sx={primaryBtnSx}>
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
                <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth
                    PaperProps={{ sx: { borderRadius: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}>
                    <DialogHeader
                        title="DELETE SUB CATEGORY"
                        onClose={handleCloseDeleteDialog}
                    />
                    <DialogContent sx={{ p: 3 }}>
                        {/* Preview card */}
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 2,
                            mb: 3, p: 2,
                            border: "1px solid #e8e8e8",
                            backgroundColor: "#fafafa",
                        }}>
                            <Avatar
                                src={getImageUrl(selectedSubCategory?.imageUrl)}
                                variant="square"
                                sx={{
                                    width: 56, height: 56,
                                    backgroundColor: "#f0f0f0",
                                    border: "1px solid #e8e8e8",
                                    flexShrink: 0,
                                }}
                            >
                                <AccountTree sx={{ color: "#ccc" }} />
                            </Avatar>
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 700, fontSize: 15,
                                }}>
                                    {selectedSubCategory?.subCategoryName}
                                </Typography>
                                {selectedSubCategory?.categoryName && (
                                    <Box component="span" sx={{
                                        border: "1px solid #e0e0e0",
                                        px: 1, py: 0.3,
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: 10, color: "#888",
                                        display: "inline-block", mt: 0.5,
                                    }}>
                                        {selectedSubCategory.categoryName}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        <Alert severity="warning">This action cannot be undone.</Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "1px solid #e8e8e8" }}>
                        <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={cancelBtnSx}>Cancel</Button>
                        <Button onClick={handleDeleteSubCategory} disabled={formLoading} sx={primaryBtnSx}>
                            {formLoading ? <CircularProgress size={16} color="inherit" /> : "Delete"}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </ThemeProvider>
    );
};

export default SubCategoryManagement;