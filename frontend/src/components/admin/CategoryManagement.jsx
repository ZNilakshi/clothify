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
    Chip,
    InputAdornment,
    Tooltip,
    Avatar,
} from "@mui/material";
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

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Image states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        categoryName: "",
        categoryDescription: "",
        imageUrl: "",
    });
    const [formError, setFormError] = useState("");

    useEffect(() => { fetchCategories(); }, []);

    useEffect(() => {
        const filtered = categories.filter(
            (cat) =>
                cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (cat.categoryDescription &&
                    cat.categoryDescription.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredCategories(filtered);
    }, [searchTerm, categories]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
            setFilteredCategories(data);
        } catch (err) {
            showAlert("Failed to load categories", "error");
        } finally {
            setLoading(false);
        }
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

    // ==================== IMAGE ====================
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFormError("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setFormError("Image size must be less than 5MB");
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setFormError("");
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        setUploading(true);
        const formDataImg = new FormData();
        formDataImg.append("file", imageFile);
        try {
            const response = await api.post("/files/upload", formDataImg, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.fileUrl;
        } catch (err) {
            throw new Error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    // ==================== ADD ====================
    const handleOpenAddDialog = () => {
        resetForm();
        setAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setAddDialogOpen(false);
        resetForm();
    };

    const handleAddCategory = async () => {
        if (!formData.categoryName.trim()) {
            setFormError("Category name is required");
            return;
        }
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
        } finally {
            setFormLoading(false);
        }
    };

    // ==================== EDIT ====================
    const handleOpenEditDialog = (category) => {
        setSelectedCategory(category);
        setFormData({
            categoryName: category.categoryName,
            categoryDescription: category.categoryDescription || "",
            imageUrl: category.imageUrl || "",
        });
        setImagePreview(category.imageUrl ? getImageUrl(category.imageUrl) : null);
        setImageFile(null);
        setFormError("");
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedCategory(null);
        resetForm();
    };

    const handleEditCategory = async () => {
        if (!formData.categoryName.trim()) {
            setFormError("Category name is required");
            return;
        }
        setFormLoading(true);
        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) imageUrl = await uploadImage();

            await categoryService.updateCategory(selectedCategory.categoryId, {
                ...formData,
                imageUrl,
            });
            showAlert("Category updated successfully!");
            handleCloseEditDialog();
            fetchCategories();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to update category");
        } finally {
            setFormLoading(false);
        }
    };

    // ==================== DELETE ====================
    const handleOpenDeleteDialog = (category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
    };

    const handleDeleteCategory = async () => {
        setFormLoading(true);
        try {
            await categoryService.deleteCategory(selectedCategory.categoryId);
            showAlert("Category deleted successfully!");
            handleCloseDeleteDialog();
            fetchCategories();
        } catch (err) {
            showAlert(
                err.response?.data?.message || "Cannot delete category with existing products",
                "error"
            );
            handleCloseDeleteDialog();
        } finally {
            setFormLoading(false);
        }
    };

    // ==================== FORM ====================
    const CategoryForm = () => (
        <Box>
            {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                </Alert>
            )}

            {/* Image Upload */}
            <Box sx={{ mb: 3, textAlign: "center" }}>
                {imagePreview ? (
                    <Box>
                        <Avatar
                            src={imagePreview}
                            variant="rounded"
                            sx={{
                                width: 160,
                                height: 160,
                                mx: "auto",
                                mb: 1,
                                borderRadius: 3,
                            }}
                        />
                        <Button
                            size="small"
                            color="error"
                            onClick={handleRemoveImage}
                            startIcon={<Close />}
                        >
                            Remove Image
                        </Button>
                    </Box>
                ) : (
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        sx={{
                            py: 3,
                            px: 4,
                            borderStyle: "dashed",
                            borderWidth: 2,
                            borderRadius: 3,
                            width: "100%",
                            color: "text.secondary",
                        }}
                    >
                        Upload Category Image
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageChange}
                        />
                    </Button>
                )}
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Max 5MB · JPG, PNG, GIF
                </Typography>
            </Box>

            <TextField
                label="Category Name"
                value={formData.categoryName}
                onChange={(e) => {
                    setFormData({ ...formData, categoryName: e.target.value });
                    setFormError("");
                }}
                fullWidth
                required
                sx={{ mb: 2 }}
                placeholder="e.g. Electronics"
            />
            <TextField
                label="Description"
                value={formData.categoryDescription}
                onChange={(e) =>
                    setFormData({ ...formData, categoryDescription: e.target.value })
                }
                fullWidth
                multiline
                rows={3}
                placeholder="Brief description of the category..."
            />
        </Box>
    );

    return (
        <Box>
            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Category sx={{ color: "#3a7d44" }} />
                    <Typography variant="h5" fontWeight="bold">Categories</Typography>
                    <Chip
                        label={`${categories.length} total`}
                        size="small"
                        sx={{ backgroundColor: "#e8f5e9", color: "#3a7d44" }}
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenAddDialog}
                    sx={{
                        backgroundColor: "#3a7d44",
                        borderRadius: 2,
                        textTransform: "none",
                        px: 3,
                        "&:hover": { backgroundColor: "#2d6336" },
                    }}
                >
                    Add Category
                </Button>
            </Box>

            {/* Search */}
            <TextField
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start"><Search /></InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setSearchTerm("")}>
                                <Close fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {/* Table */}
            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#2b2b2b" }}>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>#</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Image</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Category Name</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Description</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Products</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <CircularProgress sx={{ color: "#3a7d44" }} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Category sx={{ fontSize: 50, color: "#ccc", mb: 1 }} />
                                        <Typography color="text.secondary">
                                            {searchTerm ? "No categories found" : "No categories yet"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map((category, index) => (
                                    <TableRow
                                        key={category.categoryId}
                                        sx={{
                                            "&:hover": { backgroundColor: "#f9f9f9" },
                                            "&:nth-of-type(even)": { backgroundColor: "#fafafa" },
                                        }}
                                    >
                                        <TableCell>{index + 1}</TableCell>

                                        {/* ✅ Image column */}
                                        <TableCell>
                                            <Avatar
                                                src={getImageUrl(category.imageUrl)}
                                                variant="rounded"
                                                sx={{
                                                    width: 52,
                                                    height: 52,
                                                    borderRadius: 2,
                                                    backgroundColor: "#e8f5e9",
                                                    color: "#3a7d44",
                                                }}
                                            >
                                                <Category />
                                            </Avatar>
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight="bold">
                                                {category.categoryName}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    maxWidth: 250,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {category.categoryDescription || "—"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={`${category.productCount || 0} products`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: category.productCount > 0 ? "#e8f5e9" : "#f5f5f5",
                                                    color: category.productCount > 0 ? "#3a7d44" : "text.secondary",
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    onClick={() => handleOpenEditDialog(category)}
                                                    sx={{ color: "#1976d2", "&:hover": { backgroundColor: "#e3f2fd" } }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title={category.productCount > 0 ? "Cannot delete (has products)" : "Delete"}>
                                                <span>
                                                    <IconButton
                                                        onClick={() => handleOpenDeleteDialog(category)}
                                                        disabled={category.productCount > 0}
                                                        sx={{
                                                            color: "#d32f2f",
                                                            "&:hover": { backgroundColor: "#fde8e8" },
                                                            "&:disabled": { color: "#ccc" },
                                                        }}
                                                    >
                                                        <Delete />
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

            {/* ==================== ADD DIALOG ==================== */}
            <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" fontWeight="bold">Add New Category</Typography>
                        <IconButton onClick={handleCloseAddDialog}><Close /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <CategoryForm />
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseAddDialog} variant="outlined"
                        sx={{ textTransform: "none", borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddCategory} variant="contained"
                        disabled={formLoading || uploading}
                        sx={{ backgroundColor: "#3a7d44", textTransform: "none", borderRadius: 2, px: 3, "&:hover": { backgroundColor: "#2d6336" } }}>
                        {formLoading || uploading
                            ? <CircularProgress size={20} color="inherit" />
                            : "Add Category"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== EDIT DIALOG ==================== */}
            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" fontWeight="bold">Edit Category</Typography>
                        <IconButton onClick={handleCloseEditDialog}><Close /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <CategoryForm />
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseEditDialog} variant="outlined"
                        sx={{ textTransform: "none", borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleEditCategory} variant="contained"
                        disabled={formLoading || uploading}
                        sx={{ backgroundColor: "#1976d2", textTransform: "none", borderRadius: 2, px: 3, "&:hover": { backgroundColor: "#1565c0" } }}>
                        {formLoading || uploading
                            ? <CircularProgress size={20} color="inherit" />
                            : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== DELETE DIALOG ==================== */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" fontWeight="bold" color="error">Delete Category</Typography>
                        <IconButton onClick={handleCloseDeleteDialog}><Close /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Avatar
                            src={getImageUrl(selectedCategory?.imageUrl)}
                            variant="rounded"
                            sx={{ width: 52, height: 52, borderRadius: 2, backgroundColor: "#e8f5e9" }}
                        >
                            <Category sx={{ color: "#3a7d44" }} />
                        </Avatar>
                        <Typography>
                            Are you sure you want to delete{" "}
                            <strong>{selectedCategory?.categoryName}</strong>?
                        </Typography>
                    </Box>
                    <Alert severity="warning">This action cannot be undone!</Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseDeleteDialog} variant="outlined"
                        sx={{ textTransform: "none", borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteCategory} variant="contained" color="error"
                        disabled={formLoading}
                        sx={{ textTransform: "none", borderRadius: 2, px: 3 }}>
                        {formLoading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryManagement;