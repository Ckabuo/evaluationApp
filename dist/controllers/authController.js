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
exports.scorePage = exports.quizPage = exports.formPage = exports.loginPage = exports.logoutUser = exports.refreshToken = exports.isLoggedIn = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const questionController_1 = require("./questionController");
const Applicant_1 = __importDefault(require("../models/Applicant"));
const Result_1 = __importDefault(require("../models/Result"));
const QuizSettings_1 = __importDefault(require("../models/QuizSettings"));
const Department_1 = __importDefault(require("../models/Department"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, status } = req.body;
    // Validate all input fields
    if (!username || !email || !password) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: 'Please enter a valid email address'
        });
    }
    // Check if email exist
    const existingEmail = yield User_1.default.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({
            message: 'Email already exists'
        });
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const user = new User_1.default({
            username,
            email,
            password: hashedPassword,
            status
        });
        yield user.save();
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user._id });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user._id });
        // Set cookies with improved security settings
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });
        res.status(200).json({
            message: 'User registration successful',
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        if (error.code === 11000) { // This is Duplicate key error code
            return res.status(400).json({
                status: false,
                message: 'Username already exists',
                error: error.message
            });
        }
        else {
            console.error(error);
            res.status(500).json({
                status: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please fill in all fields.' });
        }
        let user = yield User_1.default.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user._id });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user._id });
        // Set cookies with improved security settings
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });
        res.json({
            message: 'login successful',
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                username: user.username,
                email: user.email,
                status: user.status
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});
exports.loginUser = loginUser;
const isLoggedIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    if (token) {
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            if (decoded && decoded.userId) {
                const user = yield User_1.default.findById(decoded.userId);
                if (user) {
                    const role = user.status === 1 ? 'admin' : 'user';
                    return res.status(200).json({
                        loggedIn: true,
                        user: {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            status: user.status,
                            role: role,
                        },
                    });
                }
                else {
                    return res.status(401).json({ loggedIn: false, message: 'User not found' });
                }
            }
            else {
                return res.status(401).json({ loggedIn: false, message: 'Invalid token' });
            }
        }
        catch (error) {
            return res.status(401).json({ loggedIn: false, message: error.message || 'Authentication failed' });
        }
    }
    else {
        return res.status(401).json({ loggedIn: false, message: 'No token provided' });
    }
});
exports.isLoggedIn = isLoggedIn;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        console.log('Refresh token from cookie:', refreshToken ? 'Present' : 'Not present');
        if (!refreshToken) {
            console.log('No refresh token found in cookies');
            return res.status(401).json({
                message: 'No refresh token provided',
            });
        }
        try {
            const refresh = (0, jwt_1.verifyToken)(refreshToken, true);
            console.log('Refresh token verified successfully');
            if (refresh && refresh.userId) {
                const accessToken = (0, jwt_1.generateAccessToken)({ userId: refresh.userId });
                console.log('New access token generated');
                // Set the new access token as a cookie with proper settings
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 1000, // 1 hour
                    path: '/'
                });
                return res.status(200).json({
                    message: 'Token refreshed successfully',
                    accessToken: accessToken,
                });
            }
            else {
                console.log('Invalid refresh token payload');
                return res.status(401).json({
                    message: 'Invalid refresh token payload'
                });
            }
        }
        catch (error) {
            console.log('Error verifying refresh token:', error);
            return res.status(401).json({
                message: 'Invalid refresh token',
                error: error.message
            });
        }
    }
    catch (error) {
        console.error('Token refresh failed:', error);
        res.status(500).json({
            message: 'Token refresh failed',
            error: error.message
        });
    }
});
exports.refreshToken = refreshToken;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Could not log out. Please try again.' });
            }
            res.clearCookie('connect.sid');
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(200).json({
                message: 'User logged out successfully',
            });
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Logout failed', error: error.message });
    }
});
exports.logoutUser = logoutUser;
/* view page Logics */
const loginPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
        if (token) {
            try {
                const decoded = (0, jwt_1.verifyToken)(token);
                const user = yield User_1.default.findById(decoded.userId);
                if (user) {
                    // Check if user is admin
                    if (user.status === 1) {
                        return res.redirect('/admin/dashboard');
                    }
                    // For interns, check if they have started the quiz
                    const applicant = yield Applicant_1.default.findOne({ email: user.email });
                    if (applicant) {
                        // Check if they have any results
                        const result = yield Result_1.default.findOne({ applicantId: applicant._id });
                        if (result) {
                            // If they have completed the quiz, redirect to form
                            return res.redirect('/form');
                        }
                        else {
                            // If they have started but not completed, redirect to quiz
                            return res.redirect('/quiz');
                        }
                    }
                    // Default redirect for interns
                    return res.redirect('/form');
                }
            }
            catch (error) {
                // If token is invalid, clear cookies and show login page
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
            }
        }
        // If no token or invalid token, show login page
        res.render('login');
    }
    catch (error) {
        res.render('login', { authError: 'An unexpected error occurred.' });
    }
});
exports.loginPage = loginPage;
const formPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = (yield QuizSettings_1.default.findOne()) || { timeLimit: 30, questionCount: 10 }; // Default values if no settings found
        const departments = yield Department_1.default.find().sort({ name: 1 });
        res.render('form', { settings, departments });
    }
    catch (error) {
        res.render('form', {
            error: error.message,
            settings: { timeLimit: 30, questionCount: 10 },
            departments: []
        });
    }
});
exports.formPage = formPage;
const quizPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = (yield QuizSettings_1.default.findOne()) || { timeLimit: 30, questionCount: 10 }; // Default values if no settings found
        const questionsData = yield (0, questionController_1.getQuestions)(undefined, undefined, settings.questionCount);
        res.render('quiz', {
            questions: questionsData,
            timeLimit: settings.timeLimit
        });
    }
    catch (error) {
        console.error("Error in quizPage:", error);
        res.render('quiz', {
            error: error.message,
            questions: [],
            timeLimit: 30 // Default time limit in case of error
        });
    }
});
exports.quizPage = quizPage;
const scorePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const score = req.session.score;
        res.render('score', { score });
    }
    catch (error) {
        res.render('score', { error: error.message });
    }
});
exports.scorePage = scorePage;
