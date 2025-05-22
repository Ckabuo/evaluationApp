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
exports.deleteResult = exports.deleteApplicant = exports.resultDetailsPage = exports.getResultDetails = exports.getUserDetails = exports.getApplicantDetails = exports.updateQuizSettings = exports.quizSettingsPage = exports.questionsPage = exports.departmentsPage = exports.resultsPage = exports.usersPage = exports.applicantsPage = exports.adminDashboard = void 0;
const User_1 = __importDefault(require("../models/User"));
const Result_1 = __importDefault(require("../models/Result"));
const Applicant_1 = __importDefault(require("../models/Applicant"));
const Department_1 = __importDefault(require("../models/Department"));
const Question_1 = __importDefault(require("../models/Question"));
const QuizSettings_1 = __importDefault(require("../models/QuizSettings"));
const adminDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicants = yield Applicant_1.default.find().sort({ createdAt: -1 });
        const results = yield Result_1.default.find().populate('applicantId');
        const users = yield User_1.default.find({ status: 0 }).select('-password'); // Get all non-admin users
        res.render('admin/dashboard', {
            applicants,
            results,
            users,
            currentUser: req.user
        });
    }
    catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).render('admin/dashboard', { error: 'Error loading dashboard data' });
    }
});
exports.adminDashboard = adminDashboard;
// Applicants Management
const applicantsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicants = yield Applicant_1.default.find()
            .sort({ createdAt: -1 });
        const departments = yield Department_1.default.find()
            .sort({ name: 1 });
        res.render('admin/applicants', {
            applicants,
            departments,
            currentUser: req.user,
            error: null
        });
    }
    catch (error) {
        console.error('Applicants page error:', error);
        res.status(500).render('admin/applicants', {
            applicants: [],
            departments: [],
            currentUser: req.user,
            error: 'Error loading applicants data'
        });
    }
});
exports.applicantsPage = applicantsPage;
// Users Management
const usersPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({ status: 0 })
            .select('-password')
            .sort({ createdAt: -1 });
        res.render('admin/users', {
            users,
            currentUser: req.user
        });
    }
    catch (error) {
        console.error('Users page error:', error);
        res.status(500).render('admin/users', { error: 'Error loading users data' });
    }
});
exports.usersPage = usersPage;
// Results Management
const resultsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield Result_1.default.find()
            .populate('applicantId', 'name department email') // Populate specific fields from Applicant
            .sort({ timestamp: -1 });
        res.render('admin/results', {
            results,
            currentUser: req.user,
            error: null
        });
    }
    catch (error) {
        console.error('Results page error:', error);
        res.status(500).render('admin/results', {
            results: [],
            currentUser: req.user,
            error: 'Error loading results data'
        });
    }
});
exports.resultsPage = resultsPage;
// Departments Management
const departmentsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield Department_1.default.find()
            .sort({ name: 1 });
        res.render('admin/departments', {
            departments,
            currentUser: req.user,
            error: null
        });
    }
    catch (error) {
        console.error('Departments page error:', error);
        res.status(500).render('admin/departments', {
            departments: [],
            currentUser: req.user,
            error: 'Error loading departments data'
        });
    }
});
exports.departmentsPage = departmentsPage;
// Questions Management
const questionsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questions = yield Question_1.default.find()
            .sort({ createdAt: -1 });
        res.render('admin/questions', {
            questions,
            currentUser: req.user,
            error: null
        });
    }
    catch (error) {
        console.error('Questions page error:', error);
        res.status(500).render('admin/questions', {
            questions: [],
            currentUser: req.user,
            error: 'Error loading questions data'
        });
    }
});
exports.questionsPage = questionsPage;
// Quiz Settings Management
const quizSettingsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let settings = yield QuizSettings_1.default.findOne();
        if (!settings) {
            settings = yield QuizSettings_1.default.create({});
        }
        // Get total question count
        const totalQuestions = yield Question_1.default.countDocuments();
        res.render('admin/quiz-settings', {
            settings,
            totalQuestions,
            currentUser: req.user,
            error: null
        });
    }
    catch (error) {
        console.error('Quiz settings page error:', error);
        res.status(500).render('admin/quiz-settings', {
            settings: null,
            totalQuestions: 0,
            currentUser: req.user,
            error: 'Error loading quiz settings'
        });
    }
});
exports.quizSettingsPage = quizSettingsPage;
const updateQuizSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { timeLimit, questionCount } = req.body;
        let settings = yield QuizSettings_1.default.findOne();
        if (!settings) {
            settings = new QuizSettings_1.default({ timeLimit, questionCount });
        }
        else {
            settings.timeLimit = timeLimit;
            settings.questionCount = questionCount;
        }
        yield settings.save();
        res.json({
            message: 'Quiz settings updated successfully',
            settings
        });
    }
    catch (error) {
        console.error('Error updating quiz settings:', error);
        res.status(500).json({
            message: 'Error updating quiz settings',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.updateQuizSettings = updateQuizSettings;
// API endpoints
const getApplicantDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicant = yield Applicant_1.default.findById(req.params.id);
        if (!applicant) {
            return res.status(404).render('error', {
                message: 'Applicant not found',
                error: { status: 404 }
            });
        }
        const result = yield Result_1.default.findOne({ applicantId: applicant._id });
        res.render('admin/applicant-details', {
            applicant,
            result,
            currentUser: req.user
        });
    }
    catch (error) {
        console.error('Error fetching applicant details:', error);
        res.status(500).render('error', {
            message: 'Error fetching applicant details',
            error: { status: 500 }
        });
    }
});
exports.getApplicantDetails = getApplicantDetails;
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user details' });
    }
});
exports.getUserDetails = getUserDetails;
const getResultDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Result_1.default.findById(req.params.id)
            .populate('applicantId');
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving result details' });
    }
});
exports.getResultDetails = getResultDetails;
const resultDetailsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Result_1.default.findById(req.params.id)
            .populate({
            path: 'applicantId',
            select: 'name email department'
        })
            .populate('questions.questionId', 'text options correctAnswer');
        if (!result) {
            return res.status(404).render('error', {
                message: 'Result not found',
                error: { status: 404 }
            });
        }
        res.render('admin/result-details', {
            title: 'Result Details',
            result,
            currentUser: req.user
        });
    }
    catch (error) {
        console.error('Error fetching result details:', error);
        res.status(500).render('error', {
            message: 'Error fetching result details',
            error: { status: 500 }
        });
    }
});
exports.resultDetailsPage = resultDetailsPage;
const deleteApplicant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicantId = req.params.id;
        // First find the applicant to ensure it exists
        const applicant = yield Applicant_1.default.findById(applicantId);
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        // Delete all results associated with this applicant
        yield Result_1.default.deleteMany({ applicantId: applicant._id });
        // Now delete the applicant
        yield Applicant_1.default.findByIdAndDelete(applicantId);
        res.json({
            message: 'Applicant and associated results deleted successfully',
            deletedApplicant: {
                id: applicant._id,
                name: applicant.name,
                email: applicant.email
            }
        });
    }
    catch (error) {
        console.error('Error deleting applicant:', error);
        res.status(500).json({
            message: 'Error deleting applicant',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.deleteApplicant = deleteApplicant;
const deleteResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Result_1.default.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.json({ message: 'Result deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ message: 'Error deleting result' });
    }
});
exports.deleteResult = deleteResult;
