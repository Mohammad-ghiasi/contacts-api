// models/contacts.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contactsSchema = new Schema(
    {
        name: {
            type: String,
            required: true, // Name is required
        },
        phone: {
            type: String, // Use String if you need to handle large numbers or non-numeric characters
            required: true, // Phone is required
            unique: true, // Ensure the phone number is unique
        },
        user: {
            type: Schema.Types.ObjectId, // Link to the User model
            ref: 'User', // This refers to the model name 'User' as defined in user.js
            required: true, // Each contact must be associated with a user
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Contacts = mongoose.model('Contact', contactsSchema);

module.exports = Contacts;
