const mongoose = require('mongoose');

var roomMatesSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    roomId: { type: String, required: true }
});

module.exports = mongoose.model('RoomMates', roomMatesSchema);