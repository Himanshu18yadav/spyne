const express = require('express');
const Product = require('../models/Product');
const { Parser } = require('json2csv');

const router = express.Router();

// Status API route
router.get('/:requestId', async (req, res) => {
    const requestId = req.params.requestId;

    // Find the product by request ID
    const product = await Product.findOne({ requestId: requestId });

    if (!product) {
        return res.status(404).json({ message: 'Request ID not found' });
    }

    // If processing is completed, return the output CSV
    if (product.status === 'completed') {
        // Define CSV fields
        const fields = ['Serial Number', 'Product Name', 'Input Image Urls', 'Output Image Urls'];
        const csvData = [{
            'Serial Number': 1, // Replace with actual serial number logic if required
            'Product Name': product.productName,
            'Input Image Urls': product.inputImageUrls.join(','),
            'Output Image Urls': product.outputImageUrls.join(',')
        }];

        // Convert JSON to CSV
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        // Set the response header to download the CSV file
        res.header('Content-Type', 'text/csv');
        res.attachment('output.csv');
        return res.send(csv);
    } else {
        // Return status if still processing
        res.json({
            requestId: product.requestId,
            productName: product.productName,
            inputImageUrls: product.inputImageUrls,
            outputImageUrls: product.outputImageUrls,
            status: product.status
        });
    }
});

module.exports = router;
