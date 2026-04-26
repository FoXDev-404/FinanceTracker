'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';

export default function AddBudget() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true); // Set to true initially to load categories
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: '',
        amount: '',
        month: new Date().toISOString().slice(0, 7) // YYYY-MM
    });

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const categoriesRes = await apiService.getCategories();
            setCategories(categoriesRes.filter(cat => cat.type === 'Expense'));
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            alert('Failed to load categories.');
            router.push('/dashboard');
        }
    }, [router]);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            fetchCategories();
        }
    }, [isLoggedIn, router, fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            const data = {
                category_id: parseInt(formData.category_id),
                amount: parseFloat(formData.amount),
                month: formData.month + '-01'  // Append day to make valid date string
            };

            await apiService.createBudget(data);
            alert('Budget added successfully!');
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to create budget:', error);
            alert('Failed to add budget. Please try again.');
        } finally {
            setSaving(false);
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
                        🎯 Set Budget
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Set a budget for a category for a specific month
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
                                Category *
                            </label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    backgroundColor: 'white'
                                }}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
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

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                                Month *
                            </label>
                            <input
                                type="month"
                                value={formData.month}
                                onChange={(e) => setFormData({...formData, month: e.target.value})}
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

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: saving ? '#9ca3af' : '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => !saving && (e.target.style.backgroundColor = '#d97706')}
                                onMouseOut={(e) => !saving && (e.target.style.backgroundColor = '#f59e0b')}
                            >
                                {saving ? 'Setting...' : '🎯 Set Budget'}
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
