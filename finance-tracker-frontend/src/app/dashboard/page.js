'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Area, AreaChart
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Dashboard() {
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [hasAlerts, setHasAlerts] = useState(false);

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
            const [statsRes, alertsRes] = await Promise.all([
                apiService.getDashboardStats(),
                apiService.getBudgetAlerts()
            ]);
            setStats(statsRes);
            setAlerts(alertsRes.alerts || []);
            setHasAlerts(alertsRes.has_alerts || false);
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

    if (!stats) {
        return (
            <main style={{
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center', color: '#ef4444' }}>
                    <p>Failed to load dashboard data.</p>
                    <button onClick={fetchDashboardData} style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}>Retry</button>
                </div>
            </main>
        );
    }

    const summary = stats.summary || {};
    const monthlyExpenses = stats.monthly_expenses_chart || [];
    const categoryPie = stats.category_pie_chart || [];
    const incomeVsExpense = stats.income_vs_expense || [];
    const budgetStatus = stats.budget_status || [];
    const recentTransactions = stats.recent_transactions || [];
    const accountBalances = stats.account_balances || [];
    const savingsGoals = stats.savings_goals || [];

    return (
        <main style={{
            minHeight: 'calc(100vh - 80px)',
            backgroundColor: '#f8fafc',
            padding: '2rem 0'
        }}>
            <div style={{
                maxWidth: '1400px',
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
                        Welcome, {user?.name || 'User'}! 📊
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Here's your complete financial overview
                    </p>
                </div>

                {/* Budget Alerts */}
                {hasAlerts && (
                    <div style={{ marginBottom: '2rem' }}>
                        {alerts.map((alert, idx) => (
                            <div key={idx} style={{
                                padding: '1rem 1.5rem',
                                borderRadius: '8px',
                                marginBottom: '0.5rem',
                                backgroundColor: alert.severity === 'high' ? '#fee2e2' : '#fef3c7',
                                border: `1px solid ${alert.severity === 'high' ? '#fecaca' : '#fde68a'}`,
                                color: alert.severity === 'high' ? '#dc2626' : '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>
                                    {alert.severity === 'high' ? '🚨' : '⚠️'}
                                </span>
                                <span style={{ fontWeight: '500' }}>{alert.message}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <SummaryCard
                        icon="💰"
                        title="Total Balance"
                        value={`$${(summary.total_balance || 0).toFixed(2)}`}
                        color={summary.total_balance >= 0 ? '#10b981' : '#ef4444'}
                    />
                    <SummaryCard
                        icon="📈"
                        title="Monthly Income"
                        value={`$${(summary.monthly_income || 0).toFixed(2)}`}
                        color="#3b82f6"
                    />
                    <SummaryCard
                        icon="📉"
                        title="Monthly Expenses"
                        value={`$${(summary.monthly_expenses || 0).toFixed(2)}`}
                        color="#ef4444"
                    />
                    <SummaryCard
                        icon="💵"
                        title="Net Savings"
                        value={`$${(summary.net || 0).toFixed(2)}`}
                        color={summary.net >= 0 ? '#10b981' : '#ef4444'}
                    />
                    <SummaryCard
                        icon="🎯"
                        title="Savings Rate"
                        value={`${summary.savings_rate || 0}%`}
                        color="#f59e0b"
                    />
                </div>

                {/* Charts Row 1 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                }}>
                    {/* Monthly Expenses Chart */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            📊 Monthly Expenses Trend
                        </h3>
                        {monthlyExpenses.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyExpenses}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`$${value.toFixed(2)}`, 'Expenses']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#ef4444" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <NoDataMessage message="No expense data available" />
                        )}
                    </div>

                    {/* Category Pie Chart */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            🥧 Spending by Category
                        </h3>
                        {categoryPie.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryPie}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categoryPie.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <NoDataMessage message="No category spending data" />
                        )}
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                }}>
                    {/* Income vs Expense Bar Chart */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            📈 Income vs Expenses
                        </h3>
                        {incomeVsExpense.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={incomeVsExpense}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => `$${value.toFixed(2)}`}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <NoDataMessage message="No income/expense data" />
                        )}
                    </div>

                    {/* Budget Status */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            🎯 Budget Status
                        </h3>
                        {budgetStatus.length > 0 ? (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {budgetStatus.map((budget, idx) => (
                                    <div key={idx} style={{ marginBottom: '1.25rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <span style={{ fontWeight: '500', color: '#374151' }}>
                                                {budget.category}
                                            </span>
                                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                ${budget.spent?.toFixed(2)} / ${budget.budgeted?.toFixed(2)}
                                            </span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '12px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '6px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(budget.percentage || 0, 100)}%`,
                                                height: '100%',
                                                backgroundColor: budget.percentage >= 100 ? '#ef4444' : budget.percentage >= 80 ? '#f59e0b' : '#10b981',
                                                borderRadius: '6px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginTop: '0.25rem'
                                        }}>
                                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {budget.percentage?.toFixed(1)}% used
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: budget.remaining >= 0 ? '#10b981' : '#ef4444' }}>
                                                ${budget.remaining?.toFixed(2)} remaining
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataMessage message="No budgets set for this month" />
                        )}
                    </div>
                </div>

                {/* Row 3: Savings Goals & Account Balances */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                }}>
                    {/* Savings Goals */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ margin: 0, color: '#1f2937' }}>
                                🏦 Savings Goals
                            </h3>
                            <button
                                onClick={() => router.push('/savings-goals')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Manage
                            </button>
                        </div>
                        {savingsGoals.length > 0 ? (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {savingsGoals.map((goal, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '8px',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1.25rem' }}>{goal.icon || '🎯'}</span>
                                                <span style={{ fontWeight: '500', color: '#374151' }}>{goal.name}</span>
                                            </div>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: goal.progress >= 100 ? '#10b981' : '#3b82f6'
                                            }}>
                                                {goal.progress}%
                                            </span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '10px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '5px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(goal.progress || 0, 100)}%`,
                                                height: '100%',
                                                backgroundColor: goal.color || '#3b82f6',
                                                borderRadius: '5px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginTop: '0.5rem',
                                            fontSize: '0.875rem',
                                            color: '#6b7280'
                                        }}>
                                            <span>${goal.current?.toFixed(2)}</span>
                                            <span>of ${goal.target?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataMessage message="No savings goals yet" />
                        )}
                    </div>

                    {/* Account Balances */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            🏛️ Account Balances
                        </h3>
                        {accountBalances.length > 0 ? (
                            <div>
                                {accountBalances.map((acc, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '8px',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '500', color: '#374151' }}>
                                                {acc.name}
                                            </span>
                                            <span style={{
                                                marginLeft: '0.5rem',
                                                padding: '0.125rem 0.5rem',
                                                backgroundColor: '#e5e7eb',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                color: '#6b7280'
                                            }}>
                                                {acc.type}
                                            </span>
                                        </div>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: acc.balance >= 0 ? '#10b981' : '#ef4444'
                                        }}>
                                            ${acc.balance?.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataMessage message="No accounts found" />
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ margin: 0, color: '#1f2937' }}>
                            📝 Recent Transactions
                        </h3>
                        <button
                            onClick={() => router.push('/transactions')}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        >
                            View All
                        </button>
                    </div>
                    {recentTransactions.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Date</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Category</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Type</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#6b7280' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((t, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                {new Date(t.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                {t.category?.name || 'N/A'}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    backgroundColor: t.transaction_type === 'Income' ? '#d1fae5' : '#fee2e2',
                                                    color: t.transaction_type === 'Income' ? '#065f46' : '#991b1b'
                                                }}>
                                                    {t.transaction_type}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '0.75rem',
                                                textAlign: 'right',
                                                fontWeight: 'bold',
                                                color: t.transaction_type === 'Income' ? '#10b981' : '#ef4444'
                                            }}>
                                                {t.transaction_type === 'Income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <NoDataMessage message="No recent transactions" />
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                        ⚡ Quick Actions
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1rem'
                    }}>
                        <QuickActionButton
                            icon="➕"
                            label="Add Expense"
                            color="#ef4444"
                            onClick={() => router.push('/add-expense')}
                        />
                        <QuickActionButton
                            icon="💰"
                            label="Add Income"
                            color="#10b981"
                            onClick={() => router.push('/add-income')}
                        />
                        <QuickActionButton
                            icon="🎯"
                            label="Set Budget"
                            color="#f59e0b"
                            onClick={() => router.push('/add-budget')}
                        />
                        <QuickActionButton
                            icon="🏦"
                            label="Savings Goals"
                            color="#3b82f6"
                            onClick={() => router.push('/savings-goals')}
                        />
                        <QuickActionButton
                            icon="🔄"
                            label="Recurring"
                            color="#8b5cf6"
                            onClick={() => router.push('/recurring-transactions')}
                        />
                        <QuickActionButton
                            icon="🤖"
                            label="AI Assistant"
                            color="#06b6d4"
                            onClick={() => router.push('/chat')}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

function SummaryCard({ icon, title, value, color }) {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
            borderTop: `4px solid ${color}`
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                {title}
            </h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color, margin: 0 }}>
                {value}
            </p>
        </div>
    );
}

function QuickActionButton({ icon, label, color, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                padding: '1rem',
                backgroundColor: isHovered ? color : '#f9fafb',
                color: isHovered ? 'white' : color,
                border: `2px solid ${color}`,
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}
        >
            {icon} {label}
        </button>
    );
}

function NoDataMessage({ message }) {
    return (
        <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            padding: '3rem 0'
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
            <p>{message}</p>
        </div>
    );
}

