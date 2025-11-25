/* Starry Countdown for Seemal
   - 7 daily heart stars (Nov 27 -> Dec 3)
   - Dec 4: transform into "Happy Birthday Seemal" drawn with twinkle stars
   - Unlock logic uses Lahore timezone (Asia/Karachi)
   - Testing shortcuts: ?unlock=all and ?demo=text
*/

(() => {
  // ---------------------------
  // CONFIG
  // ---------------------------
  const TARGET_NAME = 'Seemal';
  // message texts (7). Uses user's tone / lines provided
  const messages = [
    { title: 'Day 1', text: "Hey my princess — I love you more than you know." },
    { title: 'Day 2', text: "I miss you my darling; you are my everything." },
    { title: 'Day 3', text: "You make life worth living — I'm so grateful for you." },
    { title: 'Day 4', text: "I am who I am today because of you." },
    { title: 'Day 5', text: "You are my life; I miss you more than life." },
    { title: 'Day 6', text: "You're my sweetheart — I love you more, always." },
    { title: 'Day 7', text: "Happy early birthday, my love — I love you forever and always." }
  ];

  // The planned star dates (we'll compute year-relative later)
  // The final interactive day (message star) should be Dec 3 per request (Day 7 -> Dec 3).
  // So the 7-day window is: start = Dec 3 - 6 = Nov 27 up to Dec 3 inclusive.
  const TARGET_MONTH = 11; // December = 11 (JS months 0-indexed)
  const TARGET_DAY = 4;    // Dec 4 is the birthday day (transformation day)
  const DAYS_TOTAL = messages.length; // 7

  // layout: constellation-like positions (percentages). 7 main hearts
  const positions = [
    {left: 18, top: 28},
    {left: 32, top: 12},
    {left: 46, top: 26},
    {left: 60, top: 14},
    {left: 76, top: 30},
    {left: 62, top: 48},
    {left: 36, top: 52}
  ];

  // ---------------------------
  // DOM Refs
  // ---------------------------
  const mainStarsEl = document.getElementById('mainStars');
  const twinklesEl = document.getElementById('twinkles');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const modalDate = document.getElementById('modalDate');
  const closeBtn = document.getElementById('close');
  const status = document.getElementById('status');
  const canvas = document.getElementById('lettersCanvas');

  // ---------------------------
  // helpers: get current Lahore date parts using Intl
  // ---------------------------
  function nowInLahoreParts() {
    // returns an object { year, month (1-12), day, hour, minute, second, dateObj }
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    const parts = fmt.formatToParts(new Date());
    const map = {};
    parts.forEach(p => map[p.type] = p.value);
    const year = parseInt(map.year,10);
    const month = parseInt(map.month,10);
    const day = parseInt(map.day,10);
    const hour = parseInt(map.hour,10);
    const minute = parseInt(map.minute,10);
    const second = parseInt(map.second,10);
    // create a Date object using the components but in local timezone; we only use Y/M/D for day math
    const dateObj = new Date(year, month-1, day, hour, minute, second);
    return { year, month, day, hour, minute, second, dateObj };
  }

  function dateFromYMD(year, monthZeroBased, day) {
    // returns a Date object representing that Y/M/D at 00:00:00 in **Lahore timezone** relative to UTC calculation.
    // We'll represent as the *wall-clock* Y-M-D in Lahore by taking the parts and constructing a Date in local time.
    // For comparisons we will compare Y/M/D by using formatToParts to avoid timezone shifting issues.
    return { year, month: monthZeroBased+1, day }; // simple container
  }

  // helper to format a Y-M-D object to friendly string using Intl with tz
  function formatLahoreDate(year, monthOneBased, day) {
    const tmp = new Date(year, monthOneBased-1, day);
    return tmp.toLocaleDateString(undefined,{month:'short', day:'numeric'});
  }

  // ---------------------------
  // compute the target yearly window for Lahore local time
  // ---------------------------
  function computeWindow() {
    const nowParts = nowInLahoreParts();
    let year = nowParts.year;
    // birthday is Dec 4 of this 'year' in Lahore
    // if current Lahore date is Dec 4 or later (>= Dec 4), we want the next year's Dec 4 to trigger transform on the upcoming Dec 4.
    if (nowParts.month > (TARGET_MONTH+1) || (nowParts.month === (TARGET_MONTH+1) && nowParts.day >= TARGET_DAY)) {
      year = year + 1;
    }
    // birthday date parts
    const birthday = { year: year, month: TARGET_MONTH+1, day: TARGET_DAY }; // month 1-based
    // start = birthday - (DAYS_TOTAL - 1) days (6 days before birthday to make 7 days until Dec 3)
    // compute start date by creating a Date in local tz and subtracting days
    const tmp = new Date(birthday.year, birthday.month-1, birthday.day);
    tmp.setDate(tmp.getDate() - (DAYS_TOTAL - 1)); // start (Nov 27 when birthday is Dec 4)
    const start = { year: tmp.getFullYear(), month: tmp.getMonth()+1, day: tmp.getDate() };
    return { year, birthday, start };
  }

  // ---------------------------
  // unlocked count based on Lahore date (00:00 unlock)
  // ---------------------------
  function computeUnlockedCount() {
    const url = new URL(window.location.href);
    if (url.searchParams.get('unlock') === 'all') return DAYS_TOTAL;
    if (url.searchParams.get('demo') === 'text') return DAYS_TOTAL; // demo mode

    const now = nowInLahoreParts();
    const win = computeWindow();
    // Convert start into a JS Date in Lahore wall-clock representation
    const startDate = new Date(win.start.year, win.start.month-1, win.start.day, 0, 0, 0);
    const todayDate = new Date(now.year, now.month-1, now.day, 0, 0, 0);
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((todayDate - startDate) / oneDay);
    if (diffDays < 0) return 0;
    if (diffDays >= DAYS_TOTAL) return DAYS_TOTAL;
    return diffDays + 1; // number of unlocked hearts (1..7)
  }

  // check if it's Dec 4 or later in Lahore (for the transformation)
  function isBirthdayDay() {
    const now = nowInLahoreParts();
    const win = computeWindow();
    return (now.year === win.year && now.month === win.birthday.month && now.day >= win.birthday.day) || new URL(window.location.href).searchParams.get('demo') === 'text';
  }

  // ---------------------------
  // create background twinkles
  // ---------------------------
  function createTwinkles(n = 90) {
    const frag = document.createDocumentFragment();
    for (let i=0;i<n;i++){
      const d = document.createElement('div');
      d.className = 'twinkle';
      d.style.left = (Math.random()*100) + 'vw';
      d.style.top = (Math.random()*100) + 'vh';
      d.style.opacity = (0.35 + Math.random()*0.9);
      d.style.width = (1 + Math.random()*2) + 'px';
      d.style.height = d.style.width;
      d.style.animationDuration = (1.2 + Math.random()*2.4) + 's';
      frag.appendChild(d);
    }
    twinklesEl.appendChild(frag);
  }

  // ---------------------------
  // heart SVG (returns element)
  // ---------------------------
  function heartSVG(size = 56, color = '#ffd7e6') {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.classList.add('heart-svg');
    // glow (a blurred path behind)
    const gBlur = document.createElementNS(ns,'path');
    gBlur.setAttribute('d','M12 21s-7.5-4.7-10-8c-2.2-2.8 0-6.2 2.5-6.2 2.2 0 3.3 2 4.5 3.4 1.2-1.4 2.3-3.4 4.5-3.4 2.5 0 4.7 3.4 2.5 6.2-2.5 3.3-10 8-10 8z');
    gBlur.setAttribute('class','heart-glow');
    gBlur.setAttribute('fill', color);
    svg.appendChild(gBlur);
    // core heart
    const path = document.createElementNS(ns,'path');
    path.setAttribute('d','M12 21s-7.5-4.7-10-8c-2.2-2.8 0-6.2 2.5-6.2 2.2 0 3.3 2 4.5 3.4 1.2-1.4 2.3-3.4 4.5-3.4 2.5 0 4.7 3.4 2.5 6.2-2.5 3.3-10 8-10 8z');
    path.setAttribute('fill', color);
    path.setAttribute('class','heart-core');
    svg.appendChild(path);
    return svg;
  }

  // ---------------------------
  // create main hearts
  // ---------------------------
  function buildMainHearts(unlocked) {
    mainStarsEl.innerHTML = '';
    for (let i=0;i<DAYS_TOTAL;i++){
      const pos = positions[i] || {left: 12 + i*10, top: 20 + (i%2)*8};
      const btn = document.createElement('button');
      btn.className = 'heart-btn' + (i < unlocked ? ' unlocked' : ' disabled');
      btn.setAttribute('aria-role','listitem');
      btn.style.left = pos.left + '%';
      btn.style.top = pos.top + '%';
      btn.dataset.index = i;
      // attach SVG heart
      btn.appendChild(heartSVG(56, i < unlocked ? '#ffd7e6' : '#a182a6'));
      // click handlers
      if (i < unlocked) {
        btn.addEventListener('click', ()=> openModal(i));
      } else {
        btn.addEventListener('click', ()=> {
          // small pulse feedback for locked ones
          btn.animate([{transform:'translate(-50%,-50%) scale(0.92)'},{transform:'translate(-50%,-50%) scale(1)'}], {duration:180,iterations:1});
        });
      }
      mainStarsEl.appendChild(btn);
      // subtle floating animation
      btn.animate([{transform:'translate(-50%,-52%)'},{transform:'translate(-50%,-48%)'}],{duration:3000 + (i*120),direction:'alternate',iterations:Infinity,easing:'ease-in-out'});
    }
  }

  // ---------------------------
  // modal open/close
  // ---------------------------
  function openModal(i) {
    const win = computeWindow();
    const startDate = new Date(win.start.year, win.start.month-1, win.start.day);
    const dayDate = new Date(startDate); dayDate.setDate(startDate.getDate() + i);
    modalTitle.textContent = messages[i].title;
    modalText.textContent = messages[i].text;
    modalDate.textContent = formatDate(dayDate);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function formatDate(d) {
    return d.toLocaleDateString(undefined, { month:'short', day:'numeric' });
  }

  // ---------------------------
  // DEC 4 transformation: draw "Happy Birthday Seemal" as stars
  // We'll render text on an offscreen canvas, sample pixel alpha, and place twinkles on those points.
  // ---------------------------
  function showBirthdayMessage() {
    // hide main hearts (fade)
    const nodes = Array.from(document.querySelectorAll('.heart-btn'));
    nodes.forEach(n => n.animate([{opacity:1},{opacity:0}],{duration:500,fill:'forwards'}));
    setTimeout(()=> nodes.forEach(n => n.style.display='none'), 520);

    // prepare canvas
    const skyRect = document.getElementById('sky').getBoundingClientRect();
    canvas.width = skyRect.width;
    canvas.height = skyRect.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // text settings (large responsive)
    const fontSize = Math.max(28, Math.floor(canvas.width / 12));
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px Georgia, serif`;
    // top text: "Happy Birthday"
    ctx.fillText('Happy Birthday', canvas.width/2, canvas.height*0.40);
    // bottom text: name
    const nameFont = Math.max(38, Math.floor(canvas.width / 10));
    ctx.font = `bold ${nameFont}px Georgia, serif`;
    ctx.fillText(TARGET_NAME, canvas.width/2, canvas.height*0.56);

    // sample pixels
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const gap = Math.max(6, Math.floor(canvas.width / 140)); // spacing between stars
    const frag = document.createDocumentFragment();

    // create star nodes only on non-transparent pixels (sampled)
    for (let y=0; y < canvas.height; y += gap){
      for (let x=0; x < canvas.width; x += gap){
        const idx = (y * canvas.width + x) * 4;
        const alpha = img.data[idx+3];
        if (alpha > 120 && Math.random() > 0.5) { // half density for nicer shape
          const el = document.createElement('div');
          el.className = 'twinkle';
          const left = (x / canvas.width) * 100;
          const top = (y / canvas.height) * 100;
          el.style.left = left + 'vw';
          el.style.top = top + 'vh';
          el.style.opacity = (0.9 * (0.6 + Math.random()*0.5));
          el.style.width = (1 + Math.random()*2) + 'px';
          el.style.height = el.style.width;
          el.style.animationDuration = (1.2 + Math.random()*1.8) + 's';
          frag.appendChild(el);
        }
      }
    }

    // clear canvas visible (we used it only to sample)
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // append sample stars to sky
    // remove existing twinkles for clarity
    twinklesEl.innerHTML = '';
    twinklesEl.appendChild(frag);

    // add a celebratory glow text overlay (DOM)
    createBirthdayOverlay();
  }

  function createBirthdayOverlay() {
    // small overlay card showing Happy Birthday Seemal
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '50%';
    overlay.style.top = '72%';
    overlay.style.transform = 'translate(-50%,-50%)';
    overlay.style.background = 'rgba(255,255,255,0.92)';
    overlay.style.color = '#2b0036';
    overlay.style.padding = '14px 18px';
    overlay.style.borderRadius = '12px';
    overlay.style.boxShadow = '0 8px 30px rgba(0,0,0,0.35)';
    overlay.style.fontWeight = '600';
    overlay.style.fontSize = '16px';
    overlay.textContent = `Happy Birthday ${TARGET_NAME} 🎉`;
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .5s ease, transform .45s ease';
    document.getElementById('sky').appendChild(overlay);
    requestAnimationFrame(()=> {
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(-50%,-60%)';
    });
  }

  // ---------------------------
  // init
  // ---------------------------
  function init() {
    createTwinkles(120);
    const unlocked = computeUnlockedCount();
    const isBday = isBirthdayDay();
    // Build hearts according to unlocked count
    buildMainHearts(unlocked);

    // status text
    if (isBday) {
      status.textContent = `It's time — Happy Birthday ${TARGET_NAME}!`;
      // show transform (if ?demo=text provided, also triggers)
      setTimeout(()=> showBirthdayMessage(), 600);
    } else if (unlocked === 0) {
      const win = computeWindow();
      status.textContent = `Countdown starts on ${formatLahoreDisplay(win.start)} (Lahore time).`;
    } else if (unlocked < DAYS_TOTAL) {
      status.textContent = `${unlocked} of ${DAYS_TOTAL} hearts unlocked. Tap the glowing hearts each day.`;
    } else {
      status.textContent = `All hearts unlocked — final message will appear on ${computeWindow().birthday.month}/${computeWindow().birthday.day} (Lahore).`;
    }
  }

  function formatLahoreDisplay(partObj) {
    const d = new Date(partObj.year, partObj.month-1, partObj.day);
    return d.toLocaleDateString(undefined,{month:'short', day:'numeric'});
  }

  // run
  init();

  // expose demo unlock via query param for quick testing: ?unlock=all or ?demo=text
  // (done earlier in compute functions)

  // done
})();
