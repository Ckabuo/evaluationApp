"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quizController_1 = require("../controllers/quizController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/submit', authMiddleware_1.authMiddleware, (req, res, next) => {
    (0, quizController_1.submitQuiz)(req, res).catch(next);
});
exports.default = router;
