'use client';
import { useState } from 'react';
import Link from 'next/link';

// Form verimizin yapısını tanımlıyoruz
interface FormData {
  hizmet: string;
  genislik: number;
  yukseklik: number;
  derinlik: number;
  malzeme: string;
  ekOzellikler: string[];
  cekmeceAdedi: number;
  adSoyad: string;
  telefon: string;
  email: string;
  adres: string;
}

// Hizmet seçenekleri (hizmetlere özel katsayılar eklendi)
const hizmetler = [
  { id: 'mutfak', name: 'Mutfak Dolabı', icon: '🍳', aciklama: 'Özel tasarım mutfak dolapları', katsayi: 1.3, birimFiyat: 11000 },
  { id: 'gardirop', name: 'Gardırop', icon: '👔', aciklama: 'Giyinme odası ve gardırop sistemleri', katsayi: 1.2, birimFiyat: 11000 },
  { id: 'vestiyer', name: 'Vestiyer', icon: '🚪', aciklama: 'Antre ve vestiyer çözümleri', katsayi: 1.0, birimFiyat: 11000 },
  { id: 'tv', name: 'TV Ünitesi', icon: '📺', aciklama: 'Modern TV ünite tasarımları', katsayi: 1.1, birimFiyat: 11000 },
];

// Malzeme seçenekleri (detaylandırılmış)
const malzemeler = [
  { id: 'sunta', name: 'Sunta', katsayi: 1, aciklama: 'Ekonomik ve kullanışlı', icon: '🪵', garanti: '3 yıl' },
  { id: 'mdf', name: 'MDF', katsayi: 1.2, aciklama: 'Dayanıklı ve kaliteli', icon: '🌲', garanti: '5 yıl' },
];

// Ek özellikler
const ekOzellikler = [
  { id: 'cnc', name: 'CNC İşleme', fiyat: 5000, icon: '⚙️', aciklama: 'Hassas CNC kesim ve işleme' },
  { id: 'ayna', name: 'Ayna Kaplama', fiyat: 4000, icon: '🪞', aciklama: 'Dekoratif ayna kaplama' },
];

