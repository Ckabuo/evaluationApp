"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const questionController_1 = require("../controllers/questionController");
const router = express_1.default.Router();
// Apply both auth and admin middleware to all admin routes
router.use([authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware]);
// Dashboard
router.get('/dashboard', adminController_1.adminDashboard);
// Applicants Management
router.get('/applicants', adminController_1.applicantsPage);
router.get('/applicants/:id', adminController_1.getApplicantDetails);
router.delete('/applicants/:id', adminController_1.deleteApplicant);
// Results Management
router.get('/results', adminController_1.resultsPage);
router.get('/results/:id', adminController_1.resultDetailsPage);
router.delete('/results/:id', adminController_1.deleteResult);
// Users Management
router.get('/users', adminController_1.usersPage);
router.get('/users/:id', adminController_1.getUserDetails);
// Departments Management
router.get('/departments', adminController_1.departmentsPage);
// Questions Management
router.get('/questions', adminController_1.questionsPage);
router.post('/questions', questionController_1.createQuestion);
router.get('/questions/:id', questionController_1.getQuestionById);
router.put('/questions/:id', questionController_1.updateQuestion);
router.delete('/questions/:id', questionController_1.deleteQuestion);
// Quiz Settings Management
router.get('/quiz-settings', adminController_1.quizSettingsPage);
router.post('/quiz-settings', adminController_1.updateQuizSettings);
exports.default = router;
