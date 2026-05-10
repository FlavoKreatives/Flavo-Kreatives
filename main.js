// =====================
// CUSTOM CURSOR
// =====================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, .wcard, .svc, .fbtn, .toggle, .sound-toggle, .float-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('active');
    follower.classList.add('active');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('active');
    follower.classList.remove('active');
  });
});

// =====================
// SOUND
// =====================
const ambient = document.getElementById('ambientSound');
const clickSound = document.getElementById('clickSound');
const soundToggle = document.getElementById('soundToggle');
const soundOn = document.getElementById('soundOn');
const soundOff = document.getElementById('soundOff');
let soundEnabled = false;

ambient.volume = 0.08;
clickSound.volume = 0.3;

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    ambient.play().catch(() => {});
    soundOn.style.display = 'block';
    soundOff.style.display = 'none';
  } else {
    ambient.pause();
    soundOn.style.display = 'none';
    soundOff.style.display = 'block';
  }
});

function playClick() {
  if (!soundEnabled) return;
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}

document.querySelectorAll('a, button, .fbtn, .svc, .toggle').forEach(el => {
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
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
revealEls.forEach(el => revealObserver.observe(el));

// =====================
// HERO WORD ANIMATION
// =====================
function animateWords() {
  const words = document.querySelectorAll('.word');
  words.forEach((word, i) => {
    setTimeout(() => {
      word.classList.add('visible');
    }, 120 * i);
  });
}
window.addEventListener('load', () => {
  setTimeout(animateWords, 300);
});

// =====================
// FLOATING CARDS — CURSOR PARALLAX
// =====================
document.addEventListener('mousemove', e => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  const f1 = document.getElementById('float1');
  const f2 = document.getElementById('float2');
  const f3 = document.getElementById('float3');

  if (f1) f1.style.transform = `rotate(-7deg) translate(${dx * 10}px, ${dy * 10}px)`;
  if (f2) f2.style.transform = `rotate(4deg) translate(${dx * 16}px, ${dy * 16}px)`;
  if (f3) f3.style.transform = `rotate(-3deg) translate(${dx * 8}px, ${dy * 8}px)`;
});

// =====================
// CONTENTFUL CONFIG
// =====================
const SPACE_ID = 'am1xfyhkx406';
const ACCESS_TOKEN = 'Ljuziy4OFT_iQyVLliVwFbT46smaT553QnJopFL0Hq0';
const BASE = `https://cdn.contentful.com/spaces/${SPACE_ID}`;
const PARAMS = `access_token=${ACCESS_TOKEN}&include=1`;

// =====================
// SERVICE CLICK → FILTER + SCROLL
// =====================
document.querySelectorAll('.svc').forEach(svc => {
  svc.addEventListener('click', () => {
    const filter = svc.dataset.filter;
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
    const btn = document.querySelector(`.fbtn[data-cat="${filter}"]`);
    if (btn) btn.classList.add('on');
    filterWork(filter);
    document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
  });
});

// =====================
// FILTER
// =====================
function filterWork(cat) {
  document.querySelectorAll('.wcard').forEach(card => {
    card.style.display = (cat === 'All' || card.dataset.cat === cat) ? 'block' : 'none';
  });
}

document.querySelectorAll('.fbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    filterWork(btn.dataset.cat);
    playClick();
  });
});

// =====================
// LIGHTBOX
// =====================
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbVideo = document.getElementById('lbVideo');
const lbCap = document.getElementById('lbCaption');

function openLightbox(type, src, client) {
  lbImg.style.display = 'none';
  lbVideo.style.display = 'none';
  if (type === 'video') {
    lbVideo.src = src + '?autoplay=1';
    lbVideo.style.display = 'block';
  } else if (type === 'pdf') {
    window.open(src, '_blank');
    return;
  } else {
    lbImg.src = src;
    lbImg.style.display = 'block';
  }
  lbCap.textContent = client;
  lb.classList.add('open');
  playClick();
}

document.getElementById('lbClose').addEventListener('click', () => {
  lb.classList.remove('open');
  lbVideo.src = '';
});
lb.addEventListener('click', e => {
  if (e.target === lb) { lb.classList.remove('open'); lbVideo.src = ''; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { lb.classList.remove('open'); lbVideo.src = ''; }
});

// =====================
// FETCH ASSETS HELPER
// =====================
function buildAssetMap(includes) {
  const map = {};
  if (includes && includes.Asset) {
    includes.Asset.forEach(a => {
      map[a.sys.id] = 'https:' + a.fields.file.url;
    });
  }
  return map;
}

// =====================
// LOAD HERO FEATURED IMAGES
// =====================
async function loadHero() {
  try {
    const res = await fetch(`${BASE}/entries?content_type=project&fields.featured=true&${PARAMS}`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return;
    const assets = buildAssetMap(data.includes);
    const ids = ['float1', 'float2', 'float3'];
    data.items.slice(0, 3).forEach((item, i) => {
      const imgId = item.fields.image && item.fields.image.sys.id;
      const url = imgId ? assets[imgId] : null;
      if (url) {
        const el = document.getElementById(ids[i]);
        if (el) {
          el.style.backgroundImage = `url(${url})`;
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
        }
      }
    });
  } catch (e) {
    console.error('Hero error:', e);
  }
}

// =====================
// LOAD SHOWREEL
// =====================
async function loadShowreel() {
  try {
    const res = await fetch(`${BASE}/entries?content_type=project&fields.showreel=true&${PARAMS}`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return;
    const assets = buildAssetMap(data.includes);
    const item = data.items[0];
    const f = item.fields;
    const section = document.getElementById('showreel');
    const wrap = document.getElementById('reelWrap');

    if (f.url) {
      wrap.innerHTML = `<iframe src="${f.url}" allowfullscreen allow="autoplay"></iframe>`;
      section.style.display = 'block';
    } else if (f.image) {
      const url = assets[f.image.sys.id];
      if (url) {
        wrap.innerHTML = `<video src="${url}" autoplay muted loop playsinline></video>`;
        section.style.display = 'block';
      }
    }
  } catch (e) {
    console.error('Showreel error:', e);
  }
}

// =====================
// LOAD WORK GRID
// =====================
async function loadProjects() {
  try {
    const res = await fetch(`${BASE}/entries?content_type=project&order=fields.order&${PARAMS}`);
    const data = await res.json();
    const grid = document.getElementById('workGrid');

    if (!data.items || data.items.length === 0) {
      grid.innerHTML = '<div class="work-empty">No projects yet. Upload your work in Contentful.</div>';
      return;
    }

    const assets = buildAssetMap(data.includes);
    grid.innerHTML = '';

    data.items.forEach(item => {
      const f = item.fields;
      const title = f.title || '';
      const client = f.client || '';
      const category = f.category || '';
      const type = f.type || 'image';
      const url = f.url || '';
      const imgUrl = f.image ? assets[f.image.sys.id] : '';

      const card = document.createElement('div');
      card.className = 'wcard';
      card.dataset.cat = category;
      card.dataset.client = client;
      card.dataset.type = type;

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
        openLightbox(type, type === 'video' ? url : (type === 'pdf' ? url : imgUrl), client);
      });

      card.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        follower.classList.add('active');
      });
      card.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        follower.classList.remove('active');
      });

      grid.appendChild(card);
    });

  } catch (e) {
    console.error('Projects error:', e);
    document.getElementById('workGrid').innerHTML = '<div class="work-empty">Could not load projects.</div>';
  }
}

// =====================
// INIT
// =====================
loadHero();
loadShowreel();
loadProjects();
