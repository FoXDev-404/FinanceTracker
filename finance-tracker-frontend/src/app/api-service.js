// API Service for Finance Tracker
// This file provides all API endpoints with fetch

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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

    // 3.1. Update User Profile (Protected Route)
    updateProfile: async (profileData) => {
        try {
            let token;
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('accessToken');
            }

            if (!token) {
                throw new Error('No access token found. Please login first.');
            }

            const response = await fetch(`${API_BASE_URL}/profile/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            // If token is expired, try to refresh it
            if (response.status === 401) {
                await apiService.refreshToken();
                let newToken;
                if (typeof window !== 'undefined') {
                    newToken = localStorage.getItem('accessToken');
                }

                const retryResponse = await fetch(`${API_BASE_URL}/profile/`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileData)
                });
                return await handleResponse(retryResponse);
            }

            return await handleResponse(response);
        } catch (error) {
            console.error('Update profile failed:', error.message);
            throw error;
        }
    },

    // 3.2. Update Profile Picture (Protected Route)
    updateProfilePicture: async (imageFile) => {
        try {
            let token;
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('accessToken');
            }

            if (!token) {
                throw new Error('No access token found. Please login first.');
            }

            const formData = new FormData();
            formData.append('profile_picture', imageFile);

            const response = await fetch(`${API_BASE_URL}/profile/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type, let browser set it with boundary for FormData
                },
                body: formData
            });

            // If token is expired, try to refresh it
            if (response.status === 401) {
                await apiService.refreshToken();
                let newToken;
                if (typeof window !== 'undefined') {
                    newToken = localStorage.getItem('accessToken');
                }

                const retryResponse = await fetch(`${API_BASE_URL}/profile/`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        // Don't set Content-Type, let browser set it with boundary for FormData
                    },
                    body: formData
                });
                return await handleResponse(retryResponse);
            }

            return await handleResponse(response);
        } catch (error) {
            console.error('Update profile picture failed:', error.message);
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
    },

    // 6. Accounts CRUD
    getAccounts: async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/accounts/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get accounts failed:', error.message);
            throw error;
        }
    },

    createAccount: async (accountData) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/accounts/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accountData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Create account failed:', error.message);
            throw error;
        }
    },

    updateAccount: async (accountId, accountData) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accountData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Update account failed:', error.message);
            throw error;
        }
    },

    deleteAccount: async (accountId) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 204) return { success: true };
            return await handleResponse(response);
        } catch (error) {
            console.error('Delete account failed:', error.message);
            throw error;
        }
    },

    // 7. Categories CRUD
    getCategories: async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/categories/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get categories failed:', error.message);
            throw error;
        }
    },

    createCategory: async (categoryData) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/categories/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Create category failed:', error.message);
            throw error;
        }
    },

    updateCategory: async (categoryId, categoryData) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Update category failed:', error.message);
            throw error;
        }
    },

    deleteCategory: async (categoryId) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 204) return { success: true };
            return await handleResponse(response);
        } catch (error) {
            console.error('Delete category failed:', error.message);
            throw error;
        }
    },

    // 8. Transactions CRUD
    getTransactions: async (params = {}) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `${API_BASE_URL}/transactions/?${queryString}` : `${API_BASE_URL}/transactions/`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get transactions failed:', error.message);
            throw error;
        }
    },

    createTransaction: async (transactionData) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/transactions/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Create transaction failed:', error.message);
            throw error;
        }
    },

    updateTransaction: async (transactionId, transactionData) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Update transaction failed:', error.message);
            throw error;
        }
    },

    deleteTransaction: async (transactionId) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 204) return { success: true };
            return await handleResponse(response);
        } catch (error) {
            console.error('Delete transaction failed:', error.message);
            throw error;
        }
    },

    // 9. Budgets CRUD
    getBudgets: async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/budgets/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get budgets failed:', error.message);
            throw error;
        }
    },

    getBudget: async (budgetId) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get budget failed:', error.message);
            throw error;
        }
    },

    createBudget: async (budgetData) => {
        try {
            let token;
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('accessToken');
            }

            if (!token) {
                throw new Error('No access token found. Please login first.');
            }

            const response = await fetch(`${API_BASE_URL}/budgets/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(budgetData)
            });

            // If token is expired, try to refresh it
            if (response.status === 401) {
                await apiService.refreshToken();
                let newToken;
                if (typeof window !== 'undefined') {
                    newToken = localStorage.getItem('accessToken');
                }

                const retryResponse = await fetch(`${API_BASE_URL}/budgets/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(budgetData)
                });
                return await handleResponse(retryResponse);
            }

            return await handleResponse(response);
        } catch (error) {
            console.error('Create budget failed:', error.message);
            throw error;
        }
    },

    updateBudget: async (budgetId, budgetData) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(budgetData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Update budget failed:', error.message);
            throw error;
        }
    },

    deleteBudget: async (budgetId) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 204) return { success: true };
            return await handleResponse(response);
        } catch (error) {
            console.error('Delete budget failed:', error.message);
            throw error;
        }
    },

    // 10. Chat with AI Assistant
    chat: async (message) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found. Please login first.');

            const response = await fetch(`${API_BASE_URL}/chat/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Chat failed:', error.message);
            throw error;
        }
    },

    // 11. Receipts CRUD (AI-Powered Bill Scanner)
    getReceipts: async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/receipts/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get receipts failed:', error.message);
            throw error;
        }
    },

    uploadReceipt: async (imageFile) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${API_BASE_URL}/receipts/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type, let browser set it with boundary for FormData
                },
                body: formData
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Upload receipt failed:', error.message);
            throw error;
        }
    },

    getReceipt: async (receiptId) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/receipts/${receiptId}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Get receipt failed:', error.message);
            throw error;
        }
    },

    updateReceipt: async (receiptId, receiptData) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/receipts/${receiptId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(receiptData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Update receipt failed:', error.message);
            throw error;
        }
    },

    deleteReceipt: async (receiptId) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) throw new Error('No access token found.');

            const response = await fetch(`${API_BASE_URL}/receipts/${receiptId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 204) return { success: true };
            return await handleResponse(response);
        } catch (error) {
            console.error('Delete receipt failed:', error.message);
            throw error;
        }
    }
};

export default apiService;
