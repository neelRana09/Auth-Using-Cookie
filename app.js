const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connection } = require('./dbConfig');
const authRoutes = require('./authRoute');
const { authMiddleware } = require('./authMiddleware');
const PORT = process.env.PORT || 5000;

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connection();

// Initialize the Express application
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Set-Cookie'],
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.get('/api/profile', authMiddleware, (req, res) => {
    return res.json({ message: `Welcome to your profile, user ID: ${req.user.id}!`, userId: req.user.id });
});
app.get('/', (req, res) => {
    return res.send('Welcome to the secure authentication backend!');
});

// Start the server
app.listen(PORT, (err) => {
    if (!err) {
        console.log(`Server running on port ${PORT}`);
    } else {
        console.error('Error starting the server:', err.message);
    }
});