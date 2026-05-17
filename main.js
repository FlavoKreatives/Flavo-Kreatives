// =====================
// CURSOR
// =====================
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button, .wcard, .svc, .fbtn, .toggle, .sound-toggle, .float-card, .testi-card, .process-step, .stat').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('active'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});

// =====================
// SOUND
// =====================
const soundToggle = document.getElementById('soundToggle');
const soundOn = document.getElementById('soundOn');
const soundOff = document.getElementById('soundOff');
let soundEnabled = false;

const audioCtx = typeof AudioContext !== 'undefined'
  ? new AudioContext()
  : typeof webkitAudioContext !== 'undefined'
  ? new webkitAudioContext()
  : null;

function playClick() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.07);
  } catch(e) {}
}

soundToggle.addEventListener('click', () => {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  soundEnabled = !soundEnabled;
  soundOn.style.display = soundEnabled ? 'block' : 'none';
  soundOff.style.display = soundEnabled ? 'none' : 'block';
});

document.querySelectorAll('a, button, .fbtn, .svc').forEach(el => {
  el.addEventListener('click', playClick);
});

// =====================
// MODE TOGGLE
// =====================
document.getElementById('modeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  playClick();
});

// =====================
// SCROLL REVEAL
// =====================
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.07 });
revealEls.forEach(el => revealObs.observe(el));

// =====================
// SCROLL PARALLAX — subtle
// =====================
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const orb = document.querySelector('.hero-orb');
  if (orb) orb.style.transform = `translate(-50%, calc(-58% + ${sy * 0.15}px))`;
}, { passive: true });

// =====================
// HERO WORD ANIMATION
// =====================
function animateWords() {
  const words = document.querySelectorAll('.word');
  words.forEach((w, i) => {
    setTimeout(() => w.classList.add('vis'), i * 55);
  });
}
window.addEventListener('load', () => setTimeout(animateWords, 80));

// =====================
// FLOATING CARDS PARALLAX — desktop only
// =====================
const f1 = document.getElementById('float1');
const f2 = document.getElementById('float2');
const f3 = document.getElementById('float3');

if (window.innerWidth > 900) {
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    if (f1) f1.style.transform = `rotate(-8deg) translateY(${20 + dy * 10}px) translateX(${dx * 6}px)`;
    if (f2) f2.style.transform = `translateX(calc(-50% + ${dx * 12}px)) rotate(1deg) translateY(${dy * 10}px)`;
    if (f3) f3.style.transform = `rotate(7deg) translateY(${20 + dy * 8}px) translateX(${dx * 6}px)`;
  });
}

// =====================
// MOBILE FLOAT CYCLE
// =====================
const floatMobile = document.getElementById('floatMobile');
let mobileImgs = [];
let mobileIdx = 0;

function cycleMobileFloat() {
  if (mobileImgs.length === 0 || !floatMobile) return;
  floatMobile.style.opacity = '0';
  setTimeout(() => {
    mobileIdx = (mobileIdx + 1) % mobileImgs.length;
    floatMobile.style.backgroundImage = `url(${mobileImgs[mobileIdx]})`;
    floatMobile.style.backgroundSize = 'cover';
    floatMobile.style.backgroundPosition = 'center';
    floatMobile.style.opacity = '1';
  }, 400);
}

// =====================
// CONTENTFUL CONFIG
// =====================
const SPACE = 'am1xfyhkx406';
const TOKEN = 'Ljuziy4OFT_iQyVLliVwFbT46smaT553QnJopFL0Hq0';
const BASE = `https://cdn.contentful.com/spaces/${SPACE}`;
const P = `access_token=${TOKEN}&include=1`;

function getAssets(includes) {
  const map = {};
  if (includes && includes.Asset) {
    includes.Asset.forEach(a => {
      if (a.fields && a.fields.file) {
        map[a.sys.id] = 'https:' + a.fields.file.url;
      }
    });
  }
  return map;
}

