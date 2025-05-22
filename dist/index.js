"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const questions_1 = __importDefault(require("./routes/questions"));
const users_1 = __importDefault(require("./routes/users"));
const results_1 = __importDefault(require("./routes/results"));
const applicants_1 = __importDefault(require("./routes/applicants"));
const views_1 = __importDefault(require("./routes/views"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const admin_1 = __importDefault(require("./routes/admin"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const department_1 = __importDefault(require("./routes/department"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://evaluation-app.onrender.com'
        : 'http://localhost:3000',
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use('/questions', questions_1.default);
app.use('/users', users_1.default);
app.use('/results', results_1.default);
app.use('/applicants', applicants_1.default);
app.use('/quiz', quiz_1.default);
app.use('/admin', admin_1.default);
app.use('/admin/departments', department_1.default);
app.set('view engine', 'ejs');
app.use(express_1.default.static('public'));
app.use('/', views_1.default);
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/evaluationApp';
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
app.get('/', (req, res) => {
    res.send('Evaluation App Backend is running');
});
