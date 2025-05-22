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
exports.deleteQuestion = exports.updateQuestion = exports.getQuestionById = exports.getQuestions = exports.createQuestion = void 0;
const Question_1 = __importDefault(require("../models/Question"));
const mongoose_1 = __importDefault(require("mongoose"));
// Function to shuffle an array (Fisher-Yates)
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}
const createQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text, options, correctAnswer, type, category } = req.body;
    // Validate required fields
    if (!text || !options || !correctAnswer || !type || !category) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // Validate options format
    if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'Options must be an array with at least 2 items' });
    }
    // Validate type field
    if (type !== 'radio' && type !== 'checkbox') {
        return res.status(400).json({ message: 'Type must be either "radio" or "checkbox"' });
    }
    // For radio type, correctAnswer should be a single option
    if (type === 'radio') {
        if (Array.isArray(correctAnswer)) {
            return res.status(400).json({ message: 'Radio type must have a single string as correct answer' });
        }
        if (!options.includes(correctAnswer)) {
            return res.status(400).json({ message: 'Correct answer must be one of the options' });
        }
    }
    // For checkbox type, correctAnswer should be an array of options
    else if (type === 'checkbox') {
        if (!Array.isArray(correctAnswer)) {
            return res.status(400).json({ message: 'Checkbox type must have an array of correct answers' });
        }
        if (correctAnswer.length === 0) {
            return res.status(400).json({ message: 'Checkbox type must have at least one correct answer' });
        }
        const allAnswersValid = correctAnswer.every(answer => options.includes(answer));
        if (!allAnswersValid) {
            return res.status(400).json({ message: 'All correct answers must be in the options list' });
        }
    }
    try {
        const question = new Question_1.default(req.body);
        yield question.save();
        res.status(201).json(question);
    }
    catch (error) {
        console.error('Failed to create question:', error);
        res.status(400).json({ message: 'Failed to create question', error: error.message });
    }
});
exports.createQuestion = createQuestion;
const getQuestions = (req, res, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let questions;
        if (limit) {
            // Get random questions based on the limit
            questions = yield Question_1.default.aggregate([
                { $sample: { size: limit } }
            ]);
        }
        else {
            // Get all questions
            questions = yield Question_1.default.find();
        }
        const shuffledQuestions = shuffleArray(questions);
        if (req && res) { //check if it is called as an API
            res.status(200).json({
                message: "Questions fetched successfully",
                totalQuestions: questions.length,
                questions: shuffledQuestions
            });
        }
        else {
            return shuffledQuestions;
        }
    }
    catch (error) {
        console.error('Failed to retrieve questions:', error);
        if (req && res && error instanceof mongoose_1.default.Error.CastError) { // Check if it is an API call
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        if (req && res) {
            res.status(500).json({ message: 'Failed to retrieve questions', error: error.message });
        }
        else {
            throw error;
        }
    }
});
exports.getQuestions = getQuestions;
const getQuestionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const question = yield Question_1.default.findById(questionId);
        if (!question) {
            return res.status(404).json({
                message: 'Question not found'
            });
        }
        res.status(200).json({
            message: "Question fetched successfully",
            question: question
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve question', error: error.message });
    }
});
exports.getQuestionById = getQuestionById;
const updateQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text, options, correctAnswer, category } = req.body;
    if (text !== undefined && !text) {
        return res.status(400).json({ message: 'Text cannot be empty' });
    }
    if (options !== undefined && (!Array.isArray(options) || options.length < 2)) {
        return res.status(400).json({ message: 'Options must be an array with at least 2 items' });
    }
    if (correctAnswer !== undefined && options !== undefined && !options.includes(correctAnswer)) {
        return res.status(400).json({ message: 'Correct answer must be one of the options' });
    }
    try {
        const questionId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const question = yield Question_1.default.findByIdAndUpdate(questionId, req.body, { new: true });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        res.status(400).json({ message: error.message });
    }
});
exports.updateQuestion = updateQuestion;
const deleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const question = yield Question_1.default.findByIdAndDelete(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.deleteQuestion = deleteQuestion;
