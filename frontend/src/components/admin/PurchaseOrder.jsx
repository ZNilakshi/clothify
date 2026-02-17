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
    Grid,
    alpha,
    Stepper,
    Step,
    StepLabel,
    Divider,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    RadioGroup,
    FormControlLabel,
    Radio,
    Autocomplete,
    Collapse,
} from "@mui/material";
import {
    Add,
    Delete,
    Search,
    Close,
    Inventory,
    Person,
    Phone,
    LocationOn,
    Payment,
    CheckCircle,
    Pending,
    Receipt as ReceiptIcon,
    AttachMoney,
    CreditCard,
    AccountBalance,
    Save,
    History,
    CalendarToday,
} from "@mui/icons-material";
import { useState, useEffect, useCallback, useMemo } from "react";

// Simple date input component
const DateInput = ({ label, value, onChange }) => {
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleChange = (e) => {
        const dateValue = e.target.value;
        if (dateValue) {
            onChange(new Date(dateValue));
        } else {
            onChange(null);
        }
    };

    return (
        <TextField
            label={label}
            type="date"
            value={formatDateForInput(value)}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <CalendarToday sx={{ fontSize: 18, color: '#64748b' }} />
                    </InputAdornment>
                ),
            }}
        />
    );
};

// Payment method options
const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash", icon: AttachMoney },
    { value: "CHEQUE", label: "Cheque", icon: ReceiptIcon },
    { value: "BANK_TRANSFER", label: "Bank Transfer", icon: AccountBalance },
    { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
];

// Payment status options
const PAYMENT_STATUS = [
    { value: "PAID", label: "Paid", color: "#22c55e", icon: CheckCircle },
    { value: "PARTIAL", label: "Partial", color: "#eab308", icon: Pending },
    { value: "PENDING", label: "Pending", color: "#ef4444", icon: Close },
];

// Purchase status options
const PURCHASE_STATUS = [
    { value: "DRAFT", label: "Draft", color: "#64748b" },
    { value: "ORDERED", label: "Ordered", color: "#3b82f6" },
    { value: "RECEIVED", label: "Received", color: "#22c55e" },
    { value: "CANCELLED", label: "Cancelled", color: "#ef4444" },
];

// Section Title Component
const SectionTitle = ({ children, icon: Icon, count, action }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2, 
        mt: 3,
        '&:first-of-type': { mt: 0 }
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {Icon && <Icon sx={{ color: '#3a7d44', fontSize: 24 }} />}
            <Typography variant="h6" fontWeight="600" sx={{ color: '#1e293b' }}>
                {children}
            </Typography>
            {count !== undefined && (
                <Chip 
                    label={count} 
                    size="small"
                    sx={{ 
                        backgroundColor: alpha('#3a7d44', 0.1),
                        color: '#3a7d44',
                        fontWeight: 600,
                    }}
                />
            )}
        </Box>
        {action}
    </Box>
);

