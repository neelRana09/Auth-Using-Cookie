const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./dbConfig');

const router = express.Router();

const setAuthCookie = (res, token) => {
    // Set cookie options
    // httpOnly: true - Makes the cookie inaccessible to client-side JavaScript. Crucial for security.
    // secure: process.env.NODE_ENV === 'production' - Ensures cookie is only sent over HTTPS in production.
    // sameSite: 'Lax' - Provides some protection against CSRF attacks. 'Strict' is even stronger.
    // maxAge: 3600000 - Cookie expires in 1 hour (in milliseconds).
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development', // Only send over HTTPS in development
        sameSite: 'Lax', // Protects against some CSRF attacks
        maxAge: 60000, // Changed to 1 minute (60,000 milliseconds)
    });
};


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user already exists
    const userExists = await db.users.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    try {
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const passwordHash = await bcrypt.hash(password, salt); // Hash the password

        // Create new user object
        const newUserData = await db.users.create({
            name: name,
            email: email,
            password: passwordHash,
        });

        console.log('Registered user:', newUserData);
        return res.status(201).json({ message: 'User registered successfully', userId: newUserData._id });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Find user by email
        const user = await db.users.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        // The payload contains the user ID. This ID will be used by the middleware.
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1m', // Token now expires in 1 minute
        });

        // Set the JWT in an HttpOnly cookie
        setAuthCookie(res, token);

        console.log('User logged in:', user.email);
        return res.status(200).json({ message: 'Logged in successfully', userId: user._id });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});

router.post('/logout', (req, res) => {
    // Clear the authentication cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    });
    console.log('User logged out');
    return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;