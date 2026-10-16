/* ============================================================================
   CONTA DA FAMÍLIA (Ana, responsável)
   Celular dela: ao vivo + SOS, evolução de longo prazo, rotinas, contas e ajustes.
   As abas Conversa, Saúde e IA vêm dos módulos (caa.js, saude.js, conhecimento.js).
   ============================================================================ */
// Estado da conta da família: aba aberta, rotina do relatório e avisos não lidos.
const R = {
  raiz: document.getElementById('telaResp'),
  aba: 'inicio',
  rotinaRel: 'mochila',
  naoLidos: 0,
};
// Id da conta que este celular representa (a Ana). As permissões vêm de S.contas.
const EU = 'ana';
// Atalho: a Ana tem esta permissão? (ex.: "emergencia", "plano", "medicacao").
const pode = (perm) => conta(EU)?.permissoes.includes(perm);

// Abas da barra inferior: [id, ícone, nome].
R.nav = [['inicio', '📡', 'Ao vivo'], ['relatorio', '📈', 'Evolução'], ['conversa', '💬', 'Conversa'], ['saude', '💊', 'Saúde'], ['ia', '🧠', 'IA'], ['ajustes', '⚙️', 'Mais']];
R.selos = { inicio: () => (S.alerta ? '!' : R.naoLidos) }; // número ou aviso no ícone da aba; os módulos acrescentam os seus
R.ligadores = [];                                          // cada módulo registra aqui como ligar os cliques das suas telas

// Redesenha a conta inteira, preservando a rolagem e o campo em que a pessoa estava digitando.
R.render = () => {
  const rolagem = $(R.raiz, '#rConteudo')?.scrollTop || 0;
  // Se a pessoa está digitando, o redesenho (que vem de um evento da outra conta) devolve o foco ao mesmo campo
  const foco = document.activeElement;
  const idFoco = foco && R.raiz.contains(foco) && foco.id ? foco.id : null;
  const selecao = idFoco ? [foco.selectionStart, foco.selectionEnd] : null;
  R.raiz.innerHTML = `<div class="status"><span>${hora()}</span><span>Passo a Passo · Ana</span></div>
    <div class="conteudo" id="rConteudo">${R.abas[R.aba]()}</div>
    <nav class="nav-inferior">${R.nav.map(([id, ic, nome]) => { const n = R.aba !== id && R.selos[id]?.();
      return `<button data-aba="${id}" aria-current="${R.aba === id}"><span>${ic}</span>${nome}${n ? `<i class="badge">${n}</i>` : ''}</button>`; }).join('')}</nav>`;
  if (R.aba === 'inicio') R.naoLidos = 0;
  const c = $(R.raiz, '#rConteudo'); if (c) c.scrollTop = rolagem;
  R.ligar();
  document.getElementById('pontoAlerta').hidden = !S.alerta;
  if (idFoco) { const n = document.getElementById(idFoco); if (n) { n.focus(); try { n.setSelectionRange(...selecao); } catch (e) {} } }
};

