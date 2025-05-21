import express, { Request, Response, NextFunction } from 'express';
import { 
    getAllDepartments, 
    getDepartment, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment 
} from '../controllers/departmentController';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// All department routes are protected by adminMiddleware
router.use((req: Request, res: Response, next: NextFunction) => {
    adminMiddleware(req, res, next);
});

// Get all departments
router.get('/', (req: Request, res: Response) => {
    getAllDepartments(req, res);
});

// Get single department
router.get('/:id', (req: Request, res: Response) => {
    getDepartment(req, res);
});

// Create department
router.post('/', (req: Request, res: Response) => {
    createDepartment(req, res);
});

// Update department
router.put('/:id', (req: Request, res: Response) => {
    updateDepartment(req, res);
});

// Delete department
router.delete('/:id', (req: Request, res: Response) => {
    deleteDepartment(req, res);
});

export default router; 