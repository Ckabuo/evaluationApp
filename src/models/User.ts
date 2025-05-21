import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    comparePassword(password: string): Promise<boolean>;
    status: number;
    createdAt: Date;
}

const userSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    status:{ type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', userSchema);