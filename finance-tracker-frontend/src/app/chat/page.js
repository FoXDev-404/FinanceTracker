'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { apiService } from '../api-service';
import Navbar from '../Navbar';
import Link from 'next/link';

export default function ChatPage() {
    const { isLoggedIn } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = { text: inputMessage, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await apiService.chat(inputMessage);
            const aiMessage = {
                text: response.response,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                text: `Sorry, I encountered an error: ${error.message}`,
                sender: 'ai',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    maxWidth: '400px'
                }}>
                    <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
                        Please Login First
                    </h2>
                    <p style={{ color: '#64748b', margin: '0 0 2rem 0' }}>
                        You need to be logged in to use the AI Finance Assistant.
                    </p>
                    <Link
                        href="/login"
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            display: 'inline-block'
                        }}
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
        }}>
            

            <div style={{
                flex: 1,
                maxWidth: '800px',
                margin: '0 auto',
                padding: '2rem',
                width: '100%'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem'
                        }}>
                            🤖
                        </div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            AI Finance Assistant
                        </h1>
                    </div>
                    <p style={{
                        color: '#64748b',
                        margin: 0,
                        fontSize: '1.1rem'
                    }}>
                        Ask me anything about your finances! 💰
                    </p>
                </div>

                {/* Chat Container */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    height: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        padding: '1.5rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {messages.length === 0 ? (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: '#64748b'
                            }}>
                                <div>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                                        Start a conversation!
                                    </h3>
                                    <p style={{ margin: 0 }}>
                                        Ask me about your account balances, spending patterns, budgets, or get financial advice.
                                    </p>
                                    <div style={{
                                        marginTop: '1rem',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        justifyContent: 'center'
                                    }}>
                                        {[
                                            "What's my total account balance?",
                                            "Show me my recent transactions",
                                            "How much did I spend on food this month?",
                                            "Am I on track with my budgets?"
                                        ].map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setInputMessage(suggestion)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: '#f1f5f9',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '20px',
                                                    fontSize: '0.875rem',
                                                    color: '#475569',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.backgroundColor = '#e2e8f0';
                                                    e.target.style.borderColor = '#cbd5e1';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = '#f1f5f9';
                                                    e.target.style.borderColor = '#e2e8f0';
                                                }}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '18px',
                                        backgroundColor: message.sender === 'user' ? '#3b82f6' : message.isError ? '#fee2e2' : '#f1f5f9',
                                        color: message.sender === 'user' ? 'white' : message.isError ? '#dc2626' : '#1f2937',
                                        border: message.isError ? '1px solid #fecaca' : 'none',
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word'
                                    }}>
                                        {message.text}
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-start'
                            }}>
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '18px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '2px solid #cbd5e1',
                                        borderTop: '2px solid #3b82f6',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Thinking...
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{
                        padding: '1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#fafafa'
                    }}>
                        <form onSubmit={handleSendMessage} style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center'
                        }}>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask me about your finances..."
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isLoading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: (!inputMessage.trim() || isLoading) ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                    if (!(!inputMessage.trim() || isLoading)) {
                                        e.target.style.backgroundColor = '#2563eb';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!(!inputMessage.trim() || isLoading)) {
                                        e.target.style.backgroundColor = '#3b82f6';
                                    }
                                }}
                            >
                                {isLoading ? '...' : 'Send'}
                                {!isLoading && <span>📤</span>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    color: '#64748b',
                    fontSize: '0.875rem'
                }}>
                    <p style={{ margin: 0 }}>
                        💡 Try asking: &quot;What&apos;s my spending trend?&quot; or &quot;How can I save more money?&quot;
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
