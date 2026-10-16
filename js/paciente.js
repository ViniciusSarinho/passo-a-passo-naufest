/* ============================================================================
   CONTA DO PACIENTE (Lucas)
   Telas do celular dele: início, rotinas, história social, modo guia (câmera,
   microfone, desvanecimento de dicas), SOS, calma e conquistas.
   Telas de outros módulos (conversar, meu jeito) são acrescentadas a P.telas.
   ============================================================================ */
const P = {
  raiz: document.getElementById('telaPaciente'),
  tela: 'inicio',
  humor: null,
  g: null,
  ganchosInicio: [], // funções que os módulos registram para acrescentar itens à tela inicial
};

P.moldura = (conteudo, extra = '') => {
  P.raiz.innerHTML = `<div class="status"><span>${hora()}</span><span>🤖 Lumi · 📶 🔋</span></div>
    <div class="conteudo" id="pConteudo">${conteudo}</div>${extra}`;
};
P.ir = (tela, ...args) => {
  if (P.tela === 'guia' && tela !== 'guia') {
    if (P.g) emitir('encerrou', { rotina: P.g.rotina.nome });
    P.pararGuia();
  }
  P.tela = tela;
  pararFala();
  (P.telas[tela] || P.telas.inicio)(...args);
  const c = document.getElementById('pConteudo'); if (c) c.scrollTop = 0;
};

P.cabecalho = (titulo) => `
  <div class="topo-paciente">
    ${titulo ? `<button class="btn" data-p="inicio" style="min-height:40px;padding:6px 12px">←</button><b style="font-size:17px">${titulo}</b>` : `<span class="ola">Oi, ${esc(S.perfil.nome)}! 👋</span>`}
    <span class="espaco"></span>
    <button class="btn-sos" data-sos><span class="carga"></span><span style="position:relative">🆘 SOS</span></button>
  </div>`;

