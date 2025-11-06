# 🛍️ Fusion Meso Ürün İndirme ve Türkçeleştirme Rehberi

## 📋 Adımlar

### 1️⃣ Gerekli Kütüphaneleri Yükle

```bash
pip install requests beautifulsoup4 lxml
```

### 2️⃣ Ürünleri İndir (ACN Hariç)

```bash
python fetch-products-from-fusionmeso.py
```

**Ne Yapar:**
- ✅ Fusion Meso sitemap'inden tüm ürün URL'lerini çeker
- ✅ Her ürünün sayfasını ziyaret eder
- ✅ Ürün adı, açıklamaları, içerikleri toplar
- ✅ Ürün görsellerini `images/products/` klasörüne indirir
- ✅ **ACN içeren ürünleri otomatik atlar**
- ✅ Tüm veriyi `fusionmeso-products-raw.json` dosyasına kaydeder

**Çıktı:**
```
fusionmeso-products-raw.json  ← Tüm ürün bilgileri (İngilizce)
images/products/              ← Tüm ürün görselleri
```

---

### 3️⃣ Türkçeleştirme Yap

`fusionmeso-products-raw.json` dosyasını aç ve **sadece bu alanları** Türkçeleştir:

```json
{
  "name": "← BURASI (ürün adı)",
  "short_description": "← BURASI (ana açıklama)", 
  "indications": "← BURASI (kullanım alanları)",
  "active_ingredients": "← BURASI (aktif içerikler)",
  "size": "← BURASI (boyut bilgisi)",
  "ingredients": ["← BURALAR (içerik listesi)"]
}
```

**DOKUNMAYIN:**
- ❌ `url` - Orijinal site linki
- ❌ `slug` - Otomatik oluşturulan dosya adı
- ❌ `image_url` - Görsel linki
- ❌ `image_file` - **ÇOK ÖNEMLİ! Değiştirmeyin, resim eşleştirmesi bu sayede otomatik**
- ❌ `categories` - Kategori bilgisi

**Örnek Türkçeleştirme:**

```json
{
  "name": "F-XFC",                    ← AYNI KALACAK
  "short_description": "Revitalization of the skin begins with our F-XFC formula...",
  ↓ Türkçeleştir
  "short_description": "F-XFC formülümüzle cildin canlanması başlar...",
  
  "indications": "– Revitalisation.\n– Cellular nutrition.\n– Signs of skin ageing.",
  ↓ Türkçeleştir
  "indications": "– Canlandırma.\n– Hücresel beslenme.\n– Cilt yaşlanması belirtileri.",
  
  "active_ingredients": "4 Minerals, 23 amino acids, 18 vitamins...",
  ↓ Türkçeleştir
  "active_ingredients": "4 Mineral, 23 amino asit, 18 vitamin...",
  
  "ingredients": ["4 Minerals", "23 amino acids"],
  ↓ Türkçeleştir
  "ingredients": ["4 Mineral", "23 amino asit"],
  
  "image_file": "f-xfc.jpg"  ← DOKUNMA! Otomatik eşleşiyor
}
```

---

### 4️⃣ Products.json'a Dönüştür

Türkçeleştirme tamamlandıktan sonra:

```bash
python convert-to-products-json.py
```

**Ne Yapar:**
- ✅ `fusionmeso-products-raw.json` okur
- ✅ Site formatına (`data/products.json`) dönüştürür
- ✅ Eski products.json'un üzerine yazar
- ✅ Site otomatik yeni ürünleri gösterir

---

## 🎯 Sonuç

Artık sitenizde:
- ✅ **ACN hariç** tüm Fusion Meso ürünleri
- ✅ Orjinal görselleri ile
- ✅ Türkçeleştirilmiş açıklamalar ile
- ✅ Her ürünün detay sayfası
- ✅ Arama ve filtreleme çalışıyor

---

## 🔧 Sorun Giderme

### "ModuleNotFoundError: No module named 'bs4'"
```bash
pip install beautifulsoup4
```

### "ModuleNotFoundError: No module named 'lxml'"
```bash
pip install lxml
```

### Görseller inmiyor
- İnternet bağlantınızı kontrol edin
- Script tekrar çalıştırın (kaldığı yerden devam eder)

### Bazı ürünler eksik
- Script console'da hangi ürünlerde hata olduğunu gösterir
- İlgili ürünleri manuel ekleyebilirsiniz

---

## 📊 Dosya Yapısı

```
ozcanab/
├── fetch-products-from-fusionmeso.py    ← 1. Adım: Ürünleri indir
├── convert-to-products-json.py          ← 3. Adım: Formata dönüştür
├── fusionmeso-products-raw.json         ← 2. Adım: BURAYI Türkçeleştir
├── data/
│   └── products.json                    ← Final: Site buradan okur
└── images/
    └── products/
        ├── f-ha-hyaluronic-acid.jpg
        ├── f-xfc-sterile-serum.jpg
        └── ...
```

---

## ⚡ Hızlı Özet

```bash
# 1. Kütüphaneleri yükle
pip install requests beautifulsoup4 lxml

# 2. Ürünleri indir
python fetch-products-from-fusionmeso.py

# 3. fusionmeso-products-raw.json'u Türkçeleştir (manuel)

# 4. Dönüştür
python convert-to-products-json.py

# 5. Test et
http://localhost:8000/products.html
```

✨ **Tamamdır!**

