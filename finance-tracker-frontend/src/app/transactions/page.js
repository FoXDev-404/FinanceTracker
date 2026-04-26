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
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        category: '',
        transaction_type: '',
        min_amount: '',
        max_amount: '',
        tags: '',
        search: ''
    });

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            fetchInitialData();
        }
    }, [isLoggedIn, router]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [transactionsData, categoriesData, tagsData] = await Promise.all([
                apiService.getTransactions(),
                apiService.getCategories(),
                apiService.getTags()
            ]);
            setTransactions(transactionsData);
            setCategories(categoriesData);
            setTags(tagsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async (filterParams = {}) => {
        try {
            setLoading(true);
            const data = await apiService.getTransactions(filterParams);
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        const activeFilters = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) activeFilters[key] = value;
        });
        fetchTransactions(activeFilters);
    };

    const clearFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            category: '',
            transaction_type: '',
            min_amount: '',
            max_amount: '',
            tags: '',
            search: ''
        });
        fetchTransactions();
    };

    const handleDelete = async (transactionId) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                await apiService.deleteTransaction(transactionId);
                applyFilters();
            } catch (error) {
                alert('Failed to delete transaction: ' + error.message);
            }
        }
    };

    const handleExport = async (format) => {
        try {
            setExporting(true);
            const activeFilters = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value) activeFilters[key] = value;
            });
            await apiService.exportTransactions(format, activeFilters);
        } catch (error) {
            alert('Export failed: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    if (loading && transactions.length === 0) {
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
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2rem',
                        color: '#1f2937'
                    }}>
                        📋 Transactions
                    </h1>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: showFilters ? '#e5e7eb' : 'white',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            🔍 Filters
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={exporting}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                cursor: exporting ? 'not-allowed' : 'pointer',
                                opacity: exporting ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            📊 {exporting ? 'Exporting...' : 'Excel'}
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={exporting}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                cursor: exporting ? 'not-allowed' : 'pointer',
                                opacity: exporting ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            📄 {exporting ? 'Exporting...' : 'PDF'}
                        </button>
                        <button
                            onClick={() => router.push('/add-expense')}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            ➕ Add
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                                    Date From
                                </label>
                                <input
                                    type="date"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                                    Date To
                                </label>
                                <input
                                    type="date"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.category_id} value={cat.category_id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                                    Type
                                </label>
                                <select
                                    name="transaction_type"
                                    value={filters.transaction_type}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">All Types</option>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                                    Min Amount
                                </label>
                                <input
                                    type="number"
                                    name="min_amount"
                                    value={filters.min_amount}
                                    onChange={handleFilterChange}
                                    placeholder="0"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                                    Max Amount
                                </label>
                                <input
                                    type="number"
                                    name="max_amount"
                                    value={filters.max_amount}
                                    onChange={handleFilterChange}
                                    placeholder="999999"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="🔍 Search by note, category, or account..."
                                style={{
                                    flex: 1,
                                    minWidth: '250px',
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                            <button
                                onClick={applyFilters}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Count */}
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </p>

                {/* Transactions Table */}
                {transactions.length > 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(transaction => (
                                        <tr
                                            key={transaction.transaction_id}
                                            style={{
                                                borderBottom: '1px solid #e5e7eb',
                                                transition: 'background-color 0.15s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>
                                                {transaction.account?.account_name || 'N/A'}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>
                                                {transaction.category?.name || 'N/A'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    backgroundColor: transaction.transaction_type === 'Income' ? '#d1fae5' : '#fee2e2',
                                                    color: transaction.transaction_type === 'Income' ? '#065f46' : '#991b1b'
                                                }}>
                                                    {transaction.transaction_type}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right',
                                                fontWeight: '600',
                                                fontSize: '0.875rem',
                                                color: transaction.transaction_type === 'Income' ? '#10b981' : '#ef4444'
                                            }}>
                                                {transaction.transaction_type === 'Income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                    {transaction.tags?.map(tag => (
                                                        <span
                                                            key={tag.tag_id}
                                                            style={{
                                                                padding: '0.125rem 0.5rem',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                backgroundColor: tag.color + '20' || '#e5e7eb',
                                                                color: tag.color || '#6b7280',
                                                                border: `1px solid ${tag.color || '#d1d5db'}`
                                                            }}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {transaction.note || '-'}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => router.push(`/edit-transaction?id=${transaction.transaction_id}`)}
                                                        style={{
                                                            padding: '0.375rem 0.75rem',
                                                            backgroundColor: '#f3f4f6',
                                                            color: '#374151',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.15s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(transaction.transaction_id)}
                                                        style={{
                                                            padding: '0.375rem 0.75rem',
                                                            backgroundColor: '#fee2e2',
                                                            color: '#dc2626',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.15s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No transactions found</h3>
                        <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                            {Object.values(filters).some(v => v)
                                ? 'Try adjusting your filters to see more results.'
                                : 'Start by adding your first transaction.'}
                        </p>
                        {!Object.values(filters).some(v => v) && (
                            <button
                                onClick={() => router.push('/add-expense')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Add Transaction
                            </button>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

