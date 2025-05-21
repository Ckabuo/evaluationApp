import mongoose, { Schema, Document } from 'mongoose';

interface IApplicant extends Document {
    name: string;
    email: string;
    phoneNumber: string;
    department: string;
}

const applicantSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    department: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IApplicant>('Applicant', applicantSchema);