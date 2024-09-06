const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = 'mySecret';

// Signup Route
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // If email is provided, check if it's already taken
        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already taken' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});


// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        // Set the token as a cookie
        res.cookie('auth_token', token, {
            httpOnly: true, // Prevents JavaScript from accessing the cookie
            maxAge: 3600000 // 1 hour
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token'); // Clear the authentication token from cookies
    res.json({ message: 'Logout successful' });
});

// Middleware to verify the token and attach user data to the request object
const verifyToken = async (req, res, next) => {
    const token = req.cookies['auth_token']; // Get token from cookies
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password'); // Fetch user data excluding the password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user; // Attach user data to the request object
        next();
    } catch (error) {
        res.status(403).json({ message: 'Failed to authenticate token' });
    }
};

module.exports = { router, verifyToken };
