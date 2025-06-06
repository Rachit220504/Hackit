# HackIT Platform

A comprehensive hackathon management platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication and authorization
- Team creation and management
- Project submission and tracking
- Hackathon organization tools

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT

## Project Structure

```
c:\hackit\
├── frontend/               # React + Tailwind CSS
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       └── services/       # API services
├── backend/                # Node.js + Express + MongoDB
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   └── routes/             # API routes
└── docs/                   # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/hackit.git
cd hackit
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables
- Create a `.env` file in the backend directory (see `.env.example`)
- Create a `.env` file in the frontend directory (see `.env.example`)

4. Run the application
```bash
# Run backend (from backend directory)
npm run dev

# Run frontend (from frontend directory)
npm start
```

## MongoDB Atlas Setup

This application uses MongoDB Atlas as the database. To set up:

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient for development)
3. Set up a database user with read/write access
4. Configure network access (allow access from your IP or anywhere for development)
5. Get your connection string by clicking "Connect" on your cluster
6. Replace the placeholder in the `.env` file with your actual connection string:

## Development Roadmap

- Days 1-2: Project Setup & Planning
- Days 3-4: User Authentication & Authorization
- Days 5-6: Team Management Features
- Days 7-8: Project Submission System
- Days 9-10: Hackathon Organization Tools
- Days 11-12: Testing & Bug Fixes
- Days 13-14: Deployment & Documentation

## License

MIT
