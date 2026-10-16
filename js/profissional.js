/* ============================================================================
   PROFISSIONAL · conta de terapeuta, neuropsicólogo e médica
   Tela de computador/tablet: pacientes, resumo, plano terapêutico, saúde e IA.
   Três perfis com permissões diferentes (PROFS): quem edita plano, quem envia
   laudo e quem ajusta remédios. Os demais veem, mas não alteram.
   ============================================================================ */

// Profissionais fictícios e o que cada um pode fazer (a permissão define o que a conta vê e altera).
const PROFS = {
  julia: { pode: ['plano', 'notas', 'rotinas'], resumo: 'Terapeuta ocupacional: monta o plano, as metas e as rotinas; vê evolução, comunicação e saúde (sem alterar remédios).' },
  rafael: { pode: ['laudo'], resumo: 'Neuropsicólogo: envia laudos e acompanha a evolução; não edita plano nem remédios.' },
  helena: { pode: ['medicacao'], resumo: 'Neuropediatra: prescreve e ajusta remédios; vê adesão, sono, crises e efeitos observados.' },
};
// Estado do tablet do profissional: aba aberta e profissional selecionado (julia, rafael ou helena).
const Q = { raiz: document.getElementById('telaPro'), aba: 'resumo', prof: 'julia' };
// O profissional selecionado tem esta permissão?
const podePro = (x) => PROFS[Q.prof].pode.includes(x);
// Aviso "🔒" mostrado no lugar do que o profissional não tem permissão de ver ou alterar.
const bloqueado = (msg) => `<div class="cartao bloqueio">🔒 ${esc(msg)}</div>`;

// Cada aba é uma função que devolve o HTML. O que aparece muda conforme as permissões do profissional.
Q.abas = {};
Q.abas.pacientes = () => `
  <h2 style="font-size:19px;margin-bottom:8px">Meus pacientes</h2>
  ${[{ n: 'Lucas', i: 11, av: '🧒', a: true }, { n: 'Marina', i: 15, av: '👧' }, { n: 'Pedro', i: 7, av: '👦' }, { n: 'Rafaela', i: 24, av: '👩' }].map((p) => `
    <button class="cartao linha" data-paciente="${p.a ? 'lucas' : ''}" style="width:100%;text-align:left;cursor:pointer;${p.a ? 'border-color:var(--ciano)' : 'opacity:.6'}">
      <span class="avatar">${p.av}</span><div style="flex:1"><b>${p.n}, ${p.i} anos</b><br><span class="peq suave">${p.a ? `autonomia ${media(S.sessoes.filter((s) => s.data > Date.now() - 30 * 864e5))}% · adesão ${adesao(30)}%` : 'paciente de exemplo'}</span></div>
      ${p.a && S.alerta ? '<span class="selo perigo">SOS</span>' : p.a ? '<span class="selo ia">ativo</span>' : ''}</button>`).join('')}
  <p class="peq suave">Cada paciente autoriza (ou a família autoriza) o que o profissional vê. Adultos autistas controlam o próprio compartilhamento.</p>`;

Q.abas.resumo = () => {
  const ult30 = S.sessoes.filter((s) => s.data > Date.now() - 30 * 864e5), C = S.caa?.historico?.at(-1);
  return `
  <div class="linha" style="margin-bottom:8px"><span class="avatar">🧒</span><div style="flex:1"><b>Lucas, 11 anos</b><br><span class="peq suave">TEA nível 2 de suporte · família: Ana e Carlos</span></div></div>
  <div class="metricas">
    <div class="metrica"><b>${media(ult30)}%</b><span>autonomia nas rotinas (30 d)</span></div>
    <div class="metrica"><b>${C?.tamanho ?? '—'}</b><span>figuras por frase (CAA)</span></div>
    <div class="metrica"><b>${adesao(30)}%</b><span>adesão aos remédios</span></div>
  </div>
  <div class="metricas" style="margin-top:8px">
    <div class="metrica"><b>${mediaSono(7)} h</b><span>sono médio (7 noites)</span></div>
    <div class="metrica"><b>${S.saude.crises.filter((c) => c.data > Date.now() - 30 * 864e5).length}</b><span>crises (30 d)</span></div>
    <div class="metrica"><b>F${faseDe('mochila')}/F${faseDe('padaria')}</b><span>fases: mochila / padaria</span></div>
  </div>
  <div class="cartao" style="margin-top:10px;border-left:4px solid var(--ciano)"><span class="selo ia">A IA destacou</span>
    <ul class="peq" style="margin:8px 0 0;padding-left:18px">${[...padroesIA(), ...S.rotinas.map((r) => `${esc(r.nome)}: ${esc(sugestao(r.id).texto)}`)].slice(0, 5).map((t) => `<li style="margin-bottom:6px">${t}</li>`).join('')}</ul></div>
  <div class="titulo-sec">Últimos acontecimentos</div>
  <div class="cartao"><ul class="eventos">${S.eventos.filter((e) => !['progresso', 'humor', 'aviso'].includes(e.tipo)).slice(0, 8).map((ev) => `<li><span class="ic">${ICONE_EV[ev.tipo] || '•'}</span><div>${esc(textoEvento(ev))}<time>${haQuanto(ev.data)}</time></div></li>`).join('')}</ul></div>
  <button class="btn bloco" id="qExportar">🖨️ Exportar resumo (PDF)</button>`;
};

