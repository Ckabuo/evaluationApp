import express, { Request, Response, NextFunction } from 'express';
import { loginUser, registerUser, isLoggedIn, refreshToken, logoutUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', (req: Request, res: Response, next: NextFunction) => {
    registerUser(req, res).catch(next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    loginUser(req, res).catch(next);
});

router.get('/isLoggedIn', (req: Request, res: Response, next: NextFunction) => {
    isLoggedIn(req, res).catch(next);
});

router.post('/token', (req: Request, res: Response, next: NextFunction) => {
    refreshToken(req, res).catch(next);
});

router.delete('/logout', (req: Request, res: Response, next: NextFunction) => {
    logoutUser(req, res).catch(next);
});

router.get('/session-data', (req: Request, res: Response) => {
    res.json({
        formSubmitted: req.session.formSubmitted,
        applicantId: req.session.applicantId,
    });
});

export default router;