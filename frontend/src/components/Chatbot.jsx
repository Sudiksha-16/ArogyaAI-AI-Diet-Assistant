import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { FaRobot, FaPaperPlane, FaTrash } from 'react-icons/fa';

const Chatbot = ({ isFloating = false }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(!isFloating);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && !isFloating) {
            fetchHistory();
        }
    }, [isOpen, isFloating]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get('/chatbot/history');
            setMessages(response.data);
        } catch (error) {
            console.error('Fetch history error:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/chatbot/chat', { message: input });
            const aiMessage = { role: 'assistant', content: response.data.response, timestamp: new Date() };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        try {
            await api.delete('/chatbot/history');
            setMessages([]);
        } catch (error) {
            console.error('Clear history error:', error);
        }
    };

    if (isFloating && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-500 to-purple-500 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
            >
                <FaRobot className="text-3xl text-white" />
            </button>
        );
    }

    const ChatContent = () => (
        <>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full">
                        <FaRobot className="text-2xl text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">AI Nutrition Coach</h2>
                        <p className="text-sm text-white/70">Ask me anything about nutrition!</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {messages.length > 0 && (
                        <button onClick={clearHistory} className="text-white/70 hover:text-white">
                            <FaTrash />
                        </button>
                    )}
                    {isFloating && (
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white text-xl">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-4 max-h-[500px]">
                {messages.length === 0 ? (
                    <div className="text-center text-white/70 py-8">
                        <p className="mb-4">👋 Hi! I'm your AI nutrition coach.</p>
                        <p className="text-sm">Ask me about:</p>
                        <ul className="text-sm mt-2 space-y-1">
                            <li>• Meal suggestions</li>
                            <li>• Food substitutions</li>
                            <li>• Portion guidance</li>
                            <li>• Post-workout nutrition</li>
                        </ul>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white'
                                    : 'bg-white/10 text-white'
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-4 rounded-2xl">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Ask me anything..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()} className="btn-primary disabled:opacity-50">
                    <FaPaperPlane />
                </button>
            </form>
        </>
    );

    if (isFloating) {
        return (
            <div className="fixed bottom-6 right-6 w-96 glass-card p-6 shadow-2xl z-50 animate-slide-up">
                <ChatContent />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="glass-card p-6 flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
                    <ChatContent />
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
