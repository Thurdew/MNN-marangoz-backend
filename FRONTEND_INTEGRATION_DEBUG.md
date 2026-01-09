# Frontend Teklif Entegrasyonu - Debug Kılavuzu

## Problem
Siteden gönderilen teklifler veritabanına kaydedilmiyor, ancak Postman'den test edildiğinde çalışıyor.

## Backend Durumu ✅
Backend tamamen çalışıyor ve doğru şekilde yapılandırılmış:
- ✅ Endpoint: `POST http://localhost:5000/api/teklif`
- ✅ CORS: `http://localhost:3000` izin veriliyor
- ✅ Validasyon: Tüm alanlar doğru şekilde kontrol ediliyor
- ✅ Database: Postman testinde veri kaydediliyor

## Test Adımları

### 1. HTML Test Formu ile Test Edin
```bash
# Test formunu tarayıcıda açın:
# Chrome/Edge: Ctrl+O veya File > Open File
# test-teklif-form.html dosyasını seçin
```

**Bu test şunu gösterecek:**
- ✅ Backend'e tarayıcıdan erişilebiliyor mu?
- ✅ CORS sorunu var mı?
- ✅ Backend doğru çalışıyor mu?

### 2. Backend'in Çalıştığından Emin Olun
```bash
npm start
```

Server başladığında şunu görmelisiniz:
```
🌍 Server: http://localhost:5000
```

### 3. Browser Console'u Kontrol Edin
Frontend'de form submit edildiğinde:
1. F12 basın (Developer Tools)
2. **Console** tab'ına gidin
3. Hata mesajlarını kontrol edin
4. **Network** tab'ına gidin
5. `teklif` request'ini bulun ve kontrol edin

## Frontend Kodundaki Muhtemel Sorunlar

### Sorun 1: API URL'i Yanlış
```typescript
// ❌ YANLIŞ
const response = await fetch('/api/teklif', {...})

// ✅ DOĞRU
const response = await fetch('http://localhost:3000/api/teklif', {...})
// veya
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teklif`, {...})
```

### Sorun 2: Veri Formatı Yanlış
Backend beklediği format:
```json
{
  "adSoyad": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "telefon": "5551234567",      // 10 haneli, sadece rakam
  "adres": "İstanbul, Türkiye",
  "hizmet": "mutfak",            // KÜÇÜK HARF: mutfak, gardirop, vestiyer, tv
  "genislik": 3.5,               // METRE cinsinden (cm değil!)
  "yukseklik": 2.4,              // METRE cinsinden
  "derinlik": 0.6,               // METRE cinsinden
  "malzeme": "mdf",              // KÜÇÜK HARF: sunta veya mdf
  "ekOzellikler": ["cnc"],       // Array: cnc ve/veya ayna
  "cekmeceAdedi": 4,             // 0-20 arası sayı
  "notlar": "Özel notlar"
}
```

### Sorun 3: Hizmet İsimleri Eşleşmiyor
Frontend'de "Mutfak Dolabı" gibi isimler kullanılıyorsa, backend'e göndermeden önce dönüştürülmeli:

```typescript
const hizmetMap = {
  'Mutfak Dolabı': 'mutfak',
  'Mutfak': 'mutfak',
  'Gardirop': 'gardirop',
  'Vestiyer': 'vestiyer',
  'TV Ünitesi': 'tv',
  'TV': 'tv'
};

const hizmet = hizmetMap[formValues.hizmet] || formValues.hizmet.toLowerCase();
```

### Sorun 4: Ölçüler CM'den Metre'ye Çevrilmemiş
```typescript
// ❌ YANLIŞ (cm olarak gönderiliyor)
genislik: values.genislik

// ✅ DOĞRU (metre'ye çevir)
genislik: values.genislik / 100
```

### Sorun 5: Telefon Formatı Yanlış
Backend sadece 10 haneli rakam bekliyor:
```typescript
// ❌ YANLIŞ
telefon: "+90 555 123 4567"
telefon: "0555 123 4567"

// ✅ DOĞRU
telefon: "5551234567"

