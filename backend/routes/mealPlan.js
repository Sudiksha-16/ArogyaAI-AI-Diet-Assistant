import express from 'express';
import OpenAI from 'openai';
import PDFDocument from 'pdfkit';
import MealPlan from '../models/MealPlan.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ================================
   GENERATE MEAL PLAN
================================ */

router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { days = 1, preferences = '' } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const profile = user.profile || {};
        const calorieTarget = profile.calorieTarget || 2000;
        const protein = profile.macroTargets?.protein || Math.round(calorieTarget * 0.30 / 4);
        const carbs = profile.macroTargets?.carbs || Math.round(calorieTarget * 0.40 / 4);
        const fats = profile.macroTargets?.fats || Math.round(calorieTarget * 0.30 / 9);
        const goal = profile.goal || 'maintain a healthy diet';
        const restrictions = (profile.dietaryRestrictions || []).join(', ') || 'None';
        const allergies = (profile.allergies || []).join(', ') || 'None';

        const numDays = Math.min(Number(days) || 1, 14);
        const extraPrefs = preferences ? `\nAdditional preferences: ${preferences}` : '';

        const prompt = `Create a ${numDays}-day meal plan for someone with:


Return ONLY valid JSON array with ${numDays} objects in this structure:
{
  "Breakfast": {"name": "...", "calories": 450, "protein": 25, "carbs": 55, "fat": 12, "description": "..."},
  "Lunch": {"name": "...", "calories": 600, "protein": 35, "carbs": 70, "fat": 18, "description": "..."},
  "Dinner": {"name": "...", "calories": 700, "protein": 40, "carbs": 75, "fat": 22, "description": "..."},
  "Snack": {"name": "...", "calories": 250, "protein": 10, "carbs": 30, "fat": 8, "description": "..."}
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 1,
            frequency_penalty: 0.8,
    presence_penalty: 0.6,
            max_tokens: numDays * 600,
        });

        const raw = completion.choices[0].message.content.trim();
        const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

        let mealPlan;
        try {
            mealPlan = JSON.parse(jsonStr);
        } catch {
            mealPlan = JSON.parse(`[${jsonStr}]`);
        }

        if (!Array.isArray(mealPlan)) mealPlan = [mealPlan];

        res.json({ mealPlan, days: mealPlan.length });

    } catch (error) {
        console.error('Meal plan generation error:', error.message);
        res.status(500).json({ error: 'Error generating meal plan' });
    }
});

/* ================================
   SAVE MEAL PLAN
================================ */

router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { mealPlan } = req.body;

        await MealPlan.deleteMany({ userId: req.userId });

        const plan = new MealPlan({
            userId: req.userId,
            meals: mealPlan,
            createdAt: new Date(),
        });

        await plan.save();

        res.json({ message: 'Meal plan saved successfully', plan });

    } catch (error) {
        console.error('Save meal plan error:', error);
        res.status(500).json({ error: 'Error saving meal plan' });
    }
});

/* ================================
   GET CURRENT PLAN
================================ */

router.get('/current', authMiddleware, async (req, res) => {
    try {
        const plan = await MealPlan.findOne({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ mealPlan: plan?.meals || null });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching meal plan' });
    }
});

/* ================================
   GROCERY LIST → REAL PDF
================================ */

router.get('/grocery-list', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const plan = await MealPlan.findOne({ userId: req.userId }).sort({ createdAt: -1 });

        if (!plan) {
            return res.status(404).json({ error: 'No meal plan found. Save one first.' });
        }

        let mealNames = [];
        const meals = plan.meals;

        if (Array.isArray(meals)) {
            meals.forEach(day => {
                Object.values(day).forEach(m => {
                    if (m?.name) mealNames.push(m.name);
                });
            });
        }

        if (mealNames.length === 0) {
            return res.status(400).json({ error: 'No meals found in saved plan.' });
        }

        const prompt = `Based on these meals: ${mealNames.join(', ')},
Generate a grocery list grouped by category 
(Produce, Protein, Dairy, Grains, Other).
Return plain text list.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 400,
        });

        const groceryText = completion.choices[0].message.content;

        // ✅ CREATE REAL PDF
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=grocery-list.pdf');

        doc.pipe(res);

        // Title
        doc
            .fontSize(20)
            .text('🛒 Grocery List', { align: 'center' });

        doc.moveDown();

        doc
            .fontSize(12)
            .text(`Generated for: ${user.email}`)
            .text(`Date: ${new Date().toLocaleDateString()}`);

        doc.moveDown(2);

        doc
            .fontSize(12)
            .text(groceryText, { lineGap: 4 });

        doc.end();

    } catch (error) {
        console.error('Grocery list PDF error:', error);
        res.status(500).json({ error: 'Error generating grocery list PDF' });
    }
});

export default router;