// Cada aba é uma função que devolve o HTML; módulos acrescentam as suas (conversa, saúde, IA).
R.abas = {};
// Aba "Ao vivo": alerta de SOS (com mapa), passo atual do Lucas, métricas, avisos antecipados e linha do tempo.
R.abas.inicio = () => {
  const a = S.alerta, v = S.aoVivo;
  const ult30 = S.sessoes.filter((s) => s.data > Date.now() - 30 * 864e5);
  const ha12 = S.sessoes.filter((s) => s.data < S.sessoes[0]?.data + 45 * 864e5);
  const mesesAc = S.sessoes.length ? Math.round((Date.now() - S.sessoes[0].data) / (30.4 * 864e5)) : 0;
  const avisados = S.contas.filter((c) => c.permissoes.includes('emergencia'));
  return `
    <div class="cab-resp"><span class="avatar">👩</span><div><b>Olá, Ana</b><br><span class="peq suave">Responsável principal pelo Lucas</span></div></div>
    ${a ? `<div class="alerta-sos">
      <div class="linha"><b style="font-size:17px">🆘 Lucas pediu ajuda urgente</b><span class="espaco"></span><span class="selo perigo">${haQuanto(a.data)}</span></div>
      <div class="peq" style="margin-top:4px">Durante: ${esc(a.contexto)}</div>
      <div class="mapa"><span class="raio"></span><span class="pino">📍</span></div>
      <div class="peq">📍 ${esc(a.local.texto)}${a.local.precisao ? ` · precisão ${a.local.precisao} m` : ''}</div>
      <div class="peq suave" style="margin:6px 0 10px">Avisados: ${avisados.map((c) => `${esc(c.nome)} ✓`).join(' · ')}</div>
      ${a.aCaminho ? `<span class="selo ok">🚗 ${esc(a.aCaminho)} está a caminho</span>` : `<button class="btn perigo bloco" id="rCaminho">🚗 Estou a caminho</button>`}
      <div class="grade-2" style="margin-top:8px"><button class="btn" id="rLigar">📞 Ligar</button><button class="btn" id="rResolver">✅ Resolvido</button></div>
    </div>` : ''}

    <div class="cartao ${v ? 'destaque' : ''}">
      <div class="linha"><h3 style="margin:0">Agora</h3><span class="espaco"></span>${v ? '<span class="selo ia"><i class="vivo"></i>ao vivo</span>' : '<span class="selo">fora de rotina</span>'}</div>
      ${v ? `<div class="ao-vivo" style="margin-top:8px">${lumiSVG({ humor: v.nivel === 0 ? 'observando' : 'falando', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 64 })}
        <div><b>${esc(v.rotina)}</b> · passo ${v.passo}/${v.total}<br><span class="peq">${esc(v.titulo || '')}</span><br>
        <span class="selo ${v.nivel === 0 ? 'ok' : ''}" style="margin-top:4px">Fase ${v.fase} · ${v.nivel === 0 ? 'Lumi em silêncio' : v.nivel === 1 ? 'Lumi perguntando' : 'Lumi instruindo'}</span></div></div>
        <div class="progresso" style="margin:10px 0 0"><div style="width:${Math.round((v.passo - 1) / v.total * 100)}%"></div></div>`
      : `<p class="peq suave" style="margin:6px 0 0">O Lucas não está em nenhuma rotina agora. Quando ele começar, você acompanha cada passo daqui.</p>`}
    </div>

    <div class="metricas">
      <div class="metrica"><b>${media(ult30)}%</b><span>autonomia nos últimos 30 dias</span></div>
      <div class="metrica"><b>${media(ha12)}%</b><span>no início, ${mesesAc} meses atrás</span></div>
      <div class="metrica"><b>${S.sessoes.length}</b><span>sessões registradas</span></div>
    </div>

    ${perguntasPendentes().length || (S.conhecimento.laudo && sugestoesLaudo().some((x) => !x.aplicado)) ? `<button class="cartao destaque" data-aba="ia" style="width:100%;text-align:left;cursor:pointer;display:flex;gap:10px;align-items:center">
      ${lumiSVG({ humor: 'atento', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 54 })}
      <span><b>A IA quer aprender mais sobre o Lucas</b><br><span class="peq suave">${perguntasPendentes().length} pergunta(s) para você${S.conhecimento.laudo ? ' · sugestões do laudo' : ' · laudo neuropsicológico pendente'}</span></span></button>` : ''}

    <div class="titulo-sec">Avisar o Lucas com antecedência</div>
    <div class="cartao"><p class="peq suave" style="margin:0 0 8px">Mudanças avisadas antes evitam crises. O Lumi conta para ele com calma.</p>
      <div style="display:grid;gap:6px">${AVISOS_RAPIDOS.map((t, i) => `<button class="btn" data-aviso="${i}" style="text-align:left;font-weight:400;font-size:14px">📩 ${esc(t)}</button>`).join('')}</div></div>

    <div class="titulo-sec">Linha do tempo</div>
    <div class="cartao"><ul class="eventos">${S.eventos.slice(0, 14).map((ev) => `<li><span class="ic">${ICONE_EV[ev.tipo] || '•'}</span>
      <div>${esc(textoEvento(ev))}<time>${haQuanto(ev.data)}</time></div></li>`).join('') || '<li class="suave">Sem eventos ainda.</li>'}</ul></div>`;
};

