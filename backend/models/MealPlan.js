import mongoose from 'mongoose';

// Flexible schema that supports both old structured format and new AI-generated array/object formats
const mealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // meals stored as Mixed to support: array of day objects, single day object, etc.
    meals: { type: mongoose.Schema.Types.Mixed },
    totalNutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number
    },
    groceryList: [String],
    createdAt: { type: Date, default: Date.now }
}, { strict: false }); // strict:false allows extra fields

mealPlanSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('MealPlan', mealPlanSchema);
