'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';
import { apiService } from './api-service';

export default function Home() {
    const { isLoggedIn, user } = useAuth();
    const [dynamicData, setDynamicData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isLoggedIn) {
            fetchDynamicData();
        }
    }, [isLoggedIn]);

    const fetchDynamicData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [transactionsRes, budgetsRes] = await Promise.all([
                apiService.getTransactions(),
                apiService.getBudgets()
            ]);

            // Calculate current month data
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const monthlyTransactions = transactionsRes.filter(t => t.date.startsWith(currentMonth));

            // Track Expenses: Total expenses this month and transaction count
            const totalExpenses = monthlyTransactions
                .filter(t => t.category?.type === 'Expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const transactionCount = monthlyTransactions.length;

            // Budget Planning: Total budgeted vs total spent
            const currentMonthBudgets = budgetsRes.filter(budget => budget.month.startsWith(currentMonth));
            const totalBudgeted = currentMonthBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
            const totalSpent = totalExpenses;
            const budgetProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

            // Visual Analytics: Balance, income/expense ratio, trend
            const totalIncome = transactionsRes.filter(t => t.category?.type === 'Income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const totalBalance = totalIncome - transactionsRes.filter(t => t.category?.type === 'Expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const monthlyIncome = monthlyTransactions
                .filter(t => t.category?.type === 'Income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const incomeExpenseRatio = totalExpenses > 0 ? (monthlyIncome / totalExpenses).toFixed(2) : 'N/A';

            // Simple trend: Compare this month with last month
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const lastMonthStr = lastMonth.toISOString().slice(0, 7);
            const lastMonthExpenses = transactionsRes
                .filter(t => t.date.startsWith(lastMonthStr) && t.category?.type === 'Expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const trend = totalExpenses > lastMonthExpenses ? 'up' : totalExpenses < lastMonthExpenses ? 'down' : 'stable';

            setDynamicData({
                totalExpenses,
                transactionCount,
                totalBudgeted,
                totalSpent,
                budgetProgress,
                totalBalance,
                incomeExpenseRatio,
                trend
            });

        } catch (err) {
            console.error('Failed to fetch dynamic data:', err);
            setError('Failed to load your financial data. Please try refreshing the page.');
        } finally {
            setLoading(false);
        }
    };

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
                        {isLoggedIn ? (
                            loading ? (
                                <div style={{ color: '#64748b' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                                    Loading...
                                </div>
                            ) : error ? (
                                <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                                    {error}
                                </div>
                            ) : dynamicData ? (
                                <div>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: '#ef4444',
                                        marginBottom: '0.5rem'
                                    }}>
                                        ${dynamicData.totalExpenses.toFixed(2)}
                                    </div>
                                    <p style={{
                                        color: '#64748b',
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '0.875rem'
                                    }}>
                                        This month • {dynamicData.transactionCount} transactions
                                    </p>
                                    <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                                        Monitor your daily expenses and categorize them to understand your spending patterns
                                    </p>
                                </div>
                            ) : null
                        ) : (
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                Monitor your daily expenses and categorize them to understand your spending patterns
                            </p>
                        )}
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
                        {isLoggedIn ? (
                            loading ? (
                                <div style={{ color: '#64748b' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                                    Loading...
                                </div>
                            ) : error ? (
                                <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                                    {error}
                                </div>
                            ) : dynamicData ? (
                                <div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: dynamicData.budgetProgress > 100 ? '#ef4444' : '#f59e0b',
                                        marginBottom: '0.5rem'
                                    }}>
                                        ${dynamicData.totalSpent.toFixed(2)} / ${dynamicData.totalBudgeted.toFixed(2)}
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e5e7eb',
                                        borderRadius: '4px',
                                        marginBottom: '0.5rem',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${Math.min(dynamicData.budgetProgress, 100)}%`,
                                            height: '100%',
                                            backgroundColor: dynamicData.budgetProgress > 100 ? '#ef4444' : '#10b981',
                                            borderRadius: '4px',
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                    <p style={{
                                        color: '#64748b',
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '0.875rem'
                                    }}>
                                        {dynamicData.budgetProgress.toFixed(1)}% used this month
                                    </p>
                                    <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                                        Set realistic budgets and get notified when you're approaching your spending limits
                                    </p>
                                </div>
                            ) : null
                        ) : (
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                Set realistic budgets and get notified when you're approaching your spending limits
                            </p>
                        )}
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
                        {isLoggedIn ? (
                            loading ? (
                                <div style={{ color: '#64748b' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                                    Loading...
                                </div>
                            ) : error ? (
                                <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                                    {error}
                                </div>
                            ) : dynamicData ? (
                                <div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: dynamicData.totalBalance >= 0 ? '#10b981' : '#ef4444',
                                        marginBottom: '0.5rem'
                                    }}>
                                        ${dynamicData.totalBalance.toFixed(2)}
                                    </div>
                                    <p style={{
                                        color: '#64748b',
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '0.875rem'
                                    }}>
                                        Income/Expense Ratio: {dynamicData.incomeExpenseRatio}
                                        <span style={{
                                            marginLeft: '0.5rem',
                                            color: dynamicData.trend === 'up' ? '#ef4444' : dynamicData.trend === 'down' ? '#10b981' : '#64748b'
                                        }}>
                                            {dynamicData.trend === 'up' ? '📈' : dynamicData.trend === 'down' ? '📉' : '➡️'}
                                        </span>
                                    </p>
                                    <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                                        View beautiful charts and graphs to analyze your financial trends over time
                                    </p>
                                </div>
                            ) : null
                        ) : (
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                View beautiful charts and graphs to analyze your financial trends over time
                            </p>
                        )}
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
