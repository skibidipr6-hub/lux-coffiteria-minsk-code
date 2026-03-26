// ===== PAGE LOADER =====
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const pageLoader = document.getElementById('pageLoader');
window.addEventListener('load', () => {
    setTimeout(() => {
        pageLoader.classList.add('hidden');
    }, 2000);
});

// ===== Header scroll effect =====
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Burger menu =====
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.classList.toggle('nav-open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.classList.remove('nav-open');
    });
});

// ===== Menu tabs =====
const tabs = document.querySelectorAll('.menu-tab');
const contents = document.querySelectorAll('.menu-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// ===== Hero particles =====
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
    const particleCount = isTouchDevice ? 8 : 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('hero-particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }
}

// ===== Scroll animations =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
    '.feature-card, .menu-item, .gallery-item, .contact-info, .contact-map, .about-text, .about-image, .booking-info, .booking-form, .sub-card, .review-form-wrapper'
).forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ===== Counter animation =====
const counters = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = +entry.target.dataset.target;
            let current = 0;
            const step = Math.ceil(target / 60);
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                entry.target.textContent = current.toLocaleString('ru-RU');
            }, 25);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

// ===== Active nav on scroll =====
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) {
            if (scrollY >= top && scrollY < top + height) {
                link.style.color = '#fff';
            } else {
                link.style.color = '';
            }
        }
    });
});

// ===== Booking form — send to backend =====
const bookingForm = document.getElementById('bookingForm');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalOk = document.getElementById('modalOk');

// Set min date to today
const dateInput = document.getElementById('date');
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
dateInput.setAttribute('min', today);

bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        guests: document.getElementById('guests').value,
        zone: document.getElementById('zone').value,
        wishes: document.getElementById('wishes').value.trim()
    };

    if (!data.name || !data.phone || !data.date || !data.time) return;

    try {
        const res = await fetch('/.netlify/functions/send-tg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, type: 'booking' })
        });
        if (res.ok) {
            modalOverlay.classList.add('active');
            bookingForm.reset();
        } else {
            alert('Не удалось отправить бронирование. Попробуйте ещё раз.');
        }
    } catch {
        alert('Ошибка сети. Проверьте подключение и попробуйте ещё раз.');
    }
});

function closeModal() {
    modalOverlay.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
modalOk.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// ===== Phone mask =====
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');

    if (val.startsWith('375')) {
        val = val.slice(3);
    } else if (val.startsWith('8')) {
        val = val.slice(1);
    }

    let formatted = '+375';
    if (val.length > 0) formatted += ' (' + val.slice(0, 2);
    if (val.length >= 2) formatted += ') ' + val.slice(2, 5);
    if (val.length >= 5) formatted += '-' + val.slice(5, 7);
    if (val.length >= 7) formatted += '-' + val.slice(7, 9);

    e.target.value = val.length > 0 ? formatted : '';
});

// ===== Star Rating =====
const starRating = document.getElementById('starRating');
const ratingInput = document.getElementById('reviewRating');
const stars = starRating.querySelectorAll('.star');

function setStars(value) {
    stars.forEach(star => {
        const v = parseInt(star.dataset.value);
        star.classList.toggle('active', v <= value);
    });
    ratingInput.value = value;
}

stars.forEach(star => {
    star.addEventListener('click', () => {
        setStars(parseInt(star.dataset.value));
    });

    star.addEventListener('mouseenter', () => {
        const val = parseInt(star.dataset.value);
        stars.forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.value) <= val);
        });
    });
});

starRating.addEventListener('mouseleave', () => {
    setStars(parseInt(ratingInput.value));
});

// ===== Reviews — no DB on Netlify, show placeholder =====
const reviewsGrid = document.getElementById('reviewsGrid');
reviewsGrid.innerHTML = '<div class="reviews-empty">Пока нет отзывов. Станьте первым!</div>';

