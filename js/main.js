// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.classList.remove('active');
            }
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Sticky header on scroll
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            header.classList.add('scroll-down');
            header.classList.remove('scroll-up');
        } else if (currentScroll < lastScroll) {
            // Scrolling up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });

    // Testimonials auto-rotate
    initTestimonials();
    
    // Before/After slider
    initBeforeAfterSlider();
});

// Testimonials functionality
function initTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dotsContainer = document.getElementById('testimonialDots');
    
    if (!testimonials.length || !dotsContainer) return;
    
    let currentTestimonial = 0;
    
    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToTestimonial(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.dot');
    
    function goToTestimonial(index) {
        testimonials[currentTestimonial].classList.remove('active');
        dots[currentTestimonial].classList.remove('active');
        
        currentTestimonial = index;
        
        testimonials[currentTestimonial].classList.add('active');
        dots[currentTestimonial].classList.add('active');
    }
    
    function nextTestimonial() {
        const next = (currentTestimonial + 1) % testimonials.length;
        goToTestimonial(next);
    }
    
    // Auto-rotate every 5 seconds
    setInterval(nextTestimonial, 5000);
}

// Contact form validation
function validateContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Validate name
    if (name && name.value.trim() === '') {
        showError(name, 'Lütfen adınızı girin');
        isValid = false;
    }
    
    // Validate email
    if (email) {
        const emailValue = email.value.trim();
        if (emailValue === '') {
            showError(email, 'Lütfen e-posta adresinizi girin');
            isValid = false;
        } else if (!isValidEmail(emailValue)) {
            showError(email, 'Lütfen geçerli bir e-posta adresi girin');
            isValid = false;
        }
    }
    
    // Validate message
    if (message && message.value.trim() === '') {
        showError(message, 'Lütfen mesajınızı girin');
        isValid = false;
    }
    
    if (isValid) {
        const form = event.target;
        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        
        // Submit butonunu devre dışı bırak
        submitBtn.disabled = true;
        submitBtn.textContent = 'Gönderiliyor...';
        
        // FormSubmit'e gönder - form otomatik olarak submit edilecek
        // Başarı durumunda sayfa yenilenecek veya yönlendirilecek
        // Bu yüzden başarı mesajını form action'dan sonra göstermek için
        // form submit edilmeden önce bir mesaj gösterelim
        
        // FormSubmit başarılı olduğunda sayfayı yenilemeyecek şekilde ayarla
        const nextUrlInput = form.querySelector('input[name="_next"]');
        if (nextUrlInput) {
            nextUrlInput.value = window.location.href + '?success=true';
        }
        
        // Formu submit et - FormSubmit otomatik olarak işleyecek
        // Eğer JavaScript ile kontrol etmek isterseniz, fetch kullanabiliriz
        // Ama FormSubmit direkt form submit'i destekliyor
        
        // FormSubmit AJAX ile gönder (sayfa yenilenmesin)
        const formData = new FormData(form);
        
        fetch(form.action, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                // Başarı mesajı göster
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.';
                form.appendChild(successMessage);
                
                // Formu temizle
                form.reset();
                
                // Submit butonunu tekrar aktif et
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                
                // Başarı mesajını 5 saniye sonra kaldır
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            } else {
                throw new Error('Form gönderilemedi');
            }
        })
        .catch(error => {
            // Submit butonunu tekrar aktif et
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            
            // Hata mesajı göster
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.marginTop = '15px';
            errorMessage.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
            form.appendChild(errorMessage);
            
            // Hata mesajını 5 saniye sonra kaldır
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
            
            console.error('Form gönderim hatası:', error);
        });
        
        // Form submit'i engelle (AJAX kullanıyoruz)
        event.preventDefault();
    }
}

function showError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
    input.classList.add('error');
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Before/After Slider functionality
function initBeforeAfterSlider() {
    const slider = document.getElementById('beforeAfterSlider');
    const handle = document.getElementById('sliderHandle');
    const afterImage = slider?.querySelector('.after-image');
    
    if (!slider || !handle || !afterImage) return;
    
    let isDragging = false;
    
    function updateSlider(x) {
        const rect = slider.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        
        // Handle pozisyonunu güncelle
        handle.style.left = percentage + '%';
        
        // After image clip-path güncelle
        afterImage.style.clipPath = `inset(0 0 0 ${percentage}%)`;
    }
    
    function startDrag(e) {
        isDragging = true;
        slider.style.cursor = 'ew-resize';
    }
    
    function stopDrag() {
        isDragging = false;
        slider.style.cursor = 'ew-resize';
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        updateSlider(x);
    }
    
    // Mouse events
    handle.addEventListener('mousedown', startDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mousemove', onDrag);
    
    // Touch events
    handle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag(e);
    });
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            onDrag(e);
        }
    });
    
    // Click anywhere on slider
    slider.addEventListener('click', (e) => {
        if (e.target !== handle) {
            const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            updateSlider(x);
        }
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateContactForm };
}

