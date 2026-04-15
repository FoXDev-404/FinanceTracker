// API Service for Finance Tracker
// This file provides all API endpoints with fetch

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to parse error messages from API responses
const parseErrorMessage = (data) => {
    // If there's a detail field (common in DRF), use it
    if (data.detail) {
        return data.detail;
    }

    // If there are field-specific errors, extract the first error message
    if (typeof data === 'object' && data !== null) {
        for (const field in data) {
            if (Array.isArray(data[field]) && data[field].length > 0) {
                return data[field][0]; // Take the first error message for the field
            } else if (typeof data[field] === 'string') {
                return data[field];
            }
        }
    }

    // Fallback to stringifying the data
    return JSON.stringify(data);
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(parseErrorMessage(data));
    }
    return data;
};

// API Functions
export const apiService = {
    // 1. User Registration
    register: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    password_confirm: userData.passwordConfirm
                })
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Registration failed:', error.message);
            throw error;
        }
    },

    // 2. User Login
    login: async (credentials) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            });
            const data = await handleResponse(response);

            // Store tokens in localStorage (client-side only)
            if (typeof window !== 'undefined' && data.access) {
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.setItem('user', JSON.stringify(data));
            }

            return data;
        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        }
    },

    // 3. Get User Profile (Protected Route)
    getProfile: async () => {
        try {
            let token;
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('accessToken');
            }

            if (!token) {
                throw new Error('No access token found. Please login first.');
            }

            const response = await fetch(`${API_BASE_URL}/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            // If token is expired, try to refresh it
            if (response.status === 401) {
                await apiService.refreshToken();
                let newToken;
                if (typeof window !== 'undefined') {
                    newToken = localStorage.getItem('accessToken');
                }

                const retryResponse = await fetch(`${API_BASE_URL}/profile/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                return await handleResponse(retryResponse);
            }

            return await handleResponse(response);
        } catch (error) {
            console.error('Get profile failed:', error.message);
            throw error;
        }
    },

    // 4. User Logout (Protected Route)
    logout: async () => {
        try {
            let token;
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('accessToken');
            }

            if (!token) {
                throw new Error('No access token found.');
            }

            const response = await fetch(`${API_BASE_URL}/logout/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            // Clear local storage regardless of response
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }

            return await handleResponse(response);
        } catch (error) {
            console.error('Logout failed:', error.message);
            // Still clear local storage on error
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
            throw error;
        }
    },

    // 5. Refresh Token (Helper function)
    refreshToken: async () => {
        try {
            let refreshToken;
            if (typeof window !== 'undefined') {
                refreshToken = localStorage.getItem('refreshToken');
            }

            if (!refreshToken) {
                throw new Error('No refresh token found.');
            }

            const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh: refreshToken
                })
            });

            const data = await handleResponse(response);

            if (data.access && typeof window !== 'undefined') {
                localStorage.setItem('accessToken', data.access);
            }

            return data;
        } catch (error) {
            console.error('Token refresh failed:', error.message);
            // Clear tokens on refresh failure
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
            throw error;
        }
    }
};

export default apiService;
