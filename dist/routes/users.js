"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post('/register', (req, res, next) => {
    (0, authController_1.registerUser)(req, res).catch(next);
});
router.post('/login', (req, res, next) => {
    (0, authController_1.loginUser)(req, res).catch(next);
});
router.get('/isLoggedIn', (req, res, next) => {
    (0, authController_1.isLoggedIn)(req, res).catch(next);
});
router.post('/token', (req, res, next) => {
    (0, authController_1.refreshToken)(req, res).catch(next);
});
router.delete('/logout', (req, res, next) => {
    (0, authController_1.logoutUser)(req, res).catch(next);
});
router.get('/session-data', (req, res) => {
    res.json({
        formSubmitted: req.session.formSubmitted,
        applicantId: req.session.applicantId,
    });
});
exports.default = router;
