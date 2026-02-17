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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
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
    AccountTree,
    CloudUpload,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import subCategoryService from "../../services/subCategoryService";
import categoryService from "../../services/categoryService";
import api from "../../services/api";

const SubCategoryManagement = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Image states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        subCategoryName: "",
        subCategoryDescription: "",
        categoryId: "",
        imageUrl: "",
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
            filtered = filtered.filter(
                (sc) => sc.categoryId === parseInt(filterCategory)
            );
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
        } catch (err) {
            showAlert("Failed to load data", "error");
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
        setFormData({ subCategoryName: "", subCategoryDescription: "", categoryId: "", imageUrl: "" });
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
        } catch {
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

    const handleAddSubCategory = async () => {
        if (!formData.subCategoryName.trim()) {
            setFormError("Sub category name is required");
            return;
        }
        if (!formData.categoryId) {
            setFormError("Please select a category");
            return;
        }

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
            handleCloseAddDialog();
            fetchData();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to create sub category");
        } finally {
            setFormLoading(false);
        }
    };

    // ==================== EDIT ====================
    const handleOpenEditDialog = (subCategory) => {
        setSelectedSubCategory(subCategory);
        setFormData({
            subCategoryName: subCategory.subCategoryName,
            subCategoryDescription: subCategory.subCategoryDescription || "",
            categoryId: subCategory.categoryId || "",
            imageUrl: subCategory.imageUrl || "",
        });
        setImagePreview(subCategory.imageUrl ? getImageUrl(subCategory.imageUrl) : null);
        setImageFile(null);
        setFormError("");
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedSubCategory(null);
        resetForm();
    };

    const handleEditSubCategory = async () => {
        if (!formData.subCategoryName.trim()) {
            setFormError("Sub category name is required");
            return;
        }
        if (!formData.categoryId) {
            setFormError("Please select a category");
            return;
        }

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
            handleCloseEditDialog();
            fetchData();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to update sub category");
        } finally {
            setFormLoading(false);
        }
    };

    // ==================== DELETE ====================
    const handleOpenDeleteDialog = (subCategory) => {
        setSelectedSubCategory(subCategory);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedSubCategory(null);
    };

    const handleDeleteSubCategory = async () => {
        setFormLoading(true);
        try {
            await subCategoryService.deleteSubCategory(selectedSubCategory.subCategoryId);
            showAlert("Sub category deleted successfully!");
            handleCloseDeleteDialog();
            fetchData();
        } catch (err) {
            showAlert(err.response?.data?.message || "Failed to delete sub category", "error");
            handleCloseDeleteDialog();
        } finally {
            setFormLoading(false);
        }
    };

    // ==================== FORM ====================
    const SubCategoryForm = () => (
        <Box>
            {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>
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
                        Upload Sub Category Image
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
                label="Category"
                value={formData.categoryId}
                onChange={(e) => {
                    setFormData({ ...formData, categoryId: e.target.value });
                    setFormError("");
                }}
                select fullWidth required sx={{ mb: 2 }}
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
                onChange={(e) => {
                    setFormData({ ...formData, subCategoryName: e.target.value });
                    setFormError("");
                }}
                fullWidth required sx={{ mb: 2 }}
                placeholder="e.g. Smartphones"
            />

            <TextField
                label="Description"
                value={formData.subCategoryDescription}
                onChange={(e) =>
                    setFormData({ ...formData, subCategoryDescription: e.target.value })
                }
                fullWidth multiline rows={3}
                placeholder="Brief description..."
            />
        </Box>
    );

    return (
        <Box>
            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>
            )}

            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountTree sx={{ color: "#3a7d44" }} />
                    <Typography variant="h5" fontWeight="bold">Sub Categories</Typography>
                    <Chip
                        label={`${subCategories.length} total`}
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
                    Add Sub Category
                </Button>
            </Box>

            {/* Search & Filter */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                    placeholder="Search sub categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 1 }}
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
                <TextField
                    select
                    label="Filter by Category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    sx={{ minWidth: 220 }}
                >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat.categoryId} value={cat.categoryId}>
                            {cat.categoryName}
                        </MenuItem>
                    ))}
                </TextField>
                {(searchTerm || filterCategory) && (
                    <Button
                        variant="outlined"
                        onClick={() => { setSearchTerm(""); setFilterCategory(""); }}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Clear
                    </Button>
                )}
            </Box>

            {/* Table */}
            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#2b2b2b" }}>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>#</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Image</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Sub Category</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Category</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Description</TableCell>
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
                            ) : filteredSubCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <AccountTree sx={{ fontSize: 50, color: "#ccc", mb: 1 }} />
                                        <Typography color="text.secondary">
                                            {searchTerm || filterCategory
                                                ? "No sub categories found"
                                                : "No sub categories yet"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubCategories.map((sc, index) => (
                                    <TableRow
                                        key={sc.subCategoryId}
                                        sx={{
                                            "&:hover": { backgroundColor: "#f9f9f9" },
                                            "&:nth-of-type(even)": { backgroundColor: "#fafafa" },
                                        }}
                                    >
                                        <TableCell>{index + 1}</TableCell>

                                        {/* Image */}
                                        <TableCell>
                                            <Avatar
                                                src={getImageUrl(sc.imageUrl)}
                                                variant="rounded"
                                                sx={{
                                                    width: 52,
                                                    height: 52,
                                                    borderRadius: 2,
                                                    backgroundColor: "#e8f5e9",
                                                    color: "#3a7d44",
                                                }}
                                            >
                                                <AccountTree />
                                            </Avatar>
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight="bold">
                                                {sc.subCategoryName}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={sc.categoryName}
                                                size="small"
                                                sx={{ backgroundColor: "#e8f5e9", color: "#3a7d44", fontWeight: 500 }}
                                            />
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
                                                {sc.subCategoryDescription || "—"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    onClick={() => handleOpenEditDialog(sc)}
                                                    sx={{ color: "#1976d2", "&:hover": { backgroundColor: "#e3f2fd" } }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    onClick={() => handleOpenDeleteDialog(sc)}
                                                    sx={{ color: "#d32f2f", "&:hover": { backgroundColor: "#fde8e8" } }}
                                                >
                                                    <Delete />
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

            {/* ==================== ADD DIALOG ==================== */}
            <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" fontWeight="bold">Add New Sub Category</Typography>
                        <IconButton onClick={handleCloseAddDialog}><Close /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <SubCategoryForm />
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseAddDialog} variant="outlined"
                        sx={{ textTransform: "none", borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddSubCategory} variant="contained"
                        disabled={formLoading || uploading}
                        sx={{ backgroundColor: "#3a7d44", textTransform: "none", borderRadius: 2, px: 3, "&:hover": { backgroundColor: "#2d6336" } }}>
                        {formLoading || uploading
                            ? <CircularProgress size={20} color="inherit" />
                            : "Add Sub Category"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== EDIT DIALOG ==================== */}
            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" fontWeight="bold">Edit Sub Category</Typography>
                        <IconButton onClick={handleCloseEditDialog}><Close /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <SubCategoryForm />
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseEditDialog} variant="outlined"
                        sx={{ textTransform: "none", borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleEditSubCategory} variant="contained"
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
                        <Typography variant="h6" fontWeight="bold" color="error">Delete Sub Category</Typography>
                        <IconButton onClick={handleCloseDeleteDialog}><Close /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Avatar
                            src={getImageUrl(selectedSubCategory?.imageUrl)}
                            variant="rounded"
                            sx={{ width: 52, height: 52, borderRadius: 2, backgroundColor: "#e8f5e9" }}
                        >
                            <AccountTree sx={{ color: "#3a7d44" }} />
                        </Avatar>
                        <Box>
                            <Typography fontWeight="bold">
                                {selectedSubCategory?.subCategoryName}
                            </Typography>
                            <Chip
                                label={selectedSubCategory?.categoryName}
                                size="small"
                                sx={{ backgroundColor: "#e8f5e9", color: "#3a7d44", mt: 0.5 }}
                            />
                        </Box>
                    </Box>
                    <Alert severity="warning">This action cannot be undone!</Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseDeleteDialog} variant="outlined"
                        sx={{ textTransform: "none", borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteSubCategory} variant="contained"
                        color="error" disabled={formLoading}
                        sx={{ textTransform: "none", borderRadius: 2, px: 3 }}>
                        {formLoading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SubCategoryManagement;