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

// ==================== GÜVENLİK MIDDLEWARE ====================

// Helmet - HTTP güvenlik başlıklarını yapılandırıyoruz
// Canlıda (production) resim ve API isteklerinin engellenmemesi için ayarlandı
app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS - Vercel ve Lokal erişim izinleri
const allowedOrigins = [
    'https://mnn-seven.vercel.app', // Sizin Vercel linkiniz
    'http://localhost:3000'         // Kendi bilgisayarınızda test için
];

const corsOptions = {
    origin: function (origin, callback) {
        // origin yoksa (mobil uygulama veya araçlar) veya allowedOrigins içindeyse izin ver
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS politikası bu kaynağa izin vermiyor.'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate Limiting - Korumalar
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 200, // IP başına limiti biraz artırdık (hata almamak için)
    message: {
        success: false,
        message: 'Çok fazla istek gönderdiniz. Lütfen bir süre sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

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

// ==================== STATIC FILES (Resimler) ====================

// uploads klasörüne her yerden erişim izni veriyoruz (CORS)
app.use('/uploads', cors(), express.static('uploads'));

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
        endpoints: {
            auth: '/api/auth',
            urunler: '/api/urunler',
            teklif: '/api/teklif',
            yorumlar: '/api/yorumlar'
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
    console.error('❌ UNHANDLED REJECTION!', err.message);
    server.close(() => process.exit(1));
});

module.exports = app;