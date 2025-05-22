# Evaluation App Documentation

## Overview
The Evaluation App is a comprehensive web application designed for managing and conducting evaluations, quizzes, and assessments. It provides separate interfaces for administrators and applicants, with features for user management, quiz administration, and result tracking.

## User Roles

### 1. Administrator
- Full access to the admin dashboard
- Manage users, applicants, and departments
- Create and manage quiz questions
- Configure quiz settings
- View and analyze results

### 2. Applicant/Intern
- Access to the application form
- Take quizzes
- View their results
- Limited access to specific features

## User Stories

### Administrator Stories
1. As an admin, I want to:
   - Log in to the admin dashboard
   - View overall statistics and recent activities
   - Manage user accounts (create, edit, delete)
   - View and manage applicant information
   - Create and manage quiz questions
   - Configure quiz settings (time limit, number of questions)
   - View and analyze quiz results
   - Manage departments

### Applicant Stories
1. As an applicant, I want to:
   - Log in to the system
   - Fill out the application form
   - Take the assessment quiz
   - View my results
   - Navigate through the application process smoothly

## User Flows

### Authentication Flow
1. User visits the application
2. User is presented with the login page
3. User enters credentials (email/username and password)
4. System validates credentials
5. Based on user role:
   - Admin: Redirected to admin dashboard
   - Applicant: Redirected to application form or quiz

### Applicant Flow
1. Login
2. Fill out application form with:
   - Full name
   - Email address
   - Phone number
   - Department selection
3. Submit form
4. Take the quiz:
   - View questions
   - Select answers
   - Navigate between questions
   - Submit quiz
5. View results

### Admin Flow
1. Login to admin dashboard
2. Access various management sections:
   - User Management
   - Applicant Management
   - Quiz Management
   - Results Management
   - Department Management
3. Perform administrative tasks
4. View and analyze data

## Features

### Authentication System
- Secure login with email/username and password
- JWT-based authentication
- Role-based access control
- Session management
- Secure password handling

### Admin Dashboard
- Overview statistics
- Recent applicants list
- Recent results with percentage scores
- Quick access to all management sections
- Mobile-responsive design

### User Management
- Create new users
- Edit user details
- Delete users
- Role assignment (Admin/Intern)
- User search and filtering

### Applicant Management
- Track applicant information
- View applicant details
- Filter and search applicants
- Department-wise organization
- Application status tracking

### Quiz Management
- Create and manage questions
- Support for multiple question types:
  - Single choice
  - Multiple choice
- Question categorization
- Quiz settings configuration:
  - Time limit
  - Number of questions
  - Question randomization

### Results Management
- Track quiz results
- Calculate percentage scores
- Detailed result breakdowns
- Result filtering and searching
- Export capabilities

## Technical Implementation

### Security Features
- JWT token-based authentication
- Secure password hashing
- HTTP-only cookies
- CSRF protection
- Input validation
- Role-based middleware

### Database Models
1. User
   - Username
   - Email
   - Password (hashed)
   - Status (Admin/Intern)
   - Creation date

2. Applicant
   - Name
   - Email
   - Phone number
   - Department
   - Application date

3. Question
   - Question text
   - Options
   - Correct answer
   - Question type
   - Category

4. Result
   - Applicant reference
   - Questions answered
   - Score
   - Total questions
   - Time taken
   - Submission date

5. Department
   - Name
   - Description

6. QuizSettings
   - Time limit
   - Question count
   - Other configuration options

### API Endpoints

#### Authentication
- POST /users/login
- GET /users/isLoggedIn
- POST /users/token
- DELETE /users/logout

#### Admin Routes
- GET /admin/dashboard
- GET /admin/applicants
- GET /admin/users
- GET /admin/results
- GET /admin/departments
- GET /admin/questions

#### Applicant Routes
- POST /applicants
- GET /form
- GET /quiz
- POST /quiz/submit
- GET /score

## Mobile Responsiveness
- Responsive design for all screen sizes
- Mobile-friendly navigation
- Collapsible sidebar for admin panel
- Touch-friendly interface elements

## Error Handling
- Form validation
- Input sanitization
- Error messages
- User-friendly notifications
- Session management
- Token refresh mechanism

## Future Enhancements
1. Email notifications
2. Result export to PDF
3. Advanced analytics
4. Bulk question import
5. Custom quiz templates
6. Real-time monitoring
7. Automated scoring system
8. Performance analytics 