// New Supplier Dialog
const NewSupplierDialog = ({ open, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        taxId: '',
        paymentTerms: '',
    });

    const handleSave = () => {
        onSave(formData);
        onClose();
        setFormData({ name: '', phone: '', email: '', address: '', taxId: '', paymentTerms: '' });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="700">Add New Supplier</Typography>
                    <IconButton onClick={onClose}><Close /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        <TextField
                            label="Supplier Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tax ID / GST"
                            value={formData.taxId}
                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Payment Terms"
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                            fullWidth
                            size="small"
                            placeholder="e.g., Net 30"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained"
                    disabled={!formData.name}
                    sx={{ backgroundColor: '#3a7d44' }}
                >
                    Save Supplier
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Add Product Item Dialog
const AddProductDialog = ({ open, onClose, onAdd }) => {
    const [searchType, setSearchType] = useState('sku');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [manualProduct, setManualProduct] = useState({
        name: '',
        sku: '',
        unitPrice: '',
        quantity: 1,
    });
    const [loading, setLoading] = useState(false);

    // Mock product search
    const handleSearch = async () => {
        if (!searchTerm) return;
        setLoading(true);
        try {
            // Mock data - replace with actual API call
            const mockResults = [
                {
                    productId: 1,
                    productName: 'Sample Product 1',
                    sku: 'SKU001',
                    price: 29.99,
                    stockQuantity: 50,
                    imageUrl: null,
                },
                {
                    productId: 2,
                    productName: 'Sample Product 2',
                    sku: 'SKU002',
                    price: 49.99,
                    stockQuantity: 30,
                    imageUrl: null,
                },
            ];
            setSearchResults(mockResults);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = (product) => {
        if (searchType === 'sku' && product) {
            onAdd({
                ...product,
                quantity: 1,
                total: product.price,
            });
        } else if (searchType === 'manual' && manualProduct.name) {
            onAdd({
                productId: `temp_${Date.now()}`,
                productName: manualProduct.name,
                sku: manualProduct.sku || `MAN-${Date.now()}`,
                unitPrice: parseFloat(manualProduct.unitPrice) || 0,
                quantity: parseInt(manualProduct.quantity) || 1,
                total: (parseFloat(manualProduct.unitPrice) || 0) * (parseInt(manualProduct.quantity) || 1),
            });
        }
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setSearchTerm('');
        setSearchResults([]);
        setManualProduct({ name: '', sku: '', unitPrice: '', quantity: 1 });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="700">Add Product to Purchase</Typography>
                    <IconButton onClick={onClose}><Close /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <RadioGroup 
                        row 
                        value={searchType} 
                        onChange={(e) => setSearchType(e.target.value)}
                        sx={{ gap: 2 }}
                    >
                        <FormControlLabel 
                            value="sku" 
                            control={<Radio />} 
                            label="Search by SKU/Name" 
                        />
                        <FormControlLabel 
                            value="manual" 
                            control={<Radio />} 
                            label="Add New Product" 
                        />
                    </RadioGroup>
                </Box>

                {searchType === 'sku' ? (
                    <>
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            <TextField
                                placeholder="Enter SKU or product name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                fullWidth
                                size="small"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                }}
                            />
                            <Button 
                                variant="contained" 
                                onClick={handleSearch}
                                disabled={!searchTerm || loading}
                                sx={{ backgroundColor: '#3a7d44', minWidth: 100 }}
                            >
                                {loading ? <CircularProgress size={20} /> : 'Search'}
                            </Button>
                        </Box>

                        {searchResults.length > 0 && (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                            <TableCell>Product</TableCell>
                                            <TableCell>SKU</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                            <TableCell align="center">Stock</TableCell>
                                            <TableCell align="center">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {searchResults.map((product) => (
                                            <TableRow key={product.productId} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar src={product.imageUrl} sx={{ width: 32, height: 32 }} />
                                                        <Typography variant="body2">{product.productName}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={product.sku} size="small" sx={{ backgroundColor: '#f1f5f9' }} />
                                                </TableCell>
                                                <TableCell align="right">${product.price?.toFixed(2)}</TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                        label={product.stockQuantity} 
                                                        size="small"
                                                        color={product.stockQuantity > 10 ? 'success' : product.stockQuantity > 0 ? 'warning' : 'error'}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleAdd(product)}
                                                        sx={{ borderColor: '#3a7d44', color: '#3a7d44' }}
                                                    >
                                                        Select
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
                ) : (
                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <TextField
                                label="Product Name *"
                                value={manualProduct.name}
                                onChange={(e) => setManualProduct({ ...manualProduct, name: e.target.value })}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="SKU (Optional)"
                                value={manualProduct.sku}
                                onChange={(e) => setManualProduct({ ...manualProduct, sku: e.target.value })}
                                fullWidth
                                size="small"
                                placeholder="Auto-generated if empty"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Unit Price"
                                type="number"
                                value={manualProduct.unitPrice}
                                onChange={(e) => setManualProduct({ ...manualProduct, unitPrice: e.target.value })}
                                fullWidth
                                size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Quantity"
                                type="number"
                                value={manualProduct.quantity}
                                onChange={(e) => setManualProduct({ ...manualProduct, quantity: parseInt(e.target.value) })}
                                fullWidth
                                size="small"
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                {searchType === 'manual' && (
                    <Button 
                        onClick={() => handleAdd()} 
                        variant="contained"
                        disabled={!manualProduct.name}
                        sx={{ backgroundColor: '#3a7d44' }}
                    >
                        Add Product
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

// Main Purchase Component
const PurchaseOrder = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
    const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
    
    const [purchaseData, setPurchaseData] = useState({
        referenceNo: `PO-${Date.now().toString().slice(-6)}`,
        purchaseDate: new Date(),
        expectedDelivery: null,
        status: 'DRAFT',
        notes: '',
        items: [],
        payment: {
            method: 'CASH',
            status: 'PENDING',
            paidAmount: 0,
            transactionId: '',
            chequeNo: '',
            bankName: '',
            dueDate: null,
        },
        subtotal: 0,
        tax: 0,
        discount: 0,
        shipping: 0,
        total: 0,
    });

    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

    // Calculate totals
    useEffect(() => {
        const subtotal = purchaseData.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const tax = subtotal * 0.1; // 10% tax example
        const total = subtotal + tax + purchaseData.shipping - purchaseData.discount;
        
        setPurchaseData(prev => ({
            ...prev,
            subtotal,
            tax,
            total,
        }));
    }, [purchaseData.items, purchaseData.shipping, purchaseData.discount]);

    // Mock suppliers
    useEffect(() => {
        setSuppliers([
            { id: 1, name: 'Supplier A', phone: '123-456-7890', email: 'a@example.com', address: '123 Main St' },
            { id: 2, name: 'Supplier B', phone: '098-765-4321', email: 'b@example.com', address: '456 Oak Ave' },
        ]);
    }, []);

    const handleAddSupplier = (supplierData) => {
        const newSupplier = { id: Date.now(), ...supplierData };
        setSuppliers(prev => [...prev, newSupplier]);
        setSelectedSupplier(newSupplier);
        showAlert('Supplier added successfully!');
    };

    const handleAddItem = (product) => {
        setPurchaseData(prev => ({
            ...prev,
            items: [...prev.items, {
                ...product,
                itemId: `item_${Date.now()}_${prev.items.length}`,
                unitPrice: product.price || product.unitPrice,
            }],
        }));
    };

    const handleUpdateItemQuantity = (itemId, quantity) => {
        setPurchaseData(prev => ({
            ...prev,
            items: prev.items.map(item => 
                item.itemId === itemId 
                    ? { ...item, quantity, total: (item.unitPrice || item.price) * quantity }
                    : item
            ),
        }));
    };

    const handleUpdateItemPrice = (itemId, price) => {
        setPurchaseData(prev => ({
            ...prev,
            items: prev.items.map(item => 
                item.itemId === itemId 
                    ? { ...item, unitPrice: price, total: price * item.quantity }
                    : item
            ),
        }));
    };

    const handleRemoveItem = (itemId) => {
        setPurchaseData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.itemId !== itemId),
        }));
    };

    const showAlert = (message, severity = 'success') => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 4000);
    };

    const handleSavePurchase = async () => {
        try {
            console.log('Saving purchase:', { ...purchaseData, supplier: selectedSupplier });
            showAlert('Purchase order saved successfully!');
        } catch (error) {
            showAlert('Failed to save purchase order', 'error');
        }
    };

    const steps = ['Supplier Details', 'Items', 'Payment', 'Review'];

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 3, borderRadius: 2 }}>
                    {alert.message}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4,
                flexWrap: 'wrap',
                gap: 2,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        backgroundColor: alpha('#3a7d44', 0.1),
                        borderRadius: 3,
                        p: 1.5,
                    }}>
                        <ReceiptIcon sx={{ color: '#3a7d44', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight="700" sx={{ color: '#1e293b' }}>
                            Purchase Order
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Create and manage purchase orders
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<History />}
                        sx={{ borderRadius: 2 }}
                    >
                        History
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSavePurchase}
                        sx={{ 
                            backgroundColor: '#3a7d44',
                            borderRadius: 2,
                            '&:hover': { backgroundColor: '#2d6336' }
                        }}
                    >
                        Save Purchase
                    </Button>
                </Box>
            </Box>

            {/* Stepper */}
            <Stepper 
                activeStep={activeStep} 
                sx={{ mb: 4 }}
                alternativeLabel
            >
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Main Content */}
            <Grid container spacing={3}>
                {/* Left Column - Main Form */}
                <Grid item xs={12} lg={8}>
                    {/* Step 1: Supplier Details */}
                    {activeStep === 0 && (
                        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle icon={Person} count={suppliers.length}>
                                    Select Supplier
                                </SectionTitle>

                                <Grid container spacing={2.5}>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                            <Autocomplete
                                                options={suppliers}
                                                getOptionLabel={(option) => option.name}
                                                value={selectedSupplier}
                                                onChange={(_, newValue) => setSelectedSupplier(newValue)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Search Supplier"
                                                        placeholder="Type to search..."
                                                        size="small"
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <Box component="li" {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <Typography variant="body2" fontWeight="600">{option.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {option.phone} • {option.email}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                sx={{ flex: 1 }}
                                            />
                                            <Button
                                                variant="outlined"
                                                startIcon={<Add />}
                                                onClick={() => setSupplierDialogOpen(true)}
                                                sx={{ 
                                                    height: 40,
                                                    borderColor: '#3a7d44',
                                                    color: '#3a7d44',
                                                }}
                                            >
                                                New
                                            </Button>
                                        </Box>
                                    </Grid>

                                    {selectedSupplier && (
                                        <>
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <Person sx={{ color: '#64748b', fontSize: 20 }} />
                                                    <Typography variant="body2">{selectedSupplier.name}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <Phone sx={{ color: '#64748b', fontSize: 20 }} />
                                                    <Typography variant="body2">{selectedSupplier.phone || 'No phone'}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                    <LocationOn sx={{ color: '#64748b', fontSize: 20 }} />
                                                    <Typography variant="body2">{selectedSupplier.address || 'No address'}</Typography>
                                                </Box>
                                            </Grid>
                                        </>
                                    )}

                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 1 }} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Reference No."
                                            value={purchaseData.referenceNo}
                                            onChange={(e) => setPurchaseData({ ...purchaseData, referenceNo: e.target.value })}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <DateInput
                                            label="Purchase Date"
                                            value={purchaseData.purchaseDate}
                                            onChange={(date) => setPurchaseData({ ...purchaseData, purchaseDate: date })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <DateInput
                                            label="Expected Delivery"
                                            value={purchaseData.expectedDelivery}
                                            onChange={(date) => setPurchaseData({ ...purchaseData, expectedDelivery: date })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={purchaseData.status}
                                                onChange={(e) => setPurchaseData({ ...purchaseData, status: e.target.value })}
                                                label="Status"
                                            >
                                                {PURCHASE_STATUS.map(status => (
                                                    <MenuItem key={status.value} value={status.value}>
                                                        <Chip 
                                                            label={status.label} 
                                                            size="small"
                                                            sx={{ 
                                                                backgroundColor: alpha(status.color, 0.1),
                                                                color: status.color,
                                                            }}
                                                        />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Notes"
                                            value={purchaseData.notes}
                                            onChange={(e) => setPurchaseData({ ...purchaseData, notes: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            size="small"
                                            placeholder="Additional notes about this purchase..."
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => setActiveStep(1)}
                                        disabled={!selectedSupplier}
                                        sx={{ backgroundColor: '#3a7d44' }}
                                    >
                                        Next: Add Items
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Items */}
                    {activeStep === 1 && (
                        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle 
                                    icon={Inventory} 
                                    count={purchaseData.items.length}
                                    action={
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => setAddProductDialogOpen(true)}
                                            size="small"
                                            sx={{ backgroundColor: '#3a7d44' }}
                                        >
                                            Add Item
                                        </Button>
                                    }
                                >
                                    Purchase Items
                                </SectionTitle>

                                {purchaseData.items.length === 0 ? (
                                    <Box sx={{ 
                                        p: 4, 
                                        textAlign: 'center',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 2,
                                        border: '2px dashed #e0e0e0',
                                    }}>
                                        <Inventory sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                                        <Typography variant="body1" sx={{ color: '#64748b' }}>
                                            No items added yet
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Add />}
                                            onClick={() => setAddProductDialogOpen(true)}
                                            sx={{ mt: 2, borderColor: '#3a7d44', color: '#3a7d44' }}
                                        >
                                            Add Your First Item
                                        </Button>
                                    </Box>
                                ) : (
                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                                    <TableCell>Product</TableCell>
                                                    <TableCell>SKU</TableCell>
                                                    <TableCell align="right">Unit Price</TableCell>
                                                    <TableCell align="center">Quantity</TableCell>
                                                    <TableCell align="right">Total</TableCell>
                                                    <TableCell align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {purchaseData.items.map((item) => (
                                                    <TableRow key={item.itemId} hover>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar src={item.imageUrl} sx={{ width: 32, height: 32 }} />
                                                                <Typography variant="body2">{item.productName}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={item.sku} 
                                                                size="small" 
                                                                sx={{ backgroundColor: '#f1f5f9' }} 
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <TextField
                                                                type="number"
                                                                value={item.unitPrice || item.price}
                                                                onChange={(e) => handleUpdateItemPrice(item.itemId, parseFloat(e.target.value))}
                                                                size="small"
                                                                InputProps={{
                                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                                }}
                                                                sx={{ width: 120 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <TextField
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => handleUpdateItemQuantity(item.itemId, parseInt(e.target.value))}
                                                                size="small"
                                                                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                                sx={{ width: 80 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography fontWeight="600" color="#3a7d44">
                                                                ${(item.total || 0).toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleRemoveItem(item.itemId)}
                                                                sx={{ color: '#ef4444' }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setActiveStep(0)}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setActiveStep(2)}
                                        disabled={purchaseData.items.length === 0}
                                        sx={{ backgroundColor: '#3a7d44' }}
                                    >
                                        Next: Payment Details
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Payment */}
                    {activeStep === 2 && (
                        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle icon={Payment}>Payment Details</SectionTitle>

                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                                            Payment Method
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={purchaseData.payment.method}
                                            onChange={(e) => setPurchaseData({
                                                ...purchaseData,
                                                payment: { ...purchaseData.payment, method: e.target.value }
                                            })}
                                            sx={{ gap: 2 }}
                                        >
                                            {PAYMENT_METHODS.map((method) => (
                                                <Paper
                                                    key={method.value}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        flex: 1,
                                                        cursor: 'pointer',
                                                        borderColor: purchaseData.payment.method === method.value 
                                                            ? '#3a7d44' 
                                                            : '#e0e0e0',
                                                        backgroundColor: purchaseData.payment.method === method.value 
                                                            ? alpha('#3a7d44', 0.05)
                                                            : '#fff',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            borderColor: '#3a7d44',
                                                            backgroundColor: alpha('#3a7d44', 0.02),
                                                        },
                                                    }}
                                                    onClick={() => setPurchaseData({
                                                        ...purchaseData,
                                                        payment: { ...purchaseData.payment, method: method.value }
                                                    })}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <method.icon sx={{ color: '#64748b' }} />
                                                        <Typography variant="body2">{method.label}</Typography>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </RadioGroup>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                                            Payment Status
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={purchaseData.payment.status}
                                            onChange={(e) => setPurchaseData({
                                                ...purchaseData,
                                                payment: { ...purchaseData.payment, status: e.target.value }
                                            })}
                                            sx={{ gap: 2 }}
                                        >
                                            {PAYMENT_STATUS.map((status) => (
                                                <Paper
                                                    key={status.value}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        flex: 1,
                                                        cursor: 'pointer',
                                                        borderColor: purchaseData.payment.status === status.value 
                                                            ? status.color 
                                                            : '#e0e0e0',
                                                        backgroundColor: purchaseData.payment.status === status.value 
                                                            ? alpha(status.color, 0.05)
                                                            : '#fff',
                                                    }}
                                                    onClick={() => setPurchaseData({
                                                        ...purchaseData,
                                                        payment: { ...purchaseData.payment, status: status.value }
                                                    })}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <status.icon sx={{ color: status.color }} />
                                                        <Typography variant="body2">{status.label}</Typography>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </RadioGroup>
                                    </Grid>

                                    {(purchaseData.payment.status === 'PAID' || purchaseData.payment.status === 'PARTIAL') && (
                                        <Grid item xs={12}>
                                            <Collapse in={true}>
                                                <Grid container spacing={2.5}>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Amount Paid"
                                                            type="number"
                                                            value={purchaseData.payment.paidAmount}
                                                            onChange={(e) => setPurchaseData({
                                                                ...purchaseData,
                                                                payment: { ...purchaseData.payment, paidAmount: parseFloat(e.target.value) }
                                                            })}
                                                            fullWidth
                                                            size="small"
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                            }}
                                                        />
                                                    </Grid>
                                                    
                                                    {purchaseData.payment.method === 'CHEQUE' && (
                                                        <>
                                                            <Grid item xs={12} sm={6}>
                                                                <TextField
                                                                    label="Cheque Number"
                                                                    value={purchaseData.payment.chequeNo}
                                                                    onChange={(e) => setPurchaseData({
                                                                        ...purchaseData,
                                                                        payment: { ...purchaseData.payment, chequeNo: e.target.value }
                                                                    })}
                                                                    fullWidth
                                                                    size="small"
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={6}>
                                                                <TextField
                                                                    label="Bank Name"
                                                                    value={purchaseData.payment.bankName}
                                                                    onChange={(e) => setPurchaseData({
                                                                        ...purchaseData,
                                                                        payment: { ...purchaseData.payment, bankName: e.target.value }
                                                                    })}
                                                                    fullWidth
                                                                    size="small"
                                                                />
                                                            </Grid>
                                                        </>
                                                    )}

                                                    {purchaseData.payment.method === 'BANK_TRANSFER' && (
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                label="Transaction ID"
                                                                value={purchaseData.payment.transactionId}
                                                                onChange={(e) => setPurchaseData({
                                                                    ...purchaseData,
                                                                    payment: { ...purchaseData.payment, transactionId: e.target.value }
                                                                })}
                                                                fullWidth
                                                                size="small"
                                                            />
                                                        </Grid>
                                                    )}

                                                    {purchaseData.payment.status === 'PARTIAL' && (
                                                        <Grid item xs={12} sm={6}>
                                                            <DateInput
                                                                label="Due Date"
                                                                value={purchaseData.payment.dueDate}
                                                                onChange={(date) => setPurchaseData({
                                                                    ...purchaseData,
                                                                    payment: { ...purchaseData.payment, dueDate: date }
                                                                })}
                                                            />
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Collapse>
                                        </Grid>
                                    )}
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                    <Button variant="outlined" onClick={() => setActiveStep(1)}>
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setActiveStep(3)}
                                        sx={{ backgroundColor: '#3a7d44' }}
                                    >
                                        Next: Review
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Review */}
                    {activeStep === 3 && (
                        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle icon={ReceiptIcon}>Review Purchase Order</SectionTitle>

                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc' }}>
                                            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                                                Supplier Information
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Name</Typography>
                                                    <Typography variant="body2">{selectedSupplier?.name}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                                                    <Typography variant="body2">{selectedSupplier?.phone || '—'}</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="caption" color="text.secondary">Address</Typography>
                                                    <Typography variant="body2">{selectedSupplier?.address || '—'}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                                            Order Summary
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                                        <TableCell>Item</TableCell>
                                                        <TableCell align="right">Qty</TableCell>
                                                        <TableCell align="right">Unit Price</TableCell>
                                                        <TableCell align="right">Total</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {purchaseData.items.map((item) => (
                                                        <TableRow key={item.itemId}>
                                                            <TableCell>
                                                                <Typography variant="body2">{item.productName}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    SKU: {item.sku}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">{item.quantity}</TableCell>
                                                            <TableCell align="right">${(item.unitPrice || item.price).toFixed(2)}</TableCell>
                                                            <TableCell align="right">${(item.total || 0).toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <Box sx={{ width: 300 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Subtotal:</Typography>
                                                    <Typography variant="body2">${purchaseData.subtotal.toFixed(2)}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Tax (10%):</Typography>
                                                    <Typography variant="body2">${purchaseData.tax.toFixed(2)}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Shipping:</Typography>
                                                    <TextField
                                                        type="number"
                                                        value={purchaseData.shipping}
                                                        onChange={(e) => setPurchaseData({ 
                                                            ...purchaseData, 
                                                            shipping: parseFloat(e.target.value) || 0 
                                                        })}
                                                        size="small"
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                        }}
                                                        sx={{ width: 120 }}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Discount:</Typography>
                                                    <TextField
                                                        type="number"
                                                        value={purchaseData.discount}
                                                        onChange={(e) => setPurchaseData({ 
                                                            ...purchaseData, 
                                                            discount: parseFloat(e.target.value) || 0 
                                                        })}
                                                        size="small"
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                        }}
                                                        sx={{ width: 120 }}
                                                    />
                                                </Box>
                                                <Divider sx={{ my: 1 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="subtitle1" fontWeight="600">Total:</Typography>
                                                    <Typography variant="h6" fontWeight="700" color="#3a7d44">
                                                        ${purchaseData.total.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                                                Payment Summary
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" color="text.secondary">Method</Typography>
                                                    <Typography variant="body2">{purchaseData.payment.method}</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                                    <Chip 
                                                        label={purchaseData.payment.status}
                                                        size="small"
                                                        sx={{ 
                                                            backgroundColor: alpha(
                                                                PAYMENT_STATUS.find(s => s.value === purchaseData.payment.status)?.color || '#000',
                                                                0.1
                                                            ),
                                                            color: PAYMENT_STATUS.find(s => s.value === purchaseData.payment.status)?.color,
                                                        }}
                                                    />
                                                </Grid>
                                                {purchaseData.payment.paidAmount > 0 && (
                                                    <Grid item xs={4}>
                                                        <Typography variant="caption" color="text.secondary">Paid Amount</Typography>
                                                        <Typography variant="body2">${purchaseData.payment.paidAmount.toFixed(2)}</Typography>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                    <Button variant="outlined" onClick={() => setActiveStep(2)}>
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSavePurchase}
                                        sx={{ backgroundColor: '#3a7d44' }}
                                    >
                                        Confirm Purchase
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Right Column - Summary */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ 
                        borderRadius: 3, 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        position: 'sticky',
                        top: 24,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                                Order Summary
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Reference No.
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {purchaseData.referenceNo}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Items
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {purchaseData.items.length} {purchaseData.items.length === 1 ? 'Item' : 'Items'}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                    <Typography variant="body2">${purchaseData.subtotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Tax</Typography>
                                    <Typography variant="body2">${purchaseData.tax.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Shipping</Typography>
                                    <Typography variant="body2">${purchaseData.shipping.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Discount</Typography>
                                    <Typography variant="body2" color="#ef4444">-${purchaseData.discount.toFixed(2)}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight="600">Total</Typography>
                                <Typography variant="h5" fontWeight="700" color="#3a7d44">
                                    ${purchaseData.total.toFixed(2)}
                                </Typography>
                            </Box>

                            {purchaseData.payment.status === 'PARTIAL' && (
                                <Box sx={{ mt: 3, p: 2, backgroundColor: alpha('#eab308', 0.1), borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="#eab308" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Pending fontSize="small" />
                                        Balance Due: ${(purchaseData.total - (purchaseData.payment.paidAmount || 0)).toFixed(2)}
                                    </Typography>
                                </Box>
                            )}

                            {purchaseData.payment.status === 'PAID' && (
                                <Box sx={{ mt: 3, p: 2, backgroundColor: alpha('#22c55e', 0.1), borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="#22c55e" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircle fontSize="small" />
                                        Fully Paid
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialogs */}
            <NewSupplierDialog
                open={supplierDialogOpen}
                onClose={() => setSupplierDialogOpen(false)}
                onSave={handleAddSupplier}
            />

            <AddProductDialog
                open={addProductDialogOpen}
                onClose={() => setAddProductDialogOpen(false)}
                onAdd={handleAddItem}
            />
        </Box>
    );
};

export default PurchaseOrder;