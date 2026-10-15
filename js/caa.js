/* ============================================================================
   CAA · Comunicação Alternativa e Aumentativa
   Prancha de figuras que vira frase falada, conversa com a família, combinados
   "primeiro → depois", pedidos para marcar compromissos e o acompanhamento do
   desenvolvimento da comunicação (tamanho da frase, vocabulário, iniciativa).
   Dados em S.caa. A "tradução" figuras ⇄ texto usa regras no MVP; no produto,
   um modelo de linguagem faria o mesmo, com revisão da família.
   ============================================================================ */

const PICTOS = {
  eu: ['🧒', 'eu', 'pessoas'], mamae: ['👩', 'mamãe', 'pessoas'], papai: ['👨', 'papai', 'pessoas'], voce: ['🫵', 'você', 'pessoas'],
  julia: ['🧑‍⚕️', 'Dra. Júlia', 'pessoas'], amigo: ['🧑‍🤝‍🧑', 'amigo', 'pessoas'], vovo: ['👵', 'vovó', 'pessoas'],
  quero: ['🙋', 'quero', 'acoes'], naoquero: ['🙅', 'não quero', 'acoes'], preciso: ['❗', 'preciso', 'acoes'], estou: ['💭', 'estou', 'acoes'],
  gosto: ['💖', 'gosto de', 'acoes'], vamos: ['👉', 'vamos', 'acoes'], brincar: ['🧩', 'brincar', 'acoes'], comer: ['🍽️', 'comer', 'acoes'],
  dormir: ['🛏️', 'dormir', 'acoes'], ir: ['🚶', 'ir', 'acoes'],
  agua: ['💧', 'água', 'coisas'], lanche: ['🍪', 'lanche', 'coisas'], banheiro: ['🚻', 'banheiro', 'coisas'], parque: ['🌳', 'parque', 'coisas'],
  tablet: ['📱', 'tablet', 'coisas'], dino: ['🦖', 'dinossauro', 'coisas'], livro: ['📘', 'livro', 'coisas'], musica: ['🎵', 'música', 'coisas'],
  casa: ['🏠', 'casa', 'coisas'], escola: ['🏫', 'escola', 'coisas'], sorvete: ['🍦', 'sorvete', 'coisas'], piscina: ['🏊', 'piscina', 'coisas'],
  licao: ['📚', 'lição', 'coisas'], banho: ['🛁', 'banho', 'coisas'], cinema: ['🎬', 'cinema', 'coisas'], jogo: ['🎮', 'videogame', 'coisas'],
  feliz: ['😊', 'feliz', 'sentir'], triste: ['😢', 'triste', 'sentir'], cansado: ['🥱', 'cansado', 'sentir'], nervoso: ['😣', 'nervoso', 'sentir'],
  medo: ['😨', 'com medo', 'sentir'], bravo: ['😠', 'bravo', 'sentir'], dor: ['🤕', 'com dor', 'sentir'], barulho: ['🔊', 'muito barulho', 'sentir'],
  agora: ['⏱️', 'agora', 'tempo'], depois: ['⏭️', 'depois', 'tempo'], hoje: ['📅', 'hoje', 'tempo'], amanha: ['🌅', 'amanhã', 'tempo'],
  sabado: ['🗓️', 'sábado', 'tempo'], domingo: ['☀️', 'domingo', 'tempo'], chuva: ['🌧️', 'chuva', 'tempo'],
  sim: ['✅', 'sim', 'resp'], nao: ['❌', 'não', 'resp'], naosei: ['🤷', 'não sei', 'resp'], ajuda: ['🆘', 'ajuda', 'resp'],
  obrigado: ['🙏', 'obrigado', 'resp'], tchau: ['👋', 'tchau', 'resp'], amor: ['❤️', 'te amo', 'resp'], legal: ['👍', 'legal', 'resp'],
};
const CATEGORIAS = [['sugeridos', '✨ Lumi sugere'], ['pessoas', '👥 Pessoas'], ['acoes', '🏃 Ações'], ['coisas', '🧸 Coisas e lugares'], ['sentir', '💗 Sentir'], ['tempo', '⏰ Quando'], ['resp', '💬 Respostas']];
const ATIVIDADES_MARCAR = ['parque', 'sorvete', 'vovo', 'piscina', 'cinema', 'jogo', 'amigo', 'livro'];
const QUANDO_MARCAR = ['hoje', 'amanha', 'sabado', 'domingo'];
const LUGAR_FRASE = { parque: 'ao parque', escola: 'para a escola', casa: 'para casa', piscina: 'à piscina', cinema: 'ao cinema', vovo: 'na casa da vovó', banheiro: 'ao banheiro' };
const P_ = (id) => PICTOS[id] || ['❔', id, ''];

