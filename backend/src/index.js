const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.VITE_API_URL,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 10
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


// Routes
app.use('/api/products', require('../routes/products'));
app.use('/api/auth', require('../routes/authRoutes')); // Your existing auth routes
app.use('/api/orders',require('../routes/ordersRoute'))
// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});