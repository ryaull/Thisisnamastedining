// --- GOOGLE LOGIN & PROFILE ---
import { auth, GoogleAuthProvider, signInWithPopup } from '/js/config/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

function showProfile(email) {
    const googleLoginContainer = document.getElementById('googleLoginContainer');
    const profileContainer = document.getElementById('profileContainer');
    const profileEmail = document.getElementById('profileEmail');
    if (googleLoginContainer) googleLoginContainer.style.display = 'none';
    if (profileContainer) profileContainer.style.display = 'block';
    if (profileEmail) profileEmail.textContent = email;
}

function hideProfile() {
    const googleLoginContainer = document.getElementById('googleLoginContainer');
    const profileContainer = document.getElementById('profileContainer');
    const profileEmail = document.getElementById('profileEmail');
    if (googleLoginContainer) googleLoginContainer.style.display = 'block';
    if (profileContainer) profileContainer.style.display = 'none';
    if (profileEmail) profileEmail.textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('googleBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (googleBtn) {
        googleBtn.onclick = async () => {
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                showProfile(result.user.email);
            } catch (error) {
                alert('Google login failed: ' + error.message);
            }
        };
    }
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await signOut(auth);
            hideProfile();
        };
    }
    onAuthStateChanged(auth, (user) => {
        if (user) {
            showProfile(user.email);
        } else {
            hideProfile();
        }
    });
});
// Menu Data
const menuItems = [
    {
        category: 'Starters',
        items: []
    },
    {
        category: 'Main Courses',
        items: []
    },
    {
        category: 'Desserts',
        items: []
    }
];

// Album-style gallery using hero-image images
const albumImages = [
  { src: 'unnamed.jpg', alt: 'Restaurant Ambience' },
  { src: 'unnamed (1).jpg', alt: 'Signature Dish 1' },
  { src: 'unnamed (2).jpg', alt: 'Signature Dish 2' },
  { src: 'unnamed (3).jpg', alt: 'Signature Dish 3' },
  { src: 'unnamed (4).jpg', alt: 'Signature Dish 4' },
  { src: 'unnamed (5).jpg', alt: 'Signature Dish 5' },
  { src: 'unnamed (6).jpg', alt: 'Signature Dish 6' },
  { src: 'unnamed (7).jpg', alt: 'Signature Dish 7' },
  { src: 'unnamed (8).jpg', alt: 'Signature Dish 8' },
  { src: 'unnamed (9).jpg', alt: 'Signature Dish 9' },
  { src: 'unnamed (10).jpg', alt: 'Signature Dish 10' },
  { src: 'unnamed (11).jpg', alt: 'Signature Dish 11' },
  { src: 'unnamed (12).jpg', alt: 'Signature Dish 12' },
  { src: 'unnamed (13).jpg', alt: 'Signature Dish 13' },
  { src: 'unnamed (14).jpg', alt: 'Signature Dish 14' }
];

// 360° Interior Views Data
const interiorViews = [
    {title: 'Entrance View', embed: 'https://www.google.com/maps/embed?pb=!4v1754068231556!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRFo5WURsY3c.!2m2!1d52.90827286341877!2d-0.6383419752452977!3f160!4f0!5f0.7820865974627469'},
    {title: 'Dining Area 1', embed: 'https://www.google.com/maps/embed?pb=!4v1754068257565!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRFo5WURsY3c.!2m2!1d52.90827286341877!2d-0.6383419752452977!3f160!4f0!5f0.7820865974627469'},
    {title: 'Dining Area 2', embed: 'https://www.google.com/maps/embed?pb=!4v1754068272047!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRFo5WUNqSUE.!2m2!1d52.90826672926959!2d-0.6383717542317107!3f359.88742!4f30!5f0.7820865974627469'},
    {title: 'Bar Area', embed: 'https://www.google.com/maps/embed?pb=!4v1754068288543!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJRFo5WUN1endF!2m2!1d52.90827899807161!2d-0.6383121009847854!3f160!4f0!5f0.7820865974627469'},
    {title: 'Outdoor Seating', embed: 'https://www.google.com/maps/embed?pb=!4v1754068303961!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRFo5WUNhVVE.!2m2!1d52.90827892159662!2d-0.638280558253413!3f80!4f0!5f0.7820865974627469'},
    {title: 'Private Dining', embed: 'https://www.google.com/maps/embed?pb=!4v1754068321293!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJRFp0Zl96dUFF!2m2!1d52.90825499715558!2d-0.6382091086532687!3f260!4f20!5f0.7820865974627469'}
];

