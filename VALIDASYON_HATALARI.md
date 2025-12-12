# Validasyon Hataları ve Çözümleri

## Backend Validasyon Kuralları

Backend `/api/teklif` endpoint'i çok sıkı validasyon kuralları uygular. İşte tüm kurallar:

### 1. ✅ adSoyad
```javascript
Kurallar:
- Boş olamaz
- 2-100 karakter arası olmalı

Örnek DOĞRU: "Ahmet Yılmaz"
Örnek YANLIŞ: "A" (çok kısa), "" (boş)
```

### 2. ✅ email
```javascript
Kurallar:
- Boş olamaz
- Geçerli email formatı olmalı

Örnek DOĞRU: "ahmet@example.com"
Örnek YANLIŞ: "ahmet", "ahmet@", "@example.com"
```

### 3. ✅ telefon (ÖNEMLİ!)
```javascript
Kurallar:
- Boş olamaz
- TAM OLARAK 10 haneli olmalı
- Sadece rakam içermeli (boşluk, tire, parantez yok!)
- Regex: /^[0-9]{10}$/

Örnek DOĞRU: "5551234567"
Örnek YANLIŞ:
  - "05551234567" (11 haneli - başında 0 var)
  - "555 123 4567" (boşluk var)
  - "555-123-4567" (tire var)
  - "(555) 123 4567" (parantez var)
  - "+90 555 123 4567" (ülke kodu var)

Frontend'de düzeltme:
const telefon = values.telefon.replace(/\D/g, '').slice(-10);
// "05551234567" → "5551234567" ✓
// "+90 555 123 4567" → "5551234567" ✓
```

### 4. ✅ adres
```javascript
Kurallar:
- Boş olamaz
- En fazla 500 karakter

Örnek DOĞRU: "Atatürk Mah. Cumhuriyet Cad. No:5 Kadıköy/İstanbul"
```

### 5. ✅ hizmet (ÖNEMLİ!)
```javascript
Kurallar:
- Boş olamaz
- SADECE şu değerlerden biri olabilir: 'mutfak', 'gardirop', 'vestiyer', 'tv'
- KÜÇÜK HARF olmalı

Örnek DOĞRU: "mutfak"
Örnek YANLIŞ:
  - "Mutfak" (büyük harf)
  - "MUTFAK" (büyük harf)
  - "Mutfak Dolabı" (farklı format)
  - "mutfak-dolabi" (tire var)

Frontend mapping:
const hizmetMap = {
  'Mutfak Dolabı': 'mutfak',
  'Mutfak': 'mutfak',
  'Gardirop': 'gardirop',
  'Vestiyer': 'vestiyer',
  'TV Ünitesi': 'tv',
  'TV': 'tv'
};
const hizmet = hizmetMap[values.hizmet] || values.hizmet.toLowerCase();
```

### 6. ✅ genislik (ÖNEMLİ!)
```javascript
Kurallar:
- Boş olamaz
- Sayı olmalı (float kabul edilir)
- 0.1 - 50 arasında olmalı
- BİRİM: METRE (cm değil!)

Örnek DOĞRU: 3.5 (metre)
Örnek YANLIŞ:
  - 350 (bu cm, backend metre bekliyor)
  - 0.05 (çok küçük - minimum 0.1)
  - 100 (çok büyük - maksimum 50)

Frontend'de cm'den metre'ye çevirme:
const genislik = parseFloat(values.genislik) / 100;
// 350 cm → 3.5 metre ✓
```

### 7. ✅ yukseklik
```javascript
Kurallar: genislik ile aynı
- 0.1 - 50 metre arası

Frontend'de:
const yukseklik = parseFloat(values.yukseklik) / 100;
```

### 8. ✅ derinlik
```javascript
Kurallar: genislik ile aynı
- 0.1 - 50 metre arası

Frontend'de:
const derinlik = parseFloat(values.derinlik) / 100;
```

### 9. ✅ malzeme (ÖNEMLİ!)
```javascript
Kurallar:
- Boş olamaz
- SADECE şu değerlerden biri: 'sunta', 'mdf'
- KÜÇÜK HARF olmalı

Örnek DOĞRU: "mdf"
Örnek YANLIŞ:
  - "MDF" (büyük harf)
  - "Mdf" (ilk harf büyük)
  - "lamine" (artık desteklenmiyor)

Frontend'de:
const malzeme = values.malzeme.toLowerCase();
// "MDF" → "mdf" ✓
```