// "IA" de linguagem da CAA: transforma a sequência de pictogramas numa frase natural.
function traduzirPictos(ids) {
  const sent = ['feliz', 'triste', 'cansado', 'nervoso', 'medo', 'bravo', 'dor'];
  const pal = [];
  ids.forEach((id, i) => {
    const ant = ids[i - 1];
    if (sent.includes(id) && ant !== 'estou') { if (ant === 'eu' || i === 0) pal.push('estou'); }
    if (LUGAR_FRASE[id] && ['quero', 'vamos', 'ir', 'preciso', 'naoquero'].includes(ant)) { pal.push(ant === 'ir' ? LUGAR_FRASE[id] : 'ir ' + LUGAR_FRASE[id]); return; }
    if (['agua', 'ajuda', 'lanche'].includes(id) && ant === 'preciso') { pal.push('de ' + P_(id)[1]); return; }
    if (id === 'barulho' && (i === 0 || ant === 'eu')) { pal.push('está ' + P_(id)[1] + ' para mim'); return; }
    if ((id === 'sabado' || id === 'domingo') && i > 0) { pal.push('no ' + P_(id)[1]); return; }
    pal.push(P_(id)[1]);
  });
  let s = pal.join(' ').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?]$/.test(s) ? s : s + '.';
}

// Texto livre da família → pictogramas que o Lucas vê junto da mensagem.
const PALAVRA_PICTO = { parque: 'parque', agua: 'agua', sabado: 'sabado', domingo: 'domingo', amanha: 'amanha', hoje: 'hoje', agora: 'agora',
  depois: 'depois', sim: 'sim', nao: 'nao', chuva: 'chuva', chover: 'chuva', vovo: 'vovo', licao: 'licao', tablet: 'tablet', banho: 'banho',
  dormir: 'dormir', escola: 'escola', casa: 'casa', sorvete: 'sorvete', piscina: 'piscina', amo: 'amor', vamos: 'vamos', feliz: 'feliz',
  orgulhosa: 'amor', orgulhoso: 'amor', comer: 'comer', jantar: 'comer', almoco: 'comer', mamae: 'mamae', papai: 'papai', musica: 'musica',
  dinossauro: 'dino', dinossauros: 'dino', obrigado: 'obrigado', obrigada: 'obrigado', tchau: 'tchau', ajuda: 'ajuda', cinema: 'cinema',
  legal: 'legal', otimo: 'legal', muito: null, lanche: 'lanche', brincar: 'brincar', videogame: 'jogo', triste: 'triste', cansado: 'cansado' };
function textoParaPictos(texto) {
  const norm = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const ids = [];
  norm.split(/[^a-z]+/).forEach((w) => { const id = PALAVRA_PICTO[w]; if (id && !ids.includes(id)) ids.push(id); });
  return ids.slice(0, 6);
}

// ---------- Estado inicial da CAA (14 meses de evolução fictícia) ----------
function caaPadrao() {
  const hist = [];
  const ini = new Date(inicioDaHistoria()); ini.setDate(1); ini.setHours(12);
  for (let m = 0; m <= MESES_DE_HISTORIA; m++) {
    const d = new Date(ini); d.setMonth(ini.getMonth() + m);
    const t = m / MESES_DE_HISTORIA;
    const queda = m === 6 ? 0.82 : m === 7 ? 0.9 : 1; // mudança de escola
    hist.push({ mes: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      tamanho: +((1.2 + 1.9 * t + (m % 3 === 1 ? .12 : -.05)) * queda).toFixed(2),
      vocab: Math.round((14 + 58 * Math.pow(t, .85)) * (m === 6 ? .95 : 1)),
      frases: Math.round((18 + 74 * t) * queda + (m % 2 ? 6 : 0)),
      iniciadas: Math.round((18 + 46 * t) * queda) });
  }
  const bigr = {};
  const somar = (seq, n) => { ['^', ...seq].forEach((a, i, arr) => { const b = arr[i + 1]; if (!b) return; bigr[a] = bigr[a] || {}; bigr[a][b] = (bigr[a][b] || 0) + n; }); };
  somar(['eu', 'quero', 'agua'], 22); somar(['eu', 'quero', 'parque'], 14); somar(['eu', 'quero', 'tablet'], 18);
  somar(['eu', 'estou', 'cansado'], 9); somar(['eu', 'estou', 'feliz'], 12); somar(['preciso', 'banheiro'], 16);
  somar(['eu', 'gosto', 'dino'], 20); somar(['sim'], 30); somar(['nao'], 18); somar(['vamos', 'parque', 'amanha'], 6);
  somar(['eu', 'preciso', 'ajuda'], 5); somar(['barulho'], 7); somar(['eu', 'quero', 'lanche', 'agora'], 8); somar(['te', 'amo'].slice(0, 0), 0);
  const h = 36e5, dia = 24 * h, agora = Date.now();
  return {
    historico: hist, bigr,
    mensagens: [
      { id: 1, de: 'lucas', pictos: ['eu', 'quero', 'parque', 'amanha'], texto: 'Eu quero ir ao parque amanhã.', data: agora - dia - 3 * h, sozinho: true },
      { id: 2, de: 'ana', pictos: ['amanha', 'chuva', 'vamos', 'parque', 'sabado'], texto: 'Amanhã vai chover. Vamos ao parque no sábado?', data: agora - dia - 2.8 * h },
      { id: 3, de: 'lucas', pictos: ['sim', 'feliz'], texto: 'Sim. Estou feliz.', data: agora - dia - 2.7 * h, sozinho: true },
      { id: 4, de: 'julia', pictos: ['legal'], texto: 'Lucas, adorei ver você usando frases de 3 e 4 figuras! 👏', data: agora - 20 * h },
    ],
    combinados: [
      { id: 'c1', primeiro: 'licao', primeiroTxt: 'Fazer a lição', depois: 'tablet', depoisTxt: '20 minutos de tablet', status: 'ativo', por: 'ana', cumpridos: 18, ultimo: agora - dia },
      { id: 'c2', primeiro: 'banho', primeiroTxt: 'Tomar banho antes do jantar', depois: 'dino', depoisTxt: 'Ver o documentário de dinossauros', status: 'pendente', por: 'ana', cumpridos: 0 },
    ],
    marcados: [
      { id: 'm1', atividade: 'parque', quando: 'sabado', status: 'confirmado', data: agora - dia - 2.6 * h },
    ],
    notaTerapeuta: { de: 'julia', texto: 'O Lucas passou de frases de 1 figura para frases de 3 a 4 em pouco mais de um ano. Próximo objetivo: usar "porque" para explicar o que sente.', data: agora - 3 * dia },
    novos: ['cinema', 'bravo', 'vovo'],
    naoLidasLucas: 0,
    naoLidasAna: 0,
  };
}

