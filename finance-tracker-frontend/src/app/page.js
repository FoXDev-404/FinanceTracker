'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';

export default function Home() {
    const { isLoggedIn, user } = useAuth();

    return (
        <main style={{
            minHeight: 'calc(100vh - 80px)', // Account for navbar height
            backgroundColor: '#f8fafc',
            padding: '2rem 0'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    padding: '3rem 0'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '2rem'
                        }}>
                            💰
                        </div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Finance Tracker
                        </h1>
                    </div>

                    <p style={{
                        fontSize: '1.25rem',
                        color: '#64748b',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto'
                    }}>
                        Take control of your finances with our intuitive personal finance management application
                    </p>

                    {isLoggedIn ? (
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Link
                                href="/dashboard"
                                style={{
                                    padding: '1rem 2rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#2563eb';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#3b82f6';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                📊 Go to Dashboard
                            </Link>

                            <Link
                                href="/profile"
                                style={{
                                    padding: '1rem 2rem',
                                    backgroundColor: 'transparent',
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#3b82f6';
                                    e.target.style.color = 'white';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#3b82f6';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                👤 View Profile
                            </Link>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Link
                                href="/login"
                                style={{
                                    padding: '1rem 2rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#2563eb';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#3b82f6';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                🔑 Sign In
                            </Link>

                            <Link
                                href="/register"
                                style={{
                                    padding: '1rem 2rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#059669';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#10b981';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                📝 Create Account
                            </Link>
                        </div>
                    )}
                </div>

                {/* Features Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginBottom: '4rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Track Expenses</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Monitor your daily expenses and categorize them to understand your spending patterns
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Budget Planning</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Set realistic budgets and get notified when you're approaching your spending limits
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Visual Analytics</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            View beautiful charts and graphs to analyze your financial trends over time
                        </p>
                    </div>
                </div>

                {/* Welcome Message for Logged In Users */}
                {isLoggedIn && (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center',
                        marginBottom: '2rem'
                    }}>
                        <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
                            Welcome back, {user?.name || 'User'}! 👋
                        </h2>
                        <p style={{ color: '#64748b', margin: 0 }}>
                            Ready to manage your finances? Head to your dashboard to get started.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
