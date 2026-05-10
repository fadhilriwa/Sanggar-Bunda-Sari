/**
 * Main JavaScript for Sanggar Bunda Sari
 * Handles global interactions, animations, and responsive features.
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavbarScroll();
    initBackToTop();
    initSidebarToggle();
    initCounters(); // Safe to call even if no counters exist
});

/**
 * 1. Global Scroll Reveal Animations
 * Uses IntersectionObserver to trigger animations when elements enter viewport
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .animate-fade-in, .animate-slide-up');
    revealElements.forEach(el => observer.observe(el));
}

/**
 * 2. Dynamic Navbar Glass Effect
 */
function initNavbarScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Check initial state
    if (window.scrollY > 50) header.classList.add('scrolled');
}

/**
 * 3. Back to Top Button
 */
function initBackToTop() {
    // Create button dynamically if not exists
    if (!document.querySelector('.back-to-top')) {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
        btn.ariaLabel = 'Kembali ke atas';
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
    }
}

/**
 * 4. Sidebar Toggle Logic (New)
 * Handles off-canvas sidebar on mobile
 */
/**
 * 4. Sidebar Toggle Logic (Mobile & Desktop)
 */
function initSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (!sidebar) return;

    // Create backdrop overlay for mobile
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
    }

    // Desktop toggle button
    const desktopToggle = document.getElementById('sidebarToggleDesktop');
    if (desktopToggle) {
        desktopToggle.addEventListener('click', () => {
            if (window.innerWidth >= 768) {
                // Desktop: collapse/expand sidebar
                sidebar.classList.toggle('collapsed');
                if (mainContent) mainContent.classList.toggle('collapsed');

                // Swap icon for visual feedback
                const icon = desktopToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('bi-layout-sidebar-inset');
                    icon.classList.toggle('bi-layout-sidebar');
                }

                // Save preference
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarCollapsed', isCollapsed);
            }
        });
    }

    // Restore collapsed state on load (Desktop only)
    if (window.innerWidth >= 768) {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('collapsed');
            // Update icon to match collapsed state
            const icon = desktopToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('bi-layout-sidebar-inset');
                icon.classList.add('bi-layout-sidebar');
            }
        }
    }

    // Mobile Toggle Function (Global) — class-based
    window.toggleSidebar = function () {
        if (window.innerWidth < 768) {
            const isOpen = sidebar.classList.contains('mobile-open');
            if (isOpen) {
                sidebar.classList.remove('mobile-open');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                sidebar.classList.add('mobile-open');
                backdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    };

    // Close sidebar when clicking backdrop (Mobile)
    backdrop.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close sidebar when clicking outside (Mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && sidebar.classList.contains('mobile-open')) {
            const toggleBtns = document.querySelectorAll('[onclick="toggleSidebar()"]');
            let isClickInside = sidebar.contains(e.target) || backdrop.contains(e.target);
            toggleBtns.forEach(btn => {
                if (btn.contains(e.target)) isClickInside = true;
            });

            if (!isClickInside) {
                sidebar.classList.remove('mobile-open');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Reset on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            sidebar.classList.remove('mobile-open');
            backdrop.classList.remove('active');
            sidebar.style.left = '';
            document.body.style.overflow = '';
        } else {
            sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('collapsed');
        }
    });
}

/**
 * 5. Number Counter Animation (for Dashboard/Home stats)
 */
function initCounters() {
    // Select elements with data-count attribute or specific IDs
    // This is a generic helper that can be called by specific pages
}

/* Helper to animate numbers */
window.animateValue = function (id, start, end, duration, isDecimal = false) {
    const element = document.getElementById(id);
    if (!element) return;

    // Parse inputs to ensure they are numbers
    start = parseFloat(start);
    end = parseFloat(end);

    if (isNaN(start) || isNaN(end)) return;

    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (range || 1))); // prevent div/0

    let current = start;
    const timer = setInterval(() => {
        current += increment;
        // Check completion
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = isDecimal ? end.toFixed(1) : Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
        }
    }, Math.max(stepTime, 10)); // Min 10ms step
};

/**
 * 6. Floating WhatsApp Button
 */
function initFloatingWhatsApp() {
    if (!document.querySelector('.floating-whatsapp')) {
        const waBtn = document.createElement('a');
        waBtn.href = 'https://wa.me/6281234567890'; // Replace with actual number
        waBtn.className = 'floating-whatsapp';
        waBtn.target = '_blank';
        waBtn.innerHTML = '<i class="bi bi-whatsapp"></i>';
        waBtn.ariaLabel = 'Chat WhatsApp';
        document.body.appendChild(waBtn);
    }
}

/**
 * 7. Toast Notification System
 * type: 'success' | 'error' | 'info'
 */
