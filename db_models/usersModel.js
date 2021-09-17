const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    image: { type: String, default: "" },
    password: { type: String, required: true }
});

module.exports = mongoose.model('Users', userSchema);