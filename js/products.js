// Products functionality
let allProducts = [];
let filteredProducts = [];

// Load products on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('data/products.json');
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        displayProducts(filteredProducts);
        updateResultsCount(filteredProducts.length);
        
        // Setup search functionality
        setupSearch();
        
        // Check for URL search parameter
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        if (searchTerm) {
            document.getElementById('productSearch').value = searchTerm;
            filterProducts(searchTerm);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError();
    }
});

// Display products in grid
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    productsGrid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="goToProduct(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.shortDesc}</p>
                <button class="product-btn">Detayları Gör</button>
            </div>
        </div>
    `).join('');
}

// Filter products based on search term
function filterProducts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(term) ||
            product.shortDesc.toLowerCase().includes(term) ||
            (product.category && product.category.toLowerCase().includes(term)) ||
            (product.ingredients && product.ingredients.some(ing => ing.toLowerCase().includes(term)))
        );
    }
    
    displayProducts(filteredProducts);
    updateResultsCount(filteredProducts.length);
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
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--text-light); margin-bottom: 20px;"></i>
                <p style="font-size: 18px; color: var(--text-light);">Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
            </div>
        `;
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
        let html = `
            <h1>${product.name}</h1>
            ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
            <p class="product-description">${product.longDesc || product.shortDesc}</p>
        `;
        
        // Ingredients
        if (product.ingredients && product.ingredients.length > 0) {
            html += `
                <div class="product-details-section">
                    <h3><i class="fas fa-flask"></i> İçerikler</h3>
                    <ul class="ingredients-list">
                        ${product.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Benefits
        if (product.benefits && product.benefits.length > 0) {
            html += `
                <div class="product-details-section">
                    <h3><i class="fas fa-check-circle"></i> Faydaları</h3>
                    <div class="benefits-grid">
                        ${product.benefits.map(benefit => `
                            <div class="benefit-item">
                                <i class="fas fa-check"></i>
                                <span>${benefit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Usage
        if (product.usage) {
            html += `
                <div class="product-details-section">
                    <h3><i class="fas fa-info-circle"></i> Kullanım</h3>
                    <p>${product.usage}</p>
                </div>
            `;
        }
        
        infoContainer.innerHTML = html;
    }
}

function loadRelatedProducts(allProducts, category, currentProductId) {
    const relatedContainer = document.querySelector('.related-products .products-grid');
    if (!relatedContainer) return;
    
    // Get products from same category, excluding current product
    let related = allProducts.filter(p => 
        p.category === category && p.id !== currentProductId
    ).slice(0, 4);
    
    // If not enough related products, fill with random products
    if (related.length < 4) {
        const others = allProducts.filter(p => 
            p.id !== currentProductId && !related.includes(p)
        );
        related = [...related, ...others.slice(0, 4 - related.length)];
    }
    
    if (related.length > 0) {
        relatedContainer.innerHTML = related.map(product => `
            <div class="product-card" onclick="goToProduct(${product.id})">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.shortDesc}</p>
                    <button class="product-btn">Detayları Gör</button>
                </div>
            </div>
        `).join('');
    } else {
        document.querySelector('.related-products').style.display = 'none';
    }
}

