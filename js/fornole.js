// FORNOLE · Ristorante // Pizza & Pan
import { initKit } from '../kit/kit.js?v=1';
import { ahoraEn, DIAS } from '../kit/core/turnos.js?v=1';

window.__fornole = true;
const html = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esDesk = () => matchMedia('(min-width: 1024px)').matches;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const hs = (s) => (String(s).startsWith('00') ? String(s) : String(s).replace(/^0(\d)/, '$1'));
const DLARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const TZ = 'America/Argentina/Buenos_Aires';

// ============ INTRO: sube la persiana del ex taller ============
async function intro() {
  const el = $('#intro');
  if (!html.classList.contains('con-intro') || !el) { html.classList.add('listo'); el?.remove(); return; }
  const celu = !matchMedia('(min-width: 768px)').matches;
  const img = $('[data-hero-img]');
  const imgOk = img && !img.complete ? new Promise(r => { img.onload = img.onerror = r; }) : Promise.resolve();
  await Promise.race([Promise.all([document.fonts?.ready, imgOk]), sleep(2400)]);
  el.classList.add('play');                    // el logo se pinta sobre la chapa
  await sleep(celu ? 700 : 900);
  el.classList.add('abre');                    // sube la persiana
  html.classList.add('listo');
  await sleep(celu ? 600 : 750);
  html.classList.remove('con-intro');
  el.remove();
}

// ============ ENTRADAS ============
function reveal() {
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
  }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.anim, .titulo, .hito, .m').forEach(el => { if (!el.closest('.hero')) io.observe(el); });
}