// ---------- Eventos da CAA ----------
function mesAtual(C) {
  const k = new Date().toISOString().slice(0, 7);
  let m = C.historico.find((x) => x.mes === k);
  if (!m) { const ult = C.historico[C.historico.length - 1]; m = { ...ult, mes: k, frases: 0 }; C.historico.push(m); }
  return m;
}
function aplicarCAA(ev) {
  const C = S.caa, d = ev.dados;
  if (!C) return;
  if (ev.tipo === 'msg') {
    C.mensagens.push({ id: ev.id, de: ev.de, pictos: d.pictos, texto: d.texto, data: ev.data, sozinho: d.sozinho });
    C.mensagens = C.mensagens.slice(-60);
    if (ev.de === 'lucas') {
      C.naoLidasAna++;
      const m = mesAtual(C);
      m.tamanho = +(((m.tamanho * m.frases) + d.pictos.length) / (m.frases + 1)).toFixed(2);
      m.frases++;
      d.pictos.forEach((id) => { if (!C.novos.includes(id) && !Object.values(C.bigr).some((o) => o[id])) { C.novos.push(id); m.vocab++; } });
    } else C.naoLidasLucas++;
  }
  if (ev.tipo === 'fala_caa') {
    // Cada frase montada ensina a IA a prever a próxima figura (bigramas de uso)
    ['^', ...d.pictos].forEach((a, i, arr) => { const b = arr[i + 1]; if (!b) return; C.bigr[a] = C.bigr[a] || {}; C.bigr[a][b] = (C.bigr[a][b] || 0) + 1; });
  }
  if (ev.tipo === 'marcar_pedido') C.marcados.push({ id: 'm' + ev.data, atividade: d.atividade, quando: d.quando, status: 'aguardando', data: ev.data });
  if (ev.tipo === 'marcar_resposta') { const m = C.marcados.find((x) => x.id === d.id); if (m) { m.status = d.status; if (d.quando) m.quando = d.quando; } }
  if (ev.tipo === 'combinado_novo') C.combinados.push({ ...d.combinado, status: 'pendente', cumpridos: 0 });
  if (ev.tipo === 'combinado_resposta') { const c = C.combinados.find((x) => x.id === d.id); if (c) c.status = d.status; }
  if (ev.tipo === 'combinado_cumprido') { const c = C.combinados.find((x) => x.id === d.id); if (c) { c.cumpridos++; c.ultimo = ev.data; } }
}
Object.assign(ICONE_EV, { msg: '💬', marcar_pedido: '📌', marcar_resposta: '📅', combinado_novo: '🤝', combinado_resposta: '🤝', combinado_cumprido: '⭐' });
function textoCAA(ev) {
  const d = ev.dados, quem = conta(ev.de)?.nome || '';
  const nomeP = (id) => P_(id)[1];
  const textos = {
    msg: () => `${quem} ${ev.de === 'lucas' ? 'mandou com figuras' : 'mandou'}: "${d.texto}"`,
    marcar_pedido: () => `Lucas pediu para marcar: ${nomeP(d.atividade)} (${nomeP(d.quando)})`,
    marcar_resposta: () => `${quem} ${d.status === 'confirmado' ? 'confirmou' : 'sugeriu outro dia para'} o compromisso`,
    combinado_novo: () => `${quem} propôs um combinado: ${d.combinado.primeiroTxt} → ${d.combinado.depoisTxt}`,
    combinado_resposta: () => `Lucas ${d.status === 'ativo' ? 'aceitou' : 'quer conversar sobre'} o combinado`,
    combinado_cumprido: () => `Lucas marcou que cumpriu: ${d.texto}`,
  };
  return textos[ev.tipo]?.();
}
const pictoHTML = (ids, tam = 'm') => `<span class="pictos ${tam}">${ids.map((id) => `<span class="picto-mini" title="${esc(P_(id)[1])}"><i>${P_(id)[0]}</i><small>${esc(P_(id)[1])}</small></span>`).join('')}</span>`;

// ---------- Paciente: tela "Conversar" ----------
P.caa = { frase: [], cat: 'sugeridos', aba: 'falar', marcar: { atividade: null, quando: null } };
function sugestoesPicto() {
  const ult = P.caa.frase[P.caa.frase.length - 1] || '^';
  const o = S.caa.bigr[ult] || {};
  const lista = Object.entries(o).sort((a, b) => b[1] - a[1]).map(([id]) => id).filter((id) => PICTOS[id]);
  return [...lista, ...['eu', 'quero', 'sim', 'nao', 'ajuda', 'estou'].filter((x) => !lista.includes(x))].slice(0, 8);
}

