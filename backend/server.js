const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const accidentRoutes = require('./routes/accident');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/accident', accidentRoutes);

// Simple Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Smart Road Accident Detection Server is Running' });
});

// Connect to MongoDB & Start Server
const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accident-detection';
mongoose
  .connect(dbUri)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    console.log('Ensure MongoDB service is running locally on 27017.');
    // Start server anyway in demo fallback mode if db is offline
    app.listen(PORT, () => {
      console.log(`Server started anyway in mock-database mode on port ${PORT}`);
    });
  });
