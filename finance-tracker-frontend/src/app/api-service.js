// API Service for Finance Tracker
const normalizeApiBaseUrl = (rawUrl) => {
    const fallback = 'http://127.0.0.1:8000/api';
    if (!rawUrl || typeof rawUrl !== 'string') return fallback;

    const trimmed = rawUrl.trim();
    if (!trimmed) return fallback;

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const withoutTrailingSlash = withProtocol.replace(/\/+$/, '');

    if (/\/api$/i.test(withoutTrailingSlash)) {
        return withoutTrailingSlash;
    }

    return `${withoutTrailingSlash}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL
);

const withApiBaseHint = (error, endpoint = '') => {
    const suffix = endpoint || 'requested endpoint';
    if (error instanceof TypeError) {
        return new Error(
            `Network/CORS error while calling ${suffix}. ` +
            `Current API base URL is ${API_BASE_URL}. ` +
            'Please verify the backend URL is live and allows your frontend origin.'
        );
    }
    return error;
};

const parseErrorMessage = (data) => {
    if (data.detail) return data.detail;
    if (typeof data === 'object' && data !== null) {
        for (const field in data) {
            if (Array.isArray(data[field]) && data[field].length > 0) return data[field][0];
            else if (typeof data[field] === 'string') return data[field];
        }
    }
    return JSON.stringify(data);
};

const parseResponseBody = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        if (text && text.trim().toLowerCase().startsWith('<!doctype html>')) {
            return { detail: 'Configuration error: The API request returned an HTML page instead of data. Please check your NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BASE_URL environment variable to ensure it points to the correct backend API URL.' };
        }
        return { detail: text || 'Unable to parse response as JSON' };
    }
};

const handleResponse = async (response) => {
    const data = await parseResponseBody(response);
    if (!response.ok) throw new Error(parseErrorMessage(data));
    return data;
};

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

const setToken = (token) => {
    if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('accessToken', token);
        else localStorage.removeItem('accessToken');
    }
};

const getRefreshToken = () => typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

const clearAuth = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

const doRefreshToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token found.');

    let response;
    try {
        response = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });
    } catch (error) {
        throw withApiBaseHint(error, `${API_BASE_URL}/token/refresh/`);
    }

    const data = await parseResponseBody(response);
    if (!response.ok) throw new Error(data.detail || 'Token refresh failed');

    if (data.access) {
        setToken(data.access);
    }
    return data.access;
};

const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();
    const headers = { ...options.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    // If not 401, return as-is
    if (response.status !== 401) {
        return response;
    }

    // If 401 and no token, can't refresh
    if (!token) {
        clearAuth();
        throw new Error('Unauthorized: No token available');
    }

    // Try to refresh token
    if (isRefreshing) {
        // Wait for the ongoing refresh and retry
        const newToken = await new Promise((resolve) => {
            subscribeTokenRefresh((token) => resolve(token));
        });
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
    }

    isRefreshing = true;
    try {
        const newToken = await doRefreshToken();
        onTokenRefreshed(newToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
    } catch (refreshError) {
        clearAuth();
        // Redirect to login on refresh failure
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
    } finally {
        isRefreshing = false;
    }
};

const authHeaders = (contentType = true) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (contentType) headers['Content-Type'] = 'application/json';
    return headers;
};

export const apiService = {
    // Auth
    register: async (userData) => {
        let response;
        try {
            response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    password_confirm: userData.passwordConfirm
                })
            });
        } catch (error) {
            throw withApiBaseHint(error, `${API_BASE_URL}/register/`);
        }
        return handleResponse(response);
    },

    login: async (credentials) => {
        let response;
        try {
            response = await fetch(`${API_BASE_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: credentials.email, password: credentials.password })
            });
        } catch (error) {
            throw withApiBaseHint(error, `${API_BASE_URL}/login/`);
        }
        const data = await handleResponse(response);
        if (typeof window !== 'undefined' && data.access) {
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            localStorage.setItem('user', JSON.stringify(data));
        }
        return data;
    },

    getProfile: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/profile/`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    updateProfile: async (profileData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/profile/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(profileData)
        });
        return handleResponse(response);
    },

    updateProfilePicture: async (imageFile) => {
        const formData = new FormData();
        formData.append('profile_picture', imageFile);
        const response = await fetchWithAuth(`${API_BASE_URL}/profile/`, {
            method: 'PUT',
            headers: authHeaders(false),
            body: formData
        });
        return handleResponse(response);
    },

    logout: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/logout/`, {
            method: 'POST',
            headers: authHeaders()
        });
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
        return handleResponse(response);
    },

    refreshToken: async () => {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (!refreshToken) throw new Error('No refresh token found.');
        let response;
        try {
            response = await fetch(`${API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken })
            });
        } catch (error) {
            throw withApiBaseHint(error, `${API_BASE_URL}/token/refresh/`);
        }
        const data = await handleResponse(response);
        if (data.access && typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.access);
        }
        return data;
    },

    // Accounts
    getAccounts: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/accounts/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    createAccount: async (accountData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/accounts/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(accountData)
        });
        return handleResponse(response);
    },
    updateAccount: async (accountId, accountData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/accounts/${accountId}/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(accountData)
        });
        return handleResponse(response);
    },
    deleteAccount: async (accountId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/accounts/${accountId}/`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (response.status === 204) return { success: true };
        return handleResponse(response);
    },

    // Categories
    getCategories: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/categories/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    createCategory: async (categoryData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/categories/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(categoryData)
        });
        return handleResponse(response);
    },
    updateCategory: async (categoryId, categoryData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/categories/${categoryId}/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(categoryData)
        });
        return handleResponse(response);
    },
    deleteCategory: async (categoryId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/categories/${categoryId}/`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (response.status === 204) return { success: true };
        return handleResponse(response);
    },

    // Tags
    getTags: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/tags/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    createTag: async (tagData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/tags/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(tagData)
        });
        return handleResponse(response);
    },
    updateTag: async (tagId, tagData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/tags/${tagId}/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(tagData)
        });
        return handleResponse(response);
    },
    deleteTag: async (tagId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/tags/${tagId}/`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (response.status === 204) return { success: true };
        return handleResponse(response);
    },

    // Transactions
    getTransactions: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_BASE_URL}/transactions/?${queryString}` : `${API_BASE_URL}/transactions/`;
        const response = await fetchWithAuth(url, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    getTransaction: async (transactionId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/${transactionId}/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    createTransaction: async (transactionData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(transactionData)
        });
        return handleResponse(response);
    },
    updateTransaction: async (transactionId, transactionData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/${transactionId}/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(transactionData)
        });
        return handleResponse(response);
    },
    deleteTransaction: async (transactionId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/${transactionId}/`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (response.status === 204) return { success: true };
        return handleResponse(response);
    },

    // Export transactions
    exportTransactions: async (format = 'excel', params = {}) => {
        const queryParams = new URLSearchParams({ format, ...params }).toString();
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/export/?${queryParams}`, {
            headers: authHeaders(false)
        });
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    // Budgets
    getBudgets: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/budgets/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    createBudget: async (budgetData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/budgets/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(budgetData)
        });
        return handleResponse(response);
    },
    updateBudget: async (budgetId, budgetData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/budgets/${budgetId}/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(budgetData)
        });
        return handleResponse(response);
    },
    deleteBudget: async (budgetId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/budgets/${budgetId}/`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (response.status === 204) return { success: true };
        return handleResponse(response);
    },

    // Recurring Transactions
    getRecurringTransactions: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/recurring-transactions/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    createRecurringTransaction: async (data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/recurring-transactions/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    updateRecurringTransaction: async (id, data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/recurring-transactions/${id}/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    deleteRecurringTransaction: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/recurring-transactions/${id}/`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (response.status === 204) return { success: true };
        return handleResponse(response);
    },
    generateRecurringTransactions: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/recurring-transactions/generate/`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    // Savings Goals
    getSavingsGoals: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/savings-goals/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    createSavingsGoal: async (data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/savings-goals/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    updateSavingsGoal: async (id, data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/savings-goals/${id}/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    deleteSavingsGoal: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/savings-goals/${id}/`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (response.status === 204) return { success: true };
        return handleResponse(response);
    },
    contributeToGoal: async (id, amount) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/savings-goals/${id}/contribute/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ amount })
        });
        return handleResponse(response);
    },

    // Notifications
    getNotifications: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/notifications/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    markNotificationRead: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/notifications/${id}/mark_read/`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },
    markAllNotificationsRead: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/notifications/mark_all_read/`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },
    getUnreadCount: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/notifications/unread_count/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },

    // Dashboard
    getDashboardStats: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/dashboard/stats/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    getBudgetAlerts: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/budgets/alerts/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },

    // Reminders
    getReminders: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/reminders/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    createReminder: async (data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/reminders/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    updateReminder: async (id, data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/reminders/${id}/`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    deleteReminder: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/reminders/${id}/`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (response.status === 204) return { success: true };
        return handleResponse(response);
    },
    getUpcomingReminders: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/reminders/upcoming/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },

    // Forecasts
    getForecasts: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/forecasts/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    generateForecast: async (forecastType, periods = 3) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/forecasts/generate/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ forecast_type: forecastType, periods })
        });
        return handleResponse(response);
    },

    // Anomalies
    getAnomalies: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/anomalies/`, { headers: authHeaders(false) });
        return handleResponse(response);
    },
    detectAnomalies: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/anomalies/detect/`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },
    resolveAnomaly: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/anomalies/${id}/resolve/`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    // Voice Input
    processVoiceInput: async (audioText) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/voice/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ audio_text: audioText })
        });
        return handleResponse(response);
    },

    // Receipt Processing
    processReceipt: async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        const response = await fetchWithAuth(`${API_BASE_URL}/receipts/process/`, {
            method: 'POST',
            headers: authHeaders(false),
            body: formData
        });
        return handleResponse(response);
    },

    // Chat
    chat: async (message) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ message })
        });
        return handleResponse(response);
    }
};

export default apiService;
