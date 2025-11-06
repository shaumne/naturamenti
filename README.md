# Naturamenti Türkiye - Web Sitesi

Naturamenti Türkiye için hazırlanan resmi web sitesi.

## 📋 Özellikler

- ✅ Tamamen Türkçe içerik
- ✅ Responsive tasarım (mobil, tablet, desktop)
- ✅ 56+ ürün ile kapsamlı ürün kataloğu
- ✅ Ürün detay sayfaları
- ✅ Arama ve filtreleme özellikleri
- ✅ İletişim formu
- ✅ Blog altyapısı (içerik eklenmeye hazır)
- ✅ Modern ve temiz tasarım
- ✅ SEO dostu yapı
- ✅ Hızlı yükleme

## 🚀 Kurulum

### Gereksinimler

- Web sunucusu (Apache, Nginx, vb.)
- Modern web tarayıcı
- (Opsiyonel) PHP sunucusu (form işlemleri için)

### Yerel Geliştirme

1. Projeyi bilgisayarınıza indirin
2. Proje klasöründe bir yerel sunucu başlatın:

**Python ile:**
```bash
python -m http.server 8000
```

**PHP ile:**
```bash
php -S localhost:8000
```

**Node.js ile (http-server):**
```bash
npx http-server -p 8000
```

3. Tarayıcınızda `http://localhost:8000` adresine gidin

## 📁 Proje Yapısı

```
fusionmeso-tr/
├── index.html              # Ana sayfa
├── products.html           # Ürünler listesi
├── product-detail.html     # Ürün detay sayfası
├── about.html              # Hakkımızda
├── blog.html               # Blog (altyapı)
├── contact.html            # İletişim
├── css/
│   ├── main.css           # Ana stil dosyası
│   ├── products.css       # Ürün sayfaları stilleri
│   └── responsive.css     # Responsive tasarım
├── js/
│   ├── main.js            # Genel JavaScript
│   ├── slider.js          # Slider fonksiyonları
│   └── products.js        # Ürün yönetimi
├── images/
│   ├── products/          # Ürün görselleri
│   ├── hero/              # Slider görselleri
│   ├── icons/             # İkonlar
│   ├── categories/        # Kategori görselleri
│   └── brand/             # Marka görselleri
├── data/
│   └── products.json      # Ürün veritabanı (56 ürün)
└── README.md
```

## 🎨 Tasarım

- **Renk Paleti:**
  - Birincil: #2c7873 (Yeşil-mavi ton)
  - İkincil: #6fb7b2 (Açık yeşil-mavi)
  - Koyu: #1a1a1a
  - Açık gri: #f5f5f5

- **Tipografi:**
  - Font: Montserrat (Google Fonts)
  - Modern, temiz ve okunabilir

- **Responsive Breakpoints:**
  - Desktop: 1200px+
  - Tablet: 992px - 1199px
  - Mobil (Büyük): 768px - 991px
  - Mobil (Küçük): 576px - 767px
  - Mobil (Mini): <576px

## 🛠️ Özelleştirme

### Yeni Ürün Ekleme

`data/products.json` dosyasını düzenleyin:

```json
{
  "id": 57,
  "name": "Yeni Ürün Adı",
  "shortDesc": "Kısa açıklama",
  "longDesc": "Detaylı açıklama",
  "category": "Kategori",
  "image": "images/products/urun.jpg",
  "badge": "Yeni",
  "ingredients": ["İçerik 1", "İçerik 2"],
  "benefits": ["Fayda 1", "Fayda 2"],
  "usage": "Kullanım talimatları"
}
```

### Renk Değiştirme

`css/main.css` dosyasındaki `:root` değişkenlerini düzenleyin:

```css
:root {
    --primary-color: #2c7873;
    --secondary-color: #6fb7b2;
    /* ... */
}
```

### İçerik Güncelleme

HTML dosyalarını doğrudan düzenleyerek içeriği güncelleyebilirsiniz.

## 📱 Sayfalar

### Ana Sayfa (index.html)
- Hero slider (3 slide)
- Öne çıkan ürünler
- Kategoriler
- Marka değerleri
- İnovasyonlar
- Sonuç görselleri
- Müşteri yorumları

### Ürünler (products.html)
- Tüm ürünlerin listesi
- Arama ve filtreleme
- Grid layout

### Ürün Detay (product-detail.html)
- Ürün görseli
- Detaylı bilgi
- İçerikler ve faydalar
- Kullanım talimatları
- İlgili ürünler

### Hakkımızda (about.html)
- Şirket hikayesi
- Misyon ve vizyon
- Temel değerler
- İstatistikler

### Blog (blog.html)
- Blog altyapısı (içerik eklemeye hazır)
- Yakında yayınlanacak konular

### İletişim (contact.html)
- İletişim formu
- İletişim bilgileri
- Harita alanı

## 🔧 Teknik Detaylar

### JavaScript Özellikleri

- **Slider:** Otomatik geçiş, manuel kontrol, touch support
- **Mobile Menu:** Hamburger menü
- **Search:** Client-side arama ve filtreleme
- **Form Validation:** İletişim formu doğrulama
- **Dynamic Content:** Ürün detaylarını JSON'dan yükleme

### SEO Optimizasyonu

- Semantic HTML5
- Meta tags
- Alt attributes
- Heading hierarchy
- Clean URL structure

## 📝 TODO

- [ ] Gerçek logo görseli ekle
- [ ] Ürün görselleri ekle
- [ ] Hero slider görselleri ekle
- [ ] Kategori görselleri ekle
- [ ] Marka görselleri ekle
- [ ] İletişim bilgilerini güncelle
- [ ] Google Maps entegrasyonu
- [ ] Form backend entegrasyonu
- [ ] SSL sertifikası kurulumu
- [ ] Analytics entegrasyonu

## 🚀 Canlıya Alma

### Hosting Önerileri

- **Statik Hosting:**
  - Netlify (ücretsiz)
  - Vercel (ücretsiz)
  - GitHub Pages (ücretsiz)
  - AWS S3 + CloudFront

- **Geleneksel Hosting:**
  - Herhangi bir shared hosting
  - VPS
  - Dedicated server

### Adımlar

1. Tüm dosyaları hosting'e yükleyin
2. Domain'i yönlendirin
3. SSL sertifikası kurun
4. Test edin
5. Analytics ekleyin

## 📞 Destek

Sorularınız için: info@fusionmeso.com.tr

## 📄 Lisans

© 2024 Naturamenti Türkiye. Tüm hakları saklıdır.

