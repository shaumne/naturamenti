// Products functionality
let allProducts = [];
let filteredVials = [];
let filteredSkincare = [];

// Categorize products
function categorizeProducts(products) {
    const vials = [];
    const skincare = [];
    
    products.forEach(product => {
        const usage = (product.usage || '').toLowerCase();
        const name = (product.name || '').toLowerCase();
        
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
    
    return { vials, skincare };
}

// Load products on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('data/products.json');
        allProducts = await response.json();
        
        const { vials, skincare } = categorizeProducts(allProducts);
        filteredVials = [...vials];
        // Meso T Mask son sıraya taşı (cilt bakımı sayfasında)
        const moveMesoTMaskToEnd = (arr) => {
            const rest = [], end = [];
            arr.forEach(p => {
                const n = (p.name || '').toLowerCase();
                if (n.includes('meso t mask')) end.push(p);
                else rest.push(p);
            });
            return rest.concat(end);
        };
        filteredSkincare = moveMesoTMaskToEnd(skincare);
        
        displayProductsByCategory(filteredVials, filteredSkincare);
        updateResultsCount(filteredVials.length + filteredSkincare.length);
        
        // Setup search functionality
        setupSearch();
        
        // Check for URL search parameter
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        if (searchTerm) {
            document.getElementById('productSearch').value = searchTerm;
            filterProducts(searchTerm);
        }
        
        // Check for hash in URL and scroll to that section
        const hash = window.location.hash;
        if (hash) {
            // Wait for content to render, then scroll
            setTimeout(() => {
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    // Calculate offset for sticky header
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 300);
        } else {
            // If no hash, prevent default scroll to top
            // Only scroll to top if we're coming from another page
            if (document.referrer && !document.referrer.includes(window.location.hostname)) {
                window.scrollTo(0, 0);
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError();
    }
});

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
            // Benefit string'ini "-" veya "–" ile ayır
            const items = benefit.split(/[–-]/).filter(item => item.trim());
            if (items.length > 1) {
                items.forEach(item => {
                    const trimmed = item.trim();
                    if (trimmed) {
                        benefitsHTML += `<span class="benefit-item-inline">– ${trimmed}</span>`;
                    }
                });
            } else {
                const trimmed = benefit.trim();
                if (trimmed) {
                    benefitsHTML += `<span class="benefit-item-inline">– ${trimmed}</span>`;
                }
            }
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

// Display products in grid by category
function displayProductsByCategory(vials, skincare) {
    const vialsGrid = document.getElementById('vialsGrid');
    const skincareGrid = document.getElementById('skincareGrid');
    const vialsNoResults = document.getElementById('vialsNoResults');
    const skincareNoResults = document.getElementById('skincareNoResults');
    
    // Display vials
    if (vialsGrid) {
        if (vials.length === 0) {
            vialsGrid.style.display = 'none';
            if (vialsNoResults) vialsNoResults.style.display = 'block';
        } else {
            vialsGrid.style.display = 'grid';
            if (vialsNoResults) vialsNoResults.style.display = 'none';
            vialsGrid.innerHTML = vials.map(product => {
                const usageInfo = extractUsageInfo(product);
                return `
                <div class="product-card" onclick="goToProduct(${product.id})">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-desc">${usageInfo}</p>
                        <button class="product-btn">Detayları Gör</button>
                    </div>
                </div>
            `;
            }).join('');
        }
    }
    
    // Display skincare
    if (skincareGrid) {
        if (skincare.length === 0) {
            skincareGrid.style.display = 'none';
            if (skincareNoResults) skincareNoResults.style.display = 'block';
        } else {
            skincareGrid.style.display = 'grid';
            if (skincareNoResults) skincareNoResults.style.display = 'none';
            skincareGrid.innerHTML = skincare.map(product => {
                const usageInfo = extractUsageInfo(product);
                return `
                <div class="product-card" onclick="goToProduct(${product.id})">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-desc">${usageInfo}</p>
                        <button class="product-btn">Detayları Gör</button>
                    </div>
                </div>
            `;
            }).join('');
        }
    }
}

// Display products in grid (legacy function for compatibility)
function displayProducts(products) {
    const { vials, skincare } = categorizeProducts(products);
    displayProductsByCategory(vials, skincare);
}

// Filter products based on search term
function filterProducts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
        const { vials, skincare } = categorizeProducts(allProducts);
        filteredVials = [...vials];
        filteredSkincare = [...skincare];
    } else {
        const filtered = allProducts.filter(product => 
            product.name.toLowerCase().includes(term) ||
            (product.shortDesc && product.shortDesc.toLowerCase().includes(term)) ||
            (product.category && product.category.toLowerCase().includes(term)) ||
            (product.ingredients && product.ingredients.some(ing => ing.toLowerCase().includes(term)))
        );
        
        const { vials, skincare } = categorizeProducts(filtered);
        filteredVials = [...vials];
        filteredSkincare = [...skincare];
    }
    
    displayProductsByCategory(filteredVials, filteredSkincare);
    updateResultsCount(filteredVials.length + filteredSkincare.length);
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('productSearch');
    const headerSearchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterProducts(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterProducts(e.target.value);
            }
        });
    }
    
    if (headerSearchInput) {
        headerSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.trim();
                if (searchTerm) {
                    window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
    }
}

