import express, { Request, Response, RequestHandler } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import {
    adminDashboard,
    applicantsPage,
    getApplicantDetails,
    deleteApplicant,
    resultsPage,
    getResultDetails,
    deleteResult,
    usersPage,
    getUserDetails,
    departmentsPage,
    questionsPage,
    resultDetailsPage,
    quizSettingsPage,
    updateQuizSettings
} from '../controllers/adminController';
import {
    createQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} from '../controllers/questionController';

const router = express.Router();

// Apply both auth and admin middleware to all admin routes
router.use([authMiddleware, adminMiddleware] as RequestHandler[]);

// Dashboard
router.get('/dashboard', adminDashboard as RequestHandler);

// Applicants Management
router.get('/applicants', applicantsPage as RequestHandler);
router.get('/applicants/:id', getApplicantDetails as RequestHandler);
router.delete('/applicants/:id', deleteApplicant as RequestHandler);

// Results Management
router.get('/results', resultsPage as RequestHandler);
router.get('/results/:id', resultDetailsPage as RequestHandler);
router.delete('/results/:id', deleteResult as RequestHandler);

// Users Management
router.get('/users', usersPage as RequestHandler);
router.get('/users/:id', getUserDetails as RequestHandler);

// Departments Management
router.get('/departments', departmentsPage as RequestHandler);

// Questions Management
router.get('/questions', questionsPage as RequestHandler);
router.post('/questions', createQuestion as RequestHandler);
router.get('/questions/:id', getQuestionById as RequestHandler);
router.put('/questions/:id', updateQuestion as RequestHandler);
router.delete('/questions/:id', deleteQuestion as RequestHandler);

// Quiz Settings Management
router.get('/quiz-settings', quizSettingsPage as RequestHandler);
router.post('/quiz-settings', updateQuizSettings as RequestHandler);

export default router; 