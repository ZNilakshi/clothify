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

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
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
            const response = await authService.login(
                formData.username,
                formData.password
            );

            console.log("Login successful:", response);

            // Redirect based on role
            if (response.role === "ADMIN") {
                window.location.href = "/admin/dashboard"; // Full page reload
            } else {
                window.location.href = "/"; // Full page reload
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(
                err.response?.data?.message ||
                "Invalid username or password"
            );
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
                        borderRadius: 5,
                        backgroundColor: "#f3efe9",
                    }}
                >
                    <Typography variant="h4" fontWeight="bold" textAlign="center">
                        Welcome back
                    </Typography>

                    <Typography
                        textAlign="center"
                        sx={{ color: "text.secondary", mt: 1, mb: 3 }}
                    >
                        Sign in to your account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            name="username"
                            placeholder="Enter your username"
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
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <Typography textAlign="center" sx={{ mt: 3, fontSize: 14 }}>
                        Don't have an account?{" "}
                        <span
                            style={{ color: "#3a7d44", cursor: "pointer" }}
                            onClick={() => navigate("/register")}
                        >
                            Sign up
                        </span>
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Login;