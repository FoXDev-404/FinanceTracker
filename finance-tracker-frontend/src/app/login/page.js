'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { handleLogin } = useAuth();
    const router = useRouter();

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await handleLogin(formData);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{
            minHeight: 'calc(100vh - 80px)',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        🔑 Sign In
                    </h1>
                </div>

                {/* Form */}
                <div style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                marginBottom: '1.5rem',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                border: '1px solid #fecaca'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {loading ? 'Signing in...' : '🔑 Sign In'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/register"
                                style={{
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
