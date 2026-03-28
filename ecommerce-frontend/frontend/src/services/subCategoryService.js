import api from './api';

const subCategoryService = {
    getAllSubCategories: async () => {
        const response = await api.get('/subcategories');
        return response.data;
    },
    getSubCategoryById: async (id) => {
        const response = await api.get(`/subcategories/${id}`);
        return response.data;
    },
    getSubCategoriesByCategory: async (categoryId) => {
        const response = await api.get(`/subcategories/category/${categoryId}`);
        return response.data;
    },
    createSubCategory: async (data) => {
        const response = await api.post('/subcategories', data);
        return response.data;
    },
    updateSubCategory: async (id, data) => {
        const response = await api.put(`/subcategories/${id}`, data);
        return response.data;
    },
    deleteSubCategory: async (id) => {
        await api.delete(`/subcategories/${id}`);
    },
};

export default subCategoryService;