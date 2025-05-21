import { Request, Response } from 'express';
import Applicant from '../models/Applicant';
import mongoose from "mongoose";

export const registerApplicant = async (req: Request, res: Response) => {
    const { name, email, phoneNumber, department } = req.body;

    // Validate all input fields
    if (!name || !email || !phoneNumber || !department) {
        return res.status(400).json({message: 'All fields are required'});
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({message: 'Please enter a valid email address'});
    }

    // Check if email exist
    const existingEmail = await Applicant.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({message: 'Email already exists'});
    }

    try {
        const applicant = new Applicant({
            name,
            email,
            phoneNumber,
            department,
        });
        await applicant.save();

        req.session.applicantId = applicant._id as mongoose.Types.ObjectId;
        req.session.formSubmitted = true;

        res.status(200).json({
            message: 'Applicant created successfully',
            applicant: {
                name: applicant.name,
                email: applicant.email,
                phone_number: applicant.phoneNumber
            }
        })


    } catch (error: any) {
        return res.status(500).json({
            message: 'Error registering applicant', error: error.message
        });
    }
}

export const getApplicants = async (req: Request, res: Response) => {
    try {
        //Total number of data in the database
        const applicantCount = await Applicant.countDocuments();

        //Retrieve all applicant record in the database
        const applicant = await Applicant.find();

        return res.status(200).json({
            message: "Applicants fetched successfully",
            totalApplicants: applicantCount,
            Applicants: applicant
        });

    } catch (error: any) {
        res.status(500).json({
            message: 'Error getting applicants', error: error.message
        })
    }
}

export const getApplicantById = async (req: Request, res: Response) => {
    try {
        const applicantId = new mongoose.Types.ObjectId(req.params.id);

        const applicant = await Applicant.findById(applicantId);

        if (!applicant) {
            return res.status(404).json({
                message: "Applicant not found"
            });
        }

        const applicantData = applicant.toObject()

        return res.status(200).json({
            message: "User fetched successfully",
            applicant: applicantData
        });


    } catch (error: any) {
        console.error('Error fetching applicanr details:', error.message);
        return res.status(500).json({
            message: "Error fetching user details",
            error: error.message
        });
    }
};
