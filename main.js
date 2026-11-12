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

/* CONTACT FORM HANDLER (Web3Forms Integration) */
const form      = document.getElementById('ct-form');
const submitBtn = document.getElementById('cf-submit');
const statusEl  = document.getElementById('cf-status');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameInput  = document.getElementById('cf-name') || form.querySelector('input[name="name"]');
    const emailInput = document.getElementById('cf-email') || form.querySelector('input[name="email"]');
    const subjInput  = document.getElementById('cf-subject') || form.querySelector('input[name="subject"]');
    const msgInput   = document.getElementById('cf-msg') || form.querySelector('textarea[name="message"]');
    const botcheck   = form.querySelector('input[name="botcheck"]');

    const name  = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subj  = subjInput ? subjInput.value.trim() : '';
    const msg   = msgInput ? msgInput.value.trim() : '';

    // Anti-spam honeypot check
    if (botcheck && botcheck.checked) {
      return;
    }

    // Validasi input
    if (!name) {
      if (statusEl) {
        statusEl.textContent = 'Nama wajib diisi.';
        statusEl.className = 'cf-status err';
      }
      nameInput?.focus();
      return;
    }

    if (!email) {
      if (statusEl) {
        statusEl.textContent = 'Email wajib diisi.';
        statusEl.className = 'cf-status err';
      }
      emailInput?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (statusEl) {
        statusEl.textContent = 'Format email tidak valid. Pastikan format seperti nama@domain.com.';
        statusEl.className = 'cf-status err';
      }
      emailInput?.focus();
      return;
    }

    if (!msg) {
      if (statusEl) {
        statusEl.textContent = 'Pesan tidak boleh kosong.';
        statusEl.className = 'cf-status err';
      }
      msgInput?.focus();
      return;
    }

    // Set UI loading state
    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Mengirim…';
    }
    if (statusEl) {
      statusEl.textContent = 'Sedang mengirim pesan Anda…';
      statusEl.className = 'cf-status';
    }

    const formData = new FormData(form);

    // Pastikan access_key terisi
    if (!formData.get('access_key')) {
      formData.append('access_key', '7940ccb0-9780-4672-9deb-9548a2070bef');
    }

    // Atur subjek default jika tidak diisi pengguna
    if (!subj) {
      formData.set('subject', `[Portfolio Contact] Pesan Baru dari ${name}`);
    }

    try {
      const response = await fetch('https://api.web3Forms.com/submit'.toLowerCase(), {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result && result.success) {
        if (statusEl) {
          statusEl.textContent = 'Pesan berhasil terkirim! Terima kasih telah menghubungi saya, saya akan segera merespons.';
          statusEl.className = 'cf-status ok';
        }
        form.reset();
      } else {
        const errorMsg = (result && result.message)
          ? result.message
          : 'Terjadi kendala saat mengirim pesan. Silakan coba kembali.';
        throw new Error(errorMsg);
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = err.message || 'Gagal mengirim pesan. Silakan periksa koneksi internet Anda atau coba lagi nanti.';
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