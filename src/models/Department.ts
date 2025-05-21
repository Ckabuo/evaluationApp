import mongoose, { Schema, Document } from 'mongoose';

interface IDepartment extends Document {
    name: string;
    description: string;
    createdAt: Date;
}

const departmentSchema: Schema = new Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    description: { 
        type: String, 
        required: true,
        trim: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.model<IDepartment>('Department', departmentSchema); 