// ============ BARRA + MENÚ ============
function barra() {
  const b = $('#barra'), menu = $('#menu'), btn = $('[data-menu]');
  let tick = false;
  const enHero = () => html.classList.toggle('en-hero', scrollY < innerHeight * .6);
  enHero();
  addEventListener('scroll', () => { if (tick) return; tick = true; requestAnimationFrame(() => { b.classList.toggle('con-sombra', scrollY > 8); enHero(); tick = false; }); }, { passive: true });
  const abrir = (on) => {
    btn.setAttribute('aria-expanded', on); btn.setAttribute('aria-label', on ? 'Cerrar menú' : 'Abrir menú');
    btn.innerHTML = on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>';
    if (on) { menu.hidden = false; $$('a, button', menu).forEach((a, i) => a.style.setProperty('--i', i)); requestAnimationFrame(() => menu.classList.add('is-open')); html.classList.add('menu-abierto'); }
    else { menu.classList.remove('is-open'); html.classList.remove('menu-abierto'); setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 350); }
  };
  btn.addEventListener('click', () => abrir(btn.getAttribute('aria-expanded') !== 'true'));
  $$('[data-menu-link]').forEach(a => a.addEventListener('click', () => abrir(false)));
  $('[data-turno-btn2]')?.addEventListener('click', () => abrir(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') abrir(false); });
  const links = $$('.barra__nav a');
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-on', a.hash === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.hash); if (s) io.observe(s); });
}

// ============ EL RELOJ: día / noche ============
let alCambiarTurno = () => {};
function turno() {
  const pintarBotones = () => {
    const t = html.dataset.turno, otro = t === 'dia' ? 'noche' : 'dia';
    $('[data-turno-ico]').textContent = otro === 'noche' ? '☾' : '☀';
    $('[data-turno-txt]').textContent = otro === 'noche' ? 'De noche' : 'De día';
    $('[data-turno-txt2]').textContent = otro === 'noche' ? 'de noche' : 'de día';
    $('[data-turno-btn]').setAttribute('aria-label', `Ver la web ${otro === 'noche' ? 'de noche' : 'de día'}`);
    $('meta[name="theme-color"]').content = '#E01D25';
  };
  const cambiar = () => {
    const t = html.dataset.turno === 'dia' ? 'noche' : 'dia';
    const img = $('[data-hero-img]'), src = img.previousElementSibling;
    const aplicar = () => {
      html.dataset.turno = t;
      src.srcset = src.getAttribute('data-srcset-' + t);
      img.srcset = img.getAttribute('data-srcset-' + t); img.src = img.getAttribute('data-src-' + t);
      pintarBotones(); alCambiarTurno(t);
    };
    if (reduce) { aplicar(); return; }
    html.classList.add('cambia-turno');
    setTimeout(() => { aplicar(); img.decode?.().catch(() => {}).finally(() => html.classList.remove('cambia-turno')); }, 380);
  };
  $('[data-turno-btn]').addEventListener('click', cambiar);
  $('[data-turno-btn2]').addEventListener('click', cambiar);
  pintarBotones();
}

function contadorCaja(kit) {
  const n = $('[data-caja-n]');
  const pintar = (bump) => {
    const total = (kit.carrito?.lineas || []).reduce((a, l) => a + (Number(l.cant) || 0), 0);
    n.textContent = total; n.classList.toggle('lleno', total > 0);
    if (bump && total) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
  };
  document.addEventListener('kit:carrito', () => pintar(true));
  kit.carrito?.listo?.then(() => pintar(false));
  pintar(false);
}

// arrastre con el mouse en filas deslizables (con el dedo ya es nativo), con inercia
function arrastrable(el) {
  let x0 = 0, s0 = 0, activo = false, movio = false, vel = 0, ultX = 0, ultT = 0, raf = 0;
  el.classList.add('deslizable');
  el.addEventListener('dragstart', (e) => e.preventDefault());
  $$('img', el).forEach(i => { i.draggable = false; });
  new MutationObserver(() => $$('img', el).forEach(i => { i.draggable = false; })).observe(el, { childList: true, subtree: true });
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest('input, textarea, select')) return;
    e.preventDefault();                       // sin selección de texto ni arrastre nativo de la imagen
    activo = true; movio = false; x0 = ultX = e.clientX; s0 = el.scrollLeft; ultT = performance.now(); vel = 0; cancelAnimationFrame(raf);
  });
  addEventListener('pointermove', (e) => {
    if (!activo) return;
    const dx = e.clientX - x0;
    if (!movio && Math.abs(dx) > 6) { movio = true; el.classList.add('arrastrando'); }
    if (!movio) return;
    const t = performance.now(); vel = (e.clientX - ultX) / Math.max(1, t - ultT); ultX = e.clientX; ultT = t;
    el.scrollLeft = s0 - dx;
  });
  const soltar = () => {
    if (!activo) return; activo = false;
    if (!movio) return;
    let v = vel * 16;
    const paso = () => { if (Math.abs(v) < .4) { el.classList.remove('arrastrando'); return; } el.scrollLeft -= v; v *= .93; raf = requestAnimationFrame(paso); };
    raf = requestAnimationFrame(paso);
    el.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true });
  };
  addEventListener('pointerup', soltar); addEventListener('pointercancel', soltar);
}

