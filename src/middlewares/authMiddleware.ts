import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import jwt from "jsonwebtoken";
import User from '../models/User';
import axios from 'axios';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const refreshAccessToken = async (req: Request, res: Response): Promise<boolean> => {
    try {
        console.log('Attempting to refresh token...');
        const url = `${req.protocol}://${req.get('host')}/users/token`;
        console.log('Refresh URL:', url);
        console.log('Refresh token from cookie:', req.cookies.refreshToken);

        const response = await axios.post(url, {}, {
            headers: {
                Cookie: `refreshToken=${req.cookies.refreshToken}`
            },
            withCredentials: true
        });

        console.log('Refresh response:', response.status, response.statusText);
        console.log('Response data:', response.data);

        const data = response.data as { accessToken: string };
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
    } catch (error: any) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        return false;
    }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies?.accessToken;
    let refreshToken = req.cookies?.refreshToken;
    console.log('Access token from cookie:', token ? 'Present' : 'Not present');
    console.log('Refresh token from cookie:', refreshToken ? 'Present' : 'Not present');

    // If no access token but we have refresh token, try to refresh
    if (!token && refreshToken) {
        console.log('No access token, attempting to refresh using refresh token');
        const refreshSuccess = await refreshAccessToken(req, res);
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
        verifyToken(token);
        console.log('Access token verified successfully');
        next();
    } catch (error: any) {
        console.log('Access token error:', error);
        if (error instanceof jwt.TokenExpiredError && refreshToken) {
            console.log('Access token expired, attempting refresh');
            const refreshSuccess = await refreshAccessToken(req, res);
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
};

export const formSubmissionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.formSubmitted) {
        next();
    } else {
        res.redirect('/form');
    }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies?.accessToken;
    let refreshToken = req.cookies?.refreshToken;
    console.log('Admin middleware - Access token:', token ? 'Present' : 'Not present');
    console.log('Admin middleware - Refresh token:', refreshToken ? 'Present' : 'Not present');

    if (!token && !refreshToken) {
        console.log('Admin middleware - No tokens found, redirecting to login');
        return res.redirect('/');
    }

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        
        if (!user || user.status !== 1) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        // Attach user to request object
        req.user = user;
        next();
    } catch (error: any) {
        console.log('Admin middleware - Access token error:', error);
        if (error instanceof jwt.TokenExpiredError && refreshToken) {
            console.log('Admin middleware - Access token expired, attempting refresh');
            const refreshSuccess = await refreshAccessToken(req, res);
            if (refreshSuccess) {
                console.log('Admin middleware - New access token generated and set');
                // Use the new token from the response
                const response = await axios.post(`${req.protocol}://${req.get('host')}/users/token`, {}, {
                    headers: { Cookie: `refreshToken=${refreshToken}` },
                    withCredentials: true
                });
                const newToken = (response.data as { accessToken: string }).accessToken;
                
                const decoded = verifyToken(newToken);
                const user = await User.findById(decoded.userId);
                
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
};
