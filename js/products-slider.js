// Products Slider
document.addEventListener('DOMContentLoaded', function() {
    const productsSlider = document.getElementById('productsSlider');
    const prevBtn = document.getElementById('productsPrevBtn');
    const nextBtn = document.getElementById('productsNextBtn');
    
    if (!productsSlider) {
        console.error('Products slider container bulunamadı!');
        return;
    }
    
    let products = [];
    
    // Load products from JSON
    fetch('data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Ürünler yüklendi:', data.length);
            if (!Array.isArray(data)) {
                console.error('Ürünler bir array değil!', data);
                return;
            }
            products = data;
            if (products.length === 0) {
                console.warn('Hiç ürün bulunamadı!');
                productsSlider.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Ürün bulunamadı.</p>';
                return;
            }
            renderProducts();
            updateNavButtons();
        })
        .catch(error => {
            console.error('Ürünler yüklenirken hata oluştu:', error);
            productsSlider.innerHTML = '<p style="text-align: center; padding: 40px; color: #d32f2f;">Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>';
        });
    
    // Render products
    function renderProducts() {
        if (!productsSlider) return;
        
        productsSlider.innerHTML = '';
        
        if (products.length === 0) {
            productsSlider.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Ürün bulunamadı.</p>';
            return;
        }
        
        products.forEach((product, index) => {
            try {
                const productCard = createProductCard(product);
                productsSlider.appendChild(productCard);
            } catch (error) {
                console.error(`Ürün ${index} render edilirken hata:`, error, product);
            }
        });
        
        console.log(`${products.length} ürün render edildi.`);
    }
    
    // Extract "ne işe yarar" bilgisi
    function extractUsageInfo(product) {
        let text = product.shortDesc || product.longDesc || '';
        
        // HTML etiketlerini temizle
        text = text.replace(/<[^>]*>/g, '');
        // \r\n ve \n karakterlerini boşluğa çevir
        text = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
        // Fazla boşlukları temizle
        text = text.replace(/\s+/g, ' ').trim();
        
        // Benefits varsa onu kullan - madde madde göster
        if (product.benefits && product.benefits.length > 0) {
            let benefitsHTML = '';
            product.benefits.forEach(benefit => {
                if (!benefit || typeof benefit !== 'string') return;
                
                // "Foto-yaşlanma" gibi kelimelerdeki "-" işaretini korumak için
                // Önce bu kelimeleri geçici placeholder ile değiştir
                const protectedPatterns = [
                    /Foto-yaşlanma/gi,
                    /foto-yaşlanma/gi,
                    /Mikro-flora/gi,
                    /mikro-flora/gi,
                    /Trans-epidermal/gi,
                    /trans-epidermal/gi
                ];
                
                const replacements = [];
                let protectedText = benefit;
                let counter = 0;
                
                protectedPatterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(benefit)) !== null) {
                        const placeholder = `__PROT${counter}__`;
                        replacements.push({ placeholder, original: match[0] });
                        protectedText = protectedText.replace(match[0], placeholder);
                        counter++;
                    }
                });
                
                // Şimdi "- " veya "– " ile ayır (kelime içindeki "-" korunmuş olacak)
                // Regex: nokta sonrası veya string başında "- " veya "– " ile başlayan yerlerden ayır
                let items = protectedText.split(/(?<=\.)\s*(?=[–-]\s)|(?<=\.)(?=[–-]\s)|^[–-]\s/).filter(item => item.trim());
                
                // Eğer split çalışmadıysa, manuel olarak ayır
                if (items.length <= 1) {
                    items = [];
                    // "- " veya "– " ile başlayan yerlerden ayır
                    const parts = protectedText.split(/\s*[–-]\s+/);
                    parts.forEach(part => {
                        const trimmed = part.trim();
                        if (trimmed) {
                            items.push(trimmed);
                        }
                    });
                }
                
                // Her item'ı işle
                items.forEach(item => {
                    // Protected kelimeleri geri değiştir
                    replacements.forEach(({ placeholder, original }) => {
                        item = item.replace(new RegExp(placeholder, 'g'), original);
                    });
                    
                    // Başındaki "- ", "– ", nokta ve boşlukları temizle
                    item = item.replace(/^[–-]\s*/, '').replace(/^\.\s*/, '').trim();
                    
                    // Nokta ile bitmiyorsa ekle
                    if (item && !item.endsWith('.')) {
                        item += '.';
                    }
                    
                    // İlk harfi büyük yap (sadece küçük harfle başlıyorsa)
                    if (item && item.length > 0) {
                        const firstChar = item[0];
                        if (firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase()) {
                            item = item.charAt(0).toUpperCase() + item.slice(1);
                        }
                    }
                    
                    if (item) {
                        benefitsHTML += `<span class="benefit-item-inline">– ${item}</span>`;
                    }
                });
            });
            
            if (benefitsHTML) {
                return benefitsHTML;
            }
        }
        
        // İlk cümleyi veya "için" kelimesinden önceki kısmı al
        const sentences = text.split(/[.!?]/);
        if (sentences.length > 0 && sentences[0].trim().length > 20) {
            let firstSentence = sentences[0].trim();
            // "için" kelimesini içeriyorsa ondan önceki kısmı al
            const icinIndex = firstSentence.indexOf(' için');
            if (icinIndex > 0) {
                firstSentence = firstSentence.substring(0, icinIndex + 5);
            }
            if (firstSentence.length > 150) {
                firstSentence = firstSentence.substring(0, 150) + '...';
            }
            return firstSentence;
        }
        
        // İlk 150 karakteri al
        if (text.length > 150) {
            return text.substring(0, 150) + '...';
        }
        
        return text || 'Ürün bilgisi bulunamadı.';
    }
    
    // Create product card HTML
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-slide';
        
        // "Ne işe yarar" bilgisini çıkar
        const usageInfo = extractUsageInfo(product);
        
        const badgeHTML = product.badge ? `<div class="product-slide-badge">${product.badge}</div>` : '';
        const productImage = product.image || 'images/products/placeholder.jpg';
        const productName = product.name || 'İsimsiz Ürün';
        const productId = product.id || 0;
        
        card.innerHTML = `
            <div class="product-slide-image">
                <img src="${productImage}" alt="${productName}" onerror="this.src='images/products/placeholder.jpg'">
                ${badgeHTML}
            </div>
            <div class="product-slide-content">
                <h3 class="product-slide-title">${productName}</h3>
                <p class="product-slide-desc">${usageInfo}</p>
                <div class="product-slide-link">
                    <a href="product-detail.html?id=${productId}" class="btn btn-primary">Detayları Gör</a>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Scroll functions
    function scrollProducts(direction) {
        if (!productsSlider) return;
        
        const cardWidth = productsSlider.querySelector('.product-slide')?.offsetWidth || 350;
        const gap = 30;
        const scrollAmount = cardWidth + gap;
        
        if (direction === 'prev') {
            productsSlider.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        } else {
            productsSlider.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
        
        // Update buttons after scroll
        setTimeout(updateNavButtons, 500);
    }
    
    // Update navigation buttons state
    function updateNavButtons() {
        if (!prevBtn || !nextBtn || !productsSlider) return;
        
        const scrollLeft = productsSlider.scrollLeft;
        const scrollWidth = productsSlider.scrollWidth;
        const clientWidth = productsSlider.clientWidth;
        
        // Prev button
        if (scrollLeft <= 0) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }
        
        // Next button
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
        }
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => scrollProducts('prev'));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => scrollProducts('next'));
    }
    
    // Update buttons on scroll
    if (productsSlider) {
        productsSlider.addEventListener('scroll', updateNavButtons);
        
        // Touch/swipe support
        let isDown = false;
        let startX;
        let scrollLeft;
        
        productsSlider.addEventListener('mousedown', (e) => {
            isDown = true;
            productsSlider.style.cursor = 'grabbing';
            startX = e.pageX - productsSlider.offsetLeft;
            scrollLeft = productsSlider.scrollLeft;
        });
        
        productsSlider.addEventListener('mouseleave', () => {
            isDown = false;
            productsSlider.style.cursor = 'grab';
        });
        
        productsSlider.addEventListener('mouseup', () => {
            isDown = false;
            productsSlider.style.cursor = 'grab';
        });
        
        productsSlider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - productsSlider.offsetLeft;
            const walk = (x - startX) * 2;
            productsSlider.scrollLeft = scrollLeft - walk;
        });
    }
    
    // Update buttons on resize
    window.addEventListener('resize', () => {
        setTimeout(updateNavButtons, 100);
    });
});

