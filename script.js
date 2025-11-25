// ===========================
// CONFIGURATION
// ===========================
const TARGET_DATE = new Date('2025-12-04T00:00:00');
const LAHORE_TIMEZONE = 'Asia/Karachi';

// Messages for each day (day 1 = Dec 3, day 7 = Nov 27)
const MESSAGES = [
    { day: 1, title: '1 Day Left', text: 'I am in love with you forever my dear Seemi.' },
    { day: 2, title: '2 Days Left', text: 'You deserve all the good in the world and so much more.' },
    { day: 3, title: '3 Days Left', text: 'I hope to be a husband deserving of your love and affection Inshallah.' },
    { day: 4, title: '4 Days Left', text: 'You mean the absolute most to me.' },
    { day: 5, title: '5 Days Left', text: 'I am proud of you always for everything you are and do.' },
    { day: 6, title: '6 Days Left', text: 'I miss you every single day, and look forward to the day we live with each other.' },
    { day: 7, title: '7 Days Left', text: 'You are heavily responsible for all the good in me, and for the man I am today. Thank you.' }
];

// ===========================
// TEST MODE & QUERY PARAMETERS
// ===========================
function getTestDaysOverride() {
    const params = new URLSearchParams(window.location.search);
    const testDays = params.get('testDays');
    return testDays ? parseInt(testDays, 10) : null;
}

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
    const testOverride = getTestDaysOverride();
    if (testOverride !== null) {
        // testDays=0: all unlocked (Dec 4), testDays=1: only Day 1 unlocked, testDays=7: only Day 7 unlocked
        // So daysRemaining = testDays
        return Math.max(0, Math.min(7, testOverride));
    }

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

    // Day 1 unlocks at 12am Dec 3 PKT, celebration at 12am Dec 4 PKT
    // So, daysRemaining = 1 at Dec 3, 0 at Dec 4
    const celebrationDate = new Date('2025-12-04T00:00:00');
    const lastMessageDate = new Date('2025-12-03T00:00:00');
    if (lahoreTime >= celebrationDate) return 0; // After Dec 4, all unlocked
    if (lahoreTime >= lastMessageDate) return 1; // After Dec 3, only 1 day left

    const timeDiff = lastMessageDate - lahoreTime;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 so Dec 2 = 2 days left
    return Math.max(1, daysRemaining);
}

