// ===========================
// CONFIGURATION
// ===========================
const TARGET_DATE = new Date('2025-12-04T00:00:00');
const LAHORE_TIMEZONE = 'Asia/Karachi';

// Messages for each day (day 1 = Dec 3, day 7 = Nov 27)
const MESSAGES = [
    { day: 1, title: '1 Day Left', text: 'I am in love with you forever my dear Seemi' },
    { day: 2, title: '2 Days Left', text: 'You deserve all the good in the world and so much more' },
    { day: 3, title: '3 Days Left', text: 'I hope to be a husband deserving of your love and affection Inshallah' },
    { day: 4, title: '4 Days Left', text: 'You mean the absolute most to me' },
    { day: 5, title: '5 Days Left', text: 'I am proud of you always for everything you are and do' },
    { day: 6, title: '6 Days Left', text: 'I miss you every single day, and look forward to the day we live with each other' },
    { day: 7, title: '7 Days Left', text: 'You are heavily responsible for all the good in me, and for the man I am today, thank you' }
];

// ===========================
// STAR ANIMATION
// ===========================
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
let width, height, stars = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    createStars();
}

function createStars() {
    stars = [];
    const count = Math.floor(width * height / 800);
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 0.5,
            opacity: Math.random(),
            speed: Math.random() * 0.1 + 0.05
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'white';
    ctx.fillStyle = '#fff5fa';

    stars.forEach(star => {
        ctx.globalAlpha = star.opacity * 0.8;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        star.opacity += (Math.random() - 0.5) * 0.3;
        if (star.opacity < 0) star.opacity = 0;
        if (star.opacity > 1) star.opacity = 1;
    });
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', resize);
resize();
animateStars();

// ===========================
// TIMEZONE & UNLOCKING LOGIC
// ===========================
function getDaysRemainingInLahore() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: LAHORE_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const lahoreTimeStr = formatter.format(now);
    const parts = lahoreTimeStr.match(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/);
    const lahoreTime = new Date(`${parts[3]}-${parts[1]}-${parts[2]}T${parts[4]}:${parts[5]}:${parts[6]}Z`);

    const timeDiff = TARGET_DATE - lahoreTime;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return Math.max(0, daysRemaining);
}

function isHeartUnlocked(day) {
    const daysRemaining = getDaysRemainingInLahore();
    return daysRemaining < day;
}

function getUnlockedDays() {
    const daysRemaining = getDaysRemainingInLahore();
    return 7 - daysRemaining;
}

// ===========================
// HEART GRID GENERATION
// ===========================
function generateHearts() {
    const heartGrid = document.querySelector('.heart-grid');
    heartGrid.innerHTML = '';

    // Shuffle messages for randomness while keeping day numbers intact
    const shuffledMessages = [...MESSAGES].sort(() => Math.random() - 0.5);

    shuffledMessages.forEach(msg => {
        const isLocked = !isHeartUnlocked(msg.day);
        const wrapper = document.createElement('div');
        wrapper.className = `heart-wrapper ${isLocked ? 'locked' : ''}`;
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('aria-label', `Day ${msg.day}: ${msg.title}${isLocked ? ' (locked)' : ''}`);
        wrapper.setAttribute('data-day', msg.day);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'heart-svg');
        svg.setAttribute('viewBox', '0 0 32 29.6');
        svg.setAttribute('aria-hidden', 'true');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-11.8,16-21.2C32,3.8,28.2,0,23.6,0z');
        svg.appendChild(path);

        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = msg.day;
        dayNumber.setAttribute('aria-hidden', 'true');

        wrapper.appendChild(svg);
        wrapper.appendChild(dayNumber);

        if (isLocked) {
            const lockIcon = document.createElement('div');
            lockIcon.className = 'lock-icon';
            lockIcon.textContent = '🔒';
            lockIcon.setAttribute('aria-hidden', 'true');
            wrapper.appendChild(lockIcon);
        }

        wrapper.addEventListener('click', () => {
            if (!isLocked) {
                openModal(msg.title, msg.text);
            }
        });

        wrapper.addEventListener('keypress', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isLocked) {
                openModal(msg.title, msg.text);
            }
        });

        heartGrid.appendChild(wrapper);
    });
}

// ===========================
// MODAL LOGIC
// ===========================
function openModal(title, text) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');

    modalTitle.textContent = title;
    modalText.textContent = text;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    // Focus the close button for accessibility
    document.querySelector('.close-btn').focus();
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    // Return focus to the last clicked heart
    document.querySelector('.heart-wrapper:not(.locked)').focus();
}

// Close modal on Esc key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal');
        if (modal.classList.contains('active')) {
            closeModal();
        }
    }
});

// ===========================
// SURPRISE ANIMATION (Dec 4 at 12:00 AM Lahore)
// ===========================
function triggerSurpriseAnimation() {
    // Confetti effect
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.textContent = Math.random() > 0.5 ? '❤️' : '✨';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = Math.random() * 0.8 + 0.2;
        confetti.style.fontSize = (Math.random() * 20 + 15) + 'px';
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }

    // Heart burst from center
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 200;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        const heart = document.createElement('div');
        heart.className = 'heart-burst';
        heart.textContent = '❤️';
        heart.style.left = '50%';
        heart.style.top = '50%';
        heart.style.setProperty('--tx', tx + 'px');
        heart.style.setProperty('--ty', ty + 'px');
        heart.style.animation = `burst 1.5s ease-out forwards`;
        heart.style.animationDelay = (i * 0.05) + 's';
        document.body.appendChild(heart);

        setTimeout(() => heart.remove(), 2000);
    }

    // Show special message
    const specialCard = document.createElement('div');
    specialCard.className = 'card';
    specialCard.style.position = 'fixed';
    specialCard.style.zIndex = '150';
    specialCard.innerHTML = `
        <h2>🎉 Happy Birthday Seemi! 🎉</h2>
        <p>Your special day has arrived! May this year bring you endless joy, love, and all the happiness you deserve.</p>
        <button class="close-btn" onclick="this.parentElement.remove();">Close</button>
    `;
    document.body.appendChild(specialCard);

    setTimeout(() => {
        specialCard.style.opacity = '0';
        specialCard.style.transition = 'opacity 1s ease';
        setTimeout(() => specialCard.remove(), 1000);
    }, 5000);
}

function checkForSurpriseTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: LAHORE_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const lahoreTime = formatter.format(now);
    // Check if it's Dec 4, 2025 at midnight in Lahore
    if (lahoreTime.includes('12/04/2025') && lahoreTime.includes('00:00')) {
        triggerSurpriseAnimation();
        return true;
    }
    return false;
}

// ===========================
// INITIALIZATION & UPDATES
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    generateHearts();

    // Check for surprise animation every second
    setInterval(() => {
        checkForSurpriseTime();
    }, 1000);

    // Update hearts every minute to reflect unlocking
    setInterval(() => {
        generateHearts();
    }, 60000);

    // Initialize modal as hidden for screen readers
    const modal = document.getElementById('modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'modalTitle');
});
