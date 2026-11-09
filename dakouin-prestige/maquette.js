// Script commun aux maquettes de style (style-1, style-2, style-3).
(() => {
  const WA = '2290159431810';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const body = document.body, top = $('#top'), mbar = $('#mbar'), fab = $('#fab'), hero = $('#accueil');

  // En-tête opaque + barre d'actions après le hero
  const onScroll = () => {
    const y = window.scrollY;
    top.classList.toggle('solid', y > 40);
    const past = y > hero.offsetHeight * 0.6;
    mbar.classList.toggle('show', past);
    fab.classList.toggle('show', past);
  };
  addEventListener('scroll', onScroll, {passive: true}); onScroll();

  // Menu mobile
  const burger = $('.burger'), sheet = $('#sheet');
  const setMenu = open => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    sheet.setAttribute('aria-hidden', !open);
  };
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  sheet.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Apparition au défilement
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 80 + 'ms';
      el.classList.add('in'); io.unobserve(el);
    });
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
  $$('.rv').forEach(el => io.observe(el));

  // Onglets de la carte
  const tabs = $$('.tab'), panels = $$('.panel'), imgs = $$('.stage img');
  const select = i => {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach((p, k) => { p.hidden = k !== i; });
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(n); tabs[n].focus();
      }
    });
  });

  // Les prestations pré-sélectionnent le type d'événement
  $$('a[data-type]').forEach(t => t.addEventListener('click', () => {
    const r = $(`input[name=type][value="${t.dataset.type}"]`);
    if (r) r.checked = true;
  }));

  // Galerie + visionneuse
  const shots = $$('#gallery [data-full]');
  const lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  let cur = 0;
  const show = i => {
    cur = (i + shots.length) % shots.length;
    const b = shots[cur], im = b.querySelector('img');
    lbImg.src = b.dataset.full; lbImg.alt = im.alt; lbCap.textContent = im.alt;
  };
  shots.forEach((b, i) => b.addEventListener('click', () => { show(i); lb.showModal(); }));
  $('#lb-close').onclick = () => lb.close();
  $('#lb-prev').onclick = () => show(cur - 1);
  $('#lb-next').onclick = () => show(cur + 1);
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
  let sx = 0;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive: true});
  lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)); });

  // Formulaire -> message WhatsApp pré-rempli
  const form = $('#form'), name = $('#name'), err = $('#name-err'), date = $('#date');
  date.min = new Date().toISOString().slice(0, 10);
  name.addEventListener('input', () => { name.removeAttribute('aria-invalid'); err.classList.remove('show'); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!name.value.trim()) { name.setAttribute('aria-invalid', 'true'); err.classList.add('show'); name.focus(); return; }
    const f = new FormData(form);
    const d = f.get('date') ? new Date(f.get('date') + 'T12:00').toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) : 'à définir';
    const lines = [
      'Bonjour Dakouin Prestige, je souhaite un devis.',
      '',
      `• Événement : ${f.get('type')}`,
      `• Date : ${d}`,
      `• Invités : ${f.get('guests')}`,
      `• Lieu : ${f.get('place').trim() || 'à préciser'}`,
      f.get('msg').trim() ? `• Précisions : ${f.get('msg').trim()}` : null,
      '',
      f.get('name').trim()
    ].filter(l => l !== null);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();
