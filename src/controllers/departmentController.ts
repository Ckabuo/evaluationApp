import { Request, Response } from 'express';
import Department from '../models/Department';

// Get all departments
export const getAllDepartments = async (req: Request, res: Response) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Error fetching departments' });
    }
};

// Get single department
export const getDepartment = async (req: Request, res: Response) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(department);
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ message: 'Error fetching department' });
    }
};

// Create department
export const createDepartment = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        // Check if department already exists
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = new Department({
            name,
            description
        });

        await department.save();
        res.status(201).json(department);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Error creating department' });
    }
};

// Update department
export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        // Check if new name already exists (excluding current department)
        if (name) {
            const existingDepartment = await Department.findOne({ 
                name, 
                _id: { $ne: req.params.id } 
            });
            if (existingDepartment) {
                return res.status(400).json({ message: 'Department name already exists' });
            }
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json(department);
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ message: 'Error updating department' });
    }
};

// Delete department
export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ message: 'Error deleting department' });
    }
}; 