// ============ 3 · LA DISQUERA DE ÍDOLOS ============
const TAPAS = ['crema', 'rojo', 'celeste', 'negro', 'bordo'];
function disquera(kit, productos) {
  const batea = $('[data-batea]');
  const pizzas = productos.filter(p => p.categoria === 'pizzas');
  if (!pizzas.length) return;
  const sel = pizzas.find(p => p.id === (batea.dataset.sel || 'luis-alberto-spinetta')) || pizzas[0];
  batea.innerHTML = pizzas.map((p, i) => `
    <button type="button" class="tapa tapa--${TAPAS[i % TAPAS.length]}" role="option" aria-selected="false" data-tapa="${esc(p.id)}" style="--i:${i}">
      <span class="tapa__num">N° ${String(i + 1).padStart(2, '0')} · ${esc(kit.money(p.precio) ?? 'Consultar')}</span>
      <span class="tapa__n">${esc(p.nombre)}</span>
    </button>`).join('');
  const disco = $('[data-disco]'), dimg = $('[data-disco-img]');
  function poner(p, animar = true) {
    batea.dataset.sel = p.id;
    $$('.tapa', batea).forEach(t => { const on = t.dataset.tapa === p.id; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
    const i = pizzas.indexOf(p);
    const aplicar = () => {
      dimg.src = kit.asset(p.foto) || 'img/f/pz-margarita.webp';
      dimg.alt = `Pizza ${p.nombre}`;
      $('[data-son-n]').textContent = p.nombre;
      $('[data-son-num]').textContent = `N° ${String(i + 1).padStart(2, '0')}${(p.etiquetas || []).includes('nuevo') ? ' · Nueva' : ''}${(p.etiquetas || []).includes('casa') ? ' · De la casa' : ''}`;
      $('[data-son-temas]').innerHTML = (p.descripcion || '').split(',').map(x => x.trim()).filter(Boolean).map(x => `<li>${esc(x.charAt(0).toUpperCase() + x.slice(1))}</li>`).join('');
      $('[data-son-precio]').textContent = kit.money(p.precio) ?? 'Consultar';
      const q = $('[data-son-qty]'); q.innerHTML = kit.pedible(p) ? `<div class="kit-qty" data-kit-qty="${esc(p.id)}"></div>` : ''; kit.carrito?.sync(q);
      $('[data-sonando]').classList.remove('cambia');
      disco.classList.remove('saca'); disco.classList.add('gira');
    };
    if (!animar || reduce) { aplicar(); return; }
    disco.classList.add('saca'); $('[data-sonando]').classList.add('cambia');
    setTimeout(aplicar, 320);
  }
  if (!batea.dataset.init) {
    batea.dataset.init = '1';
    batea.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tapa]'); if (!t) return;
      const p = (batea._pizzas || pizzas).find(x => x.id === t.dataset.tapa); if (p) { poner(p); if (!esDesk()) t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }
    });
    arrastrable(batea);
    // arrastrar una tapa a la bandeja (mouse)
    const plato = $('[data-tocadiscos]');
    let fantasma = null, origen = null, x0 = 0, y0 = 0;
    batea.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || !esDesk()) return;
      const t = e.target.closest('[data-tapa]'); if (!t) return;
      origen = t; x0 = e.clientX; y0 = e.clientY;
    });
    addEventListener('pointermove', (e) => {
      if (!origen) return;
      if (!fantasma && Math.hypot(e.clientX - x0, e.clientY - y0) > 14 && Math.abs(e.clientY - y0) > Math.abs(e.clientX - x0)) {
        fantasma = origen.cloneNode(true); fantasma.classList.add('tapa--fantasma'); document.body.appendChild(fantasma);
        const r = origen.getBoundingClientRect(); fantasma.style.width = r.width + 'px'; fantasma.style.height = r.height + 'px';
        batea.classList.remove('arrastrando');
      }
      if (fantasma) {
        fantasma.style.transform = `translate(${e.clientX - fantasma.offsetWidth / 2}px, ${e.clientY - fantasma.offsetHeight / 2}px) rotate(-6deg)`;
        const r = plato.getBoundingClientRect(); plato.classList.toggle('recibe', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
      }
    });
    addEventListener('pointerup', (e) => {
      if (fantasma) {
        const r = plato.getBoundingClientRect();
        if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) { const p = (batea._pizzas || pizzas).find(x => x.id === origen.dataset.tapa); if (p) poner(p); }
        fantasma.remove(); fantasma = null; plato.classList.remove('recibe');
        origen.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true });
      }
      origen = null;
    });
  }
  batea._pizzas = pizzas;
  poner(sel, false);
}