function renderReviews(reviews) {
    if (reviews.length === 0) {
        reviewsGrid.innerHTML = '<div class="reviews-empty">Пока нет отзывов. Станьте первым!</div>';
        return;
    }

    reviewsGrid.innerHTML = reviews.map(r => {
        const starsHtml = '&#9733;'.repeat(r.rating) + '<span style="opacity:0.2">' + '&#9733;'.repeat(5 - r.rating) + '</span>';
        const date = new Date(r.created_at).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const escapedText = r.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const escapedName = r.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `
            <div class="review-card">
                <div class="stars">${starsHtml}</div>
                <p class="review-text">"${escapedText}"</p>
                <div class="review-meta">
                    <span class="review-author">— ${escapedName}</span>
                    <span class="review-date">${date}</span>
                </div>
            </div>
        `;
    }).join('');

    // Animate new cards
    reviewsGrid.querySelectorAll('.review-card').forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });
}

loadReviews();

// ===== Review form — send to backend =====
const reviewForm = document.getElementById('reviewForm');
const reviewModalOverlay = document.getElementById('reviewModalOverlay');
const reviewModalClose = document.getElementById('reviewModalClose');
const reviewModalOk = document.getElementById('reviewModalOk');

reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('reviewName').value.trim(),
        rating: parseInt(ratingInput.value),
        text: document.getElementById('reviewText').value.trim()
    };

    if (!data.name || !data.text) return;

    try {
        const res = await fetch('/.netlify/functions/send-tg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, type: 'review' })
        });

        if (res.ok) {
            reviewModalOverlay.classList.add('active');
            reviewForm.reset();
            setStars(5);
        } else {
            alert('Не удалось отправить отзыв. Попробуйте ещё раз.');
        }
    } catch {
        alert('Не удалось отправить отзыв. Проверьте подключение.');
    }
});

function closeReviewModal() {
    reviewModalOverlay.classList.remove('active');
}

reviewModalClose.addEventListener('click', closeReviewModal);
reviewModalOk.addEventListener('click', closeReviewModal);

reviewModalOverlay.addEventListener('click', (e) => {
    if (e.target === reviewModalOverlay) closeReviewModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeReviewModal();
        closeLightbox();
        closeMenuModal();
    }
});

// ===================================================
// MENU ITEM MODAL
// ===================================================
const menuModal = document.getElementById('menuModal');
const menuModalClose = document.getElementById('menuModalClose');

document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
        const img = card.querySelector('.menu-card-img');
        const badge = card.querySelector('.menu-card-badge');
        const title = card.querySelector('.menu-card-title');
        const desc = card.querySelector('.menu-card-desc');
        const tags = card.querySelector('.menu-card-tags');
        const rating = card.querySelector('.menu-card-rating');
        const reviews = card.querySelector('.menu-card-reviews');

        document.getElementById('menuModalImg').src = img.src;
        document.getElementById('menuModalImg').alt = img.alt;
        document.getElementById('menuModalBadge').textContent = badge ? badge.textContent : '';
        document.getElementById('menuModalTitle').textContent = title ? title.textContent : '';
        document.getElementById('menuModalDesc').textContent = desc ? desc.textContent : '';
        document.getElementById('menuModalTags').innerHTML = tags ? tags.innerHTML : '';
        document.getElementById('menuModalRating').innerHTML = rating ? rating.innerHTML : '';
        document.getElementById('menuModalReviews').innerHTML = reviews ? reviews.innerHTML : '';

        menuModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeMenuModal() {
    menuModal.classList.remove('active');
    document.body.style.overflow = '';
}

menuModalClose.addEventListener('click', closeMenuModal);
menuModal.addEventListener('click', (e) => {
    if (e.target === menuModal) closeMenuModal();
});

// ----- Scroll Progress Bar -----
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;
    scrollProgress.style.width = (scrolled / total * 100) + '%';
});

