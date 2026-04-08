import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height: Number, // in cm
    weight: Number, // in kg
    targetWeight: Number,
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']
    },
    goal: {
      type: String,
      enum: ['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle']
    },
    dietaryRestrictions: [String], // vegetarian, vegan, keto, etc.
    allergies: [String],
    healthConditions: [String],
    calorieTarget: Number,
    macroTargets: {
      protein: Number, // in grams
      carbs: Number,
      fats: Number
    }
  },
  weightHistory: [{
    weight: Number,
    date: { type: Date, default: Date.now }
  }],
  hydrationGoal: { type: Number, default: 8 }, // glasses per day
  streaks: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLogDate: Date
  },
  achievements: [{
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now },
    icon: String
  }],
  favoriteMeals: [{
    name: String,
    recipe: Object,
    nutrition: Object,
    savedAt: { type: Date, default: Date.now }
  }],
  onboardingCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);
