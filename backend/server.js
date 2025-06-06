require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const path = require('path');
const fs = require('fs');

// Connect to MongoDB Atlas
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Initialize Passport
app.use(passport.initialize());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/teams', require('./routes/team.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/judging', require('./routes/judging.routes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to HackIT API',
    version: '1.0.0',
    mongodb: process.env.MONGO_URI ? 'Connected to MongoDB Atlas' : 'MongoDB connection string not found'
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.MONGO_URI) {
    console.log('Connected to MongoDB Atlas');
  } else {
    console.warn('Warning: MongoDB Atlas connection string not found in environment variables');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server in production, but log the error
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});