// Initialize the page
// --- ENHANCED FRONTEND ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
            // Close mobile menu when clicking a link
            const navLinksAll = document.querySelectorAll('.nav-links a');
            if (navLinksAll) {
                navLinksAll.forEach(link => {
                    link.addEventListener('click', () => {
                        if (hamburger) hamburger.classList.remove('active');
                        if (navLinks) navLinks.classList.remove('active');
                    });
                });
            }
        }
        // Header scroll effect
        const header = document.querySelector('.header');
        if (header) {
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            });
        }
        // Theme switcher
        const themeBtns = document.querySelectorAll('.theme-btn');
        if (themeBtns) {
            themeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (document.documentElement) document.documentElement.setAttribute('data-theme', btn.dataset.theme);
                    themeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        }
        // --- BACK TO TOP BUTTON ---
        const backToTopBtn = document.getElementById('backToTopBtn');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn && backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn && backToTopBtn.classList.remove('visible');
            }
        });
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        // --- TAB UNDERLINE ANIMATION ---
        const menuTabsScroll = document.getElementById('menuTabsScroll');
        if (menuTabsScroll) {
            let underline = document.createElement('div');
            underline.className = 'tab-underline';
            menuTabsScroll.appendChild(underline);
            function moveUnderline() {
                const activeBtn = menuTabsScroll.querySelector('.tab-btn.active');
                if (activeBtn) {
                    const rect = activeBtn.getBoundingClientRect();
                    const parentRect = menuTabsScroll.getBoundingClientRect();
                    underline.style.width = rect.width + 'px';
                    underline.style.left = (rect.left - parentRect.left + menuTabsScroll.scrollLeft) + 'px';
                }
            }
            menuTabsScroll.addEventListener('scroll', moveUnderline);
            window.addEventListener('resize', moveUnderline);
            menuTabsScroll.addEventListener('click', e => {
                if (e.target.classList.contains('tab-btn')) setTimeout(moveUnderline, 10);
            });
            setTimeout(moveUnderline, 300);
        }
        // --- BUTTON RIPPLE EFFECT ---
        function addRippleEffect(el) {
            el.addEventListener('click', function(e) {
                const rect = el.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.left = (e.clientX - rect.left) + 'px';
                ripple.style.top = (e.clientY - rect.top) + 'px';
                ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
                el.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        }
        document.querySelectorAll('.btn, .tab-btn').forEach(addRippleEffect);
        // --- HERO TITLE ANIMATION ---
        const heroTitle = document.querySelector('.hero-title .namaste-crimson');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.innerHTML = '';
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                span.style.transform = 'translateY(20px)';
                span.style.transition = `all 0.5s cubic-bezier(0.5, 1, 0.89, 1) ${i * 0.05}s`;
                setTimeout(() => {
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                }, 100 + i * 50);
                heroTitle.appendChild(span);
            });
        }
        // Initialize components with error handling
        try {
            renderMenu();
            renderGallery();
            setupSmoothScrolling();
            setupAnimations();
            renderInteriorViews();
        } catch (error) {
            console.error('Initialization error:', error);
            // Show fallback message in gallery
            const gallery = document.querySelector('.gallery-carousel');
            if (gallery) {
                gallery.innerHTML = '<div style="padding:2em;text-align:center;color:#bfa16c;font-size:1.2em;">Food Gallery failed to load. Please refresh or check your connection.</div>';
            }
        }
        // Newsletter form feedback
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const feedback = document.getElementById('newsletterFeedback');
                if (feedback) {
                    feedback.style.display = 'block';
                    feedback.textContent = 'Thank you for subscribing!';
                    setTimeout(() => { feedback.style.display = 'none'; }, 3000);
                }
                newsletterForm.reset();
            });
        }
        // Book table form feedback
        // Gallery modal logic
        const galleryModal = document.getElementById('galleryModal');
        const galleryModalImg = document.getElementById('galleryModalImg');
        const galleryModalCaption = document.getElementById('galleryModalCaption');
        const galleryModalClose = document.querySelector('.gallery-modal-close');
        let currentGalleryIndex = 0;
        function openGalleryModal(index) {
            if (galleryModalImg && galleryModalCaption) {
                const image = albumImages[index];
                galleryModalImg.src = `/hero-image/${image.src}`;
                galleryModalImg.alt = image.alt;
                galleryModalCaption.textContent = image.alt;
            }
            if (galleryModal) galleryModal.classList.add('active');
            currentGalleryIndex = index;
        }
        function closeGalleryModal() {
            if (galleryModal) galleryModal.classList.remove('active');
        }
        if (galleryModalClose) {
            galleryModalClose.addEventListener('click', closeGalleryModal);
        }
        if (galleryModal) {
            galleryModal.addEventListener('click', function(e) {
                if (e.target === galleryModal) closeGalleryModal();
            });
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Render menu items with container check
function renderMenu() {
    const menuContainer = document.querySelector('.menu-grid');
    if (!menuContainer) {
        console.error('Menu container not found');
        return;
    }
    menuContainer.innerHTML = '<div class="loading-indicator">Loading menu...</div>';
    setTimeout(() => {
        menuContainer.innerHTML = '';
        menuItems.forEach(category => {
            category.items.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.dataset.category = category.category.toLowerCase().replace(' ', '-');
                
                menuItem.innerHTML = `
                    <div class="menu-item-image">
                        <i class="${item.icon}"></i>
                    </div>
                    <div class="menu-item-content">
                        <h4>${item.name} <span>£${item.price.toFixed(2)}</span></h4>
                        <p>${item.description}</p>
                    </div>
                `;
                
                menuContainer.appendChild(menuItem);
            });
        });
        
        // Tab functionality
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update active tab
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Filter menu items
                    const category = btn.dataset.category;
                    const menuItems = document.querySelectorAll('.menu-item');
                    
                    menuItems.forEach(item => {
                        if (item.dataset.category === category) {
                            item.style.display = 'flex';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
        }
    }, 500); // Simulate loading
}

// Render gallery images
function renderGallery() {
  const galleryGrid = document.querySelector('.food-gallery-grid');
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';
  albumImages.forEach((image, idx) => {
    const gridItem = document.createElement('div');
    gridItem.className = 'food-gallery-item';
    const img = document.createElement('img');
    img.src = `/hero-image/${image.src}`;
    img.alt = image.alt;
    img.tabIndex = 0;
    img.style.cursor = 'pointer';
    img.onerror = function() {
      gridItem.innerHTML = `<div style='padding:2em;text-align:center;color:#fff;background:#3498db;'>Image failed to load:<br>${img.src}</div>`;
    };
    img.addEventListener('click', () => openGalleryModal(idx));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openGalleryModal(idx);
    });
    gridItem.appendChild(img);
    galleryGrid.appendChild(gridItem);
  });
}

