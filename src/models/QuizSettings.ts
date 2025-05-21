import mongoose from 'mongoose';

const quizSettingsSchema = new mongoose.Schema({
    timeLimit: {
        type: Number,
        required: true,
        default: 30, // Default 30 minutes
        min: 1,
        max: 120
    },
    questionCount: {
        type: Number,
        required: true,
        default: 10, // Default 10 questions
        min: 1,
        max: 50
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one settings document exists
quizSettingsSchema.pre('save', async function(next) {
    const count = await mongoose.model('QuizSettings').countDocuments();
    if (count > 0 && this.isNew) {
        throw new Error('Only one quiz settings document can exist');
    }
    next();
});

const QuizSettings = mongoose.model('QuizSettings', quizSettingsSchema);

export default QuizSettings; 