P.lumi = (humor, fala, sub = '', tamanho = 118) => {
  const nv = lumiNivel(S.pet.estrelas);
  return `<div class="lumi-palco">${lumiSVG({ humor, acessorios: nv.acessorios, tamanho, hiperfoco: S.perfil.hiperfoco })}
    ${fala !== null ? `<div class="balao" id="pBalao">${esc(fala)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>` : ''}</div>`;
};

P.telas = {};

P.telas.inicio = () => {
  const nv = lumiNivel(S.pet.estrelas);
  const agenda = [...S.rotinas].sort((a, b) => a.hora.localeCompare(b.hora));
  const agora = new Date().toTimeString().slice(0, 5);
  const prox = agenda.find((r) => r.hora >= agora) || agenda[0];
  const quem = S.contas.filter((c) => c.papel !== 'paciente' && c.status === 'conectado').map((c) => c.nome);
  P.moldura(`
    ${P.cabecalho()}
    ${P.lumi('feliz', `Hoje temos ${agenda.length} tarefas. A próxima é ${prox.nome.toLowerCase()}, às ${prox.hora}.`, S.perfil.anteciparMudancas ? 'Se algo mudar hoje, eu te aviso antes. Toque numa tarefa para ver como vai ser.' : 'Toque numa tarefa para ver como vai ser.')}
    <div class="cartao" style="margin-top:-6px">
      <div class="linha"><b>${esc(nv.nome)}</b><span class="espaco"></span><span class="selo ia">⭐ ${S.pet.estrelas}</span></div>
      <div class="xp" style="margin:8px 0 6px"><div style="width:${Math.round(nv.progresso * 100)}%"></div></div>
      <div class="peq suave">${nv.proximo ? `Faltam ${nv.proximo.estrelas - S.pet.estrelas} ⭐ para o próximo nível: <b>${esc(nv.proximo.nome)}</b>.` : 'O Lumi chegou ao nível máximo!'}</div>
    </div>

    <div class="titulo-sec">Minha agenda de hoje</div>
    <div class="agenda">${agenda.map((r) => `
      <button class="item ${r.id === prox.id ? 'agora' : ''}" data-rotina="${r.id}">
        <span class="hora">${r.hora}</span><span class="emo">${r.emoji}</span>
        <span><b>${esc(r.nome)}</b><br><span class="peq suave">${r.passos.length} passos · fase ${faseDe(r.id)}</span></span>
        <span class="selo ${r.id === prox.id ? 'ia' : ''}">${r.id === prox.id ? 'Próxima' : '›'}</span>
      </button>`).join('')}</div>

    <div class="titulo-sec">Como você está agora?</div>
    <div class="humores">${[['😊', 'Bem'], ['😐', 'Mais ou menos'], ['😣', 'Nervoso'], ['😴', 'Cansado']].map(([e, t]) =>
      `<button data-humor="${e}|${t}" class="${P.humor === e ? 'ativo' : ''}">${e}<small>${t}</small></button>`).join('')}</div>

    <div class="titulo-sec">Atalhos</div>
    <div class="grade-2">
      <button class="atalho" data-p="respirar"><span>🫧</span><b>Respirar</b><small>Um minuto de calma</small></button>
      <button class="atalho" data-p="cartao"><span>🪪</span><b>Cartão de ajuda</b><small>Mostrar a alguém</small></button>
      <button class="atalho" data-p="acompanham"><span>👥</span><b>Quem me acompanha</b><small>${esc(quem.join(', '))}</small></button>
    </div>
  `);
  P.ganchosInicio.forEach((f) => f());
};

// Trilha gamificada: passos feitos viram estrela, o atual mostra a figura, o fim é a bandeira.
// Só se ganha: não há tempo-limite, placar nem perda de estrelas.
P.trilha = (r, atual) => r.passos.map((p, i) => `<span class="${i < atual ? 'feito' : i === atual ? 'agora' : ''}" title="${esc(p.curta)}">${i < atual ? '⭐' : p.emoji}</span>`).join('') + '<span class="fim">🏁</span>';

P.telas.rotina = (rid) => {
  const r = rotinaPorId(rid);
  P.moldura(`
    ${P.cabecalho(r.nome)}
    ${P.lumi('atento', `Vamos ${r.objetivo}? São ${r.passos.length} passos.`, `Hoje estamos na fase ${faseDe(r.id)}: ${NOME_FASE[faseDe(r.id)].toLowerCase()}.`)}
    <div class="cartao"><b class="peq">Sua trilha de hoje</b><div class="trilha-passos" aria-label="${r.passos.map((p, i) => `${i + 1}. ${p.curta}`).join('; ')}">${P.trilha(r, -1)}</div>
      <p class="peq suave" style="margin:4px 0 0">Cada passo vale uma ⭐. Sem pressa: dá para pausar quando quiser.</p></div>
    ${S.perfil.historiaAntes ? '' : `<button class="btn bloco" data-historia="${r.id}" style="margin-bottom:8px">📖 Ver como vai ser (história)</button>`}
    ${S.perfil.historiaAntes ? `<button class="btn primario bloco grande" data-historia="${r.id}">▶ Começar (história primeiro)</button>
      <p class="peq suave" style="text-align:center;margin:6px 0 0"><span class="selo ia">IA</span> Aprendi que ver a história antes ajuda você.</p>` : `<button class="btn primario bloco grande" data-guia="${r.id}">▶ Começar com o Lumi</button>`}
    <p class="peq suave" style="text-align:center">📷 A câmera e o microfone só ligam agora, e nada é gravado.</p>
  `);
};

P.telas.historia = (rid) => {
  const r = rotinaPorId(rid);
  const curto = S.perfil.nivel >= 3;
  const con = ['Primeiro, eu', 'Depois, eu', 'Então, eu', 'Em seguida, eu', 'Agora, eu', 'Depois, eu'];
  const quadros = [{ emoji: r.emoji, frase: curto ? `Hoje: ${r.nome.toLowerCase()}.` : `Hoje eu vou ${r.objetivo}${r.lugar ? ' ' + r.lugar : ''}.` }];
  r.passos.forEach((p, i) => quadros.push({ emoji: p.emoji, frase: curto ? preencher(p.curta, 'lanche') : `${i === r.passos.length - 1 ? 'Por fim, eu' : con[Math.min(i, con.length - 1)]} ${p.historia}.` }));
  quadros.push({ emoji: '🫶', frase: curto ? 'Difícil? Botão de calma.' : 'Se ficar difícil, tudo bem. Posso apertar "calma" e respirar com o Lumi.' });
  quadros.push({ emoji: '⭐', frase: curto ? 'Pronto. Muito bem!' : 'Quando terminar, eu e o Lumi ganhamos estrelas!' });
  let i = 0;
  const desenhar = () => {
    const q = quadros[i];
    P.moldura(`
      ${P.cabecalho('História social')}
      ${P.lumi('falando', null, '', 80)}
      <div class="cartao historia-quadro"><div class="emo">${q.emoji}</div><div class="frase">${esc(q.frase)}</div></div>
      <div class="pontos">${quadros.map((_, k) => `<span class="${k === i ? 'ativo' : ''}"></span>`).join('')}</div>
      <div class="linha" style="justify-content:center">
        <button class="btn" id="hAnt" ${i === 0 ? 'disabled' : ''}>←</button>
        <button class="btn" id="hRep">🔊 Repetir</button>
        ${i < quadros.length - 1 ? '<button class="btn primario" id="hProx">Próximo →</button>' : `<button class="btn primario" data-guia="${r.id}">Estou pronto ▶</button>`}
      </div>
      <p class="peq suave" style="text-align:center"><span class="selo ia">IA</span> texto adaptado ao nível ${S.perfil.nivel} de suporte</p>`);
    falar(q.frase);
    $(P.raiz, '#hAnt').onclick = () => { i--; desenhar(); };
    $(P.raiz, '#hRep').onclick = () => falar(q.frase);
    const pr = $(P.raiz, '#hProx'); if (pr) pr.onclick = () => { i++; desenhar(); };
  };
  desenhar();
};

P.telas.respirar = () => {
  P.moldura(`${P.cabecalho('Respirar')}
    <div style="display:grid;place-items:center;gap:14px;padding-top:10px">
      ${lumiSVG({ humor: 'calmo', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 130, hiperfoco: S.perfil.hiperfoco })}
      <div class="respira">respire</div>
      <p class="suave" style="text-align:center">Puxe o ar quando o círculo crescer.<br>Solte quando ele diminuir.</p>
    </div>`);
  falar('Vamos respirar juntos. Puxa o ar devagar... e solta.');
};

P.telas.cartao = () => {
  const mae = conta('ana');
  P.moldura(`${P.cabecalho('Cartão de ajuda')}
    <div class="cartao destaque" style="text-align:center;padding:22px">
      <div style="font-size:44px">🪪</div>
      <h2 style="font-size:22px;margin:8px 0">Meu nome é ${esc(S.perfil.nome)}.</h2>
      <p style="font-size:18px;margin:0 0 10px">Sou autista. Às vezes tenho dificuldade para falar quando fico nervoso.</p>
      <p style="font-size:18px;margin:0 0 10px">Por favor, fale devagar e com calma.</p>
      <p style="font-size:16px" class="suave">Se eu precisar de ajuda, ligue para ${esc(mae?.nome || 'minha família')}: <b style="color:var(--texto)">(11) 90000-0000</b></p>
    </div>
    <button class="btn bloco" data-falar="Meu nome é ${esc(S.perfil.nome)}. Sou autista. Por favor, fale devagar e com calma.">🔊 Ler o cartão em voz alta</button>
    <p class="peq suave" style="text-align:center">Telefone fictício da demonstração.</p>`);
};

P.telas.acompanham = () => {
  P.moldura(`${P.cabecalho('Quem me acompanha')}
    ${P.lumi('feliz', 'Estas pessoas recebem seus avisos e torcem por você.', 'Você sempre pode ver quem está conectado.', 90)}
    <div class="cartao">${S.contas.filter((c) => c.papel !== 'paciente').map((c) => `
      <div class="conta"><span class="avatar">${c.avatar}</span><div><b>${esc(c.nome)}</b><br><span class="peq suave">${esc(c.rotulo)}</span></div>
      <span class="selo ${c.status === 'conectado' ? 'ok' : 'aviso'}">${c.status === 'conectado' ? 'conectado' : 'convite'}</span></div>`).join('')}</div>`);
};

// ---------- Modo guia ----------
P.telas.guia = (rid) => {
  const r = rotinaPorId(rid);
  const fase = faseDe(r.id);
  P.g = { rotina: r, fase, idx: 0, nivel: 0, inicio: 0, timer: null, pausado: false, concluindo: false, escolha: null,
    sessao: { data: Date.now(), rotina: r.id, fase, passos: [] }, vistos: 0, stream: null, laco: null, rec: null,
    audio: null, ruidoAlto: 0, avisouRuido: false, frontal: false, ultimaPos: null, estrelas: 0 };
  P.moldura(`
    <div class="guia-topo">
      <span class="selo ia">Fase ${fase} · ${NOME_FASE[fase]}</span><span class="espaco"></span>
      <button class="btn" id="gSair" style="min-height:38px;padding:6px 12px;font-size:13px">Encerrar</button>
      <button class="btn-sos" data-sos><span class="carga"></span><span style="position:relative">🆘</span></button>
    </div>
    <div class="progresso"><div id="gBarra" style="width:0%"></div></div>
    <div class="trilha-passos" id="gTrilha" aria-hidden="true"></div>
    <div id="gLumi"></div>
    <div class="passo-card" id="gPasso"></div>
    <div id="gAcoes"></div>
    ${S.perfil.camera ? `<div class="camera"><video id="gVideo" playsinline muted></video><canvas id="gTela"></canvas>
      <div class="espacial" id="gEspacial"></div><div class="rotulo" id="gRotulo">Ligando a câmera…</div></div>` : ''}
    <div class="sensores" id="gSensores"></div>
  `);
  $(P.raiz, '#gSair').onclick = () => P.finalizar(true);
  emitir('inicio', { rotina: r.nome, rotinaId: r.id, fase });
  if (S.perfil.camera) P.ligarCamera();
  if (S.perfil.ruido) P.ligarRuido();
  if (S.perfil.ouvir) P.ligarEscuta();
  P.iniciarPasso();
};

P.passo = () => {
  const p = P.g.rotina.passos[P.g.idx];
  if (p.objeto === '$escolha') return { ...p, objeto: P.g.escolha?.objeto || null };
  return p;
};

P.iniciarPasso = () => {
  const g = P.g;
  g.inicio = Date.now(); g.concluindo = false; g.vistos = 0; g.repeticoes = 0; g.silencio = false; g.ultimaPos = null; g.ajudaNoPasso = false;
  g.nivel = nivelInicial(g.fase);
  $(P.raiz, '#gBarra').style.width = (g.idx / g.rotina.passos.length) * 100 + '%';
  $(P.raiz, '#gTrilha').innerHTML = P.trilha(g.rotina, g.idx);
  emitir('progresso', { rotina: g.rotina.nome, rotinaId: g.rotina.id, passo: g.idx + 1, total: g.rotina.passos.length,
    titulo: preencher(P.passo().curta, g.escolha?.frase), fase: g.fase, nivel: g.nivel });
  P.mostrarDica(true);
  P.agendar();
};

P.mostrarDica = (falarAgora) => {
  const g = P.g, p = P.passo();
  const esc2 = g.escolha?.frase;
  let fala = '', humor = 'atento', sub = '';
  if (g.nivel === 2) { fala = instrucao(p, esc2); humor = 'falando'; sub = 'O Lumi está explicando.'; }
  else if (g.nivel === 1) { fala = pergunta(p, esc2); humor = 'atento'; sub = 'Você sabe a resposta.'; }
  else { humor = 'observando'; }
  // Noção espacial: se a câmera já viu o objeto, a instrução diz onde ele está.
  if (g.nivel === 2 && g.ultimaPos && p.objeto) fala += ` ${g.ultimaPos}.`;
  if (g.nivel === 2 && S.perfil.calmaCedo && g.nivel > nivelInicial(g.fase)) fala += ' Se ficar difícil, aperte calma.';
  $(P.raiz, '#gLumi').innerHTML = P.lumi(humor, g.nivel === 0 ? 'Estou aqui, só olhando. Você sabe o que fazer. 👀' : fala, g.nivel === 0 ? 'Modo silêncio: só ajudo se você precisar.' : sub, 96);
  $(P.raiz, '#gPasso').innerHTML = `<div class="peq suave">Passo ${g.idx + 1} de ${g.rotina.passos.length}</div>
    <div class="emo" style="${S.perfil.pictogramas ? 'font-size:84px' : ''}">${p.emoji}</div><b style="font-size:18px">${esc(preencher(p.curta, esc2))}</b>
    <div class="estado">${p.objeto && S.perfil.camera ? `📷 Confirmo quando a câmera vir: <b>${OBJETOS[p.objeto] || p.objeto}</b>` : p.tipo === 'escolha' ? '🤔 Escolha uma opção' : 'Aperte "Fiz" ou diga "pronto"'}</div>`;
  let acoes = '';
  if (p.tipo === 'escolha') {
    acoes = `<div class="opcoes-escolha">${p.opcoes.map((o, i) => `<button data-escolha="${i}"><span>${o.emoji}</span>${esc(o.texto)}</button>`).join('')}</div>`;
  }
  if (p.fala) acoes += `<button class="btn bloco ${S.perfil.caaCedo ? 'primario' : ''}" data-falar="${esc(preencher(p.fala, esc2))}" style="margin-top:10px">🗣️ Falar por mim: "${esc(preencher(p.fala, esc2))}"</button>`;
  acoes += `<div class="acoes-guia">${p.tipo === 'escolha' ? '<span></span>' : '<button class="btn ok grande" id="gFiz">✓ Fiz</button>'}<button class="btn calma grande" id="gCalma">🫧 Calma</button></div>`;
  $(P.raiz, '#gAcoes').innerHTML = acoes;
  const fiz = $(P.raiz, '#gFiz'); if (fiz) fiz.onclick = () => P.concluir('toque');
  $(P.raiz, '#gCalma').onclick = P.calma;
  P.raiz.querySelectorAll('[data-escolha]').forEach((b) => b.onclick = () => {
    const o = p.opcoes[+b.dataset.escolha];
    g.escolha = o;
    falar(`${o.texto}. Boa escolha!`);
    P.concluir('escolha: ' + o.texto.toLowerCase());
  });
  if (falarAgora && fala) falar(fala);
};

// Quanto mais o Lumi repete a instrução, mais ele espera: depois de 3 repetições o intervalo dobra a cada
// vez (até 8x, no máximo 2 min). Após 6 repetições ele fica em silêncio, sem pressionar, e só volta a
// falar quando mudar de passo ou voltar da calma/SOS.
P.REPETICOES_MAX = 6;
P.espera = (g) => {
  const r = g.repeticoes || 0, fator = r < 3 ? 1 : Math.min(2 ** (r - 2), 8);
  return Math.min(S.perfil.espera * fator * 1000, 120000);
};
P.agendar = () => {
  const g = P.g;
  clearTimeout(g.timer);
  g.timer = setTimeout(() => {
    if (!P.g || g.pausado) return;
    if (g.nivel < 2) { g.nivel++; P.mostrarDica(true); emitir('progresso', { ...S.aoVivo, nivel: g.nivel }); }
    else if ((g.repeticoes || 0) < P.REPETICOES_MAX) {
      g.repeticoes = (g.repeticoes || 0) + 1;
      falar(instrucao(P.passo(), g.escolha?.frase) + (g.ultimaPos ? ` ${g.ultimaPos}.` : ''));
    } else {
      // já repetiu bastante: para de falar e deixa um recado calmo na tela
      g.silencio = true;
      $(P.raiz, '#gLumi').innerHTML = P.lumi('calmo', 'Sem pressa. Quando quiser, toque em "Fiz" ou em "Calma". Estou aqui.', 'O Lumi parou de repetir.', 96);
      return;
    }
    P.agendar();
  }, P.espera(g));
};

P.concluir = (metodo) => {
  const g = P.g;
  if (!g || g.concluindo || g.pausado) return;
  g.concluindo = true;
  clearTimeout(g.timer);
  const p = P.passo();
  const reg = { id: p.id, emoji: p.emoji, titulo: preencher(p.curta, g.escolha?.frase), nivel: g.nivel,
    tempo: Math.round((Date.now() - g.inicio) / 1000), metodo, ajuda: !!g.ajudaNoPasso };
  g.sessao.passos.push(reg);
  const ok = acerto(reg, g.fase);
  if (ok) g.estrelas++;
  const txt = elogio(ok, g.fase);
  $(P.raiz, '#gLumi').innerHTML = P.lumi(ok ? 'comemorando' : 'feliz', txt, ok ? '+1 ⭐' : '', 96);
  $(P.raiz, '#gAcoes').innerHTML = '';
  falar(txt);
  setTimeout(() => {
    if (P.tela !== 'guia' || P.g !== g) return;
    g.idx++;
    if (g.idx >= g.rotina.passos.length) P.finalizar(false);
    else P.iniciarPasso();
  }, ok && g.fase > 1 ? 2800 : 1700);
};

P.calma = () => {
  const g = P.g;
  if (g) { g.pausado = true; g.ajudaNoPasso = true; clearTimeout(g.timer); }
  emitir('calma', { rotina: g?.rotina.nome });
  const ov = document.createElement('div');
  ov.className = 'sobreposicao'; ov.id = 'pCalma';
  ov.innerHTML = `${lumiSVG({ humor: 'calmo', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 110, hiperfoco: S.perfil.hiperfoco })}
    <h2>Tudo bem. Vamos respirar juntos.</h2><div class="respira">respire</div>
    <p class="peq suave">📩 A Ana foi avisada de que você pediu uma pausa.</p>
    <button class="btn primario bloco" id="cVoltar">Estou melhor, continuar</button>
    <button class="btn bloco" id="cParar">Parar por hoje</button>`;
  P.raiz.appendChild(ov);
  if (S.perfil.calmaHiperfoco) falar(`Tudo bem. Sabia que alguns ${S.perfil.hiperfoco || 'dinossauros'} eram calmos e lentos? Vamos respirar devagar, como eles.`);
  else if (!S.perfil.calmaSilenciosa) falar('Tudo bem. Vamos respirar juntos. Puxa o ar devagar... e solta.');
  $(ov, '#cVoltar').onclick = () => { ov.remove(); if (P.g) { P.g.pausado = false; P.g.nivel = 2; P.g.repeticoes = 0; P.g.silencio = false; P.mostrarDica(true); P.agendar(); } };
  $(ov, '#cParar').onclick = () => { ov.remove(); if (P.g) { P.g.pausado = false; P.finalizar(true); } else P.ir('inicio'); };
};

P.finalizar = (interrompido) => {
  const g = P.g;
  if (!g) return P.ir('inicio');
  P.pararGuia();
  if (!g.sessao.passos.length) { emitir('encerrou', { rotina: g.rotina.nome }); return P.ir('inicio'); }
  S.sessoes.push(g.sessao);
  const antes = lumiNivel(S.pet.estrelas);
  const bonus = interrompido ? 0 : 2;
  S.pet.estrelas += g.estrelas + bonus;
  const depois = lumiNivel(S.pet.estrelas);
  salvar();
  const t = taxa(g.sessao);
  emitir(interrompido ? 'encerrou' : 'conclusao', { rotina: g.rotina.nome, rotinaId: g.rotina.id, taxa: t, estrelas: g.estrelas + bonus, subiu: depois.indice > antes.indice ? depois.texto : null });
  P.tela = 'conquista';
  const subiu = depois.indice > antes.indice;
  P.moldura(`
    <div style="text-align:center;padding-top:12px">
      ${lumiSVG({ humor: 'comemorando', acessorios: depois.acessorios, tamanho: 170, hiperfoco: S.perfil.hiperfoco })}
      <h2 style="font-size:24px;margin:6px 0">${interrompido ? 'Você tentou, e isso conta!' : 'Tarefa concluída!'}</h2>
      <p class="suave" style="margin:0 0 12px">${esc(g.rotina.nome)} · ${g.sessao.passos.length} passos</p>
      <div class="cartao destaque"><b style="font-size:26px">+${g.estrelas + bonus} ⭐</b>
        <div class="xp" style="margin:10px 0 6px"><div style="width:${Math.round(depois.progresso * 100)}%"></div></div>
        <div class="peq suave">${esc(depois.nome)} · ${S.pet.estrelas} ⭐</div></div>
      ${subiu ? `<div class="cartao" style="border-color:var(--ciano)"><b>🎉 O Lumi evoluiu!</b><br><span class="suave">${esc(depois.texto)}.</span></div>` : ''}
      <div class="cartao" style="text-align:left">${g.sessao.passos.map((p) => `<div class="linha" style="padding:4px 0"><span>${p.emoji}</span><span style="flex:1">${esc(p.titulo)}</span>
        <span class="selo ${acerto(p, g.fase) ? 'ok' : ''}">${acerto(p, g.fase) ? '⭐ ' : ''}${NOME_AJUDA[p.nivel]}</span></div>`).join('')}</div>
      <button class="btn primario bloco" data-p="inicio">Voltar ao início</button>
    </div>`);
  falar(subiu ? `Uau! O Lumi evoluiu e ${depois.texto.toLowerCase()}!` : interrompido ? 'Você tentou, e isso conta. Amanhã a gente tenta de novo.' : `Muito bem, ${S.perfil.nome}! Tarefa concluída.`);
};

P.pararGuia = () => {
  const g = P.g;
  if (!g) return;
  clearTimeout(g.timer); clearTimeout(g.laco);
  g.stream?.getTracks().forEach((t) => t.stop());
  if (g.audio) { g.audio.stream.getTracks().forEach((t) => t.stop()); g.audio.ctx.close().catch(() => {}); clearInterval(g.audio.laco); }
  if (g.rec) { g.rec.onend = null; try { g.rec.stop(); } catch (e) {} }
  P.g = null;
  pararFala();
};

// Visão computacional (COCO-SSD no navegador)
function carregarScript(src) {
  return new Promise((ok, erro) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = erro; document.head.appendChild(s);
  });
}
let promessaModelo = null, modelo = null;
function carregarModelo() {
  if (!promessaModelo) promessaModelo = (async () => {
    await carregarScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
    await carregarScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
    modelo = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
  })().catch((e) => { promessaModelo = null; throw e; });
  return promessaModelo;
}