P.telas.conversar = (aba) => {
  if (aba) P.caa.aba = aba;
  S.caa.naoLidasLucas = 0; salvar();
  const abas = [['falar', '🗣️ Falar'], ['mensagens', '💬 Mensagens'], ['combinados', '🤝 Combinados'], ['marcar', '📌 Marcar']];
  P.moldura(`
    ${P.cabecalho('Conversar')}
    <div class="abas">${abas.map(([id, n]) => `<button data-caa-aba="${id}" aria-pressed="${P.caa.aba === id}">${n}</button>`).join('')}</div>
    <div id="caaCorpo">${P.caaAbas[P.caa.aba]()}</div>`);
  P.ligarCAA();
};
P.caaAbas = {};
P.caaAbas.falar = () => {
  const f = P.caa.frase;
  const lista = P.caa.cat === 'sugeridos' ? sugestoesPicto() : Object.keys(PICTOS).filter((id) => PICTOS[id][2] === P.caa.cat);
  return `
    <div class="faixa-frase" aria-live="polite">
      ${f.length ? f.map((id, i) => `<button class="picto-faixa" data-tirar="${i}" title="Tirar"><i>${P_(id)[0]}</i><small>${esc(P_(id)[1])}</small></button>`).join('') : '<span class="suave peq">Toque nas figuras para montar sua frase.</span>'}
    </div>
    ${f.length ? `<div class="frase-ia"><span class="selo ia">IA</span> ${esc(traduzirPictos(f))}</div>` : ''}
    <div class="acoes-frase">
      <button class="btn primario" id="caaFalar" ${f.length ? '' : 'disabled'}>🔊 Falar</button>
      <button class="btn" id="caaEnviar" ${f.length ? '' : 'disabled'}>📩 Enviar à mamãe</button>
      <button class="btn" id="caaApagar" ${f.length ? '' : 'disabled'} aria-label="Apagar a última figura">⌫</button>
    </div>
    <div class="cats">${CATEGORIAS.map(([id, n]) => `<button data-cat="${id}" aria-pressed="${P.caa.cat === id}">${n}</button>`).join('')}</div>
    ${P.caa.cat === 'sugeridos' ? '<p class="peq suave" style="margin:0 0 6px">O Lumi aprende com as frases que você mais usa e sugere a próxima figura.</p>' : ''}
    <div class="prancha">${lista.map((id) => `<button class="picto" data-picto="${id}"><i>${P_(id)[0]}</i><small>${esc(P_(id)[1])}</small></button>`).join('')}</div>
    <details class="cartao" style="margin-top:10px"><summary><b>Frases prontas</b></summary>
      <div class="frases" style="margin-top:8px">${FRASES_CAA.map((x) => `<button data-falar="${esc(x.texto)}"><span>${x.emoji}</span>${esc(x.texto)}</button>`).join('')}</div></details>`;
};
P.caaAbas.mensagens = () => {
  const msgs = S.caa.mensagens.slice(-14);
  return `<div class="chat">${msgs.map((m) => {
    const c = conta(m.de) || {};
    const meu = m.de === 'lucas';
    return `<div class="bolha ${meu ? 'minha' : ''}">
      ${meu ? '' : `<div class="peq suave">${c.avatar || ''} ${esc(c.nome || '')}</div>`}
      ${m.pictos?.length ? pictoHTML(m.pictos) : ''}
      <div>${esc(m.texto)}</div>
      <div class="linha" style="justify-content:space-between;margin-top:4px"><time class="peq suave">${haQuanto(m.data)}</time>${meu ? '' : `<button class="btn" data-falar="${esc(m.texto)}" style="min-height:30px;padding:2px 8px;font-size:12px">🔊 Ouvir</button>`}</div>
    </div>`; }).join('')}</div>
    <button class="btn primario bloco" data-caa-aba="falar">🗣️ Responder com figuras</button>`;
};
P.caaAbas.combinados = () => `
  <p class="peq suave" style="margin:0 0 8px">Combinados com a sua família: <b>primeiro</b> uma tarefa, <b>depois</b> algo que você gosta.</p>
  ${S.caa.combinados.filter((c) => c.status !== 'recusado').map((c) => {
    const hoje = c.ultimo && new Date(c.ultimo).toDateString() === new Date().toDateString();
    return `<div class="cartao combinado">
    <div class="primeiro-depois">
      <div><span class="peq suave">Primeiro</span><i>${P_(c.primeiro)[0]}</i><b>${esc(c.primeiroTxt)}</b></div>
      <span class="seta">➜</span>
      <div><span class="peq suave">Depois</span><i>${P_(c.depois)[0]}</i><b>${esc(c.depoisTxt)}</b></div>
    </div>
    ${c.status === 'pendente' ? `<p class="peq" style="margin:8px 0">${esc(conta(c.por)?.nome || '')} propôs este combinado. Você topa?</p>
      <div class="grade-2"><button class="btn ok" data-comb-aceitar="${c.id}">✅ Combinado!</button><button class="btn" data-comb-conversar="${c.id}">🤔 Quero conversar</button></div>`
    : c.status === 'conversar' ? '<span class="selo aviso">Vocês vão conversar sobre este</span>'
    : `<div class="linha" style="margin-top:8px"><span class="selo ok">⭐ Cumprido ${c.cumpridos}×</span><span class="espaco"></span>
      ${hoje ? '<span class="selo ia">✓ feito hoje</span>' : `<button class="btn ok" data-comb-cumpri="${c.id}" style="min-height:38px">Cumpri hoje ✓</button>`}</div>`}
  </div>`; }).join('')}`;