// =====================
// HERO VIDEO
// =====================
async function loadHeroVideo() {
  try {
    const res = await fetch(`${BASE}/entries?content_type=project&fields.showreel=true&${P}`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return;
    const assets = getAssets(data.includes);
    const item = data.items[0];
    const f = item.fields;
    const wrap = document.getElementById('heroVideoWrap');
    if (!wrap) return;
    if (f.url) {
      wrap.innerHTML = `<iframe src="${f.url}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0" allow="autoplay" frameborder="0"></iframe>`;
    } else if (f.image && assets[f.image.sys.id]) {
      const url = assets[f.image.sys.id];
      wrap.innerHTML = `<video src="${url}" autoplay muted loop playsinline></video>`;
    }
  } catch(e) {
    console.error('Hero video:', e);
  }
}

// =====================
// HERO FEATURED IMAGES
// =====================
async function loadHeroImages() {
  try {
    const res = await fetch(`${BASE}/entries?content_type=project&fields.featured=true&${P}`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return;
    const assets = getAssets(data.includes);
    const ids = ['float1', 'float2', 'float3'];

    data.items.slice(0, 3).forEach((item, i) => {
      const imgId = item.fields.image && item.fields.image.sys.id;
      const url = imgId ? assets[imgId] : null;
      if (url) {
        mobileImgs.push(url);
        const el = document.getElementById(ids[i]);
        if (el) {
          el.style.backgroundImage = `url(${url})`;
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
        }
      }
    });

    if (floatMobile && mobileImgs.length > 0) {
      floatMobile.style.backgroundImage = `url(${mobileImgs[0]})`;
      floatMobile.style.backgroundSize = 'cover';
      floatMobile.style.backgroundPosition = 'center';
      floatMobile.style.transition = 'opacity 0.4s ease';
      if (mobileImgs.length > 1) {
        setInterval(cycleMobileFloat, 3000);
      }
    }
  } catch(e) {
    console.error('Hero images:', e);
  }
}

// =====================
// SERVICE CLICK
// =====================
document.querySelectorAll('.svc').forEach(svc => {
  svc.addEventListener('click', () => {
    const filter = svc.dataset.filter;
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
    const btn = document.querySelector(`.fbtn[data-cat="${filter}"]`);
    if (btn) btn.classList.add('on');
    filterWork(filter);
    document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
    playClick();
  });
});

// =====================
// FILTER
// =====================
let allCards = [];
const INITIAL_COUNT = 2;
let currentFilter = 'All';
let visibleCount = INITIAL_COUNT;

function filterWork(cat) {
  currentFilter = cat;
  visibleCount = INITIAL_COUNT;
  renderCards();
}

function renderCards() {
  const filtered = currentFilter === 'All'
    ? allCards
    : allCards.filter(c => c.dataset.cat === currentFilter);
  allCards.forEach(c => c.style.display = 'none');
  filtered.slice(0, visibleCount).forEach(c => c.style.display = 'block');
  const btn = document.getElementById('loadMoreBtn');
  if (btn) {
    btn.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';
  }
}

document.querySelectorAll('.fbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    filterWork(btn.dataset.cat);
    playClick();
  });
});

const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    visibleCount += 4;
    renderCards();
    playClick();
  });
}

// =====================
// LIGHTBOX
// =====================
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbVideo = document.getElementById('lbVideo');
const lbCap = document.getElementById('lbCaption');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
let currentLbIndex = 0;
let lbItems = [];

function openLightboxAt(index) {
  if (lbItems.length === 0) return;
  currentLbIndex = (index + lbItems.length) % lbItems.length;
  const item = lbItems[currentLbIndex];
  if (!item) return;
  lbImg.style.display = 'none';
  lbVideo.style.display = 'none';
  if (item.type === 'video') {
    lbVideo.src = item.src + '?autoplay=1';
    lbVideo.style.display = 'block';
  } else if (item.type === 'pdf') {
    window.open(item.src, '_blank');
    return;
  } else {
    lbImg.src = item.src;
    lbImg.style.display = 'block';
  }
  lbCap.textContent = `${item.client} — ${currentLbIndex + 1} / ${lbItems.length}`;
  lb.classList.add('open');
}

