import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import authService from "./services/authService";
import CategoryProducts from "./pages/CategoryProducts";
import SubCategoryProducts from "./pages/SubCategoryProducts";
import Checkout from "./pages/Checkout";
import UserDashboard from "./pages/UserDashboard";

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const user = authService.getCurrentUser();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== "ADMIN") {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/category/:categoryId" element={<CategoryProducts />} />
                <Route path="/subcategory/:subCategoryId" element={<SubCategoryProducts />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/dashboard" element={<UserDashboard />} />

<Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;