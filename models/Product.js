const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
    requestId: String,
    productName: String,
    inputImageUrls: [String],
    outputImageUrls: [String],
    status: { type: String, default: 'pending' }
});

// Export the Product model
module.exports = mongoose.model('Product', productSchema);