P.ligarCamera = async () => {
  const g = P.g, rot = $(P.raiz, '#gRotulo'), video = $(P.raiz, '#gVideo');
  try {
    g.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640, height: 480 }, audio: false });
    if (P.g !== g) { g.stream.getTracks().forEach((t) => t.stop()); return; }
    const conf = g.stream.getVideoTracks()[0].getSettings();
    g.frontal = conf.facingMode ? conf.facingMode === 'user' : !/Android|iPhone|iPad/i.test(navigator.userAgent);
    video.srcObject = g.stream; await video.play();
  } catch (e) { rot.textContent = 'Câmera indisponível aqui. Use "Fiz" ou a voz.'; return; }
  try { if (!modelo) { rot.textContent = 'Carregando a visão da IA…'; await carregarModelo(); } }
  catch (e) { rot.textContent = 'Não consegui carregar a visão da IA. Use "Fiz".'; return; }
  P.detectar();
};

P.detectar = async () => {
  const g = P.g;
  const video = $(P.raiz, '#gVideo'), tela = $(P.raiz, '#gTela');
  if (!g || !video || !g.stream) return;
  if (video.readyState >= 2 && !g.pausado) {
    const preds = await modelo.detect(video, 6, 0.5);
    if (P.g !== g || !tela.isConnected) return;
    const W = video.videoWidth, H = video.videoHeight;
    tela.width = W; tela.height = H;
    const ctx = tela.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const p = P.passo();
    const nomes = [];
    let alvo = null;
    preds.forEach((d) => {
      const [x, y, w, h] = d.bbox, eAlvo = p.objeto && d.class === p.objeto;
      if (eAlvo && (!alvo || d.score > alvo.score)) alvo = d;
      ctx.strokeStyle = eAlvo ? '#2a9d7c' : '#2a9d8f'; ctx.lineWidth = eAlvo ? 5 : 2; ctx.strokeRect(x, y, w, h);
      const n = OBJETOS[d.class] || d.class;
      nomes.push(`${n} ${Math.round(d.score * 100)}%`);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = eAlvo ? '#2a9d7c' : '#2a9d8f'; ctx.fillRect(x, y - 24, ctx.measureText(n).width + 14, 24);
      ctx.fillStyle = '#ffffff'; ctx.fillText(n, x + 7, y - 6);
    });
    $(P.raiz, '#gRotulo').textContent = nomes.length ? 'A IA vê: ' + nomes.join(', ') : 'A IA está observando…';
    // Noção espacial: lado e distância do objeto em relação à pessoa
    const chip = $(P.raiz, '#gEspacial');
    if (alvo) {
      const [x, , w, h] = alvo.bbox;
      let cx = (x + w / 2) / W; if (g.frontal) cx = 1 - cx;
      const area = (w * h) / (W * H);
      const lado = cx < 0.36 ? 'à sua esquerda' : cx > 0.64 ? 'à sua direita' : 'bem na sua frente';
      const dist = area > 0.22 ? 'pertinho' : area < 0.05 ? 'mais longe' : '';
      // A fala diz só o lado (frase fixa, que pode ser gravada); a tela mostra também a distância
      g.ultimaPos = frasePosicao(p.objeto, lado);
      chip.style.display = 'block'; chip.textContent = '📍 ' + g.ultimaPos + (dist ? ', ' + dist : '');
    } else chip.style.display = 'none';
    if (alvo && alvo.score > 0.55 && !g.concluindo && Date.now() - g.inicio > 1500) {
      g.vistos++;
      if (g.vistos >= 3) P.concluir('câmera');
    } else g.vistos = 0;
  }
  g.laco = setTimeout(P.detectar, 300);
};

