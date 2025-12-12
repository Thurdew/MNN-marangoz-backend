#!/bin/bash

echo "================================"
echo "MNN Marangoz - Teklif Endpoint Test"
echo "================================"
echo ""

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
API_URL="http://localhost:5000"

echo "1. Health Check Test..."
echo "------------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/api/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Backend çalışıyor${NC}"
else
    echo -e "${RED}✗ Backend çalışmıyor (HTTP $HTTP_CODE)${NC}"
    echo "Lütfen önce 'npm start' ile backend'i başlatın"
    exit 1
fi

echo ""
echo "2. Teklif Endpoint Test..."
echo "------------------------"

# Test verisi
TEST_DATA='{
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
}'

echo "Gönderilen veri:"
echo "$TEST_DATA" | jq . 2>/dev/null || echo "$TEST_DATA"
echo ""

# POST request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/teklif" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ Teklif başarıyla oluşturuldu (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Teklif oluşturulamadı (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Hata detayı:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
fi

echo ""
echo "3. Teklifleri Listeleme Test..."
echo "------------------------"

LIST_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/api/teklif" 2>&1)
HTTP_CODE=$(echo "$LIST_RESPONSE" | tail -n 1)
BODY=$(echo "$LIST_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    COUNT=$(echo "$BODY" | jq -r '.count' 2>/dev/null)
    echo -e "${GREEN}✓ Teklifler listelendi (HTTP $HTTP_CODE)${NC}"
    echo -e "Toplam teklif sayısı: ${YELLOW}$COUNT${NC}"
else
    echo -e "${RED}✗ Teklifler listelenemedi (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "================================"
echo "Test Tamamlandı"
echo "================================"
echo ""
echo "Sorun varsa şunları kontrol edin:"
echo "1. Backend çalışıyor mu? (npm start)"
echo "2. MongoDB çalışıyor mu?"
echo "3. .env dosyası doğru yapılandırılmış mı?"
echo ""