P.caaAbas.marcar = () => {
  const mk = P.caa.marcar;
  const lista = S.caa.marcados.slice(-5).reverse();
  const st = { aguardando: ['aviso', '⏳ esperando a mamãe'], confirmado: ['ok', '✅ combinado'], outro: ['ia', '🔁 outro dia'] };
  return `
  <p class="peq suave" style="margin:0 0 8px">Escolha o que você quer fazer e quando. A mamãe recebe o pedido e responde.</p>
  <div class="titulo-sec" style="margin-top:4px">O quê?</div>
  <div class="prancha">${ATIVIDADES_MARCAR.map((id) => `<button class="picto ${mk.atividade === id ? 'ativo' : ''}" data-mk-at="${id}"><i>${P_(id)[0]}</i><small>${esc(P_(id)[1])}</small></button>`).join('')}</div>
  <div class="titulo-sec">Quando?</div>
  <div class="prancha">${QUANDO_MARCAR.map((id) => `<button class="picto ${mk.quando === id ? 'ativo' : ''}" data-mk-q="${id}"><i>${P_(id)[0]}</i><small>${esc(P_(id)[1])}</small></button>`).join('')}</div>
  ${mk.atividade && mk.quando ? `<div class="frase-ia" style="margin-top:10px"><span class="selo ia">IA</span> Eu quero ${LUGAR_FRASE[mk.atividade] ? 'ir ' + LUGAR_FRASE[mk.atividade] : P_(mk.atividade)[1]} ${P_(mk.quando)[1] === 'hoje' || P_(mk.quando)[1] === 'amanhã' ? P_(mk.quando)[1] : 'no ' + P_(mk.quando)[1]}.</div>` : ''}
  <button class="btn primario bloco" id="mkEnviar" style="margin-top:10px" ${mk.atividade && mk.quando ? '' : 'disabled'}>📌 Pedir para a mamãe</button>
  ${lista.length ? `<div class="titulo-sec">Meus pedidos</div>${lista.map((m) => `<div class="cartao linha"><span style="font-size:26px">${P_(m.atividade)[0]}</span><div style="flex:1"><b>${esc(P_(m.atividade)[1])}</b><br><span class="peq suave">${esc(P_(m.quando)[1])}</span></div><span class="selo ${st[m.status][0]}">${st[m.status][1]}</span></div>`).join('')}` : ''}`;
};

P.ligarCAA = () => {
  const raiz = P.raiz, q = (s) => $(raiz, s);
  const redesenhar = () => { $(raiz, '#caaCorpo').innerHTML = P.caaAbas[P.caa.aba](); P.ligarCAA(); };
  raiz.querySelectorAll('[data-caa-aba]').forEach((b) => b.onclick = () => P.telas.conversar(b.dataset.caaAba));
  raiz.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => { P.caa.cat = b.dataset.cat; redesenhar(); });
  raiz.querySelectorAll('[data-picto]').forEach((b) => b.onclick = () => {
    if (P.caa.frase.length >= 8) return toast('Frase cheia. Fale ou envie antes de continuar.');
    P.caa.frase.push(b.dataset.picto); falar(P_(b.dataset.picto)[1]);
    if (P.caa.cat !== 'sugeridos') P.caa.cat = 'sugeridos';
    redesenhar();
  });
  raiz.querySelectorAll('[data-tirar]').forEach((b) => b.onclick = () => { P.caa.frase.splice(+b.dataset.tirar, 1); redesenhar(); });
  q('#caaApagar') && (q('#caaApagar').onclick = () => { P.caa.frase.pop(); redesenhar(); });
  q('#caaFalar') && (q('#caaFalar').onclick = () => {
    falar(traduzirPictos(P.caa.frase), true);
    emitir('fala_caa', { pictos: [...P.caa.frase] });
  });
  q('#caaEnviar') && (q('#caaEnviar').onclick = () => {
    const pictos = [...P.caa.frase];
    emitir('fala_caa', { pictos });
    emitir('msg', { pictos, texto: traduzirPictos(pictos), sozinho: true });
    P.caa.frase = []; toast('Mensagem enviada para a mamãe.'); P.telas.conversar('mensagens');
  });
  raiz.querySelectorAll('[data-comb-aceitar]').forEach((b) => b.onclick = () => { emitir('combinado_resposta', { id: b.dataset.combAceitar, status: 'ativo' }); falar('Combinado!'); P.telas.conversar('combinados'); });
  raiz.querySelectorAll('[data-comb-conversar]').forEach((b) => b.onclick = () => {
    emitir('combinado_resposta', { id: b.dataset.combConversar, status: 'conversar' });
    emitir('msg', { pictos: ['eu', 'quero', 'naosei'], texto: 'Eu quero conversar sobre o combinado.', sozinho: true });
    P.telas.conversar('combinados');
  });
  raiz.querySelectorAll('[data-comb-cumpri]').forEach((b) => b.onclick = () => {
    const c = S.caa.combinados.find((x) => x.id === b.dataset.combCumpri);
    emitir('combinado_cumprido', { id: c.id, texto: c.primeiroTxt });
    S.pet.estrelas += 1; salvar();
    falar(`Muito bem! Agora é hora de: ${c.depoisTxt}.`); P.telas.conversar('combinados');
  });
  raiz.querySelectorAll('[data-mk-at]').forEach((b) => b.onclick = () => { P.caa.marcar.atividade = b.dataset.mkAt; falar(P_(b.dataset.mkAt)[1]); redesenhar(); });
  raiz.querySelectorAll('[data-mk-q]').forEach((b) => b.onclick = () => { P.caa.marcar.quando = b.dataset.mkQ; falar(P_(b.dataset.mkQ)[1]); redesenhar(); });
  q('#mkEnviar') && (q('#mkEnviar').onclick = () => {
    const { atividade, quando } = P.caa.marcar;
    emitir('marcar_pedido', { atividade, quando });
    P.caa.marcar = { atividade: null, quando: null };
    toast('Pedido enviado. A mamãe vai responder.'); P.telas.conversar('marcar');
  });
};

