'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const { handleLogin, message, clearMessage } = useAuth();
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message) clearMessage();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await handleLogin(formData);
            router.push('/profile');
        } catch (error) {
            // Error message is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '30px 20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        margin: '0',
                        fontSize: '24px',
                        fontWeight: '600'
                    }}>
                        🔑 Welcome Back
                    </h1>
                    <p style={{
                        margin: '10px 0 0 0',
                        opacity: '0.9',
                        fontSize: '14px'
                    }}>
                        Sign in to your Finance Tracker account
                    </p>
                </div>

                {/* Form */}
                <div style={{ padding: '30px 20px' }}>
                    {message && (
                        <div style={{
                            padding: '12px',
                            marginBottom: '20px',
                            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                            color: message.includes('✅') ? '#155724' : '#721c24',
                            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: '500',
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e1e5e9',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: '500',
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e1e5e9',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: loading ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                marginBottom: '20px'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#0056b3')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#007bff')}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid transparent',
                                        borderTop: '2px solid currentColor',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div style={{
                        textAlign: 'center',
                        paddingTop: '20px',
                        borderTop: '1px solid #e1e5e9'
                    }}>
                        <p style={{
                            margin: '0',
                            color: '#6c757d',
                            fontSize: '14px'
                        }}>
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                style={{
                                    color: '#007bff',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 480px) {
                    padding: 10px;
                }
            `}</style>
        </div>
    );
}
