const mongoose = require('mongoose');

// Define the Request schema
const requestSchema = new mongoose.Schema({
    requestId: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Export the Request model
module.exports = mongoose.model('Request', requestSchema);
