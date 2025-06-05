# HackIT Platform Architecture

## Overview

HackIT is a comprehensive hackathon management platform designed to facilitate the organization, participation, and evaluation of hackathon events. The platform is built using the MERN stack (MongoDB, Express.js, React, Node.js) with Tailwind CSS for styling.

## System Architecture

The application follows a client-server architecture:

- **Frontend**: React.js with Tailwind CSS for responsive UI
- **Backend**: Node.js with Express.js for RESTful API
- **Database**: MongoDB with Mongoose ODM

```
[Client Browser] <---> [React Frontend] <---> [Express API] <---> [MongoDB]
```

## Frontend Architecture

The frontend is built with React and organized into the following structure:

- **components/**: Reusable UI components
- **pages/**: Page-level components corresponding to routes
- **context/**: React Context for state management
- **utils/**: Utility functions and helpers
- **services/**: API service functions

## Backend Architecture

The backend follows a modular structure:

- **server.js**: Entry point for the application
- **config/**: Configuration files including database connection
- **models/**: Mongoose schemas and models
- **controllers/**: Business logic for handling requests
- **routes/**: API route definitions
- **middleware/**: Custom middleware functions
- **utils/**: Utility functions

## Data Models

### User
- name
- email
- password (hashed)
- role (user, admin, organizer)
- createdAt

### Team
- name
- description
- members (array of User IDs)
- leader (User ID)
- project (Project ID)
- createdAt

### Project
- title
- description
- techStack (array of technologies)
- repoUrl
- demoUrl
- team (Team ID)
- createdAt

### Submission
- project (Project ID)
- submittedBy (User ID)
- status (pending, approved, rejected)
- feedback
- submittedAt

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Users
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

### Teams
- POST /api/teams
- GET /api/teams
- GET /api/teams/:id
- PUT /api/teams/:id
- DELETE /api/teams/:id

### Projects
- POST /api/projects
- GET /api/projects
- GET /api/projects/:id
- PUT /api/projects/:id
- DELETE /api/projects/:id

### Submissions
- POST /api/submissions
- GET /api/submissions
- GET /api/submissions/:id
- PUT /api/submissions/:id

## Security

- JWT authentication
- Password hashing with bcrypt
- Protected routes with role-based access control
