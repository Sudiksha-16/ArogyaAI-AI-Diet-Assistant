import mongoose from 'mongoose';

const mealLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    mealType: {
        type: String,
        // Accept both 'Breakfast' (frontend) and 'breakfast' (legacy)
        set: v => (v || '').toLowerCase(),
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    foodName: { type: String },
    name: { type: String },   // alias used by frontend
    // Top-level macros (flat format from frontend)
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: Number,
        carbs: Number,
        fat: Number,
        fats: Number,
        fiber: Number,
        sugar: Number,
        sodium: Number
    },
    servingSize: String,
    quantity: { type: Number, default: 1 },
    source: {
        type: String,
        enum: ['search', 'custom', 'barcode', 'image', 'meal_plan'],
        default: 'custom'
    },
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
mealLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model('MealLog', mealLogSchema);
