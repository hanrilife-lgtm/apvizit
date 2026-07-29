document.addEventListener('DOMContentLoaded', function() {

    // ─── ПРОВЕРКА КОНФИГА ──────────────────────────────

    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG не загружен!');
        console.warn('📌 Для работы формы создайте config.js со своими данными');
    }

    const TELEGRAM_TOKEN = CONFIG ? CONFIG.TELEGRAM_TOKEN : null;
    const TELEGRAM_CHAT_ID = CONFIG ? CONFIG.TELEGRAM_CHAT_ID : null;
    const VK_PROFILE_URL = CONFIG ? CONFIG.VK_PROFILE_URL : 'https://vk.com/idsanapolozkov';

    // ─── ПРЕЛОАДЕР ──────────────────────────────────────

    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1200);
    }

    // ─── ЭЛЕМЕНТЫ ──────────────────────────────────────

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const header = document.querySelector('header');
    const contactForm = document.getElementById('contactForm');

    // ─── ЧАСТИЦЫ (3D-фон) ─────────────────────────────

    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];

        function resize() {
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = (Math.random() - 0.5) * 0.8;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(124, 140, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < 80; i++) {
            particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ─── ПЛАВНЫЙ СКРОЛЛ ───────────────────────────────

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── ПОДСВЕТКА АКТИВНОЙ ССЫЛКИ ────────────────────

    function updateActiveLink() {
        const headerHeight = header.offsetHeight;
        const scrollPosition = window.scrollY + headerHeight + 60;
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        if (!currentSectionId && window.scrollY < 100) currentSectionId = 'heros';
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSectionId) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', updateActiveLink);
    setTimeout(updateActiveLink, 100);

    // ─── ХЕДЕР С БЛЮРОМ ───────────────────────────────

    function updateHeader() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', updateHeader);
    updateHeader();

    // ─── АНИМАЦИЯ ПОЯВЛЕНИЯ ───────────────────────────

    const animatedElements = document.querySelectorAll(
        '.service-card, .case-card, .review-card, .about-content, .guarantee-item'
    );
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });

    // ─── СЧЁТЧИК СТАТИСТИКИ ───────────────────────────

    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const originalText = stat.textContent;
        const numberMatch = originalText.match(/([\d.]+)/);
        const suffix = originalText.replace(numberMatch ? numberMatch[0] : '', '');
        if (numberMatch) {
            const targetNumber = parseFloat(numberMatch[0]);
            const isFloat = targetNumber % 1 !== 0;
            const observerStat = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateNumber(stat, targetNumber, suffix, isFloat);
                        observerStat.unobserve(stat);
                    }
                });
            }, { threshold: 0.3 });
            observerStat.observe(stat);
        }
    });

    function animateNumber(element, target, suffix, isFloat) {
        const duration = 1500;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const currentValue = target * ease;
            if (isFloat) {
                element.textContent = currentValue.toFixed(1) + suffix;
            } else {
                element.textContent = Math.round(currentValue) + suffix;
            }
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target + suffix;
            }
        }
        requestAnimationFrame(update);
    }

    // ─── КАЛЬКУЛЯТОР ──────────────────────────────────

    const calcRange = document.getElementById('calcRange');
    const calcPages = document.getElementById('calcPages');
    const calcTotal = document.getElementById('calcTotal');

    if (calcRange && calcPages && calcTotal) {
        function updateCalc() {
            const pages = parseInt(calcRange.value);
            calcPages.textContent = pages;
            let price = 10000;
            if (pages > 1) price = 10000 + (pages - 1) * 3000;
            if (pages > 10) price = 10000 + 9 * 3000 + (pages - 10) * 2000;
            calcTotal.textContent = price.toLocaleString('ru-RU') + ' ₽';
        }
        calcRange.addEventListener('input', updateCalc);
        updateCalc();
    }

    // ─── ОТПРАВКА В TELEGRAM ─────────────────────────

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('.submit-btn');
            const originalText = btn.innerHTML;

            if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
                btn.innerHTML = '⚠️ Настройте бота';
                btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
                btn.style.opacity = '1';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 4000);
                if (confirm('📌 Бот не настроен. Написать в ВКонтакте?')) {
                    window.open(VK_PROFILE_URL, '_blank');
                }
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '⏳ Отправка...';
            btn.style.opacity = '0.7';

            const name = this.querySelector('input[placeholder="Имя"]').value.trim();
            const phone = this.querySelector('input[placeholder="Телефон"]').value.trim();
            const contact = this.querySelector('input[placeholder*="связаться"]').value.trim() || 'Не указан';
            const message = this.querySelector('textarea').value.trim() || 'Без сообщения';

            const text = `📩 НОВАЯ ЗАЯВКА С APVIZIT

👤 Имя: ${name}
📞 Телефон: ${phone}
📱 Связь: ${contact}
📝 Сообщение: ${message}

🕐 ${new Date().toLocaleString('ru-RU')}
🌐 Отправлено с APVIZIT (2026)`;

            fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: text,
                    parse_mode: 'HTML'
                })
            })
            .then(response => {
                if (!response.ok) throw new Error('Ошибка сети');
                return response.json();
            })
            .then(data => {
                if (data.ok) {
                    btn.innerHTML = '✅ Отправлено!';
                    btn.style.background = 'linear-gradient(135deg, #2ed573, #26de81)';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    contactForm.reset();
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                    }, 3000);
                } else {
                    throw new Error(data.description || 'Ошибка');
                }
            })
            .catch(() => {
                btn.innerHTML = '❌ Ошибка';
                btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
                btn.disabled = false;
                btn.style.opacity = '1';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 4000);
                if (confirm('❌ Не удалось отправить через бота. Написать в ВКонтакте?')) {
                    window.open(VK_PROFILE_URL, '_blank');
                }
            });
        });
    }

    // ─── КНОПКА НАВЕРХ ────────────────────────────────

    const topBtn = document.createElement('button');
    topBtn.innerHTML = '↑';
    topBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4a5aff, #3a4aff);
        color: #fff;
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 9999;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease;
        box-shadow: 0 8px 28px rgba(60, 80, 255, 0.25);
        font-family: 'Segoe UI', Arial, sans-serif;
    `;
    document.body.appendChild(topBtn);

    topBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 12px 40px rgba(60, 80, 255, 0.4)';
    });
    topBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 8px 28px rgba(60, 80, 255, 0.25)';
    });
    topBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            topBtn.style.opacity = '1';
            topBtn.style.transform = 'translateY(0)';
        } else {
            topBtn.style.opacity = '0';
            topBtn.style.transform = 'translateY(20px)';
        }
    });

    // ─── ПРОГРЕСС-БАР ──────────────────────────────────

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #4a5aff, #7c3aed);
        z-index: 10000;
        transition: width 0.1s linear;
        border-radius: 0 3px 3px 0;
    `;
    document.body.prepend(progressBar);

    window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });

    // ─── ПЛАВАЮЩАЯ КНОПКА ──────────────────────────────

    const floatingBtn = document.createElement('a');
    floatingBtn.className = 'floating-btn';
    floatingBtn.href = '#contacts';
    floatingBtn.innerHTML = '<i class="bx bx-phone-call"></i> Связаться';
    document.body.appendChild(floatingBtn);

    // ─── БЫСТРЫЙ ЗАКАЗ (заполнение формы) ─────────────

    const orderBtns = document.querySelectorAll('.order-btn');
    const messageField = document.getElementById('formMessage');
    if (orderBtns.length && messageField) {
        orderBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const service = this.dataset.service || 'Услуга';
                messageField.value = `Заказ пакета: ${service}`;
                messageField.focus();
                messageField.style.borderColor = '#2ed573';
                setTimeout(() => {
                    messageField.style.borderColor = '';
                }, 3000);
            });
        });
    }

    // ─── ИНИЦИАЛИЗАЦИЯ ─────────────────────────────────

    console.log('🚀 APVIZIT 2026 — сайт загружен!');
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
        console.log('📩 Telegram бот: активен ✅');
    } else {
        console.warn('⚠️ Telegram бот: не настроен');
        console.log('📌 Для настройки создайте config.js');
    }
    console.log(`🔗 VK: ${VK_PROFILE_URL}`);
});
