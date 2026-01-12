// Product name to ID mapping
let productNameToIdMap = {};

// Load products mapping
async function loadProductMapping() {
    try {
        const response = await fetch('data/products.json');
        const products = await response.json();
        productNameToIdMap = {};
        products.forEach(product => {
            if (product.name) {
                productNameToIdMap[product.name.toUpperCase()] = product.id;
            }
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load and display ingredients
document.addEventListener('DOMContentLoaded', async function() {
    const ingredientsContainer = document.getElementById('ingredientsContainer');
    
    if (!ingredientsContainer) return;
    
    // Load product mapping first
    await loadProductMapping();
    
    // Load ingredients from JSON file
    fetch('data/ingredients-tr.json')
        .then(response => response.json())
        .then(data => {
            displayIngredients(data.ingredients);
            initAccordion();
        })
        .catch(error => {
            console.error('Error loading ingredients:', error);
            ingredientsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">İçerikler yüklenirken bir hata oluştu.</p>';
        });
});

function displayIngredients(ingredients) {
    const container = document.getElementById('ingredientsContainer');
    
    if (!container) return;
    
    container.innerHTML = ingredients.map((ingredient, index) => {
        // Create product links - only show products that exist in products.json
        const validProducts = ingredient.products.filter(product => {
            return productNameToIdMap[product.toUpperCase()] !== undefined;
        });
        
        const productsList = validProducts.map(product => {
            const productId = productNameToIdMap[product.toUpperCase()];
            return `<a href="product-detail.html?id=${productId}" class="ingredient-product-tag ingredient-product-link">${product}</a>`;
        }).join('');
        
        // Only show products section if there are valid products
        const productsSection = validProducts.length > 0 ? `
                    <div class="ingredient-products">
                        <div class="ingredient-products-label">Bu içerik bulunan ürünler:</div>
                        <div class="ingredient-products-list">
                            ${productsList}
                        </div>
                    </div>
        ` : '';
        
        return `
            <div class="ingredient-item">
                <div class="ingredient-header" data-index="${index}">
                    <div class="ingredient-header-left">
                        <h3 class="ingredient-name">${ingredient.name}</h3>
                    </div>
                    <div class="ingredient-toggle">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="ingredient-content">
                    <p class="ingredient-description">${ingredient.description}</p>
                    ${productsSection}
                </div>
            </div>
        `;
    }).join('');
}

function initAccordion() {
    const headers = document.querySelectorAll('.ingredient-header');
    
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.closest('.ingredient-item');
            const content = item.querySelector('.ingredient-content');
            const isActive = this.classList.contains('active');
            
            // Close all other items (optional - remove if you want multiple open)
            headers.forEach(h => {
                if (h !== this) {
                    h.classList.remove('active');
                    h.closest('.ingredient-item').querySelector('.ingredient-content').classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                this.classList.remove('active');
                content.classList.remove('active');
            } else {
                this.classList.add('active');
                content.classList.add('active');
            }
        });
    });
}

