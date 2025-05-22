"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const departmentController_1 = require("../controllers/departmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// All department routes are protected by adminMiddleware
router.use((req, res, next) => {
    (0, authMiddleware_1.adminMiddleware)(req, res, next);
});
// Get all departments
router.get('/', (req, res) => {
    (0, departmentController_1.getAllDepartments)(req, res);
});
// Get single department
router.get('/:id', (req, res) => {
    (0, departmentController_1.getDepartment)(req, res);
});
// Create department
router.post('/', (req, res) => {
    (0, departmentController_1.createDepartment)(req, res);
});
// Update department
router.put('/:id', (req, res) => {
    (0, departmentController_1.updateDepartment)(req, res);
});
// Delete department
router.delete('/:id', (req, res) => {
    (0, departmentController_1.deleteDepartment)(req, res);
});
exports.default = router;
