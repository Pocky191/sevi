/* ═══════════════════════════════════════════════════
   kbg.clo — main.js
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── STATE ──────────────────────────────────────── */
let cart = [];
let currentProduct = {};

/* ── PAGE LOADER ────────────────────────────────── */
(function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loaderFill');
    const loaderText = document.getElementById('loaderText');

    const phrases = [
        'Loading Collection...',
        'Preparing Drop...',
        'Built Different...',
        'Almost Ready...'
    ];

    let progress = 0;
    let phraseIdx = 0;

    const interval = setInterval(() => {
        // Random speed for realism
        progress += Math.random() * 18 + 4;
        if (progress > 100) progress = 100;
        fill.style.width = progress + '%';

        if (progress > 30 && phraseIdx === 0) { loaderText.textContent = phrases[1]; phraseIdx = 1; }
        if (progress > 60 && phraseIdx === 1) { loaderText.textContent = phrases[2]; phraseIdx = 2; }
        if (progress > 85 && phraseIdx === 2) { loaderText.textContent = phrases[3]; phraseIdx = 3; }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('hidden');
                initScrollReveal();
            }, 300);
        }
    }, 60);
})();

/* ── CUSTOM CURSOR ──────────────────────────────── */
(function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Smooth follower with RAF
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Scale on interactive elements
    document.querySelectorAll('a, button, .product-card, .arrival-card, .payment-opt').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
})();

/* ── NAV SCROLL EFFECT ──────────────────────────── */
(function initNavScroll() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
})();

