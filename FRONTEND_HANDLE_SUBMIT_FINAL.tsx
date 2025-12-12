// app/teklif-al/page.tsx içindeki handleSubmit fonksiyonu
// Bu kod DETAYLI HATA MESAJLARI gösterir

const handleSubmit = async (values: TeklifFormValues) => {
  try {
    setLoading(true);

    console.log('📝 Form\'dan gelen değerler:', values);

    // 1. Hizmet mapping
    const hizmetMap: Record<string, string> = {
      'Mutfak Dolabı': 'mutfak',
      'Mutfak': 'mutfak',
      'Gardirop': 'gardirop',
      'Vestiyer': 'vestiyer',
      'TV Ünitesi': 'tv',
      'TV': 'tv'
    };

    // 2. Telefon temizleme (en yaygın hata!)
    const telefonTemiz = values.telefon.replace(/\D/g, '').slice(-10);
    console.log('📞 Telefon dönüşümü:', values.telefon, '→', telefonTemiz);

    // 3. Ölçü dönüşümleri (cm → metre)
    const genislikMetre = parseFloat(values.genislik) / 100;
    const yukseklikMetre = parseFloat(values.yukseklik) / 100;
    const derinlikMetre = parseFloat(values.derinlik) / 100;
    console.log('📏 Ölçü dönüşümleri:');
    console.log('  Genişlik:', values.genislik, 'cm →', genislikMetre, 'metre');
    console.log('  Yükseklik:', values.yukseklik, 'cm →', yukseklikMetre, 'metre');
    console.log('  Derinlik:', values.derinlik, 'cm →', derinlikMetre, 'metre');

    // 4. Hizmet dönüşümü
    const hizmetDonusturulmus = hizmetMap[values.hizmet] || values.hizmet.toLowerCase();
    console.log('🛠️ Hizmet dönüşümü:', values.hizmet, '→', hizmetDonusturulmus);

    // 5. Malzeme dönüşümü
    const malzemeDonusturulmus = values.malzeme.toLowerCase();
    console.log('🪵 Malzeme dönüşümü:', values.malzeme, '→', malzemeDonusturulmus);

    // 6. Veriyi hazırla
    const teklifData = {
      adSoyad: values.adSoyad.trim(),
      email: values.email.trim(),
      telefon: telefonTemiz,
      adres: values.adres.trim(),
      hizmet: hizmetDonusturulmus,
      genislik: genislikMetre,
      yukseklik: yukseklikMetre,
      derinlik: derinlikMetre,
      malzeme: malzemeDonusturulmus,
      ekOzellikler: values.ekOzellikler || [],
      cekmeceAdedi: parseInt(values.cekmeceAdedi) || 0,
      notlar: values.notlar ? values.notlar.trim() : ''
    };

    console.log('🔍 Backend\'e gönderilecek FINAL veri:', teklifData);
    console.log('');
    console.log('⚠️ Kontrol edin:');
    console.log('  ✓ telefon 10 haneli mi?', teklifData.telefon.length === 10);
    console.log('  ✓ hizmet küçük harf mi?', teklifData.hizmet === teklifData.hizmet.toLowerCase());
    console.log('  ✓ malzeme küçük harf mi?', teklifData.malzeme === teklifData.malzeme.toLowerCase());
    console.log('  ✓ genislik 0.1-50 arası mı?', teklifData.genislik >= 0.1 && teklifData.genislik <= 50);
    console.log('  ✓ yukseklik 0.1-50 arası mı?', teklifData.yukseklik >= 0.1 && teklifData.yukseklik <= 50);
    console.log('  ✓ derinlik 0.1-50 arası mı?', teklifData.derinlik >= 0.1 && teklifData.derinlik <= 50);
    console.log('');

    // 7. Backend'e gönder
    console.log('📤 Backend\'e istek gönderiliyor...');
    const response = await fetch('http://localhost:5000/api/teklif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teklifData)
    });

    const data = await response.json();
    console.log('📥 Backend cevabı:', data);
    console.log('📊 HTTP Status:', response.status);

    // 8. Hata kontrolü
    if (!response.ok) {
      console.error('❌ Backend hatası!');
      console.error('Status:', response.status);
      console.error('Response:', data);

      // Validasyon hatalarını detaylı göster
      if (data.errors && Array.isArray(data.errors)) {
        console.error('');
        console.error('📋 VALIDASYON HATALARI:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        data.errors.forEach((err: any, index: number) => {
          console.error(`${index + 1}. Alan: ${err.param}`);
          console.error(`   Hata: ${err.msg}`);
          console.error(`   Gönderilen değer: ${err.value}`);
          console.error('');
        });

        console.error('📖 Detaylı çözüm için VALIDASYON_HATALARI.md dosyasına bakın');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Kullanıcıya göster
        const hataMesajlari = data.errors.map((err: any) =>
          `• ${err.param}: ${err.msg}`
        ).join('\n');

        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                Lütfen form alanlarını kontrol edin:
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

        throw new Error('Validasyon hatası');
      }

      throw new Error(data.message || 'Teklif gönderilirken hata oluştu');
    }

    // 9. Başarılı!
    console.log('✅ BAŞARILI!');
    console.log('Oluşturulan teklif ID:', data.data?._id);
    console.log('');

    message.success({
      content: data.message || 'Teklifiniz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.',
      duration: 5
    });

    // Formu temizle
    form.resetFields();

  } catch (error: any) {
    console.error('💥 HATA:', error);
    console.error('Hata mesajı:', error.message);
    console.error('Hata stack:', error.stack);

    // Kullanıcıya hata mesajı göster (eğer daha önce gösterilmediyse)
    if (error.message !== 'Validasyon hatası') {
      message.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  } finally {
    setLoading(false);
    console.log('🏁 İşlem tamamlandı');
    console.log('════════════════════════════════════════════════');
  }
};

// ============================================
// ALTERNATİF: Next.js API Route kullanımı
// (CORS sorunu olursa bu yöntemi kullanın)
// ============================================

/*
// Önce app/api/teklif/route.ts oluşturun:

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API Route] Gelen veri:', body);

    const response = await fetch(`${BACKEND_URL}/api/teklif`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('[API Route] Backend cevabı:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[API Route] Hata:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Sonra handleSubmit'te fetch URL'ini değiştirin:
const response = await fetch('/api/teklif', {  // Backend URL yerine bu
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(teklifData)
});
*/

// ============================================
// FORM VALIDASYON KURALLARI
// ============================================

/*
// Form.Item'ları şu şekilde yapılandırın:

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
  <Input
    placeholder="5551234567"
    maxLength={10}
    onKeyPress={(e) => {
      // Sadece rakam girişine izin ver
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    }}
  />
</Form.Item>

<Form.Item
  label="Genişlik (cm)"
  name="genislik"
  rules={[
    { required: true, message: 'Genişlik gerekli' },
    {
      type: 'number',
      min: 10,
      max: 5000,
      message: 'Genişlik 10-5000 cm arası olmalıdır'
    }
  ]}
>
  <InputNumber
    style={{ width: '100%' }}
    placeholder="350"
    min={10}
    max={5000}
    addonAfter="cm"
  />
</Form.Item>

// Aynı şekilde yukseklik ve derinlik için de

<Form.Item
  label="Hizmet Türü"
  name="hizmet"
  rules={[{ required: true, message: 'Hizmet seçimi gerekli' }]}
>
  <Select placeholder="Seçiniz">
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
  <Select placeholder="Seçiniz">
    <Option value="MDF">MDF</Option>
    <Option value="Sunta">Sunta</Option>
  </Select>
</Form.Item>
*/
