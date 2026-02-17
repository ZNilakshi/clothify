import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import authService from "../services/authService";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: "",
        email: "",
        phoneNumber: "",
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authService.register(formData);

            // Show success message or auto-login
            alert("Registration successful! Please login.");
            navigate("/login");
        } catch (err) {
            console.error("Registration error:", err);
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#faf7f2" }}>
            <Navbar />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 8,
                }}
            >
                <Paper
                    sx={{
                        width: 420,
                        p: 4,
                        borderRadius: 6,
                        backgroundColor: "#f3efe9",
                    }}
                >
                    <Typography variant="h4" fontWeight="bold" textAlign="center">
                        Create an account
                    </Typography>

                    <Typography
                        textAlign="center"
                        sx={{ color: "text.secondary", mt: 1, mb: 3 }}
                    >
                        Join the Perspective community
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Display Name"
                            name="customerName"
                            placeholder="Your name"
                            fullWidth
                            value={formData.customerName}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            sx={{
                                mb: 2,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 5,
                                },
                            }}
                        />

                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            fullWidth
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            sx={{
                                mb: 2,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 5,
                                },
                            }}
                        />

                        <TextField
                            label="Phone Number"
                            name="phoneNumber"
                            placeholder="+94 XX XXX XXXX"
                            fullWidth
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            disabled={loading}
                            sx={{
                                mb: 2,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 5,
                                },
                            }}
                        />

                        <TextField
                            label="Username"
                            name="username"
                            placeholder="Choose a username"
                            fullWidth
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            sx={{
                                mb: 2,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 5,
                                },
                            }}
                        />

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            sx={{
                                mb: 3,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 5,
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            sx={{
                                backgroundColor: "#2b2b2b",
                                color: "#fff",
                                py: 1.2,
                                borderRadius: "999px",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#000",
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>

                    <Typography textAlign="center" sx={{ mt: 3, fontSize: 14 }}>
                        Already have an account?{" "}
                        <span
                            style={{ color: "#3a7d44", cursor: "pointer" }}
                            onClick={() => navigate("/login")}
                        >
                            Sign in
                        </span>
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Register;