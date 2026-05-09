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

document.querySelectorAll('.wcard').forEach(card => {
  card.addEventListener('click', () => {
    const type = card.dataset.type;
    const client = card.dataset.client;

    lbImg.style.display = 'none';
    lbVideo.style.display = 'none';

    if (type === 'video') {
      lbVideo.src = card.dataset.url + '?autoplay=1';
      lbVideo.style.display = 'block';
    } else if (type === 'pdf') {
      window.open(card.dataset.url, '_blank');
      return;
    } else {
      lbImg.src = card.dataset.img || '';
      lbImg.style.display = 'block';
    }

    lbCap.textContent = client;
    lb.classList.add('open');
  });
});

// CLOSE LIGHTBOX
document.getElementById('lbClose').addEventListener('click', () => {
  lb.classList.remove('open');
  lbVideo.src = '';
});

lb.addEventListener('click', e => {
  if (e.target === lb) {
    lb.classList.remove('open');
    lbVideo.src = '';
  }
});

// CLOSE LIGHTBOX WITH ESCAPE KEY
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    lb.classList.remove('open');
    lbVideo.src = '';
  }
});
