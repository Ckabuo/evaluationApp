import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'secret';

// Access token expires in 1 hour
export const generateAccessToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// Refresh token expires in 24 hours
export const generateRefreshToken = (payload: object): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '24h' });
}

export const verifyToken = (token: string, isRefreshToken: boolean = false): any => {
    try {
        const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
        return jwt.verify(token, secret);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw error; // Pass the original error to handle it properly in middleware
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
};
