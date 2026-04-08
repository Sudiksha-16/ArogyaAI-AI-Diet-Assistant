import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const css = `
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes msgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .chat-input{flex:1;padding:0.75rem 1rem;border-radius:0.875rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:white;font-size:0.875rem;outline:none;transition:all 0.2s;font-family:inherit;}
  .chat-input::placeholder{color:rgba(255,255,255,0.25);}
  .chat-input:focus{border-color:rgba(99,102,241,0.6);background:rgba(99,102,241,0.08);}
  .quick-prompt{padding:0.625rem 0.875rem;border-radius:0.875rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.2s;color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;font-family:inherit;text-align:left;white-space:nowrap;}
  .quick-prompt:hover{background:rgba(99,102,241,0.12);border-color:rgba(99,102,241,0.35);color:white;}
  .send-btn{padding:0.75rem 1rem;border-radius:0.875rem;border:none;cursor:pointer;font-weight:700;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-family:inherit;transition:all 0.2s;display:flex;align-items:center;justify-content:center;min-width:3rem;}
  .send-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(99,102,241,0.4);}
  .send-btn:disabled{opacity:0.45;cursor:not-allowed;}
`;

const QUICK_PROMPTS = [
    '🥗 High-protein breakfast ideas',
    '🏃 Best foods after a workout',
    '😴 Late-night healthy snacks',
    '🔥 How to lose belly fat',
    '💊 Do I need supplements?',
    '🥑 Explain macros simply',
];

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        api.get('/chatbot/history')
            .then(r => {
                const h = r.data.history || [];
                setMessages(h.flatMap(item => [
                    { role: 'user', text: item.userMessage, time: item.createdAt },
                    { role: 'ai', text: item.botResponse, time: item.createdAt },
                ]));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const send = async (text) => {
        const msg = text || input.trim();
        if (!msg || sending) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }]);
        setSending(true);
        try {
            const r = await api.post('/chatbot/chat', { message: msg });
            setMessages(prev => [...prev, { role: 'ai', text: r.data.response, time: new Date() }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: '⚠️ I\'m having trouble right now. Please check your OpenAI API key in the backend .env file.', time: new Date() }]);
        } finally { setSending(false); }
    };

    const clearChat = async () => {
        if (!confirm('Clear chat history?')) return;
        await api.delete('/chatbot/history').catch(() => { });
        setMessages([]);
    };

    return (
        <>
            <style>{css}</style>
            <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)', flexShrink: 0 }}>🧠</div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>AI Diet Coach</h1>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
                                Online · Powered by GPT-4
                            </p>
                        </div>
                    </div>
                    {messages.length > 0 && (
                        <button onClick={clearChat} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                            🗑 Clear
                        </button>
                    )}
                </div>

                {/* Chat container */}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            </div>
                        ) : messages.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'float 4s ease-in-out infinite' }}>🧠</div>
                                <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>Your Personal Diet Coach</h2>
                                <p style={{ margin: '0 0 1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', maxWidth: '360px' }}>Ask me anything about nutrition, healthy eating, meal planning, or your personal diet goals.</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '500px' }}>
                                    {QUICK_PROMPTS.map((p, i) => (
                                        <button key={i} onClick={() => send(p.replace(/^[^ ]+ /, ''))} className="quick-prompt">{p}</button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'msgIn 0.3s ease' }}>
                                    {/* Avatar */}
                                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.07)', border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                                        {msg.role === 'user' ? '👤' : '🧠'}
                                    </div>
                                    {/* Bubble */}
                                    <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ padding: '0.75rem 1rem', lineHeight: 1.6, fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...(msg.role === 'user' ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '1rem 1rem 0.25rem 1rem', color: 'white' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1rem 1rem 1rem 0.25rem', color: 'rgba(255,255,255,0.85)' }) }}>
                                            {msg.text}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', padding: '0 0.25rem' }}>
                                            {new Date(msg.time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Typing indicator */}
                        {sending && (
                            <div style={{ display: 'flex', gap: '0.75rem', animation: 'msgIn 0.3s ease' }}>
                                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>🧠</div>
                                <div style={{ padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1rem 1rem 1rem 0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: 'flex', gap: '0.75rem' }}>
                            <input className="chat-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your AI diet coach anything..." disabled={sending} />
                            <button type="submit" disabled={!input.trim() || sending} className="send-btn">
                                {sending ? <div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : '→'}
                            </button>
                        </form>
                        <p style={{ margin: '0.5rem 0 0', textAlign: 'center', fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>
                            AI responses are not medical advice · Consult a healthcare professional for health decisions
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chatbot;