// Gráfico de longo prazo: média mensal de autonomia, faixas de fase e marcos da vida real.
function graficoLongo(rid) {
  const lista = S.sessoes.filter((s) => s.rotina === rid);
  if (!lista.length) return '<p class="suave">Sem sessões ainda.</p>';
  const mesesMap = new Map();
  lista.forEach((s) => {
    const d = new Date(s.data), k = d.getFullYear() * 12 + d.getMonth();
    if (!mesesMap.has(k)) mesesMap.set(k, []);
    mesesMap.get(k).push(s);
  });
  const k0 = Math.min(...mesesMap.keys()), k1 = Math.max(...mesesMap.keys());
  const meses = [];
  for (let k = k0; k <= k1; k++) {
    const ss = mesesMap.get(k) || [];
    const fases = ss.map((s) => s.fase);
    meses.push({ k, n: ss.length, media: ss.length ? media(ss) : null, fase: fases.length ? Math.round(fases.reduce((a, b) => a + b, 0) / fases.length) : null });
  }
  const W = 360, H = 206, x0 = 30, x1 = W - 8, y0 = 26, y1 = H - 34;
  const passo = (x1 - x0) / Math.max(1, meses.length - 1);
  const X = (i) => x0 + i * passo, Y = (v) => y1 - (v / 100) * (y1 - y0);
  const corFase = { 1: 'rgba(74,108,240,.104)', 2: 'rgba(42,157,143,.16)', 3: 'rgba(42,157,124,.18)' };
  const pts = meses.map((m, i) => m.media === null ? null : [X(i), Y(m.media)]).filter(Boolean);
  const linha = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${linha} L${pts[pts.length - 1][0]} ${y1} L${pts[0][0]} ${y1} Z`;
  const nomeMes = (k) => { const m = k % 12, a = Math.floor(k / 12); return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][m] + (m === 0 || k === k0 ? '/' + String(a).slice(2) : ''); };
  const marcos = marcosDaHistoria().map((mc) => { const d = new Date(mc.data + 'T12:00:00'); const k = d.getFullYear() * 12 + d.getMonth(); const i = k - k0 + (d.getDate() - 1) / 30; return i >= 0 && i <= meses.length - 1 ? { x: X(i), texto: mc.texto } : null; }).filter(Boolean);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Autonomia mês a mês">
    <defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a9d8f" stop-opacity=".35"/><stop offset="1" stop-color="#2a9d8f" stop-opacity="0"/></linearGradient></defs>
    ${meses.map((m, i) => m.fase ? `<rect x="${X(i) - passo / 2}" y="${y0}" width="${passo}" height="${y1 - y0}" fill="${corFase[m.fase]}"/>` : '').join('')}
    ${[0, 50, 80, 100].map((v) => `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" stroke-opacity="${v === 80 ? '.3' : '.1'}" ${v === 80 ? 'stroke-dasharray="4 4"' : ''}/><text x="${x0 - 5}" y="${Y(v) + 4}" fill="currentColor" fill-opacity=".7" font-size="9" text-anchor="end">${v}%</text>`).join('')}
    <text x="${x0 + 4}" y="${Y(80) - 4}" fill="currentColor" fill-opacity=".7" font-size="8.5">meta para mudar de fase</text>
    ${marcos.map((mc, i) => `<line x1="${mc.x}" x2="${mc.x}" y1="${y0 - 6}" y2="${y1}" stroke="#c27c0e" stroke-dasharray="3 3" opacity=".8"/><text x="${mc.x > W - 90 ? mc.x - 3 : mc.x + 3}" y="${i % 2 ? y0 + 6 : y0 - 6}" fill="#c27c0e" font-size="8.5" ${mc.x > W - 90 ? 'text-anchor="end"' : ''}>${esc(mc.texto)}</text>`).join('')}
    <path d="${area}" fill="url(#gArea)"/>
    <path d="${linha}" fill="none" stroke="#2a9d8f" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="currentColor"/>`).join('')}
    ${(() => { let anoAnt = null; return meses.map((m, i) => { if (i % 2 && i !== meses.length - 1) return '';
      const ano = Math.floor(m.k / 12), rot = nomeMes(m.k).split('/')[0] + (ano !== anoAnt ? '/' + String(ano).slice(2) : ''); anoAnt = ano;
      return `<text x="${X(i)}" y="${H - 18}" fill="currentColor" fill-opacity=".7" font-size="9" text-anchor="middle">${rot}</text>`; }).join(''); })()}
  </svg>`;
}

