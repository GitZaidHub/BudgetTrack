const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const aiRoutes = require('./routes/ai');
const paymentRoutes = require('./routes/payment');
const premiumRoutes = require('./routes/premium');
const passwordRoutes = require('./routes/password');
const { generalRateLimiter } = require('./middleware/rateLimiter');
const app = express();
app.use(express.json());
app.use(generalRateLimiter);

// Security headers
// Helmet's defaults are appropriate here since this server only
// serves JSON, not HTML — no CSP customization needed for an API.
app.use(helmet());


// CORS — only allow requests from the React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/health', healthRoutes);


// Request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/health', healthRoutes);

// 404 handler — catches any route not matched above
app.use((req, res) => {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.url} not found` } });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;