#!/usr/bin/env python3
"""
Fusion Meso sitesinden ürün bilgilerini ve görsellerini indir
ACN içeren ürünler hariç, tüm ürünleri tek JSON dosyasına kaydet
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import time
import re
from urllib.parse import urlparse

# Sabitler
SITEMAP_URL = "https://fusionmeso.com/product-sitemap.xml"
OUTPUT_JSON = "fusionmeso-products-raw.json"
IMAGES_DIR = "images/products"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def create_slug(text):
    """Metinden slug oluştur (dosya adı için)"""
    # Küçük harfe çevir
    text = text.lower()
    # Özel karakterleri temizle
    text = re.sub(r'[^\w\s-]', '', text)
    # Boşlukları tire yap
    text = re.sub(r'[\s_]+', '-', text)
    # Birden fazla tireyi tek tireye indir
    text = re.sub(r'-+', '-', text)
    # Baştaki ve sondaki tireleri temizle
    text = text.strip('-')
    return text

def download_image(url, product_name):
    """Ürün görselini indir - dosya adı ürün adından oluşturulur"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        # Dosya uzantısını al
        ext = os.path.splitext(urlparse(url).path)[1]
        if not ext or ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            ext = '.jpg'
        
        # Ürün adından dosya adı oluştur
        slug = create_slug(product_name)
        filename = f"{slug}{ext}"
        filepath = os.path.join(IMAGES_DIR, filename)
        
        # Klasörü oluştur
        os.makedirs(IMAGES_DIR, exist_ok=True)
        
        # Kaydet
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"  [IMG] {filename}")
        return filename
        
    except Exception as e:
        print(f"  [HATA] Gorsel indirilemedi: {str(e)}")
        return None

def extract_product_data(url, sitemap_image_url=None):
    """Ürün sayfasından tüm bilgileri çek"""
    try:
        print(f"\n[FETCH] {url}")
        
        # Sayfayı al
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Ürün adı - elementor veya woocommerce
        title = soup.find('h1', class_='elementor-heading-title')
        if not title:
            title = soup.find('h1', class_='product_title')
        product_name = title.text.strip() if title else "Bilinmeyen Ürün"
        
        # ACN içeriyor mu kontrol et
        if 'acn' in product_name.lower():
            print(f"  [SKIP] ACN urunu atlanıyor: {product_name}")
            return None
        
        # Slug - ürün adından oluştur
        slug = create_slug(product_name)
        
        # Kısa açıklama - elementor veya woocommerce
        short_description = ""
        
        # Ana açıklama paragraflarını bul
        description_divs = soup.find_all('div', class_='elementor-widget-text-editor')
        for div in description_divs:
            text = div.get_text(strip=True)
            # Uzun açıklama olabilecek paragrafları bul
            if len(text) > 100 and 'vial' not in text.lower():
                short_description = text
                break
        
        # Woocommerce short description
        if not short_description:
            short_desc = soup.find('div', class_='woocommerce-product-details__short-description')
            short_description = short_desc.get_text(strip=True) if short_desc else ""
        
        # TAB İÇERİKLERİ (Indications, Active Ingredients, Size)
        indications = ""
        active_ingredients = ""
        size_info = ""
        
        # Elementor tabs
        tab_contents = soup.find_all('div', class_='elementor-tab-content')
        tab_titles = soup.find_all('div', class_='elementor-tab-title')
        
        for i, title_elem in enumerate(tab_titles):
            tab_title = title_elem.get_text(strip=True).lower()
            if i < len(tab_contents):
                content = tab_contents[i].get_text(strip=True)
                
                if 'indication' in tab_title:
                    indications = content
                elif 'ingredient' in tab_title or 'active' in tab_title:
                    active_ingredients = content
                elif 'size' in tab_title:
                    size_info = content
        
        # Long description oluştur
        long_description = short_description
        if indications:
            long_description += f" Indications: {indications}"
        
        # Ana görsel - Sitemap'ten gelen URL'i kullan (en doğru kaynak)
        image_url = sitemap_image_url
        
        # Sitemap'te yoksa sayfadan bulmaya çalış
        if not image_url:
            # 1. wp-post-image (WooCommerce standart)
            img_tag = soup.find('img', class_='wp-post-image')
            if img_tag:
                img_url = img_tag.get('src') or img_tag.get('data-src')
                if img_url and 'logo' not in img_url.lower():
                    image_url = img_url
            
            # 2. Elementor container background
            if not image_url:
                containers = soup.find_all('div', class_=re.compile(r'e-con'))
                for container in containers:
                    settings_str = container.get('data-settings', '')
                    if settings_str and 'background_image' in settings_str:
                        settings_str = settings_str.replace('&quot;', '"')
                        url_match = re.search(r'"url"\s*:\s*"([^"]+)"', settings_str)
                        if url_match:
                            img_url = url_match.group(1).replace('\\/', '/')
                            if 'uploads' in img_url and 'logo' not in img_url.lower():
                                image_url = img_url
                                break
            
            # 3. uploads klasöründe ürün görseli
            if not image_url:
                img_tags = soup.find_all('img')
                for img in img_tags:
                    img_url = img.get('src') or img.get('data-src')
                    if img_url and 'uploads' in img_url and 'logo' not in img_url.lower():
                        if 'f-' in img_url.lower() or 'product' in img_url.lower():
                            image_url = img_url
                            break
        
        # Görseli indir - ürün adından dosya adı oluştur
        image_filename = None
        if image_url:
            image_filename = download_image(image_url, product_name)
        
        # İçerikler (Active Ingredients)
        ingredients = []
        if active_ingredients:
            # Virgül, nokta, tire ile ayrılmış olabilir
            ingredients = [i.strip() for i in re.split(r'[,;•\n]', active_ingredients) if i.strip() and len(i.strip()) > 2]
        
        # Kategoriler
        categories = []
        category_class = soup.get('class', [])
        for cls in category_class:
            if 'product_cat-' in cls:
                cat_name = cls.replace('product_cat-', '').replace('-', ' ').title()
                categories.append(cat_name)
        
        product_data = {
            'url': url,
            'slug': slug,
            'name': product_name,
            'short_description': short_description,
            'long_description': long_description,
            'indications': indications,
            'active_ingredients': active_ingredients,
            'size': size_info,
            'image_url': image_url,
            'image_file': image_filename,
            'categories': categories,
            'ingredients': ingredients,
        }
        
        print(f"  [OK] {product_name}")
        return product_data
        
    except Exception as e:
        print(f"  [HATA] {str(e)}")
        return None

