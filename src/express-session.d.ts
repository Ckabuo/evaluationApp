import 'express-session';

declare module 'express-session' {
    interface SessionData {
        formSubmitted?: boolean;
        applicantId?: mongoose.Types.ObjectId;
        score?: number;

    }
}