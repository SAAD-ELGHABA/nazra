const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('../lib/mongodb.js')
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.API_URL,
  "https://nazra.store",
  "https://www.nazra.store",
  "https://nazra-eta.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://192.168.0.122:5173/"
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  exposedHeaders: ['Retry-After'],
}));

app.set("trust proxy", 1);

// Mounted before the broad legacy parsers so contact requests keep a strict body limit.
app.use('/api/contact', require('../routes/contactRoutes'));
// Auth has its own strict 8 KiB JSON parser and database guard.
app.use('/api/auth', require('../routes/authRoutes'));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "DB connection failed" });
  }
});

// Routes
app.get('/',(req,res)=>{res.send("hello nazra !")})
app.use('/api/products', require('../routes/products'));
app.use('/api/orders',require('../routes/ordersRoute'))
app.use('/api/visitors',require('../routes/visitorsRoute'))
app.use("/api/emails",require('../routes/emailsRoutes'))
app.use("/api/blog",require('../routes/blogRoutes'))

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled request error');
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=> {
  console.log(`Server running on port ${PORT}`);
});
