const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');
const axios = require('axios');
const sharp = require('sharp');

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Upload API route
router.post('/', upload.single('file'), (req, res) => {
    const fileRows = [];
    const requestId = uuidv4(); // Generate a unique request ID

    // Read and parse the CSV file
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            fileRows.push(row);
        })
        .on('end', async () => {
            // Process each row and save data to the database
            for (const row of fileRows) {
                const inputUrls = row['Input Image Urls'].split(',');

                // Save the product data to the database
                await Product.create({
                    requestId: requestId,
                    productName: row['Product Name'],
                    inputImageUrls: inputUrls,
                    outputImageUrls: [],
                    status: 'processing'
                });

                // Start asynchronous image processing
                processImages(requestId, inputUrls);
            }

            // Clean up the uploaded CSV file
            fs.unlinkSync(req.file.path);

            // Return the unique request ID to the user
            res.json({ requestId: requestId });
        });
});

// Function to process images asynchronously
async function processImages(requestId, inputUrls) {
    const outputUrls = [];

    for (const url of inputUrls) {
        try {
            // Download the image from the URL
            const imageResponse = await axios({ url, responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageResponse.data, 'binary');

            // Compress the image using sharp
            const compressedImage = await sharp(buffer)
                .resize({ width: Math.round(imageResponse.data.width / 2) })
                .toBuffer();

            // Simulate saving the image (replace with actual cloud storage)
            const outputUrl = `http://output-url/image-${uuidv4()}.jpg`;
            outputUrls.push(outputUrl);
        } catch (err) {
            console.error('Error processing image:', err);
        }
    }

    // Update the product with the output image URLs and set status to completed
    await Product.updateMany(
        { requestId: requestId },
        { $set: { outputImageUrls: outputUrls, status: 'completed' } }
    );

    // Optionally, trigger a webhook after processing
    triggerWebhook(requestId);
}

// Function to trigger a webhook after processing is complete
function triggerWebhook(requestId) {
    const webhookUrl = 'http://example.com/webhook'; // Replace with actual webhook URL
    axios.post(webhookUrl, { requestId: requestId, status: 'completed' })
        .then(() => console.log('Webhook triggered'))
        .catch(err => console.error('Error triggering webhook', err));
}

module.exports = router;
