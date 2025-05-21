import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Question from '../models/Question';
import Result from '../models/Result';
import QuizSettings from '../models/QuizSettings';

export const submitQuiz = async (req: Request, res: Response) => {
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

        const applicantObjectId = new mongoose.Types.ObjectId(applicantId);
        let score: number = 0;
        const processedQuestions: { questionId: mongoose.Types.ObjectId; selectedAnswer: string | string[]; isCorrect: boolean }[] = [];

        for (const answer of answers) {
            if (!answer || !answer.questionId || answer.selectedAnswer === undefined) {
                console.error('Invalid answer format:', answer);
                return res.status(400).json({ message: 'Invalid answer format' });
            }

            const questionObjectId = new mongoose.Types.ObjectId(answer.questionId);
            const question = await Question.findById(questionObjectId);

            if (!question) {
                console.error('Question not found:', answer.questionId);
                return res.status(400).json({ message: `Question with ID ${answer.questionId} not found` });
            }

            let isCorrect: boolean;
            if (Array.isArray(answer.selectedAnswer)) {
                isCorrect =
                    answer.selectedAnswer.every((selected: string) => question.correctAnswer.includes(selected)) &&
                    question.correctAnswer.length === answer.selectedAnswer.length;
            } else {
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
        const settings = await QuizSettings.findOne() || { timeLimit: 30, questionCount: 10 };
        const totalQuestions = settings.questionCount;

        const result = new Result({
            applicantId: applicantObjectId,
            questions: processedQuestions,
            score: score,
            totalQuestions: totalQuestions,
            timeTaken: settings.timeLimit // Store the time limit as time taken
        });

        await result.save();
        req.session.score = score;

        // Save session explicitly
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ message: 'Failed to save session' });
            }
        res.status(200).json({
            message: 'Quiz submitted successfully',
            score
            });
        });

    } catch (error: any) {
        console.error('Quiz submission error:', error);
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Invalid ID provided' });
        }
        res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
    }
};

export const quizPage = async (req: Request, res: Response) => {
    try {
        // Get quiz settings
        const settings = await QuizSettings.findOne() || { timeLimit: 30, questionCount: 10 };

        // Get random questions based on the question count setting
        const questions = await Question.aggregate([
            { $sample: { size: settings.questionCount } }
        ]);

        res.render('quiz', {
            questions,
            timeLimit: settings.timeLimit,
            currentUser: req.user
        });
    } catch (error) {
        console.error('Quiz page error:', error);
        res.status(500).render('error', {
            message: 'Error loading quiz',
            error: { status: 500 }
        });
    }
};
