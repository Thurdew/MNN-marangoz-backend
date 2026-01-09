const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Config
dotenv.config();

// Database Connection
const connectDB = require('./config/database');

// Routes
const authRoutes = require('./routes/authRoutes');
const urunRoutes = require('./routes/urunRoutes');
const galeriRoutes = require('./routes/galeriRoutes');
const siparisRoutes = require('./routes/siparisRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const yorumRoutes = require('./routes/yorumRoutes');
const teklifRoutes = require('./routes/teklifRoutes');

// Error Handling
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ==================== APP SETUP ====================

const app = express();

// ==================== GÜVENLIK MIDDLEWARE ====================

// Helmet - HTTP güvenlik başlıkları
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "http://localhost:3000", "http://localhost:5000"],
        "connect-src": ["'self'", "http://localhost:3000", "http://localhost:5000"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
} else {
  // Development: Cross-origin policy'leri kapat
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  }));
}

// CORS - Cross-Origin Resource Sharing
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting - DDoS ve brute force koruması
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum 100 istek
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==================== GENEL MIDDLEWARE ====================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==================== DATABASE CONNECTION ====================

connectDB();

// ==================== STATIC FILES ====================

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static('uploads'));

// ==================== API ROUTES ====================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server çalışıyor',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/urunler', urunRoutes);
app.use('/api/galeri', galeriRoutes);
app.use('/api/siparisler', siparisRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ayarlar', settingsRoutes);
app.use('/api/yorumlar', yorumRoutes);
app.use('/api/teklif', teklifRoutes);

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MNN Marangoz Backend API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      urunler: '/api/urunler',
      galeri: '/api/galeri',
      siparisler: '/api/siparisler',
      users: '/api/users',
      upload: '/api/upload',
      ayarlar: '/api/ayarlar',
      yorumlar: '/api/yorumlar',
      teklif: '/api/teklif',
      health: '/api/health'
    }
  });
});

// ==================== ERROR HANDLING ====================

app.use(notFound);
app.use(errorHandler);

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
  });
});

module.exports = app;