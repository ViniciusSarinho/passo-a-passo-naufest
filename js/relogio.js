/* ============================================================================
   RELÓGIO · o relógio do Carlos (pai)
   Um relógio de verdade tem telas: a primeira mostra o essencial (como o Lucas está), e dá para passar
   para as outras com os pontinhos, os botões ‹ › ou arrastando: Hoje, Remédios, Conversa, Avisos,
   Resumo e Ajustes. Quando chega um SOS ou um aviso, ele toma a tela até ser respondido.
   ============================================================================ */

const W = { raiz: document.getElementById('telaRelogio'), aviso: null, timer: 0, pagina: 0, vibracao: true, silencio: false };
const QUEM_RELOGIO = 'carlos';
const NIVEL_LUMI = { 2: 'Lumi explicando', 1: 'Lumi perguntando', 0: 'Lumi só observando' };
const PAGINAS_RELOGIO = [['agora', 'Agora'], ['hoje', 'Hoje'], ['remedios', 'Remédios'], ['conversa', 'Conversa'], ['avisos', 'Avisos'], ['resumo', 'Resumo'], ['ajustes', 'Ajustes']];
const AVISOS_CURTOS = ['Aula mais tarde', 'Busca atrasada', 'Papai busca', 'Padaria fechada'];
const RESPOSTAS_RELOGIO = ['Estou indo', 'Muito bem!', 'Te amo ❤️'];
const mesmoDia = (t) => new Date(t).toDateString() === new Date().toDateString();

// O que vira aviso no pulso (o resto fica só nas telas)
const AVISOS_RELOGIO = {
  conclusao: (d) => ({ ic: '⭐', titulo: 'Conquista!', texto: `Lucas terminou: ${d.rotina}`, cor: 'ok' }),
  calma: () => ({ ic: '🫧', titulo: 'Pausa', texto: 'Lucas pediu um momento de calma' }),
  med_lembrete: (d) => ({ ic: '💊', titulo: 'Remédio', texto: `Hora de ${nomeCurto(remedio(d.med))}` }),
  med_tomado: (d) => ({ ic: '💊', titulo: 'Remédio', texto: `Lucas tomou ${nomeCurto(remedio(d.med))}`, cor: 'ok' }),
  med_atrasado: (d) => ({ ic: '⏰', titulo: 'Remédio', texto: `${nomeCurto(remedio(d.med))} ainda não confirmado`, cor: 'alerta' }),
  msg: (d, ev) => ev.de === 'lucas' ? { ic: '💬', titulo: 'Lucas', texto: d.texto } : null,
  sos_resolvido: (d) => ({ ic: '💚', titulo: 'Tudo bem', texto: `${d.quem || 'A família'} encerrou o alerta`, cor: 'ok' }),
};
const nomeCurto = (m) => (m ? m.nome.replace(/\s*\(.*\)/, '') : 'o remédio');

