# 👤 Admin Kullanıcısı Kurulum Rehberi

## 🚀 İlk Admin Kullanıcısını Oluşturma

### Yöntem 1: Script ile (Önerilen)

1. **MongoDB'nin çalıştığından emin olun**

2. **Admin oluşturma script'ini çalıştırın:**
   ```bash
   npm run create-admin
   ```

3. **Varsayılan giriş bilgileri:**
   ```
   Kullanıcı Adı: admin
   Şifre: Admin123!
   Email: admin@mnnmarangoz.com
   ```

4. **⚠️ ÖNEMLİ:** İlk girişten sonra mutlaka şifrenizi değiştirin!

### Yöntem 2: API ile Manuel Oluşturma

1. **Register endpoint'ini kullanın:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "kullaniciAdi": "admin",
       "sifre": "YeniSifre123!",
       "adSoyad": "Admin User",
       "email": "admin@example.com",
       "telefon": "5551234567"
     }'
   ```

2. **MongoDB'de rolü manuel olarak 'admin' yapın:**
   ```javascript
   // MongoDB Shell veya Compass kullanarak
   db.users.updateOne(
     { kullaniciAdi: "admin" },
     { $set: { rol: "admin" } }
   )
   ```

### Yöntem 3: MongoDB Compass ile Manuel Oluşturma

1. MongoDB Compass'ı açın
2. `marangoz_db` veritabanına gidin
3. `users` collection'ına tıklayın
4. "ADD DATA" > "Insert Document" seçin
5. Şu JSON'u yapıştırın (şifreyi bcrypt ile hash'lemeniz gerekir):
   ```json
   {
     "kullaniciAdi": "admin",
     "sifre": "$2b$10$xyz...",  // Bcrypt hash
     "rol": "admin",
     "adSoyad": "Admin User",
     "email": "admin@example.com",
     "telefon": "5551234567",
     "aktif": true,
     "olusturmaTarihi": "2024-12-10T00:00:00.000Z"
   }
   ```

---

## 🔐 Şifre Değiştirme

### 1. Giriş Yapın

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "kullaniciAdi": "admin",
    "sifre": "Admin123!"
  }'
```

**Response'dan token'ı alın:**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Şifre Değiştirin

```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "mevcutSifre": "Admin123!",
    "yeniSifre": "YeniGüvenliŞifre123!",
    "yeniSifreOnay": "YeniGüvenliŞifre123!"
  }'
```

### 3. Yeni Şifre ile Giriş Yapın

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "kullaniciAdi": "admin",
    "sifre": "YeniGüvenliŞifre123!"
  }'
```

---

## 📝 Script İçeriğini Özelleştirme

`scripts/createAdmin.js` dosyasını açıp admin bilgilerini değiştirebilirsiniz:

```javascript
const adminData = {
  kullaniciAdi: 'admin',           // İstediğiniz kullanıcı adı
  sifre: 'Admin123!',              // İstediğiniz şifre
  adSoyad: 'Admin User',           // İstediğiniz ad soyad
  email: 'admin@mnnmarangoz.com',  // İstediğiniz email
  telefon: '5551234567',           // İstediğiniz telefon
  rol: 'admin',                    // Rol: 'admin' veya 'musteri'
  aktif: true
};
```

---

## 🔑 Güvenli Şifre Önerileri

- ✅ En az 8 karakter
- ✅ Büyük ve küçük harf
- ✅ Sayılar
- ✅ Özel karakterler (!@#$%^&*)
- ❌ Kolay tahmin edilebilir şifreler kullanmayın (admin123, 12345678, vb.)

### Örnek Güvenli Şifreler:
- `Mrngz@2024!Gvnl`
- `Admin#MNN$2024`
- `Str0ng!P@ssw0rd`

---

## 🛠️ Sorun Giderme

### MongoDB'ye Bağlanamıyorum

**Hata:** `ECONNREFUSED 127.0.0.1:27017`

**Çözüm:**
1. MongoDB'nin çalıştığından emin olun:
   ```bash
   # Windows (Services)
   services.msc -> MongoDB Server başlatın

   # Linux/Mac
   sudo systemctl start mongod
   # veya
   brew services start mongodb-community
   ```

2. `.env` dosyasındaki `MONGO_URI`'yi kontrol edin:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/marangoz_db
   ```

### Kullanıcı Adı Zaten Kullanımda

**Hata:** `Bu kullanıcı adı zaten kullanımda`

**Çözüm:**
1. Script içinde farklı bir `kullaniciAdi` kullanın
2. Veya mevcut kullanıcıyı silin:
   ```javascript
   // MongoDB Shell
   db.users.deleteOne({ kullaniciAdi: "admin" })
   ```

### Şifre Çok Kısa

**Hata:** `Şifre en az 6 karakter olmalıdır`

**Çözüm:** En az 6 karakterli bir şifre kullanın (önerilen: 8+ karakter)

---

## 📚 API Endpoint'leri

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/me` - Profil bilgilerini getir (Auth gerekli)
- `POST /api/auth/logout` - Çıkış yap (Auth gerekli)

### Kullanıcı Yönetimi
- `GET /api/users/profile` - Kendi profilim (Auth gerekli)
- `PUT /api/users/profile` - Profil güncelle (Auth gerekli)
- `PUT /api/users/change-password` - Şifre değiştir (Auth gerekli)
- `GET /api/users` - Tüm kullanıcılar (Admin)
- `GET /api/users/:id` - Kullanıcı detayı (Admin)
- `PUT /api/users/:id` - Kullanıcı güncelle (Admin)
- `PATCH /api/users/:id/toggle-status` - Aktif/Pasif yap (Admin)
- `DELETE /api/users/:id` - Kullanıcı sil (Admin)

---

## ⚠️ Güvenlik Uyarıları

1. **İlk girişten sonra şifrenizi mutlaka değiştirin!**
2. **Varsayılan şifreleri (Admin123!) production'da kullanmayın!**
3. **Admin email adresini gerçek bir email ile değiştirin!**
4. **`.env` dosyasını asla commit etmeyin!**
5. **JWT_SECRET'i production'da güçlü bir değer ile değiştirin!**

---

## 💡 İpuçları

- Frontend'den giriş yapacaksanız, token'ı `localStorage` veya `sessionStorage`'da saklayın
- Her API isteğinde token'ı `Authorization: Bearer TOKEN` header'ı ile gönderin
- Token'ın süresi 24 saat (.env'de JWT_EXPIRE ile değiştirilebilir)
- Token süresi dolunca yeniden giriş yapmanız gerekir

---

Made with ❤️ for MNN Marangoz
