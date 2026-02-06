/**
 * KLAWD BEATS - Beatmaker Portfolio
 * JavaScript для интерактивности сайта
 * 
 * Основные функции:
 * - Динамический рендеринг карточек битов
 * - Фильтрация по жанрам
 * - Глобальный аудиоплеер
 * - Бургер-меню для мобильных
 * - Модальное окно покупки
 * - Форма обратной связи (имитация)
 */

// ==========================================
// ДАННЫЕ О БИТАХ
// Биты загружаются из папки audio/
// Обложки ищутся в images/ с таким же именем (без расширения)
// ==========================================
const beatsData = [
    {
        id: 1,
        title: "1",
        genre: "beat",
        bpm: null,
        key: null,
        audioUrl: "audio/1.mp3",
        demoUrl: "audio/1.mp3",
        coverUrl: "images/1.jpg"
    },
    {
        id: 2,
        title: "2royale",
        genre: "beat",
        bpm: null,
        key: null,
        audioUrl: "audio/2royale.mp3",
        demoUrl: "audio/2royale.mp3",
        coverUrl: "images/2royale.jpg"
    },
    {
        id: 3,
        title: "mapele 145 bpm kyd",
        genre: "beat",
        bpm: 145,
        key: null,
        audioUrl: "audio/mapele 145 bpm kyd.mp3",
        demoUrl: "audio/mapele 145 bpm kyd.mp3",
        coverUrl: "images/mapele 145 bpm kyd.jpg"
    },
    {
        id: 4,
        title: "salam",
        genre: "beat",
        bpm: null,
        key: null,
        audioUrl: "audio/salam.mp3",
        demoUrl: "audio/salam.mp3",
        coverUrl: "images/salam.jpg"
    },
    {
        id: 5,
        title: "simple sample",
        genre: "beat",
        bpm: null,
        key: null,
        audioUrl: "audio/simple sample.mp3",
        demoUrl: "audio/simple sample.mp3",
        coverUrl: "images/simple sample.jpg"
    }
];

// ==========================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================
let currentBeatIndex = -1;
let isPlaying = false;
let currentGenreFilter = 'all';

// DOM элементы
const beatsGrid = document.getElementById('beatsGrid');
const beatsEmpty = document.getElementById('beatsEmpty');
const filterButtons = document.querySelectorAll('.filter-btn');
const audioElement = document.getElementById('audioElement');
const globalPlayer = document.getElementById('globalPlayer');

// Элементы плеера
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerGenre = document.getElementById('playerGenre');
const playerPlayPause = document.getElementById('playerPlayPause');
const playerPlayIcon = document.getElementById('playerPlayIcon');
const playerProgress = document.getElementById('playerProgress');
const playerProgressBar = document.getElementById('playerProgressBar');
const playerCurrentTime = document.getElementById('playerCurrentTime');
const playerDuration = document.getElementById('playerDuration');
const playerPrev = document.getElementById('playerPrev');
const playerNext = document.getElementById('playerNext');
const playerMute = document.getElementById('playerMute');
const playerVolumeIcon = document.getElementById('playerVolumeIcon');
const volumeSlider = document.getElementById('volumeSlider');

// Модальное окно
const purchaseModal = document.getElementById('purchaseModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBeatTitle = document.getElementById('modalBeatTitle');

// Бургер-меню
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

// Форма контактов
const contactForm = document.getElementById('contactForm');

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderBeats(beatsData);
    initFilters();
    initGlobalPlayer();
    initBurgerMenu();
    initModal();
    initContactForm();
    initSmoothScroll();
    initActiveNavigation();
});

// ==========================================
// ФУНКЦИЯ ДЛЯ ПОИСКА АЛЬТЕРНАТИВНОЙ ОБЛОЖКИ
// ==========================================

/**
 * Пробует загрузить обложку в разных форматах
 * Если ничего не найдено, ставит заглушку
 */