// ---------- Telas ----------
const TELAS_RELOGIO = {
  agora() {
    const v = S.aoVivo, humor = S.eventos.find((e) => e.tipo === 'humor' && mesmoDia(e.data));
    if (v) {
      const c = 2 * Math.PI * 62, frac = v.total ? v.passo / v.total : 0;
      return `<div class="rl-anel"><svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="62" class="fundo-anel"/>
        <circle cx="70" cy="70" r="62" class="valor-anel" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}"/></svg>
        <div><b>${v.passo}/${v.total}</b><small>${esc(v.rotina)}</small></div></div>
        <span class="rl-texto">${NIVEL_LUMI[v.nivel] ?? 'Lumi junto'}</span>`;
    }
    return `<div class="rl-hora grande">${hora()}</div><div class="rl-lumi">${lumiSVG({ humor: 'feliz', tamanho: 56 })}</div>
      <span class="rl-texto">Lucas está bem${humor ? ` · ${humor.dados.emoji}` : ''}</span><span class="rl-estrelas">⭐ ${S.pet?.estrelas ?? 0}</span>`;
  },
  hoje() {
    const agora = hora();
    return `<ul class="rl-lista">${[...S.rotinas].sort((a, b) => a.hora.localeCompare(b.hora)).map((r) => {
      const feito = S.eventos.some((e) => e.tipo === 'conclusao' && e.dados.rotinaId === r.id && mesmoDia(e.data));
      const agoraR = S.aoVivo?.rotinaId === r.id;
      return `<li class="${feito ? 'feito' : agoraR ? 'agora' : ''}"><i>${r.emoji}</i><span><b>${esc(r.nome.replace(/^Comprar /, ''))}</b><small>${r.hora}${agoraR ? ' · agora' : feito ? ' · feito' : r.hora < agora ? ' · não iniciada' : ''}</small></span><em>${feito ? '✓' : agoraR ? '▶' : ''}</em></li>`;
    }).join('')}<li class="plano"><i>🌳</i><span><b>Parque</b><small>sábado · combinado</small></span></li></ul>`;
  },
  remedios() {
    return `<ul class="rl-lista">${[...S.saude.meds].sort((a, b) => a.horario.localeCompare(b.horario)).map((m) => {
      const r = registroHoje(m.id), agora = hora();
      const estado = r ? (r.status === 'perdido' ? '✗ perdido' : '✓ ' + (r.hora || 'tomado')) : (m.horario < agora ? '⏰ atrasado' : m.horario);
      return `<li class="${r && r.status !== 'perdido' ? 'feito' : ''}"><i>${m.emoji}</i><span><b>${esc(nomeCurto(m))}</b><small>${esc(m.dose)} · ${estado}</small></span>${r ? '' : `<button class="rl-mini" data-rl-dei="${m.id}">Dei</button>`}</li>`;
    }).join('')}</ul><span class="rl-texto">${S.saude.meds.some((m) => m.estoque <= 7) ? '⚠️ Estoque baixo' : 'Estoque ok'}</span>`;
  },
  conversa() {
    const msgs = (S.caa?.mensagens || []).slice(-2);
    return `<ul class="rl-lista conversa">${msgs.length ? msgs.map((m) => `<li><span><b>${esc(conta(m.de)?.nome || m.de)}</b><small>${esc(m.texto)}</small></span></li>`).join('') : '<li><span><small>Sem mensagens ainda</small></span></li>'}</ul>
      <div class="rl-respostas">${RESPOSTAS_RELOGIO.map((t, i) => `<button class="rl-mini" data-rl-resp="${i}">${t}</button>`).join('')}</div>`;
  },
  avisos() {
    return `<span class="rl-texto">Avisar o Lucas com antecedência:</span><div class="rl-grade">${AVISOS_CURTOS.map((t, i) => `<button class="rl-mini" data-rl-aviso="${i}">${t}</button>`).join('')}</div>
      <button class="rl-mini destaque" data-rl-ligar>📞 Ligar para o Lucas</button>`;
  },
  resumo() {
    const hojeCalma = S.eventos.filter((e) => e.tipo === 'calma' && mesmoDia(e.data)).length;
    const feitas = S.eventos.filter((e) => e.tipo === 'conclusao' && mesmoDia(e.data)).length;
    const n = lumiNivel(S.pet?.estrelas ?? 0);
    return `<ul class="rl-lista resumo"><li><i>⭐</i><span><b>${S.pet?.estrelas ?? 0} estrelas</b><small>${esc(n.nome)}</small></span></li>
      <li><i>✅</i><span><b>${feitas} rotina(s) hoje</b><small>feitas com o Lumi</small></span></li>
      <li><i>🫧</i><span><b>${hojeCalma} pausa(s) de calma</b><small>hoje</small></span></li>
      <li><i>💊</i><span><b>${adesao(30)}% remédios</b><small>últimos 30 dias</small></span></li></ul>`;
  },
  ajustes() {
    return `<button class="rl-chave" data-rl-vibra aria-pressed="${W.vibracao}"><span>📳 Vibração</span><em>${W.vibracao ? 'ligada' : 'desligada'}</em></button>
      <button class="rl-chave" data-rl-silencio aria-pressed="${W.silencio}"><span>🔕 Só SOS</span><em>${W.silencio ? 'ligado' : 'desligado'}</em></button>
      <span class="rl-texto">Com "Só SOS", só emergências tocam o pulso.</span>`;
  },
};

