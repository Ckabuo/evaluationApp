"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionController_1 = require("../controllers/questionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.authMiddleware, (req, res, next) => {
    (0, questionController_1.createQuestion)(req, res).catch(next);
});
router.get('/', authMiddleware_1.authMiddleware, (req, res, next) => {
    (0, questionController_1.getQuestions)(req, res).catch(next);
});
router.get('/:id', authMiddleware_1.authMiddleware, (req, res, next) => {
    (0, questionController_1.getQuestionById)(req, res).catch(next);
});
router.put('/:id', authMiddleware_1.authMiddleware, (req, res, next) => {
    (0, questionController_1.updateQuestion)(req, res).catch(next);
});
router.delete('/:id', authMiddleware_1.authMiddleware, (req, res, next) => {
    (0, questionController_1.deleteQuestion)(req, res).catch(next);
});
exports.default = router;
