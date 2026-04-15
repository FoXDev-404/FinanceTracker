'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';

export default function AddExpense() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        account_name: '',
        category_name: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        }
    }, [isLoggedIn, router]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Get or create account
            let accountId;
            const accounts = await apiService.getAccounts();
            const existingAccount = accounts.find(acc => acc.account_name.toLowerCase() === formData.account_name.toLowerCase());
            if (existingAccount) {
                accountId = existingAccount.account_id;
            } else {
                const newAccount = await apiService.createAccount({
                    account_name: formData.account_name,
                    account_type: 'Checking',
                    balance: 0
                });
                accountId = newAccount.account_id;
            }

            // Get or create category
            let categoryId;
            const categories = await apiService.getCategories();
            const existingCategory = categories.find(cat => cat.name.toLowerCase() === formData.category_name.toLowerCase() && cat.type === 'Expense');
            if (existingCategory) {
                categoryId = existingCategory.category_id;
            } else {
                const newCategory = await apiService.createCategory({
                    name: formData.category_name,
                    type: 'Expense'
                });
                categoryId = newCategory.category_id;
            }

            const data = {
                account_id: accountId,
                category_id: categoryId,
                amount: parseFloat(formData.amount),
                note: formData.description,
                transaction_type: 'Expense',
                date: formData.date
            };

            await apiService.createTransaction(data);
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to create expense:', error);
            alert('Failed to add expense. Please try again.');
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
                    <p>Loading...</p>
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
                maxWidth: '600px',
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
                    <h1 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '2rem',
                        color: '#1f2937'
                    }}>
                        ➕ Add Expense
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Record a new expense transaction
                    </p>
                </div>

                {/* Form */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                                Account *
                            </label>
                            <input
                                type="text"
                                value={formData.account_name}
                                onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                                placeholder="Enter account name"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                                Category *
                            </label>
                            <input
                                type="text"
                                value={formData.category_name}
                                onChange={(e) => setFormData({...formData, category_name: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                                placeholder="Enter category name"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                                Amount *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6b7280',
                                    fontSize: '1rem'
                                }}>
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                                Date *
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                                placeholder="Add a note about this expense..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                            >
                                ➕ Add Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