export default function TeklifAlPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    hizmet: 'Mutfak Dolabı',
    genislik: 200,
    yukseklik: 80,
    derinlik: 60,
    malzeme: 'MDF',
    ekOzellikler: [],
    cekmeceAdedi: 3,
    adSoyad: '',
    telefon: '',
    email: '',
    adres: '',
  });
  const [tahminiFiyat, setTahminiFiyat] = useState(0);
  const [fiyatDetay, setFiyatDetay] = useState({
    temelFiyat: 0,
    malzemeFiyat: 0,
    ekOzelliklerFiyat: 0,
    cekmeceFiyat: 0,
    toplamFiyat: 0
  });
  const [loading, setLoading] = useState(false);

  // Formdaki değişikliklerini state'e kaydeder
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'genislik' || name === 'yukseklik' || name === 'derinlik' || name === 'cekmeceAdedi' ? Number(value) : value,
    }));
  };

  // Geliştirilmiş fiyat hesaplama mantığı
  const calculatePrice = () => {
    // Seçilen hizmeti bul
    const secilenHizmet = hizmetler.find(h => h.name === formData.hizmet) || hizmetler[0];

    // Seçilen malzemeyi bul
    const secilenMalzeme = malzemeler.find(m => m.name === formData.malzeme) || malzemeler[0];

    // Metrekare hesapla (genişlik * yükseklik)
    const metrekare = (formData.genislik / 100) * (formData.yukseklik / 100);

    // Derinlik katsayısı (60cm'den fazlaysa ekstra ücret)
    const derinlikKatsayisi = formData.derinlik > 60 ? 1.2 : 1.0;

    // Temel fiyat: metrekare * hizmet birim fiyat * hizmet katsayısı
    const temelFiyat = Math.round(metrekare * secilenHizmet.birimFiyat * secilenHizmet.katsayi * derinlikKatsayisi);

    // Malzeme fark fiyatı
    const malzemeFiyat = Math.round(temelFiyat * (secilenMalzeme.katsayi - 1));

    // Ek özellikler toplamı
    const ekOzelliklerFiyat = formData.ekOzellikler.reduce((toplam, ozellikId) => {
      const ozellik = ekOzellikler.find(ek => ek.id === ozellikId);
      return toplam + (ozellik ? ozellik.fiyat : 0);
    }, 0);

    // Çekmece ücreti (3 çekmece ücretsiz, sonrası her çekmece 1000 TL)
    const cekmeceFiyat = formData.cekmeceAdedi > 3 ? (formData.cekmeceAdedi - 3) * 1000 : 0;

    // Toplam fiyat
    const toplamFiyat = temelFiyat + malzemeFiyat + ekOzelliklerFiyat + cekmeceFiyat;

    setFiyatDetay({
      temelFiyat,
      malzemeFiyat,
      ekOzelliklerFiyat,
      cekmeceFiyat,
      toplamFiyat
    });

    return toplamFiyat;
  };

  // Ek özellik toggle fonksiyonu
  const toggleEkOzellik = (ozellikId: string) => {
    setFormData(prev => ({
      ...prev,
      ekOzellikler: prev.ekOzellikler.includes(ozellikId)
        ? prev.ekOzellikler.filter(id => id !== ozellikId)
        : [...prev.ekOzellikler, ozellikId]
    }));
  };

  const handleNext = () => {
    if (step === 4) {
      const fiyat = calculatePrice();
      setTahminiFiyat(fiyat);
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  // ✅ DÜZELTİLMİŞ handleSubmit - Backend formatına uygun
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.adSoyad || !formData.telefon || !formData.email) {
        alert('Lütfen tüm iletişim bilgilerini doldurun.');
        return;
      }

      // ✅ Backend'in beklediği format - Sadece gerekli alanlar
      const payload = {
        adSoyad: formData.adSoyad.trim(),
        email: formData.email.trim(),
        telefon: formData.telefon.replace(/\D/g, '').slice(-10), // ⚠️ Sadece 10 haneli rakam
        adres: formData.adres.trim(),
        hizmet: formData.hizmet,           // ✅ "Mutfak Dolabı" - Backend dönüştürecek
        genislik: formData.genislik,       // ✅ 200 (cm) - Backend dönüştürecek
        yukseklik: formData.yukseklik,     // ✅ 80 (cm) - Backend dönüştürecek
        derinlik: formData.derinlik,       // ✅ 60 (cm) - Backend dönüştürecek
        malzeme: formData.malzeme,         // ✅ "MDF" - Backend dönüştürecek
        ekOzellikler: formData.ekOzellikler,
        cekmeceAdedi: formData.cekmeceAdedi,
        notlar: formData.adres || ''
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
        // Validasyon hatalarını göster
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
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-r from-amber-50 to-white py-20 px-4">
      <div className="container mx-auto max-w-4xl">

        {/* Üst Başlık */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfaya Dön
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Ücretsiz Fiyat Teklifi
          </h1>
          <p className="text-lg text-gray-600">
            Hayalinizdeki projeyi 4 basit adımda oluşturun
          </p>
        </div>

        {/* Progress Bar */}
        {step < 7 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="flex-1 flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-bold transition-all text-sm md:text-base ${
                    step >= num
                      ? 'bg-amber-500 text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > num ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      num
                    )}
                  </div>
                  {num < 6 && (
                    <div className={`flex-1 h-1 mx-1 md:mx-2 transition-all ${
                      step > num ? 'bg-amber-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs md:text-sm text-gray-600">
              <span>Hizmet</span>
              <span>Ölçüler</span>
              <span>Malzeme</span>
              <span>Ekstralar</span>
              <span>İletişim</span>
              <span>Özet</span>
            </div>
          </div>
        )}

        {/* Ana Kart */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">

          {/* İçerik Alanı */}
          <div className="p-8 md:p-12">

            {/* Adım 1: Hizmet Seçimi */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Hangi Hizmeti İstiyorsunuz?
                  </h2>
                  <p className="text-gray-600">Size en uygun hizmeti seçin</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hizmetler.map((hizmet) => (
                    <button
                      key={hizmet.id}
                      onClick={() => setFormData({ ...formData, hizmet: hizmet.name })}
                      className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 hover:shadow-lg ${
                        formData.hizmet === hizmet.name
                          ? 'border-amber-500 bg-amber-50 shadow-md'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="text-5xl mb-3">{hizmet.icon}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {hizmet.name}
                      </h3>
                      <p className="text-sm text-gray-600">{hizmet.aciklama}</p>
                      {formData.hizmet === hizmet.name && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-amber-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Seçildi
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Diğer adımlar aynı kalacak - sadece handleSubmit değişti */}
            {/* ... (Adım 2-7 kodları aynı) ... */}

          </div>

          {/* Alt Navigasyon */}
          {step < 7 && (
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                {step > 1 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Geri
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 6 && (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ml-auto"
                  >
                    İleri
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {step === 6 && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ml-auto text-lg ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Teklif Talebini Gönder
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Yardım Bölümü */}
        {step < 7 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">Yardıma mı ihtiyacınız var?</p>
            <Link href="/iletisim" className="text-amber-600 hover:text-amber-700 font-semibold">
              Bize Ulaşın →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
