const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');

// Initialize database
connectDB();

// Seeder script for default Admin bootstrap
const seedAdminAccount = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@study.com').toLowerCase();
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Platform Admin',
        email: adminEmail,
        mobile: process.env.ADMIN_MOBILE || '9876543210',
        passwordHash: process.env.ADMIN_PASSWORD || 'AdminSecurePassword123',
        role: 'admin',
        premium: true,
        paymentStatus: 'approved',
      });
      console.log(`[Database Seed] Registered default administrator account successfully.`);
      console.log(`[Credentials] Email: ${adminEmail} | Password: ${process.env.ADMIN_PASSWORD || 'AdminSecurePassword123'}`);
    }
  } catch (error) {
    console.error('[Seeder Alert] Failed to bootstrap administrator account:', error.message);
  }
};

// Run seeder once DB is ready
setTimeout(seedAdminAccount, 3000);

const app = express();

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 8,
  message: { success: false, message: 'Too many login attempts. Please wait 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: { success: false, message: 'Too many upload attempts. Please try after 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin image loads for local files
}));

app.use(cors({
  origin: '*', // Allows broad connection for Android integration testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter); // Apply general rate limit to all routes

// Ensure upload folders exist
const uploadsPath = path.resolve(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Static directories serving local uploads fallback
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/payments', uploadLimiter, require('./routes/paymentRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Serve static assets if in production monolith mode
if (process.env.NODE_ENV === 'production') {
  console.log('[Monolith Engine] Mount static React client bundle from frontend/dist');
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend', 'dist', 'index.html'));
  });
}

// Fallback Route for unmatched API calls
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error Boundary]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error occurred',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Study Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Local Uploads server mounted at: http://localhost:${PORT}/uploads`);
  console.log(`========================================`);
});
