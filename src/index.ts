import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import questionsRoutes from './routes/questions';
import userRoutes from './routes/users';
import resultRoutes from './routes/results';
import applicantRoutes from './routes/applicants';
import viewRoutes from './routes/views';
import quizRoutes from './routes/quiz';
import adminRoutes from './routes/admin';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import departmentRoutes from './routes/department';
import morgan from 'morgan';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-render-domain.onrender.com' 
        : 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.use(morgan('dev'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: true,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use('/questions', questionsRoutes);
app.use('/users', userRoutes);
app.use('/results', resultRoutes);
app.use('/applicants', applicantRoutes);
app.use('/quiz', quizRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/departments', departmentRoutes);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/', viewRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/evaluationApp';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

app.get('/', (req: Request, res: Response) => {
    res.send('Evaluation App Backend is running');
});