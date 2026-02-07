// Products Slider - Steril Flakonlar ve Cilt Bakım Ürünleri
document.addEventListener('DOMContentLoaded', function() {
    const vialsSlider = document.getElementById('vialsSlider');
    const vialsPrevBtn = document.getElementById('vialsPrevBtn');
    const vialsNextBtn = document.getElementById('vialsNextBtn');
    
    const skincareSlider = document.getElementById('skincareSlider');
    const skincarePrevBtn = document.getElementById('skincarePrevBtn');
    const skincareNextBtn = document.getElementById('skincareNextBtn');
    
    let allProducts = [];
    
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
            allProducts = data;
            
            // Kategorize et
            const vials = [];
            const skincare = [];
            
            // Kaldırılacak ürünler (cilt bakımından) — Meso T Mask son sıraya taşınır, kaldırılmaz
            const removeFromSkincare = ['hyaluronic mask', 'meso repair'];
            // Kaldırılacak ürünler (flakonlardan)
            const removeFromVials = ['gingko'];
            
            allProducts.forEach(product => {
                const usage = (product.usage || '').toLowerCase();
                const name = (product.name || '').toLowerCase();
                
                // Kaldırılacak ürünleri atla
                const shouldRemove = removeFromSkincare.some(term => name.includes(term)) ||
                                    removeFromVials.some(term => name.includes(term));
                if (shouldRemove) {
                    return;
                }
                
                // Flakon içerenler steril flakonlar
                if (usage.includes('flakon') || name.includes('flakon')) {
                    vials.push(product);
                } else {
                    // Maske, krem, serum, lotion içerenler cilt bakımı
                    if (name.includes('mask') || name.includes('krem') || name.includes('serum') || 
                        name.includes('lotion') || name.includes('losyon') || name.includes('cream')) {
                        skincare.push(product);
                    } else {
                        // Varsayılan olarak flakon kabul et (F- ile başlayanlar genelde flakon)
                        if (name.startsWith('f-')) {
                            vials.push(product);
                        } else {
                            skincare.push(product);
                        }
                    }
                }
            });
            
            // Flakonları grupla (yan yana gösterilecek ürünler)
            const groupedVials = groupVials(vials);
            
            console.log(`Steril Flakonlar: ${groupedVials.length} grup, Cilt Bakım Ürünleri: ${skincare.length}`);
            
            // Render
            if (vialsSlider) {
                renderGroupedProducts(groupedVials, vialsSlider);
                setupSlider(vialsSlider, vialsPrevBtn, vialsNextBtn);
            }
            
            if (skincareSlider) {
                // Meso T Mask son sıraya taşı
                const moveToEnd = (arr) => {
                    const rest = [], end = [];
                    arr.forEach(p => {
                        const n = (p.name || '').toLowerCase();
                        if (n.includes('meso t mask')) end.push(p);
                        else rest.push(p);
                    });
                    return rest.concat(end);
                };
                renderProducts(moveToEnd(skincare), skincareSlider);
                setupSlider(skincareSlider, skincarePrevBtn, skincareNextBtn);
            }
        })
        .catch(error => {
            console.error('Ürünler yüklenirken hata oluştu:', error);
            if (vialsSlider) {
                vialsSlider.innerHTML = '<p style="text-align: center; padding: 40px; color: #d32f2f;">Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>';
            }
            if (skincareSlider) {
                skincareSlider.innerHTML = '<p style="text-align: center; padding: 40px; color: #d32f2f;">Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>';
            }
        });
    
    // Grup tanımları (yan yana gösterilecek ürünler)
    function groupVials(vials) {
        // Grup tanımları - her grup için eşleşme terimleri (gerçek ürün isimlerine göre)
        const groups = [
            // Grup 1: XFC / XFC+ / XFC+FACE
            ['f-xfc', 'f-xfc+', 'f-xfc+ face'],
            // Grup 2: F-Eye contour / F-Eye glow
            ['f-eye contour', 'f-eye glow'],
            // Grup 3: F-Niacinamide / F-tranexamic
            ['f-niacinamide', 'f-tranexamic'],
            // Grup 4: F-Radiance / F-Melaclear
            ['f-radiance', 'f-melaclear'],
            // Grup 5: F-Melatrix / F-Mesomatrix
            ['f-melatrix', 'f-mesomatrix'],
            // Grup 6: F-XBC / F-Magistral
            ['f-xbc', 'f-magistral'],
            // Grup 7: F-Carnitine / F-Silorg / F-DMAE
            ['f-carnitine', 'f-silorg', 'f-dmae']
        ];
        
        const grouped = [];
        const used = new Set();
        
        // Önce grupları oluştur
        groups.forEach((group, groupIndex) => {
            const groupProducts = [];
            group.forEach(term => {
                const product = vials.find(p => {
                    if (used.has(p.id)) return false;
                    
                    const name = (p.name || '').toLowerCase().trim();
                    const termLower = term.toLowerCase().trim();
                    
                    // Özel durumlar için eşleşme
                    if (termLower === 'f-xfc') {
                        // Sadece tam "F-XFC" (F-XFC+ veya F-XFC+ FACE değil)
                        return name === 'f-xfc' || (name.startsWith('f-xfc') && !name.includes('+'));
                    } else if (termLower === 'f-xfc+') {
                        // "F-XFC+" ama "F-XFC+ FACE" değil
                        return (name === 'f-xfc+' || name.startsWith('f-xfc+ ')) && !name.includes('face');
                    } else if (termLower === 'f-xfc+ face') {
                        // "F-XFC+ FACE"
                        return name.includes('f-xfc+') && name.includes('face');
                    }
                    
                    // Normal içerme kontrolü
                    if (name.includes(termLower)) {
                        return true;
                    }
                    
                    return false;
                });
                if (product) {
                    groupProducts.push(product);
                    used.add(product.id);
                    console.log(`Grup ${groupIndex + 1}: ${product.name} eklendi (terim: ${term})`);
                }
            });
            if (groupProducts.length > 0) {
                grouped.push(groupProducts);
                console.log(`Grup ${groupIndex + 1} oluşturuldu: ${groupProducts.map(p => p.name).join(', ')}`);
            }
        });
        
        // Kalan ürünleri tek tek ekle
        vials.forEach(product => {
            if (!used.has(product.id)) {
                grouped.push([product]);
            }
        });
        
        console.log(`Toplam ${grouped.length} grup oluşturuldu`);
        return grouped;
    }
    
    // Render grouped products
    function renderGroupedProducts(groupedProducts, container) {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (groupedProducts.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Ürün bulunamadı.</p>';
            return;
        }
        
        groupedProducts.forEach((group, groupIndex) => {
            const groupContainer = document.createElement('div');
            groupContainer.className = 'product-group';
            groupContainer.style.display = 'flex';
            groupContainer.style.gap = '20px';
            groupContainer.style.minWidth = 'fit-content';
            
            group.forEach((product, index) => {
                try {
                    const productCard = createProductCard(product);
                    productCard.style.flexShrink = '0';
                    groupContainer.appendChild(productCard);
                } catch (error) {
                    console.error(`Ürün ${index} render edilirken hata:`, error, product);
                }
            });
            
            container.appendChild(groupContainer);
        });
        
        console.log(`${groupedProducts.length} grup render edildi.`);
    }
    
    // Render products
    function renderProducts(products, container) {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (products.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Ürün bulunamadı.</p>';
            return;
        }
        
        products.forEach((product, index) => {
            try {
                const productCard = createProductCard(product);
                container.appendChild(productCard);
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
                
                let items = protectedText.split(/(?<=\.)\s*(?=[–-]\s)|(?<=\.)(?=[–-]\s)|^[–-]\s/).filter(item => item.trim());
                
                if (items.length <= 1) {
                    items = [];
                    const parts = protectedText.split(/\s*[–-]\s+/);
                    parts.forEach(part => {
                        const trimmed = part.trim();
                        if (trimmed) {
                            items.push(trimmed);
                        }
                    });
                }
                
                items.forEach(item => {
                    replacements.forEach(({ placeholder, original }) => {
                        item = item.replace(new RegExp(placeholder, 'g'), original);
                    });
                    
                    item = item.replace(/^[–-]\s*/, '').replace(/^\.\s*/, '').trim();
                    
                    if (item && !item.endsWith('.')) {
                        item += '.';
                    }
                    
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
        
        const usageInfo = extractUsageInfo(product);
        
        const productImage = product.image || 'images/products/placeholder.jpg';
        const productName = product.name || 'İsimsiz Ürün';
        const productId = product.id || 0;
        
        card.innerHTML = `
            <div class="product-slide-image">
                <img src="${productImage}" alt="${productName}" onerror="this.src='images/products/placeholder.jpg'">
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
    
    // Setup slider with navigation
    function setupSlider(slider, prevBtn, nextBtn) {
        if (!slider) return;
        
        // Scroll functions
        function scrollProducts(direction) {
            if (!slider) return;
            
            // Grup varsa grup genişliğini al, yoksa tek kart genişliğini
            const group = slider.querySelector('.product-group');
            const cardWidth = group ? group.offsetWidth : (slider.querySelector('.product-slide')?.offsetWidth || 350);
            const gap = 30;
            const scrollAmount = cardWidth + gap;
            
            if (direction === 'prev') {
                slider.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            } else {
                slider.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
            
            setTimeout(() => updateNavButtons(), 500);
        }
        
        // Update navigation buttons state
        function updateNavButtons() {
            if (!prevBtn || !nextBtn || !slider) return;
            
            const scrollLeft = slider.scrollLeft;
            const scrollWidth = slider.scrollWidth;
            const clientWidth = slider.clientWidth;
            
            if (scrollLeft <= 0) {
                prevBtn.disabled = true;
            } else {
                prevBtn.disabled = false;
            }
            
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
        slider.addEventListener('scroll', updateNavButtons);
        
        // Touch/swipe support
        let isDown = false;
        let startX;
        let scrollLeft;
        
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });
        
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });
        
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
        
        // Update buttons on resize
        window.addEventListener('resize', () => {
            setTimeout(updateNavButtons, 100);
        });
        
        // Initial update
        setTimeout(updateNavButtons, 100);
    }
});
