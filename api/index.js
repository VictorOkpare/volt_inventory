require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('../config/database');

// Controllers
const { getItems, getItem, createItem, updateItem, deleteItem, getCategories, updateCategories } = require('../controllers/inventoryController');
const { register, login, forgotPassword, resetPassword, getSettings, updateSettings, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Route imports
const authRoutes = require('../routes/auth');
const storeRoutes = require('../routes/stores');
const userRoutes = require('../routes/users');
const inventoryRoutes = require('../routes/inventory');

const errorHandler = require('../middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB connection on startup
let dbConnected = false;
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  dbConnected = false;
});

// Middleware to check DB connection
app.use((req, res, next) => {
  // For health checks, skip DB requirement
  if (req.path === '/' || req.path === '/api' || req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  
  // For other routes, ensure DB connection
  if (!dbConnected) {
    connectDB().then(() => {
      dbConnected = true;
      next();
    }).catch(err => {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please try again later.',
        error: err.message
      });
    });
  } else {
    next();
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Inventory API is running' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: 'Inventory API is running' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth Routes
app.post('/auth/register', register);
app.post('/auth/login', login);
app.get('/auth/me', protect, getMe);
app.post('/auth/logout', protect, logout);
app.post('/auth/forgotpassword', forgotPassword);
app.put('/auth/resetpassword/:resettoken', resetPassword);
app.get('/auth/settings', protect, getSettings);
app.put('/auth/settings', protect, updateSettings);

// API Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', protect, getMe);
app.post('/api/auth/logout', protect, logout);
app.post('/api/auth/forgotpassword', forgotPassword);
app.put('/api/auth/resetpassword/:resettoken', resetPassword);
app.get('/api/auth/settings', protect, getSettings);
app.put('/api/auth/settings', protect, updateSettings);

// Store Routes
app.use('/api/stores', storeRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Inventory Routes (Protected)
app.get('/inventory/categories', protect, getCategories);
app.put('/inventory/categories', protect, updateCategories);
app.get('/inventory', protect, getItems);
app.post('/inventory', protect, createItem);
app.get('/inventory/:id', protect, getItem);
app.put('/inventory/:id', protect, updateItem);
app.delete('/inventory/:id', protect, deleteItem);

app.get('/api/inventory/categories', protect, getCategories);
app.put('/api/inventory/categories', protect, updateCategories);
app.get('/api/inventory', protect, getItems);
app.post('/api/inventory', protect, createItem);
app.get('/api/inventory/:id', protect, getItem);
app.put('/api/inventory/:id', protect, updateItem);
app.delete('/api/inventory/:id', protect, deleteItem);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
