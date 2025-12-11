# Frontend Teklif Formu - Kesin Çözüm

## Problem
Teklif formu backend'e veri göndermiyor. Form submit edildiğinde sadece console'a log basılıyor.

## Çözüm: İki Seçenek

### Seçenek 1: Doğrudan Backend'e İstek (Basit)

`app/teklif-al/page.tsx` dosyasında `handleSubmit` fonksiyonunu şu şekilde değiştirin:

```typescript
const handleSubmit = async (values: TeklifFormValues) => {
  try {
    setLoading(true);

    // 1. Hizmet isimlerini backend formatına çevir
    const hizmetMap: Record<string, string> = {
      'Mutfak Dolabı': 'mutfak',
      'Mutfak': 'mutfak',
      'Gardirop': 'gardirop',
      'Vestiyer': 'vestiyer',
      'TV Ünitesi': 'tv',
      'TV': 'tv'
    };

    // 2. Veriyi backend formatına dönüştür
    const teklifData = {
      adSoyad: values.adSoyad,
      email: values.email,
      telefon: values.telefon.replace(/\D/g, '').slice(-10), // Sadece rakamlar, son 10 hane
      adres: values.adres,
      hizmet: hizmetMap[values.hizmet] || values.hizmet.toLowerCase(),
      genislik: parseFloat(values.genislik) / 100,  // cm'den metre'ye çevir
      yukseklik: parseFloat(values.yukseklik) / 100,
      derinlik: parseFloat(values.derinlik) / 100,
      malzeme: values.malzeme.toLowerCase(), // "MDF" -> "mdf", "Sunta" -> "sunta"
      ekOzellikler: values.ekOzellikler || [],
      cekmeceAdedi: parseInt(values.cekmeceAdedi) || 0,
      notlar: values.notlar || ''
    };

    console.log('Backend\'e gönderilecek veri:', teklifData);

    // 3. Backend'e POST isteği gönder
    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teklifData)
    });

    const data = await response.json();
    console.log('Backend response:', data);

    // 4. Hata kontrolü
    if (!response.ok) {
      // Validasyon hataları varsa göster
      if (data.errors) {
        const errorMessages = data.errors.map((err: any) => err.msg).join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || 'Teklif gönderilirken hata oluştu');
    }

    // 5. Başarılı mesaj
    message.success(data.message || 'Teklifiniz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');

    // 6. Formu temizle
    form.resetFields();

  } catch (error: any) {
    console.error('Teklif gönderme hatası:', error);
    message.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    setLoading(false);
  }
};
```

### Seçenek 2: Next.js API Route Üzerinden (Önerilen - CORS sorunu olmaz)

#### Adım 1: API Route Oluşturun

