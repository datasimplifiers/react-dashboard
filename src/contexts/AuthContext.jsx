// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Or use fetch

const AuthContext = createContext(null);

const BACKEND_URL = ' https://api.metro-demo.roamworks.com'; // Your backend server URL

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Check local storage on initial load
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [user, setUser] = useState(() => {
         try {
            return JSON.parse(localStorage.getItem('user')) || null;
         } catch (e) {
            return null;
         }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Persist auth state to local storage
        localStorage.setItem('isAuthenticated', isAuthenticated);
         if (isAuthenticated && user) {
             localStorage.setItem('user', JSON.stringify(user));
         } else {
             localStorage.removeItem('user');
         }
    }, [isAuthenticated, user]);


    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/login`, { username, password });
            if (response.status === 200) {
                setIsAuthenticated(true);
                setUser(response.data.user); // Store user info if needed
                setLoading(false);
                return true; // Indicate success
            }
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setIsAuthenticated(false);
             setUser(null);
            setLoading(false);
            return false; // Indicate failure
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
         // Also clear from local storage immediately
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        // No API call needed for basic logout, but you might invalidate tokens here in a real app
        console.log("User logged out");
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};