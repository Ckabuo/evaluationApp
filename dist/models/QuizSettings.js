"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const quizSettingsSchema = new mongoose_1.default.Schema({
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
quizSettingsSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield mongoose_1.default.model('QuizSettings').countDocuments();
        if (count > 0 && this.isNew) {
            throw new Error('Only one quiz settings document can exist');
        }
        next();
    });
});
const QuizSettings = mongoose_1.default.model('QuizSettings', quizSettingsSchema);
exports.default = QuizSettings;
