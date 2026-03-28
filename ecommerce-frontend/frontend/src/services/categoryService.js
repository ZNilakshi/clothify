import api from './api';

const categoryService = {
    // Get all categories
    getAllCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    // Get category by ID
    getCategoryById: async (id) => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    // Create category (Admin only)
    createCategory: async (categoryData) => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    // Update category (Admin only)
    updateCategory: async (id, categoryData) => {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    // Delete category (Admin only)
    deleteCategory: async (id) => {
        await api.delete(`/categories/${id}`);
    },
};

export default categoryService;