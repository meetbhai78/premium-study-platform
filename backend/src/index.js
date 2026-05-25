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

// Database repair script for broken fl_attachment:false URLs
const repairMaterialUrls = async () => {
  try {
    const Material = require('./models/Material');
    const brokenMaterials = await Material.find({ fileUrl: { $regex: 'fl_attachment:false' } });
    if (brokenMaterials.length > 0) {
      console.log(`[DB Repair] Found ${brokenMaterials.length} materials with broken fl_attachment flag in URL.`);
      for (const mat of brokenMaterials) {
        const oldUrl = mat.fileUrl;
        mat.fileUrl = oldUrl.replace(/fl_attachment:false\/?/, '');
        await mat.save();
        console.log(`[DB Repair] Repaired: ${oldUrl} -> ${mat.fileUrl}`);
      }
    } else {
      console.log('[DB Repair] No broken PDF URLs found. System is clean.');
    }
  } catch (error) {
    console.error('[DB Repair Alert] Failed to run database URL repair:', error.message);
  }
};

// Run seeder and DB repairs once database connection is ready
setTimeout(() => {
  seedAdminAccount();
  repairMaterialUrls();
}, 3000);

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
  contentSecurityPolicy: false,     // Disable CSP to allow iframe cross-origin content loading
  frameguard: false,                // Disable frameguard to allow local files embedding in iframe
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
// Set cross-origin headers so PDFs/files can be loaded in iframes from different origins (dev mode)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(uploadsPath));

// API Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/payments', uploadLimiter, require('./routes/paymentRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/doubts', require('./routes/doubtRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

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
