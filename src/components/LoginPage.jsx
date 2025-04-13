// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, CircularProgress, Alert, Avatar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext.jsx';
import metroLogo from '../assets/metro.svg'; // Adjust path if needed

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the location to redirect to after login, default to home page
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (event) => {
        event.preventDefault();
        const success = await login(username, password);
        if (success) {
            // Send them back to the page they tried to visit when they were
            // redirected to the login page. Use { replace: true } so we don't create
            // another entry in the history stack for the login page.
            navigate(from, { replace: true });
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: (theme) => theme.palette.background.default, // Use theme background
                p: 2,
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: { xs: 3, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: 400,
                    width: '100%',
                }}
            >
                <Avatar
                    src={metroLogo}
                    alt="Metro Logo"
                    sx={{ m: 1, width: 200, height: 'auto', mb: 2 }} // Adjust size
                    variant="square" // or "rounded" or "circular"
                />
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    Metro Intelligence Platform
                </Typography>
                <Typography component="p" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please sign in
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, position: 'relative' }}
                        disabled={loading}
                    >
                        {loading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                        Sign In
                    </Button>
                </Box>
            </Paper>
             <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Demo Login: admin / password123
             </Typography>
        </Box>
    );
};

export default LoginPage;