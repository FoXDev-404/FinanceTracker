'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';

export default function Transactions() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            fetchTransactions();
        }
    }, [isLoggedIn, router, page]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = {
                page: page,
                page_size: pageSize
            };
            const data = await apiService.getTransactions(params);
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (transactionId) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                await apiService.deleteTransaction(transactionId);
                fetchTransactions();
            } catch (error) {
                alert('Failed to delete transaction: ' + error.message);
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
                    <p>Loading transactions...</p>
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
                    📋 All Transactions
                </h1>
                {transactions.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#e5e7eb' }}>
                                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Date</th>
                                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Account</th>
                                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Category</th>
                                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Type</th>
                                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Amount</th>
                                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Note</th>
                                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(transaction => (
                                    <tr key={transaction.transaction_id} style={{ backgroundColor: transaction.transaction_type === 'Income' ? '#f0fdf4' : '#fef2f2' }}>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{new Date(transaction.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{transaction.account?.account_name || 'N/A'}</td>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{transaction.category?.name || 'N/A'}</td>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{transaction.transaction_type}</td>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', fontWeight: 'bold', color: transaction.transaction_type === 'Income' ? '#10b981' : '#ef4444' }}>
                                            {transaction.transaction_type === 'Income' ? '+' : '-'}${transaction.amount}
                                        </td>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{transaction.note || ''}</td>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                                            <button
                                                onClick={() => router.push(`/edit-transaction?id=${transaction.transaction_id}`)}
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
                                                onClick={() => handleDelete(transaction.transaction_id)}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>No transactions found.</p>
                )}
            </div>
        </main>
    );
}