// Aba "Evolução": gráfico de 14 meses, histórico por rotina e a sugestão de mudar de fase (que a família aprova).
R.abas.relatorio = () => {
  const r = rotinaPorId(R.rotinaRel);
  const lista = S.sessoes.filter((s) => s.rotina === r.id);
  const sug = sugestao(r.id);
  const primeiros = lista.slice(0, 8), ultimos = lista.slice(-8);
  const meses = lista.length ? Math.max(1, Math.round((Date.now() - lista[0].data) / (30.4 * 864e5))) : 0;
  const recentes = S.sessoes.filter((s) => s.rotina === r.id && s.data > Date.now() - 60 * 864e5);
  const porPasso = r.passos.map((p) => {
    const regs = recentes.flatMap((s) => s.passos.filter((x) => x.id === p.id).map((x) => acerto(x, s.fase)));
    return { p, t: regs.length ? Math.round(regs.filter(Boolean).length / regs.length * 100) : null };
  });
  const ultima = lista[lista.length - 1];
  return `
    <h2 style="font-size:20px;margin-bottom:4px">Evolução do Lucas</h2>
    <p class="peq suave" style="margin:0 0 10px">Autonomia se constrói em meses e anos, com idas e vindas. Recuos depois de mudanças são esperados.</p>
    <div class="abas">${S.rotinas.map((x) => `<button data-rel="${x.id}" aria-pressed="${x.id === r.id}">${x.emoji} ${esc(x.nome)}</button>`).join('')}</div>
    <div class="cartao grafico">
      <div class="linha" style="margin-bottom:6px"><b>${meses} meses de acompanhamento</b><span class="espaco"></span><span class="selo">${lista.length} sessões</span></div>
      ${graficoLongo(r.id)}
      <div class="legenda-graf"><span><i style="background:rgba(74,108,240,.32)"></i>Fase 1</span><span><i style="background:rgba(42,157,143,.45)"></i>Fase 2</span><span><i style="background:rgba(42,157,124,.5)"></i>Fase 3</span><span><i style="background:#c27c0e;height:2px"></i>Marcos da vida real</span></div>
    </div>
    <div class="metricas" style="margin-bottom:12px">
      <div class="metrica"><b>${media(primeiros)}%</b><span>primeiras sessões</span></div>
      <div class="metrica"><b>${media(ultimos)}%</b><span>últimas sessões</span></div>
      <div class="metrica"><b>F${faseDe(r.id)}</b><span>fase atual</span></div>
    </div>
    <div class="cartao" style="border-left:4px solid ${sug.tipo === 'avancar' ? 'var(--ok)' : sug.tipo === 'voltar' ? 'var(--ambar)' : 'var(--azul)'}">
      <span class="selo ia">Sugestão da IA</span><p style="margin:8px 0">${esc(sug.texto)}</p>
      ${sug.nova ? (pode('fases') ? `<div class="grade-2"><button class="btn primario" id="rAprovar" data-nova="${sug.nova}">Aprovar fase ${sug.nova}</button><button class="btn" id="rManter">Manter</button></div>
        <p class="peq suave" style="margin:8px 0 0">A IA nunca muda de fase sozinha. Quem decide é você ou a terapeuta.</p>` : '<p class="peq suave">Você não tem permissão para aprovar fases.</p>') : ''}
    </div>
    <div class="titulo-sec">Passo a passo (últimos 60 dias)</div>
    <div class="cartao"><table><tr><th>Passo</th><th>Sem ajuda extra</th></tr>
      ${porPasso.map(({ p, t }) => `<tr><td>${p.emoji} ${esc(preencher(p.curta, 'lanche'))}</td><td>${t === null ? '—' : `<span class="selo ${t >= 80 ? 'ok' : t < 50 ? 'aviso' : ''}">${t}%</span>`}</td></tr>`).join('')}</table>
      ${(() => { const dif = porPasso.filter((x) => x.t !== null && x.t < 60); return dif.length ? `<p class="peq" style="margin:10px 0 0">🔎 <b>Para a terapia:</b> ${dif.map((x) => esc(preencher(x.p.curta, 'lanche').replace(/\.$/, '').toLowerCase())).join(', ')} ainda precisa(m) de apoio.</p>` : ''; })()}
    </div>
    ${ultima ? `<div class="titulo-sec">Última sessão · ${new Date(ultima.data).toLocaleDateString('pt-BR')}</div>
    <div class="cartao"><table><tr><th>Passo</th><th>Ajuda</th><th>Tempo</th><th>Como</th></tr>
      ${ultima.passos.map((p) => `<tr><td>${p.emoji} ${esc(p.titulo)}</td><td>${p.ajuda ? '<span class="selo aviso">pausa</span> ' : ''}${NOME_AJUDA[p.nivel]}</td><td>${p.tempo}s</td><td class="suave">${esc(p.metodo)}</td></tr>`).join('')}</table></div>` : ''}
    <p class="peq suave">Histórico anterior a hoje é fictício (demonstração de 14 meses). As sessões feitas agora entram no gráfico.</p>`;
};


