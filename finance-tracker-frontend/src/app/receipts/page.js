'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';

export default function Receipts() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        }
    }, [isLoggedIn, router]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            setExtractedData(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            setUploading(true);
            // For now, simulate extraction - in production this would call the vision API
            await new Promise(resolve => setTimeout(resolve, 2000));
            setExtractedData({
                vendor: 'Sample Store',
                date: new Date().toISOString().split('T')[0],
                amount: '45.67',
                category: 'Groceries',
                items: ['Item 1 - $20.00', 'Item 2 - $15.67', 'Item 3 - $10.00']
            });
        } catch (error) {
            alert('Failed to process receipt: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateTransaction = () => {
        if (extractedData) {
            const params = new URLSearchParams({
                amount: extractedData.amount,
                note: `Receipt from ${extractedData.vendor}`,
                date: extractedData.date
            });
            router.push(`/add-expense?${params.toString()}`);
        }
    };

    return (
        <main style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f8fafc', padding: '2rem 0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
                <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '2rem', color: '#1f2937' }}>📄 Receipt Scanner</h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    Upload a receipt image and our AI will extract the transaction details for you.
                </p>

                {/* Upload Area */}
                <div style={{
                    backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem'
                }}>
                    <div style={{
                        border: '2px dashed #d1d5db', borderRadius: '12px', padding: '3rem',
                        textAlign: 'center', backgroundColor: '#f9fafb'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
                        <p style={{ color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Drag and drop a receipt image here
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            or click to browse (PNG, JPG, JPEG)
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            id="receipt-input"
                        />
                        <label htmlFor="receipt-input" style={{
                            padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white',
                            borderRadius: '8px', cursor: 'pointer', display: 'inline-block', fontSize: '1rem'
                        }}>
                            Choose File
                        </label>
                    </div>
                </div>

                {/* Preview */}
                {preview && (
                    <div style={{
                        backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>📷 Preview</h3>
                        <img src={preview} alt="Receipt preview" style={{
                            maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', display: 'block', margin: '0 auto'
                        }} />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                            <button onClick={handleUpload} disabled={uploading}
                                style={{
                                    padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white',
                                    border: 'none', borderRadius: '8px', fontSize: '1rem',
                                    cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1
                                }}>
                                {uploading ? '⏳ Processing...' : '🔍 Extract Data'}
                            </button>
                            <button onClick={() => { setPreview(null); setSelectedFile(null); setExtractedData(null); }}
                                style={{
                                    padding: '0.75rem 2rem', backgroundColor: '#f3f4f6', color: '#374151',
                                    border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
                                }}>
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Extracted Data */}
                {extractedData && (
                    <div style={{
                        backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>📋 Extracted Data</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <DataField label="Vendor" value={extractedData.vendor} />
                            <DataField label="Date" value={extractedData.date} />
                            <DataField label="Total Amount" value={`$${extractedData.amount}`} />
                            <DataField label="Category" value={extractedData.category} />
                        </div>
                        {extractedData.items && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Items</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151' }}>
                                    {extractedData.items.map((item, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button onClick={handleCreateTransaction}
                            style={{
                                width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white',
                                border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
                            }}>
                            ➕ Create Transaction from Receipt
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

function DataField({ label, value }) {
    return (
        <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>{label}</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#1f2937' }}>{value}</p>
        </div>
    );
}