function buildLbItems() {
  const visibleCards = allCards.filter(c => c.style.display !== 'none');
  lbItems = visibleCards.map(c => ({
    type: c.dataset.type || 'image',
    src: c.dataset.type === 'video'
      ? c.dataset.url || ''
      : c.dataset.type === 'pdf'
      ? c.dataset.url || ''
      : c.querySelector('img') ? c.querySelector('img').src : '',
    client: c.dataset.client || ''
  }));
}

if (lbPrev) lbPrev.addEventListener('click', () => {
  openLightboxAt(currentLbIndex - 1);
  playClick();
});
if (lbNext) lbNext.addEventListener('click', () => {
  openLightboxAt(currentLbIndex + 1);
  playClick();
});

document.getElementById('lbClose').addEventListener('click', () => {
  lb.classList.remove('open');
  lbVideo.src = '';
});
lb.addEventListener('click', e => {
  if (e.target === lb) { lb.classList.remove('open'); lbVideo.src = ''; }
});
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') { lb.classList.remove('open'); lbVideo.src = ''; }
  if (e.key === 'ArrowRight') { openLightboxAt(currentLbIndex + 1); playClick(); }
  if (e.key === 'ArrowLeft') { openLightboxAt(currentLbIndex - 1); playClick(); }
});

let touchStartX = 0;
lb.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
lb.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) openLightboxAt(currentLbIndex + 1);
    else openLightboxAt(currentLbIndex - 1);
  }
});

// =====================
// LOAD WORK GRID
// =====================
async function loadProjects() {
  const grid = document.getElementById('workGrid');
  try {
    const res = await fetch(`${BASE}/entries?content_type=project&order=fields.order&${P}`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      grid.innerHTML = '<div class="work-empty">No projects yet. Upload your work in Contentful.</div>';
      return;
    }

    const assets = getAssets(data.includes);
    grid.innerHTML = '';
    allCards = [];

    data.items.forEach(item => {
      const f = item.fields;
      const title = f.title || '';
      const client = f.client || '';
      const category = f.category || '';
      const type = f.type || 'image';
      const url = f.url || '';
      const imgUrl = f.image && assets[f.image.sys.id] ? assets[f.image.sys.id] : '';

      const card = document.createElement('div');
      card.className = 'wcard';
      card.dataset.cat = category;
      card.dataset.client = client;
      card.dataset.type = type;
      if (url) card.dataset.url = url;
      card.style.display = 'none';

      card.innerHTML = `
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${client}" loading="lazy">`
          : `<div class="wcard-bg">${title}</div>`}
        <div class="wcard-overlay">
          <div class="wcard-tag">${category}</div>
          <div class="wcard-name">${client}</div>
        </div>
        ${type === 'pdf' ? '<div class="wcard-type">PDF</div>' : ''}
        ${type === 'video' ? '<div class="wcard-type">▶ Video</div>' : ''}
      `;

      card.addEventListener('click', () => {
        buildLbItems();
        const visibleCards = allCards.filter(c => c.style.display !== 'none');
        const idx = visibleCards.indexOf(card);
        openLightboxAt(idx >= 0 ? idx : 0);
      });

      card.addEventListener('mouseenter', () => cursor.classList.add('active'));
      card.addEventListener('mouseleave', () => cursor.classList.remove('active'));

      grid.appendChild(card);
      allCards.push(card);
    });

    renderCards();

  } catch(e) {
    console.error('Projects error:', e);
    grid.innerHTML = '<div class="work-empty">Could not load projects.</div>';
  }
}

// =====================
// INIT
// =====================
loadHeroVideo();
loadHeroImages();
loadProjects();
