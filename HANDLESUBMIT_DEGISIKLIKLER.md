# Frontend Düzeltmeleri - handleSubmit

## ❌ ESKİ KOD (Hatalı)

```typescript
const handleSubmit = async () => {
  // Validation
  if (!formData.adSoyad || !formData.telefon || !formData.email) {
    alert('Lütfen tüm iletişim bilgilerini doldurun.');
    return;
  }

  const payload = {
    hizmet: formData.hizmet,
    genislik: formData.genislik,
    yukseklik: formData.yukseklik,
    derinlik: formData.derinlik,
    malzeme: formData.malzeme.toLowerCase(),  // ❌ Gereksiz - backend yapıyor
    ekOzellikler: formData.ekOzellikler,
    cekmeceAdedi: formData.cekmeceAdedi,
    adSoyad: formData.adSoyad,
    telefon: formData.telefon,  // ❌ 10 haneye düşürülmemiş
    email: formData.email,
    adres: formData.adres,
    fiyatDetay: fiyatDetay,  // ❌ Backend hesaplıyor, göndermemeli
    durum: 'beklemede'  // ❌ Backend otomatik ekliyor
  };

  console.log("Gönderilen payload:", payload);

  try {
    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend hatası detayı:", data);
      throw new Error(data.message || data.error || 'Teklif gönderilirken hata oluştu');
    }

    console.log("Teklif başarıyla gönderildi:", data);
    setStep(7); // Başarı ekranına geç

  } catch (error) {
    console.error("Teklif Gönderme Hatası:", error);
    alert(error instanceof Error ? error.message : "Teklif gönderilirken bir hata oluştu.");
  }
};
```

---

## ✅ YENİ KOD (Düzeltilmiş)

```typescript
const handleSubmit = async () => {
  try {
    setLoading(true);  // ✅ Loading state ekledik

    // Validation
    if (!formData.adSoyad || !formData.telefon || !formData.email) {
      alert('Lütfen tüm iletişim bilgilerini doldurun.');
      return;
    }

    // ✅ Sadece backend'in istediği alanları gönder
    const payload = {
      adSoyad: formData.adSoyad.trim(),
      email: formData.email.trim(),
      telefon: formData.telefon.replace(/\D/g, '').slice(-10), // ✅ 10 haneli yap
      adres: formData.adres.trim(),
      hizmet: formData.hizmet,           // ✅ "Mutfak Dolabı" olduğu gibi
      genislik: formData.genislik,       // ✅ 200 (cm) olduğu gibi
      yukseklik: formData.yukseklik,     // ✅ 80 (cm) olduğu gibi
      derinlik: formData.derinlik,       // ✅ 60 (cm) olduğu gibi
      malzeme: formData.malzeme,         // ✅ "MDF" olduğu gibi
      ekOzellikler: formData.ekOzellikler,
      cekmeceAdedi: formData.cekmeceAdedi,
      notlar: formData.adres || ''
      // ❌ fiyatDetay göndermiyoruz - backend hesaplıyor
      // ❌ durum göndermiyoruz - backend otomatik 'beklemede' yapıyor
    };

    console.log('📤 Backend\'e gönderilen veri:', payload);

    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('📥 Backend cevabı:', data);

    if (!response.ok) {
      // ✅ Validasyon hatalarını detaylı göster
      if (data.errors && Array.isArray(data.errors)) {
        console.error('❌ Validasyon hataları:', data.errors);
        const hataMesajlari = data.errors.map((err: any) =>
          `${err.param}: ${err.msg}`
        ).join('\n');
        throw new Error('Form hatası:\n' + hataMesajlari);
      }
      throw new Error(data.message || 'Teklif gönderilirken hata oluştu');
    }

    console.log('✅ Teklif başarıyla gönderildi!');
    setStep(7); // Başarı ekranına geç

  } catch (error) {
    console.error('❌ Hata:', error);
    alert(error instanceof Error ? error.message : 'Teklif gönderilirken bir hata oluştu.');
  } finally {
    setLoading(false);  // ✅ Loading'i kapat
  }
};
```

---

## 🔑 Önemli Değişiklikler

