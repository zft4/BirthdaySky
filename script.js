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

// Track last focused heart and whether last interaction was keyboard
let lastFocusedHeart = null;
let lastInteractionWasKeyboard = false;
window.addEventListener('keydown', () => { lastInteractionWasKeyboard = true; });
window.addEventListener('mousedown', () => { lastInteractionWasKeyboard = false; });

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

    // Normalized coordinates for an upright heart (percent-based, avoids overlap)
    const heartCoords = [
        { x: 0.5, y: 0.82 }, // Top center (Day 7)
        { x: 0.22, y: 0.62 }, // Left upper (Day 6)
        { x: 0.78, y: 0.62 }, // Right upper (Day 5)
        { x: 0.13, y: 0.32 }, // Far left (Day 4)
        { x: 0.87, y: 0.32 }, // Far right (Day 3)
        { x: 0.32, y: 0.08 }, // Left bottom (Day 2)
        { x: 0.68, y: 0.08 }  // Right bottom (Day 1)
    ];

    // Responsive size for iPhone screens (used to size the grid container)
    const gridW = Math.min(window.innerWidth, 420);
    const gridH = Math.min(window.innerHeight * 0.55, 420);

    // Sort messages in descending order (day 7 → day 1)
    const sortedMessages = [...MESSAGES].sort((a, b) => b.day - a.day);

    // Position mapping requested by user: map each day to a different coordinate index
    // Current coord indices: 0->day7,1->day6,2->day5,3->day4,4->day3,5->day2,6->day1
    // User mapping: 
    // heart 7 -> where 2 is (index 5)
    // heart 6 -> where 1 is (index 6)
    // heart 5 -> where 4 is (index 3)
    // heart 4 -> where 3 is (index 4)
    // heart 3 -> where 6 is (index 1)
    // heart 2 -> where 5 is (index 2)
    // heart 1 -> where 7 is (index 0)
    const positionForDay = {
        7: 5,
        6: 6,
        5: 3,
        4: 4,
        3: 1,
        2: 2,
        1: 0
    };

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

        // Position absolutely in the grid using normalized coordinates (percent)
        wrapper.style.position = 'absolute';
        const coordIndex = positionForDay[msg.day] !== undefined ? positionForDay[msg.day] : i;
        wrapper.style.left = `calc(${heartCoords[coordIndex].x * 100}% - 42.5px)`;
        wrapper.style.top = `calc(${heartCoords[coordIndex].y * 100}% - 42.5px)`;

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
            // mark interaction as mouse, record last focused heart, open modal
            lastInteractionWasKeyboard = false;
            if (!isLocked) {
                lastFocusedHeart = wrapper;
                openModal(msg.title, msg.text);
            }
        });

        wrapper.addEventListener('keypress', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isLocked) {
                // mark interaction as keyboard, record last focused heart, open modal
                lastInteractionWasKeyboard = true;
                lastFocusedHeart = wrapper;
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

    // Blur any active heart so the focus ring doesn't persist behind it
    try {
        const active = document.activeElement;
        if (active && active.classList && active.classList.contains('heart-wrapper')) {
            active.blur();
        }
    } catch (e) { /* ignore */ }

    // Focus the close button for accessibility
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.focus();
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    // Return focus to the last clicked/focused heart only if the user used keyboard
    try {
        if (lastInteractionWasKeyboard && lastFocusedHeart && document.body.contains(lastFocusedHeart) && !lastFocusedHeart.classList.contains('locked')) {
            lastFocusedHeart.focus();
        } else {
            // move focus away from hearts to avoid a persistent focus ring
            try {
                document.body.setAttribute('tabindex', '-1');
                document.body.focus();
                document.body.removeAttribute('tabindex');
            } catch (e) {
                try { document.documentElement.focus(); } catch (e) {}
            }
        }
    } catch (e) { /* ignore */ }
    lastFocusedHeart = null;
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

    // Show the birthday message using the same modal overlay (so background blurs)
    openModal('🎉 Happy Birthday Shumi! 🎉', 'Your special day has arrived! May this year bring you endless joy, love, and all the happiness you deserve.');

    // Note: modal close behavior is handled by the existing modal (close button / Esc)
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