// ============ 4 · CARTA ============
const PAGINAS = {
  dia: { t: 'Carta de día', cats: ['cafes', 'almuerzo', 'pizzas-dia', 'pasteleria', 'bebidas-dia'] },
  noche: { t: 'Carta de noche', cats: ['entradas', 'pizzas', 'postres'] },
  barra: { t: 'Barra', cats: ['aperitivos', 'cocteleria', 'cervezas', 'sin-alcohol'] },
};
const NO_PEDIR = ['aperitivos', 'cocteleria', 'cervezas'];
const NOTAS = {
  cafes: 'Granos de especialidad. Leche vegetal: adicional $750.',
  almuerzo: 'Todo se puede pedir para llevar.',
  'pizzas-dia': 'Las dos de siempre, también al mediodía.',
  pasteleria: 'Recién salida del horno, todas las mañanas.',
  'bebidas-dia': '',
  entradas: 'Para compartir mientras se hace la pizza.',
  pizzas: 'Masa madre y horno napolitano, desde las 19:30 hs. Consultá por el especial de la semana.',
  postres: '',
  aperitivos: 'Se piden en la barra.',
  cocteleria: 'Se piden en la barra. El gin tonic y El que no iba a salir son de la casa.',
  cervezas: 'Tiradas y en lata. Se piden en la barra.',
  'sin-alcohol': 'También para llevar.',
};
const DOS_COL = ['pasteleria'];
let pagina = html.dataset.turno === 'noche' ? 'noche' : 'dia';

function plantilla(p, ctx) {
  const pedir = !NO_PEDIR.includes(p.categoria) && ctx.pedible(p);
  const vars = p.variantes?.length ? p.variantes : null;
  const precio = vars ? `<span class="kit-price--desde">desde</span> ${ctx.money(Math.min(...vars.map(v => v.precio)))}` : (ctx.money(p.precio) ?? '<span class="kit-price--na">Consultar</span>');
  const tags = (p.etiquetas || []).map(t => ({ veggie: 'Veggie', vegano: 'Vegano', casa: 'De la casa', nuevo: 'Nueva' }[t])).filter(Boolean);
  return `${p.foto ? `<img class="kit-item__foto" src="${esc(ctx.asset(p.foto.replace('.webp', '-t.webp')))}" alt="" width="240" height="240" loading="lazy" decoding="async">` : ''}
    <div class="kit-item__body"><h3 class="plato__n">${esc(p.nombre)}${p.foto ? '<span class="punto" title="Tiene foto"></span>' : ''}</h3>${p.descripcion ? `<p class="plato__d">${esc(p.descripcion)}</p>` : ''}${tags.length ? `<p class="plato__tags">${tags.map(t => `<span>${t}</span>`).join('')}</p>` : ''}
    ${vars && pedir ? `<div class="plato__vars">${vars.map(v => `<button type="button" class="var" data-var="${esc(p.id)}" data-variante="${esc(v.id)}"><span>${esc(v.nombre)}</span><b>${ctx.money(v.precio)}</b><i aria-hidden="true">+</i></button>`).join('')}</div>` : ''}
    ${vars && !pedir ? `<p class="plato__d">${vars.map(v => `${esc(v.nombre)} ${ctx.money(v.precio)}`).join(' · ')}</p>` : ''}</div>
    <div class="kit-item__side"><span class="kit-price">${precio}</span>${pedir && !vars ? `<div class="kit-qty" data-kit-qty="${esc(p.id)}"></div>` : ''}${p.disponible === false ? '<span class="kit-badge kit-badge--off">Hoy no hay</span>' : ''}</div>`;
}

function cartaEventos(kitRef) {
  document.addEventListener('kit:carta', (e) => {
    const { el, categorias } = e.detail;
    if (el.id !== 'carta-principal') return;
    const tabs = $('.kit-tabs', el);
    const paneles = $$('.kit-carta__panel', el);
    const catDe = (pn) => categorias.find(c => pn && pn.id.endsWith('-p-' + c.id));
    paneles.forEach(pn => {
      const cat = catDe(pn); if (!cat) return;
      const n = $$('.kit-item', pn).length;
      pn.classList.toggle('dos-col', DOS_COL.includes(cat.id));
      pn.insertAdjacentHTML('afterbegin', `<div class="sec-cab"><div class="sec-cab__fila"><h3 class="sec-cab__t">${esc(cat.nombre)}</h3><span class="sec-cab__n">${n} ${n === 1 ? 'opción' : 'opciones'}</span></div>${NOTAS[cat.id] ? `<p class="sec-cab__nota">${esc(NOTAS[cat.id])}</p>` : ''}</div>`);
      pn.insertAdjacentHTML('beforeend', '<div class="carta-nav"></div>');
    });
    if (tabs && !tabs.dataset.extra) tabs.dataset.extra = '1';
    mostrarPagina(pagina, false);
  });
  // variantes (pizza frita, Donatella): un botón por tamaño
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-var]'); if (!b || !kitRef.k) return;
    kitRef.k.carrito.agregar(b.dataset.var, 1, { variante: b.dataset.variante });
    b.classList.remove('ok'); void b.offsetWidth; b.classList.add('ok');
  });
}

