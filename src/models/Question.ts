import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
    text: string;
    type: 'checkbox' | 'radio';
    options: string[];
    correctAnswer: string | string[];
    category: string;
}

const questionSchema: Schema = new Schema({
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ['checkbox', 'radio'], default: 'checkbox' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IQuestion>('Question', questionSchema);