### 10. ✅ ekOzellikler (Opsiyonel)
```javascript
Kurallar:
- Opsiyonel (gönderilmeyebilir)
- Gönderilirse DİZİ olmalı
- Sadece şu değerleri içerebilir: 'cnc', 'ayna'
- KÜÇÜK HARF olmalı

Örnek DOĞRU:
  - []
  - ["cnc"]
  - ["ayna"]
  - ["cnc", "ayna"]

Örnek YANLIŞ:
  - "cnc" (string - dizi değil)
  - ["CNC"] (büyük harf)
  - ["cnc", "led"] (led desteklenmiyor)

Frontend'de:
const ekOzellikler = values.ekOzellikler || [];
```

### 11. ✅ cekmeceAdedi (Opsiyonel)
```javascript
Kurallar:
- Opsiyonel (gönderilmeyebilir)
- Tam sayı olmalı
- 0 - 20 arası

Örnek DOĞRU: 0, 5, 20
Örnek YANLIŞ: -1, 25, 3.5 (ondalık)

Frontend'de:
const cekmeceAdedi = parseInt(values.cekmeceAdedi) || 0;
```

### 12. ✅ notlar (Opsiyonel)
```javascript
Kurallar:
- Opsiyonel
- En fazla 1000 karakter

Örnek DOĞRU: "Mutfak dolabı için özel ölçüler"
```

---

## Yaygın Validasyon Hataları ve Çözümleri

### Hata 1: "Telefon 10 haneli olmalıdır"
```
Neden: Telefon 11 haneli gönderilmiş (başında 0 var) veya boşluk/tire içeriyor

Çözüm:
const telefon = values.telefon.replace(/\D/g, '').slice(-10);

Test:
"05551234567" → "5551234567" ✓
"+90 555 123 4567" → "5551234567" ✓
"555-123-4567" → "5551234567" ✓
```

### Hata 2: "Geçersiz hizmet türü"
```
Neden: Hizmet adı "Mutfak Dolabı" veya "MUTFAK" gibi gönderilmiş

Çözüm:
const hizmetMap = {
  'Mutfak Dolabı': 'mutfak',
  'Gardirop': 'gardirop',
  'Vestiyer': 'vestiyer',
  'TV Ünitesi': 'tv'
};
const hizmet = hizmetMap[values.hizmet] || values.hizmet.toLowerCase();
```

### Hata 3: "Geçersiz malzeme türü"
```
Neden: Malzeme "MDF" veya "Sunta" gibi büyük harfle gönderilmiş

Çözüm:
const malzeme = values.malzeme.toLowerCase();
// "MDF" → "mdf" ✓
```

### Hata 4: "Genişlik 0.1-50 metre arasında olmalıdır"
```
Neden: Değer cm cinsinden gönderilmiş (örn: 350)

Çözüm:
const genislik = parseFloat(values.genislik) / 100;
// 350 cm → 3.5 metre ✓

Aynısı yukseklik ve derinlik için de geçerli
```

### Hata 5: "Ek özellikler dizi olmalıdır"
```
Neden: ekOzellikler string olarak gönderilmiş

Çözüm:
const ekOzellikler = values.ekOzellikler || [];
// Eğer checkbox'lardan topluyorsanız:
const ekOzellikler = [];
if (values.cnc) ekOzellikler.push('cnc');
if (values.ayna) ekOzellikler.push('ayna');
```

---

## Frontend'de TAM ÇÖZÜM

