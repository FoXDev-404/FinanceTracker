'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from './api-service';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Check authentication status on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const userData = localStorage.getItem('user');

                if (token && userData) {
                    setIsLoggedIn(true);
                    setUser(JSON.parse(userData));

                    // Verify token is still valid by fetching profile
                    try {
                        await apiService.getProfile();
                    } catch (error) {
                        // Token might be expired, try to refresh
                        try {
                            await apiService.refreshToken();
                            const newUserData = localStorage.getItem('user');
                            if (newUserData) {
                                setUser(JSON.parse(newUserData));
                            }
                        } catch (refreshError) {
                            // Refresh failed, clear auth state
                            handleLogout();
                        }
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const handleLogin = async (credentials) => {
        try {
            setMessage('');
            const result = await apiService.login(credentials);

            if (typeof window !== 'undefined') {
                const userData = localStorage.getItem('user');
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            }

            setIsLoggedIn(true);
            setMessage('✅ Login successful!');
            return result;
        } catch (error) {
            setMessage(`❌ Login failed: ${error.message}`);
            throw error;
        }
    };

    const handleRegister = async (userData) => {
        try {
            setMessage('');
            const result = await apiService.register(userData);
            setMessage('✅ Registration successful!');
            return result;
        } catch (error) {
            setMessage(`❌ Registration failed: ${error.message}`);
            throw error;
        }
    };

    const handleGetProfile = async () => {
        try {
            setMessage('');
            const profile = await apiService.getProfile();

            if (typeof window !== 'undefined') {
                const userData = localStorage.getItem('user');
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            }

            setMessage('✅ Profile retrieved successfully!');
            return profile;
        } catch (error) {
            setMessage(`❌ Get profile failed: ${error.message}`);
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            setMessage('');
            await apiService.logout();
            setUser(null);
            setIsLoggedIn(false);
            setMessage('✅ Logout successful!');
        } catch (error) {
            // Still clear local state even if API call fails
            setUser(null);
            setIsLoggedIn(false);
            setMessage(`❌ Logout failed: ${error.message}`);
        }
    };

    const clearMessage = () => {
        setMessage('');
    };

    const value = {
        user,
        isLoggedIn,
        loading,
        message,
        handleLogin,
        handleRegister,
        handleGetProfile,
        handleLogout,
        clearMessage
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