// Düzeltme:
const telefonTemiz = values.telefon.replace(/\D/g, '').slice(-10);
```

## Doğru Frontend handleSubmit Kodu

```typescript
const handleSubmit = async (values: any) => {
  try {
    setLoading(true);

    // Veri dönüşümleri
    const hizmetMap: Record<string, string> = {
      'Mutfak Dolabı': 'mutfak',
      'Mutfak': 'mutfak',
      'Gardirop': 'gardirop',
      'Vestiyer': 'vestiyer',
      'TV Ünitesi': 'tv',
      'TV': 'tv'
    };

    const teklifData = {
      adSoyad: values.adSoyad,
      email: values.email,
      telefon: values.telefon.replace(/\D/g, '').slice(-10), // Sadece rakamlar, son 10 hane
      adres: values.adres,
      hizmet: hizmetMap[values.hizmet] || values.hizmet.toLowerCase(),
      genislik: parseFloat(values.genislik) / 100,  // cm -> metre
      yukseklik: parseFloat(values.yukseklik) / 100, // cm -> metre
      derinlik: parseFloat(values.derinlik) / 100,   // cm -> metre
      malzeme: values.malzeme.toLowerCase(), // "MDF" -> "mdf"
      ekOzellikler: values.ekOzellikler || [],
      cekmeceAdedi: parseInt(values.cekmeceAdedi) || 0,
      notlar: values.notlar || ''
    };

    console.log('Gönderilecek veri:', teklifData);

    // API çağrısı
    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teklifData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Teklif gönderilirken hata oluştu');
    }

    console.log('Backend response:', data);

    // Başarılı mesaj
    alert(data.message || 'Teklifiniz başarıyla gönderildi!');

    // Formu resetle
    // form.resetFields(); veya başka reset mantığı

  } catch (error) {
    console.error('Teklif gönderme hatası:', error);
    alert('Bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    setLoading(false);
  }
};
```

## Next.js API Proxy Kullanımı (Önerilen)

Eğer Next.js kullanıyorsanız, doğrudan backend'e istek atmak yerine API route kullanın:

### 1. API Route Oluşturun: `app/api/teklif/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
```

### 2. Frontend'den API Route'a İstek Atın
```typescript
// ✅ Bu yöntemle CORS problemi olmaz
const response = await fetch('/api/teklif', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(teklifData)
});
```

## Validasyon Hataları

Backend'den dönen validasyon hatalarını görmek için:

```typescript
const response = await fetch('http://localhost:5000/api/teklif', {...});
const data = await response.json();

if (!response.ok) {
  console.error('Validasyon hataları:', data.errors);
  // data.errors dizisini kullanarak hataları gösterin
}
```

## Kontrol Listesi

- [ ] Backend çalışıyor mu? (`npm start`)
- [ ] Test HTML formu çalışıyor mu?
- [ ] Browser console'da hata var mı?
- [ ] Network tab'da request gidiyor mu?
- [ ] Request body doğru formatta mı?
- [ ] Hizmet isimleri küçük harf mi? (mutfak, gardirop, vestiyer, tv)
- [ ] Malzeme küçük harf mi? (sunta, mdf)
- [ ] Ölçüler metre cinsinden mi?
- [ ] Telefon 10 haneli ve sadece rakam mı?
- [ ] Frontend URL doğru mu? (http://localhost:5000/api/teklif)

## Hala Çalışmıyorsa

1. Backend loglarını kontrol edin:
```bash
# Terminal'de backend çalıştığı pencerede hatalar görünecektir
```

2. MongoDB'un çalıştığından emin olun:
```bash
# MongoDB Compass'ta bağlantıyı kontrol edin
```

3. Postman ile tekrar test edin ve çalıştığını doğrulayın

4. Browser'da F12 > Network > teklif request'ine tıklayın:
   - **Request URL**: Doğru mu?
   - **Request Headers**: Content-Type: application/json var mı?
   - **Request Payload**: Veriler doğru formatta mı?
   - **Response**: Ne dönüyor?

## Destek

Sorun devam ederse, şunları paylaşın:
1. Browser console'daki tam hata mesajı
2. Network tab'daki request detayları
3. Frontend handleSubmit kodunun tam hali
4. Backend terminal'deki log çıktısı
