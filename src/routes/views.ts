import express, { Request, Response } from 'express';
import { loginPage, formPage, quizPage, scorePage} from "../controllers/authController";
import { authMiddleware, formSubmissionMiddleware } from "../middlewares/authMiddleware";


const router = express.Router();

router.get('/', loginPage);
router.get('/login', loginPage);

router.get('/form', authMiddleware, formPage);

router.get('/quiz', authMiddleware, formSubmissionMiddleware, quizPage);

router.get('/score', authMiddleware, formSubmissionMiddleware, scorePage);

export default router;