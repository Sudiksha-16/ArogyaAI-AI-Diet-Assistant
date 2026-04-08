import express from 'express';
import OpenAI from 'openai';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';
import MealLog from '../models/MealLog.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Chat with AI
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Safely get profile fields (null-safe)
        const profile = user.profile || {};
        const goal = profile.goal || 'maintain a healthy diet';
        const calorieTarget = profile.calorieTarget || 2000;
        const dietaryRestrictions = (profile.dietaryRestrictions || []).join(', ') || 'None';
        const allergies = (profile.allergies || []).join(', ') || 'None';
        const healthConditions = (profile.healthConditions || []).join(', ') || 'None';

        // Get recent meal logs for context
        const recentLogs = await MealLog.find({ userId: req.userId })
            .sort({ date: -1 })
            .limit(5);

        const recentMeals = recentLogs.length > 0
            ? recentLogs.map(log => `${log.foodName || log.name || 'Food'} (${log.nutrition?.calories || log.calories || 0} cal)`).join(', ')
            : 'No recent meals logged yet';

        const systemContext = `You are a personalized AI nutrition coach. Be friendly, helpful, and specific.
User Profile:
- Goal: ${goal}
- Daily Calorie Target: ${calorieTarget} kcal
- Dietary Restrictions: ${dietaryRestrictions}
- Allergies: ${allergies}
- Health Conditions: ${healthConditions}
Recent Meals: ${recentMeals}

Provide personalized, evidence-based nutrition advice. Keep responses concise (2-4 paragraphs max). Use bullet points when listing items. Never recommend extreme diets or replace medical advice.`;

        // Get or create chat history
        let chatHistory = await ChatHistory.findOne({ userId: req.userId });
        if (!chatHistory) {
            chatHistory = new ChatHistory({ userId: req.userId, messages: [] });
        }

        // Add user message to local history
        chatHistory.messages.push({ role: 'user', content: message });

        // Build message array for OpenAI (last 10 messages for context)
        const recentMessages = chatHistory.messages.slice(-10);
        const openAiMessages = [
            { role: 'system', content: systemContext },
            ...recentMessages.map(m => ({ role: m.role, content: m.content }))
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: openAiMessages,
            temperature: 0.7,
            max_tokens: 600,
        });

        const aiResponse = completion.choices[0].message.content;

        // Save assistant response to history
        chatHistory.messages.push({ role: 'assistant', content: aiResponse });
        // Keep history to last 50 messages to avoid bloat
        if (chatHistory.messages.length > 50) {
            chatHistory.messages = chatHistory.messages.slice(-50);
        }
        await chatHistory.save();

        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Chatbot error:', error.response?.data || error.message);
        const isQuota = error.status === 429 || error.message?.includes('quota');
        res.status(500).json({
            error: isQuota
                ? 'OpenAI quota exceeded. Please check your API key billing at platform.openai.com'
                : 'Error processing chat message'
        });
    }
});

// Get chat history — returns {history:[{userMessage, botResponse, createdAt}]}
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const chatHistory = await ChatHistory.findOne({ userId: req.userId });
        if (!chatHistory || !chatHistory.messages.length) {
            return res.json({ history: [] });
        }

        // Pair up user/assistant messages into history objects
        const msgs = chatHistory.messages;
        const history = [];
        for (let i = 0; i < msgs.length - 1; i += 2) {
            if (msgs[i].role === 'user' && msgs[i + 1]?.role === 'assistant') {
                history.push({
                    userMessage: msgs[i].content,
                    botResponse: msgs[i + 1].content,
                    createdAt: msgs[i + 1].createdAt || new Date(),
                });
            }
        }
        res.json({ history });
    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({ error: 'Error fetching chat history' });
    }
});

// Clear chat history
router.delete('/history', authMiddleware, async (req, res) => {
    try {
        await ChatHistory.findOneAndDelete({ userId: req.userId });
        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({ error: 'Error clearing chat history' });
    }
});

export default router;
