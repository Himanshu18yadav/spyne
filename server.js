const express = require('express');
const mongoose = require('mongoose');
const uploadRoutes = require('./routes/upload');
const statusRoutes = require('./routes/status');

const app = express();
const port = 5000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/imageProcessing');

// Middleware
app.use(express.json());

// Routes
// app.use('/',(req,res)=>{
//     res.send("god is back")
// })
app.use('/upload', uploadRoutes);
app.use('/status', statusRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
