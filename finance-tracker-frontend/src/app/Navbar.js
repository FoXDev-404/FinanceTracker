'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isLoggedIn, loading, handleLogout, message } = useAuth();
    const router = useRouter();

    // Check for saved dark mode preference
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogoutClick = async () => {
        await handleLogout();
        router.push('/');
    };

    return (
        <>
            <nav style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#1f2937',
                padding: '1rem 2rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Logo */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: isDarkMode ? '#3b82f6' : '#1d4ed8',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}>
                            💰
                        </div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: isDarkMode ? '#f9fafb' : '#1f2937'
                        }}>
                            Finance Tracker
                        </h1>
                    </div>

                    {/* Navigation Items */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            style={{
                                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                                color: isDarkMode ? '#f9fafb' : '#1f2937',
                                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                                borderRadius: '6px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                transition: 'all 0.2s'
                            }}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>

                        {/* Navigation Menu */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <Link
                                href="/"
                                style={{
                                    color: isDarkMode ? '#f9fafb' : '#1f2937',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                🏠 Home
                            </Link>

                            {isLoggedIn && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        style={{
                                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        📊 Dashboard
                                    </Link>

                                    <Link
                                        href="/transactions"
                                        style={{
                                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        📋 Transactions
                                    </Link>

                                    <Link
                                        href="/budgets"
                                        style={{
                                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        🎯 Budgets
                                    </Link>

                                    <Link
                                        href="/profile"
                                        style={{
                                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        👤 Profile
                                    </Link>

                                    <Link
                                        href="/chat"
                                        style={{
                                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        🤖 AI Assistant
                                    </Link>

                                    <Link
                                        href="/receipts"
                                        style={{
                                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        📄 Receipts
                                    </Link>
                                </>
                            )}

                            {/* User Menu */}
                            {isLoggedIn ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <span style={{
                                        color: isDarkMode ? '#d1d5db' : '#6b7280',
                                        fontSize: '0.9rem'
                                    }}>
                                        Welcome, {user?.name || 'User'}
                                    </span>

                                    <button
                                        onClick={handleLogoutClick}
                                        disabled={loading}
                                        style={{
                                            backgroundColor: '#dc2626',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.5rem 1rem',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {loading ? 'Logging out...' : '🚪 Logout'}
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Link
                                        href="/login"
                                        style={{
                                            color: 'white',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: isDarkMode ? '#3b82f6' : '#1d4ed8',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#2563eb' : '#1e40af';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#3b82f6' : '#1d4ed8';
                                        }}
                                    >
                                        🔑 Login
                                    </Link>

                                    <Link
                                        href="/register"
                                        style={{
                                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            padding: '0.5rem 1rem',
                                            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        📝 Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

        </>
    );
}
