'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, router]);

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
                    <p>Loading dashboard...</p>
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
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '2rem',
                        color: '#1f2937'
                    }}>
                        Welcome to your Dashboard, {user?.name || 'User'}! 📊
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Here's an overview of your financial activity
                    </p>
                </div>

                {/* Quick Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Total Balance</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                            $0.00
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Monthly Income</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>
                            $0.00
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📉</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Monthly Expenses</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>
                            $0.00
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Budget Remaining</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                            $0.00
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Recent Transactions */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            📋 Recent Transactions
                        </h2>
                        <div style={{
                            textAlign: 'center',
                            color: '#64748b',
                            padding: '2rem 0'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                            <p>No transactions yet</p>
                            <p style={{ fontSize: '0.875rem' }}>
                                Start by adding your first expense or income
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            ⚡ Quick Actions
                        </h2>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            <button style={{
                                padding: '1rem',
                                backgroundColor: '#10b981',
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
                            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                            >
                                ➕ Add Expense
                            </button>

                            <button style={{
                                padding: '1rem',
                                backgroundColor: '#3b82f6',
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
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                            >
                                💰 Add Income
                            </button>

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
                                🎯 Set Budget
                            </button>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Features */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    marginTop: '2rem',
                    textAlign: 'center'
                }}>
                    <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
                        🚀 Coming Soon
                    </h2>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        We're working on exciting new features including detailed analytics,
                        budget tracking, and financial goal setting. Stay tuned!
                    </p>
                </div>
            </div>
        </main>
    );
}