window.showToast = function (message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;

    let icon = 'check-circle-fill';
    if (type === 'error') icon = 'exclamation-circle-fill';
    if (type === 'info') icon = 'info-circle-fill';

    toast.innerHTML = `<i class="bi bi-${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};

// Auto-init new features
document.addEventListener('DOMContentLoaded', () => {
    initFloatingWhatsApp();
});

/**
 * 8. Generic Table Filter
 * Filters table rows based on search input
 * @param {string} inputId - ID of the search input element
 * @param {string} tableBodyId - ID of the table body element
 */
window.filterTable = function (inputId, tableBodyId) {
    const input = document.getElementById(inputId);
    const filter = input.value.toLowerCase();
    const tbody = document.getElementById(tableBodyId);

    if (!tbody || !input) return;

    const rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        let shouldShow = false;

        // Skip loading/empty rows
        if (cells.length === 1 && cells[0].hasAttribute('colspan')) {
            continue;
        }

        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent || cells[j].innerText;
            if (cellText.toLowerCase().indexOf(filter) > -1) {
                shouldShow = true;
                break;
            }
        }

        row.style.display = shouldShow ? '' : 'none';
    }
};

/**
 * 9. Typing Text Animation
 * Cycles through phrases with a typewriter effect
 */
function initTypingText() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const phrases = JSON.parse(el.dataset.phrases || '[]');
    if (phrases.length === 0) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout;

    function type() {
        const current = phrases[phraseIdx];
        if (isDeleting) {
            el.textContent = current.substring(0, charIdx - 1);
            charIdx--;
        } else {
            el.textContent = current.substring(0, charIdx + 1);
            charIdx++;
        }

        let speed = isDeleting ? 40 : 80;

        if (!isDeleting && charIdx === current.length) {
            speed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            speed = 400;
        }

        timeout = setTimeout(type, speed);
    }

    type();
}

/**
 * 10. 3D Card Tilt Effect
 * Mouse-follow perspective tilt on cards with class .card-3d-tilt
 */
function initCardTilt() {
    const cards = document.querySelectorAll('.card-3d-tilt');
    if (cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

/**
 * 11. Decorative Particles
 * Creates floating particles inside .particles-container elements
 */
function initParticles() {
    const containers = document.querySelectorAll('.particles-container');
    if (containers.length === 0) return;

    containers.forEach(container => {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 6 + 3;
            const left = Math.random() * 100;
            const delay = Math.random() * 12;
            const duration = Math.random() * 10 + 8;
            const colors = ['rgba(255,255,255,0.3)', 'rgba(99,102,241,0.3)', 'rgba(6,182,212,0.2)', 'rgba(139,92,246,0.2)'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                background: ${color};
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
            `;

            container.appendChild(particle);
        }
    });
}

/**
 * 12. Testimonial Auto-Carousel
 * Auto-slides through testimonials with dot indicators
 */
function initTestimonialCarousel() {
    const carousel = document.querySelector('.testimonial-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.testimonial-track');
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    if (!track || slides.length === 0) return;

    let currentSlide = 0;
    let autoplayInterval;

    // Create dots
    if (dotsContainer) {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update dots
        const dots = dotsContainer?.querySelectorAll('.carousel-dot');
        dots?.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }

    // Autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
}

/**
 * 13. Lightbox for Gallery
 * Click on gallery items to view full-size image
 */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;

    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Tutup"><i class="bi bi-x-lg"></i></button>
        <img src="" alt="Gallery Preview">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || 'Gallery Preview';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.closest('.lightbox-close')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * 14. Parallax Scroll Effect
 * Subtle depth effect on hero sections
 */
function initParallax() {
    const heroElements = document.querySelectorAll('.hero-parallax');
    if (heroElements.length === 0) return;

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;
        heroElements.forEach(hero => {
            const rect = hero.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                const speed = 0.3;
                const offset = scrollY * speed;
                hero.style.backgroundPositionY = `${offset}px`;
            }
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
}

/**
 * 15. Smooth Counter Animation (Enhanced)
 * Animates numbers from 0 to target with easing
 */
function initSmoothCounters() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.countTo);
                const suffix = el.dataset.countSuffix || '';
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * target);
                    el.textContent = current + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    counters.forEach(el => observer.observe(el));
}

/**
 * 16. Gallery Slider Navigation
 * Scrolls the gallery slider left/right by arrow buttons
 */
window.scrollGallery = function (direction) {
    const slider = document.getElementById('gallerySlider');
    if (!slider) return;
    const slideWidth = slider.querySelector('.gallery-slide')?.offsetWidth || 320;
    const scrollAmount = (slideWidth + 20) * direction; // width + gap
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
};

/**
 * 17. Gallery Detail Modal
 * Opens a detail modal with full info from data attributes
 */
window.openGalleryDetail = function (el) {
    const modal = document.getElementById('galleryDetailModal');
    if (!modal) return;

    const img = el.querySelector('img');
    document.getElementById('galleryDetailImg').src = img?.src || '';
    document.getElementById('galleryDetailImg').alt = el.dataset.title || '';
    document.getElementById('galleryDetailTitle').textContent = el.dataset.title || '';
    document.getElementById('galleryDetailDate').textContent = el.dataset.date || '';
    document.getElementById('galleryDetailLocation').textContent = el.dataset.location || '';
    document.getElementById('galleryDetailDesc').textContent = el.dataset.description || '';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeGalleryDetail = function () {
    const modal = document.getElementById('galleryDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Close gallery detail modal on backdrop click or Escape
document.addEventListener('click', function (e) {
    const modal = document.getElementById('galleryDetailModal');
    if (modal && e.target === modal) {
        closeGalleryDetail();
    }
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeGalleryDetail();
    }
});

// Initialize all new features
document.addEventListener('DOMContentLoaded', () => {
    initTypingText();
    initCardTilt();
    initParticles();
    initTestimonialCarousel();
    initLightbox();
    initParallax();
    initSmoothCounters();
});

