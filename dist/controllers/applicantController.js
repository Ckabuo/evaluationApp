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
exports.getApplicantById = exports.getApplicants = exports.registerApplicant = void 0;
const Applicant_1 = __importDefault(require("../models/Applicant"));
const mongoose_1 = __importDefault(require("mongoose"));
const registerApplicant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phoneNumber, department } = req.body;
    // Validate all input fields
    if (!name || !email || !phoneNumber || !department) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    // Check if email exist
    const existingEmail = yield Applicant_1.default.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    try {
        const applicant = new Applicant_1.default({
            name,
            email,
            phoneNumber,
            department,
        });
        yield applicant.save();
        req.session.applicantId = applicant._id;
        req.session.formSubmitted = true;
        res.status(200).json({
            message: 'Applicant created successfully',
            applicant: {
                name: applicant.name,
                email: applicant.email,
                phone_number: applicant.phoneNumber
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Error registering applicant', error: error.message
        });
    }
});
exports.registerApplicant = registerApplicant;
const getApplicants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Total number of data in the database
        const applicantCount = yield Applicant_1.default.countDocuments();
        //Retrieve all applicant record in the database
        const applicant = yield Applicant_1.default.find();
        return res.status(200).json({
            message: "Applicants fetched successfully",
            totalApplicants: applicantCount,
            Applicants: applicant
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error getting applicants', error: error.message
        });
    }
});
exports.getApplicants = getApplicants;
const getApplicantById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicantId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const applicant = yield Applicant_1.default.findById(applicantId);
        if (!applicant) {
            return res.status(404).json({
                message: "Applicant not found"
            });
        }
        const applicantData = applicant.toObject();
        return res.status(200).json({
            message: "User fetched successfully",
            applicant: applicantData
        });
    }
    catch (error) {
        console.error('Error fetching applicanr details:', error.message);
        return res.status(500).json({
            message: "Error fetching user details",
            error: error.message
        });
    }
});
exports.getApplicantById = getApplicantById;
