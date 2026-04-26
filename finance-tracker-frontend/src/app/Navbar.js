'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { apiService } from './api-service';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, isLoggedIn, loading, handleLogout, message } = useAuth();
    const router = useRouter();
    const notifRef = useRef(null);
    const handleLogoutRef = useRef(handleLogout);

    // Check for saved dark mode preference
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        handleLogoutRef.current = handleLogout;
    }, [handleLogout]);

    const fetchNotifications = useCallback(async () => {
        try {
            const [notifs, countRes] = await Promise.all([
                apiService.getNotifications(),
                apiService.getUnreadCount()
            ]);
            setNotifications(notifs.slice(0, 10));
            setUnreadCount(countRes.unread_count || 0);
        } catch (error) {
            // Stop polling and redirect on auth errors
            if (error.message?.includes('Unauthorized') || error.message?.includes('Session expired')) {
                console.warn('Auth failed for notifications, stopping poll');
                await handleLogoutRef.current();
                router.push('/login');
            } else {
                console.error('Failed to fetch notifications:', error);
            }
        }
    }, [router]);

    // Fetch notifications
    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [isLoggedIn, fetchNotifications]);

    // Close notifications on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await apiService.markNotificationRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiService.markAllNotificationsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

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

    const navLinkStyle = {
        color: isDarkMode ? '#f9fafb' : '#1f2937',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem'
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
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            backgroundColor: isDarkMode ? '#3b82f6' : '#1d4ed8',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
                        }}>
                            💰
                        </div>
                        <h1 style={{
                            margin: 0, fontSize: '1.5rem', fontWeight: 'bold',
                            color: isDarkMode ? '#f9fafb' : '#1f2937'
                        }}>
                            Finance Tracker
                        </h1>
                    </div>

                    {/* Navigation Items */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Dark Mode Toggle */}
                        <button onClick={toggleDarkMode}
                            style={{
                                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                                color: isDarkMode ? '#f9fafb' : '#1f2937',
                                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                                borderRadius: '6px', padding: '0.5rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px'
                            }}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>

                        {/* Navigation Menu */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Link href="/" style={navLinkStyle}
                                onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                🏠 Home
                            </Link>

                            {isLoggedIn && (
                                <>
                                    <Link href="/dashboard" style={navLinkStyle}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                        📊 Dashboard
                                    </Link>
                                    <Link href="/transactions" style={navLinkStyle}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                        📋 Transactions
                                    </Link>
                                    <Link href="/budgets" style={navLinkStyle}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                        🎯 Budgets
                                    </Link>
                                    <Link href="/savings-goals" style={navLinkStyle}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                        🏦 Goals
                                    </Link>
                                    <Link href="/recurring-transactions" style={navLinkStyle}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                        🔄 Recurring
                                    </Link>
                                    <Link href="/tags" style={navLinkStyle}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                        🏷️ Tags
                                    </Link>
                                    <Link href="/chat" style={navLinkStyle}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                        🤖 AI
                                    </Link>
                                    <Link href="/receipts" style={navLinkStyle}
                                        onMouseOver={(e) => { e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'; }}
                                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                                        📄 Receipts
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Notifications Bell */}
                        {isLoggedIn && (
                            <div ref={notifRef} style={{ position: 'relative' }}>
                                <button onClick={() => setShowNotifications(!showNotifications)}
                                    style={{
                                        backgroundColor: 'transparent', border: 'none',
                                        cursor: 'pointer', padding: '0.5rem', position: 'relative',
                                        fontSize: '1.25rem'
                                    }}
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: '0', right: '0',
                                            backgroundColor: '#ef4444', color: 'white',
                                            borderRadius: '50%', width: '18px', height: '18px',
                                            fontSize: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                                        width: '360px', maxHeight: '480px', overflowY: 'auto',
                                        backgroundColor: 'white', borderRadius: '12px',
                                        boxShadow: '0 10px 15px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
                                        zIndex: 1001
                                    }}>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1rem', borderBottom: '1px solid #e5e7eb'
                                        }}>
                                            <h4 style={{ margin: 0, color: '#1f2937' }}>🔔 Notifications</h4>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead}
                                                    style={{
                                                        backgroundColor: 'transparent', border: 'none',
                                                        color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer'
                                                    }}>
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div key={notif.notification_id} onClick={() => markAsRead(notif.notification_id)}
                                                    style={{
                                                        padding: '1rem', borderBottom: '1px solid #f3f4f6',
                                                        cursor: 'pointer', backgroundColor: notif.read ? 'white' : '#eff6ff',
                                                        transition: 'background-color 0.15s'
                                                    }}
                                                    onMouseEnter={(e) => { if (!notif.read) e.currentTarget.style.backgroundColor = '#dbeafe'; }}
                                                    onMouseLeave={(e) => { if (!notif.read) e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: '500', fontSize: '0.875rem', color: '#1f2937' }}>
                                                            {notif.title}
                                                        </span>
                                                        {!notif.read && <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', flexShrink: 0 }} />}
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.4' }}>
                                                        {notif.message}
                                                    </p>
                                                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                        {new Date(notif.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                                                <p>No notifications</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Menu */}
                        {isLoggedIn ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Link href="/profile" style={{
                                    color: isDarkMode ? '#d1d5db' : '#6b7280',
                                    fontSize: '0.9rem', textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    {user?.profile_picture ? (
                                        <Image
                                            src={user.profile_picture}
                                            alt="Profile"
                                            width={32}
                                            height={32}
                                            unoptimized
                                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '1.25rem' }}>👤</span>
                                    )}
                                    <span>{user?.name || 'User'}</span>
                                </Link>
                                <button onClick={handleLogoutClick} disabled={loading}
                                    style={{
                                        backgroundColor: '#dc2626', color: 'white', border: 'none',
                                        borderRadius: '6px', padding: '0.5rem 1rem',
                                        cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem'
                                    }}>
                                    {loading ? 'Logging out...' : '🚪 Logout'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Link href="/login" style={{
                                    color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500',
                                    padding: '0.5rem 1rem', backgroundColor: isDarkMode ? '#3b82f6' : '#1d4ed8',
                                    borderRadius: '6px'
                                }}>
                                    🔑 Login
                                </Link>
                                <Link href="/register" style={{
                                    color: isDarkMode ? '#f9fafb' : '#1f2937', textDecoration: 'none',
                                    fontSize: '0.9rem', fontWeight: '500', padding: '0.5rem 1rem',
                                    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, borderRadius: '6px'
                                }}>
                                    📝 Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
