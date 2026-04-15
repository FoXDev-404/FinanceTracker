'use client';

import { useState, useEffect } from 'react';
import { apiService } from './api-test';

export default function AuthTest() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Form states
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    // Load token from localStorage when component mounts
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("accessToken");
            if (storedToken) {
                setToken(storedToken);
            }
        }
    }, []);

    const handleInputChange = (formType, field, value) => {
        if (formType === 'register') {
            setRegisterForm(prev => ({ ...prev, [field]: value }));
        } else {
            setLoginForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const result = await apiService.register(registerForm);
            setMessage('✅ Registration successful!');
            console.log('Registration result:', result);
        } catch (error) {
            setMessage(`❌ Registration failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const result = await apiService.login(loginForm);
            
            if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", result.accessToken);
            }
            setToken(result.accessToken);
            setUser(result);
            setMessage('✅ Login successful!');
            console.log('Login result:', result);
        } catch (error) {
            setMessage(`❌ Login failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGetProfile = async () => {
        setLoading(true);
        setMessage('');

        try {
            const profile = await apiService.getProfile();
            setMessage('✅ Profile retrieved successfully!');
            console.log('Profile:', profile);
        } catch (error) {
            setMessage(`❌ Get profile failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        setMessage('');

        try {
            await apiService.logout();
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
            }
            setUser(null);
            setToken(null);
            setMessage('✅ Logout successful!');
        } catch (error) {
            setMessage(`❌ Logout failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const isLoggedIn = () => {
        return token !== null;
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🔐 Finance Tracker API Testing</h1>

            {message && (
                <div style={{
                    padding: '10px',
                    margin: '10px 0',
                    backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: '4px'
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Registration Form */}
                <div style={{ flex: 1, minWidth: '300px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h2>📝 User Registration</h2>
                    <form onSubmit={handleRegister}>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={registerForm.name}
                                onChange={(e) => handleInputChange('register', 'name', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={registerForm.email}
                                onChange={(e) => handleInputChange('register', 'email', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="password"
                                placeholder="Password"
                                value={registerForm.password}
                                onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={registerForm.passwordConfirm}
                                onChange={(e) => handleInputChange('register', 'passwordConfirm', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: loading ? '#ccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                </div>

                {/* Login Form */}
                <div style={{ flex: 1, minWidth: '300px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h2>🔑 User Login</h2>
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={loginForm.email}
                                onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginForm.password}
                                onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: loading ? '#ccc' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>

            {/* User Actions */}
            {isLoggedIn() && (
                <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h2>🔒 Protected Actions (Authenticated)</h2>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleGetProfile}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: loading ? '#ccc' : '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Loading...' : 'Get Profile'}
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: loading ? '#ccc' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </div>
            )}

            {/* Current User Info */}
            {user && (
                <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    border: '1px solid #28a745',
                    borderRadius: '8px',
                    backgroundColor: '#d4edda'
                }}>
                    <h3>👤 Current User</h3>
                    <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
            )}

            {/* API Documentation */}
            <div style={{
                marginTop: '30px',
                padding: '20px',
                border: '1px solid #6c757d',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>📚 API Endpoints</h3>
                <ul>
                    <li><strong>POST</strong> /api/register/ - Register new user</li>
                    <li><strong>POST</strong> /api/login/ - Login user (returns JWT tokens)</li>
                    <li><strong>GET</strong> /api/profile/ - Get user profile (requires JWT token)</li>
                    <li><strong>POST</strong> /api/logout/ - Logout user (requires JWT token)</li>
                    <li><strong>GET</strong> /swagger/ - API documentation</li>
                </ul>
            </div>
        </div>
    );
}
