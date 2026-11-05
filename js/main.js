(() => {
  // Paste your Web3Forms access key between the quotes (it is safe to keep in the page)
  const WEB3FORMS_KEY = 'd6cb753e-fe94-473e-864f-fb01ba515706';
  const CONTACT_EMAIL = 'aviasnani3104@gmail.com';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Card photo: try common file names, hide if none found */
  const photo = $('.card-photo');
  if (photo) {
    const names = ['avi.jpg', 'avi.jpeg', 'avi.png', 'avi.webp', 'Avi.jpg', 'Avi.jpeg', 'Avi.png', 'Avi.JPG', 'avi.JPG', 'photo.jpg', 'photo.png'];
    let n = 0;
    photo.addEventListener('error', () => {
      if (n < names.length) { photo.src = 'images/' + names[n++]; }
      else { console.warn('No photo found in /images. Add images/avi.jpg'); photo.remove(); }
    });
    photo.src = 'images/' + names[n++];
  }

  /* Loader counter */
  const count = $('#count');
  const start = performance.now(), dur = reduce ? 1 : 1600;
  (function tick(t) {
    const p = Math.min((t - start) / dur, 1);
    count.textContent = Math.round(p * 100) + '%';
    p < 1 ? requestAnimationFrame(tick) : setTimeout(() => document.body.classList.add('loaded'), 250);
  })(start);

  /* Typing headline */
  const typed = $('#typed');
  const roles = ['full-stack developer', 'software engineer', 'techie', 'problem solver'];
  let ri = 0, ci = 0, del = false;
  (function type() {
    const word = roles[ri];
    if (reduce) { typed.textContent = word; return; }
    ci += del ? -1 : 1;
    typed.textContent = word.slice(0, ci);
    let wait = del ? 40 : 90;
    if (!del && ci === word.length) { del = true; wait = 1600; }
    else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 400; }
    setTimeout(type, wait);
  })();

  /* Card tilt */
  const card = $('#card');
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 16 + 'deg');
    card.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 16 + 'deg');
  });
  card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });

  /* Dublin clock */
  const clock = $('#clock');
  const fmt = new Intl.DateTimeFormat('en-IE', { hour: 'numeric', minute: '2-digit', timeZone: 'Europe/Dublin' });
  const upd = () => clock.textContent = fmt.format(new Date());
  upd(); setInterval(upd, 15000);

  /* Menu */
  const menu = $('#menu'), mBtn = $('#menuBtn');
  const setMenu = open => {
    if (open) menu.hidden = false;
    requestAnimationFrame(() => menu.classList.toggle('open', open));
    mBtn.setAttribute('aria-expanded', open);
    mBtn.textContent = open ? 'Close' : 'Menu';
    if (!open) setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 700);
  };
  mBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Doors: drag to scroll, click to open */
  const wall = $('#wall');
  let down = false, sx = 0, sl = 0, moved = false;
  wall.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sl = wall.scrollLeft; });
  addEventListener('pointerup', () => { down = false; wall.classList.remove('drag'); });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; wall.classList.add('drag'); }
    wall.scrollLeft = sl - dx;
  });
  $$('.door', wall).forEach(d => d.addEventListener('click', () => {
    if (moved) return;
    const open = d.classList.toggle('open');
    d.setAttribute('aria-expanded', open);
  }));

  /* Timeline: active item, counter, label */
  const items = $$('#timeline > li');
  $('#total').textContent = String(items.length).padStart(2, '0');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    items.forEach(i => i.classList.toggle('active', i === e.target));
    $('#idx').textContent = String(items.indexOf(e.target) + 1).padStart(2, '0');
    $('#when').textContent = e.target.dataset.when;
  }), { rootMargin: '-45% 0px -45% 0px' });
  items.forEach(i => io.observe(i));

  /* Custom cursor */
  const cur = $('#cursor'), lab = $('span', cur);
  let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
  (function follow() {
    cx += (tx - cx) * .2; cy += (ty - cy) * .2;
    cur.style.transform = `translate(${cx}px,${cy}px)`;
    requestAnimationFrame(follow);
  })();
  $$('[data-cursor]').forEach(el => {
    el.addEventListener('pointerenter', () => { lab.textContent = el.dataset.cursor; cur.classList.add('label'); });
    el.addEventListener('pointerleave', () => cur.classList.remove('label'));
  });
  $$('.door').forEach(el => {
    el.addEventListener('pointerenter', () => { lab.textContent = 'Open'; cur.classList.add('label'); });
    el.addEventListener('pointerleave', () => cur.classList.remove('label'));
  });

  /* Contact modal */
  const modal = $('#modal'), form = $('#form'), done = $('#done'), err = $('#err');
  $$('[data-open-contact]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); setMenu(false);
    form.hidden = false; done.hidden = true; modal.showModal();
  }));
  $('#closeModal').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    if (d.get('company')) return; // honeypot
    const name = d.get('name').trim(), email = d.get('email').trim(), msg = d.get('msg').trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !msg) { err.textContent = 'Fill in your name, a valid email and a message.'; return; }
    err.textContent = '';
    const btn = form.querySelector('button[type="submit"]');
    const fallback = () => {
      const body = `${msg}\n\nFrom: ${name} (${email})`;
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Hello from ' + name)}&body=${encodeURIComponent(body)}`;
      form.hidden = true; done.hidden = false; form.reset();
    };
    // No key pasted yet: fall back to the visitor's email app
    if (WEB3FORMS_KEY.startsWith('PASTE')) return fallback();
    btn.disabled = true; btn.textContent = 'Sending...';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, name, email, message: msg, subject: 'Portfolio message from ' + name })
    }).then(r => r.json()).then(res => {
      if (res.success) { form.hidden = true; done.hidden = false; form.reset(); }
      else err.textContent = 'Could not send. Please email ' + CONTACT_EMAIL + ' directly.';
    }).catch(() => { err.textContent = 'Could not send. Please email ' + CONTACT_EMAIL + ' directly.'; })
      .finally(() => { btn.disabled = false; btn.textContent = 'Send message'; });
  });
})();