Q.abas.plano = () => `
  <h2 style="font-size:19px;margin-bottom:4px">Plano terapêutico</h2>
  <p class="peq suave" style="margin:0 0 10px">Metas de longo prazo, medidas automaticamente com os dados do dia a dia.</p>
  ${S.saude.metas.map((g) => { const v = valorMeta(g), pct = Math.max(0, Math.min(100, Math.round((v - g.inicio) / (g.alvo - g.inicio) * 100)));
    return `<div class="cartao"><div class="linha"><b style="flex:1">${esc(g.texto)}</b><span class="selo">${esc(g.prazo)}</span></div>
      <div class="peq suave">${esc(g.area)} · início ${g.inicio}${g.unidade} → agora <b style="color:var(--texto)">${v}${g.unidade}</b> → meta ${g.alvo}${g.unidade}</div>
      <div class="progresso" style="margin:8px 0 0"><div style="width:${pct}%"></div></div></div>`; }).join('')}
  ${podePro('plano') ? `<details class="cartao"><summary><b>+ Nova meta</b></summary>
      <label class="campo">Meta</label><input class="campo-in" id="qMeta" placeholder="Ex.: Pedir ajuda ao professor quando não entender">
      <label class="campo">Área</label><input class="campo-in" id="qArea" placeholder="Ex.: Comunicação na escola">
      <button class="btn primario bloco" id="qMetaSalvar" style="margin-top:8px">Adicionar ao plano</button></details>
    <div class="titulo-sec">Nota da sessão para a família</div>
    <div class="cartao"><textarea class="campo-in" id="qNota" rows="3" placeholder="O que foi trabalhado hoje e o que a família pode treinar em casa"></textarea>
      <button class="btn primario bloco" id="qNotaEnviar" style="margin-top:8px">Enviar à família</button></div>`
  : bloqueado(`${conta(Q.prof).nome} pode ver o plano, mas só a terapeuta responsável o edita.`)}
  <div class="titulo-sec">Notas anteriores</div>
  <div class="cartao"><ul class="eventos">${S.saude.notas.slice(0, 4).map((n) => `<li><span class="ic">🗒️</span><div>${esc(n.texto)}<time>${esc(conta(n.de)?.nome || '')} · ${haQuanto(n.data)}</time></div></li>`).join('')}</ul></div>`;

Q.abas.saude = () => `
  <h2 style="font-size:19px;margin-bottom:8px">Saúde</h2>
  ${podePro('medicacao') ? '' : '<p class="peq suave" style="margin:0 0 8px">Você vê a medicação e a adesão. Ajustes de dose são feitos pela médica.</p>'}
  ${cartaoRemedios(podePro('medicacao') ? 'medica' : 'leitura')}
  ${diarioHTML(false)}
  ${podePro('laudo') ? `<div class="cartao"><b>📄 Laudo neuropsicológico</b><p class="peq suave" style="margin:6px 0 8px">${S.conhecimento.laudo ? `Último laudo: ${esc(S.conhecimento.laudo.arquivo)} · ${haQuanto(S.conhecimento.laudo.data)}` : 'Nenhum laudo enviado ainda.'}</p>
      <button class="btn primario bloco" id="qLaudo">Enviar laudo de exemplo à família</button></div>` : ''}`;

Q.abas.ia = () => `<h2 style="font-size:19px;margin-bottom:8px">Converse com a IA</h2>${chatIA('pro-' + Q.prof, Q.prof)}`;

