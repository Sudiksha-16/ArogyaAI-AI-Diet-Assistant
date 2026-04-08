import express from 'express';
import MealLog from '../models/MealLog.js';
import HydrationLog from '../models/HydrationLog.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: normalize a log entry to consistent field names
function normLog(log) {
    const l = log.toObject ? log.toObject() : log;
    return {
        calories: l.calories || l.nutrition?.calories || 0,
        protein: l.protein || l.nutrition?.protein || 0,
        carbs: l.carbs || l.nutrition?.carbs || 0,
        fat: l.fat || l.nutrition?.fat || l.nutrition?.fats || 0,
        quantity: l.quantity || 1,
        date: l.date,
    };
}

// Get dashboard summary — matches Dashboard.jsx expectations
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const profile = user.profile || {};
        const calorieTarget = profile.calorieTarget || 2000;
        const macroTargets = profile.macroTargets || {};

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayLogs = await MealLog.find({ userId: req.userId, date: { $gte: startOfDay } });

        const todayTotals = todayLogs.reduce((acc, log) => {
            const n = normLog(log);
            return {
                calories: acc.calories + n.calories,
                protein: acc.protein + n.protein,
                carbs: acc.carbs + n.carbs,
                fat: acc.fat + n.fat,
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        const todayHydration = await HydrationLog.findOne({ userId: req.userId, date: { $gte: startOfDay } });

        res.json({
            todayTotals,
            targets: {
                calories: calorieTarget,
                protein: macroTargets.protein || Math.round(calorieTarget * 0.30 / 4),
                carbs: macroTargets.carbs || Math.round(calorieTarget * 0.40 / 4),
                fat: macroTargets.fats || Math.round(calorieTarget * 0.30 / 9),
            },
            hydrationToday: todayHydration?.glasses || 0,
            hydrationGoal: user.hydrationGoal || 8,
            streak: user.streaks?.currentStreak || 0,
            weightHistory: (user.weightHistory || []).slice(-7),
            recentAchievements: (user.achievements || []).slice(-3),
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
});

// Get weekly/n-day analytics — matches Analytics.jsx expectations
router.get('/weekly', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const days = Math.min(Number(req.query.days) || 7, 90);
        const profile = user.profile || {};
        const calorieTarget = profile.calorieTarget || 2000;

        const since = new Date();
        since.setDate(since.getDate() - days);

        const logs = await MealLog.find({ userId: req.userId, date: { $gte: since } }).sort({ date: 1 });
        const hydrationLogs = await HydrationLog.find({ userId: req.userId, date: { $gte: since } });

        // Group by date
        const byDate = {};
        logs.forEach(log => {
            const key = log.date.toISOString().split('T')[0];
            if (!byDate[key]) byDate[key] = { date: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
            const n = normLog(log);
            byDate[key].calories += n.calories;
            byDate[key].protein += n.protein;
            byDate[key].carbs += n.carbs;
            byDate[key].fat += n.fat;
        });

        // Fill in all days in range (even empty ones)
        const daily = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            daily.push(byDate[key] || { date: key, calories: 0, protein: 0, carbs: 0, fat: 0 });
        }

        const loggedDays = daily.filter(d => d.calories > 0).length;
        const adherenceDays = daily.filter(d => {
            const diff = Math.abs(d.calories - calorieTarget);
            return d.calories > 0 && diff <= calorieTarget * 0.15;
        }).length;

        const avgHydration = hydrationLogs.length
            ? hydrationLogs.reduce((s, l) => s + (l.glasses || 0), 0) / hydrationLogs.length
            : 0;

        res.json({
            daily,
            adherencePercent: loggedDays > 0 ? Math.round((adherenceDays / loggedDays) * 100) : 0,
            avgHydration: Math.round(avgHydration * 10) / 10,
            loggedDays,
            totalDays: days,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Error fetching analytics' });
    }
});

export default router;
