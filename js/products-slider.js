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
    
    // Create product card HTML
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-slide';
        
        // Kısa açıklamayı temizle ve kısalt
        let shortDesc = product.shortDesc || product.longDesc || 'Açıklama bulunamadı.';
        // HTML etiketlerini temizle
        shortDesc = shortDesc.replace(/<[^>]*>/g, '');
        // \r\n ve \n karakterlerini boşluğa çevir
        shortDesc = shortDesc.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
        // Fazla boşlukları temizle
        shortDesc = shortDesc.replace(/\s+/g, ' ').trim();
        // İlk 150 karakteri al
        if (shortDesc.length > 150) {
            shortDesc = shortDesc.substring(0, 150) + '...';
        }
        
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
                <p class="product-slide-desc">${shortDesc}</p>
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

