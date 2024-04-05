const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = "mongodb://127.0.0.1:27017/voting"
// const mongoURL = process.env.MONGODB_URL;
mongoose.connect(mongoURL) 

const db = mongoose.connection;

db.on('connected', ()=>{
    console.log(' Connected to MongoDB server')
})

db.on('error', (err)=>{
    console.log('MongoDB connection error', err)
})
db.on('disconnected', ()=>{
    console.log('MongoDB disconnected')
})

module.exports = db;