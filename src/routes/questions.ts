import express, {NextFunction, Request, Response} from 'express';
import { createQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion } from '../controllers/questionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    createQuestion(req, res).catch(next);
})

router.get('/', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    getQuestions(req, res).catch(next);
})

router.get('/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    getQuestionById(req, res).catch(next)
})

router.put('/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    updateQuestion(req, res).catch(next)
})

router.delete('/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    deleteQuestion(req, res).catch(next)
})

export default router;