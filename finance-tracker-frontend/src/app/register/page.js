'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { handleRegister } = useAuth();
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Restrict "name" field: only letters and spaces
        if (name === 'name') {
            const regex = /^[A-Za-z\s]*$/; // only letters + spaces
            if (!regex.test(value)) {
                setError('Name can only contain letters and spaces');
                return;
            } else {
                setError('');
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation: Name must not be empty and only letters
        if (!formData.name.trim()) {
            setError('Full Name is required');
            setLoading(false);
            return;
        }
        if (!/^[A-Za-z\s]+$/.test(formData.name)) {
            setError('Full Name must only contain letters and spaces');
            setLoading(false);
            return;
        }

        // Validation: Passwords
        if (formData.password !== formData.passwordConfirm) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            await handleRegister({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm
            });
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
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
                    backgroundColor: '#10b981',
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
                        📝 Create Account
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

                        {/* Full Name */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
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
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                        </div>

                        {/* Email */}
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
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
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
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="passwordConfirm"
                                value={formData.passwordConfirm}
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
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
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
                                backgroundColor: loading ? '#9ca3af' : '#10b981',
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
                            {loading ? 'Creating account...' : '📝 Create Account'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                style={{
                                    color: '#10b981',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
