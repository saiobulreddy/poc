const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var splitAmountSchema = new mongoose.Schema({
    ownedBy: { type: Schema.Types.ObjectId, required: true }, // pay to others
    ownedTo: { type: Schema.Types.ObjectId, required: true }, // pay to me
    amount: { type: Number, default: 0 }
});

module.exports = mongoose.model('SplitAmount', splitAmountSchema);