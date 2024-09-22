const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;


// authRoutes.js
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

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
        console.error(error);
        res.status(500).json({ message: 'Error registering user', error });
    }
});



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
        // res.cookie('auth_token', token, {
        //     httpOnly: true,
        //     maxAge: 3600000, // 1 hour
        //     secure: false,
        //     sameSite: 'Lax',
        // });

        res.json({ message: 'Login successful', token: token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});


// have to edite  ********
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logout successful' });
});
// -------------------



// Middleware to verify token
const verifyToken = async (token) => {
    if (!token) {
        throw new Error('Token undefined!');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new Error('User not found | invaid token');
        }
        return user; // return user if authenticated
    } catch (error) {
        throw new Error('Failed to authenticate token: ' + error.message);
    }
};


const tokenVerificationMiddleware = async (req, res, next) => {
    const token = req.query.auth_token || req.body.token; // Check query for GET and body for POST
    
    if (!token) {
        return res.status(401).send({ message: "Token is required for authentication!" });
    }

    try {
        const user = await verifyToken(token); // Verify the token
        req.user = user; // Attach the verified user to the request
        next();
    } catch (error) {
        res.status(403).send({ message: "Authentication failed!", error: error.message });
    }
};



module.exports = { router, verifyToken, tokenVerificationMiddleware };
