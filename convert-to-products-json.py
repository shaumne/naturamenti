#!/usr/bin/env python3
"""
Türkçeleştirilmiş fusionmeso-products-raw.json'u
products.json formatına dönüştür
"""

import json
import os

INPUT_FILE = "fusionmeso-products-raw.json"
OUTPUT_FILE = "data/products.json"

def convert_to_products_format(raw_products):
    """Ham veriyi products.json formatına dönüştür"""
    
    converted_products = []
    
    for i, product in enumerate(raw_products, 1):
        # Görsel yolu - image_file varsa kullan
        image_file = product.get('image_file', '')
        if image_file:
            image_path = f"images/products/{image_file}"
        else:
            # Fallback: ürün adından oluştur
            name_slug = product.get('slug', f'product-{i}')
            image_path = f"images/products/{name_slug}.jpg"
        
        # İçerikler - ingredients dizisini kullan
        ingredients = product.get('ingredients', [])
        
        # Kategori belirle (opsiyonel - categorisiz istendi ama data'da tutabiliriz)
        category = ""
        if product.get('categories'):
            category = product['categories'][0] if product['categories'] else ""
        
        # Faydalar - indications'dan çıkar
        benefits = []
        indications = product.get('indications', '')
        if indications:
            # Satır satır ayır
            benefit_lines = [line.strip() for line in indications.split('\n') if line.strip()]
            # Tire veya nokta ile başlayanları temizle
            benefits = [line.lstrip('–-•.').strip() for line in benefit_lines if line.strip()]
        
        # Badge - yeni ürünler için
        badge = ""
        if i <= 10:  # İlk 10 ürün "Yeni" olsun
            badge = "Yeni"
        
        # Long description - tüm bilgileri birleştir
        long_desc = product.get('short_description', '')
        if product.get('indications'):
            long_desc += f"\n\nEndikasyonlar: {product.get('indications')}"
        if product.get('size'):
            long_desc += f"\n\nBoyut: {product.get('size')}"
        
        converted = {
            "id": i,
            "name": product.get('name', 'Ürün'),
            "shortDesc": product.get('short_description', ''),
            "longDesc": long_desc.strip(),
            "category": category,
            "image": image_path,
            "badge": badge,
            "ingredients": ingredients[:15],  # Maksimum 15 içerik
            "benefits": benefits[:10],  # Maksimum 10 fayda
            "usage": product.get('size', '')  # Size bilgisini usage olarak kullan
        }
        
        converted_products.append(converted)
    
    return converted_products

def main():
    """Ana fonksiyon"""
    print("=" * 70)
    print("PRODUCTS.JSON DONUSTURUCU")
    print("=" * 70)
    print()
    
    # 1. Ham veriyi oku
    if not os.path.exists(INPUT_FILE):
        print(f"[HATA] {INPUT_FILE} bulunamadı!")
        print(f"       Once 'python fetch-products-from-fusionmeso.py' calistirin")
        return
    
    print(f"[OKUMA] {INPUT_FILE}")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        raw_products = json.load(f)
    
    print(f"[INFO] {len(raw_products)} urun okundu")
    
    # 2. Dönüştür
    print(f"[DONUSTURME] Products.json formatına cevriliyor...")
    converted = convert_to_products_format(raw_products)
    
    # 3. Kaydet
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    print(f"[KAYIT] {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(converted, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 70)
    print(f"[OK] {len(converted)} urun basariyla kaydedildi!")
    print("=" * 70)
    print()
    print("SONUC:")
    print(f"  - {OUTPUT_FILE} hazir")
    print(f"  - Site otomatik olarak yeni urunleri gosterecek")
    print(f"  - http://localhost:8000/products.html adresinde test edin")
    print()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n[HATA] {str(e)}")