```typescript
const handleSubmit = async (values: TeklifFormValues) => {
  try {
    setLoading(true);

    // 1. Hizmet mapping
    const hizmetMap: Record<string, string> = {
      'Mutfak Dolabı': 'mutfak',
      'Mutfak': 'mutfak',
      'Gardirop': 'gardirop',
      'Vestiyer': 'vestiyer',
      'TV Ünitesi': 'tv',
      'TV': 'tv'
    };

    // 2. Veriyi hazırla - TÜM DÖNÜŞÜMLER
    const teklifData = {
      adSoyad: values.adSoyad.trim(),
      email: values.email.trim(),
      telefon: values.telefon.replace(/\D/g, '').slice(-10), // ⚠️ ÖNEMLİ
      adres: values.adres.trim(),
      hizmet: hizmetMap[values.hizmet] || values.hizmet.toLowerCase(), // ⚠️ ÖNEMLİ
      genislik: parseFloat(values.genislik) / 100,  // ⚠️ cm → metre
      yukseklik: parseFloat(values.yukseklik) / 100, // ⚠️ cm → metre
      derinlik: parseFloat(values.derinlik) / 100,   // ⚠️ cm → metre
      malzeme: values.malzeme.toLowerCase(), // ⚠️ ÖNEMLİ
      ekOzellikler: values.ekOzellikler || [],
      cekmeceAdedi: parseInt(values.cekmeceAdedi) || 0,
      notlar: values.notlar ? values.notlar.trim() : ''
    };

    console.log('🔍 Backend\'e gönderilecek veri:', teklifData);

    // 3. Backend'e gönder
    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teklifData)
    });

    const data = await response.json();

    // 4. Hata kontrolü
    if (!response.ok) {
      console.error('❌ Backend hatası:', data);

      // Validasyon hatalarını göster
      if (data.errors && Array.isArray(data.errors)) {
        const hataMesajlari = data.errors.map((err: any) =>
          `• ${err.param}: ${err.msg}`
        ).join('\n');

        console.error('📋 Validasyon hataları:\n', hataMesajlari);
        throw new Error('Lütfen form alanlarını kontrol edin:\n' + hataMesajlari);
      }

      throw new Error(data.message || 'Teklif gönderilirken hata oluştu');
    }

    // 5. Başarılı
    console.log('✅ Backend response:', data);
    message.success(data.message || 'Teklifiniz başarıyla gönderildi!');
    form.resetFields();

  } catch (error: any) {
    console.error('❌ Hata:', error);
    message.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    setLoading(false);
  }
};
```

---

## Debug: Validasyon Hatalarını Görmek İçin

Browser Console'da (F12) şunları kontrol edin:

```javascript
// 1. Gönderilen veri
console.log('🔍 Backend\'e gönderilecek veri:', teklifData);

// 2. Backend cevabı
console.log('✅ Backend response:', data);

// 3. Validasyon hataları (varsa)
if (data.errors) {
  console.error('📋 Validasyon hataları:', data.errors);
  data.errors.forEach(err => {
    console.error(`  - ${err.param}: ${err.msg}`);
  });
}
```

---

## Postman ile Test

Backend'in düzgün çalıştığını doğrulamak için:

```json
POST http://localhost:5000/api/teklif
Content-Type: application/json

{
  "adSoyad": "Test Kullanıcı",
  "email": "test@example.com",
  "telefon": "5551234567",
  "adres": "Test Adres, İstanbul",
  "hizmet": "mutfak",
  "genislik": 3.5,
  "yukseklik": 2.4,
  "derinlik": 0.6,
  "malzeme": "mdf",
  "ekOzellikler": ["cnc"],
  "cekmeceAdedi": 4,
  "notlar": "Test notu"
}
```

Beklenen cevap:
```json
{
  "success": true,
  "message": "Teklif talebiniz başarıyla gönderildi...",
  "data": { ... }
}
```

---

## Özet Checklist

Frontend'den backend'e göndermeden önce kontrol edin:

- [ ] telefon → 10 haneli, sadece rakam (örn: "5551234567")
- [ ] hizmet → küçük harf, sadece: mutfak, gardirop, vestiyer, tv
- [ ] malzeme → küçük harf, sadece: sunta, mdf
- [ ] genislik → METRE cinsinden (0.1-50)
- [ ] yukseklik → METRE cinsinden (0.1-50)
- [ ] derinlik → METRE cinsinden (0.1-50)
- [ ] ekOzellikler → dizi, sadece: cnc, ayna
- [ ] cekmeceAdedi → sayı (0-20)
- [ ] email → geçerli email formatı
- [ ] adSoyad → 2-100 karakter

Eğer bu kuralları takip ederseniz validasyon hatası almayacaksınız!
