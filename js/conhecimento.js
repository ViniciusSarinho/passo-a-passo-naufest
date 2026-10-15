/* ============================================================================
   CONHECIMENTO · a IA pergunta, lê laudos (PDF/TXT) e sugere ajustes
   Nenhum ajuste entra sem aprovação humana. Dados em S.conhecimento.
   No MVP a leitura do laudo é feita por regras (REGRAS_LAUDO em dados.js);
   no produto, um modelo de linguagem lê o documento e o profissional confirma.
   ============================================================================ */

// Leitura de PDF no navegador (pdf.js). O arquivo não sai do aparelho.
async function lerPdf(arquivo) {
  if (!window.pdfjsLib) {
    await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  const doc = await pdfjsLib.getDocument({ data: await arquivo.arrayBuffer() }).promise;
  const paginas = [];
  for (let i = 1; i <= Math.min(doc.numPages, 30); i++) {
    const conteudo = await (await doc.getPage(i)).getTextContent();
    // Junta os pedaços de texto, quebrando linha quando a posição vertical muda
    let linha = null, texto = '';
    conteudo.items.forEach((it) => {
      const y = Math.round(it.transform[5]);
      texto += (linha !== null && y !== linha ? '\n' : (texto && !texto.endsWith(' ') ? ' ' : '')) + it.str;
      linha = y;
    });
    paginas.push(texto);
  }
  return paginas.join('\n');
}

// ---------- Conhecimento: a IA pergunta, lê laudos e sugere ajustes (sempre com aprovação humana) ----------
// Pergunta gerada pelos dados: o passo com menos autonomia nos últimos 60 dias.
function perguntaDosDados() {
  const recentes = S.sessoes.filter((s) => s.data > Date.now() - 60 * 864e5);
  let pior = null;
  S.rotinas.forEach((r) => r.passos.forEach((p) => {
    const regs = recentes.filter((s) => s.rotina === r.id).flatMap((s) => s.passos.filter((x) => x.id === p.id).map((x) => acerto(x, s.fase)));
    if (regs.length < 5) return;
    const t = Math.round(regs.filter(Boolean).length / regs.length * 100);
    if (!pior || t < pior.t) pior = { p, r, t };
  }));
  if (!pior) return null;
  const titulo = preencher(pior.p.curta, 'lanche').replace(/\.$/, '');
  return { id: 'dados', origem: 'dados', texto: `Percebi que o passo "${titulo}" (${pior.r.nome.toLowerCase()}) deu certo sem ajuda extra só ${pior.t}% das vezes nos últimos 60 dias. O que costuma acontecer nessa hora?`,
    porque: 'Os dados mostram onde ele trava, mas não o motivo. A resposta de quem convive com ele muda a forma de ajudar.',
    opcoes: [
      { t: 'Trava para falar com pessoas desconhecidas', ef: { caaCedo: true }, ap: `No passo "${titulo}", falar com desconhecidos é a barreira: o "Falar por mim" aparece em destaque.` },
      { t: 'Esquece a ordem dos passos', ef: { historiaAntes: true }, ap: `No passo "${titulo}", a dificuldade é a sequência: a história social é mostrada antes.` },
      { t: 'O ambiente fica cheio e barulhento', ef: { ruidoLimite: 55 }, ap: `No passo "${titulo}", o ambiente sobrecarrega: o alerta de ruído ficou mais sensível.` }] };
}
function todasPerguntas() { const d = perguntaDosDados(); return d ? [d, ...PERGUNTAS_IA] : PERGUNTAS_IA; }
function perguntasPendentes() { return todasPerguntas().filter((q) => !S.conhecimento.respostas[q.id]); }

function analisarLaudo(texto) {
  // Junta linhas quebradas no meio da frase (comum em PDF) antes de separar as frases
  const corrido = texto.replace(/-\n(?=\p{Ll})/gu, '').replace(/\n(?=\p{Ll})/gu, ' ');
  const frases = corrido.split(/\n|(?<=\.)\s+/).map((x) => x.trim()).filter(Boolean);
  return REGRAS_LAUDO.map((rg, i) => {
    // A frase mais completa que cita o tema (evita pegar só o título da seção)
    const trecho = frases.filter((f) => rg.padrao.test(f)).sort((a, b) => b.length - a.length)[0];
    return trecho ? { ...rg, i, trecho } : null;
  }).filter(Boolean);
}
function sugestoesLaudo() {
  const L = S.conhecimento.laudo;
  if (!L) return [];
  return analisarLaudo(L.texto).map((a) => ({ ...a, aplicado: S.conhecimento.aplicados.includes('laudo:' + a.i) }));
}
function aplicarSugestao(a) {
  Object.assign(S.perfil, a.ajuste);
  S.conhecimento.aplicados.push('laudo:' + a.i);
  S.conhecimento.aprendizados.unshift({ texto: `${a.area}: ${a.impacto} Ajuste aprovado: ${a.acao.toLowerCase()}.`, fonte: 'laudo', data: Date.now() });
}

const FONTE_COR = { 'família': 'ok', laudo: 'ia', terapeuta: 'aviso', dados: '' };

R.abas.ia = () => {
  const K = S.conhecimento;
  const pend = perguntasPendentes();
  const resp = todasPerguntas().filter((q) => K.respostas[q.id]);
  const sugs = sugestoesLaudo();
  const ped = K.pedidoLaudo;
  const prof = (id) => {
    const e = K.encaminhadas[id];
    if (!e) return `<button class="btn" data-enc="${id}" style="font-size:13px;min-height:38px">❓ Perguntar à Dra. Júlia</button>`;
    if (e.status === 'aguardando') return '<span class="selo aviso">⏳ Aguardando a Dra. Júlia…</span>';
    return `<div class="peq" style="margin-top:6px;padding:8px 10px;border-radius:10px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25)">🧑‍⚕️ <b>Dra. Júlia:</b> ${esc(e.texto)}</div>`;
  };
  return `
  <div class="linha" style="margin-bottom:6px">${lumiSVG({ humor: 'atento', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 60 })}
    <div style="flex:1"><h2 style="font-size:19px">O que a IA sabe sobre o Lucas</h2>
    <span class="peq suave">Ela aprende com cada sessão, com a família e com os profissionais. Nenhum ajuste entra sem aprovação humana.</span></div></div>
  <div class="metricas" style="margin:10px 0 4px">
    <div class="metrica"><b>${K.aprendizados.length}</b><span>aprendizados</span></div>
    <div class="metrica"><b>${resp.length}/${todasPerguntas().length}</b><span>perguntas respondidas</span></div>
    <div class="metrica"><b>${K.laudo ? '✓' : '—'}</b><span>laudo neuropsicológico</span></div>
  </div>

  <div class="titulo-sec">A IA quer saber</div>
  ${pend.length ? pend.slice(0, 3).map((q) => `<div class="cartao">
    <span class="selo ${q.origem === 'dados' ? 'aviso' : 'ia'}">${q.origem === 'dados' ? '📊 Pergunta gerada pelos dados' : '🧠 Pergunta da IA'}</span>
    <p style="margin:8px 0 4px;font-weight:700">${esc(q.texto)}</p>
    <p class="peq suave" style="margin:0 0 8px">Por que pergunto: ${esc(q.porque)}</p>
    <div style="display:grid;gap:6px">${q.opcoes.map((o, i) => `<button class="btn" data-resp="${q.id}|${i}" style="text-align:left;font-weight:400;font-size:14px">${esc(o.t)}</button>`).join('')}</div>
    <div style="margin-top:8px">${prof(q.id)}</div></div>`).join('') + (pend.length > 3 ? `<p class="peq suave">+${pend.length - 3} pergunta(s) depois destas.</p>` : '')
    : '<div class="cartao peq suave">Tudo respondido por enquanto. A IA fará novas perguntas conforme observar as próximas sessões.</div>'}

  <div class="titulo-sec">Laudo neuropsicológico</div>
  <div class="cartao">
    ${!K.laudo ? `<p class="peq" style="margin:0 0 10px">Com o laudo, a IA entende melhor as condições do Lucas (atenção, linguagem, sensorialidade, funções executivas) e adapta as rotinas ao jeito dele de aprender.</p>
      ${ped && ped.status === 'aguardando' ? `<span class="selo aviso">⏳ Pedido enviado ao Dr. Rafael ${haQuanto(ped.data)}. Aguardando…</span>`
        : `<button class="btn primario bloco" id="rPedirLaudo">📄 Pedir relatório ao Dr. Rafael (neuropsicólogo)</button>`}
      <label class="btn bloco" style="display:flex;justify-content:center;align-items:center;margin-top:8px;cursor:pointer">⬆️ Enviar laudo que já tenho (PDF ou TXT)<input type="file" id="rArquivo" accept=".pdf,.txt,application/pdf,text/plain" hidden></label>
      <p class="peq" id="rLendo" hidden style="margin:8px 0 0"><span class="selo ia"><i class="vivo"></i>A IA está lendo o laudo…</span></p>
      <p class="peq suave" style="margin:8px 0 0">Para testar: <a href="exemplos/exemplo-laudo-ficticio.pdf" download style="color:var(--ciano)">baixe o laudo de exemplo (PDF fictício)</a> e envie aqui.</p>
      <p class="peq suave" style="margin:8px 0 0">🔒 O laudo fica só nas contas autorizadas (permissão "Envia laudos"). O Lucas não vê o laudo.</p>`
    : `<div class="linha"><span style="font-size:24px">📄</span><div style="flex:1;min-width:0;overflow-wrap:anywhere"><b>${esc(K.laudo.arquivo)}</b><br><span class="peq suave">enviado por ${esc(conta(K.laudo.de)?.nome || 'você')} · ${haQuanto(K.laudo.data)}</span></div></div>
      <div class="titulo-sec" style="margin-top:12px">Leitura da IA</div>
      ${sugs.length ? sugs.map((a) => `<div style="padding:10px 0;border-top:1px solid var(--linha)">
        <div class="linha"><b>${esc(a.area)}</b><span class="selo ${a.tipo === 'forte' ? 'ok' : 'aviso'}">${a.tipo === 'forte' ? 'ponto forte' : 'precisa de apoio'}</span></div>
        <div class="peq suave" style="margin:4px 0;font-style:italic">"${esc(a.trecho)}"</div>
        <div class="peq">${esc(a.impacto)} <b>Sugestão:</b> ${esc(a.acao)}.</div>
        <div style="margin-top:6px">${a.aplicado ? '<span class="selo ok">✓ aplicado</span>' : `<button class="btn" data-aplicar="${a.i}" style="font-size:13px;min-height:36px">Aprovar ajuste</button>`}</div></div>`).join('')
        : '<p class="peq suave">Não encontrei pontos que eu saiba transformar em ajustes. Um profissional pode revisar com você.</p>'}
      ${sugs.some((a) => !a.aplicado) ? '<button class="btn primario bloco" id="rAplicarTodos" style="margin-top:8px">Aprovar todos os ajustes</button>' : ''}
      <p class="peq suave" style="margin:10px 0 0">No MVP, a leitura é feita por regras sobre o texto. No produto, um modelo de linguagem lê PDF e fotos do laudo, e o profissional confirma a interpretação.</p>
      <button class="btn bloco" id="rNovoLaudo" style="margin-top:8px;font-size:13px">Enviar outro laudo</button>`}
  </div>

  <div class="titulo-sec">Aprendizados</div>
  <div class="cartao"><ul class="eventos">${K.aprendizados.slice(0, 12).map((a) => `<li><span class="ic">💡</span><div>${esc(a.texto)}
    <time><span class="selo ${FONTE_COR[a.fonte] || ''}" style="font-size:10px">${esc(a.fonte)}</span> ${haQuanto(a.data)}</time></div></li>`).join('')}</ul></div>

  ${resp.length ? `<div class="titulo-sec">Respostas da família</div>
  <div class="cartao">${resp.map((q) => `<div class="peq" style="padding:6px 0;border-bottom:1px solid var(--linha)"><span class="suave">${esc(q.texto)}</span><br><b>${esc(q.opcoes[S.conhecimento.respostas[q.id].i].t)}</b></div>`).join('')}</div>` : ''}`;
};

R.ligarIA = () => {
  const q = (s) => $(R.raiz, s);
  R.raiz.querySelectorAll('[data-resp]').forEach((b) => b.onclick = () => {
    const [id, i] = b.dataset.resp.split('|');
    const per = todasPerguntas().find((x) => x.id === id), op = per.opcoes[+i];
    S.conhecimento.respostas[id] = { i: +i, data: Date.now() };
    Object.assign(S.perfil, op.ef);
    S.conhecimento.aprendizados.unshift({ texto: op.ap, fonte: 'família', data: Date.now() });
    emitir('resposta_ia', { pergunta: per.texto, resposta: op.t }, EU);
    toast('A IA aprendeu: ' + op.ap);
  });
  R.raiz.querySelectorAll('[data-enc]').forEach((b) => b.onclick = () => {
    const id = b.dataset.enc;
    emitir('pergunta_prof', { id }, EU);
    toast('Pergunta enviada à Dra. Júlia.');
    // Resposta simulada da terapeuta (no produto, chega pela conta dela)
    setTimeout(() => emitir('resposta_prof', { id, texto: RESPOSTAS_PROF[id] || 'Vou observar isso na próxima sessão e te aviso.' }, 'julia'), 3500);
  });
  q('#rPedirLaudo') && (q('#rPedirLaudo').onclick = () => {
    emitir('pedido_laudo', { para: 'rafael' }, EU);
    toast('Pedido enviado ao Dr. Rafael.');
    setTimeout(() => emitir('laudo_enviado', { texto: LAUDO_EXEMPLO, arquivo: 'Avaliacao_neuropsicologica_Lucas_2026.pdf' }, 'rafael'), 4000);
  });
  q('#rArquivo') && (q('#rArquivo').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const status = q('#rLendo'); if (status) status.hidden = false;
    try {
      const texto = (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') ? await lerPdf(f) : await f.text();
      if (texto.replace(/\s/g, '').length < 40) {
        if (status) status.hidden = true;
        return toast('Não encontrei texto neste arquivo. Se for um PDF escaneado (foto), o produto final usa OCR para ler a imagem.');
      }
      emitir('laudo_enviado', { texto: texto.slice(0, 40000), arquivo: f.name }, EU);
    } catch (erro) {
      if (status) status.hidden = true;
      toast('Não consegui abrir este arquivo. Tente um PDF com texto ou um .txt.');
    }
  });
  q('#rNovoLaudo') && (q('#rNovoLaudo').onclick = () => { S.conhecimento.laudo = null; S.conhecimento.pedidoLaudo = null; salvar(); R.render(); });
  R.raiz.querySelectorAll('[data-aplicar]').forEach((b) => b.onclick = () => {
    const a = sugestoesLaudo().find((x) => x.i === +b.dataset.aplicar);
    aplicarSugestao(a);
    emitir('ajuste_ia', { texto: a.acao.toLowerCase(), origem: 'laudo' }, EU);
  });
  q('#rAplicarTodos') && (q('#rAplicarTodos').onclick = () => {
    const pend = sugestoesLaudo().filter((a) => !a.aplicado);
    pend.forEach(aplicarSugestao);
    emitir('ajuste_ia', { texto: `${pend.length} ajustes do laudo`, origem: 'laudo' }, EU);
  });
};

// ---------- Registro no núcleo ----------
MODULOS.push({
  nome: 'conhecimento',
  dados: conhecimentoPadrao,
  aplicar(ev) {
    const K = S.conhecimento, d = ev.dados;
    if (ev.tipo === 'pergunta_prof') K.encaminhadas[d.id] = { status: 'aguardando', data: ev.data };
    if (ev.tipo === 'resposta_prof') {
      K.encaminhadas[d.id] = { status: 'respondida', texto: d.texto, de: ev.de, data: ev.data };
      K.aprendizados.unshift({ texto: `${conta(ev.de)?.nome}: ${d.texto}`, fonte: 'terapeuta', data: ev.data });
    }
    if (ev.tipo === 'pedido_laudo') K.pedidoLaudo = { data: ev.data, para: d.para, status: 'aguardando' };
    if (ev.tipo === 'laudo_enviado') {
      K.laudo = { texto: d.texto, arquivo: d.arquivo, de: ev.de, data: ev.data };
      if (K.pedidoLaudo) K.pedidoLaudo.status = 'recebido';
      K.aprendizados.unshift({ texto: `Laudo "${d.arquivo}" recebido e lido pela IA.`, fonte: 'laudo', data: ev.data });
    }
  },
  texto(ev) {
    const d = ev.dados, quem = conta(ev.de)?.nome || '';
    return {
      pergunta_prof: () => `${quem} encaminhou uma pergunta da IA para a Dra. Júlia`,
      resposta_prof: () => `${quem} respondeu à IA: "${d.texto}"`,
      pedido_laudo: () => `${quem} pediu o laudo neuropsicológico ao Dr. Rafael`,
      laudo_enviado: () => `${quem} enviou "${d.arquivo}". A IA leu e sugeriu ajustes.`,
      ajuste_ia: () => `${quem} aprovou um ajuste sugerido pela IA: ${d.texto}`,
      resposta_ia: () => `${quem} respondeu à IA: ${d.resposta}`,
    }[ev.tipo]?.();
  },
});
Object.assign(ICONE_EV, { pergunta_prof: '❓', resposta_prof: '🧑‍⚕️', pedido_laudo: '📄', laudo_enviado: '🧠', ajuste_ia: '🛠️', resposta_ia: '💬' });
R.selos.ia = () => perguntasPendentes().length;
R.ligadores.push(() => R.ligarIA());
