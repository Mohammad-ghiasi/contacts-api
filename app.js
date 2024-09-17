const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const app = express();
const port = process.env.PORT || 3000;
const contactrouter = require('./routes/blogRoutes');
const { router: authRouter, verifyToken } = require('./routes/authRoutes'); // Import auth routes and verification function

const frontendOrigin = 'https://contact-front-blush.vercel.app'; // The frontend's origin
// https://contact-front-blush.vercel.app


// Middleware to parse cookies
app.use(cookieParser());
// Middleware to parse JSON request bodies
app.use(express.json());



// Use CORS middleware with configuration to allow specific origin
app.use(cors({
    origin: frontendOrigin, // Allow the specific frontend origin
    credentials: true,   // Allow credentials (cookies) to be sent
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

app.get('/cookie', (req, res) => {
    // Access cookies
    const cookies = req.cookies;

    // Do something with the cookies
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
