import mongoose, { Schema, Document, Types } from 'mongoose';

interface IResult extends Document {
    applicantId: Types.ObjectId;
    questions: {
        questionId: Types.ObjectId;
        selectedAnswer: string | string[];
        isCorrect: boolean;
    }[];
    score: number;
    totalQuestions: number;
    timestamp: Date;
    timeTaken: number; // Time taken in minutes
}

const resultSchema: Schema = new Schema({
    applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
    questions: [{
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedAnswer: { type: Schema.Types.Mixed, required: true },
        isCorrect: { type: Boolean, required: true },
    }],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    timeTaken: { type: Number, required: true }, // Time taken in minutes
});

export default mongoose.model<IResult>('Result', resultSchema);