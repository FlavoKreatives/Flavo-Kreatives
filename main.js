// CONTENTFUL CONFIG
const SPACE_ID = 'am1xfyhkx406';
const ACCESS_TOKEN = 'Ljuziy4OFT_iQyVLliVwFbT46smaT553QnJopFL0Hq0';
const API_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=project&order=fields.order&access_token=${ACCESS_TOKEN}&include=1`;

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

// SERVICE CLICK → FILTER + SCROLL TO WORK
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

// CLOSE LIGHTBOX
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

// STATIC CARD CLICKS (placeholder cards in HTML)
document.querySelectorAll('.wcard').forEach(card => {
  card.addEventListener('click', () => {
    const type = card.dataset.type;
    const client = card.dataset.client;
    const url = card.dataset.url || '';
    const img = card.dataset.img || '';
    openLightbox(type, type === 'video' ? url : img, client);
  });
});

// FETCH FROM CONTENTFUL AND BUILD WORK GRID
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
      if (type === 'video') card.dataset.url = url;
      if (type === 'pdf') card.dataset.url = url;
      if (imgUrl) card.dataset.img = imgUrl;

      card.innerHTML = `
        ${imgUrl ? `<img src="${imgUrl}" alt="${title}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s">` : `<div class="wcard-bg">${title}</div>`}
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
        const img = card.querySelector('img');
        if (img) img.style.transform = 'scale(1.07)';
      });
      card.addEventListener('mouseleave', () => {
        const img = card.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      });

      grid.appendChild(card);
    });

  } catch (err) {
    console.error('Contentful error:', err);
  }
}

loadProjects();
