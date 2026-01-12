#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fusion Meso Ingredients Scraper
Belirtilen sayfadan aktif içerikleri çeker ve JSON formatında kaydeder
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin

def clean_text(text):
    """Metni temizle ve normalize et"""
    if not text:
        return ""
    # Fazla boşlukları temizle
    text = re.sub(r'\s+', ' ', text)
    # Başta ve sonda boşlukları kaldır
    text = text.strip()
    return text

def extract_source(text):
    """Kaynak bilgisini çıkar (natural, synthesis, bio-fermentation)"""
    text_lower = text.lower()
    if 'natural' in text_lower:
        return 'natural'
    elif 'synthesis' in text_lower or 'synthetic' in text_lower:
        return 'synthesis'
    elif 'bio-fermentation' in text_lower or 'bio fermentation' in text_lower or 'fermentation' in text_lower:
        return 'bio-fermentation'
    return 'natural'  # Default

def extract_products(text):
    """Ürün listesini çıkar"""
    products = []
    # "Where you can find it:" veya benzeri ifadelerden sonraki ürünleri bul
    if 'where you can find it' in text.lower() or 'where you can find' in text.lower():
        # İki noktadan sonrasını al
        parts = re.split(r'[:\n]', text, flags=re.IGNORECASE)
        if len(parts) > 1:
            products_text = parts[-1]
            # Virgülle ayrılmış ürünleri bul
            products = [p.strip() for p in products_text.split(',') if p.strip()]
    return products

def scrape_ingredients(url):
    """Fusion Meso ingredients sayfasını scrape et"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
            # Alternatif: Tüm section'ları kontrol et
            sections = soup.find_all('section', class_=lambda x: x and 'elementor-section' in x)
            for section in sections:
                if 'elementor-element-bb65e52' in section.get('class', []):
                    main_element = section
                    break
        
        if not main_element:
            print("Hata: İçerik bulunamadı!")
            return []
        
        print("İçerik bulundu, parse ediliyor...")
        
        ingredients = []
        
        # Tüm içerik bloklarını bul
        # Her bir ingredient genellikle bir başlık ve açıklama içerir
        content_blocks = main_element.find_all(['div', 'section'], recursive=True)
        
        current_ingredient = None
        
        for element in main_element.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'], recursive=True):
            text = clean_text(element.get_text())
            
            if not text:
                continue
            
            # Başlık kontrolü (büyük harfle başlayan, kısa metinler)
            is_heading = False
            if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                is_heading = True
            elif len(text) < 100 and text[0].isupper() and not text.endswith('.'):
                is_heading = True
            
            if is_heading:
                # Önceki ingredient'i kaydet
                if current_ingredient and current_ingredient.get('description'):
                    ingredients.append(current_ingredient)
                
                # Yeni ingredient başlat
                current_ingredient = {
                    'name': text,
                    'source': 'natural',  # Default, sonra güncellenecek
                    'description': '',
                    'products': []
                }
            else:
                # Açıklama veya ürün bilgisi
                if current_ingredient:
                    # Source kontrolü
                    if 'source:' in text.lower():
                        source = extract_source(text)
                        current_ingredient['source'] = source
                    
                    # Ürün kontrolü
                    if 'where you can find' in text.lower():
                        products = extract_products(text)
                        if products:
                            current_ingredient['products'] = products
                    
                    # Açıklama ekle
                    if text and text not in current_ingredient['description']:
                        if current_ingredient['description']:
                            current_ingredient['description'] += ' ' + text
                        else:
                            current_ingredient['description'] = text
        
        # Son ingredient'i ekle
        if current_ingredient and current_ingredient.get('description'):
            ingredients.append(current_ingredient)
        
        # Alternatif yöntem: Daha basit parse
        if not ingredients:
            print("Alternatif parse yöntemi deneniyor...")
            # Tüm metni al ve parçala
            all_text = clean_text(main_element.get_text())
            
            # Başlıkları bul (büyük harfle başlayan, kısa satırlar)
            lines = all_text.split('\n')
            current_item = None
            
            for line in lines:
                line = clean_text(line)
                if not line:
                    continue
                
                # Başlık kontrolü
                if len(line) < 80 and line[0].isupper() and not line.endswith('.'):
                    if current_item:
                        ingredients.append(current_item)
                    current_item = {
                        'name': line,
                        'source': 'natural',
                        'description': '',
                        'products': []
                    }
                elif current_item:
                    # Source kontrolü
                    if 'source:' in line.lower():
                        current_item['source'] = extract_source(line)
                    # Ürün kontrolü
                    elif 'where you can find' in line.lower():
                        products = extract_products(line)
                        if products:
                            current_item['products'] = products
                    # Açıklama
                    else:
                        if current_item['description']:
                            current_item['description'] += ' ' + line
                        else:
                            current_item['description'] = line
            
            if current_item:
                ingredients.append(current_item)
        
        return ingredients
        
    except requests.RequestException as e:
        print(f"Hata: Sayfa yüklenemedi - {e}")
        return []
    except Exception as e:
        print(f"Hata: {e}")
        import traceback
        traceback.print_exc()
        return []

def save_to_json(ingredients, filename='data/fusionmeso-ingredients-raw.json'):
    """İçerikleri JSON dosyasına kaydet"""
    import os
    os.makedirs('data', exist_ok=True)
    
    data = {
        'ingredients': ingredients,
        'total_count': len(ingredients)
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n{len(ingredients)} içerik kaydedildi: {filename}")

def main():
    url = "https://fusionmeso.com/skincare-ingredients-retinol-vitamin-c-niacinamide-peptides/"
    
    print("=" * 60)
    print("Fusion Meso Ingredients Scraper")
    print("=" * 60)
    
    ingredients = scrape_ingredients(url)
    
    if ingredients:
        print(f"\n{len(ingredients)} içerik bulundu:")
        print("-" * 60)
        for i, ing in enumerate(ingredients, 1):
            print(f"\n{i}. {ing['name']}")
            print(f"   Kaynak: {ing['source']}")
            print(f"   Açıklama: {ing['description'][:100]}...")
            print(f"   Ürünler: {', '.join(ing['products'][:3])}...")
        
        save_to_json(ingredients)
    else:
        print("\nHiç içerik bulunamadı!")

if __name__ == "__main__":
    main()

