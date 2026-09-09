/* LOCAL TIME */
const timeEl = document.getElementById('local-time');
function updateTime() {
  if (!timeEl) return;
  const now  = new Date();
  const h    = now.getHours();
  const m    = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = ((h % 12) || 12);
  timeEl.textContent = `● ${h12}:${m} ${ampm} WIB`;
}
updateTime();
setInterval(updateTime, 30000);

/* CUSTOM CURSOR */
const cur = document.getElementById('cur');
if (cur && window.matchMedia('(pointer: fine)').matches) {
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });
  document.querySelectorAll('a, button, .work-row, .sk-list li, .ct-link').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cur.classList.remove('expanded'));
  });
}

/* NAV ON SCROLL */
const navBar = document.getElementById('nav');
if (navBar) {
  window.addEventListener('scroll', () => {
    navBar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* MOBILE DRAWER */
const burger   = document.getElementById('nav-burger');
const drawer   = document.getElementById('mob-drawer');
const overlay  = document.getElementById('mob-overlay');
const closeBtn = document.getElementById('mob-close');

function goToSection(href) {
  const target = document.querySelector(href);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openDrawer() {
  if (!drawer || !overlay || !burger) return;
  drawer.classList.add('is-open');
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  burger.setAttribute('aria-expanded', 'true');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  if (!drawer || !overlay || !burger) return;
  drawer.classList.remove('is-open');
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  burger.setAttribute('aria-expanded', 'false');
  drawer.setAttribute('aria-hidden', 'true');
}

if (burger) burger.addEventListener('click', () => drawer.classList.contains('is-open') ? closeDrawer() : openDrawer());
if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
if (overlay) overlay.addEventListener('click', closeDrawer);

drawer?.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const href = link.getAttribute('href');
    closeDrawer();
    setTimeout(() => goToSection(href), 380);
  });
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  if (a.closest('#mob-drawer')) return;
  a.addEventListener('click', e => {
    e.preventDefault();
    goToSection(a.getAttribute('href'));
  });
});

/* REVEAL ON SCROLL */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* WORK ROW ANIMATION */
document.querySelectorAll('.work-row').forEach((row, i) => {
  row.style.opacity = '0';
  row.style.transform = 'translateY(20px)';
  row.style.transition = `opacity 0.6s ${i * 0.1}s ease, transform 0.6s ${i * 0.1}s ease`;

  const rowObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        rowObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  rowObs.observe(row);
});

/* CONTACT FORM HANDLER */
const form      = document.getElementById('ct-form');
const submitBtn = document.getElementById('cf-submit');
const statusEl  = document.getElementById('cf-status');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name  = document.getElementById('cf-name')?.value.trim();
    const email = document.getElementById('cf-email')?.value.trim();
    const msg   = document.getElementById('cf-msg')?.value.trim();

    if (!name || !email || !msg) {
      if (statusEl) {
        statusEl.textContent = 'Nama, email, dan pesan wajib diisi.';
        statusEl.className = 'cf-status err';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Mengirim…';
    }

    const payload = {
      name,
      email,
      subject: document.getElementById('cf-subject')?.value.trim() || '(Tanpa Subjek)',
      message: msg
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Terjadi kesalahan sistem.');

      if (statusEl) {
        statusEl.textContent = 'Pesan berhasil terkirim! Saya akan merespons segera.';
        statusEl.className = 'cf-status ok';
      }
      form.reset();
    } catch (fetchErr) {
      if (statusEl) {
        statusEl.textContent = fetchErr.message || 'Gagal mengirim pesan.';
        statusEl.className = 'cf-status err';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Kirim Pesan →';
      }
    }
  });
}