function desenharRelogio() {
  const r = W.raiz; if (!r) return;
  const a = S.alerta, n = W.aviso;
  r.className = 'tela-relogio';
  if (a) {
    r.classList.add('sos');
    r.innerHTML = `<div class="rl-hora">${hora()}</div><div class="rl-ic grande">🆘</div><b class="rl-titulo">Lucas pediu ajuda</b>
      <span class="rl-texto">${esc(a.local?.texto?.split('·')[0] || 'localização enviada')}</span>
      ${a.aCaminho ? `<span class="rl-ok">✓ ${esc(a.aCaminho)} está indo</span>`
        : `<div class="rl-respostas"><button class="rl-botao" data-rl-indo>Estou indo</button><button class="rl-botao claro" data-rl-ligar>Ligar</button></div>`}`;
  } else if (n) {
    r.classList.add('aviso', n.cor || 'info');
    r.innerHTML = `<div class="rl-hora">${hora()}</div><div class="rl-ic grande">${n.ic}</div><b class="rl-titulo">${esc(n.titulo)}</b><span class="rl-texto">${esc(n.texto)}</span>
      <button class="rl-botao claro" data-rl-ok>OK</button>`;
  } else {
    const [id, nome] = PAGINAS_RELOGIO[W.pagina];
    const relogioGrande = id === 'agora' && !S.aoVivo; // a hora já aparece grande
    r.innerHTML = `<div class="rl-topo"><span>${nome}</span><span>${relogioGrande ? '' : hora()}</span></div><div class="rl-corpo" data-tela="${id}">${TELAS_RELOGIO[id]()}</div>
      <div class="rl-pontos" role="tablist" aria-label="Telas do relógio">${PAGINAS_RELOGIO.map(([, t], i) => `<button role="tab" aria-label="${t}" aria-selected="${i === W.pagina}" data-rl-ir="${i}"></button>`).join('')}</div>`;
  }
}

// ---------- Ações (um só ouvinte para a tela inteira) ----------
function irPaginaRelogio(i) {
  W.pagina = (i + PAGINAS_RELOGIO.length) % PAGINAS_RELOGIO.length;
  W.aviso = null; desenharRelogio();
}
W.raiz?.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset;
  if (d.rlIr !== undefined) return irPaginaRelogio(+d.rlIr);
  if ('rlIndo' in d) emitir('a_caminho', { quem: 'Carlos' }, QUEM_RELOGIO);
  else if ('rlOk' in d) { W.aviso = null; desenharRelogio(); }
  else if ('rlLigar' in d) toast('Chamada simulada para o celular do Lucas.');
  else if (d.rlDei) emitir('med_dado', { med: d.rlDei }, QUEM_RELOGIO);
  else if (d.rlResp !== undefined) { const texto = RESPOSTAS_RELOGIO[+d.rlResp].replace(' ❤️', ''); emitir('msg', { pictos: typeof textoParaPictos === 'function' ? textoParaPictos(texto) : [], texto }, QUEM_RELOGIO); toast(`Enviado ao Lucas: "${texto}"`); }
  else if (d.rlAviso !== undefined) { emitir('aviso', { texto: AVISOS_RAPIDOS[+d.rlAviso] }, QUEM_RELOGIO); toast('Aviso enviado ao Lucas.'); }
  else if ('rlVibra' in d) { W.vibracao = !W.vibracao; desenharRelogio(); }
  else if ('rlSilencio' in d) { W.silencio = !W.silencio; desenharRelogio(); }
});
// Arrastar para o lado troca de tela; a coroa também passa para a próxima
let arrastoRelogio = null;
W.raiz?.addEventListener('pointerdown', (e) => { arrastoRelogio = e.clientX; });
W.raiz?.addEventListener('pointerup', (e) => {
  if (arrastoRelogio === null) return;
  const dx = (e.clientX - arrastoRelogio) / (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--escala')) || 1);
  arrastoRelogio = null;
  if (Math.abs(dx) > 40 && !S.alerta && !W.aviso) irPaginaRelogio(W.pagina + (dx < 0 ? 1 : -1));
});
document.getElementById('rlAnt')?.addEventListener('click', () => irPaginaRelogio(W.pagina - 1));
document.getElementById('rlProx')?.addEventListener('click', () => irPaginaRelogio(W.pagina + 1));
document.getElementById('rlVoltar')?.addEventListener('click', () => irPaginaRelogio(W.pagina - 1));
document.getElementById('rlCoroa')?.addEventListener('click', () => irPaginaRelogio(W.pagina + 1));

// Vibração visual do relógio quando chega algo novo (e, se o aparelho deixar, vibra de verdade)
function vibrarRelogio() {
  const m = document.getElementById('dispRelogio');
  if (!m || !W.vibracao) return;
  m.classList.remove('vibra'); void m.offsetWidth; m.classList.add('vibra');
}

function receberRelogio(ev) {
  if (ev.tipo === 'sos') { W.aviso = null; vibrarRelogio(); }
  const criar = AVISOS_RELOGIO[ev.tipo];
  const aviso = criar && ev.de !== QUEM_RELOGIO && !W.silencio ? criar(ev.dados || {}, ev) : null;
  if (aviso) {
    W.aviso = aviso; vibrarRelogio();
    clearTimeout(W.timer);
    W.timer = setTimeout(() => { W.aviso = null; desenharRelogio(); }, 12000);
  }
  desenharRelogio();
}

MODULOS.push({ nome: 'relogio', receber: receberRelogio });
setInterval(desenharRelogio, 30000);