function tryAlternativeCover(img, title) {
    const baseName = title;
    const formats = ['.png', '.webp', '.jpeg', '.gif'];
    const currentSrc = img.src;
    
    // Определяем текущий формат
    const currentFormat = currentSrc.substring(currentSrc.lastIndexOf('.'));
    const formatIndex = formats.indexOf(currentFormat);
    
    // Пробуем следующий формат
    if (formatIndex < formats.length - 1) {
        const nextFormat = formats[formatIndex + 1] || formats[0];
        img.src = `images/${baseName}${nextFormat}`;
    } else {
        // Все форматы проверены, ставим заглушку
        img.src = 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
                <rect fill="#1a1a1a" width="300" height="300"/>
                <circle cx="150" cy="130" r="50" fill="#333"/>
                <rect x="125" y="180" width="50" height="60" rx="5" fill="#333"/>
                <text x="150" y="270" text-anchor="middle" fill="#6c63ff" font-size="16" font-family="Arial">♪ BEAT</text>
            </svg>
        `);
    }
}

// ==========================================
// РЕНДЕРИНГ КАРТОЧЕК БИТОВ
// ==========================================

/**
 * Отрисовывает карточки битов в сетке
 * @param {Array} beats - массив битов для отображения
 */
function renderBeats(beats) {
    // Очищаем сетку
    beatsGrid.innerHTML = '';
    
    // Показываем/скрываем пустое состояние
    if (beats.length === 0) {
        beatsEmpty.style.display = 'block';
        return;
    }
    beatsEmpty.style.display = 'none';
    
    // Создаём карточки
    beats.forEach((beat, index) => {
        const card = createBeatCard(beat, index);
        beatsGrid.appendChild(card);
    });
}

/**
 * Создаёт HTML-карточку бита
 * @param {Object} beat - данные бита
 * @param {number} index - индекс в массиве
 * @returns {HTMLElement} - DOM элемент карточки
 */
function createBeatCard(beat, index) {
    const card = document.createElement('div');
    card.className = 'beat-card';
    card.dataset.genre = beat.genre;
    card.dataset.index = index;
    
    // Формируем мета-информацию (только если есть данные)
    let metaHtml = '';
    if (beat.bpm) {
        metaHtml += `<span class="beat-meta-item"><i class="fas fa-drum"></i>${beat.bpm} BPM</span>`;
    }
    if (beat.key) {
        metaHtml += `<span class="beat-meta-item"><i class="fas fa-music"></i>${beat.key}</span>`;
    }
    
    card.innerHTML = `
        <div class="beat-cover">
            <img src="${beat.coverUrl}" alt="${beat.title}" onerror="this.onerror=null; tryAlternativeCover(this, '${beat.title}');">
            <div class="beat-play-overlay">
                <button class="beat-play-btn" data-index="${index}" aria-label="Воспроизвести ${beat.title}">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        </div>
        <div class="beat-info">
            <h3 class="beat-title">${beat.title}</h3>
            ${metaHtml ? `<div class="beat-meta">${metaHtml}</div>` : ''}
            <div class="beat-actions">
                <a href="${beat.demoUrl}" download class="btn btn-outline btn-small">
                    <i class="fas fa-download"></i>
                    Скачать
                </a>
                <button class="btn btn-primary btn-small buy-btn" data-beat-id="${beat.id}" data-beat-title="${beat.title}">
                    <i class="fab fa-telegram"></i>
                    Купить
                </button>
            </div>
        </div>
    `;
    
    // Добавляем обработчик клика на кнопку воспроизведения
    const playBtn = card.querySelector('.beat-play-btn');
    playBtn.addEventListener('click', () => {
        playBeat(index);
    });
    
    // Добавляем обработчик клика на кнопку покупки (переход в Telegram)
    const buyBtn = card.querySelector('.buy-btn');
    buyBtn.addEventListener('click', () => {
        window.open('https://t.me/dontblowmyslatt', '_blank');
    });
    
    return card;
}

// ==========================================
// ФИЛЬТРАЦИЯ ПО ЖАНРАМ
// ==========================================

/**
 * Инициализирует фильтры жанров
 */
function initFilters() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const genre = btn.dataset.genre;
            
            // Обновляем активную кнопку
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Фильтруем биты
            currentGenreFilter = genre;
            filterBeats(genre);
        });
    });
}

/**
 * Фильтрует биты по жанру
 * @param {string} genre - жанр для фильтрации ('all' для всех)
 */
function filterBeats(genre) {
    let filteredBeats;
    
    if (genre === 'all') {
        filteredBeats = beatsData;
    } else {
        filteredBeats = beatsData.filter(beat => beat.genre === genre);
    }
    
    renderBeats(filteredBeats);
}

// ==========================================
// ГЛОБАЛЬНЫЙ АУДИОПЛЕЕР
// ==========================================

/**
 * Инициализирует глобальный аудиоплеер
 */
function initGlobalPlayer() {
    // Устанавливаем начальную громкость
    audioElement.volume = volumeSlider.value / 100;
    
    // Обновление прогресса
    audioElement.addEventListener('timeupdate', updateProgress);
    
    // Загрузка метаданных трека
    audioElement.addEventListener('loadedmetadata', () => {
        playerDuration.textContent = formatTime(audioElement.duration);
    });
    
    // Окончание трека
    audioElement.addEventListener('ended', () => {
        playNextBeat();
    });
    
    // Play/Pause
    playerPlayPause.addEventListener('click', togglePlayPause);
    
    // Предыдущий/Следующий
    playerPrev.addEventListener('click', playPrevBeat);
    playerNext.addEventListener('click', playNextBeat);
    
    // Прогресс-бар клик
    playerProgress.addEventListener('click', seekTo);
    
    // Громкость
    volumeSlider.addEventListener('input', changeVolume);
    playerMute.addEventListener('click', toggleMute);
}

/**
 * Воспроизводит бит по индексу
 * @param {number} index - индекс бита в массиве beatsData
 */
function playBeat(index) {
    // Получаем отфильтрованный массив
    const filteredBeats = currentGenreFilter === 'all' 
        ? beatsData 
        : beatsData.filter(beat => beat.genre === currentGenreFilter);
    
    // Находим реальный индекс в beatsData
    const beat = filteredBeats[index];
    const realIndex = beatsData.findIndex(b => b.id === beat.id);
    
    currentBeatIndex = realIndex;
    
    // Обновляем информацию в плеере
    updatePlayerInfo(beat);
    
    // Загружаем и воспроизводим
    audioElement.src = beat.audioUrl;
    audioElement.play()
        .then(() => {
            isPlaying = true;
            updatePlayButton();
        })
        .catch(err => {
            console.log('Ошибка воспроизведения:', err);
            // Показываем уведомление, что файл не найден
            playerTitle.textContent = 'Файл не найден';
        });
}

/**
 * Обновляет информацию о треке в плеере
 * @param {Object} beat - данные бита
 */
function updatePlayerInfo(beat) {
    playerCover.src = beat.coverUrl;
    playerCover.classList.add('visible');
    playerCover.onerror = function() {
        tryAlternativeCover(this, beat.title);
    };
    playerTitle.textContent = beat.title;
    playerGenre.textContent = beat.bpm ? `${beat.bpm} BPM` : 'Beat';
}

/**
 * Переключает воспроизведение/паузу
 */
function togglePlayPause() {
    if (currentBeatIndex === -1) {
        // Если трек не выбран, играем первый
        playBeat(0);
        return;
    }
    
    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
    } else {
        audioElement.play();
        isPlaying = true;
    }
    
    updatePlayButton();
}

/**
 * Обновляет иконку кнопки play/pause
 */
function updatePlayButton() {
    if (isPlaying) {
        playerPlayIcon.className = 'fas fa-pause';
    } else {
        playerPlayIcon.className = 'fas fa-play';
    }
}

/**
 * Воспроизводит предыдущий трек
 */
function playPrevBeat() {
    if (beatsData.length === 0) return;
    
    let newIndex = currentBeatIndex - 1;
    if (newIndex < 0) {
        newIndex = beatsData.length - 1;
    }
    
    // Находим индекс в текущем отфильтрованном списке
    const filteredBeats = currentGenreFilter === 'all' 
        ? beatsData 
        : beatsData.filter(beat => beat.genre === currentGenreFilter);
    
    const beat = beatsData[newIndex];
    const filteredIndex = filteredBeats.findIndex(b => b.id === beat.id);
    
    if (filteredIndex !== -1) {
        playBeat(filteredIndex);
    } else {
        // Если бит не в текущем фильтре, просто переключаем
        currentBeatIndex = newIndex;
        updatePlayerInfo(beat);
        audioElement.src = beat.audioUrl;
        audioElement.play();
        isPlaying = true;
        updatePlayButton();
    }
}

/**
 * Воспроизводит следующий трек
 */
function playNextBeat() {
    if (beatsData.length === 0) return;
    
    let newIndex = currentBeatIndex + 1;
    if (newIndex >= beatsData.length) {
        newIndex = 0;
    }
    
    const filteredBeats = currentGenreFilter === 'all' 
        ? beatsData 
        : beatsData.filter(beat => beat.genre === currentGenreFilter);
    
    const beat = beatsData[newIndex];
    const filteredIndex = filteredBeats.findIndex(b => b.id === beat.id);
    
    if (filteredIndex !== -1) {
        playBeat(filteredIndex);
    } else {
        currentBeatIndex = newIndex;
        updatePlayerInfo(beat);
        audioElement.src = beat.audioUrl;
        audioElement.play();
        isPlaying = true;
        updatePlayButton();
    }
}

/**
 * Обновляет прогресс-бар и время
 */
function updateProgress() {
    const { currentTime, duration } = audioElement;
    
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        playerProgressBar.style.width = `${progressPercent}%`;
        playerCurrentTime.textContent = formatTime(currentTime);
    }
}

/**
 * Перемотка по клику на прогресс-бар
 * @param {Event} e - событие клика
 */
function seekTo(e) {
    const rect = playerProgress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    
    audioElement.currentTime = percent * audioElement.duration;
}

/**
 * Изменение громкости
 */
function changeVolume() {
    const volume = volumeSlider.value / 100;
    audioElement.volume = volume;
    
    updateVolumeIcon(volume);
}

/**
 * Включение/выключение звука
 */
function toggleMute() {
    if (audioElement.muted) {
        audioElement.muted = false;
        volumeSlider.value = audioElement.volume * 100;
        updateVolumeIcon(audioElement.volume);
    } else {
        audioElement.muted = true;
        updateVolumeIcon(0);
    }
}

/**
 * Обновляет иконку громкости
 * @param {number} volume - уровень громкости (0-1)
 */
function updateVolumeIcon(volume) {
    if (volume === 0 || audioElement.muted) {
        playerVolumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        playerVolumeIcon.className = 'fas fa-volume-down';
    } else {
        playerVolumeIcon.className = 'fas fa-volume-up';
    }
}

/**
 * Форматирует время в MM:SS
 * @param {number} seconds - время в секундах
 * @returns {string} - отформатированное время
 */
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==========================================
// БУРГЕР-МЕНЮ
// ==========================================

/**
 * Инициализирует бургер-меню для мобильных
 */
function initBurgerMenu() {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        
        // Блокируем скролл при открытом меню
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Закрываем меню при клике на ссылку
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ==========================================
// МОДАЛЬНОЕ ОКНО ПОКУПКИ
// ==========================================

/**
 * Инициализирует модальное окно
 */
function initModal() {
    // Закрытие по клику на оверлей
    modalOverlay.addEventListener('click', closePurchaseModal);
    
    // Закрытие по кнопке
    modalClose.addEventListener('click', closePurchaseModal);
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && purchaseModal.classList.contains('active')) {
            closePurchaseModal();
        }
    });
}

/**
 * Открывает модальное окно покупки
 * @param {string} beatTitle - название бита
 */
function openPurchaseModal(beatTitle) {
    modalBeatTitle.textContent = beatTitle;
    purchaseModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Закрывает модальное окно покупки
 */
function closePurchaseModal() {
    purchaseModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// ФОРМА ОБРАТНОЙ СВЯЗИ
// ==========================================

/**
 * Инициализирует форму контактов
 */
function initContactForm() {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Имитация отправки
        alert(`Сообщение отправлено!\n\nИмя: ${name}\nEmail: ${email}\n\n(Это демо. На реальном сайте здесь будет подключен email-сервис)`);
        
        // Очищаем форму
        contactForm.reset();
    });
}

// ==========================================
// ПЛАВНЫЙ СКРОЛЛ
// ==========================================

/**
 * Инициализирует плавный скролл для якорных ссылок
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Пропускаем пустые хэши
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================
// АКТИВНАЯ НАВИГАЦИЯ ПРИ СКРОЛЛЕ
// ==========================================

/**
 * Инициализирует подсветку активного пункта меню при скролле
 */
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Вызываем при загрузке
}

// ==========================================
// ЭФФЕКТ ПАРАЛЛАКСА ДЛЯ HERO (опционально)
// ==========================================

/**
 * Добавляет лёгкий параллакс эффект для hero секции
 */
function initParallax() {
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');
    
    if (!hero || !heroBg) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        if (scrolled < heroHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Раскомментируйте для включения параллакса:
// initParallax();

// ==========================================
// АНИМИРОВАННЫЙ ФОН С ТОЧКАМИ
// ==========================================

/**
 * Инициализирует анимированный фон с точками для секции битов
 */
function initDotBackground() {
    const canvas = document.getElementById('dotCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const section = canvas.parentElement;
    
    let width, height;
    let dots = [];
    let mouse = { x: -1000, y: -1000 };
    let animationId;
    
    // Настройки
    const gridSize = 40; // Расстояние между точками
    const dotRadius = 2;
    const maxDotRadius = 6;
    const mouseRadius = 150;
    const dotColor = '#6c63ff';
    const dotColorSecondary = '#00ffaa';
    
    // Инициализация размеров
    function resize() {
        const rect = section.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width;
        canvas.height = height;
        createDots();
    }
    
    // Создание сетки точек
    function createDots() {
        dots = [];
        const cols = Math.ceil(width / gridSize) + 1;
        const rows = Math.ceil(height / gridSize) + 1;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                dots.push({
                    x: i * gridSize,
                    y: j * gridSize,
                    baseRadius: dotRadius,
                    radius: dotRadius,
                    opacity: 0.15 + Math.random() * 0.1,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }
    
    // Отслеживание мыши
    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    section.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });
    
    // Анимация
    function animate(time) {
        ctx.clearRect(0, 0, width, height);
        
        dots.forEach(dot => {
            // Расстояние до мыши
            const dx = mouse.x - dot.x;
            const dy = mouse.y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Эффект при наведении мыши
            let targetRadius = dot.baseRadius;
            let opacity = dot.opacity;
            let color = dotColor;
            
            if (distance < mouseRadius) {
                const influence = 1 - (distance / mouseRadius);
                targetRadius = dot.baseRadius + (maxDotRadius - dot.baseRadius) * influence;
                opacity = dot.opacity + (0.8 - dot.opacity) * influence;
                
                // Градиент цвета
                const r = Math.floor(108 + (0 - 108) * influence);
                const g = Math.floor(99 + (255 - 99) * influence);
                const b = Math.floor(255 + (170 - 255) * influence);
                color = `rgb(${r}, ${g}, ${b})`;
            }
            
            // Плавное изменение радиуса
            dot.radius += (targetRadius - dot.radius) * 0.1;
            
            // Пульсация
            const pulse = Math.sin(time * 0.001 + dot.phase) * 0.3 + 1;
            const finalRadius = dot.radius * pulse;
            
            // Рисуем точку
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, finalRadius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity * pulse;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Запуск
    resize();
    animate(0);
    
    // Обработка изменения размера
    window.addEventListener('resize', resize);
    
    // Включаем pointer-events для секции (для отслеживания мыши)
    canvas.style.pointerEvents = 'none';
}

// Запускаем после загрузки
document.addEventListener('DOMContentLoaded', () => {
    initDotBackground();
});

// ==========================================
// АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ
// ==========================================

/**
 * Инициализирует анимацию появления элементов при скролле
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.beat-card, .service-card, .contact-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// Вызываем после рендеринга битов
// Примечание: вызывается автоматически после renderBeats