// Sensor de ruído: avisa e oferece pausa quando o ambiente fica barulhento (regulação sensorial).
P.ligarRuido = async () => {
  const g = P.g, box = $(P.raiz, '#gSensores');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (P.g !== g) { stream.getTracks().forEach((t) => t.stop()); return; }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const an = ctx.createAnalyser(); an.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(an);
    const dados = new Uint8Array(an.fftSize);
    box.insertAdjacentHTML('beforeend', `<span class="selo medidor">🔊 Ruído <span class="barra-ruido"><div id="gRuido"></div></span></span>`);
    g.audio = { ctx, stream, laco: setInterval(() => {
      an.getByteTimeDomainData(dados);
      let soma = 0; for (const v of dados) soma += ((v - 128) / 128) ** 2;
      const nivel = Math.min(100, Math.round(Math.sqrt(soma / dados.length) * 400));
      const b = $(P.raiz, '#gRuido'); if (!b) return;
      const lim = S.perfil.ruidoLimite || 70;
      b.style.width = nivel + '%'; b.style.background = nivel > lim ? 'var(--perigo)' : nivel > lim * .65 ? 'var(--ambar)' : 'var(--ok)';
      g.ruidoAlto = nivel > lim ? g.ruidoAlto + 1 : 0;
      if (g.ruidoAlto > 12 && !g.avisouRuido && !g.pausado) {
        g.avisouRuido = true;
        P.banner('🔇', 'Está barulhento aqui. Quer colocar o abafador ou respirar comigo um pouco?');
        emitir('barulho', { rotina: g.rotina.nome });
      }
    }, 200) };
  } catch (e) { box.insertAdjacentHTML('beforeend', '<span class="selo">🔇 Microfone indisponível</span>'); }
};

