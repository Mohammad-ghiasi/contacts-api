const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv'); // Import dotenv to load environment variables

dotenv.config(); // Load variables from .env file

const app = express();
const port = process.env.PORT || 3000;
const contactrouter = require('./routes/blogRoutes');
const { router: authRouter, verifyToken } = require('./routes/authRoutes');

// Middleware to parse JSON request bodies
app.use(express.json());

// Use CORS middleware with configuration to allow specific origin
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN, // Use environment variable for frontend origin
    credentials: true,   // Allow credentials (cookies) to be sent
}));

// Middleware to parse cookies
app.use(cookieParser());

// Connect to MongoDB using environment variable
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Connected successfully!');
    })
    .catch((error) => {
        console.log('Faced an error!', error);
    });

// Middleware to log request details
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Use authentication routes
app.use('/auth', authRouter);

app.get('/cookie', (req, res) => {
    const cookies = req.cookies;
    res.json({ cookies });
});

// Protected route to get user data
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route, accessible only to authenticated users.', user: req.user });
});

// Use existing routes
app.use('/contacts', contactrouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
