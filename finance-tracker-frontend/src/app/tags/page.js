'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';

export default function Tags() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [formData, setFormData] = useState({ name: '', color: '#3b82f6' });

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7'];

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            fetchTags();
        }
    }, [isLoggedIn, router]);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const data = await apiService.getTags();
            setTags(data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTag) {
                await apiService.updateTag(editingTag.tag_id, formData);
            } else {
                await apiService.createTag(formData);
            }
            setShowForm(false);
            setEditingTag(null);
            setFormData({ name: '', color: '#3b82f6' });
            fetchTags();
        } catch (error) {
            alert('Failed to save tag: ' + error.message);
        }
    };

    const handleDelete = async (tagId) => {
        if (confirm('Are you sure you want to delete this tag?')) {
            try {
                await apiService.deleteTag(tagId);
                fetchTags();
            } catch (error) {
                alert('Failed to delete tag: ' + error.message);
            }
        }
    };

    const startEdit = (tag) => {
        setEditingTag(tag);
        setFormData({ name: tag.name, color: tag.color });
        setShowForm(true);
    };

    if (loading) {
        return (
            <main style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading tags...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f8fafc', padding: '2rem 0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>🏷️ Tags</h1>
                    <button onClick={() => { setShowForm(!showForm); setEditingTag(null); setFormData({ name: '', color: '#3b82f6' }); }}
                        style={{
                            padding: '0.75rem 1.5rem', backgroundColor: showForm ? '#6b7280' : '#3b82f6',
                            color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
                        }}>
                        {showForm ? '✕ Cancel' : '➕ Add Tag'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
                            {editingTag ? '✏️ Edit Tag' : '➕ Create Tag'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Tag Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g., Business, Personal, Urgent"
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.375rem' }}>Color</label>
                                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                        {COLORS.map(color => (
                                            <button key={color} type="button" onClick={() => setFormData({...formData, color})}
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    backgroundColor: color,
                                                    border: formData.color === color ? '3px solid #1f2937' : '3px solid transparent',
                                                    cursor: 'pointer'
                                                }} />
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" style={{
                                    padding: '0.625rem 1.5rem', backgroundColor: '#3b82f6', color: 'white',
                                    border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer'
                                }}>
                                    {editingTag ? '💾 Update' : '➕ Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tags List */}
                {tags.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {tags.map(tag => (
                            <div key={tag.tag_id} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', backgroundColor: 'white',
                                borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                border: `2px solid ${tag.color || '#e5e7eb'}`
                            }}>
                                <span style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    backgroundColor: tag.color || '#3b82f6'
                                }} />
                                <span style={{ fontWeight: '500', color: '#374151' }}>{tag.name}</span>
                                <button onClick={() => startEdit(tag)}
                                    style={{
                                        padding: '0.25rem 0.5rem', backgroundColor: 'transparent', color: '#6b7280',
                                        border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
                                    }}>
                                    ✏️
                                </button>
                                <button onClick={() => handleDelete(tag.tag_id)}
                                    style={{
                                        padding: '0.25rem 0.5rem', backgroundColor: 'transparent', color: '#ef4444',
                                        border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
                                    }}>
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '12px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No tags yet</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Create tags to organize and filter your transactions.</p>
                        <button onClick={() => setShowForm(true)}
                            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
                            Create Tag
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