P.ligarEscuta = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  const g = P.g, rec = new SR();
  rec.lang = 'pt-BR'; rec.continuous = true;
  rec.onresult = (e) => {
    const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
    if (/calma|pausa|não consigo/.test(t)) P.calma();
    else if (/pronto|fiz|terminei|consegui|feito/.test(t) && P.passo().tipo !== 'escolha') P.concluir('voz');
  };
  rec.onerror = () => {};
  rec.onend = () => { if (P.g === g) try { rec.start(); } catch (e) {} };
  try { rec.start(); g.rec = rec; $(P.raiz, '#gSensores').insertAdjacentHTML('afterbegin', '<span class="selo">🎙️ Diga "pronto" ou "calma"</span>'); } catch (e) {}
};

// ---------- Emergência (SOS) ----------
P.sos = async () => {
  if (S.alerta) return P.telaSos();
  const g = P.g;
  if (g) { g.pausado = true; clearTimeout(g.timer); }
  const contexto = g ? `${g.rotina.nome}, passo ${g.idx + 1} de ${g.rotina.passos.length}` : 'Fora de uma rotina';
  let local = { texto: 'Padaria Pão Dourado · R. das Flores, 120 (simulado)', precisao: null };
  // No roteiro guiado não pedimos a localização do jurado: usamos o endereço fictício
  if (!ROTEIRO.ativo) try {
    const pos = await new Promise((ok, erro) => navigator.geolocation.getCurrentPosition(ok, erro, { timeout: 4000, maximumAge: 60000 }));
    local = { texto: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`, precisao: Math.round(pos.coords.accuracy) };
  } catch (e) {}
  emitir('sos', { local, contexto });
  P.telaSos();
};
P.telaSos = () => {
  $(P.raiz, '#pSos')?.remove();
  const a = S.alerta;
  if (!a) return;
  const avisados = S.contas.filter((c) => c.permissoes.includes('emergencia')).map((c) => c.nome);
  const ov = document.createElement('div');
  ov.className = 'sobreposicao sos'; ov.id = 'pSos';
  ov.innerHTML = `${lumiSVG({ humor: 'calmo', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 110, hiperfoco: S.perfil.hiperfoco })}
    <h2>${a.aCaminho ? `🚗 ${esc(a.aCaminho)} está a caminho!` : 'Pedi ajuda para você.'}</h2>
    <p style="margin:0">Avisei: <b>${esc(avisados.join(' e '))}</b>.<br>Fique onde está. Você está seguro comigo.</p>
    <span class="selo ok">📍 Localização enviada</span>
    <button class="btn bloco" data-p-ov="cartao">🪪 Mostrar meu cartão a alguém</button>
    <button class="btn bloco" data-p-ov="respirar">🫧 Respirar com o Lumi</button>
    <button class="btn bloco" id="sBem">✅ Estou bem agora</button>`;
  P.raiz.appendChild(ov);
  falar(a.aCaminho ? `${a.aCaminho} está a caminho. Fique onde está. Você está seguro.` : `Pedi ajuda. Avisei ${avisados.join(' e ')}. Fique onde está. Você está seguro comigo.`, true);
  $(ov, '#sBem').onclick = () => { emitir('sos_resolvido', { quem: S.perfil.nome }); ov.remove(); if (P.g) { P.g.pausado = false; P.g.repeticoes = 0; P.g.silencio = false; P.mostrarDica(true); P.agendar(); } };
  ov.querySelectorAll('[data-p-ov]').forEach((b) => b.onclick = () => { ov.remove(); P.ir(b.dataset.pOv); });
};

// Botão SOS: precisa segurar 1,5 s (evita toque sem querer). Pelo teclado, pede confirmação.
let sosTimer = null;
P.raiz.addEventListener('pointerdown', (e) => {
  const b = e.target.closest('[data-sos]'); if (!b) return;
  b.classList.add('segurando');
  sosTimer = setTimeout(() => { b.classList.remove('segurando'); sosTimer = null; P.sos(); }, 1500);
});
['pointerup', 'pointerleave', 'pointercancel'].forEach((tipo) => P.raiz.addEventListener(tipo, (e) => {
  const b = e.target.closest?.('[data-sos]'); if (!b || !sosTimer) return;
  clearTimeout(sosTimer); sosTimer = null; b.classList.remove('segurando');
  if (tipo === 'pointerup') toast('Para pedir ajuda urgente, segure o botão SOS.');
}, true));
P.raiz.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-sos]')) { e.preventDefault(); if (confirm('Pedir ajuda urgente aos responsáveis?')) P.sos(); }
});

P.raiz.addEventListener('click', (e) => {
  const t = e.target.closest('[data-p],[data-rotina],[data-historia],[data-guia],[data-falar],[data-humor]');
  if (!t) return;
  if (t.dataset.p) P.ir(t.dataset.p);
  else if (t.dataset.rotina) P.ir('rotina', t.dataset.rotina);
  else if (t.dataset.historia) P.ir('historia', t.dataset.historia);
  else if (t.dataset.guia) P.ir('guia', t.dataset.guia);
  else if (t.dataset.falar) falar(t.dataset.falar, true);
  else if (t.dataset.humor) {
    const [emoji, texto] = t.dataset.humor.split('|');
    P.humor = emoji; emitir('humor', { emoji, texto });
    P.ir('inicio');
    const resp = { '😊': 'Que bom! Vamos ter um ótimo dia.', '😐': 'Tudo bem. Estou aqui com você.', '😣': 'Obrigado por me contar. Quer respirar comigo?', '😴': 'Entendi. Vamos com calma hoje.' }[emoji];
    const bal = $(P.raiz, '#pBalao'); if (bal) bal.textContent = resp;
    falar(resp);
  }
});

P.banner = (icone, texto, vermelho) => {
  $(P.raiz, '.aviso-lumi')?.remove();
  const el = document.createElement('div');
  el.className = 'aviso-lumi' + (vermelho ? ' vermelho' : '');
  el.innerHTML = `${lumiSVG({ humor: 'falando', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 54 })}<div style="flex:1"><b>${icone} </b>${esc(texto)}</div><button class="btn" style="min-height:34px;padding:4px 10px">OK</button>`;
  P.raiz.appendChild(el);
  $(el, 'button').onclick = () => el.remove();
  setTimeout(() => el.remove(), 9000);
  falar(texto);
};

P.receber = (ev) => {
  if (ev.de === 'lucas') return;
  const quem = conta(ev.de)?.nome || 'Sua família';
  if (ev.tipo === 'aviso') P.banner('📩', `${quem} mandou um aviso: ${ev.dados.texto}`);
  if (ev.tipo === 'a_caminho') { if ($(P.raiz, '#pSos')) P.telaSos(); else P.banner('🚗', `${quem} está a caminho.`); }
  if (ev.tipo === 'sos_resolvido') $(P.raiz, '#pSos')?.remove();
  if (ev.tipo === 'fase_aprovada') {
    const r = rotinaPorId(ev.dados.rotina);
    P.banner('🎉', `${quem} aprovou: em "${r.nome}" agora você está na fase ${ev.dados.fase}. Vou ajudar um pouco menos, porque você está aprendendo!`);
    if (P.tela === 'inicio') P.ir('inicio');
  }
};