`app/api/teklif/route.ts` dosyası oluşturun:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Frontend API route - Gelen veri:', body);

    // Backend'e ilet
    const response = await fetch(`${BACKEND_URL}/api/teklif`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Backend response:', data);

    // Backend'den gelen cevabı olduğu gibi döndür
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('API route hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Sunucu hatası: ' + error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint - Teklifleri listele (opsiyonel)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const durum = searchParams.get('durum');

    let url = `${BACKEND_URL}/api/teklif?`;
    if (limit) url += `limit=${limit}&`;
    if (durum) url += `durum=${durum}&`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

#### Adım 2: `.env.local` Dosyasına Ekleyin

```bash
BACKEND_URL=http://localhost:5000
```

#### Adım 3: Frontend'de Kullanın

`app/teklif-al/page.tsx` içindeki `handleSubmit`:

```typescript
const handleSubmit = async (values: TeklifFormValues) => {
  try {
    setLoading(true);

    // Hizmet mapping
    const hizmetMap: Record<string, string> = {
      'Mutfak Dolabı': 'mutfak',
      'Mutfak': 'mutfak',
      'Gardirop': 'gardirop',
      'Vestiyer': 'vestiyer',
      'TV Ünitesi': 'tv',
      'TV': 'tv'
    };

    // Veri hazırlama
    const teklifData = {
      adSoyad: values.adSoyad,
      email: values.email,
      telefon: values.telefon.replace(/\D/g, '').slice(-10),
      adres: values.adres,
      hizmet: hizmetMap[values.hizmet] || values.hizmet.toLowerCase(),
      genislik: parseFloat(values.genislik) / 100,
      yukseklik: parseFloat(values.yukseklik) / 100,
      derinlik: parseFloat(values.derinlik) / 100,
      malzeme: values.malzeme.toLowerCase(),
      ekOzellikler: values.ekOzellikler || [],
      cekmeceAdedi: parseInt(values.cekmeceAdedi) || 0,
      notlar: values.notlar || ''
    };

    // Next.js API route'a istek at (CORS sorunu olmaz)
    const response = await fetch('/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teklifData)
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors) {
        const errorMessages = data.errors.map((err: any) => err.msg).join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || 'Teklif gönderilirken hata oluştu');
    }

    message.success(data.message || 'Teklifiniz başarıyla gönderildi!');
    form.resetFields();

  } catch (error: any) {
    console.error('Hata:', error);
    message.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    setLoading(false);
  }
};
```

## Önemli Notlar

### 1. Veri Dönüşümleri (ÇOK ÖNEMLİ!)

| Frontend | Backend Beklentisi | Dönüşüm |
|----------|-------------------|---------|
| "Mutfak Dolabı" | "mutfak" | `hizmetMap[value]` |
| "MDF" | "mdf" | `.toLowerCase()` |
| 350 (cm) | 3.5 (metre) | `/ 100` |
| "0555 123 4567" | "5551234567" | `.replace(/\D/g, '').slice(-10)` |

### 2. Backend Validasyon Kuralları

```javascript
{
  hizmet: ['mutfak', 'gardirop', 'vestiyer', 'tv'],  // Sadece bunlar
  malzeme: ['sunta', 'mdf'],  // Sadece bunlar (küçük harf)
  ekOzellikler: ['cnc', 'ayna'],  // Array - sadece bunlar
  telefon: '5551234567',  // 10 haneli, sadece rakam
  genislik: 0.1 - 50,  // Metre cinsinden
  yukseklik: 0.1 - 50,  // Metre cinsinden
  derinlik: 0.1 - 50,  // Metre cinsinden
  cekmeceAdedi: 0 - 20  // Sayı
}
```

### 3. Form Validation (Ant Design)

Form'da validasyon kuralları ekleyin:

```typescript
<Form.Item
  label="Telefon"
  name="telefon"
  rules={[
    { required: true, message: 'Telefon gerekli' },
    {
      pattern: /^[0-9]{10}$/,
      message: 'Telefon 10 haneli olmalıdır (örn: 5551234567)'
    }
  ]}
>
  <Input placeholder="5551234567" maxLength={10} />
</Form.Item>

<Form.Item
  label="Hizmet"
  name="hizmet"
  rules={[{ required: true, message: 'Hizmet seçimi gerekli' }]}
>
  <Select>
    <Option value="Mutfak Dolabı">Mutfak Dolabı</Option>
    <Option value="Gardirop">Gardirop</Option>
    <Option value="Vestiyer">Vestiyer</Option>
    <Option value="TV Ünitesi">TV Ünitesi</Option>
  </Select>
</Form.Item>

<Form.Item
  label="Malzeme"
  name="malzeme"
  rules={[{ required: true, message: 'Malzeme seçimi gerekli' }]}
>
  <Select>
    <Option value="MDF">MDF</Option>
    <Option value="Sunta">Sunta</Option>
  </Select>
</Form.Item>
```

## Test Etme

### 1. Backend Test
```bash
cd backend-folder
npm start
```

### 2. Frontend Test
```bash
cd frontend-folder
npm run dev
```

### 3. Kontrol Listesi
- [ ] Backend çalışıyor (http://localhost:5000)
- [ ] Frontend çalışıyor (http://localhost:3000)
- [ ] Form submit ediliyor
- [ ] Browser Console'da "Backend'e gönderilecek veri" logu görünüyor
- [ ] Network tab'da POST isteği görünüyor
- [ ] İstek 201 Created dönüyor
- [ ] MongoDB'da yeni teklif kaydı var
- [ ] Admin panelinde teklif görünüyor

## Hata Ayıklama

### CORS Hatası
```
Access to fetch at 'http://localhost:5000/api/teklif' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Çözüm:** Seçenek 2'yi kullanın (Next.js API route)

### Network Error
```
TypeError: Failed to fetch
```

**Kontrol edin:**
- Backend çalışıyor mu?
- URL doğru mu? (http://localhost:5000/api/teklif)
- Firewall engellemiyor mu?

### 400 Bad Request
Backend'den gelen validasyon hatalarını kontrol edin:
```typescript
console.log('Backend response:', data);
```

### 500 Server Error
Backend terminal'indeki log'ları kontrol edin.

## Sonuç

**Hızlı Çözüm:** Seçenek 1'i kullanın (doğrudan backend'e istek)
**Profesyonel Çözüm:** Seçenek 2'yi kullanın (Next.js API route)

Her iki durumda da **veri dönüşümleri çok önemli!**
