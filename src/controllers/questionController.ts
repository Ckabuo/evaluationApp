import { Request, Response } from "express";
import Question, { IQuestion } from "../models/Question";
import mongoose from "mongoose";
import QuizSettings from "../models/QuizSettings";

// Function to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

export const createQuestion = async (req: Request, res: Response) => {
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
        const question = new Question(req.body);
        await question.save();
        res.status(201).json(question);
    } catch (error: any) {
        console.error('Failed to create question:', error);
        res.status(400).json({ message: 'Failed to create question', error: error.message });
    }
}

export const getQuestions = async (req?: Request, res?: Response, limit?: number) => {
    try {
        let questions: IQuestion[];
        
        if (limit) {
            // Get random questions based on the limit
            questions = await Question.aggregate([
                { $sample: { size: limit } }
            ]);
        } else {
            // Get all questions
            questions = await Question.find();
        }

        const shuffledQuestions = shuffleArray(questions);
        
        if (req && res) {  //check if it is called as an API
            res.status(200).json({
                message: "Questions fetched successfully",
                totalQuestions: questions.length,
                questions: shuffledQuestions
            });
        } else {
            return shuffledQuestions;
        }

    } catch (error: any) {
        console.error('Failed to retrieve questions:', error);
        if (req && res && error instanceof mongoose.Error.CastError) { // Check if it is an API call
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        if (req && res) {
            res.status(500).json({ message: 'Failed to retrieve questions', error: error.message });
        } else {
            throw error;
        }
    }
};

export const getQuestionById = async (req: Request, res: Response) => {
    try {
        const questionId = new mongoose.Types.ObjectId(req.params.id);

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                message: 'Question not found'
            });
        }
        res.status(200).json({
            message: "Question fetched successfully",
            question: question
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve question', error: error.message});
    }
}

export const updateQuestion = async (req: Request, res: Response) => {
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
        const questionId = new mongoose.Types.ObjectId(req.params.id);

        const question = await Question.findByIdAndUpdate(questionId, req.body, { new: true });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    } catch (error: any) {
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        res.status(400).json({ message: error.message });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const questionId = new mongoose.Types.ObjectId(req.params.id);

        const question = await Question.findByIdAndDelete(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(204).send();
    } catch (error: any) {
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        res.status(500).json({ message: error.message });
    }
}