// Seção de rotinas e fases (a família escolhe a fase de cada rotina).
R.abas.rotinas = () => `
  <h2 style="font-size:20px;margin-bottom:10px">Rotinas do Lucas</h2>
  ${S.rotinas.map((r) => `<div class="cartao">
    <div class="linha"><span style="font-size:26px">${r.emoji}</span><div style="flex:1"><b>${esc(r.nome)}</b><br><span class="peq suave">todo dia às ${r.hora}</span></div></div>
    <label class="campo">Fase atual</label>
    <select class="campo-in" data-fase="${r.id}" ${pode('fases') ? '' : 'disabled'}>${[1, 2, 3].map((f) => `<option value="${f}" ${faseDe(r.id) === f ? 'selected' : ''}>Fase ${f} · ${NOME_FASE[f]}</option>`).join('')}</select>
    <div style="margin-top:10px;display:grid;gap:4px">${r.passos.map((p, i) => `<div class="linha peq"><span>${i + 1}. ${p.emoji}</span><span style="flex:1">${esc(preencher(p.normal, '…'))}</span>
      ${p.objeto ? `<span class="selo ia">📷 ${p.objeto === '$escolha' ? 'escolha' : OBJETOS[p.objeto]}</span>` : ''}${p.tipo === 'escolha' ? '<span class="selo">🤔 decisão</span>' : ''}${p.fala ? '<span class="selo">🗣️ CAA</span>' : ''}</div>`).join('')}</div>
  </div>`).join('')}
  <p class="peq suave">A terapeuta (Dra. Júlia) também pode editar as rotinas pela conta dela.</p>`;

// Seção de contas conectadas e permissões de cada pessoa.
R.abas.contas = () => {
  const qr = Array.from({ length: 81 }, (_, i) => { const x = i % 9, y = Math.floor(i / 9); const canto = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
    return `<i class="${canto ? ((x % 6 === 1 && y % 6 === 1) || x % 6 === 0 || x % 6 === 2 || y % 6 === 0 || y % 6 === 2 ? 'p' : '') : ((x * 7 + y * 13) % 5 < 2 ? 'p' : '')}"></i>`; }).join('');
  const editavel = EU === 'ana';
  return `
  <h2 style="font-size:20px;margin-bottom:4px">Contas conectadas</h2>
  <p class="peq suave" style="margin:0 0 12px">O Lucas usa a conta dele com o Lumi. A família e a terapeuta ficam ligadas a ele, cada uma com o que precisa ver.</p>
  <div class="cartao">${S.contas.map((c) => `<div class="conta"><span class="avatar">${c.avatar}</span>
    <div><b>${esc(c.nome)}</b> <span class="peq suave">· ${esc(c.rotulo)}</span>
      <div class="perms">${c.papel === 'paciente' ? '<span class="on">usa o Lumi</span><span class="on">pede SOS</span><span class="on">vê quem acompanha</span>' : PERMISSOES.map((p) => `<span class="${c.permissoes.includes(p.id) ? 'on' : ''}">${p.nome}</span>`).join('')}</div></div>
    <span class="selo ${c.status === 'conectado' ? 'ok' : 'aviso'}">${c.status === 'conectado' ? '● conectado' : 'convite enviado'}</span></div>`).join('')}</div>

  <button class="btn bloco" data-abrir-comparar style="margin-top:4px">👁️ Comparar o que cada conta vê e faz</button>

  <div class="titulo-sec">Permissões</div>
  <div class="cartao" style="overflow-x:auto"><table class="matriz"><tr><th></th>${S.contas.filter((c) => c.papel !== 'paciente').map((c) => `<th>${c.avatar}<br>${esc(c.nome.split(' ').pop())}</th>`).join('')}</tr>
    ${PERMISSOES.map((p) => `<tr><td>${p.nome}</td>${S.contas.filter((c) => c.papel !== 'paciente').map((c) => `<td><input type="checkbox" data-perm="${c.id}|${p.id}" ${c.permissoes.includes(p.id) ? 'checked' : ''} ${editavel && c.id !== EU ? '' : 'disabled'} aria-label="${esc(c.nome)}: ${p.nome}"></td>`).join('')}</tr>`).join('')}</table>
    <p class="peq suave" style="margin:8px 0 0">Só a responsável principal altera permissões. A localização só é compartilhada durante uma emergência.</p></div>

  <div class="titulo-sec">Conectar nova conta</div>
  <div class="cartao">
    <div class="codigo"><div class="qr" aria-hidden="true">${qr}</div><div><span class="peq suave">Código de vínculo do Lucas</span><br><b>LUMI-4821</b><br><span class="peq suave">Válido por 24 h · simulado</span></div></div>
    <label class="campo">Nome</label><input class="campo-in" id="rNovoNome" placeholder="Ex.: Vó Maria">
    <label class="campo">Papel</label><select class="campo-in" id="rNovoPapel"><option value="responsavel">Responsável / familiar</option><option value="terapeuta">Terapeuta</option><option value="escola">Escola / professor(a)</option></select>
    <button class="btn primario bloco" id="rConvidar" style="margin-top:10px">Enviar convite</button>
  </div>
  <div class="cartao peq"><b>Por que contas conectadas?</b>
    <ul style="margin:6px 0 0;padding-left:18px" class="suave">
      <li>Emergência chega a todos os responsáveis ao mesmo tempo, com localização.</li>
      <li>Avisos de mudança chegam antes, pelo Lumi, e evitam crises.</li>
      <li>A terapeuta ajusta as rotinas com dados do dia a dia, não só do consultório.</li>
      <li>Cada um vê só o necessário. O Lucas sabe quem o acompanha.</li>
    </ul></div>`;
};