/* ── SCROLL REVEAL ──────────────────────────────── */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger delay based on position in grid
                const delay = parseFloat(entry.target.style.animationDelay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay * 1000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

/* ── MOBILE MENU ────────────────────────────────── */
function toggleMobileMenu() {
    const links = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    links.classList.toggle('mobile-open');
    hamburger.classList.toggle('active');
}

/* ── PRODUCT MODAL ──────────────────────────────── */
function openProduct(name, cat, price, desc, frontImg, backImg) {
    currentProduct = { name, cat, price, desc };

    document.getElementById('modalName').textContent = name;
    document.getElementById('modalCat').textContent = cat;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('modalDesc').textContent = desc;

    // Set images on both slides
    document.getElementById('modalImgFront').innerHTML = `
        <img src="${frontImg}" alt="${name} - Front" class="product-img-modal">
        <span class="modal-view-tag">FRONT</span>
    `;

    document.getElementById('modalImgBack').innerHTML = `
        <img src="${backImg}" alt="${name} - Back" class="product-img-modal">
        <span class="modal-view-tag">BACK</span>
    `;

    // Reset to front slide
    modalImgGoTo(0);

    // Random review count for variety
    const reviewCount = Math.floor(Math.random() * 80) + 12;
    document.querySelector('.rating-count').textContent = `(${reviewCount} reviews)`;

    // Reset size selection
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.size-btn')[1]?.classList.add('active'); // default M

    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
}

/* ── MODAL IMAGE VIEWER ─────────────────────────── */
(function initModalImgSlider() {
    let current = 0;

    function goTo(idx) {
        const slides = document.querySelectorAll('.modal-img-slide');
        const dots = document.querySelectorAll('.modal-slide-dot');
        const next = (idx + slides.length) % slides.length;

        if (next === current && slides[current].classList.contains('active')) return;

        // Capture outgoing slide before mutating current
        const outgoing = slides[current];
        outgoing.classList.remove('active');
        outgoing.classList.add('slide-left');
        setTimeout(() => outgoing.classList.remove('slide-left'), 450);

        current = next;
        slides[current].classList.add('active');
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    // Touch / swipe
    const viewer = document.getElementById('modalImgViewer');
    let touchX = 0;
    if (viewer) {
        viewer.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
        viewer.addEventListener('touchend', e => {
            const diff = touchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
        }, { passive: true });
    }

    // Expose globally
    window.modalImgSlide = (dir) => goTo(current + dir);
    window.modalImgGoTo = (idx) => goTo(idx);
})();

function closeModalOutside(e) {
    if (e.target === document.getElementById('productModal')) closeModal();
}

function selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

/* ── CART ───────────────────────────────────────── */
function addToCart() {
    const size = document.querySelector('.size-btn.active')?.textContent || 'M';
    const priceNum = parseInt(currentProduct.price.replace(/[^0-9]/g, ''), 10);

    cart.push({ ...currentProduct, size, priceNum, id: Date.now() });
    updateCart();
    closeModal();
    showToast('Added — ' + currentProduct.name);
    animateBadge();
}

function animateBadge() {
    const badge = document.getElementById('cartBadge');
    badge.style.animation = 'none';
    badge.offsetHeight; // reflow
    badge.style.animation = 'pop .3s var(--ease-out-expo)';
}

function updateCart() {
    const total = cart.reduce((sum, item) => sum + item.priceNum, 0);

    document.getElementById('cartBadge').textContent = cart.length;
    document.getElementById('cartTotal').textContent = '₱' + total.toLocaleString();

    const itemsEl = document.getElementById('cartItems');

    if (!cart.length) {
        itemsEl.innerHTML = '<p class="cart-empty">YOUR CART IS EMPTY</p>';
        return;
    }

    itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.name.slice(0, 2).toUpperCase()}</div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-sub">Size: ${item.size} — ${item.cat}</div>
      </div>
      <div class="cart-item-price">${item.price}</div>
    </div>
  `).join('');
}

function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('open');
}

/* ── CHECKOUT ───────────────────────────────────── */
function goToCheckout() {
    if (!cart.length) {
        showToast('Your cart is empty!');
        return;
    }

    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('homeContent').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    document.getElementById('checkout').classList.add('visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Populate order summary
    const total = cart.reduce((sum, item) => sum + item.priceNum, 0);
    document.getElementById('summaryTotal').textContent = '₱' + (total + 150).toLocaleString();

    document.getElementById('summaryItems').innerHTML =
        cart.map(item => `
      <div class="summary-item">
        <span class="summary-item-name">${item.name} (${item.size})</span>
        <span class="summary-item-price">${item.price}</span>
      </div>
    `).join('') +
        `<div class="summary-item">
       <span class="summary-item-name">Shipping</span>
       <span class="summary-item-price">₱150</span>
     </div>`;
}

function showHome() {
    document.getElementById('homeContent').style.display = '';
    document.querySelector('footer').style.display = '';
    document.getElementById('checkout').classList.remove('visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectPayment(el) {
    document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
}

function placeOrder() {
    // Simple validation
    const inputs = document.querySelectorAll('#checkout .form-input');
    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#c0392b';
            allFilled = false;
            setTimeout(() => { input.style.borderColor = ''; }, 2000);
        }
    });

    if (!allFilled) {
        showToast('Please fill in all fields');
        return;
    }

    showToast('Order placed! Salamat 🙏');
    cart = [];
    updateCart();
    setTimeout(() => showHome(), 2000);
}

/* ── TOAST ──────────────────────────────────────── */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── KEYBOARD NAVIGATION ────────────────────────── */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        document.getElementById('cartDrawer').classList.remove('open');
    }
});

/* ── HERO SLIDER ────────────────────────────────── */
(function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const fill = document.getElementById('sliderProgress');
    const DELAY = 5000; // ms per slide

    let current = 0;
    let timer = null;
    let startTime = null;
    let raf = null;

    function goTo(idx) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');

        current = (idx + slides.length) % slides.length;

        slides[current].classList.add('active');
        dots[current].classList.add('active');

        resetProgress();
    }

    function resetProgress() {
        if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
        }
        cancelAnimationFrame(raf);
        startTime = performance.now();
        animateProgress();
    }

    function animateProgress() {
        const elapsed = performance.now() - startTime;
        const pct = Math.min((elapsed / DELAY) * 100, 100);
        if (fill) {
            fill.style.transition = 'none';
            fill.style.width = pct + '%';
        }
        if (pct < 100) {
            raf = requestAnimationFrame(animateProgress);
        }
    }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), DELAY);
        resetProgress();
    }

    function stopAuto() {
        clearInterval(timer);
        cancelAnimationFrame(raf);
    }

    // Pause on hover
    const slider = document.getElementById('heroSlider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);
    }

    // Touch / swipe support
    let touchStartX = 0;
    if (slider) {
        slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        slider.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
            startAuto();
        }, { passive: true });
    }

    startAuto();

    // Expose for HTML onclick
    window.heroSlide = (dir) => { goTo(current + dir); startAuto(); };
    window.heroGoTo = (idx) => { goTo(idx); startAuto(); };
})();

/* ── PARALLAX HERO TEXT ─────────────────────────── */
(function initParallax() {
    const heroText = document.querySelector('.hero-bg-text');
    if (!heroText) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        heroText.style.transform = `translateY(${scrolled * 0.2}px)`;
    }, { passive: true });
})();

/* ── MAGNETIC BUTTONS ───────────────────────────── */
(function initMagneticButtons() {
    document.querySelectorAll('.btn-primary, .btn-outline, .nav-cart').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform .4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
    });
})();

/* ── TILT CARDS ─────────────────────────────────── */
(function initTiltCards() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform .5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .4s';
        });
    });
})();

/* ── MARQUEE PAUSE ON HOVER ─────────────────────── */
(function initMarquee() {
    const inner = document.querySelector('.marquee-inner');
    if (!inner) return;
    inner.parentElement.addEventListener('mouseenter', () => inner.style.animationPlayState = 'paused');
    inner.parentElement.addEventListener('mouseleave', () => inner.style.animationPlayState = 'running');
})();

/* ── SMOOTH ANCHOR LINKS ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile menu if open
            document.getElementById('navLinks')?.classList.remove('mobile-open');
            document.getElementById('hamburger')?.classList.remove('active');
        }
    });
});