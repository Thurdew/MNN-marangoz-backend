# Frontend - Basitleştirilmiş Kod

## ✅ Backend Güncellendi!

Backend artık **frontend'in gönderdiği formatı** doğrudan kabul ediyor. Artık frontend'de dönüşüm yapmanıza gerek yok!

---

## 📤 Frontend'den Gönderebileceğiniz Format

```typescript
{
  adSoyad: "Ahmet Yılmaz",
  email: "ahmet@example.com",
  telefon: "5551234567",           // 10 haneli, sadece rakam
  adres: "İstanbul, Türkiye",
  hizmet: "Mutfak Dolabı",          // ✅ Artık bu format kabul ediliyor!
  genislik: 200,                    // ✅ CM cinsinden gönderebilirsiniz!
  yukseklik: 80,                    // ✅ CM cinsinden
  derinlik: 60,                     // ✅ CM cinsinden
  malzeme: "MDF",                   // ✅ Büyük harf kabul ediliyor!
  ekOzellikler: [],
  cekmeceAdedi: 3,
  notlar: "Test notu"
}
```

---

## 🎯 Backend Otomatik Dönüşümler Yapıyor

Backend şu dönüşümleri **otomatik** yapıyor:

| Gelen Veri | Backend'de Dönüştürülüyor |
|------------|---------------------------|
| `"Mutfak Dolabı"` → `"mutfak"` |
| `"Gardirop"` → `"gardirop"` |
| `"Vestiyer"` → `"vestiyer"` |
| `"TV Ünitesi"` → `"tv"` |
| `200` (cm) → `2.0` (metre) |
| `80` (cm) → `0.8` (metre) |
| `60` (cm) → `0.6` (metre) |
| `"MDF"` → `"mdf"` |
| `"Sunta"` → `"sunta"` |

---

## 💻 BASİT Frontend Kodu

Artık **hiç dönüşüm yapmadan** doğrudan gönderebilirsiniz:

```typescript
const handleSubmit = async (values: TeklifFormValues) => {
  try {
    setLoading(true);

    // Sadece telefonu temizle (10 haneli yap)
    const teklifData = {
      ...values,
      telefon: values.telefon.replace(/\D/g, '').slice(-10)
    };

    console.log('Backend\'e gönderilecek veri:', teklifData);

    // Backend'e gönder
    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teklifData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Hatalar:', data.errors);
      throw new Error(data.message || 'Bir hata oluştu');
    }

    message.success(data.message || 'Teklifiniz başarıyla gönderildi!');
    form.resetFields();

  } catch (error: any) {
    console.error('Hata:', error);
    message.error(error.message || 'Bir hata oluştu');
  } finally {
    setLoading(false);
  }
};
```

---

## 🔍 Daha Detaylı Versiyon (Önerilen)

Hata ayıklama için daha fazla log ile:

```typescript
const handleSubmit = async (values: TeklifFormValues) => {
  try {
    setLoading(true);

    // Sadece telefonu temizle
    const teklifData = {
      ...values,
      telefon: values.telefon.replace(/\D/g, '').slice(-10)
    };

    console.log('📤 Frontend\'den gönderilen veri:', teklifData);

    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teklifData)
    });

    const data = await response.json();
    console.log('📥 Backend cevabı:', data);

    if (!response.ok) {
      // Validasyon hatalarını göster
      if (data.errors && Array.isArray(data.errors)) {
        console.error('❌ Validasyon hataları:', data.errors);

        const hataMesajlari = data.errors.map((err: any) =>
          `• ${err.param}: ${err.msg}`
        ).join('\n');

        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                Form hatası:
              </div>
              {data.errors.map((err: any, i: number) => (
                <div key={i} style={{ marginLeft: 16, marginTop: 4 }}>
                  • <strong>{err.param}:</strong> {err.msg}
                </div>
              ))}
            </div>
          ),
          duration: 10
        });
      } else {
        message.error(data.message || 'Bir hata oluştu');
      }

      throw new Error(data.message);
    }

    console.log('✅ Teklif başarıyla gönderildi!');
    message.success(data.message || 'Teklifiniz başarıyla gönderildi!');
    form.resetFields();

  } catch (error: any) {
    console.error('💥 Hata:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 📋 Backend Validasyon Kuralları (Güncellenmiş)

### Kabul Edilen Değerler:

| Alan | Kabul Edilen Format | Örnek |
|------|---------------------|-------|
| **hizmet** | "Mutfak Dolabı", "Gardirop", "Vestiyer", "TV Ünitesi" (veya lowercase halleri) | "Mutfak Dolabı" ✅ |
| **genislik** | 10-5000 (cm) | 200 ✅ |
| **yukseklik** | 10-5000 (cm) | 80 ✅ |
| **derinlik** | 10-5000 (cm) | 60 ✅ |
| **malzeme** | "MDF", "Sunta" (büyük/küçük harf fark etmez) | "MDF" ✅ |
| **telefon** | 10 haneli, sadece rakam | "5551234567" ✅ |
| **ekOzellikler** | Dizi: [] veya ["cnc"], ["ayna"], ["cnc", "ayna"] | [] ✅ |
| **cekmeceAdedi** | 0-20 arası tam sayı | 3 ✅ |

---

## ⚠️ Tek Kural: Telefon

Frontend'de **sadece telefonu** 10 haneye düşürün:

```typescript
telefon: values.telefon.replace(/\D/g, '').slice(-10)
```

Bu kod:
- `"05551234567"` → `"5551234567"` ✅
- `"+90 555 123 4567"` → `"5551234567"` ✅
- `"555-123-4567"` → `"5551234567"` ✅

**Diğer her şeyi backend hallediyor!**

---

## 🚀 Özet

### ❌ Eskiden (Karmaşık)
```typescript
const teklifData = {
  ...values,
  hizmet: hizmetMap[values.hizmet],      // ❌ Mapping yapıyorduk
  genislik: values.genislik / 100,        // ❌ Dönüşüm yapıyorduk
  yukseklik: values.yukseklik / 100,      // ❌ Dönüşüm yapıyorduk
  derinlik: values.derinlik / 100,        // ❌ Dönüşüm yapıyorduk
  malzeme: values.malzeme.toLowerCase(),  // ❌ Lowercase yapıyorduk
  telefon: values.telefon.replace(/\D/g, '').slice(-10)
};
```

### ✅ Şimdi (Basit)
```typescript
const teklifData = {
  ...values,
  telefon: values.telefon.replace(/\D/g, '').slice(-10)  // ✅ Sadece bu!
};
```

**Backend geri kalanını hallediyor! 🎉**

---

## 📝 Test Etme

1. Backend'i başlatın:
```bash
npm start
```

2. Frontend'i başlatın ve formu doldurun:
   - Hizmet: "Mutfak Dolabı" seçin
   - Genişlik: 200 (cm olarak)
   - Yükseklik: 80 (cm olarak)
   - Derinlik: 60 (cm olarak)
   - Malzeme: "MDF" seçin

3. Browser Console'da (F12) logları kontrol edin

4. Backend'e gidip kaydedildiğini doğrulayın

**Artık çalışacak!** ✨
