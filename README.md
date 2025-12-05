# 🪵 MNN Marangoz Backend API

Modern, güvenli ve ölçeklenebilir bir marangoz atölyesi yönetim sistemi backend API'si.

## 🚀 Özellikler

### ✅ Güvenlik İyileştirmeleri
- ✔️ **JWT Authentication** - Güvenli token tabanlı kimlik doğrulama
- ✔️ **Bcrypt Şifre Hashleme** - Şifreler artık güvenli bir şekilde hash'leniyor
- ✔️ **Helmet** - HTTP güvenlik başlıkları
- ✔️ **Rate Limiting** - DDoS ve brute force koruması
- ✔️ **CORS Koruması** - Sadece belirlenen origin'lere izin
- ✔️ **Input Validation** - Express-validator ile veri doğrulama
- ✔️ **Error Handling** - Güvenli ve detaylı hata yönetimi

### 📦 Yeni Özellikler
- ✔️ **Kullanıcı Kaydı** - Yeni kullanıcı oluşturma
- ✔️ **Profil Yönetimi** - Kullanıcı profil güncelleme
- ✔️ **Şifre Değiştirme** - Güvenli şifre değiştirme
- ✔️ **Pagination** - Tüm listeleme endpoint'lerinde sayfalama
- ✔️ **Ürün Güncelleme** - PUT endpoint'i ile ürün düzenleme
- ✔️ **Sipariş Yönetimi** - Admin için tam sipariş yönetimi
- ✔️ **Kullanıcı Yönetimi** - Admin için kullanıcı CRUD operasyonları
- ✔️ **Arama & Filtreleme** - Ürünlerde arama ve kategori filtresi
- ✔️ **İstatistikler** - Sipariş istatistikleri

### 🏗️ Mimari İyileştirmeler
- ✔️ **MVC Yapısı** - Controllers, Routes, Middleware ayrımı
- ✔️ **Modüler Kod** - Her özellik ayrı dosyalarda
- ✔️ **Clean Code** - SOLID prensipleri
- ✔️ **Error Handling Middleware** - Merkezi hata yönetimi
- ✔️ **Response Helpers** - Tutarlı API response'ları
- ✔️ **Async Handler** - Try-catch bloklarını otomatikleştirme

## 📁 Proje Yapısı

```
MNN-marangoz-backend/
├── config/
│   └── database.js          # MongoDB bağlantısı
├── controllers/
│   ├── authController.js    # Auth işlemleri
│   ├── urunController.js    # Ürün CRUD
│   ├── galeriController.js  # Galeri CRUD
│   ├── siparisController.js # Sipariş yönetimi
│   └── userController.js    # Kullanıcı yönetimi
├── middleware/
│   ├── auth.js              # JWT doğrulama
│   ├── validators.js        # Input validation
│   └── errorHandler.js      # Hata yönetimi
├── models/
│   ├── User.js              # Kullanıcı modeli (bcrypt)
│   ├── Urun.js              # Ürün modeli
│   ├── Siparis.js           # Sipariş modeli
│   └── Galeri.js            # Galeri modeli
├── routes/
│   ├── authRoutes.js        # Auth routes
│   ├── urunRoutes.js        # Ürün routes
│   ├── galeriRoutes.js      # Galeri routes
│   ├── siparisRoutes.js     # Sipariş routes
│   └── userRoutes.js        # User routes
├── utils/
│   ├── AppError.js          # Custom error class
│   ├── asyncHandler.js      # Async wrapper
│   └── responseHelper.js    # Response helpers
├── .env                     # Ortam değişkenleri
├── server.js                # Ana sunucu
└── package.json
```

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarla
`.env` dosyasını düzenleyin:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=24h

# Frontend
FRONTEND_URL=http://localhost:3000

# Bcrypt
BCRYPT_SALT_ROUNDS=10
```

**ÖNEMLİ:** `JWT_SECRET`'i üretim ortamında güçlü bir değerle değiştirin!

### 3. Sunucuyu Başlat

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/register` | Yeni kullanıcı kaydı | Public |
| POST | `/login` | Kullanıcı girişi | Public |
| GET | `/me` | Mevcut kullanıcı bilgisi | Private |
| POST | `/logout` | Çıkış yap | Private |

### 🛍️ Ürünler (`/api/urunler`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/` | Tüm ürünleri listele (pagination) | Public |
| GET | `/:id` | Tek ürün detayı | Public |
| GET | `/kategori/:kategori` | Kategoriye göre ürünler | Public |
| POST | `/` | Yeni ürün ekle | Admin |
| PUT | `/:id` | Ürün güncelle | Admin |
| DELETE | `/:id` | Ürün sil | Admin |

**Query Params:**
- `page` - Sayfa numarası (default: 1)
- `limit` - Sayfa başına kayıt (default: 10)
- `kategori` - Kategori filtresi
- `search` - Arama terimi

### 🖼️ Galeri (`/api/galeri`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/` | Tüm galeri öğeleri (pagination) | Public |
| GET | `/:id` | Tek galeri öğesi | Public |
| GET | `/kategori/:kategori` | Kategoriye göre işler | Public |
| POST | `/` | Galeri öğesi ekle | Admin |
| PUT | `/:id` | Galeri öğesi güncelle | Admin |
| DELETE | `/:id` | Galeri öğesi sil | Admin |

