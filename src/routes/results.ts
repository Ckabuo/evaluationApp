import express, { Request, Response, RequestHandler } from 'express';
import Result from '../models/Result';
import Question from '../models/Question';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const { applicantId, answers } = req.body;
    try {
        let score = 0;
        const questionsResults = [];

        for (const answer of answers) {
            const question = await Question.findById(answer.questionId);
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
        const result = new Result({
            applicantId: applicantId,
            questions: questionsResults,
            score: score,
        });

        const newResult = await result.save();
        res.status(201).json(newResult);
    } catch (error) {
        res.status(400).json({ message: 'Error saving result' });
    }
});

// Protected routes for admin access
router.get('/:applicantId', [authMiddleware, adminMiddleware] as RequestHandler[], async (req: Request, res: Response) => {
    try {
        const result = await Result.findOne({ applicantId: req.params.applicantId });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: 'Result not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving result' });
    }
});

export default router;