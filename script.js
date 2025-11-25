// Full Soft Romantic Starry 7-Day Countdown
// Features:
// - 7 heart-shaped stars unlock from Nov 27 -> Dec 3 (based on Asia/Karachi time).
// - On Dec 4 (Asia/Karachi) the sky animates stars into the text "Happy Birthday Seemal".
// - ?unlock=all to reveal all days; ?preview=bb to force Dec 4 text transform for preview.

(function () {
  /* --------------------------
     CONFIG
  ---------------------------*/
  const TIMEZONE = 'Asia/Karachi'; // Lahore
  const BDAY_MONTH = 11; // December (0-indexed)
  const BDAY_DATE = 4;
  const MESSAGES = [
    { title: "Day 1", note: "A tiny heart to start.", text: "Hey my princess — I love you more than you know." },
    { title: "Day 2", note: "A little glow for you.", text: "I miss you more than life; thinking of you always." },
    { title: "Day 3", note: "Halfway to the cake.", text: "You are my life — you make everything worth it." },
    { title: "Day 4", note: "Another twinkle.", text: "You are my everything; I’m who I am today because of you." },
    { title: "Day 5", note: "Almost there.", text: "I love you more — you make life softer and better." },
    { title: "Day 6", note: "One more until your day.", text: "I miss you my darling — you’re my sweetheart." },
    { title: "Day 7", note: "Final message.", text: "I love you forever and always. Happy birthday soon, my love." }
  ];

  const NAME_TEXT = "Happy Birthday Seemal";
  const MAX_TEXT_PARTICLES = 380; // number of stars to form text on Dec 4

  /* --------------------------
     DOM REFS
  ---------------------------*/
  const starsContainer = document.getElementById('stars');
  const twinkles = document.getElementById('twinkles');
  const modal = document.getElementById('messageModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalDate = document.getElementById('modalDate');
  const closeBtn = document.getElementById('closeBtn');
  const statusText = document.getElementById('statusText');
  const letterHolder = document.getElementById('letterHolder');
  const canvas = document.getElementById('textCanvas');

  /* --------------------------
     Helpers: get current date/time in specified tz
     We'll use Intl.DateTimeFormat().formatToParts to build a Date in that timezone.
  ---------------------------*/
  function nowInTZ(tz) {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });
    const parts = fmt.formatToParts(now).reduce((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
    // parts: { year, month, day, hour, minute, second }
    return new Date(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
  }

  // get date-only (00:00) in tz
  function dateOnlyInTZ(tz) {
    const d = nowInTZ(tz);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function formatFriendly(d) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  /* --------------------------
     Compute countdown window:
     Start = birthday - 7 days (Nov 27 when bday Dec 4).
     Unlocking: each day at 00:00 Lahore time becomes available.
  ---------------------------*/
  function computeDatesForYear(year) {
    const birthday = new Date(year, BDAY_MONTH, BDAY_DATE, 0, 0, 0);
    // if current tz date is after that birthday, we should use next year's birthday
    const nowTz = nowInTZ(TIMEZONE);
    if (nowTz > birthday) birthday.setFullYear(year + 1);
    const start = new Date(birthday);
    start.setDate(birthday.getDate() - 7); // start on Nov 27 for Dec 4 birthday
    return { birthday, start };
  }

  function getUnlockedCount() {
    const url = new URL(window.location.href);
    if (url.searchParams.get('unlock') === 'all') return MESSAGES.length;
    // preview param to force show dec4 transform for testing
    if (url.searchParams.get('preview') === 'bb') return MESSAGES.length + 1; // force Dec4 mode

    const nowTz = nowInTZ(TIMEZONE);
    const { birthday, start } = computeDatesForYear(nowTz.getFullYear());
    const oneDay = 24 * 60 * 60 * 1000;
    const diff = Math.floor((stripTime(nowTz) - stripTime(start)) / oneDay);
    if (diff < 0) return 0;
    if (diff >= MESSAGES.length) return MESSAGES.length; // once all 7 unlocked, Dec4 will be next day
    return diff + 1;
  }

  function isDec4InTZ() {
    const nowTz = nowInTZ(TIMEZONE);
    const { birthday } = computeDatesForYear(nowTz.getFullYear());
    // check if current tz date is the birthday date (Dec 4)
    const today = stripTime(nowTz);
    return today.getFullYear() === birthday.getFullYear() &&
           today.getMonth() === birthday.getMonth() &&
           today.getDate() === birthday.getDate();
  }

  function stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /* --------------------------
     Star positions (constellation style),
     plus designated 7 main heart positions (percentages).
  ---------------------------*/
  const mainPositions = [
    { left: 12, top: 20 },
    { left: 27, top: 12 },
    { left: 43, top: 22 },
    { left: 58, top: 14 },
    { left: 74, top: 26 },
    { left: 62, top: 48 },
    { left: 34, top: 54 }
  ];

  // Fill background twinkles
  function populateTwinkles(count = 90) {
    twinkles.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'twinkle';
      el.style.position = 'absolute';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = Math.random() * 100 + 'vh';
      const dur = (1.2 + Math.random() * 2.2).toFixed(2);
      el.style.animation = `twinkle ${dur}s ${Math.random() > 0.5 ? 'alternate' : 'alternate-reverse'} infinite ease-in-out`;
      el.style.width = (1 + Math.random() * 3) + 'px';
      el.style.height = el.style.width;
      el.style.background = 'white';
      el.style.opacity = 0.6 + Math.random() * 0.4;
      twinkles.appendChild(el);
    }
  }

  /* --------------------------
     Heart SVG generator
  ---------------------------*/
  function heartSVG(color = '#ffd7e6', size = 54) {
    // returns element with absolute-centered svg
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <svg class="heart-svg" viewBox="0 0 24 24" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" d="M12 21s-7.5-4.6-10-7.5C-1 8.9 2.6 4 6.9 6.1 9 7.4 10 9.3 12 11c2-1.7 3-3.6 5.1-4.9C21.4 4 25 8.9 22 13.5 19.5 16.4 12 21 12 21z"/>
      </svg>`;
    return wrapper.firstElementChild;
  }

  /* --------------------------
     Create 7 main heart buttons
  ---------------------------*/
  function createMainHearts(unlockedCount) {
    starsContainer.innerHTML = '';
    for (let i = 0; i < MESSAGES.length; i++) {
      const pos = mainPositions[i] || { left: 12 + i * 10, top: 22 + (i % 2) * 6 };
      const btn = document.createElement('button');
      btn.className = 'star ' + (i < unlockedCount ? 'unlocked' : 'disabled');
      btn.style.left = `calc(${pos.left}% )`;
      btn.style.top = `calc(${pos.top}% )`;
      btn.setAttribute('data-index', i);
      btn.setAttribute('aria-label', `Day ${i + 1}`);
      // center transform
      btn.style.transform = 'translate(-50%,-50%) scale(' + (i < unlockedCount ? 1 : 0.88) + ')';
      // inner SVG heart
      const svg = heartSVG(i < unlockedCount ? '#ffd7e6' : '#6b4f6b', 54);
      svg.style.pointerEvents = 'none';
      btn.appendChild(svg);

      // mini glow
      const mini = document.createElement('div');
      mini.className = 'mini';
      btn.appendChild(mini);

      // click behavior
      if (i < unlockedCount) {
        btn.addEventListener('click', () => openMessage(i));
      } else {
        btn.addEventListener('click', () => {
          // tiny nudge animation to show it's locked
          btn.animate([
            { transform: 'translate(-50%,-50%) scale(.88)' },
            { transform: 'translate(-50%,-50%) scale(.94)' },
            { transform: 'translate(-50%,-50%) scale(.88)' }
          ], { duration: 200, iterations: 1 });
        });
      }
      starsContainer.appendChild(btn);

      // small breathing animation using Web Animations
      btn.animate([
        { transform: btn.style.transform, opacity: i < unlockedCount ? 1 : 0.85 },
        { transform: btn.style.transform.replace('scale(' + (i < unlockedCount ? 1 : 0.88) + ')', 'scale(' + (i < unlockedCount ? 1.03 : 0.92) + ')'), opacity: 1 }
      ], { duration: 2400 + i * 120, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    }
  }

  /* --------------------------
     Modal handlers
  ---------------------------*/
  function openMessage(index) {
    const msg = MESSAGES[index];
    modalTitle.textContent = msg.title;
    modalMessage.textContent = msg.text;
    // compute date for that day
    const nowTz = nowInTZ(TIMEZONE);
    const { birthday, start } = computeDatesForYear(nowTz.getFullYear());
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + index);
    modalDate.textContent = formatFriendly(dayDate);
    showModal();
  }
  function showModal() {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }
  function hideModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
  closeBtn.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

  /* --------------------------
     Dec 4 text formation: draw text to offscreen canvas, sample pixels,
     and animate many tiny stars to those target points
  ---------------------------*/
  function formBirthdayTextPreview() {
    // clear any existing letterHolder visuals
    letterHolder.innerHTML = '';
    // draw text to canvas
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.min(1200, Math.max(600, Math.floor(window.innerWidth * 0.9)));
    const h = Math.min(400, Math.floor(window.innerHeight * 0.35));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // background not needed
    // font choice and size
    const fontSize = Math.floor(h * 0.32);
    ctx.font = `bold ${fontSize}px -apple-system, Inter, system-ui, Roboto, Arial`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    // draw text centered
    ctx.fillText(NAME_TEXT, w / 2, h * 0.6);

    // sample pixels
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const step = Math.max(2, Math.round(dpr * 6)); // sampling step to reduce points
    const points = [];

    for (let y = 0; y < canvas.height; y += step * dpr) {
      for (let x = 0; x < canvas.width; x += step * dpr) {
        const idx = ((y * canvas.width) + x) * 4;
        const alpha = img.data[idx + 3];
        if (alpha > 120) {
          // convert x,y to percentage of canvas, then to positions inside sky
          const px = (x / canvas.width) * 100;
          const py = (y / canvas.height) * 100;
          points.push({ xPercent: px, yPercent: py });
          if (points.length >= MAX_TEXT_PARTICLES) break;
        }
      }
      if (points.length >= MAX_TEXT_PARTICLES) break;
    }

    // create particles (stars) in letterHolder and animate them from random start to sampled points
    const total = points.length;
    const particles = [];
    // initial random start points
    for (let i = 0; i < total; i++) {
      const pt = points[i];
      const p = document.createElement('div');
      p.className = 'text-particle';
      p.style.position = 'absolute';
      // start at random location in sky
      const sx = 10 + Math.random() * 80;
      const sy = 10 + Math.random() * 80;
      p.style.left = sx + '%';
      p.style.top = sy + '%';
      p.style.width = '6px';
      p.style.height = '6px';
      p.style.borderRadius = '50%';
      p.style.background = 'rgba(255,215,240,0.96)';
      p.style.boxShadow = '0 0 8px rgba(255,150,190,0.75)';
      p.style.transform = 'translate(-50%,-50%)';
      letterHolder.appendChild(p);
      particles.push({ el: p, target: pt });
    }

    // animate them into place with stagger
    particles.forEach((part, i) => {
      const delay = 60 + i * 8 * (Math.random() * 0.9);
      setTimeout(() => {
        // move to percent target
        part.el.animate([
          { left: part.el.style.left, top: part.el.style.top, opacity: 0.95, transform: 'translate(-50%,-50%) scale(1)' },
          { left: part.target.xPercent + '%', top: part.target.yPercent + '%', opacity: 1, transform: 'translate(-50%,-50%) scale(1.1)' }
        ], { duration: 1000 + Math.random() * 800, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });

        // tiny flicker forever
        part.el.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: 'translate(-50%,-50%) scale(.86)', opacity: 0.6 }
        ], { duration: 2000 + Math.random() * 2000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
      }, delay);
    });

    // final gentle sparkle of the whole text
    setTimeout(() => {
      const shine = document.createElement('div');
      shine.style.position = 'absolute';
      shine.style.left = '50%';
      shine.style.top = '45%';
      shine.style.transform = 'translate(-50%,-50%)';
      shine.style.width = '80%';
      shine.style.height = '60%';
      shine.style.borderRadius = '10px';
      shine.style.pointerEvents = 'none';
      shine.style.boxShadow = '0 0 80px 30px rgba(255,140,180,0.06)';
      letterHolder.appendChild(shine);
    }, 1600);
  }

  /* --------------------------
     Initialization
  ---------------------------*/
  function init() {
    populateTwinkles(92);
    const unlocked = getUnlockedCount();

    // if it's Dec 4 in Lahore (or preview param), show text formation
    if (isDec4InTZ() || (new URL(window.location.href).searchParams.get('preview') === 'bb')) {
      // Hide main hearts and show text formation
      starsContainer.innerHTML = '';
      statusText.textContent = `It's ${NAME_TEXT} — tap any sparkling star to celebrate!`;
      // create lots of smaller twinkles (more dramatic)
      populateTwinkles(140);
      // run formation
      formBirthdayTextPreview();
      return;
    }

    createMainHearts(unlocked);

    // status text
    if (unlocked === 0) {
      const { start } = computeDatesForYear(nowInTZ(TIMEZONE).getFullYear());
      statusText.textContent = `Countdown starts on ${formatFriendly(start)} (Lahore time).`;
    } else if (unlocked < MESSAGES.length) {
      statusText.textContent = `${unlocked} of 7 hearts unlocked. Tap the glowing hearts each day.`;
    } else {
      // all 7 unlocked (this will be Dec 3), next day will be Dec 4 formation
      statusText.textContent = `All 7 hearts unlocked — final celebration tomorrow!`;
    }
  }

  // kick off
  init();

  // re-run init if window resized (to adapt canvas on Dec 4 preview)
  window.addEventListener('resize', () => { if (isDec4InTZ() || (new URL(window.location.href).searchParams.get('preview') === 'bb')) { letterHolder.innerHTML = ''; formBirthdayTextPreview(); } });

})();
