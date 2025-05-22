"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const applicantController_1 = require("../controllers/applicantController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public route for applicant registration
router.post('/', (req, res, next) => {
    (0, applicantController_1.registerApplicant)(req, res).catch(next);
});
// Protected routes for admin access
router.get('/', [authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware], (req, res, next) => {
    (0, applicantController_1.getApplicants)(req, res).catch(next);
});
router.get('/:id', [authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware], (req, res, next) => {
    (0, applicantController_1.getApplicantById)(req, res).catch(next);
});
exports.default = router;