function mostrarPagina(id, abrirPrimera = true) {
  pagina = id;
  const el = $('#carta-principal'); if (!el) return;
  const pag = PAGINAS[id];
  $('[data-carta-titulo]').textContent = pag.t;
  $('#carta').dataset.actual = id;
  $$('.paginas [data-pagina]').forEach(b => { const on = b.dataset.pagina === id; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
  const tabs = $$('.kit-tab', el);
  tabs.forEach(t => { t.hidden = !pag.cats.includes(t.dataset.cat); });
  const visibles = tabs.filter(t => !t.hidden);
  const activa = tabs.find(t => t.classList.contains('is-on'));
  if (abrirPrimera || !activa || activa.hidden) visibles[0]?.click();
  // anterior / siguiente dentro de la página
  const nombreDe = (t) => t?.textContent || '';
  $$('.kit-carta__panel', el).forEach(pn => {
    const tab = tabs.find(t => t.getAttribute('aria-controls') === pn.id); const nav = $('.carta-nav', pn);
    if (!tab || !nav) return;
    const i = visibles.indexOf(tab), ant = visibles[i - 1], sig = visibles[i + 1];
    nav.innerHTML = `<button type="button" class="carta-nav__ant" data-ir="${ant ? ant.dataset.cat : ''}" ${ant ? '' : 'disabled'}><small>← Anterior</small>${esc(nombreDe(ant))}</button><button type="button" class="carta-nav__sig" data-ir="${sig ? sig.dataset.cat : ''}" ${sig ? '' : 'disabled'}><small>Siguiente →</small>${esc(nombreDe(sig))}</button>`;
  });
}

function carta() {
  const el = $('#carta-principal');
  const foto = $('[data-carta-foto] img'), cap = $('[data-carta-foto-cap]');
  $$('.paginas [data-pagina]').forEach(b => b.addEventListener('click', () => mostrarPagina(b.dataset.pagina)));
  $('[data-paginas]').addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const bs = $$('.paginas [data-pagina]'); const i = bs.indexOf(document.activeElement); if (i < 0) return;
    const n = bs[(i + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length]; n.focus(); n.click();
  });
  $$('[data-ir-pagina]').forEach(a => a.addEventListener('click', () => mostrarPagina(a.dataset.irPagina)));
  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-ir]');
    if (b && b.dataset.ir) {
      const tab = $(`.kit-tab[data-cat="${b.dataset.ir}"]`, el); if (!tab) return;
      tab.click(); if (!esDesk()) tab.scrollIntoView({ inline: 'center', block: 'nearest' });
      const top = el.getBoundingClientRect().top + scrollY - 80;
      if (el.getBoundingClientRect().top < 0) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    const t = ev.target.closest('.kit-tab'); if (t && !esDesk()) t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  });
  // foto fija del plato al pasar el mouse (desktop)
  let raf = 0, ultima = '';
  el.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const it = e.target.closest('.kit-item[data-photo]'); if (!it) return;
    const src = it.dataset.photo; if (src === ultima) return;
    ultima = src; cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      foto.classList.add('sale');
      setTimeout(() => { foto.src = src; cap.textContent = $('.plato__n', it)?.textContent || ''; const ok = () => foto.classList.remove('sale'); foto.complete ? ok() : (foto.onload = ok); }, 180);
    });
  });
}

