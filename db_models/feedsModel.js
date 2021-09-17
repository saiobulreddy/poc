const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var feedsSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    image: { type: String, trim: true, required: true },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
});

module.exports = mongoose.model('Feeds', feedsSchema);