// ----- Opening Hours Timer -----
function updateTimer() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 6=Sat
    const h = now.getHours();
    const m = now.getMinutes();

    const isWeekend = day === 0 || day === 6;
    const openH = isWeekend ? 9 : 7;
    const openM = isWeekend ? 0 : 30;
    const closeH = isWeekend ? 23 : 22;

    const totalMins = h * 60 + m;
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60;

    const timerText = document.getElementById('timerText');
    const navTimer = document.getElementById('navTimer');

    if (totalMins >= openMins && totalMins < closeMins) {
        const remaining = closeMins - totalMins;
        const rH = Math.floor(remaining / 60);
        const rM = remaining % 60;

        if (remaining <= 60) {
            timerText.textContent = `Закрываемся через ${remaining} мин`;
            navTimer.classList.add('closing');
        } else {
            timerText.textContent = `Открыто · закрытие в ${closeH}:00`;
            navTimer.classList.remove('closing');
        }
    } else {
        const nextDay = (day + 1) % 7;
        const nextIsWeekend = nextDay === 0 || nextDay === 6;
        const nextOpen = nextIsWeekend ? '9:00' : '7:30';
        timerText.textContent = `Закрыто · откроемся в ${nextOpen}`;
        navTimer.classList.add('closing');
    }
}
updateTimer();
setInterval(updateTimer, 30000);

// ----- Char Reveal (Hero h1) -----
function splitChars(el) {
    const text = el.textContent;
    el.innerHTML = text.split('').map((ch, i) => {
        if (ch === ' ') return '<span class="char" style="display:inline">&nbsp;</span>';
        return `<span class="char" style="transition-delay:${i * 0.04}s">${ch}</span>`;
    }).join('');
}

document.querySelectorAll('.char-reveal').forEach(el => {
    splitChars(el);
    // Trigger after loader
    setTimeout(() => el.classList.add('visible'), 2200);
});

// ----- 3D Tilt Cards (desktop only) -----
function initTilt(selector) {
    if (isTouchDevice) return;
    document.querySelectorAll(selector).forEach(card => {
        // Add shine overlay
        const shine = document.createElement('div');
        shine.classList.add('tilt-shine');
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(shine);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const x = e.clientX - rect.left - cx;
            const y = e.clientY - rect.top - cy;
            const rotX = (-y / cy) * 8;
            const rotY = (x / cx) * 8;

            const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
            const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
            shine.style.setProperty('--mx', mx + '%');
            shine.style.setProperty('--my', my + '%');

            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease';
        });
    });
}

initTilt('.feature-card');
initTilt('.sub-card');

// ----- Magnetic Buttons (desktop only) -----
if (!isTouchDevice) {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
            btn.style.transition = 'transform 0.1s ease';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0,0)';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        });
    });
}

// ----- Gallery Lightbox -----
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
let currentLightboxIdx = 0;

function openLightbox(idx) {
    currentLightboxIdx = idx;
    const item = galleryItems[idx];
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function prevLightbox() {
    currentLightboxIdx = (currentLightboxIdx - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentLightboxIdx);
}

function nextLightbox() {
    currentLightboxIdx = (currentLightboxIdx + 1) % galleryItems.length;
    openLightbox(currentLightboxIdx);
}

galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', prevLightbox);
lightboxNext.addEventListener('click', nextLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// Swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? nextLightbox() : prevLightbox();
});

// ----- Parallax Hero Background (desktop only) -----
const heroSection = document.querySelector('.hero');
if (!isTouchDevice) {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            heroSection.style.backgroundPositionY = `calc(50% + ${scrolled * 0.4}px)`;
        }
    }, { passive: true });
}

// ----- Hours Bar dynamic -----
function updateHoursBar() {
    const now = new Date();
    const day = now.getDay();
    const h = now.getHours();
    const hoursText = document.getElementById('hoursText');

    if (!hoursText) return;
    const isWeekend = day === 0 || day === 6;
    const closeH = isWeekend ? 23 : 22;
    const openH = isWeekend ? 9 : 7;

    const totalMins = h * 60 + now.getMinutes();
    const openMins = openH * 60 + (isWeekend ? 0 : 30);
    const closeMins = closeH * 60;

    if (totalMins >= openMins && totalMins < closeMins) {
        hoursText.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;opacity:0.7"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Сейчас открыто · работаем до ${closeH}:00 · пр-т Независимости, 28`;
    } else {
        hoursText.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;opacity:0.7"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Сейчас закрыто · откроемся в ${isWeekend ? '9:00' : '7:30'} · пр-т Независимости, 28`;
    }
}
updateHoursBar();

