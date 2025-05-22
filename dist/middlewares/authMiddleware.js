"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.formSubmissionMiddleware = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const axios_1 = __importDefault(require("axios"));
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Attempting to refresh token...');
        const url = `${req.protocol}://${req.get('host')}/users/token`;
        console.log('Refresh URL:', url);
        console.log('Refresh token from cookie:', req.cookies.refreshToken);
        const response = yield axios_1.default.post(url, {}, {
            headers: {
                Cookie: `refreshToken=${req.cookies.refreshToken}`
            },
            withCredentials: true
        });
        console.log('Refresh response:', response.status, response.statusText);
        console.log('Response data:', response.data);
        const data = response.data;
        if (data.accessToken) {
            console.log('New access token received, setting cookie...');
            res.cookie('accessToken', data.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000, // 1 hour
                path: '/'
            });
            console.log('New access token cookie set successfully');
            return true;
        }
        console.log('No access token in response data');
        return false;
    }
    catch (error) {
        console.error('Error refreshing token:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return false;
    }
});
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    let refreshToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken;
    console.log('Access token from cookie:', token ? 'Present' : 'Not present');
    console.log('Refresh token from cookie:', refreshToken ? 'Present' : 'Not present');
    // If no access token but we have refresh token, try to refresh
    if (!token && refreshToken) {
        console.log('No access token, attempting to refresh using refresh token');
        const refreshSuccess = yield refreshAccessToken(req, res);
        if (refreshSuccess) {
            console.log('New access token generated and set');
            next();
            return;
        }
        console.log('Failed to refresh token');
        return res.redirect('/');
    }
    // If no tokens at all, redirect to login
    if (!token && !refreshToken) {
        console.log('No tokens found, redirecting to login');
        return res.redirect('/');
    }
    // If we have an access token, try to verify it
    try {
        (0, jwt_1.verifyToken)(token);
        console.log('Access token verified successfully');
        next();
    }
    catch (error) {
        console.log('Access token error:', error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError && refreshToken) {
            console.log('Access token expired, attempting refresh');
            const refreshSuccess = yield refreshAccessToken(req, res);
            if (refreshSuccess) {
                console.log('New access token generated and set');
                next();
                return;
            }
            console.log('Failed to refresh token');
            return res.redirect('/');
        }
        console.log('Invalid access token, redirecting to login');
        return res.redirect('/');
    }
});
exports.authMiddleware = authMiddleware;
const formSubmissionMiddleware = (req, res, next) => {
    if (req.session.formSubmitted) {
        next();
    }
    else {
        res.redirect('/form');
    }
};
exports.formSubmissionMiddleware = formSubmissionMiddleware;
const adminMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    let refreshToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken;
    console.log('Admin middleware - Access token:', token ? 'Present' : 'Not present');
    console.log('Admin middleware - Refresh token:', refreshToken ? 'Present' : 'Not present');
    if (!token && !refreshToken) {
        console.log('Admin middleware - No tokens found, redirecting to login');
        return res.redirect('/');
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = yield User_1.default.findById(decoded.userId);
        if (!user || user.status !== 1) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        // Attach user to request object
        req.user = user;
        next();
    }
    catch (error) {
        console.log('Admin middleware - Access token error:', error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError && refreshToken) {
            console.log('Admin middleware - Access token expired, attempting refresh');
            const refreshSuccess = yield refreshAccessToken(req, res);
            if (refreshSuccess) {
                console.log('Admin middleware - New access token generated and set');
                // Use the new token from the response
                const response = yield axios_1.default.post(`${req.protocol}://${req.get('host')}/users/token`, {}, {
                    headers: { Cookie: `refreshToken=${refreshToken}` },
                    withCredentials: true
                });
                const newToken = response.data.accessToken;
                const decoded = (0, jwt_1.verifyToken)(newToken);
                const user = yield User_1.default.findById(decoded.userId);
                if (!user || user.status !== 1) {
                    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
                }
                // Attach user to request object
                req.user = user;
                next();
                return;
            }
            console.log('Admin middleware - Failed to refresh token');
            return res.redirect('/');
        }
        console.log('Admin middleware - Invalid access token, redirecting to login');
        return res.redirect('/');
    }
});
exports.adminMiddleware = adminMiddleware;
