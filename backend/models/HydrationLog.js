import mongoose from 'mongoose';

const hydrationLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    glasses: {
        type: Number,
        default: 0
    },
    createdAt: { type: Date, default: Date.now }
});

hydrationLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model('HydrationLog', hydrationLogSchema);
