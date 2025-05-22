"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', authController_1.loginPage);
router.get('/login', authController_1.loginPage);
router.get('/form', authMiddleware_1.authMiddleware, authController_1.formPage);
router.get('/quiz', authMiddleware_1.authMiddleware, authMiddleware_1.formSubmissionMiddleware, authController_1.quizPage);
router.get('/score', authMiddleware_1.authMiddleware, authMiddleware_1.formSubmissionMiddleware, authController_1.scorePage);
exports.default = router;