// Update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = count;
    }
}

// Navigate to product detail page
function goToProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Show error message
function showError() {
    const vialsGrid = document.getElementById('vialsGrid');
    const skincareGrid = document.getElementById('skincareGrid');
    
    const errorHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--text-light); margin-bottom: 20px;"></i>
            <p style="font-size: 18px; color: var(--text-light);">Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
        </div>
    `;
    
    if (vialsGrid) {
        vialsGrid.innerHTML = errorHTML;
    }
    if (skincareGrid) {
        skincareGrid.innerHTML = errorHTML;
    }
}

// Product Detail Page functionality
if (window.location.pathname.includes('product-detail.html')) {
    document.addEventListener('DOMContentLoaded', async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        if (productId) {
            await loadProductDetail(productId);
        } else {
            window.location.href = 'products.html';
        }
    });
}

async function loadProductDetail(productId) {
    try {
        const response = await fetch('data/products.json');
        const products = await response.json();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            window.location.href = 'products.html';
            return;
        }
        
        displayProductDetail(product);
        loadRelatedProducts(products, product.category, productId);
    } catch (error) {
        console.error('Error loading product detail:', error);
        window.location.href = 'products.html';
    }
}

// Parse "-" ile başlayan metinleri liste maddesi yap
function parseDescription(description) {
    if (!description) return '';
    
    // HTML etiketlerini temizle
    let text = description.replace(/<[^>]*>/g, '');
    // \r\n ve \n karakterlerini normalize et
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // "-" ile başlayan satırları bul
    const lines = text.split('\n');
    const listItems = [];
    let regularText = [];
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('–') || trimmed.startsWith('-')) {
            // Liste maddesi
            const item = trimmed.replace(/^[–-]\s*/, '').trim();
            if (item) {
                listItems.push(item);
            }
        } else if (trimmed.length > 0) {
            // Normal metin
            regularText.push(trimmed);
        }
    });
    
    let result = '';
    
    // Normal metni ekle
    if (regularText.length > 0) {
        result = '<p>' + regularText.join('</p><p>') + '</p>';
    }
    
    // Liste maddelerini ekle
    if (listItems.length > 0) {
        result += '<ul class="description-list">' + 
            listItems.map(item => `<li>${item}</li>`).join('') + 
            '</ul>';
    }
    
    return result || description;
}

function displayProductDetail(product) {
    // Update page title
    document.title = `${product.name} | Naturamenti Türkiye`;
    
    // Display product image
    const imageContainer = document.querySelector('.product-detail-image');
    if (imageContainer) {
        imageContainer.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
        `;
    }
    
    // Display product info
    const infoContainer = document.querySelector('.product-detail-info');
    if (infoContainer) {
        // Açıklamayı parse et
        const description = parseDescription(product.longDesc || product.shortDesc);
        
        let html = `
            <h1>${product.name}</h1>
            ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
            <div class="product-description">${description}</div>
        `;
        
        // Ingredients, Benefits ve Usage 3 kolon halinde
        const hasIngredients = product.ingredients && product.ingredients.length > 0;
        const hasBenefits = product.benefits && product.benefits.length > 0;
        const hasUsage = product.usage;
        
        if (hasIngredients || hasBenefits || hasUsage) {
            html += `<div class="product-details-grid">`;
            
            // Ingredients
            if (hasIngredients) {
                html += `
                    <div class="product-details-section">
                        <h3><i class="fas fa-flask"></i> İçerikler</h3>
                        <ul class="ingredients-list">
                            ${product.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            // Benefits (Endikasyonlar)
            if (hasBenefits) {
                html += `
                    <div class="product-details-section">
                        <h3><i class="fas fa-check-circle"></i> Endikasyonlar</h3>
                        <ul class="benefits-list">
                            ${product.benefits.map(benefit => {
                                if (!benefit || typeof benefit !== 'string') return '';
                                
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
                                
                                // "- " veya "– " ile ayır (kelime içindeki "-" korunmuş olacak)
                                let items = protectedText.split(/\s*[–-]\s+/).filter(item => item.trim());
                                
                                // Eğer split çalışmadıysa, manuel olarak ayır
                                if (items.length <= 1) {
                                    items = [];
                                    // Nokta sonrası "- " veya "– " ile başlayan yerlerden ayır
                                    const parts = protectedText.split(/(?<=\.)\s*[–-]\s+/);
                                    parts.forEach(part => {
                                        const trimmed = part.trim();
                                        if (trimmed) {
                                            items.push(trimmed);
                                        }
                                    });
                                }
                                
                                // Her item'ı işle
                                return items.map(item => {
                                    // Protected kelimeleri geri değiştir
                                    replacements.forEach(({ placeholder, original }) => {
                                        item = item.replace(new RegExp(placeholder, 'g'), original);
                                    });
                                    
                                    // Başındaki nokta ve boşlukları temizle
                                    item = item.replace(/^\.\s*/, '').trim();
                                    
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
                                    
                                    return item ? `<li>${item}</li>` : '';
                                }).join('');
                            }).join('')}
                        </ul>
                    </div>
                `;
            }
            
            // Usage
            if (hasUsage) {
                html += `
                    <div class="product-details-section">
                        <h3><i class="fas fa-info-circle"></i> Kullanım</h3>
                        <p>${product.usage}</p>
                    </div>
                `;
            }
            
            html += `</div>`;
        }
        
        infoContainer.innerHTML = html;
    }
}

function loadRelatedProducts(allProducts, category, currentProductId) {
    const relatedContainer = document.querySelector('.related-products .products-grid');
    if (!relatedContainer) return;
    
    // Helper function to truncate description
    function truncateDescription(desc, maxLength = 120) {
        if (!desc || desc.trim().length === 0) return '';
        const trimmed = desc.trim();
        if (trimmed.length <= maxLength) return trimmed;
        return trimmed.substring(0, maxLength).trim() + '...';
    }
    
    // Filter products with valid shortDesc (at least 20 characters)
    const hasValidShortDesc = (p) => {
        return p.shortDesc && p.shortDesc.trim().length >= 20;
    };
    
    // Get products from same category, excluding current product and those without shortDesc
    let related = allProducts.filter(p => 
        p.category === category && 
        p.id !== currentProductId && 
        hasValidShortDesc(p)
    ).slice(0, 4);
    
    // If not enough related products, fill with random products that have shortDesc
    if (related.length < 4) {
        const others = allProducts.filter(p => 
            p.id !== currentProductId && 
            !related.includes(p) && 
            hasValidShortDesc(p)
        );
        related = [...related, ...others.slice(0, 4 - related.length)];
    }
    
    if (related.length > 0) {
        relatedContainer.innerHTML = related.map(product => {
            const truncatedDesc = truncateDescription(product.shortDesc, 120);
            return `
            <div class="product-card" onclick="goToProduct(${product.id})">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${truncatedDesc}</p>
                    <button class="product-btn">Detayları Gör</button>
                </div>
            </div>
        `;
        }).join('');
    } else {
        document.querySelector('.related-products').style.display = 'none';
    }
}

