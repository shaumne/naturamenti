#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fusion Meso Ingredients Scraper - Gelişmiş Versiyon
Belirtilen sayfadan aktif içerikleri çeker ve JSON formatında kaydeder
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from typing import List, Dict, Optional

def clean_text(text: str) -> str:
    """Metni temizle ve normalize et"""
    if not text:
        return ""
    # Fazla boşlukları temizle
    text = re.sub(r'\s+', ' ', text)
    # Başta ve sonda boşlukları kaldır
    text = text.strip()
    # Özel karakterleri temizle
    text = text.replace('\xa0', ' ')  # Non-breaking space
    return text

def extract_source(text: str) -> str:
    """Kaynak bilgisini çıkar"""
    text_lower = text.lower()
    if 'natural' in text_lower and 'synthesis' not in text_lower:
        return 'natural'
    elif 'synthesis' in text_lower or 'synthetic' in text_lower:
        return 'synthesis'
    elif 'bio-fermentation' in text_lower or 'bio fermentation' in text_lower:
        return 'bio-fermentation'
    return 'natural'  # Default

def extract_products(text: str) -> List[str]:
    """Ürün listesini çıkar"""
    products = []
    # "Where you can find it:" veya benzeri ifadelerden sonraki ürünleri bul
    patterns = [
        r'where you can find it[:\s]+(.+)',
        r'where you can find[:\s]+(.+)',
        r'products?[:\s]+(.+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            products_text = match.group(1)
            # Virgülle ayrılmış ürünleri bul
            products = [p.strip() for p in products_text.split(',') if p.strip()]
            break
    
    return products

def parse_ingredient_block(element) -> Optional[Dict]:
    """Bir ingredient bloğunu parse et"""
    ingredient = {
        'name': '',
        'source': 'natural',
        'description': '',
        'products': []
    }
    
    # Başlığı bul
    heading = element.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    if heading:
        ingredient['name'] = clean_text(heading.get_text())
    else:
        # İlk satırı başlık olarak al
        first_text = element.get_text().split('\n')[0]
        if len(first_text) < 100:
            ingredient['name'] = clean_text(first_text)
    
    # Tüm metni al
    full_text = clean_text(element.get_text())
    
    # Source bilgisini bul
    source_match = re.search(r'source[:\s]+([^\n.]+)', full_text, re.IGNORECASE)
    if source_match:
        ingredient['source'] = extract_source(source_match.group(1))
    
    # Ürünleri bul
    products = extract_products(full_text)
    if products:
        ingredient['products'] = products
    
    # Açıklamayı oluştur
    # Source ve products kısımlarını çıkar
    description = full_text
    
    # "Where you can find" kısmını çıkar
    description = re.sub(r'where you can find it[:\s]+.+', '', description, flags=re.IGNORECASE)
    description = re.sub(r'where you can find[:\s]+.+', '', description, flags=re.IGNORECASE)
    
    # Source kısmını çıkar
    description = re.sub(r'source[:\s]+[^\n.]+', '', description, flags=re.IGNORECASE)
    
    # Başlığı çıkar
    if ingredient['name']:
        description = description.replace(ingredient['name'], '', 1)
    
    description = clean_text(description)
    ingredient['description'] = description
    
    return ingredient if ingredient['name'] and ingredient['description'] else None

def scrape_ingredients(url: str) -> List[Dict]:
    """Fusion Meso ingredients sayfasını scrape et"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
    }
    
    try:
        print(f"Sayfa yükleniyor: {url}")
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Belirtilen selector'ı bul
        selector = 'body > div.elementor.elementor-683 > section.elementor-section.elementor-top-section.elementor-element.elementor-element-bb65e52.elementor-reverse-mobile.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default > div > div > div > div > div'
        
        print("Element aranıyor...")
        main_element = soup.select_one(selector)
        
        if not main_element:
            print("Uyarı: Belirtilen selector bulunamadı. Alternatif yöntem deneniyor...")
            # Alternatif: class'a göre bul
            main_element = soup.find('section', class_=lambda x: x and 'elementor-element-bb65e52' in x)
        
        if not main_element:
            print("Hata: İçerik bulunamadı!")
            print("Sayfanın HTML yapısını kontrol ediyorum...")
            # Debug: Sayfadaki tüm section'ları listele
            sections = soup.find_all('section', limit=10)
            print(f"Toplam {len(sections)} section bulundu")
            return []
        
        print("İçerik bulundu, parse ediliyor...")
        
        ingredients = []
        
        # Yöntem 1: Her bir ingredient'i ayrı div/section olarak bul
        # Genellikle her ingredient bir widget veya container içinde
        ingredient_containers = main_element.find_all(['div', 'section'], class_=lambda x: x and ('elementor-widget' in str(x) or 'elementor-element' in str(x)))
        
        if not ingredient_containers:
            # Yöntem 2: Tüm metni al ve başlıklara göre böl
            all_text = main_element.get_text(separator='\n')
            lines = [clean_text(line) for line in all_text.split('\n') if clean_text(line)]
            
            current_ingredient = None
            
            for line in lines:
                # Başlık kontrolü (büyük harfle başlayan, kısa satırlar, nokta ile bitmeyen)
                is_heading = (
                    len(line) < 100 and 
                    line and 
                    line[0].isupper() and 
                    not line.endswith('.') and
                    'source:' not in line.lower() and
                    'where you can find' not in line.lower()
                )
                
                if is_heading:
                    # Önceki ingredient'i kaydet
                    if current_ingredient and current_ingredient.get('description'):
                        ingredients.append(current_ingredient)
                    
                    # Yeni ingredient başlat
                    current_ingredient = {
                        'name': line,
                        'source': 'natural',
                        'description': '',
                        'products': []
                    }
                elif current_ingredient:
                    # Source kontrolü
                    if 'source:' in line.lower():
                        current_ingredient['source'] = extract_source(line)
                    # Ürün kontrolü
                    elif 'where you can find' in line.lower():
                        products = extract_products(line)
                        if products:
                            current_ingredient['products'] = products
                    # Açıklama
                    elif line and len(line) > 20:
                        if current_ingredient['description']:
                            current_ingredient['description'] += ' ' + line
                        else:
                            current_ingredient['description'] = line
            
            # Son ingredient'i ekle
            if current_ingredient and current_ingredient.get('description'):
                ingredients.append(current_ingredient)
        else:
            # Yöntem 1: Container'ları parse et
            for container in ingredient_containers:
                ingredient = parse_ingredient_block(container)
                if ingredient:
                    ingredients.append(ingredient)
        
        # Duplicate'leri temizle
        seen_names = set()
        unique_ingredients = []
        for ing in ingredients:
            if ing['name'] and ing['name'] not in seen_names:
                seen_names.add(ing['name'])
                unique_ingredients.append(ing)
        
        return unique_ingredients
        
    except requests.RequestException as e:
        print(f"Hata: Sayfa yüklenemedi - {e}")
        return []
    except Exception as e:
        print(f"Hata: {e}")
        import traceback
        traceback.print_exc()
        return []

def save_to_json(ingredients: List[Dict], filename: str = 'data/fusionmeso-ingredients-raw.json'):
    """İçerikleri JSON dosyasına kaydet"""
    import os
    os.makedirs('data', exist_ok=True)
    
    data = {
        'ingredients': ingredients,
        'total_count': len(ingredients),
        'source_url': 'https://fusionmeso.com/skincare-ingredients-retinol-vitamin-c-niacinamide-peptides/'
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ {len(ingredients)} içerik kaydedildi: {filename}")

def print_summary(ingredients: List[Dict]):
    """Özet bilgi yazdır"""
    print(f"\n{'='*60}")
    print(f"BULUNAN İÇERİKLER ({len(ingredients)} adet)")
    print(f"{'='*60}")
    
    for i, ing in enumerate(ingredients, 1):
        print(f"\n{i}. {ing['name']}")
        print(f"   Kaynak: {ing['source']}")
        desc_preview = ing['description'][:80] + '...' if len(ing['description']) > 80 else ing['description']
        print(f"   Açıklama: {desc_preview}")
        if ing['products']:
            products_preview = ', '.join(ing['products'][:3])
            if len(ing['products']) > 3:
                products_preview += f" (+{len(ing['products'])-3} daha)"
            print(f"   Ürünler: {products_preview}")
        print("-" * 60)

def main():
    url = "https://fusionmeso.com/skincare-ingredients-retinol-vitamin-c-niacinamide-peptides/"
    
    print("=" * 60)
    print("Fusion Meso Ingredients Scraper v2")
    print("=" * 60)
    
    ingredients = scrape_ingredients(url)
    
    if ingredients:
        print_summary(ingredients)
        save_to_json(ingredients)
        
        # Ayrıca text dosyası olarak da kaydet
        text_filename = 'data/fusionmeso-ingredients-raw.txt'
        with open(text_filename, 'w', encoding='utf-8') as f:
            for ing in ingredients:
                f.write(f"\n{'='*60}\n")
                f.write(f"İÇERİK: {ing['name']}\n")
                f.write(f"KAYNAK: {ing['source']}\n")
                f.write(f"\nAÇIKLAMA:\n{ing['description']}\n")
                if ing['products']:
                    f.write(f"\nÜRÜNLER: {', '.join(ing['products'])}\n")
        print(f"\n✓ Text dosyası kaydedildi: {text_filename}")
    else:
        print("\n❌ Hiç içerik bulunamadı!")
        print("\nNot: Sayfanın yapısı değişmiş olabilir veya selector güncellenmesi gerekebilir.")

if __name__ == "__main__":
    main()

