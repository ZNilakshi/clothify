import axios from "axios";

const API_URL = "http://localhost:8080/api/orders";

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const getAllOrders = async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
};

const getOrderById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return response.data;
};

const getCustomerOrders = async (customerId) => {
    const response = await axios.get(`${API_URL}/customer/${customerId}`, { headers: getAuthHeaders() });
    return response.data;
};

const updateOrderStatus = async (id, status) => {
    const response = await axios.patch(
        `${API_URL}/${id}/status`,
        null,
        { params: { status }, headers: getAuthHeaders() }
    );
    return response.data;
};

const addTrackingDetails = async (id, trackingData) => {
    const response = await axios.put(
        `${API_URL}/${id}/tracking`,
        trackingData,
        { headers: getAuthHeaders() }
    );
    return response.data;
};

const cancelOrder = async (id) => {
    const response = await axios.post(
        `${API_URL}/${id}/cancel`,
        null,
        { headers: getAuthHeaders() }
    );
    return response.data;
};

const processPayment = async (id) => {
    const response = await axios.post(
        `${API_URL}/${id}/payment`,
        null,
        { headers: getAuthHeaders() }
    );
    return response.data;
};

const orderService = {
    getAllOrders,
    getOrderById,
    getCustomerOrders,
    updateOrderStatus,
    addTrackingDetails,
    cancelOrder,
    processPayment,
};

export default orderService;