// Início do paciente: atalho "Conversar", compromissos combinados e combinado novo da família
P.ganchosInicio.push(() => {
  const grade = P.raiz.querySelector('.grade-2');
  if (grade) grade.insertAdjacentHTML('afterbegin', `<button class="atalho" data-p="conversar" style="position:relative"><span>💬</span><b>Conversar</b><small>Figuras, mensagens e combinados</small>
    ${S.caa.naoLidasLucas ? `<i class="badge" style="position:absolute;top:8px;right:8px">${S.caa.naoLidasLucas}</i>` : ''}</button>`);
  const confirmados = S.caa.marcados.filter((m) => m.status === 'confirmado');
  const ag = P.raiz.querySelector('.agenda');
  if (ag && confirmados.length) ag.insertAdjacentHTML('beforeend', confirmados.slice(-2).map((m) => `
    <button class="item" data-p="conversar" style="border-style:dashed"><span class="hora" style="font-size:12px">${esc(P_(m.quando)[1])}</span><span class="emo">${P_(m.atividade)[0]}</span>
    <span><b>${esc(P_(m.atividade)[1].charAt(0).toUpperCase() + P_(m.atividade)[1].slice(1))}</b><br><span class="peq suave">combinado com a mamãe</span></span><span class="selo ok">📌</span></button>`).join(''));
  const pend = S.caa.combinados.find((c) => c.status === 'pendente');
  if (pend && ag) ag.insertAdjacentHTML('afterend', `<button class="cartao destaque" data-p="conversar" style="width:100%;text-align:left;margin-top:8px;cursor:pointer">🤝 <b>Novo combinado da mamãe</b><br><span class="peq suave">${esc(pend.primeiroTxt)} → ${esc(pend.depoisTxt)}</span></button>`);
});

function receberCAA(ev) {
  // Redesenha primeiro, para o aviso do Lumi não sumir junto com a tela antiga
  if (P.tela === 'inicio' && ev.de !== 'lucas' && ['msg', 'marcar_resposta', 'combinado_novo'].includes(ev.tipo)) P.ir('inicio');
  if (ev.tipo === 'msg' && ev.de !== 'lucas') {
    const quem = conta(ev.de)?.nome || 'Sua família';
    if (P.tela === 'conversar' && P.caa.aba === 'mensagens') { S.caa.naoLidasLucas = 0; P.telas.conversar('mensagens'); falar(`${quem} disse: ${ev.dados.texto}`); }
    else P.banner('💬', `${quem} mandou: ${ev.dados.texto}`);
  }
  if (ev.tipo === 'marcar_resposta') P.banner('📅', ev.dados.status === 'confirmado' ? 'A mamãe confirmou o seu pedido! Já está na sua agenda.' : `A mamãe sugeriu outro dia: ${P_(ev.dados.quando)[1]}.`);
  if (ev.tipo === 'combinado_novo') P.banner('🤝', `A mamãe propôs um combinado: primeiro ${ev.dados.combinado.primeiroTxt.toLowerCase()}, depois ${ev.dados.combinado.depoisTxt.toLowerCase()}.`);
  if (P.tela === 'conversar' && ev.de !== 'lucas' && ev.tipo !== 'msg' && ['marcar_resposta', 'combinado_novo'].includes(ev.tipo)) {
    const aviso = $(P.raiz, '.aviso-lumi');
    P.telas.conversar();
    if (aviso) P.raiz.appendChild(aviso);
  }
}

