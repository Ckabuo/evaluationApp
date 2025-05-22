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
import MongoStore from 'connect-mongo';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/evaluationApp';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://evaluation-app.onrender.com' 
        : 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.use(morgan('dev'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        collectionName: 'sessions', // Optional: name of the collection for sessions
        autoRemove: 'native', // Use MongoDB's TTL index
        touchAfter: 24 * 60 * 60 * 1000 // 24 hours in seconds
    }),
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