// Seção de ajustes do perfil do Lucas (voz, aparência, sensores).
R.secaoAjustes = () => {
  const p = S.perfil;
  return `
  <h2 style="font-size:20px;margin-bottom:10px">Ajustes do Lucas</h2>
  <div class="cartao">
    <label class="campo" style="margin-top:0">Nível de suporte (tamanho das frases)</label>
    <div class="opcoes-nivel">${[[1, 'Nível 1', 'explicativas'], [2, 'Nível 2', 'simples'], [3, 'Nível 3', 'até 3 palavras']].map(([v, t, d]) => `<button data-nivel="${v}" class="${p.nivel === v ? 'ativo' : ''}"><b>${t}</b>${d}</button>`).join('')}</div>
    <p class="peq suave" id="rExemplo" style="margin:8px 0 0">Exemplo: "${esc(instrucao(S.rotinas[1].passos[0]))}"</p>
    <label class="campo">Hiperfoco (usado nos elogios e no visual do Lumi)</label><input class="campo-in" id="rHiper" value="${esc(p.hiperfoco)}">
    <label class="campo">Esperar antes de aumentar a ajuda: <span id="rEspV">${p.espera}</span> s</label><input type="range" id="rEsp" min="4" max="30" value="${p.espera}">
    <label class="campo">Velocidade da voz: <span id="rVelV">${p.velocidade}</span></label><input type="range" id="rVel" min="0.6" max="1.3" step="0.05" value="${p.velocidade}">
    <label class="check"><input type="checkbox" data-op="voz" ${p.voz ? 'checked' : ''}> Lumi fala as instruções</label>
    <label class="check"><input type="checkbox" data-op="camera" ${p.camera ? 'checked' : ''}> Câmera reconhece os passos e indica direções</label>
    <label class="check"><input type="checkbox" data-op="ruido" ${p.ruido ? 'checked' : ''}> Sensor de ruído (oferece pausa em lugar barulhento)</label>
    <label class="check"><input type="checkbox" data-op="ouvir" ${p.ouvir ? 'checked' : ''}> Comandos de voz ("pronto", "calma")</label>
  </div>
  <div class="cartao peq suave">🔒 Câmera e microfone só ligam durante uma rotina. A imagem é analisada no aparelho e não é gravada nem enviada.</div>`;
};

// A aba "Mais" é montada por seções; os módulos acrescentam as suas no início com R.secoesMais.unshift(fn)
R.secoesMais = [() => R.secaoAjustes(), () => R.abas.rotinas(), () => R.abas.contas()];
R.abas.ajustes = () => R.secoesMais.map((f) => f()).join('<div style="height:10px"></div>');