// ============ 5 · PANADERÍA ============
function panaderia(kit, productos, categorias) {
  const fila = $('[data-panes]');
  const panes = productos.filter(p => p.categoria === 'panes' && p.disponible !== false);
  const card = (p) => `
    <article class="pan">
      <figure class="pan__foto">${p.foto ? `<img src="${esc(kit.asset(p.foto))}" alt="${esc(p.nombre)}" width="800" height="1000" loading="lazy" decoding="async">` : ''}</figure>
      <div class="pan__body">
        <h3 class="pan__n">${esc(p.nombre)}</h3>
        <p class="pan__d">${esc(p.descripcion)}</p>
        <div class="pan__pie"><span class="pan__precio">${kit.money(p.precio) ?? 'A confirmar'}</span>${kit.pedible(p) ? `<div class="kit-qty" data-kit-qty="${esc(p.id)}"></div>` : ''}</div>
      </div>
    </article>`;
  fila.innerHTML = panes.map(card).join('');
  kit.carrito?.sync(fila);
  if (!fila.dataset.init) { fila.dataset.init = '1'; arrastrable(fila); }
  // Fornottones: fecha especial (visible desde 40 días antes)
  const box = $('[data-fornottone]');
  const cat = kit.especiales(categorias).find(c => c.id === 'fornottones');
  const ff = productos.filter(p => p.categoria === 'fornottones' && p.disponible !== false);
  if (cat && ff.length) {
    box.hidden = false;
    box.innerHTML = `<div class="fornottone__cab"><p class="fornottone__k">Temporada</p><h3 class="fornottone__t">${esc(cat.nombre)}</h3><p class="fornottone__p">${esc(cat.bajada || '')}</p></div>
      <div class="fornottone__items">${ff.map(p => `<div class="ff"><img src="${esc(kit.asset(p.foto.replace('.webp', '-t.webp')))}" alt="" width="240" height="240" loading="lazy" decoding="async"><div class="ff__b"><b>${esc(p.nombre.replace('Fornottone ', ''))}</b><span>${esc(p.descripcion)}</span></div><div class="kit-qty" data-kit-qty="${esc(p.id)}"></div></div>`).join('')}</div>`;
    kit.carrito?.sync(box);
  } else box.hidden = true;
}

// la masa leuda mientras bajás
function masa() {
  const sec = $('[data-masa]'), crece = $('[data-masa-crece]'), hora = $('[data-masa-h]'), barra = $('[data-masa-barra]');
  if (!sec) return;
  let tick = false, vis = false;
  const pintar = () => {
    tick = false;
    const r = sec.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * .85 - r.top) / (r.height + innerHeight * .2)));
    crece.style.transform = `scaleY(${1 + p * .16}) scaleX(${1 + p * .05})`;
    barra.style.transform = `scaleX(${p})`;
    hora.textContent = p >= .99 ? 'Hora 12' : `Hora ${Math.floor(p * 12)}`;
  };
  new IntersectionObserver((es) => es.forEach(e => { vis = e.isIntersecting; if (vis) pintar(); })).observe(sec);
  addEventListener('scroll', () => { if (!vis || tick) return; tick = true; requestAnimationFrame(pintar); }, { passive: true });
  if (reduce) { crece.style.transform = 'none'; }
}

