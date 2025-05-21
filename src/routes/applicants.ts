import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { getApplicantById, getApplicants, registerApplicant} from "../controllers/applicantController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Public route for applicant registration
router.post('/', (req: Request, res: Response, next: NextFunction) => {
    registerApplicant(req, res).catch(next);
});

// Protected routes for admin access
router.get('/', [authMiddleware, adminMiddleware] as RequestHandler[], (req: Request, res: Response, next: NextFunction) => {
    getApplicants(req, res).catch(next);
});

router.get('/:id', [authMiddleware, adminMiddleware] as RequestHandler[], (req: Request, res: Response, next: NextFunction) => {
    getApplicantById(req, res).catch(next);
});

export default router;
