const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true, // Ensure email is unique if provided
        sparse: true, // Allows null or undefined values for unique fields
    },
    password: {
        type: String,
        required: true,
    },
    contacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
});

module.exports = mongoose.model('User', userSchema);
