#!/bin/bash

# MNN Marangoz Backend API Test Script
# Bu script backend'in düzgün çalıştığını test eder

echo "================================================"
echo "MNN Marangoz Backend API Test"
echo "================================================"
echo ""

BASE_URL="http://localhost:5000"

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1️⃣  Health Check..."
HEALTH=$(curl -s ${BASE_URL}/api/health)
echo $HEALTH | grep -q "success" && echo -e "${GREEN}✅ Server çalışıyor${NC}" || echo -e "${RED}❌ Server çalışmıyor${NC}"
echo ""

echo "2️⃣  Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourSecurePassword123!"
  }')

echo $LOGIN_RESPONSE | jq .

# Token'ı al
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login başarısız! Token alınamadı${NC}"
  echo "Not: .env dosyasındaki admin bilgilerini kontrol edin"
  exit 1
fi

echo -e "${GREEN}✅ Login başarılı${NC}"
echo "Token (ilk 50 karakter): ${TOKEN:0:50}..."
echo ""

echo "3️⃣  GET /api/teklif - Token ile test..."
TEKLIF_RESPONSE=$(curl -s -X GET ${BASE_URL}/api/teklif \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo $TEKLIF_RESPONSE | jq .
echo $TEKLIF_RESPONSE | grep -q "success" && echo -e "${GREEN}✅ Teklif endpoint çalışıyor${NC}" || echo -e "${RED}❌ Teklif endpoint hatası${NC}"
echo ""

echo "4️⃣  POST /api/urunler - Ürün ekleme testi..."
URUN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/urunler \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "ad": "Test Ürün",
    "kod": "TEST-001",
    "kategori": "mutfak",
    "aciklama": "Test ürünü",
    "fiyat": 1000,
    "resimUrl": "https://example.com/test.jpg"
  }')

echo $URUN_RESPONSE | jq .
echo $URUN_RESPONSE | grep -q "success" && echo -e "${GREEN}✅ Ürün ekleme çalışıyor${NC}" || echo -e "${RED}❌ Ürün ekleme hatası${NC}"
echo ""

echo "5️⃣  POST /api/galeri - Galeri ekleme testi..."
GALERI_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/galeri \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "baslik": "Test İş",
    "kategori": "mutfak",
    "aciklama": "Test galeri öğesi",
    "resimler": ["https://example.com/test.jpg"],
    "tamamlanmaTarihi": "2024-01-01"
  }')

echo $GALERI_RESPONSE | jq .
echo $GALERI_RESPONSE | grep -q "success" && echo -e "${GREEN}✅ Galeri ekleme çalışıyor${NC}" || echo -e "${RED}❌ Galeri ekleme hatası${NC}"
echo ""

echo "6️⃣  Token olmadan test (401 bekleniyor)..."
NO_TOKEN_RESPONSE=$(curl -s -X GET ${BASE_URL}/api/teklif)
echo $NO_TOKEN_RESPONSE | jq .
echo $NO_TOKEN_RESPONSE | grep -q "401\|giriş" && echo -e "${GREEN}✅ Auth kontrolü çalışıyor${NC}" || echo -e "${RED}❌ Auth kontrolü çalışmıyor${NC}"
echo ""

echo "================================================"
echo "Test Tamamlandı"
echo "================================================"