// ----- Reveal Line elements -----
document.querySelectorAll('.section-title').forEach(el => {
    const inner = document.createElement('span');
    inner.classList.add('inner');
    inner.innerHTML = el.innerHTML;
    el.innerHTML = '';
    el.classList.add('reveal-line');
    el.appendChild(inner);
    observer.observe(el);
});

// ----- Add tilt to review cards after load -----
setTimeout(() => {
    initTilt('.review-card');
}, 3000);

// ===== Coffee Subscription =====
const subModalOverlay = document.getElementById('subModalOverlay');
const subSuccessOverlay = document.getElementById('subSuccessOverlay');

window.openSubModal = function(plan, price) {
    document.getElementById('subForm').reset();
    document.getElementById('subPlan').value = plan;
    document.getElementById('subPrice').value = price;
    document.getElementById('subModalPlanLabel').textContent = `Тариф: ${plan} — ${price}`;
    subModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
};

function closeSubModal() {
    subModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function closeSubSuccess() {
    subSuccessOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('subModalClose').addEventListener('click', closeSubModal);
document.getElementById('subSuccessClose').addEventListener('click', closeSubSuccess);
document.getElementById('subSuccessOk').addEventListener('click', closeSubSuccess);

subModalOverlay.addEventListener('click', (e) => {
    if (e.target === subModalOverlay) closeSubModal();
});

subSuccessOverlay.addEventListener('click', (e) => {
    if (e.target === subSuccessOverlay) closeSubSuccess();
});

// Phone mask for subscription form
const subPhoneInput = document.getElementById('subPhone');
subPhoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('375')) val = val.slice(3);
    else if (val.startsWith('8')) val = val.slice(1);
    let formatted = '+375';
    if (val.length > 0) formatted += ' (' + val.slice(0, 2);
    if (val.length >= 2) formatted += ') ' + val.slice(2, 5);
    if (val.length >= 5) formatted += '-' + val.slice(5, 7);
    if (val.length >= 7) formatted += '-' + val.slice(7, 9);
    e.target.value = val.length > 0 ? formatted : '';
});

document.getElementById('subForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        plan: document.getElementById('subPlan').value,
        price: document.getElementById('subPrice').value,
        name: document.getElementById('subName').value.trim(),
        phone: document.getElementById('subPhone').value.trim(),
        email: document.getElementById('subEmail').value.trim(),
    };
    if (!data.name || !data.phone || !data.plan) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnTextEl = submitBtn.querySelector('.sub-btn-text');
    submitBtn.disabled = true;
    if (btnTextEl) btnTextEl.textContent = 'Отправка...';

    try {
        const res = await fetch('/.netlify/functions/send-tg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, type: 'subscription' })
        });
        if (res.ok) {
            closeSubModal();
            subSuccessOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            alert('Не удалось отправить заявку. Попробуйте ещё раз.');
        }
    } catch {
        alert('Ошибка сети. Проверьте подключение и попробуйте ещё раз.');
    } finally {
        submitBtn.disabled = false;
        if (btnTextEl) btnTextEl.textContent = 'Отправить заявку';
    }
});

// Also close sub modals on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSubModal();
        closeSubSuccess();
    }
});

// ----- Copy on click (IBAN / phone) -----
document.querySelectorAll('.payment-copy').forEach(el => {
    el.addEventListener('click', () => {
        const text = el.textContent.replace(/\s/g, '');
        navigator.clipboard.writeText(text).then(() => {
            el.classList.add('copied');
            const orig = el.textContent;
            el.textContent = 'Скопировано!';
            setTimeout(() => {
                el.textContent = orig;
                el.classList.remove('copied');
            }, 1500);
        });
    });
});


