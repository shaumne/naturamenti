#!/usr/bin/env python3
"""
products.json'daki ürünleri name.txt listesiyle karşılaştır
Eşleşmeyenleri sil
"""

import json
import os

PRODUCTS_FILE = "data/products.json"
NAME_LIST_FILE = "name.txt"

def normalize_name(name):
    """İsmi normalize et (karşılaştırma için)"""
    # Küçük harfe çevir, boşlukları temizle, özel karakterleri kaldır
    name = name.lower().strip()
    # Tire ve boşlukları normalize et
    name = name.replace('-', ' ').replace('_', ' ')
    # Birden fazla boşluğu tek boşluğa indir
    name = ' '.join(name.split())
    return name

def load_name_list():
    """name.txt dosyasından ürün isimlerini yükle"""
    with open(NAME_LIST_FILE, 'r', encoding='utf-8') as f:
        names = [line.strip() for line in f if line.strip()]
    
    # Normalize et
    normalized_names = {normalize_name(name): name for name in names}
    
    print(f"[OK] {len(names)} urun adi yuklendi")
    return normalized_names

def matches_name_list(product_name, name_list):
    """Ürün adı name.txt listesindeki herhangi biriyle eşleşiyor mu?"""
    normalized_product = normalize_name(product_name)
    
    # Tam eşleşme kontrolü
    if normalized_product in name_list:
        return True
    
    # Kısmi eşleşme kontrolü (ürün adı listedeki bir ismi içeriyor mu?)
    for normalized_list_name in name_list.keys():
        # Liste ismi ürün adında geçiyor mu?
        if normalized_list_name in normalized_product:
            return True
        # Ürün adı liste isminde geçiyor mu?
        if normalized_product in normalized_list_name:
            return True
    
    return False

def main():
    """Ana fonksiyon"""
    print("=" * 70)
    print("URUN FILTRELEME SCRIPTI")
    print("=" * 70)
    print()
    
    # 1. name.txt'yi yükle
    if not os.path.exists(NAME_LIST_FILE):
        print(f"[HATA] {NAME_LIST_FILE} bulunamadi!")
        return
    
    name_list = load_name_list()
    print(f"  Ornek isimler: {list(name_list.values())[:5]}")
    print()
    
    # 2. products.json'ı yükle
    if not os.path.exists(PRODUCTS_FILE):
        print(f"[HATA] {PRODUCTS_FILE} bulunamadi!")
        return
    
    print(f"[OKUMA] {PRODUCTS_FILE}")
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"[INFO] {len(products)} urun okundu")
    print()
    
    # 3. Eşleşen ve eşleşmeyen ürünleri ayır
    matching_products = []
    removed_products = []
    
    for product in products:
        product_name = product.get('name', '')
        
        if matches_name_list(product_name, name_list):
            matching_products.append(product)
        else:
            removed_products.append(product_name)
    
    # 4. ID'leri yeniden numaralandır
    for i, product in enumerate(matching_products, 1):
        product['id'] = i
    
    # 5. Yedek oluştur
    backup_file = PRODUCTS_FILE + '.backup'
    print(f"[YEDEK] {backup_file} olusturuluyor...")
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    # 6. Filtrelenmiş listeyi kaydet
    print(f"[KAYIT] {PRODUCTS_FILE}")
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(matching_products, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 70)
    print("SONUC:")
    print(f"  Toplam urun: {len(products)}")
    print(f"  Eslestirilen: {len(matching_products)}")
    print(f"  Silinen: {len(removed_products)}")
    print("=" * 70)
    print()
    
    if removed_products:
        print("SILINEN URUNLER:")
        for name in removed_products[:20]:  # İlk 20'sini göster
            print(f"  - {name}")
        if len(removed_products) > 20:
            print(f"  ... ve {len(removed_products) - 20} urun daha")
        print()
    
    print(f"[OK] Islem tamamlandi!")
    print(f"     Yedek: {backup_file}")
    print(f"     Yeni urun sayisi: {len(matching_products)}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n[HATA] {str(e)}")
        import traceback
        traceback.print_exc()

