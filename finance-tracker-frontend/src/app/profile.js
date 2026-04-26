'use client';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from './ProtectedRoute';

function ProfileContent() {
    const { user, message, handleGetProfile, handleLogout, loading } = useAuth();
    const router = useRouter();

    const handleLogoutClick = async () => {
        await handleLogout();
        router.push('/login');
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        margin: '0 0 10px 0',
                        color: '#333',
                        fontSize: '28px'
                    }}>
                        👤 User Profile
                    </h1>
                    <p style={{
                        margin: '0',
                        color: '#6c757d',
                        fontSize: '16px'
                    }}>
                        Welcome to your Finance Tracker profile
                    </p>
                </div>

                {/* Message Display */}
                {message && (
                    <div style={{
                        padding: '15px',
                        marginBottom: '20px',
                        backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                        color: message.includes('✅') ? '#155724' : '#721c24',
                        border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                {/* User Info Card */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '20px'
                }}>
                    <h2 style={{
                        margin: '0 0 20px 0',
                        color: '#333',
                        fontSize: '20px',
                        borderBottom: '2px solid #007bff',
                        paddingBottom: '10px'
                    }}>
                        📋 User Information
                    </h2>

                    {user ? (
                        <div style={{
                            display: 'grid',
                            gap: '15px',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
                        }}>
                            <div style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: '4px solid #007bff'
                            }}>
                                <strong style={{ color: '#495057' }}>Name:</strong>
                                <p style={{ margin: '5px 0 0 0', color: '#212529' }}>{user.name}</p>
                            </div>

                            <div style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: '4px solid #28a745'
                            }}>
                                <strong style={{ color: '#495057' }}>Email:</strong>
                                <p style={{ margin: '5px 0 0 0', color: '#212529' }}>{user.email}</p>
                            </div>

                            <div style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: '4px solid #17a2b8'
                            }}>
                                <strong style={{ color: '#495057' }}>User ID:</strong>
                                <p style={{ margin: '5px 0 0 0', color: '#212529', fontFamily: 'monospace' }}>
                                    {user.id || 'N/A'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                            No user data available
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '20px'
                }}>
                    <h2 style={{
                        margin: '0 0 20px 0',
                        color: '#333',
                        fontSize: '20px',
                        borderBottom: '2px solid '#17a2b8',
                        paddingBottom: '10px'
                    }}>
                        🔧 Actions
                    </h2>

                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <button
                            onClick={handleGetProfile}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: loading ? '#6c757d' : '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#138496')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#17a2b8')}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid transparent',
                                        borderTop: '2px solid currentColor',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Loading...
                                </>
                            ) : (
                                '🔄 Refresh Profile'
                            )}
                        </button>

                        <button
                            onClick={handleLogoutClick}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: loading ? '#6c757d' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#c82333')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#dc3545')}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid transparent',
                                        borderTop: '2px solid currentColor',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Logging out...
                                </>
                            ) : (
                                '🚪 Logout'
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <Link
                        href="/"
                        style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: '500',
                            padding: '10px 20px',
                            border: '2px solid #007bff',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            display: 'inline-block'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#007bff';
                            e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#007bff';
                        }}
                    >
                        🏠 Back to Home
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    padding: 10px;
                }

                @media (max-width: 480px) {
                    .action-buttons {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}

export default function Profile() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}
