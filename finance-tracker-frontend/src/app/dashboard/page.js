'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service'; // Ensure apiService is correctly imported

export default function Dashboard() {
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalBalance: 0,
        totalBudgeted: 0,
        remainingBudget: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
    });
    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            fetchDashboardData();
        }
    }, [isLoggedIn, router]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [accountsRes, categoriesRes, transactionsRes, budgetsRes] = await Promise.all([
                apiService.getAccounts(),
                apiService.getCategories(),
                apiService.getTransactions(),
                apiService.getBudgets()
            ]);

            setAccounts(accountsRes);
            setCategories(categoriesRes);
            setTransactions(transactionsRes);
            setBudgets(budgetsRes);

            // Calculate stats
            const totalIncome = transactionsRes.filter(t => t.category?.type === 'Income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const totalExpenses = transactionsRes.filter(t => t.category?.type === 'Expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const totalBalance = totalIncome - totalExpenses;

            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const monthlyTransactions = transactionsRes.filter(t => t.date.startsWith(currentMonth));

            const monthlyIncome = monthlyTransactions
                .filter(t => t.category?.type === 'Income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const monthlyExpenses = monthlyTransactions
                .filter(t => t.category?.type === 'Expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const currentMonthBudgets = budgetsRes.filter(budget => budget.month.startsWith(currentMonth));
            const totalBudgeted = currentMonthBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
            const remainingBudget = totalBudgeted - monthlyExpenses; // Remaining budget for the current month

            setStats({
                totalBalance,
                totalBudgeted,
                remainingBudget,
                monthlyIncome,
                monthlyExpenses,
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
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
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stats.totalBalance >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                            ${stats.totalBalance.toFixed(2)}
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
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Total Budgeted</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                            ${stats.totalBudgeted.toFixed(2)}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💸</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Remaining Budget</h3>
                        <p style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: stats.remainingBudget >= 0 ? '#10b981' : '#ef4444',
                            margin: 0
                        }}>
                            ${stats.remainingBudget.toFixed(2)}
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
                            ${stats.monthlyIncome.toFixed(2)}
                        </p>
                    </div>
                </div>

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
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📉</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Monthly Expenses</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>
                            ${stats.monthlyExpenses.toFixed(2)}
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
                        {transactions.length > 0 ? (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {transactions
                                    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date ascending
                                    .slice(-5) // Take the last 5
                                    .map((transaction) => (
                                        <div key={transaction.transaction_id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: transaction.transaction_type === 'Income' ? '#f0fdf4' : '#fef2f2'
                                        }}>
                                            <div>
                                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                                                    {transaction.category?.name || 'Unknown Category'}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                                                    {new Date(transaction.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: transaction.transaction_type === 'Income' ? '#10b981' : '#ef4444'
                                                }}>
                                                    {transaction.transaction_type === 'Income' ? '+' : '-'}${transaction.amount}
                                                </div>
                                                {/* Removed edit and delete buttons from dashboard as per user request */}
                                                {/* Edit and delete to be done on dedicated full list pages */}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
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
                        )}
                    </div>

                    {/* Recent Budgets */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            🎯 Recent Budgets
                        </h2>
                        {budgets.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#e5e7eb' }}>
                                            <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Budget Name</th>
                                            <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Budget Amount</th>
                                            <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Spent</th>
                                            <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Remaining</th>
                                            <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Month</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {budgets.slice(0, 5).map(budget => {
                                            const spent = transactions
                                                .filter(t => t.category?.id === budget.category?.id &&
                                                    new Date(t.date).getMonth() === new Date(budget.month).getMonth() &&
                                                    new Date(t.date).getFullYear() === new Date(budget.month).getFullYear() &&
                                                    t.category?.type === 'Expense')
                                                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                                            const remaining = budget.amount - spent;
                                            const isOverspent = remaining < 0;

                                            return (
                                                <tr key={budget.budget_id} style={{ backgroundColor: '#fefce8' }}>
                                                    <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                                                        {budget.category?.name || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', fontWeight: 'bold', color: '#f59e0b' }}>
                                                        ${parseFloat(budget.amount).toFixed(2)}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                                                        ${spent.toFixed(2)}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', color: isOverspent ? '#ef4444' : '#10b981' }}>
                                                        ${remaining.toFixed(2)} {isOverspent && '(overspent)'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                                                        {new Date(budget.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                color: '#64748b',
                                padding: '2rem 0'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                                <p>No budgets set yet</p>
                                <p style={{ fontSize: '0.875rem' }}>
                                    Set your first budget to track spending
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    marginTop: '2rem'
                }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                        ⚡ Quick Actions
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                        onClick={() => router.push('/add-expense')}
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
                        onClick={() => router.push('/add-income')}
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
                        onClick={() => router.push('/add-budget')}
                        >
                            🎯 Set Budget
                        </button>
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
