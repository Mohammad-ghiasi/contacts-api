const express = require('express');
const router = express.Router();
const Contacts = require('../models/contacts');
const User = require('../models/user');
const { verifyToken } = require('./authRoutes');

// Add contact route (protected)
router.post('/contact', verifyToken, async (req, res) => {
    const { name, phone } = req.body;
    const userId = req.user._id; // Get user ID from the verified token

    if (!name || !phone) {
        return res.status(400).send({ message: "Name and phone are required!" });
    }

    try {
        // Check if the phone number already exists for the user
        const existingContact = await Contacts.findOne({ phone, user: userId });
        if (existingContact) {
            return res.status(409).send({ message: "Phone number already exists!" });
        }

        // Create a new contact and associate it with the user
        const contact = new Contacts({ name, phone, user: userId });
        await contact.save();

        // Add the contact to the user's contacts array
        await User.findByIdAndUpdate(userId, { $push: { contacts: contact._id } });

        res.send({ message: "Contact created successfully!", contact });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to create contact!" });
    }
});

// Get all contacts for the logged-in user (protected)
router.get('/get-contacts', verifyToken, async (req, res) => {
    
    try {
        const userId = req.user._id;
        const contacts = await Contacts.find({ user: userId });
        res.send({ data: contacts });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to retrieve contacts!" });
    }
});

// Get a specific contact by ID (protected)
router.get('/get-contact', verifyToken, async (req, res) => {
    const { id } = req.query;
    const userId = req.user._id;

    try {
        const contact = await Contacts.findOne({ _id: id, user: userId });
        if (!contact) {
            return res.status(404).send({ message: "Contact not found!" });
        }
        res.send({ data: contact });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to retrieve contact!" });
    }
});

// Delete a contact by ID (protected)
router.delete('/remove-contact', verifyToken, async (req, res) => {
    const { id } = req.query;
    const userId = req.user._id;

    if (!id) {
        return res.status(400).send({ message: "ID is required!" });
    }

    try {
        const contact = await Contacts.findOneAndDelete({ _id: id, user: userId });
        if (!contact) {
            return res.status(404).send({ message: "Contact not found!" });
        }

        // Remove the contact from the user's contacts array
        await User.findByIdAndUpdate(userId, { $pull: { contacts: contact._id } });

        res.send({ message: "Contact deleted successfully!", data: contact });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to delete contact!" });
    }
});

module.exports = router;
