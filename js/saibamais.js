/* Página "Saiba mais": capítulos (a câmera da vitrine 3D segue o capítulo na tela), índice dos equipamentos
   e abas do "Aprofunde". Funciona mesmo sem a vitrine 3D. */

// ---------- Capítulos ----------
const capitulos = [...document.querySelectorAll('.capitulo')];
window.capituloAtual = 'abertura';
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  capitulos.forEach((c) => c.classList.toggle('ativo', c === e.target));
  window.capituloAtual = e.target.dataset.camera;
  document.dispatchEvent(new CustomEvent('capitulo', { detail: window.capituloAtual }));
}), { rootMargin: '-45% 0px -45% 0px' });
capitulos.forEach((c) => io.observe(c));
capitulos[0].classList.add('ativo');

// Índice da abertura: pula para o capítulo do equipamento
document.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => {
  document.getElementById(b.dataset.ir)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}));

// ---------- Abas ----------
const abas = [...document.querySelectorAll('[role=tab]')];
const paineis = [...document.querySelectorAll('[role=tabpanel]')];
function abrirAba(id, { foco = false } = {}) {
  abas.forEach((a) => { const on = a.dataset.aba === id; a.setAttribute('aria-selected', on); a.tabIndex = on ? 0 : -1; if (on && foco) a.focus(); });
  paineis.forEach((p) => { p.hidden = p.id !== 'aba-' + id; });
}
abas.forEach((a, i) => {
  a.addEventListener('click', () => abrirAba(a.dataset.aba));
  a.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); abrirAba(abas[(i + d + abas.length) % abas.length].dataset.aba, { foco: true });
  });
});
// Links de uma aba para outra (data-aba-ir) e para uma âncora dentro de uma aba (#f5, #fontes, #tcc)
document.querySelectorAll('[data-aba-ir]').forEach((b) => b.addEventListener('click', (e) => {
  e.preventDefault(); abrirAba(b.dataset.abaIr); document.getElementById('aprofunde').scrollIntoView();
}));
function irParaHash() {
  const id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
  const aba = abas.find((x) => x.dataset.aba === id);
  if (aba) { abrirAba(id); requestAnimationFrame(() => document.getElementById('aprofunde').scrollIntoView()); return; } // ex.: #roadmap, #dados
  const el = document.getElementById(id); if (!el) return;
  const painel = el.closest('[role=tabpanel]');
  if (painel) { abrirAba(painel.id.replace('aba-', '')); requestAnimationFrame(() => el.scrollIntoView({ block: 'start' })); }
}
addEventListener('hashchange', irParaHash);
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href').slice(1), el = document.getElementById(id);
  if (el?.closest('[role=tabpanel]')) { e.preventDefault(); history.replaceState(null, '', '#' + id); irParaHash(); }
});
abrirAba('avalia');
irParaHash();

// Painéis: só rolam por dentro quando o conteúdo realmente não cabe (sem barra de rolagem à toa por poucos pixels)
function ajustarRolagemDosPaineis() {
  document.querySelectorAll('.painel').forEach((p) => { p.style.overflowY = 'hidden'; p.style.overflowY = p.scrollHeight - p.clientHeight > 14 ? 'auto' : 'hidden'; });
}
addEventListener('resize', ajustarRolagemDosPaineis);
addEventListener('load', ajustarRolagemDosPaineis);
setTimeout(ajustarRolagemDosPaineis, 600);