### 1. ✅ Telefon 10 Haneye Düşürüldü
```typescript
// Öncesi:
telefon: formData.telefon  // "05551234567" (11 haneli) ❌

// Sonrası:
telefon: formData.telefon.replace(/\D/g, '').slice(-10)  // "5551234567" (10 haneli) ✅
```

### 2. ✅ Gereksiz Dönüşümler Kaldırıldı
Backend artık bunları yapıyor:
```typescript
// ❌ Yapma:
malzeme: formData.malzeme.toLowerCase()

// ✅ Yap:
malzeme: formData.malzeme  // Backend lowercase yapar
```

### 3. ✅ Gereksiz Alanlar Kaldırıldı
```typescript
// ❌ Gönderme:
fiyatDetay: fiyatDetay,  // Backend hesaplıyor
durum: 'beklemede'       // Backend otomatik ekliyor

// ✅ Backend zaten bunları ekliyor
```

### 4. ✅ Loading State Eklendi
```typescript
const [loading, setLoading] = useState(false);

// Buton:
<button
  onClick={handleSubmit}
  disabled={loading}  // ✅ İki kez tıklamayı engelle
  className={loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500'}
>
  {loading ? 'Gönderiliyor...' : 'Teklif Talebini Gönder'}
</button>
```

### 5. ✅ Daha İyi Hata Mesajları
```typescript
if (data.errors && Array.isArray(data.errors)) {
  console.error('❌ Validasyon hataları:', data.errors);
  const hataMesajlari = data.errors.map((err: any) =>
    `${err.param}: ${err.msg}`
  ).join('\n');
  throw new Error('Form hatası:\n' + hataMesajlari);
}
```

---

## 📦 Gönderilen Veri Formatı

```javascript
{
  "adSoyad": "Semih Yar Keçeci",
  "email": "mosemih@gmail.com",
  "telefon": "5346512771",        // ✅ 10 haneli, sadece rakam
  "adres": "içerenköy mahallesi\nözkaymak apartman",
  "hizmet": "Mutfak Dolabı",      // ✅ Türkçe, doğal format
  "genislik": 200,                // ✅ CM cinsinden
  "yukseklik": 80,                // ✅ CM cinsinden
  "derinlik": 60,                 // ✅ CM cinsinden
  "malzeme": "MDF",               // ✅ Büyük harf OK
  "ekOzellikler": [],
  "cekmeceAdedi": 3,
  "notlar": "içerenköy mahallesi\nözkaymak apartman"
}
```

Backend bunu şuna dönüştürüyor:
```javascript
{
  // ... tüm alanlar
  "hizmet": "mutfak",     // ← Backend dönüştürdü
  "genislik": 2.0,        // ← Backend dönüştürdü (200cm → 2m)
  "yukseklik": 0.8,       // ← Backend dönüştürdü (80cm → 0.8m)
  "derinlik": 0.6,        // ← Backend dönüştürdü (60cm → 0.6m)
  "malzeme": "mdf",       // ← Backend dönüştürdü
  "fiyatDetay": { ... },  // ← Backend hesapladı
  "durum": "beklemede"    // ← Backend ekledi
}
```

---

## 🎯 Test Etme

1. **Loading state'i ekleyin:**
```typescript
const [loading, setLoading] = useState(false);
```

2. **handleSubmit'i değiştirin** (yukarıdaki yeni kod ile)

3. **Formu test edin:**
   - Hizmet: "Mutfak Dolabı"
   - Genişlik: 200
   - Yükseklik: 80
   - Derinlik: 60
   - Malzeme: "MDF"
   - Telefon: Herhangi bir format (backend düzeltecek)

4. **Browser Console'u kontrol edin:**
   - "📤 Backend'e gönderilen veri" log'unu göreceksiniz
   - Hata varsa "❌ Validasyon hataları" göreceksiniz
   - Başarılı ise "✅ Teklif başarıyla gönderildi!" göreceksiniz

---

## ✨ Sonuç

Artık frontend **çok daha basit**:
- ❌ Hizmet mapping yok
- ❌ Ölçü dönüşümü yok
- ❌ Malzeme lowercase yok
- ✅ Sadece telefonu 10 haneye düşür
- ✅ Backend her şeyi hallediyor!