// ============ 6 · LA CAVA ============
const ESTILOS = [
  { id: 'espumantes', n: 'Espumantes', c: '#E8E0C2' }, { id: 'por-copa', n: 'Por copa', c: '#C9B37A' },
  { id: 'blancos', n: 'Blancos', c: '#F0CF6B' }, { id: 'naranjos', n: 'Naranjos', c: '#E39A3C' },
  { id: 'rosados', n: 'Rosados', c: '#E7A3A3' }, { id: 'tintos-ligeros', n: 'Tintos ligeros', c: '#B5333A' },
  { id: 'tintos', n: 'Tintos', c: '#6B1218' },
];
function cava(kit, productos) {
  const est = $('[data-estante]'), ficha = $('[data-ficha]'), fil = $('[data-cava-filtros]');
  const vinos = productos.filter(p => ESTILOS.some(e => e.id === p.categoria) && p.disponible !== false);
  const st = cava._st || (cava._st = { filtro: 'todos', sel: null });
  const oscura = (c) => ['#B5333A', '#6B1218'].includes(c);
  fil.innerHTML = [{ id: 'todos', n: 'Todos' }, ...ESTILOS].map(e => `<button type="button" role="tab" data-filtro="${e.id}" aria-selected="${st.filtro === e.id}" class="${st.filtro === e.id ? 'is-on' : ''}">${esc(e.n)}</button>`).join('');
  const lista = vinos.filter(v => st.filtro === 'todos' || v.categoria === st.filtro);
  est.innerHTML = `<div class="estante__fila" data-fila>${lista.map((v, i) => {
    const e = ESTILOS.find(x => x.id === v.categoria); const [etq] = v.nombre.split(' · ');
    const alto = 78 + ((v.id.length * 7) % 22);
    return `<button type="button" class="botella${oscura(e.c) ? ' botella--osc' : ''}" style="--c:${e.c};--h:${alto}%;--i:${i}" data-vino="${esc(v.id)}" aria-label="${esc(v.nombre)}"><span>${esc(etq)}</span></button>`;
  }).join('')}</div><div class="estante__tabla" aria-hidden="true"></div>`;
  const fila = $('[data-fila]', est);
  arrastrable(fila);
  const mostrar = (v) => {
    if (!v) { ficha.innerHTML = ''; return; }
    st.sel = v.id;
    $$('.botella', est).forEach(b => b.classList.toggle('is-on', b.dataset.vino === v.id));
    const e = ESTILOS.find(x => x.id === v.categoria); const [etq, varietal] = v.nombre.split(' · '); const [prod, zona] = (v.descripcion || '').split(' · ');
    ficha.classList.remove('entra'); void ficha.offsetWidth; ficha.classList.add('entra');
    ficha.innerHTML = `<p class="ficha__k">${esc(e.n)} · ${esc(varietal || '')}</p><h3 class="ficha__t">${esc(etq)}</h3><p class="ficha__d">${esc(prod || '')}${zona ? `<br>${esc(zona)}` : ''}</p>
      <dl class="ficha__precios"><div><dt>${v.categoria === 'por-copa' ? 'La copa' : 'La botella'}</dt><dd>${kit.money(v.precio) ?? 'Consultar'}</dd></div></dl>
      <p class="ficha__nota">Los vinos se toman en el salón. Preguntá en la barra por la copa del día.</p>`;
  };
  if (!est.dataset.init) {
    est.dataset.init = '1';
    est.addEventListener('click', (e) => { const b = e.target.closest('[data-vino]'); if (b) mostrar(cava._vinos.find(v => v.id === b.dataset.vino)); });
    est.addEventListener('pointerover', (e) => { if (e.pointerType !== 'mouse') return; const b = e.target.closest('[data-vino]'); if (b && b.dataset.vino !== st.sel) mostrar(cava._vinos.find(v => v.id === b.dataset.vino)); });
    fil.addEventListener('click', (e) => { const b = e.target.closest('[data-filtro]'); if (!b) return; st.filtro = b.dataset.filtro; st.sel = null; cava(kit, cava._prods); });
  }
  cava._vinos = vinos; cava._prods = productos;
  mostrar(lista.find(v => v.id === st.sel) || lista.find(v => v.id === 'hippie-blancas') || lista[0]);
}

