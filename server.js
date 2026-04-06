const express = require('express');
const cors = require('cors');

const app = express();

// Allow all CORS origins for development and testing purposes
app.use(cors());

// Your existing server.js code here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});