'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';

export default function Budgets() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalBudgeted, setTotalBudgeted] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            fetchData();
        }
    }, [isLoggedIn, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [budgetsData, categoriesData, transactionsData] = await Promise.all([
                apiService.getBudgets(),
                apiService.getCategories(),
                apiService.getTransactions()
            ]);
            setBudgets(budgetsData);
            setCategories(categoriesData.filter(cat => cat.type === 'Expense'));
            setTransactions(transactionsData);

            calculateFinancialSummaries(budgetsData, transactionsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateFinancialSummaries = (budgetsData, transactionsData) => {
        let income = 0;
        let expenses = 0;
        transactionsData.forEach(transaction => {
            if (transaction.category?.type === 'Income') {
                income += parseFloat(transaction.amount);
            } else if (transaction.category?.type === 'Expense') {
                expenses += parseFloat(transaction.amount);
            }
        });
        setTotalBalance(income - expenses);
        setTotalExpenses(expenses);

        let totalBudgetAmount = 0;
        budgetsData.forEach(budget => {
            totalBudgetAmount += parseFloat(budget.amount);
        });
        setTotalBudgeted(totalBudgetAmount);
    };

    const fetchBudgets = async () => {
        // This function is now part of fetchData, but kept for potential individual refresh
        try {
            const data = await apiService.getBudgets();
            setBudgets(data);
            calculateFinancialSummaries(data, transactions); // Recalculate if only budgets change
        } catch (error) {
            console.error('Failed to fetch budgets:', error);
        }
    };


    const handleDelete = async (budgetId) => {
        if (confirm('Are you sure you want to delete this budget?')) {
            try {
                await apiService.deleteBudget(budgetId);
                fetchBudgets();
            } catch (error) {
                alert('Failed to delete budget: ' + error.message);
            }
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
                    <p>Loading budgets...</p>
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
                maxWidth: '900px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                <h1 style={{
                    margin: '0 0 1.5rem 0',
                    fontSize: '2rem',
                    color: '#1f2937',
                    textAlign: 'center'
                }}>
                    🎯 All Budgets
                </h1>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    backgroundColor: '#fff',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '2rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Total Balance</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: totalBalance >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                            ${totalBalance.toFixed(2)}
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Total Budgeted</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                            ${totalBudgeted.toFixed(2)}
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Remaining Budget</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: (totalBudgeted - totalExpenses) >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                            ${(totalBudgeted - totalExpenses).toFixed(2)}
                        </p>
                    </div>
                </div>

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
                                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgets.map(budget => {
                                    const spent = transactions
                                        .filter(t => t.category?.id === budget.category?.id &&
                                            new Date(t.date).getMonth() === new Date(budget.month).getMonth() &&
                                            new Date(t.date).getFullYear() === new Date(budget.month).getFullYear() &&
                                            t.type === 'Expense')
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
                                                {new Date(budget.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                            </td>
                                            <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                                                <button
                                                    onClick={() => router.push(`/edit-budget?id=${budget.budget_id}`)}
                                                    style={{
                                                        marginRight: '0.5rem',
                                                        backgroundColor: '#6b7280',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '0.25rem 0.5rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(budget.budget_id)}
                                                    style={{
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '0.25rem 0.5rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>No budgets found.</p>
                )}
            </div>
        </main>
    );
}