// ---------- Responsável: aba "Conversa" ----------
function grafSerie(valores, rotulos, { cor = '#2a9d8f', sufixo = '', max } = {}) {
  const W = 340, H = 120, x0 = 26, x1 = W - 6, y0 = 12, y1 = H - 22;
  const mx = max || Math.max(...valores) * 1.15;
  const X = (i) => x0 + i * (x1 - x0) / Math.max(1, valores.length - 1), Y = (v) => y1 - (v / mx) * (y1 - y0);
  const d = valores.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" role="img">
    ${[0, .5, 1].map((f) => `<line x1="${x0}" x2="${x1}" y1="${Y(mx * f)}" y2="${Y(mx * f)}" stroke="currentColor" stroke-opacity=".12"/><text x="${x0 - 4}" y="${Y(mx * f) + 3}" fill="currentColor" fill-opacity=".7" font-size="8.5" text-anchor="end">${(mx * f).toFixed(mx < 10 ? 1 : 0)}</text>`).join('')}
    <path d="${d} L${X(valores.length - 1)} ${y1} L${X(0)} ${y1} Z" fill="${cor}" opacity=".12"/>
    <path d="${d}" fill="none" stroke="${cor}" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="${X(valores.length - 1)}" cy="${Y(valores[valores.length - 1])}" r="3.5" fill="${cor}"/>
    <text x="${X(valores.length - 1) - 4}" y="${Y(valores[valores.length - 1]) - 7}" fill="currentColor" font-size="10" text-anchor="end" font-weight="700">${valores[valores.length - 1]}${sufixo}</text>
    ${rotulos.map((r, i) => i % 3 === 0 || i === rotulos.length - 1 ? `<text x="${X(i)}" y="${H - 6}" fill="currentColor" fill-opacity=".7" font-size="8.5" text-anchor="middle">${r}</text>` : '').join('')}
  </svg>`;
}
const nomeMesCurto = (k) => { const [a, m] = k.split('-'); return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+m - 1] + (m === '01' || k === S.caa.historico[0].mes ? '/' + a.slice(2) : ''); };

R.abas.conversa = () => {
  const C = S.caa;
  C.naoLidasAna = 0;
  const pedidos = C.marcados.filter((m) => m.status === 'aguardando');
  const hist = C.historico, ult = hist[hist.length - 1], pri = hist[0];
  const totalUso = {};
  Object.values(C.bigr).forEach((o) => Object.entries(o).forEach(([id, n]) => { totalUso[id] = (totalUso[id] || 0) + n; }));
  const top = Object.entries(totalUso).filter(([id]) => PICTOS[id]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const rot = hist.map((h) => nomeMesCurto(h.mes));
  const prev = textoParaPictos(R.rascunho || '');
  return `
  <div class="cab-resp"><span class="avatar">💬</span><div><b>Conversa com o Lucas</b><br><span class="peq suave">Ele usa figuras (CAA); a IA traduz nos dois sentidos. A Dra. Júlia também acompanha.</span></div></div>

  ${pedidos.map((m) => `<div class="cartao destaque"><div class="linha"><span style="font-size:28px">${P_(m.atividade)[0]}</span>
    <div style="flex:1"><b>Lucas quer marcar: ${esc(P_(m.atividade)[1])}</b><br><span class="peq suave">${esc(P_(m.quando)[1])} · ${haQuanto(m.data)}</span></div></div>
    <div class="grade-2" style="margin-top:8px"><button class="btn ok" data-mk-conf="${m.id}">✅ Confirmar</button><button class="btn" data-mk-outro="${m.id}">🔁 Sugerir domingo</button></div></div>`).join('')}

  <div class="cartao">
    <div class="chat">${C.mensagens.slice(-8).map((m) => { const c = conta(m.de) || {}; const meu = m.de === EU;
      return `<div class="bolha ${meu ? 'minha' : ''}"><div class="peq suave">${c.avatar || ''} ${esc(c.nome || '')}${m.de === 'lucas' && m.sozinho ? ' · <span style="color:var(--ok)">montou sozinho</span>' : ''}</div>
        ${m.pictos?.length ? pictoHTML(m.pictos, m.de === 'lucas' ? 'm' : 'p') : ''}<div>${esc(m.texto)}</div><time class="peq suave">${haQuanto(m.data)}</time></div>`; }).join('')}</div>
    <div class="linha" style="gap:6px;margin:8px 0">${['Sim! 👍', 'Estou muito orgulhosa de você ❤️', 'Depois do jantar conversamos', 'Hora do banho'].map((t) => `<button class="btn" data-rapida="${esc(t)}" style="font-size:12px;min-height:34px;padding:4px 10px">${esc(t)}</button>`).join('')}</div>
    <div class="linha" style="flex-wrap:nowrap"><input class="campo-in" id="rMsg" placeholder="Escreva para o Lucas…" value="${esc(R.rascunho || '')}"><button class="btn primario" id="rEnviarMsg">Enviar</button></div>
    <div class="peq suave" style="margin-top:6px">O Lucas vai ver: ${prev.length ? pictoHTML(prev, 'p') : '<i>as figuras aparecem aqui conforme você escreve</i>'}</div>
  </div>

  <div class="titulo-sec">Combinados (primeiro → depois)</div>
  <div class="cartao">${C.combinados.map((c) => `<div class="linha" style="padding:8px 0;border-bottom:1px solid var(--linha)"><span style="font-size:22px">${P_(c.primeiro)[0]}</span><span class="suave">➜</span><span style="font-size:22px">${P_(c.depois)[0]}</span>
    <div style="flex:1"><b class="peq">${esc(c.primeiroTxt)} → ${esc(c.depoisTxt)}</b></div>
    <span class="selo ${c.status === 'ativo' ? 'ok' : c.status === 'pendente' ? 'aviso' : ''}">${c.status === 'ativo' ? `⭐ ${c.cumpridos}×` : c.status === 'pendente' ? 'aguardando o Lucas' : 'conversar'}</span></div>`).join('')}
    <details style="margin-top:10px"><summary><b>+ Novo combinado</b></summary>
      <label class="campo">Primeiro</label><div class="linha" style="flex-wrap:nowrap"><select class="campo-in" id="cbP" style="width:90px">${['licao', 'banho', 'escola', 'comer', 'dormir', 'livro'].map((id) => `<option value="${id}">${P_(id)[0]}</option>`).join('')}</select><input class="campo-in" id="cbPt" placeholder="Ex.: Guardar os brinquedos"></div>
      <label class="campo">Depois</label><div class="linha" style="flex-wrap:nowrap"><select class="campo-in" id="cbD" style="width:90px">${['tablet', 'dino', 'parque', 'jogo', 'sorvete', 'musica'].map((id) => `<option value="${id}">${P_(id)[0]}</option>`).join('')}</select><input class="campo-in" id="cbDt" placeholder="Ex.: 20 minutos de videogame"></div>
      <button class="btn primario bloco" id="cbEnviar" style="margin-top:8px">Propor ao Lucas</button></details>
  </div>

  <div class="titulo-sec">Desenvolvimento da comunicação</div>
  <div class="metricas">
    <div class="metrica"><b>${ult.tamanho}</b><span>figuras por frase (era ${pri.tamanho})</span></div>
    <div class="metrica"><b>${ult.vocab}</b><span>palavras usadas (era ${pri.vocab})</span></div>
    <div class="metrica"><b>${ult.iniciadas}%</b><span>conversas que ele começa (era ${pri.iniciadas}%)</span></div>
  </div>
  <div class="cartao grafico" style="margin-top:10px"><b class="peq">Tamanho médio da frase · ${hist.length} meses</b>${grafSerie(hist.map((h) => h.tamanho), rot, { cor: '#2a9d8f', max: 4 })}
    <b class="peq">Vocabulário usado</b>${grafSerie(hist.map((h) => h.vocab), rot, { cor: '#2a9d7c', max: 90 })}
    <p class="peq suave" style="margin:4px 0 0">A queda no 6º mês coincide com a mudança de escola. Histórico anterior a hoje é fictício; as frases montadas agora entram na conta.</p></div>
  <div class="cartao"><b class="peq">Figuras que ele mais usa</b><div style="margin-top:6px">${pictoHTML(top.map(([id]) => id), 'p')}</div>
    <b class="peq" style="display:block;margin-top:10px">Novas este mês</b><div style="margin-top:6px">${pictoHTML(C.novos.slice(-6), 'p')}</div></div>
  <div class="cartao" style="border-left:4px solid var(--ambar)"><div class="peq suave">🧑‍⚕️ Nota da Dra. Júlia · ${haQuanto(C.notaTerapeuta.data)}</div><p style="margin:6px 0 0">${esc(C.notaTerapeuta.texto)}</p></div>`;
};

R.ligarCAA = () => {
  const q = (s) => $(R.raiz, s);
  const enviar = (texto) => {
    if (!texto.trim()) return;
    R.rascunho = '';
    emitir('msg', { pictos: textoParaPictos(texto), texto: texto.trim() }, EU);
  };
  q('#rMsg') && (q('#rMsg').oninput = (e) => {
    R.rascunho = e.target.value;
    const alvo = e.target.closest('.cartao').querySelector('.peq.suave:last-child');
    const prev = textoParaPictos(R.rascunho);
    if (alvo) alvo.innerHTML = 'O Lucas vai ver: ' + (prev.length ? pictoHTML(prev, 'p') : '<i>as figuras aparecem aqui conforme você escreve</i>');
  });
  q('#rMsg') && (q('#rMsg').onkeydown = (e) => { if (e.key === 'Enter') enviar(e.target.value); });
  q('#rEnviarMsg') && (q('#rEnviarMsg').onclick = () => enviar(q('#rMsg').value));
  R.raiz.querySelectorAll('[data-rapida]').forEach((b) => b.onclick = () => enviar(b.dataset.rapida));
  R.raiz.querySelectorAll('[data-mk-conf]').forEach((b) => b.onclick = () => {
    const m = S.caa.marcados.find((x) => x.id === b.dataset.mkConf);
    emitir('marcar_resposta', { id: m.id, status: 'confirmado' }, EU);
    emitir('msg', { pictos: ['sim', 'vamos', m.atividade, m.quando], texto: `Combinado! ${P_(m.atividade)[1]}, ${P_(m.quando)[1]}.` }, EU);
  });
  R.raiz.querySelectorAll('[data-mk-outro]').forEach((b) => b.onclick = () => {
    const m = S.caa.marcados.find((x) => x.id === b.dataset.mkOutro);
    emitir('marcar_resposta', { id: m.id, status: 'outro', quando: 'domingo' }, EU);
  });
  q('#cbEnviar') && (q('#cbEnviar').onclick = () => {
    const pt = q('#cbPt').value.trim(), dt = q('#cbDt').value.trim();
    if (!pt || !dt) return toast('Escreva o "primeiro" e o "depois".');
    emitir('combinado_novo', { combinado: { id: 'c' + Date.now(), primeiro: q('#cbP').value, primeiroTxt: pt, depois: q('#cbD').value, depoisTxt: dt, por: EU } }, EU);
    toast('Combinado enviado ao Lucas.');
  });
};

// ---------- Registro no núcleo ----------
MODULOS.push({ nome: 'caa', dados: caaPadrao, aplicar: aplicarCAA, receber: receberCAA, texto: textoCAA });
R.selos.conversa = () => S.caa.naoLidasAna;
R.ligadores.push(() => R.ligarCAA());