// Render Interior Views
function renderInteriorViews() {
    const container = document.querySelector('.interiors-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'interior-modal';
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <iframe id="interior-modal-iframe" allowfullscreen loading="lazy"></iframe>
    `;
    if (document.body) document.body.appendChild(modal);
    
    // Add click handlers
    const modalClose = modal.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    // Show only the first interior view, styled big and beautiful
    const view = interiorViews[0];
    const card = document.createElement('div');
    card.className = 'interior-card interior-card-featured';
    card.style.maxWidth = '1200px';
    card.style.margin = '48px auto';
    card.style.boxShadow = '0 12px 48px rgba(34,34,59,0.22), 0 4px 16px rgba(58,58,89,0.16)';
    card.style.borderRadius = '24px';
    card.style.overflow = 'hidden';
    card.style.display = 'flex';
    card.style.justifyContent = 'center';
    card.style.alignItems = 'center';
    card.innerHTML = `
        <div style="width:100%;height:700px;position:relative;display:flex;justify-content:center;align-items:center;">
            <iframe src="${view.embed}" loading="lazy" allowfullscreen style="width:100%;height:100%;border:none;border-radius:24px;"></iframe>
            <div style="position:absolute;bottom:32px;left:32px;background:rgba(0,0,0,0.65);color:#fff;padding:18px 36px;border-radius:12px;font-size:1.7rem;box-shadow:0 4px 16px rgba(0,0,0,0.22);">
                <i class="fas fa-location-arrow" style="margin-right:12px;"></i>${view.title}
            </div>
        </div>
    `;
    container.appendChild(card);
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (anchors) {
        anchors.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Setup animations
function setupAnimations() {
    // Animate hero title letters
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const titleLines = document.querySelectorAll('.title-line');
        if (titleLines) {
            titleLines.forEach(line => {
                const text = line.textContent;
                line.innerHTML = '';
                text.split('').forEach((char, i) => {
                    const span = document.createElement('span');
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    span.style.display = 'inline-block';
                    span.style.opacity = '0';
                    span.style.transform = 'translateY(20px)';
                    span.style.transition = `all 0.5s cubic-bezier(0.5, 1, 0.89, 1) ${i * 0.05}s`;
                    setTimeout(() => {
                        span.style.opacity = '1';
                        span.style.transform = 'translateY(0)';
                    }, 100);
                    line.appendChild(span);
                });
            });
        }
    }

    // Intersection Observer for scroll animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.section, .info-card');
    if (sections) {
        sections.forEach(el => {
            observer.observe(el);
        });
    }
}