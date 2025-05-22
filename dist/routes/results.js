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
const express_1 = __importDefault(require("express"));
const Result_1 = __importDefault(require("../models/Result"));
const Question_1 = __importDefault(require("../models/Question"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicantId, answers } = req.body;
    try {
        let score = 0;
        const questionsResults = [];
        for (const answer of answers) {
            const question = yield Question_1.default.findById(answer.questionId);
            if (question) {
                const isCorrect = question.correctAnswer === answer.selectedAnswer;
                if (isCorrect) {
                    score++;
                }
                questionsResults.push({
                    questionId: answer.questionId,
                    selectedAnswer: answer.selectedAnswer,
                    isCorrect: isCorrect,
                });
            }
        }
        const result = new Result_1.default({
            applicantId: applicantId,
            questions: questionsResults,
            score: score,
        });
        const newResult = yield result.save();
        res.status(201).json(newResult);
    }
    catch (error) {
        res.status(400).json({ message: 'Error saving result' });
    }
}));
// Protected routes for admin access
router.get('/:applicantId', [authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Result_1.default.findOne({ applicantId: req.params.applicantId });
        if (result) {
            res.json(result);
        }
        else {
            res.status(404).json({ message: 'Result not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving result' });
    }
}));
exports.default = router;
