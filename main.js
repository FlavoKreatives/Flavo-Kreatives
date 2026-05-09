// CUSTOM CURSOR
const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button, .wcard, .svc, .fbtn, .toggle').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

// MODE TOGGLE
document.getElementById('modeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
});

// SCROLL REVEAL
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// CONTENTFUL CONFIG
const SPACE_ID = 'am1xfyhkx406';
const ACCESS_TOKEN = 'Ljuziy4OFT_iQyVLliVwFbT46smaT553QnJopFL0Hq0';
const API_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=project&order=fields.order&access_token=${ACCESS_TOKEN}&include=1`;
const HERO_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=project&fields.featured=true&access_token=${ACCESS_TOKEN}&include=1`;

// SERVICE CLICK → FILTER + SCROLL
document.querySelectorAll('.svc').forEach(svc => {
  svc.addEventListener('click', () => {
    const filter = svc.dataset.filter;
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
    document.querySelector(`.fbtn[data-cat="${filter}"]`).classList.add('on');
    filterWork(filter);
    document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
  });
});

// FILTER FUNCTION
function filterWork(cat) {
  document.querySelectorAll('.wcard').forEach(card => {
    if (cat === 'All' || card.dataset.cat === cat) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// FILTER BUTTONS
document.querySelectorAll('.fbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    filterWork(btn.dataset.cat);
  });
});

// LIGHTBOX
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

// FETCH HERO FEATURED IMAGES
async function loadHero() {
  try {
    const res = await fetch(HERO_URL);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return;

    const assets = {};
    if (data.includes && data.includes.Asset) {
      data.includes.Asset.forEach(asset => {
        assets[asset.sys.id] = 'https:' + asset.fields.file.url;
      });
    }

    const floats = ['float1', 'float2', 'float3'];
    data.items.slice(0, 3).forEach((item, i) => {
      const imgId = item.fields.image && item.fields.image.sys.id;
      const imgUrl = imgId ? assets[imgId] : null;
      if (imgUrl) {
        const el = document.getElementById(floats[i]);
        if (el) {
          el.style.backgroundImage = `url(${imgUrl})`;
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
        }
      }
    });
  } catch (err) {
    console.error('Hero load error:', err);
  }
}

// FETCH ALL PROJECTS AND BUILD WORK GRID
async function loadProjects() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return;

    const assets = {};
    if (data.includes && data.includes.Asset) {
      data.includes.Asset.forEach(asset => {
        assets[asset.sys.id] = 'https:' + asset.fields.file.url;
      });
    }

    const grid = document.getElementById('workGrid');
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

      card.addEventListener('mouseenter', () => cursor.classList.add('big'));
      card.addEventListener('mouseleave', () => cursor.classList.remove('big'));

      grid.appendChild(card);
    });

  } catch (err) {
    console.error('Contentful error:', err);
  }
}

loadHero();
loadProjects();
