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
exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartment = exports.getAllDepartments = void 0;
const Department_1 = __importDefault(require("../models/Department"));
// Get all departments
const getAllDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield Department_1.default.find().sort({ name: 1 });
        res.json(departments);
    }
    catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Error fetching departments' });
    }
});
exports.getAllDepartments = getAllDepartments;
// Get single department
const getDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const department = yield Department_1.default.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(department);
    }
    catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ message: 'Error fetching department' });
    }
});
exports.getDepartment = getDepartment;
// Create department
const createDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        // Check if department already exists
        const existingDepartment = yield Department_1.default.findOne({ name });
        if (existingDepartment) {
            return res.status(400).json({ message: 'Department already exists' });
        }
        const department = new Department_1.default({
            name,
            description
        });
        yield department.save();
        res.status(201).json(department);
    }
    catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Error creating department' });
    }
});
exports.createDepartment = createDepartment;
// Update department
const updateDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        // Check if new name already exists (excluding current department)
        if (name) {
            const existingDepartment = yield Department_1.default.findOne({
                name,
                _id: { $ne: req.params.id }
            });
            if (existingDepartment) {
                return res.status(400).json({ message: 'Department name already exists' });
            }
        }
        const department = yield Department_1.default.findByIdAndUpdate(req.params.id, { name, description }, { new: true, runValidators: true });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(department);
    }
    catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ message: 'Error updating department' });
    }
});
exports.updateDepartment = updateDepartment;
// Delete department
const deleteDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const department = yield Department_1.default.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ message: 'Department deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ message: 'Error deleting department' });
    }
});
exports.deleteDepartment = deleteDepartment;
