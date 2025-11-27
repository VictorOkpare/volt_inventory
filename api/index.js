require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('../config/database');

// Controllers
const { getItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/inventoryController');
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const errorHandler = require('../middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Inventory Routes (Protected)
app.get('/api/inventory', protect, getItems);
app.post('/api/inventory', protect, createItem);
app.get('/api/inventory/:id', protect, getItem);
app.put('/api/inventory/:id', protect, updateItem);
app.delete('/api/inventory/:id', protect, deleteItem);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
