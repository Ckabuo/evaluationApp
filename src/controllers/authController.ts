import { Request, Response } from 'express';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
import { getQuestions } from './questionController'
import Applicant from '../models/Applicant';
import Result from '../models/Result';
import QuizSettings from '../models/QuizSettings';
import Department from '../models/Department';

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password,status } = req.body;

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
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({
            message: 'Email already exists'
        });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            status
        });
        await user.save();

        const accessToken = generateAccessToken({userId: user._id});
        const refreshToken = generateRefreshToken({userId: user._id});

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
    } catch (error: any) {
        if (error.code === 11000) {// This is Duplicate key error code
            return res.status(400).json({
                status: false,
                message: 'Username already exists',
                error: error.message
            });
        } else {
            console.error(error);
            res.status(500).json({
                status: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({message: 'Please fill in all fields.'});
        }

        let user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const accessToken = generateAccessToken({ userId: user._id });
        const refreshToken = generateRefreshToken({ userId: user._id });

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

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

export const isLoggedIn = async (req: Request, res: Response) => {
    const token = req.cookies?.accessToken;

    if (token) {
        try {
            const decoded = verifyToken(token);

            if (decoded && decoded.userId) {
                const user = await User.findById(decoded.userId);

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
                } else {
                    return res.status(401).json({ loggedIn: false, message: 'User not found' });
                }
            } else {
                return res.status(401).json({ loggedIn: false, message: 'Invalid token' });
            }
        } catch (error: any) {
            return res.status(401).json({ loggedIn: false, message: error.message || 'Authentication failed' });
        }
    } else {
        return res.status(401).json({ loggedIn: false, message: 'No token provided' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        console.log('Refresh token from cookie:', refreshToken ? 'Present' : 'Not present');

        if (!refreshToken) {
            console.log('No refresh token found in cookies');
            return res.status(401).json({
                message: 'No refresh token provided',
            });
        }

        try {
        const refresh = verifyToken(refreshToken, true);
            console.log('Refresh token verified successfully');

        if (refresh && refresh.userId) {
            const accessToken = generateAccessToken({ userId: refresh.userId });
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
        } else {
                console.log('Invalid refresh token payload');
                return res.status(401).json({ 
                    message: 'Invalid refresh token payload' 
                });
            }
        } catch (error: any) {
            console.log('Error verifying refresh token:', error);
            return res.status(401).json({ 
                message: 'Invalid refresh token',
                error: error.message 
            });
        }
    } catch (error: any) {
        console.error('Token refresh failed:', error);
        res.status(500).json({ 
            message: 'Token refresh failed', 
            error: error.message 
        });
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        req.session.destroy((err: any) => {
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

    } catch (error: any) {
        return res.status(500).json({ message: 'Logout failed', error: error.message });
    }
};

/* view page Logics */
export const loginPage = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.accessToken;
        
        if (token) {
            try {
                const decoded = verifyToken(token);
                const user = await User.findById(decoded.userId);
                
                if (user) {
                    // Check if user is admin
                    if (user.status === 1) {
                        return res.redirect('/admin/dashboard');
                    }
                    
                    // For interns, check if they have started the quiz
                    const applicant = await Applicant.findOne({ email: user.email });
                    if (applicant) {
                        // Check if they have any results
                        const result = await Result.findOne({ applicantId: applicant._id });
                        if (result) {
                            // If they have completed the quiz, redirect to form
                            return res.redirect('/form');
                        } else {
                            // If they have started but not completed, redirect to quiz
                            return res.redirect('/quiz');
                        }
                    }
                    
                    // Default redirect for interns
                    return res.redirect('/form');
                }
            } catch (error) {
                // If token is invalid, clear cookies and show login page
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
            }
        }
        
        // If no token or invalid token, show login page
        res.render('login');
    } catch (error) {
        res.render('login', { authError: 'An unexpected error occurred.' });
    }
};

export const formPage = async (req: Request, res: Response) => {
    try {
        const settings = await QuizSettings.findOne() || { timeLimit: 30, questionCount: 10 }; // Default values if no settings found
        const departments = await Department.find().sort({ name: 1 });
        res.render('form', { settings, departments });
    } catch (error:any) {
        res.render('form', { 
            error: error.message, 
            settings: { timeLimit: 30, questionCount: 10 },
            departments: []
        });
    }
}

export const quizPage = async (req: Request, res: Response) => {
    try {
        const settings = await QuizSettings.findOne() || { timeLimit: 30, questionCount: 10 }; // Default values if no settings found
        const questionsData = await getQuestions(undefined, undefined, settings.questionCount);

        res.render('quiz', { 
            questions: questionsData,
            timeLimit: settings.timeLimit
        });
    } catch (error: any) {
        console.error("Error in quizPage:", error);
        res.render('quiz', { 
            error: error.message, 
            questions: [],
            timeLimit: 30 // Default time limit in case of error
        });
    }
};

export const scorePage = async (req: Request, res: Response) => {
    try {
        const score = req.session.score;
        res.render('score', { score });
    } catch (error: any) {
        res.render('score', { error: error.message });
    }
}


