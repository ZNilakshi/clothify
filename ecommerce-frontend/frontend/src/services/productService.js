import api from './api';

const productService = {
    // Get all products
    getAllProducts: async () => {
        const response = await api.get('/products');
        return response.data;
    },

    // Get active products
    getActiveProducts: async () => {
        const response = await api.get('/products/active');
        return response.data;
    },

    // Get product by ID
    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Create product (Admin only)
    createProduct: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    // Update product (Admin only)
    updateProduct: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    // Delete product (Admin only)
    deleteProduct: async (id) => {
        await api.delete(`/products/${id}`);
    },

    // Search products
    searchProducts: async (keyword) => {
        const response = await api.get(`/products/search?keyword=${keyword}`);
        return response.data;
    },

    // Get products by category
    getProductsByCategory: async (categoryId) => {
        const response = await api.get(`/products/category/${categoryId}`);
        return response.data;
    },
};

export default productService;