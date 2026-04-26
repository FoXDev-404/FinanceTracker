'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';

export default function SavingsGoals() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [contributeGoal, setContributeGoal] = useState(null);
    const [contributeAmount, setContributeAmount] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        target_amount: '',
        current_amount: '0',
        deadline: '',
        icon: '🎯',
        color: '#3b82f6'
    });

    const ICONS = ['🎯', '💰', '🏠', '🚗', '✈️', '📚', '💻', '🏥', '🎓', '💍', '🏖️', '🎮'];
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            fetchGoals();
        }
    }, [isLoggedIn, router]);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const data = await apiService.getSavingsGoals();
            setGoals(data);
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGoal) {
                await apiService.updateSavingsGoal(editingGoal.goal_id, formData);
            } else {
                await apiService.createSavingsGoal(formData);
            }
            setShowForm(false);
            setEditingGoal(null);
            resetForm();
            fetchGoals();
        } catch (error) {
            alert('Failed to save goal: ' + error.message);
        }
    };

    const handleDelete = async (goalId) => {
        if (confirm('Are you sure you want to delete this savings goal?')) {
            try {
                await apiService.deleteSavingsGoal(goalId);
                fetchGoals();
            } catch (error) {
                alert('Failed to delete goal: ' + error.message);
            }
        }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        try {
            await apiService.contributeToGoal(contributeGoal.goal_id, contributeAmount);
            setContributeGoal(null);
            setContributeAmount('');
            fetchGoals();
        } catch (error) {
            alert('Failed to contribute: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            target_amount: '',
            current_amount: '0',
            deadline: '',
            icon: '🎯',
            color: '#3b82f6'
        });
    };

    const startEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            description: goal.description || '',
            target_amount: goal.target_amount,
            current_amount: goal.current_amount,
            deadline: goal.deadline || '',
            icon: goal.icon || '🎯',
            color: goal.color || '#3b82f6'
        });
        setShowForm(true);
    };

    if (loading) {
        return (
            <main style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading savings goals...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f8fafc', padding: '2rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>🏦 Savings Goals</h1>
                    <button
                        onClick={() => { setShowForm(!showForm); setEditingGoal(null); resetForm(); }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: showForm ? '#6b7280' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        {showForm ? '✕ Cancel' : '➕ Add Goal'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>
                            {editingGoal ? '✏️ Edit Goal' : '➕ Create New Goal'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Goal Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Target Amount *</label>
                                    <input type="number" step="0.01" required value={formData.target_amount} onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Current Amount</label>
                                    <input type="number" step="0.01" value={formData.current_amount} onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Deadline</label>
                                    <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Icon</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {ICONS.map(icon => (
                                        <button key={icon} type="button" onClick={() => setFormData({...formData, icon})}
                                            style={{
                                                padding: '0.5rem', fontSize: '1.5rem', borderRadius: '8px',
                                                border: formData.icon === icon ? '2px solid #3b82f6' : '2px solid transparent',
                                                backgroundColor: formData.icon === icon ? '#eff6ff' : '#f3f4f6',
                                                cursor: 'pointer'
                                            }}>{icon}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Color</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {COLORS.map(color => (
                                        <button key={color} type="button" onClick={() => setFormData({...formData, color})}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                backgroundColor: color,
                                                border: formData.color === color ? '3px solid #1f2937' : '3px solid transparent',
                                                cursor: 'pointer'
                                            }} />
                                    ))}
                                </div>
                            </div>
                            <button type="submit" style={{
                                padding: '0.75rem 2rem', backgroundColor: '#3b82f6', color: 'white',
                                border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
                            }}>
                                {editingGoal ? '💾 Update Goal' : '➕ Create Goal'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Goals Grid */}
                {goals.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {goals.map(goal => {
                            const progress = goal.progress_percentage || 0;
                            const isCompleted = progress >= 100;
                            return (
                                <div key={goal.goal_id} style={{
                                    backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                    borderLeft: `4px solid ${goal.color || '#3b82f6'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '2rem' }}>{goal.icon || '🎯'}</span>
                                            <div>
                                                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.125rem' }}>{goal.name}</h3>
                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                                    {goal.description || 'No description'}
                                                </p>
                                            </div>
                                        </div>
                                        {isCompleted && <span style={{ fontSize: '1.5rem' }}>🎉</span>}
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Progress</span>
                                            <span style={{ fontWeight: 'bold', color: isCompleted ? '#10b981' : '#3b82f6' }}>{progress}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${Math.min(progress, 100)}%`, height: '100%',
                                                backgroundColor: isCompleted ? '#10b981' : (goal.color || '#3b82f6'),
                                                borderRadius: '6px', transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#6b7280' }}>${parseFloat(goal.current_amount).toFixed(2)} saved</span>
                                        <span style={{ color: '#6b7280' }}>of ${parseFloat(goal.target_amount).toFixed(2)}</span>
                                    </div>

                                    {goal.deadline && (
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                                            📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => { setContributeGoal(goal); setContributeAmount(''); }}
                                            style={{
                                                flex: 1, padding: '0.5rem', backgroundColor: '#10b981', color: 'white',
                                                border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer'
                                            }}>
                                            💰 Contribute
                                        </button>
                                        <button onClick={() => startEdit(goal)}
                                            style={{
                                                padding: '0.5rem 0.75rem', backgroundColor: '#f3f4f6', color: '#374151',
                                                border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer'
                                            }}>
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(goal.goal_id)}
                                            style={{
                                                padding: '0.5rem 0.75rem', backgroundColor: '#fee2e2', color: '#dc2626',
                                                border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer'
                                            }}>
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '12px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No savings goals yet</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Create your first goal to start tracking your progress!</p>
                        <button onClick={() => setShowForm(true)}
                            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
                            Create Goal
                        </button>
                    </div>
                )}

                {/* Contribute Modal */}
                {contributeGoal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>💰 Contribute to {contributeGoal.name}</h3>
                            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                                Current: ${parseFloat(contributeGoal.current_amount).toFixed(2)} / ${parseFloat(contributeGoal.target_amount).toFixed(2)}
                            </p>
                            <form onSubmit={handleContribute}>
                                <input
                                    type="number" step="0.01" required autoFocus
                                    value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '1rem', fontSize: '1rem' }}
                                />
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" style={{
                                        flex: 1, padding: '0.75rem', backgroundColor: '#10b981', color: 'white',
                                        border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer'
                                    }}>
                                        Contribute
                                    </button>
                                    <button type="button" onClick={() => setContributeGoal(null)}
                                        style={{
                                            flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151',
                                            border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer'
                                        }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

