# Logo Boyut Bilgileri

## İdeal Logo Boyutları

### Desktop (Ana Kullanım)
- **Genişlik**: 350-400px
- **Yükseklik**: 90-100px
- **Aspect Ratio**: ~4:1 (yatay format)
- **Format**: SVG (önerilen) veya PNG (yüksek çözünürlük)

### Tablet (768px - 1024px)
- **Genişlik**: 280-300px
- **Yükseklik**: 70-75px

### Mobil (576px ve altı)
- **Genişlik**: 200-260px
- **Yükseklik**: 45-65px

### Çok Küçük Ekranlar (326px ve altı)
- **Genişlik**: 180-200px
- **Yükseklik**: 40-45px

## Önerilen SVG Canvas Boyutu

**Ana Canvas**: **400x100px** (veya **800x200px** yüksek çözünürlük için)

Bu boyut:
- Tüm ekran boyutlarında ölçeklenebilir
- Header'da düzgün görünür
- Retina ekranlarda keskin kalır

## Logo Tasarım Notları

1. **Yuvarlak Simge**: Sol tarafta, yaklaşık 80-90px çapında
2. **Yazı**: Sağ tarafta, cursive/script font ile "naturamenti"
3. **Renkler**: 
   - Simge: Turuncu (#FF6B35 veya benzeri)
   - Yazı: Koyu mor/plum (#6B2C91 veya benzeri)
4. **Boşluklar**: Simge ve yazı arasında yeterli boşluk (20-30px)

## CSS'te Kullanım

Logo şu şekilde kullanılıyor:
```css
.logo-img {
    height: 90px;
    width: auto;
    max-width: 350px;
}
```

SVG kullanırsanız, `width` ve `height` attribute'larını SVG içinde tanımlayın:
```svg
<svg width="400" height="100" viewBox="0 0 400 100">
```

## Dosya Formatı Önerileri

1. **SVG** (Önerilen): 
   - Vektör formatı, her boyutta keskin
   - Küçük dosya boyutu
   - Kolay düzenlenebilir

2. **PNG** (Alternatif):
   - 800x200px veya 1600x400px (2x retina için)
   - Şeffaf arka plan
   - Yüksek kalite (90-100%)

## Örnek SVG Şablonu

`logo-template.svg` dosyasında bir şablon bulunmaktadır. Bu şablonu kendi logonuzla değiştirebilirsiniz.
