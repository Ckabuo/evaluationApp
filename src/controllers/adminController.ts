import { Request, Response } from 'express';
import User from '../models/User';
import Result from '../models/Result';
import Applicant from '../models/Applicant';
import Department from '../models/Department';
import Question from '../models/Question';
import QuizSettings from '../models/QuizSettings';
import mongoose from 'mongoose';

export const adminDashboard = async (req: Request, res: Response) => {
    try {
        const applicants = await Applicant.find().sort({ createdAt: -1 });
        const results = await Result.find().populate('applicantId');
        const users = await User.find({ status: 0 }).select('-password'); // Get all non-admin users

        res.render('admin/dashboard', {
            applicants,
            results,
            users,
            currentUser: req.user
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).render('admin/dashboard', { error: 'Error loading dashboard data' });
    }
};

// Applicants Management
export const applicantsPage = async (req: Request, res: Response) => {
    try {
        const applicants = await Applicant.find()
            .sort({ createdAt: -1 });
        
        const departments = await Department.find()
            .sort({ name: 1 });

        res.render('admin/applicants', {
            applicants,
            departments,
            currentUser: req.user,
            error: null
        });
    } catch (error) {
        console.error('Applicants page error:', error);
        res.status(500).render('admin/applicants', { 
            applicants: [],
            departments: [],
            currentUser: req.user,
            error: 'Error loading applicants data' 
        });
    }
};

// Users Management
export const usersPage = async (req: Request, res: Response) => {
    try {
        const users = await User.find({ status: 0 })
            .select('-password')
            .sort({ createdAt: -1 });

        res.render('admin/users', {
            users,
            currentUser: req.user
        });
    } catch (error) {
        console.error('Users page error:', error);
        res.status(500).render('admin/users', { error: 'Error loading users data' });
    }
};

// Results Management
export const resultsPage = async (req: Request, res: Response) => {
    try {
        const results = await Result.find()
            .populate('applicantId', 'name department email')  // Populate specific fields from Applicant
            .sort({ timestamp: -1 });

        res.render('admin/results', {
            results,
            currentUser: req.user,
            error: null
        });
    } catch (error) {
        console.error('Results page error:', error);
        res.status(500).render('admin/results', { 
            results: [],
            currentUser: req.user,
            error: 'Error loading results data' 
        });
    }
};

// Departments Management
export const departmentsPage = async (req: Request, res: Response) => {
    try {
        const departments = await Department.find()
            .sort({ name: 1 });

        res.render('admin/departments', {
            departments,
            currentUser: req.user,
            error: null
        });
    } catch (error) {
        console.error('Departments page error:', error);
        res.status(500).render('admin/departments', { 
            departments: [],
            currentUser: req.user,
            error: 'Error loading departments data' 
        });
    }
};

// Questions Management
export const questionsPage = async (req: Request, res: Response) => {
    try {
        const questions = await Question.find()
            .sort({ createdAt: -1 });

        res.render('admin/questions', {
            questions,
            currentUser: req.user,
            error: null
        });
    } catch (error) {
        console.error('Questions page error:', error);
        res.status(500).render('admin/questions', { 
            questions: [],
            currentUser: req.user,
            error: 'Error loading questions data' 
        });
    }
};

// Quiz Settings Management
export const quizSettingsPage = async (req: Request, res: Response) => {
    try {
        let settings = await QuizSettings.findOne();
        if (!settings) {
            settings = await QuizSettings.create({});
        }

        // Get total question count
        const totalQuestions = await Question.countDocuments();

        res.render('admin/quiz-settings', {
            settings,
            totalQuestions,
            currentUser: req.user,
            error: null
        });
    } catch (error) {
        console.error('Quiz settings page error:', error);
        res.status(500).render('admin/quiz-settings', {
            settings: null,
            totalQuestions: 0,
            currentUser: req.user,
            error: 'Error loading quiz settings'
        });
    }
};

export const updateQuizSettings = async (req: Request, res: Response) => {
    try {
        const { timeLimit, questionCount } = req.body;

        let settings = await QuizSettings.findOne();
        if (!settings) {
            settings = new QuizSettings({ timeLimit, questionCount });
        } else {
            settings.timeLimit = timeLimit;
            settings.questionCount = questionCount;
        }

        await settings.save();

        res.json({
            message: 'Quiz settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating quiz settings:', error);
        res.status(500).json({
            message: 'Error updating quiz settings',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// API endpoints
export const getApplicantDetails = async (req: Request, res: Response) => {
    try {
        const applicant = await Applicant.findById(req.params.id);
        if (!applicant) {
            return res.status(404).render('error', { 
                message: 'Applicant not found',
                error: { status: 404 }
            });
        }

        const result = await Result.findOne({ applicantId: applicant._id });
        
        res.render('admin/applicant-details', { 
            applicant,
            result,
            currentUser: req.user
        });
    } catch (error) {
        console.error('Error fetching applicant details:', error);
        res.status(500).render('error', { 
            message: 'Error fetching applicant details',
            error: { status: 500 }
        });
    }
};

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user details' });
    }
};

export const getResultDetails = async (req: Request, res: Response) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate('applicantId');
        
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving result details' });
    }
};

export const resultDetailsPage = async (req: Request, res: Response) => {
    try {
        const result = await Result.findById(req.params.id)
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
    } catch (error) {
        console.error('Error fetching result details:', error);
        res.status(500).render('error', {
            message: 'Error fetching result details',
            error: { status: 500 }
        });
    }
};

export const deleteApplicant = async (req: Request, res: Response) => {
    try {
        const applicantId = req.params.id;

        // First find the applicant to ensure it exists
        const applicant = await Applicant.findById(applicantId);
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        // Delete all results associated with this applicant
        await Result.deleteMany({ applicantId: applicant._id });

        // Now delete the applicant
        await Applicant.findByIdAndDelete(applicantId);

        res.json({ 
            message: 'Applicant and associated results deleted successfully',
            deletedApplicant: {
                id: applicant._id,
                name: applicant.name,
                email: applicant.email
            }
        });
    } catch (error) {
        console.error('Error deleting applicant:', error);
        res.status(500).json({ 
            message: 'Error deleting applicant',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const deleteResult = async (req: Request, res: Response) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.json({ message: 'Result deleted successfully' });
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ message: 'Error deleting result' });
    }
}; 