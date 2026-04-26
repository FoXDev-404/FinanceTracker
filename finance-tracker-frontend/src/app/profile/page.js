'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function Profile() {
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            setLoading(false);
            setProfileData({
                name: user?.name || '',
                email: user?.email || ''
            });
        }
    }, [isLoggedIn, router, user]);

    const handleInputChange = (e) => {
        setProfileData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement profile update functionality
    };

    if (loading) {
        return (
            <main style={{
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading profile...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{
            minHeight: 'calc(100vh - 80px)',
            backgroundColor: '#f8fafc',
            padding: '2rem 0'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        margin: '0 auto 1rem auto'
                    }}>
                        👤
                    </div>
                    <h1 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '2rem',
                        color: '#1f2937'
                    }}>
                        {user?.name || 'User'}&apos;s Profile
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Profile Form */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                        📝 Account Information
                    </h2>

                    <form onSubmit={handleSubmit}>
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
                                value={profileData.name}
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
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
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
                            style={{
                                padding: '0.75rem 2rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                            💾 Save Changes
                        </button>
                    </form>
                </div>

                {/* Account Statistics */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                        📊 Account Statistics
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>Member Since</div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>

                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>Total Transactions</div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>0</div>
                        </div>

                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>Active Budgets</div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>0</div>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                        ⚙️ Account Actions
                    </h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <button style={{
                            padding: '1rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                        >
                            🔒 Change Password
                        </button>

                        <button style={{
                            padding: '1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                            🗑️ Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
