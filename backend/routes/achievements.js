import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_log', name: 'First Steps', description: 'Log your first meal', icon: '🎯' },
    { id: 'week_streak', name: 'Week Warrior', description: 'Log meals for 7 days straight', icon: '🔥' },
    { id: 'month_streak', name: 'Monthly Master', description: 'Log meals for 30 days straight', icon: '👑' },
    { id: 'calorie_goal_10', name: 'Goal Getter', description: 'Meet your calorie goal 10 times', icon: '⭐' },
    { id: 'hydration_week', name: 'Hydration Hero', description: 'Meet hydration goal for 7 days', icon: '💧' },
    { id: 'weight_milestone', name: 'Progress Champion', description: 'Reach a weight milestone', icon: '🏆' }
];

// Check and unlock achievements
router.post('/check', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const newAchievements = [];

        // Check streak achievements
        if (user.streaks.currentStreak >= 7 && !hasAchievement(user, 'week_streak')) {
            const achievement = ACHIEVEMENTS.find(a => a.id === 'week_streak');
            user.achievements.push(achievement);
            newAchievements.push(achievement);
        }

        if (user.streaks.currentStreak >= 30 && !hasAchievement(user, 'month_streak')) {
            const achievement = ACHIEVEMENTS.find(a => a.id === 'month_streak');
            user.achievements.push(achievement);
            newAchievements.push(achievement);
        }

        await user.save();

        res.json({ newAchievements, allAchievements: user.achievements });
    } catch (error) {
        console.error('Achievement check error:', error);
        res.status(500).json({ error: 'Error checking achievements' });
    }
});

// Get all achievements
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json({
            unlocked: user.achievements,
            available: ACHIEVEMENTS
        });
    } catch (error) {
        console.error('Achievements fetch error:', error);
        res.status(500).json({ error: 'Error fetching achievements' });
    }
});

function hasAchievement(user, achievementId) {
    return user.achievements.some(a => a.name === ACHIEVEMENTS.find(ach => ach.id === achievementId)?.name);
}

export default router;
