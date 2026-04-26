'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';

export default function RecurringTransactions() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [recurring, setRecurring] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [formData, setFormData] = useState({
        account_id: '',
        category_id: '',
        amount: '',
        transaction_type: 'Expense',
        description: '',
        frequency: 'monthly',
        start_date: '',
        end_date: '',
        next_due_date: '',
        active: true,
        auto_create: true
    });

    const FREQUENCIES = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Biweekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' }
    ];

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            fetchData();
        }
    }, [isLoggedIn, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [recurringData, accountsData, categoriesData] = await Promise.all([
                apiService.getRecurringTransactions(),
                apiService.getAccounts(),
                apiService.getCategories()
            ]);
            setRecurring(recurringData);
            setAccounts(accountsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await apiService.updateRecurringTransaction(editingItem.recurring_id, formData);
            } else {
                await apiService.createRecurringTransaction(formData);
            }
            setShowForm(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to save: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this recurring transaction?')) {
            try {
                await apiService.deleteRecurringTransaction(id);
                fetchData();
            } catch (error) {
                alert('Failed to delete: ' + error.message);
            }
        }
    };

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const result = await apiService.generateRecurringTransactions();
            alert(`Generated ${result.created} transaction(s)`);
            fetchData();
        } catch (error) {
            alert('Failed to generate: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const resetForm = () => {
        setFormData({
            account_id: '',
            category_id: '',
            amount: '',
            transaction_type: 'Expense',
            description: '',
            frequency: 'monthly',
            start_date: '',
            end_date: '',
            next_due_date: '',
            active: true,
            auto_create: true
        });
    };

    const startEdit = (item) => {
        setEditingItem(item);
        setFormData({
            account_id: item.account?.account_id || '',
            category_id: item.category?.category_id || '',
            amount: item.amount,
            transaction_type: item.transaction_type,
            description: item.description || '',
            frequency: item.frequency,
            start_date: item.start_date,
            end_date: item.end_date || '',
            next_due_date: item.next_due_date,
            active: item.active,
            auto_create: item.auto_create
        });
        setShowForm(true);
    };

    const getFrequencyIcon = (freq) => {
        const icons = { daily: '📅', weekly: '📆', biweekly: '🗓️', monthly: '📊', quarterly: '📈', yearly: '🎉' };
        return icons[freq] || '🔄';
    };

    if (loading) {
        return (
            <main style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading recurring transactions...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f8fafc', padding: '2rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>🔄 Recurring Transactions</h1>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleGenerate} disabled={generating}
                            style={{
                                padding: '0.75rem 1.25rem', backgroundColor: '#10b981', color: 'white',
                                border: 'none', borderRadius: '8px', fontSize: '0.875rem', cursor: generating ? 'not-allowed' : 'pointer',
                                opacity: generating ? 0.6 : 1
                            }}>
                            {generating ? '⏳ Generating...' : '⚡ Generate Now'}
                        </button>
                        <button onClick={() => { setShowForm(!showForm); setEditingItem(null); resetForm(); }}
                            style={{
                                padding: '0.75rem 1.5rem', backgroundColor: showForm ? '#6b7280' : '#3b82f6',
                                color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
                            }}>
                            {showForm ? '✕ Cancel' : '➕ Add Recurring'}
                        </button>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            {editingItem ? '✏️ Edit Recurring Transaction' : '➕ Create Recurring Transaction'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Account *</label>
                                    <select required value={formData.account_id} onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white' }}>
                                        <option value="">Select Account</option>
                                        {accounts.map(acc => (
                                            <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Category *</label>
                                    <select required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white' }}>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Amount *</label>
                                    <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Type *</label>
                                    <select value={formData.transaction_type} onChange={(e) => setFormData({...formData, transaction_type: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white' }}>
                                        <option value="Expense">Expense</option>
                                        <option value="Income">Income</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Frequency *</label>
                                    <select required value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white' }}>
                                        {FREQUENCIES.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Start Date *</label>
                                    <input type="date" required value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Next Due Date *</label>
                                    <input type="date" required value={formData.next_due_date} onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>End Date (optional)</label>
                                    <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Description</label>
                                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="e.g., Monthly Rent, Netflix Subscription"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Active</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.auto_create} onChange={(e) => setFormData({...formData, auto_create: e.target.checked})} />
                                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Auto-create transactions</span>
                                </label>
                            </div>
                            <button type="submit" style={{
                                padding: '0.75rem 2rem', backgroundColor: '#3b82f6', color: 'white',
                                border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
                            }}>
                                {editingItem ? '💾 Update' : '➕ Create'}
                            </button>
                        </form>
                    </div>
                )}

                {/* List */}
                {recurring.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {recurring.map(item => (
                            <div key={item.recurring_id} style={{
                                backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                opacity: item.active ? 1 : 0.6
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '1.25rem' }}>{getFrequencyIcon(item.frequency)}</span>
                                            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.125rem' }}>
                                                {item.description || 'Recurring Transaction'}
                                            </h3>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                            {item.account?.account_name} → {item.category?.name}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500',
                                        backgroundColor: item.transaction_type === 'Income' ? '#d1fae5' : '#fee2e2',
                                        color: item.transaction_type === 'Income' ? '#065f46' : '#991b1b'
                                    }}>
                                        {item.transaction_type}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: item.transaction_type === 'Income' ? '#10b981' : '#ef4444' }}>
                                        {item.transaction_type === 'Income' ? '+' : '-'}${parseFloat(item.amount).toFixed(2)}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        {FREQUENCIES.find(f => f.value === item.frequency)?.label || item.frequency}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                    <div>📅 Start: {new Date(item.start_date).toLocaleDateString()}</div>
                                    <div>⏰ Next: {new Date(item.next_due_date).toLocaleDateString()}</div>
                                    {item.end_date && <div>🏁 End: {new Date(item.end_date).toLocaleDateString()}</div>}
                                    <div>🤖 Auto: {item.auto_create ? 'Yes' : 'No'}</div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(item)}
                                        style={{
                                            flex: 1, padding: '0.5rem', backgroundColor: '#f3f4f6', color: '#374151',
                                            border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer'
                                        }}>
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => handleDelete(item.recurring_id)}
                                        style={{
                                            padding: '0.5rem 0.75rem', backgroundColor: '#fee2e2', color: '#dc2626',
                                            border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer'
                                        }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '12px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No recurring transactions</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Set up recurring transactions for bills, subscriptions, or regular income.</p>
                        <button onClick={() => setShowForm(true)}
                            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
                            Add Recurring Transaction
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

