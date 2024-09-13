const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const app = express();
const port = process.env.PORT || 3000;
const contactrouter = require('./routes/blogRoutes');
const { router: authRouter, verifyToken } = require('./routes/authRoutes'); // Import auth routes and verification function

const accesorigin = 'http://localhost:3001'; // The frontend's origin

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Use CORS middleware with configuration
app.use(cors({
    origin: accesorigin, // Allow requests from this origin
    credentials: true,   // Allow credentials (cookies) to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers
}));

// Connect to MongoDB
const dbUri = 'mongodb+srv://mohammadghiasi:Mgh3300305421@contacts.g4row.mongodb.net/contacts?retryWrites=true&w=majority&appName=contacts';
mongoose.connect(dbUri)
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

// Protected route to get user data
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route, accessible only to authenticated users.', user: req.user });
});

// Use existing routes
app.use(contactrouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