// Redesenha o tablet, preservando o campo em que a pessoa estava digitando.
Q.render = () => {
  const c = conta(Q.prof);
  document.getElementById('proNome').textContent = c.nome;
  document.getElementById('proPapel').textContent = c.rotulo;
  document.getElementById('proAvatar').textContent = c.avatar;
  const abas = [['pacientes', '👥', 'Pacientes'], ['resumo', '📋', 'Resumo'], ['plano', '🎯', 'Plano'], ['saude', '💊', 'Saúde'], ['ia', '🧠', 'IA']];
  const rol = $(Q.raiz, '#qConteudo')?.scrollTop || 0;
  Q.raiz.innerHTML = `<div class="status"><span>${hora()}</span><span>Passo a Passo · Profissional</span></div>
    <div class="conteudo" id="qConteudo">
      <div class="troca-prof">${['julia', 'rafael', 'helena'].map((id) => `<button data-prof="${id}" aria-pressed="${Q.prof === id}">${conta(id).avatar} ${esc(conta(id).nome)}</button>`).join('')}</div>
      <p class="peq suave" style="margin:0 0 10px">${esc(PROFS[Q.prof].resumo)}</p>
      ${Q.abas[Q.aba]()}</div>
    <nav class="nav-inferior" style="grid-template-columns:repeat(5,1fr)">${abas.map(([id, ic, n]) => `<button data-qaba="${id}" aria-current="${Q.aba === id}"><span>${ic}</span>${n}</button>`).join('')}</nav>`;
  $(Q.raiz, '#qConteudo').scrollTop = rol;
  Q.ligar();
};
// Liga os cliques do tablet (troca de profissional e de aba, plano, laudo, remédios, chat).
Q.ligar = () => {
  const q = (s) => $(Q.raiz, s);
  Q.raiz.querySelectorAll('[data-qaba]').forEach((b) => b.onclick = () => { Q.aba = b.dataset.qaba; Q.render(); $(Q.raiz, '#qConteudo').scrollTop = 0; });
  Q.raiz.querySelectorAll('[data-prof]').forEach((b) => b.onclick = () => { Q.prof = b.dataset.prof; Q.render(); });
  Q.raiz.querySelectorAll('[data-paciente]').forEach((b) => b.onclick = () => { if (b.dataset.paciente) { Q.aba = 'resumo'; Q.render(); } else toast('Na demonstração, só o Lucas tem dados.'); });
  q('#qExportar') && (q('#qExportar').onclick = exportarResumo);
  q('#qMetaSalvar') && (q('#qMetaSalvar').onclick = () => {
    const t = q('#qMeta').value.trim(); if (!t) return toast('Escreva a meta.');
    emitir('meta_nova', { meta: { id: 'g' + Date.now(), texto: t, area: q('#qArea').value.trim() || 'Geral', inicio: 0, atual: 0, alvo: 100, unidade: '%', prazo: 'a definir' } }, Q.prof);
  });
  q('#qNotaEnviar') && (q('#qNotaEnviar').onclick = () => {
    const t = q('#qNota').value.trim(); if (!t) return toast('Escreva a nota.');
    emitir('nota_sessao', { texto: t }, Q.prof);
    emitir('msg', { pictos: ['legal'], texto: `Nota da sessão: ${t}` }, Q.prof);
    toast('Nota enviada à família.');
  });
  q('#qLaudo') && (q('#qLaudo').onclick = () => { emitir('laudo_enviado', { texto: LAUDO_EXEMPLO, arquivo: 'Avaliacao_neuropsicologica_Lucas_2026.pdf' }, 'rafael'); toast('Laudo enviado. A família vê na aba IA.'); });
  Q.raiz.querySelectorAll('[data-ed-salvar]').forEach((b) => b.onclick = () => {
    const id = b.dataset.edSalvar, m = remedio(id);
    const dose = $(Q.raiz, `[data-ed-dose="${id}"]`).value.trim(), horario = $(Q.raiz, `[data-ed-hora="${id}"]`).value;
    const mud = {}; if (dose && dose !== m.dose) mud.dose = dose; if (horario && horario !== m.horario) mud.horario = horario;
    if (!Object.keys(mud).length) return toast('Nada mudou.');
    emitir('med_ajustada', { med: id, mudancas: mud, resumo: Object.entries(mud).map(([k, v]) => `${k === 'dose' ? 'dose' : 'horário'} → ${v}`).join(', ') }, 'helena');
    toast('Ajuste salvo. A família e o Lumi foram avisados.');
  });
  ligarChat(Q.raiz, () => Q.render());
};
// Quando chega um evento, só redesenha se a pessoa não estiver digitando.
Q.receber = () => { const f = document.activeElement; if (f && Q.raiz.contains(f) && /INPUT|TEXTAREA|SELECT/.test(f.tagName)) return; Q.render(); };

// ---------- Registro no núcleo ----------
MODULOS.push({ nome: 'profissional', receber: () => Q.receber() });