// ============ 8 · HISTORIA ============
function historia() {
  const l = $('[data-linea]'); if (!l) return;
  arrastrable(l);
  $$('[data-hist]').forEach(b => b.addEventListener('click', () => {
    const h = $('.hito', l); const w = h ? h.getBoundingClientRect().width + 32 : 320;
    l.scrollBy({ left: Number(b.dataset.hist) * w * (esDesk() ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' });
  }));
}

// ============ 10 · HORARIOS Y ESTADO ============
function horarios(kit) {
  const H = kit.config.horarios;
  const now = ahoraEn(TZ);
  const hoy = new Date(now.dia * 864e5).getUTCDay();
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const NOTA = { 1: 'solo take away', 2: 'solo take away' };
  $('[data-horarios]').innerHTML = orden.map(d => {
    const fr = H[DIAS[d]] || [];
    return `<li class="${d === hoy ? 'hoy' : ''}"><span>${DLARGO[d]}${d === hoy ? ' <em>hoy</em>' : ''}</span><span>${fr.length ? fr.map(([a, b]) => `${hs(a)} a ${hs(b)} hs`).join(' y ') : 'Cerrado'}${NOTA[d] ? ` <small>· ${NOTA[d]}</small>` : ''}</span></li>`;
  }).join('');
  const pintar = () => {
    const e = kit.abierto();
    let txt;
    if (e.abierto) {
      const n = ahoraEn(TZ); const d = new Date(n.dia * 864e5).getUTCDay();
      txt = (d === 1 || d === 2) ? `Abierto · hoy solo take away hasta las ${hs(e.cierra)} hs` : (n.min >= 1170 || n.min < 300 ? `Hornos prendidos · hasta las ${hs(e.cierra)} hs` : `Abierto · pizzas desde las 19:30 hs`);
    } else if (e.abre) txt = `Cerrado · hoy abre a las ${hs(e.abre)} hs`;
    else { let k = 1, d; while (k < 8) { d = (hoy + k) % 7; if ((H[DIAS[d]] || []).length) break; k++; } const fr = H[DIAS[d]]?.[0]; txt = `Cerrado · abre ${k === 1 ? 'mañana' : DLARGO[d].toLowerCase()} a las ${fr ? hs(fr[0]) : ''} hs`; }
    $$('[data-estado], [data-estado-chip]').forEach(x => x.classList.toggle('abierto', e.abierto));
    $('[data-estado-largo]').textContent = txt;
    $('[data-estado-txt]').textContent = txt;
  };
  pintar(); setInterval(pintar, 60_000);
}

// el brillo de carga solo corre en las fotos que están a la vista
function pausarBrillos() {
  const io = new IntersectionObserver((es) => es.forEach(e => e.target.classList.toggle('ph-fuera', !e.isIntersecting)), { rootMargin: '150px' });
  const vistas = new WeakSet();
  const tomar = () => $$('img').forEach(i => { if (!vistas.has(i)) { vistas.add(i); io.observe(i); } });
  tomar(); new MutationObserver(() => requestAnimationFrame(tomar)).observe(document.body, { childList: true, subtree: true });
}

// ============ ARRANQUE ============
const arranque = intro();
barra();
turno();
const kitRef = { k: null };
cartaEventos(kitRef);
alCambiarTurno = (t) => { mostrarPagina(t === 'noche' ? 'noche' : 'dia'); };
try {
  const kit = await initKit({
    config: 'cliente.json',
    carrito: { label: 'Tu caja', fab: false },
    carta: { template: plantilla, itemClass: 'plato' },
    badgeTexto: 'Probá el panel de Fornole',
    imagenes: { lqip: 'img/lqip.json' },
  });
  kitRef.k = kit;
  const [productos, categorias] = await Promise.all([kit.store.getProductos(), kit.store.getCategorias()]);
  contadorCaja(kit);
  carta();
  disquera(kit, productos);
  panaderia(kit, productos, categorias);
  cava(kit, productos);
  horarios(kit);
  kit.store.onChange?.(async () => {
    const [p2, c2] = await Promise.all([kit.store.getProductos(), kit.store.getCategorias()]);
    disquera(kit, p2); panaderia(kit, p2, c2); cava(kit, p2);
  });
} catch (err) {
  console.error('[fornole]', err);
}
pausarBrillos();
masa();
historia();
reveal();
await arranque;
