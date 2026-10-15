/* ============================================================================
   RELÓGIO · o relógio do Carlos (pai)
   Só o essencial chega ao pulso: o pedido de ajuda, a rotina ao vivo, o remédio, as conquistas e
   as mensagens do Lucas. Um toque responde "estou indo". Na tela pequena, uma informação por vez.
   ============================================================================ */

const W = { raiz: document.getElementById('telaRelogio'), aviso: null, timer: 0 };
const QUEM_RELOGIO = 'carlos';
const NIVEL_LUMI = { 2: 'Lumi explicando', 1: 'Lumi perguntando', 0: 'Lumi só observando' };

// O que vira aviso no pulso (o resto fica só no celular da família)
const AVISOS_RELOGIO = {
  conclusao: (d) => ({ ic: '⭐', titulo: 'Conquista!', texto: `Lucas terminou: ${d.rotina}`, cor: 'ok' }),
  calma: () => ({ ic: '🫧', titulo: 'Pausa', texto: 'Lucas pediu um momento de calma' }),
  med_lembrete: (d) => ({ ic: '💊', titulo: 'Remédio', texto: `Hora de ${remedio(d.med)?.nome || 'o remédio'}` }),
  med_tomado: (d) => ({ ic: '💊', titulo: 'Remédio', texto: `Lucas tomou ${remedio(d.med)?.nome || 'o remédio'}`, cor: 'ok' }),
  med_atrasado: (d) => ({ ic: '⏰', titulo: 'Remédio', texto: `${remedio(d.med)?.nome || 'Remédio'} ainda não confirmado`, cor: 'alerta' }),
  msg: (d, ev) => ev.de === 'lucas' ? { ic: '💬', titulo: 'Lucas', texto: d.texto } : null,
  sos_resolvido: (d) => ({ ic: '💚', titulo: 'Tudo bem', texto: `${d.quem || 'A família'} encerrou o alerta`, cor: 'ok' }),
};

function desenharRelogio() {
  const r = W.raiz; if (!r) return;
  const a = S.alerta, v = S.aoVivo, n = W.aviso;
  r.className = 'tela-relogio';
  if (a) {
    r.classList.add('sos');
    r.innerHTML = `<div class="rl-hora">${hora()}</div>
      <div class="rl-ic grande">🆘</div><b class="rl-titulo">Lucas pediu ajuda</b>
      <span class="rl-texto">${esc(a.local?.texto?.split('·')[0] || 'localização enviada')}</span>
      ${a.aCaminho ? `<span class="rl-ok">✓ ${esc(a.aCaminho)} está indo</span>`
        : `<button class="rl-botao" id="rlIndo">Estou indo</button>`}`;
  } else if (n) {
    r.classList.add('aviso', n.cor || 'info');
    r.innerHTML = `<div class="rl-hora">${hora()}</div><div class="rl-ic grande">${n.ic}</div>
      <b class="rl-titulo">${esc(n.titulo)}</b><span class="rl-texto">${esc(n.texto)}</span>
      <button class="rl-botao claro" id="rlOk">OK</button>`;
  } else if (v) {
    const frac = v.total ? v.passo / v.total : 0, c = 2 * Math.PI * 62;
    r.innerHTML = `<div class="rl-hora">${hora()}</div>
      <div class="rl-anel"><svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="62" class="fundo-anel"/>
        <circle cx="70" cy="70" r="62" class="valor-anel" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}"/></svg>
        <div><b>${v.passo}/${v.total}</b><small>${esc(v.rotina)}</small></div></div>
      <span class="rl-texto">${NIVEL_LUMI[v.nivel] ?? 'Lumi junto'}</span>`;
  } else {
    r.innerHTML = `<div class="rl-hora grande">${hora()}</div>
      <div class="rl-lumi">${lumiSVG({ humor: 'feliz', tamanho: 54 })}</div>
      <span class="rl-texto">Lucas está bem</span>
      <span class="rl-estrelas">⭐ ${S.pet?.estrelas ?? 0}</span>`;
  }
  const indo = r.querySelector('#rlIndo');
  if (indo) indo.onclick = () => { emitir('a_caminho', { quem: 'Carlos' }, QUEM_RELOGIO); };
  const ok = r.querySelector('#rlOk');
  if (ok) ok.onclick = () => { W.aviso = null; desenharRelogio(); };
}

// Vibração visual do relógio quando chega algo novo
function vibrarRelogio() {
  const m = document.getElementById('dispRelogio');
  if (!m) return;
  m.classList.remove('vibra'); void m.offsetWidth; m.classList.add('vibra');
}

function receberRelogio(ev) {
  if (ev.tipo === 'sos') { W.aviso = null; vibrarRelogio(); }
  const criar = AVISOS_RELOGIO[ev.tipo];
  const aviso = criar && ev.de !== QUEM_RELOGIO ? criar(ev.dados || {}, ev) : null;
  if (aviso) {
    W.aviso = aviso; vibrarRelogio();
    clearTimeout(W.timer);
    W.timer = setTimeout(() => { W.aviso = null; desenharRelogio(); }, 12000);
  }
  desenharRelogio();
}

MODULOS.push({ nome: 'relogio', receber: receberRelogio });
setInterval(desenharRelogio, 30000);
