const express = require('express');
const router = express.Router();
const Contacts = require('../models/contacts');
const User = require('../models/user');
const { verifyToken } = require('./authRoutes');


router.post('/contact', verifyToken, async (req, res) => {
    const { name, phone } = req.body;
    const userId = req.user._id;

    if (!name || !phone) {
        return res.status(400).send({ message: "Name and phone are required!" });
    }

    try {
        const existingContact = await Contacts.findOne({ phone, user: userId });
        if (existingContact) {
            return res.status(409).send({ message: "Phone number already exists!" });
        }

        const contact = new Contacts({ name, phone, user: userId });
        await contact.save();

        await User.findByIdAndUpdate(userId, { $push: { contacts: contact._id } });

        res.send({ message: "Contact created successfully!", contact });
    } catch (error) {
        res.status(500).send({ message: "Failed to create contact!" });
    }
});

router.get('/get-contacts', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const contacts = await Contacts.find({ user: userId });
        res.send({ data: contacts });
    } catch (error) {
        res.status(500).send({ message: "Failed to retrieve contacts!" });
    }
});


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
        res.status(500).send({ message: "Failed to retrieve contact!" });
    }
});


// Edit contact route
router.put('/edit-contact', verifyToken, async (req, res) => {
    const { id, name, phone } = req.body;
    const userId = req.user._id;

    if (!id || !name || !phone) {
        return res.status(400).send({ message: "ID, name, and phone are required!" });
    }

    try {
        // Check if the contact exists and belongs to the current user
        const contact = await Contacts.findOne({ _id: id, user: userId });
        if (!contact) {
            return res.status(404).send({ message: "Contact not found!" });
        }

        // Check if the phone number is already taken by another contact
        const existingContact = await Contacts.findOne({ phone, user: userId, _id: { $ne: id } });
        if (existingContact) {
            return res.status(409).send({ message: "Phone number already exists!" });
        }

        // Update contact details
        contact.name = name;
        contact.phone = phone;
        await contact.save();

        res.send({ message: "Contact updated successfully!", contact });
    } catch (error) {
        res.status(500).send({ message: "Failed to update contact!" });
    }
});


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

        await User.findByIdAndUpdate(userId, { $pull: { contacts: contact._id } });

        res.send({ message: "Contact deleted successfully!", data: contact });
    } catch (error) {
        res.status(500).send({ message: "Failed to delete contact!" });
    }
});

module.exports = router;
