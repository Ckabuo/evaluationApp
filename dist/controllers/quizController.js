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
exports.quizPage = exports.submitQuiz = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Question_1 = __importDefault(require("../models/Question"));
const Result_1 = __importDefault(require("../models/Result"));
const QuizSettings_1 = __importDefault(require("../models/QuizSettings"));
const submitQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { answers } = req.body;
        const applicantId = req.session.applicantId;
        console.log('Session data:', {
            applicantId: req.session.applicantId,
            formSubmitted: req.session.formSubmitted
        });
        if (!applicantId) {
            console.error('No applicantId in session');
            return res.status(400).json({ message: 'Applicant ID not found in session' });
        }
        if (!Array.isArray(answers)) {
            console.error('Invalid answers format:', answers);
            return res.status(400).json({ message: 'Invalid request data: Answers must be an array' });
        }
        const applicantObjectId = new mongoose_1.default.Types.ObjectId(applicantId);
        let score = 0;
        const processedQuestions = [];
        for (const answer of answers) {
            if (!answer || !answer.questionId || answer.selectedAnswer === undefined) {
                console.error('Invalid answer format:', answer);
                return res.status(400).json({ message: 'Invalid answer format' });
            }
            const questionObjectId = new mongoose_1.default.Types.ObjectId(answer.questionId);
            const question = yield Question_1.default.findById(questionObjectId);
            if (!question) {
                console.error('Question not found:', answer.questionId);
                return res.status(400).json({ message: `Question with ID ${answer.questionId} not found` });
            }
            let isCorrect;
            if (Array.isArray(answer.selectedAnswer)) {
                isCorrect =
                    answer.selectedAnswer.every((selected) => question.correctAnswer.includes(selected)) &&
                        question.correctAnswer.length === answer.selectedAnswer.length;
            }
            else {
                isCorrect = answer.selectedAnswer === question.correctAnswer;
            }
            if (isCorrect) {
                score++;
            }
            processedQuestions.push({
                questionId: questionObjectId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: isCorrect,
            });
        }
        // Get quiz settings to determine total questions
        const settings = (yield QuizSettings_1.default.findOne()) || { timeLimit: 30, questionCount: 10 };
        const totalQuestions = settings.questionCount;
        const result = new Result_1.default({
            applicantId: applicantObjectId,
            questions: processedQuestions,
            score: score,
            totalQuestions: totalQuestions,
            timeTaken: settings.timeLimit // Store the time limit as time taken
        });
        yield result.save();
        req.session.score = score;
        // Save session explicitly
        req.session.save((error) => {
            if (error) {
                console.error('Error saving session:', error);
                return res.status(500).json({ message: 'Failed to save session' });
            }
            res.status(200).json({
                message: 'Quiz submitted successfully',
                score
            });
        });
    }
    catch (error) {
        console.error('Quiz submission error:', error);
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: 'Invalid ID provided' });
        }
        res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
    }
});
exports.submitQuiz = submitQuiz;
const quizPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get quiz settings
        const settings = (yield QuizSettings_1.default.findOne()) || { timeLimit: 30, questionCount: 10 };
        // Get random questions based on the question count setting
        const questions = yield Question_1.default.aggregate([
            { $sample: { size: settings.questionCount } }
        ]);
        res.render('quiz', {
            questions,
            timeLimit: settings.timeLimit,
            currentUser: req.user
        });
    }
    catch (error) {
        console.error('Quiz page error:', error);
        res.status(500).render('error', {
            message: 'Error loading quiz',
            error: { status: 500 }
        });
    }
});
exports.quizPage = quizPage;
