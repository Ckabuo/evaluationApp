import express, {NextFunction, Request, Response} from 'express';
import { submitQuiz } from '../controllers/quizController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/submit', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    submitQuiz(req, res).catch(next);
});

export default router;