function isHeartUnlocked(day) {
    const daysRemaining = getDaysRemainingInLahore();
    // Heart unlocks when day >= daysRemaining
    // E.g., if daysRemaining=7, heart 7 unlocks (7 >= 7 is true)
    // If daysRemaining=6, hearts 7 & 6 unlock (7 >= 6 and 6 >= 6 are true)
    return day >= daysRemaining;
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

    // Heart-shaped constellation coordinates (normalized, centered, 0-1)
    // Inverted heart: point at bottom, bulges at top
    // Heart 7 at bottom point, Hearts 6&5 at top bulges
    const heartCoords = [
        { x: 0.28, y: 0.08 }, // index 0 = Day 7 (top-left)
        { x: 0.72, y: 0.08 }, // index 1 = Day 6 (top-right)
        { x: 0.40, y: 0.26 }, // index 2 = Day 5 (upper bulge left)
        { x: 0.60, y: 0.26 }, // index 3 = Day 4 (upper bulge right)
            { x: 0.43, y: 0.48 }, // index 4 = Day 3 (middle left)
            { x: 0.57, y: 0.48 }, // index 5 = Day 2 (middle right)
            { x: 0.50, y: 0.78 }  // index 6 = Day 1 (bottom point)
        ];
    
        // Generate responsive pixel coordinates for an aesthetically spaced "heart" constellation.
        // Layout (user requested):
        // Top row: Day7 (left), Day6 (right)
        // Next: Day5 (left), Day4 (right)
        // Next: Day3 (left), Day2 (right)
        // Bottom: Day1 (center)
        const isSmall = window.innerWidth <= 600;
        const heartSize = isSmall ? 60 : 85;

        const gridW = Math.min(window.innerWidth * 0.92, 460);
        const gridH = Math.min(window.innerHeight * 0.6, 520);

        // Row Y positions (top to bottom)
        const rowYs = [gridH * 0.12, gridH * 0.30, gridH * 0.52, gridH * 0.80];

        // X positions for two-columns and center
        const xLeft = gridW * 0.28;
        const xRight = gridW * 0.72;
        const xMidLeft = gridW * 0.40;
        const xMidRight = gridW * 0.60;
        const xCenter = gridW * 0.50;

        const coordsPx = [
            { x: xLeft, y: rowYs[0] },    // Day 7 (top-left)
            { x: xRight, y: rowYs[0] },   // Day 6 (top-right)
            { x: xMidLeft, y: rowYs[1] }, // Day 5 (upper bulge left)
            { x: xMidRight, y: rowYs[1] },// Day 4 (upper bulge right)
            { x: xMidLeft + 12, y: rowYs[2] }, // Day 3 (middle left)
            { x: xMidRight - 12, y: rowYs[2] },// Day 2 (middle right)
            { x: xCenter, y: rowYs[3] }    // Day 1 (bottom center)
        ];

    // Sort messages in descending order (day 7 → day 1)
    const sortedMessages = [...MESSAGES].sort((a, b) => b.day - a.day);

    const daysRemaining = getDaysRemainingInLahore();
    // Current day is the heart that was just unlocked (the one equal to daysRemaining)
    // E.g., if daysRemaining=6, heart 6 was just unlocked, so currentDay = 6
    // If daysRemaining=7, heart 7 just unlocked, so currentDay = 7
    // If daysRemaining=0, it's the birthday (no single "current" day), so currentDay = null
    const currentDay = daysRemaining > 0 && daysRemaining <= 7 ? daysRemaining : null;
    const isOnBirthday = daysRemaining === 0;

    sortedMessages.forEach((msg, i) => {
        const isLocked = !isHeartUnlocked(msg.day);
        // A heart is "past" if it's not the current one and it's unlocked
        const isPastDay = !isLocked && msg.day !== currentDay && !isOnBirthday;
        const isCurrentDay = msg.day === currentDay && !isOnBirthday;
        
        let classes = `heart-wrapper ${isLocked ? 'locked' : ''}`;
        if (isPastDay) classes += ' past-day';
        if (isCurrentDay) classes += ' current-day';
        if (isOnBirthday) classes += ' birthday-glow';
        
        const wrapper = document.createElement('div');
        wrapper.className = classes;
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('aria-label', `Day ${msg.day}: ${msg.title}${isLocked ? ' (locked)' : ''}`);
        wrapper.setAttribute('data-day', msg.day);

        // Position absolutely in the grid using computed pixel coordinates to avoid overlap
        wrapper.style.position = 'absolute';
        const pos = coordsPx[i];
        wrapper.style.left = (pos.x - heartSize / 2) + 'px';
        wrapper.style.top = (pos.y - heartSize / 2) + 'px';
        // Set size explicitly so spacing is consistent
        wrapper.style.width = heartSize + 'px';
        wrapper.style.height = heartSize + 'px';

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

    // Add cake in the center on birthday (Dec 4, daysRemaining = 0)
    if (isOnBirthday) {
        const cakeWrapper = document.createElement('div');
        cakeWrapper.className = 'cake-wrapper';
        cakeWrapper.setAttribute('role', 'button');
        cakeWrapper.setAttribute('tabindex', '0');
        cakeWrapper.setAttribute('aria-label', 'Click to celebrate your birthday');
        cakeWrapper.style.position = 'absolute';
        cakeWrapper.style.left = 'calc(50% - 42.5px)';
        cakeWrapper.style.top = 'calc(50% - 42.5px)';
        
        // Cake SVG (matches heart aesthetic)
        const cakeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        cakeSvg.setAttribute('class', 'cake-svg');
        cakeSvg.setAttribute('viewBox', '0 0 100 120');
        cakeSvg.setAttribute('aria-hidden', 'true');
        
        // Layer 1 (bottom layer)
        const layer1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        layer1.setAttribute('x', '10');
        layer1.setAttribute('y', '70');
        layer1.setAttribute('width', '80');
        layer1.setAttribute('height', '30');
        layer1.setAttribute('fill', '#ff6b8b');
        layer1.setAttribute('rx', '5');
        
        // Layer 2 (middle layer)
        const layer2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        layer2.setAttribute('x', '15');
        layer2.setAttribute('y', '50');
        layer2.setAttribute('width', '70');
        layer2.setAttribute('height', '25');
        layer2.setAttribute('fill', '#ff4d6d');
        layer2.setAttribute('rx', '4');
        
        // Layer 3 (top layer)
        const layer3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        layer3.setAttribute('x', '20');
        layer3.setAttribute('y', '30');
        layer3.setAttribute('width', '60');
        layer3.setAttribute('height', '25');
        layer3.setAttribute('fill', '#ff8fa3');
        layer3.setAttribute('rx', '4');
        
        // Frosting swirl
        const frosting = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        frosting.setAttribute('d', 'M 20 30 Q 30 15 50 15 Q 70 15 80 30');
        frosting.setAttribute('fill', '#ffd1dc');
        frosting.setAttribute('stroke', 'none');
        
        // Candle
        const candle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        candle.setAttribute('x', '47');
        candle.setAttribute('y', '5');
        candle.setAttribute('width', '6');
        candle.setAttribute('height', '20');
        candle.setAttribute('fill', '#fff0f5');
        
        // Flame
        const flame = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        flame.setAttribute('d', 'M 50 5 Q 48 0 50 -5 Q 52 0 50 5');
        flame.setAttribute('fill', '#ffa500');
        
        cakeSvg.appendChild(layer1);
        cakeSvg.appendChild(layer2);
        cakeSvg.appendChild(layer3);
        cakeSvg.appendChild(frosting);
        cakeSvg.appendChild(candle);
        cakeSvg.appendChild(flame);
        
        cakeWrapper.appendChild(cakeSvg);
        
        cakeWrapper.addEventListener('click', () => {
            triggerSurpriseAnimation();
        });
        
        cakeWrapper.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                triggerSurpriseAnimation();
            }
        });
        
        heartGrid.appendChild(cakeWrapper);
    }

    // Set heartGrid to relative and fixed size for absolute positioning
    heartGrid.style.position = 'relative';
    heartGrid.style.width = gridW + 'px';
    heartGrid.style.height = gridH + 'px';
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
    // Confetti effect only (no heart burst)
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
        confetti.style.pointerEvents = 'none'; // Don't block clicks
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }

    // Show special message (modal, not blocking)
    const specialCard = document.createElement('div');
    specialCard.className = 'card';
    specialCard.style.position = 'fixed';
    specialCard.style.zIndex = '150';
    specialCard.style.left = '50%';
    specialCard.style.top = '50%';
    specialCard.style.transform = 'translate(-50%, -50%)';
    specialCard.id = 'birthday-card';
    specialCard.innerHTML = `
        <h2>🎉 Happy Birthday Shumi! 🎉</h2>
        <p>Your special day has arrived! May this year bring you endless joy, love, and all the happiness you deserve.</p>
        <button class="close-btn">Close</button>
    `;
    document.body.appendChild(specialCard);

    // Allow closing at any time
    const closeBtn = specialCard.querySelector('.close-btn');
    closeBtn.focus();
    
    const closeBirthdayCard = () => {
        if (document.getElementById('birthday-card')) {
            document.getElementById('birthday-card').remove();
            generateHearts();
        }
    };
    
    closeBtn.addEventListener('click', closeBirthdayCard);
    
    const closeHandler = (e) => {
        if (e.key === 'Escape' && document.getElementById('birthday-card')) {
            closeBirthdayCard();
        }
    };
    document.addEventListener('keydown', closeHandler);
}

function checkForSurpriseTime() {
    // Don't auto-trigger anymore. Cake click will trigger.
    // This function is kept for compatibility but does nothing.
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

    // Show test mode notification if active
    const testDays = getTestDaysOverride();
    if (testDays !== null) {
        console.log(`🧪 TEST MODE ACTIVE: ${testDays} days remaining`);
        console.log(`📝 URL: ${window.location.href}`);
        console.log(`💡 To unlock all hearts, use: ?testDays=0`);
    }
});
