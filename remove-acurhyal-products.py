#!/usr/bin/env python3
"""
products.json'daki "Acurhyal" geçen ürünleri ve açıklaması olmayan ürünleri sil
"""

import json
import os

PRODUCTS_FILE = "data/products.json"
SEARCH_TERM = "Acurhyal"

def contains_acurhyal(product):
    """Ürünün herhangi bir alanında 'Acurhyal' geçiyor mu?"""
    search_term_lower = SEARCH_TERM.lower()
    
    # Tüm string alanlarını kontrol et
    fields_to_check = [
        product.get('name', ''),
        product.get('shortDesc', ''),
        product.get('longDesc', ''),
        product.get('category', ''),
        product.get('usage', ''),
    ]
    
    # Ingredients listesini kontrol et
    ingredients = product.get('ingredients', [])
    if isinstance(ingredients, list):
        fields_to_check.extend([str(ing) for ing in ingredients])
    
    # Benefits listesini kontrol et
    benefits = product.get('benefits', [])
    if isinstance(benefits, list):
        fields_to_check.extend([str(ben) for ben in benefits])
    
    # Tüm alanlarda ara
    for field in fields_to_check:
        if search_term_lower in str(field).lower():
            return True
    
    return False

def has_no_description(product):
    """Ürünün açıklaması var mı kontrol et"""
    short_desc = str(product.get('shortDesc', '')).strip()
    long_desc = str(product.get('longDesc', '')).strip()
    
    # Her iki açıklama da boş veya çok kısa ise (10 karakterden az)
    if len(short_desc) < 10 and len(long_desc) < 10:
        return True
    
    # Sadece boşluk, noktalama veya özel karakterler varsa
    if short_desc.replace(' ', '').replace('\r', '').replace('\n', '').replace('.', '').replace(',', '').replace('-', '') == '' and \
       long_desc.replace(' ', '').replace('\r', '').replace('\n', '').replace('.', '').replace(',', '').replace('-', '') == '':
        return True
    
    return False

def main():
    """Ana fonksiyon"""
    print("=" * 70)
    print("ACURHYAL URUNLERI VE ACİKLAMASIZ URUNLERI SILME SCRIPTI")
    print("=" * 70)
    print()
    
    # 1. products.json'ı yükle
    if not os.path.exists(PRODUCTS_FILE):
        print(f"[HATA] {PRODUCTS_FILE} bulunamadi!")
        return
    
    print(f"[OKUMA] {PRODUCTS_FILE}")
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"[INFO] {len(products)} urun okundu")
    print()
    
    # 2. Acurhyal içeren ve açıklaması olmayan ürünleri ayır
    filtered_products = []
    removed_acurhyal = []
    removed_no_desc = []
    
    for product in products:
        product_name = product.get('name', 'Bilinmeyen')
        product_id = product.get('id', 0)
        
        # Acurhyal kontrolü
        if contains_acurhyal(product):
            removed_acurhyal.append({
                'name': product_name,
                'id': product_id,
                'reason': 'Acurhyal içeriyor'
            })
            continue
        
        # Açıklama kontrolü
        if has_no_description(product):
            removed_no_desc.append({
                'name': product_name,
                'id': product_id,
                'reason': 'Açıklama yok'
            })
            continue
        
        # Her iki koşulu da sağlamıyorsa ekle
        filtered_products.append(product)
    
    # 3. ID'leri yeniden numaralandır
    for i, product in enumerate(filtered_products, 1):
        product['id'] = i
    
    # 4. Yedek oluştur
    backup_file = PRODUCTS_FILE + '.backup'
    print(f"[YEDEK] {backup_file} olusturuluyor...")
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    # 5. Filtrelenmiş listeyi kaydet
    print(f"[KAYIT] {PRODUCTS_FILE}")
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(filtered_products, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 70)
    print("SONUC:")
    print(f"  Toplam urun: {len(products)}")
    print(f"  Kalan urun: {len(filtered_products)}")
    print(f"  Silinen urun: {len(removed_acurhyal) + len(removed_no_desc)}")
    print(f"    - Acurhyal iceren: {len(removed_acurhyal)}")
    print(f"    - Aciklamasi olmayan: {len(removed_no_desc)}")
    print("=" * 70)
    print()
    
    if removed_acurhyal:
        print(f"SILINEN URUNLER ({SEARCH_TERM} iceren):")
        for item in removed_acurhyal:
            print(f"  - ID {item['id']}: {item['name']}")
        print()
    
    if removed_no_desc:
        print("SILINEN URUNLER (Aciklamasi olmayan):")
        for item in removed_no_desc:
            print(f"  - ID {item['id']}: {item['name']}")
        print()
    
    print(f"[OK] Islem tamamlandi!")
    print(f"     Yedek: {backup_file}")
    print(f"     Yeni urun sayisi: {len(filtered_products)}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n[HATA] {str(e)}")
        import traceback
        traceback.print_exc()

