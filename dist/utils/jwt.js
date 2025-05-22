"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'secret';
// Access token expires in 1 hour
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};
exports.generateAccessToken = generateAccessToken;
// Refresh token expires in 24 hours
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '24h' });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token, isRefreshToken = false) => {
    try {
        const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw error; // Pass the original error to handle it properly in middleware
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        else {
            throw new Error('Token verification failed');
        }
    }
};
exports.verifyToken = verifyToken;