### 📦 Siparişler (`/api/siparisler`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/` | Yeni sipariş oluştur | Public |
| GET | `/` | Tüm siparişler (pagination) | Admin |
| GET | `/:id` | Tek sipariş detayı | Admin |
| GET | `/durum/:durum` | Duruma göre siparişler | Admin |
| GET | `/istatistik` | Sipariş istatistikleri | Admin |
| PUT | `/:id` | Sipariş güncelle | Admin |
| PATCH | `/:id/durum` | Sipariş durumu güncelle | Admin |
| DELETE | `/:id` | Sipariş sil | Admin |

**Sipariş Durumları:**
- `Yeni`
- `İşlemde`
- `Üretimde`
- `Tamamlandı`
- `İptal`

### 👤 Kullanıcılar (`/api/users`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/profile` | Kendi profilim | Private |
| PUT | `/profile` | Profil güncelle | Private |
| PUT | `/change-password` | Şifre değiştir | Private |
| GET | `/` | Tüm kullanıcılar | Admin |
| GET | `/:id` | Kullanıcı detayı | Admin |
| PUT | `/:id` | Kullanıcı güncelle | Admin |
| PATCH | `/:id/toggle-status` | Aktif/Pasif yap | Admin |
| DELETE | `/:id` | Kullanıcı sil | Admin |

## 🔑 Authentication

API, JWT (JSON Web Token) kullanır. Login sonrası alınan token'ı her istekte şu şekilde gönderin:

```http
Authorization: Bearer <your_jwt_token>
```

### Örnek Login İsteği:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "kullaniciAdi": "admin",
    "sifre": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "kullaniciAdi": "admin",
    "rol": "admin",
    "adSoyad": "Admin User",
    "email": "admin@example.com"
  }
}
```

## 📊 Pagination

Tüm listeleme endpoint'leri pagination destekler:

```bash
GET /api/urunler?page=2&limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Ürünler başarıyla getirildi",
  "data": {
    "data": [...],
    "pagination": {
      "total": 50,
      "page": 2,
      "limit": 20,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

## 🔒 Güvenlik Özellikleri

### Rate Limiting
- Genel API: 100 istek / 15 dakika
- Login/Register: 5 istek / 15 dakika

### CORS
`.env` dosyasında `FRONTEND_URL` ayarlayarak sadece belirli origin'e izin verebilirsiniz.

### Helmet
HTTP güvenlik başlıkları otomatik eklenir.

### Input Validation
Tüm endpoint'lerde `express-validator` ile giriş doğrulaması yapılır.

## 🐛 Hata Yönetimi

API standart hata formatı döner:

**Development:**
```json
{
  "success": false,
  "message": "Hata mesajı",
  "error": "Detaylı hata bilgisi",
  "stack": "..."
}
```

**Production:**
```json
{
  "success": false,
  "message": "Kullanıcı dostu hata mesajı"
}
```

## 📝 Değişiklik Notları

### v2.0.0 - 2024-12-04

**🔒 Güvenlik:**
- Bcrypt ile şifre hashleme eklendi
- JWT authentication implementasyonu
- Rate limiting eklendi
- Helmet güvenlik başlıkları
- Input validation (express-validator)

**✨ Yeni Özellikler:**
- Kullanıcı kaydı endpoint'i
- Profil yönetimi
- Şifre değiştirme
- Ürün güncelleme (PUT)
- Pagination tüm endpoint'lerde
- Arama ve filtreleme
- Sipariş yönetimi ve istatistikler
- Kullanıcı yönetimi (admin)

**🏗️ Mimari:**
- MVC yapısına geçiş
- Controllers oluşturuldu
- Routes ayrıldı
- Middleware'ler modülerleştirildi
- Utils klasörü eklendi
- Error handling centralized

## 🚦 Health Check

Sunucu durumunu kontrol edin:

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server çalışıyor",
  "timestamp": "2024-12-04T20:00:00.000Z",
  "environment": "development"
}
```

## 📦 Production Deployment

1. **Environment Variables:**
   - `NODE_ENV=production` ayarlayın
   - Güçlü `JWT_SECRET` kullanın
   - Gerçek MongoDB URI kullanın
   - `FRONTEND_URL`'i production URL ile değiştirin

2. **Process Manager:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "marangoz-api"
   ```

3. **Nginx Reverse Proxy:**
   ```nginx
   location /api {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

ISC

## 👨‍💻 Geliştirici

MNN Marangoz Atölyesi Backend API

---

**⚠️ ÖNEMLİ GÜVENLİK UYARILARI:**

1. **.env dosyasını asla commit etmeyin!**
2. **JWT_SECRET'i production'da değiştirin!**
3. **MongoDB URI'yi güvenli tutun!**
4. **HTTPS kullanın production'da!**
5. **Düzenli güvenlik güncellemeleri yapın!**

---

Made with ❤️ for MNN Marangoz
