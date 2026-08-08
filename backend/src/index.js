const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const connectDB = require('../lib/mongodb.js')
const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// Development origins are only trusted outside production. They used to be
// allowed everywhere, which let any page served from a developer's machine
// call the live API with credentials.
const developmentOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.API_URL,
  "https://nazra.store",
  "https://www.nazra.store",
  "https://nazra-eta.vercel.app",
  ...(isProduction ? [] : developmentOrigins)
].filter(Boolean);

// Sets nosniff, frameguard, HSTS and friends. The API serves JSON, not pages,
// so the content security policy is left off rather than guessed at.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));

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
// Signed media upload requests use a strict parser and keep Cloudinary secrets server-side.
app.use('/api/media', require('../routes/mediaRoutes'));

// 1 MB is generous for the JSON these routes accept. It used to be 50 MB,
// which let an unauthenticated caller push 50 MB through the public order and
// product endpoints. Media uploads are signed client-side via /api/media and
// never pass through this parser.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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

// Health check. Reports the database state, because the previous root route
// returned 200 whether or not MongoDB was reachable — an uptime monitor
// pointed at it could never see an outage.
app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});
app.use('/api/products', require('../routes/products'));
app.use('/api/orders',require('../routes/ordersRoute'))
app.use('/api/visitors',require('../routes/visitorsRoute'))
app.use("/api/emails",require('../routes/emailsRoutes'))
app.use("/api/blog",require('../routes/blogRoutes'))
app.use("/api/admin", require("../routes/adminRoutes"))

// Error handling middleware
app.use((error, req, res, next) => {
  // Log the actual error server-side — it previously logged only a fixed
  // string, which made every production 500 impossible to diagnose. The
  // response stays generic so nothing leaks to the caller.
  console.error(`Unhandled request error on ${req.method} ${req.originalUrl}:`, error);

  // A body that exceeds the parser limit surfaces here; 413 is the honest code.
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large' });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=> {
  console.log(`Server running on port ${PORT}`);
});