def fetch_product_urls_from_sitemap():
    """Sitemap'ten ürün URL'leri ve görsel URL'lerini çek"""
    try:
        print(f"[SITEMAP] Indiriliyor: {SITEMAP_URL}")
        response = requests.get(SITEMAP_URL, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'xml')
        
        # Sitemap yapısı:
        # <url>
        #   <loc>product-url</loc>
        #   <image:image><image:loc>image-url</image:loc></image:image>
        # </url>
        
        products = []
        for url_tag in soup.find_all('url'):
            loc = url_tag.find('loc')
            if loc and '/product/' in loc.text and loc.text != 'https://fusionmeso.com/shop/':
                product_url = loc.text
                
                # Görsel URL'ini bul
                image_url = None
                image_tag = url_tag.find('image:loc')
                if image_tag:
                    image_url = image_tag.text
                
                products.append({
                    'url': product_url,
                    'image_url': image_url
                })
        
        print(f"[INFO] {len(products)} urun bulundu (gorsel URL'leri ile)")
        return products
        
    except Exception as e:
        print(f"[HATA] Sitemap okunamadı: {str(e)}")
        return []

def main():
    """Ana fonksiyon"""
    print("=" * 70)
    print("FUSION MESO URUN INDIRME SCRIPTI")
    print("=" * 70)
    print()
    
    # 1. Sitemap'ten URL'leri ve görsel URL'lerini al
    products_from_sitemap = fetch_product_urls_from_sitemap()
    
    if not products_from_sitemap:
        print("[HATA] Urun URL'si bulunamadi!")
        return
    
    # 2. Her ürünü işle
    all_products = []
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for i, product_info in enumerate(products_from_sitemap, 1):
        print(f"\n[{i}/{len(products_from_sitemap)}] Islenıyor...")
        
        product_url = product_info['url']
        image_url = product_info.get('image_url')
        
        # Sitemap'ten gelen görsel URL'ini fonksiyona geçir
        product_data = extract_product_data(product_url, image_url)
        
        if product_data:
            all_products.append(product_data)
            success_count += 1
        else:
            # ACN ürünü mü yoksa hata mı?
            if 'acn' in product_url.lower():
                skip_count += 1
            else:
                error_count += 1
        
        # Rate limiting
        time.sleep(1)
    
    # 3. JSON'a kaydet
    print(f"\n{'=' * 70}")
    print(f"[KAYIT] {OUTPUT_JSON} dosyasına yazılıyor...")
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] {len(all_products)} urun kaydedildi")
    print()
    print("=" * 70)
    print("OZET:")
    print(f"  Basarili: {success_count}")
    print(f"  Atlanan (ACN): {skip_count}")
    print(f"  Hata: {error_count}")
    print(f"  Toplam: {len(products_from_sitemap)}")
    print("=" * 70)
    print()
    print(f"SONRAKI ADIM:")
    print(f"1. '{OUTPUT_JSON}' dosyasini acin")
    print(f"2. Her urunun aciklamalarini Turkcelestirin")
    print(f"3. 'python convert-to-products-json.py' calistirin")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[IPTAL] Kullanici tarafindan durduruldu")
    except Exception as e:
        print(f"\n[HATA] {str(e)}")

