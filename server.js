const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

const jwtAuthMiddleware = require("./jwt")

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate', jwtAuthMiddleware, candidateRoutes);

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
})