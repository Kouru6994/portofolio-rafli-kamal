/* main.js — Rafli Kamal Mustofa Portfolio v2 */

// ── CURSOR ──
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
if (cur && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });
  (function loop() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, .tool-card, .proj-card, .clink, .stat-mini').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.width = '14px'; cur.style.height = '14px';
      ring.style.width = '50px'; ring.style.height = '50px';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.width = '7px'; cur.style.height = '7px';
      ring.style.width = '30px'; ring.style.height = '30px';
    });
  });
}

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', window.scrollY > 48);
}, { passive: true });

// ── MOBILE NAV ──
const burger = document.getElementById('nav-burger');
const menu   = document.getElementById('nav-menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  const [a, b] = burger.querySelectorAll('span');
  if (open) {
    a.style.transform = 'rotate(45deg) translate(5px, 5px)';
    b.style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    a.style.transform = '';
    b.style.transform = '';
  }
});
menu.querySelectorAll('a').forEach(l => {
  l.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.querySelectorAll('span').forEach(s => s.style.transform = '');
  });
});

// ── REVEAL ON SCROLL ──
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── SKILL BARS ──
const barObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const bar = e.target;
      setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 120);
      barObs.unobserve(bar);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.tc-bar').forEach(b => barObs.observe(b));

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── CONTACT FORM ──
const form = document.getElementById('cform');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const orig = btn.textContent;
    btn.textContent = '✅ Terkirim!';
    btn.style.background = '#4ade80';
    btn.style.color = '#0D0D12';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}

// ── PAGE LOAD FADE ──
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .5s ease';
  requestAnimationFrame(() => { document.body.style.opacity = '1'; });
});

// ── TILT on stat cards ──
document.querySelectorAll('.hcard, .stat-main, .stat-mini').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    card.style.transform = `perspective(700px) rotateX(${(y/r.height)*5}deg) rotateY(${-(x/r.width)*5}deg) translateY(-3px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});