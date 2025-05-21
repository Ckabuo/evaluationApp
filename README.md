# Evaluation App

A comprehensive web application for managing and conducting evaluations, quizzes, and assessments. Built with Node.js, Express, TypeScript, and MongoDB.

## Features

### Admin Dashboard
- Overview of key metrics (total applicants, users, and results)
- Recent applicants list with quick actions
- Recent results with percentage scores
- Mobile-responsive sidebar navigation

### User Management
- Create, read, update, and delete users
- Role-based access control (Admin/Intern)
- User profile management
- Secure authentication and authorization

### Applicant Management
- Track and manage applicant information
- View applicant details and history
- Filter and search applicants
- Department-wise organization

### Quiz Management
- Create and manage quiz questions
- Support for multiple question types (Single/Multiple choice)
- Category-based question organization
- Dynamic quiz settings configuration

### Results Management
- Track and analyze quiz results
- Percentage-based scoring system
- Detailed result breakdowns
- Export and reporting capabilities

## Tech Stack

- **Backend:**
  - Node.js
  - Express.js
  - TypeScript
  - MongoDB with Mongoose
  - JWT Authentication

- **Frontend:**
  - EJS Templates
  - Bootstrap 5
  - SweetAlert2 for notifications
  - Responsive design

- **Development Tools:**
  - TypeScript
  - Nodemon for development
  - Morgan for logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ckabuo/evaluationApp.git
   cd evaluation-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Start the application:
   ```bash
   npm start
   ```

For development:
```bash
npm run dev
```

## Project Structure

```
evaluation-app/
├── src/                    # Source files
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── index.ts          # Application entry point
├── views/                 # EJS templates
│   ├── admin/            # Admin panel views
│   └── auth/             # Authentication views
├── public/               # Static files
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side scripts
│   └── images/          # Image assets
├── dist/                 # Compiled TypeScript files
└── package.json          # Project dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /users/login` - User login (accepts email/username and password)
- `GET /users/isLoggedIn` - Check if user is logged in
- `POST /users/token` - Refresh access token
- `DELETE /users/logout` - User logout

### Admin Routes
- `GET /admin/dashboard` - Get dashboard statistics
- `GET /admin/applicants` - List all applicants
- `GET /admin/users` - List all users
- `GET /admin/results` - List all results
- `GET /admin/departments` - List all departments
- `GET /admin/questions` - List all questions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email kabuochijioke@gmail.com or create an issue in the repository. 