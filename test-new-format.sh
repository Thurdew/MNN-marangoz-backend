#!/bin/bash

echo "================================"
echo "YENİ FORMAT TEST - Frontend formatı"
echo "================================"
echo ""

# Test verisi - Frontend'in gönderdiği format
TEST_DATA='{
  "adSoyad": "Test Kullanıcı",
  "email": "test@example.com",
  "telefon": "5551234567",
  "adres": "Test Adres, İstanbul",
  "hizmet": "Mutfak Dolabı",
  "genislik": 200,
  "yukseklik": 80,
  "derinlik": 60,
  "malzeme": "MDF",
  "ekOzellikler": [],
  "cekmeceAdedi": 3,
  "notlar": "Test notu"
}'

echo "📤 Gönderilen veri (Frontend formatı):"
echo "$TEST_DATA" | jq . 2>/dev/null || echo "$TEST_DATA"
echo ""
echo "Backend bu veriyi şöyle dönüştürecek:"
echo "  - hizmet: 'Mutfak Dolabı' → 'mutfak'"
echo "  - genislik: 200 (cm) → 2.0 (metre)"
echo "  - yukseklik: 80 (cm) → 0.8 (metre)"
echo "  - derinlik: 60 (cm) → 0.6 (metre)"
echo "  - malzeme: 'MDF' → 'mdf'"
echo ""

# POST request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:5000/api/teklif" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ BAŞARILI! (HTTP $HTTP_CODE)"
    echo ""
    echo "Backend cevabı:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo "❌ HATA! (HTTP $HTTP_CODE)"
    echo ""
    echo "Hata detayı:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
fi

echo ""
echo "================================"