// Liga os cliques da aba atual (navegação, SOS, avisos, ajustes) e os ligadores registrados pelos módulos.
R.ligar = () => {
  const q = (s) => $(R.raiz, s);
  R.raiz.querySelectorAll('[data-aba]').forEach((b) => b.onclick = () => { R.aba = b.dataset.aba; R.render(); $(R.raiz, '#rConteudo').scrollTop = 0; });
  R.raiz.querySelectorAll('[data-aviso]').forEach((b) => b.onclick = () => { emitir('aviso', { texto: AVISOS_RAPIDOS[+b.dataset.aviso] }, EU); toast('Aviso enviado ao Lucas.'); });
  R.raiz.querySelectorAll('[data-rel]').forEach((b) => b.onclick = () => { R.rotinaRel = b.dataset.rel; R.render(); });
  q('#rCaminho') && (q('#rCaminho').onclick = () => emitir('a_caminho', { quem: 'Ana' }, EU));
  q('#rLigar') && (q('#rLigar').onclick = () => toast('Chamada simulada para o celular do Lucas.'));
  q('#rResolver') && (q('#rResolver').onclick = () => emitir('sos_resolvido', { quem: 'Ana' }, EU));
  q('#rAprovar') && (q('#rAprovar').onclick = (e) => { emitir('fase_aprovada', { rotina: R.rotinaRel, fase: +e.target.dataset.nova }, EU); toast('Fase aprovada. O Lucas foi avisado pelo Lumi.'); });
  q('#rManter') && (q('#rManter').onclick = () => toast('Fase mantida.'));
  R.raiz.querySelectorAll('[data-fase]').forEach((s) => s.onchange = () => emitir('fase_aprovada', { rotina: s.dataset.fase, fase: +s.value }, EU));
  R.raiz.querySelectorAll('[data-perm]').forEach((c) => c.onchange = () => {
    const [id, perm] = c.dataset.perm.split('|'); const ct = conta(id);
    ct.permissoes = c.checked ? [...new Set([...ct.permissoes, perm])] : ct.permissoes.filter((x) => x !== perm);
    salvar(); R.render();
  });
  q('#rConvidar') && (q('#rConvidar').onclick = () => {
    const nome = q('#rNovoNome').value.trim(); if (!nome) return toast('Escreva o nome.');
    const papel = q('#rNovoPapel').value;
    S.contas.push({ id: 'c' + Date.now(), nome, papel: papel === 'escola' ? 'terapeuta' : papel,
      rotulo: { responsavel: 'Familiar', terapeuta: 'Terapeuta', escola: 'Escola' }[papel], avatar: { responsavel: '🧓', terapeuta: '🧑‍⚕️', escola: '🏫' }[papel],
      status: 'convite', permissoes: papel === 'responsavel' ? ['emergencia', 'aovivo'] : ['relatorio'] });
    salvar(); toast(`Convite enviado para ${nome}.`); R.render();
  });
  R.ligadores.forEach((f) => f());
  R.raiz.querySelectorAll('[data-nivel]').forEach((b) => b.onclick = () => { S.perfil.nivel = +b.dataset.nivel; salvar(); R.render(); });
  q('#rHiper') && (q('#rHiper').onchange = (e) => { S.perfil.hiperfoco = e.target.value.trim(); salvar(); if (P.tela === 'inicio') P.ir('inicio'); });
  q('#rEsp') && (q('#rEsp').oninput = (e) => { S.perfil.espera = +e.target.value; q('#rEspV').textContent = e.target.value; salvar(); });
  q('#rVel') && (q('#rVel').oninput = (e) => { S.perfil.velocidade = +e.target.value; q('#rVelV').textContent = e.target.value; salvar(); });
  R.raiz.querySelectorAll('[data-op]').forEach((c) => c.onchange = () => { S.perfil[c.dataset.op] = c.checked; salvar(); });
};

// Reação a eventos das outras contas: redesenha a tela e conta mensagens não lidas.
R.receber = (ev) => {
  if (ev.tipo === 'sos') { R.aba = 'inicio'; bipe(); if (telaMovel() === 'paciente') document.getElementById('pontoAlerta').hidden = false; }
  if (ev.de === 'lucas' && ev.tipo !== 'progresso' && R.aba !== 'inicio') R.naoLidos++;
  // Não redesenha enquanto a Ana digita num campo
  const foco = document.activeElement;
  if (foco && R.raiz.contains(foco) && /INPUT|SELECT/.test(foco.tagName) && ev.tipo === 'progresso') return;
  R.render();
};

