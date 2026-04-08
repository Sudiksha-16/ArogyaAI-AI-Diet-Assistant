import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Calculate calorie and macro targets based on user profile
function calculateTargets(profile) {
    const { age, gender, height, weight, activityLevel, goal } = profile;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 78; // Average
    }

    // Activity multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extremely_active: 1.9
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

    // Adjust calories based on goal
    let calorieTarget;
    if (goal === 'lose_weight') {
        calorieTarget = Math.round(tdee - 500); // 500 calorie deficit
    } else if (goal === 'gain_weight' || goal === 'build_muscle') {
        calorieTarget = Math.round(tdee + 300); // 300 calorie surplus
    } else {
        calorieTarget = Math.round(tdee);
    }

    // Calculate macro targets (protein: 30%, carbs: 40%, fats: 30%)
    const macroTargets = {
        protein: Math.round((calorieTarget * 0.30) / 4), // 4 cal per gram
        carbs: Math.round((calorieTarget * 0.40) / 4),
        fats: Math.round((calorieTarget * 0.30) / 9) // 9 cal per gram
    };

    return { calorieTarget, macroTargets };
}

// Complete onboarding and save profile
router.post('/onboarding', authMiddleware, async (req, res) => {
    try {
        const { age, gender, height, weight, targetWeight, activityLevel, goal, dietaryRestrictions, allergies, healthConditions } = req.body;
        // Convert to proper numbers
const parsedAge = Number(age);
const parsedHeight = Number(height);
const parsedWeight = Number(weight);
const parsedTargetWeight = Number(targetWeight);

        // Calculate targets
        let { calorieTarget, macroTargets } = calculateTargets({
    age: parsedAge,
    gender,
    height: parsedHeight,
    weight: parsedWeight,
    activityLevel,
    goal
});

// 🔥 Safety fallback to prevent 5–8 kcal bug
if (!calorieTarget || calorieTarget < 1200) {
    calorieTarget = 2200;
}

        // Update user profile
        const user = await User.findById(req.userId);
        user.profile = {
            age: parsedAge,
            gender,
            height: parsedHeight,
            weight: parsedWeight,
            targetWeight: parsedTargetWeight,
            activityLevel,
            goal,
            dietaryRestrictions: dietaryRestrictions || [],
            allergies: allergies || [],
            healthConditions: healthConditions || [],
            calorieTarget,
            macroTargets
        };
        user.onboardingCompleted = true;
        user.weightHistory.push({ weight, date: new Date() });

        await user.save();

        res.json({
            message: 'Profile saved successfully',
            profile: user.profile
        });
    } catch (error) {
        console.error('Onboarding error:', error);
        res.status(500).json({ error: 'Server error during onboarding' });
    }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// Update weight
router.post('/weight', authMiddleware, async (req, res) => {
    try {
        const { weight } = req.body;
        const user = await User.findById(req.userId);

        user.profile.weight = weight;
        user.weightHistory.push({ weight, date: new Date() });

        await user.save();

        res.json({
            message: 'Weight updated successfully',
            weightHistory: user.weightHistory.slice(-30) // Last 30 entries
        });
    } catch (error) {
        console.error('Weight update error:', error);
        res.status(500).json({ error: 'Server error updating weight' });
    }
});

// Get weight history
router.get('/weight-history', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user.weightHistory.slice(-30)); // Last 30 entries
    } catch (error) {
        console.error('Weight history error:', error);
        res.status(500).json({ error: 'Server error fetching weight history' });
    }
});

export default router;
