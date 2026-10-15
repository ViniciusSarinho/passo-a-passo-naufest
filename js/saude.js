/* ============================================================================
   SAÚDE · remédios, diário de sono e crises, conversa com a IA sobre o tratamento
   Lembrete do remédio com figuras (paciente), adesão e estoque (família), efeitos
   observados e padrões percebidos pela IA. Dados em S.saude.
   Remédios, doses e profissionais são FICTÍCIOS. Dose e horário só a médica altera.
   A IA não dá diagnóstico nem muda tratamento: ela organiza dados para a consulta.
   ============================================================================ */

// ---------- Dados iniciais de saúde ----------
// Data no fuso do aparelho (o dia do remédio é o dia local, não o UTC)
const dataISO = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function saudePadrao() {
  let semente = 7;
  const rand = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
  const dia = 864e5, hoje = Date.now();
  const meds = [
    { id: 'med1', nome: 'Melatonina (exemplo)', dose: '1 comprimido', horario: '21:00', emoji: '🌙', motivo: 'ajudar a regular o sono',
      passos: [['🦷', 'Escove os dentes'], ['💧', 'Pegue um copo de água'], ['💊', 'Tome 1 comprimido'], ['🛏️', 'Hora de deitar']], estoque: 6, caixa: 30, prescritor: 'helena' },
    { id: 'med2', nome: 'Remédio da manhã (exemplo)', dose: '1 comprimido', horario: '07:30', emoji: '☀️', motivo: 'tratamento indicado pela médica',
      passos: [['🥣', 'Tome o café da manhã'], ['💧', 'Pegue um copo de água'], ['💊', 'Tome 1 comprimido']], estoque: 22, caixa: 30, prescritor: 'helena' },
  ];
  const registros = [];
  for (let d = 30; d >= 1; d--) meds.forEach((m) => {
    const r = rand(), [h, mi] = m.horario.split(':').map(Number);
    const status = r < 0.88 ? 'tomado' : r < 0.95 ? 'atrasado' : 'perdido';
    const atraso = status === 'tomado' ? Math.round(rand() * 20) : 45 + Math.round(rand() * 50);
    registros.push({ med: m.id, dia: dataISO(hoje - d * dia), status, hora: status === 'perdido' ? null : `${String(h + Math.floor((mi + atraso) / 60)).padStart(2, '0')}:${String((mi + atraso) % 60).padStart(2, '0')}`, por: rand() < 0.7 ? 'lucas' : 'ana' });
  });
  const sono = [8.5, 8.1, 7.2, 8.8, 9.0, 6.9, 8.2, 8.4, 7.8, 8.9, 8.6, 7.0, 8.3, 8.7].map((h, i) => ({ dia: dataISO(hoje - (14 - i) * dia), horas: h }));
  const crises = [[2, 'barulho', 12, 'Padaria'], [6, 'barulho', 8, 'Shopping'], [11, 'mudança de rotina', 20, 'Casa'], [17, 'fila / espera', 6, 'Mercado'], [25, 'barulho', 15, 'Festa da escola']]
    .map(([d, gatilho, duracao, local]) => ({ data: hoje - d * dia, gatilho, duracao, local, por: 'ana' }));
  return {
    meds, registros, sono, crises,
    efeitos: [{ data: hoje - 5 * dia, texto: 'Dormiu mais rápido nas últimas noites', por: 'ana' }, { data: hoje - 12 * dia, texto: 'Apetite normal', por: 'ana' }],
    metas: [
      { id: 'g1', texto: 'Pedir os pães sozinho na padaria', area: 'Comunicação na vida diária', inicio: 20, alvo: 80, unidade: '%', prazo: 'mar/2027', calc: 'p4' },
      { id: 'g2', texto: 'Montar frases com 3 ou mais figuras', area: 'CAA', inicio: 1.2, alvo: 4, unidade: ' figuras', prazo: 'jun/2027', calc: 'caa' },
      { id: 'g3', texto: 'Arrumar a mochila com o Lumi em silêncio (fase 3)', area: 'Autonomia', inicio: 1, alvo: 3, unidade: '', prazo: 'dez/2026', calc: 'fase' },
      { id: 'g4', texto: 'Pedir pausa antes de chegar à crise', area: 'Regulação emocional', inicio: 10, atual: 46, alvo: 70, unidade: '%', prazo: 'jun/2027' },
    ],
    notas: [{ de: 'julia', data: hoje - 3 * dia, texto: 'Sessão focada em pedir em voz alta. Lucas usou o "Falar por mim" duas vezes e depois tentou sozinho. Manter o treino na padaria aos sábados.' }],
    lembrados: {},
  };
}

const remedio = (id) => S.saude.meds.find((m) => m.id === id);
const registroHoje = (id) => S.saude.registros.find((r) => r.med === id && r.dia === dataISO(Date.now()));
function adesao(dias = 30, med = null) {
  const desde = dataISO(Date.now() - dias * 864e5);
  const regs = S.saude.registros.filter((r) => r.dia >= desde && (!med || r.med === med));
  return regs.length ? Math.round(regs.filter((r) => r.status !== 'perdido').length / regs.length * 100) : 0;
}
const mediaSono = (n = 7) => { const s = S.saude.sono.slice(-n); return s.length ? +(s.reduce((a, x) => a + x.horas, 0) / s.length).toFixed(1) : 0; };

function padroesIA() {
  const H = S.saude, out = [];
  const cont = {};
  H.crises.forEach((c) => { cont[c.gatilho] = (cont[c.gatilho] || 0) + 1; });
  const top = Object.entries(cont).sort((a, b) => b[1] - a[1])[0];
  if (top) out.push(`${top[1]} de ${H.crises.length} crises registradas tiveram como gatilho <b>${esc(top[0])}</b>. O sensor de ruído e a pausa antecipada ajudam nesses momentos.`);
  const curtas = H.crises.filter((c) => { const s = H.sono.find((x) => x.dia === dataISO(c.data - 864e5)); return s && s.horas < 7.5; }).length;
  if (curtas) out.push(`${curtas} crise(s) aconteceram depois de uma noite com menos de 7h30 de sono. Vale observar a relação entre sono e regulação.`);
  const atrasos = H.registros.filter((r) => r.status !== 'tomado');
  const noite = atrasos.filter((r) => remedio(r.med)?.horario >= '18:00').length;
  if (atrasos.length) out.push(`${atrasos.length} dose(s) atrasadas ou esquecidas em 30 dias, ${noite} delas à noite. O lembrete do Lumi com figuras foi ativado para esse horário.`);
  return out;
}

// ---------- Eventos ----------
function aplicarSaude(ev) {
  const H = S.saude, d = ev.dados;
  if (!H) return;
  if (ev.tipo === 'med_tomado' || ev.tipo === 'med_dado') {
    const m = remedio(d.med); if (!m) return;
    const atrasado = d.atrasado;
    const r = registroHoje(m.id);
    const reg = { med: m.id, dia: dataISO(ev.data), status: atrasado ? 'atrasado' : 'tomado', hora: hora(), por: ev.de };
    if (r) Object.assign(r, reg); else H.registros.push(reg);
    m.estoque = Math.max(0, m.estoque - 1);
  }
  if (ev.tipo === 'med_ajustada') { const m = remedio(d.med); if (m) Object.assign(m, d.mudancas); }
  if (ev.tipo === 'crise_registrada') H.crises.unshift({ ...d, data: ev.data, por: ev.de });
  if (ev.tipo === 'sono_registrado') H.sono.push({ dia: dataISO(ev.data), horas: d.horas });
  if (ev.tipo === 'efeito') H.efeitos.unshift({ data: ev.data, texto: d.texto, por: ev.de });
  if (ev.tipo === 'nota_sessao') H.notas.unshift({ de: ev.de, data: ev.data, texto: d.texto });
  if (ev.tipo === 'meta_nova') H.metas.push(d.meta);
  if (ev.tipo === 'med_lembrete') H.lembrados[d.med + dataISO(ev.data)] = true;
}
Object.assign(ICONE_EV, { med_lembrete: '⏰', med_tomado: '💊', med_dado: '💊', med_atrasado: '⚠️', med_ajustada: '🩺', crise_registrada: '📓', sono_registrado: '😴', efeito: '📝', nota_sessao: '🗒️', meta_nova: '🎯' });
function textoSaude(ev) {
  const d = ev.dados, quem = conta(ev.de)?.nome || 'O Lumi', m = remedio(d.med);
  const t = {
    med_lembrete: () => `Lembrete do Lumi: hora de ${m?.nome}`,
    med_tomado: () => `Lucas confirmou que tomou ${m?.nome}${d.atrasado ? ' (com atraso)' : ''}`,
    med_dado: () => `${quem} registrou que deu ${m?.nome}`,
    med_atrasado: () => `Atenção: ${m?.nome} ainda não foi confirmado`,
    med_ajustada: () => `${quem} ajustou ${m?.nome}: ${d.resumo}`,
    crise_registrada: () => `${quem} registrou uma crise (${d.gatilho}, ${d.duracao} min)`,
    sono_registrado: () => `${quem} registrou ${d.horas} h de sono`,
    efeito: () => `${quem} observou: ${d.texto}`,
    nota_sessao: () => `${quem} enviou a nota da sessão`,
    meta_nova: () => `${quem} criou a meta: ${d.meta.texto}`,
  };
  return t[ev.tipo]?.();
}

// ---------- Paciente: lembrete do remédio com figuras ----------
P.lembrarRemedio = (id) => {
  const m = remedio(id); if (!m) return;
  $(P.raiz, '#pRemedio')?.remove();
  const ov = document.createElement('div');
  ov.className = 'sobreposicao'; ov.id = 'pRemedio';
  ov.innerHTML = `${lumiSVG({ humor: 'falando', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 100, hiperfoco: S.perfil.hiperfoco })}
    <h2>${m.emoji} Hora do remédio</h2>
    <p style="margin:0" class="suave">${esc(m.nome)} · ${esc(m.dose)}</p>
    <div class="passos-remedio">${m.passos.map(([e, t], i) => `<div><span>${i + 1}</span><i>${e}</i><small>${esc(t)}</small></div>`).join('')}</div>
    <button class="btn ok bloco grande" id="remTomei">✓ Tomei</button>
    <button class="btn bloco" id="remAjuda">🙋 Preciso de ajuda</button>`;
  P.raiz.appendChild(ov);
  const inicio = Date.now();
  falar(`${S.perfil.nome}, hora do remédio. ${m.passos.map((p) => p[1]).join('. ')}.`);
  const alerta = setTimeout(() => { if (ov.isConnected) { emitir('med_atrasado', { med: m.id }, 'lumi'); falar('Lembra do remédio? Estou aqui com você.'); } }, 45000);
  $(ov, '#remTomei').onclick = () => {
    clearTimeout(alerta);
    emitir('med_tomado', { med: m.id, atrasado: Date.now() - inicio > 45000 });
    S.pet.estrelas += 1; salvar();
    ov.innerHTML = `${lumiSVG({ humor: 'comemorando', acessorios: lumiNivel(S.pet.estrelas).acessorios, tamanho: 120, hiperfoco: S.perfil.hiperfoco })}<h2>Muito bem! +1 ⭐</h2><p class="suave">A mamãe já sabe que você tomou.</p>`;
    falar('Muito bem! Você cuidou de você.');
    setTimeout(() => ov.remove(), 2600);
  };
  $(ov, '#remAjuda').onclick = () => {
    clearTimeout(alerta);
    emitir('msg', { pictos: ['eu', 'preciso', 'ajuda'], texto: `Eu preciso de ajuda com o remédio (${m.nome}).`, sozinho: true });
    ov.remove(); P.banner('📩', 'Avisei a mamãe que você precisa de ajuda com o remédio.');
  };
};

// Agendador real: confere o relógio e lembra no horário de cada remédio
setInterval(() => {
  const agora = new Date().toTimeString().slice(0, 5);
  S.saude.meds.forEach((m) => {
    if (m.horario === agora && !registroHoje(m.id) && !S.saude.lembrados[m.id + dataISO(Date.now())]) emitir('med_lembrete', { med: m.id }, 'lumi');
  });
}, 20000);

function receberSaude(ev) {
  if (ev.tipo === 'med_atrasado') bipe();
  if (ev.tipo === 'med_lembrete') P.lembrarRemedio(ev.dados.med);
  if (ev.tipo === 'med_ajustada' && ev.dados.mudancas.horario) P.banner('🩺', `O horário do remédio mudou para ${ev.dados.mudancas.horario}. Eu te lembro na hora certa.`);
}

// Início do paciente: próximo remédio na agenda e atalho "Meu jeito"
P.ganchosInicio.push(() => {
  const agora = new Date().toTimeString().slice(0, 5);
  const ordem = [...S.saude.meds].sort((a, b) => a.horario.localeCompare(b.horario));
  const prox = ordem.find((m) => m.horario >= agora && !registroHoje(m.id)) || ordem[0] || null;
  const ag = P.raiz.querySelector('.agenda');
  if (ag && prox) ag.insertAdjacentHTML('beforeend', `<button class="item" data-remedio="${prox.id}"><span class="hora">${prox.horario}</span><span class="emo">💊</span>
    <span><b>Hora do remédio</b><br><span class="peq suave">o Lumi te lembra com figuras</span></span><span class="selo">${prox.emoji}</span></button>`);
  const grade = P.raiz.querySelector('.grade-2');
  if (grade) grade.insertAdjacentHTML('beforeend', '<button class="atalho" data-p="meujeito"><span>🎚️</span><b>Meu jeito</b><small>Volume, voz e tela calma</small></button>');
  aplicarAparencia();
});
P.raiz.addEventListener('click', (e) => { const b = e.target.closest('[data-remedio]'); if (b) P.lembrarRemedio(b.dataset.remedio); });

// "Meu jeito": a própria pessoa controla volume, voz e estímulos
function aplicarAparencia() {
  P.raiz.classList.toggle('tela-calma', !!S.perfil.telaCalma);
  P.raiz.classList.toggle('letra-grande', !!S.perfil.letraGrande);
}
function opcoesVoz() {
  if (!vozesPt.length) return '<option value="">Voz padrão do aparelho</option>';
  return vozesPt.map((v, i) => `<option value="${esc(v.name)}" ${vozPt && v.name === vozPt.name ? 'selected' : ''}>${VOZ_NATURAL.test(v.name) ? '✨ ' : ''}${esc(v.name.replace(/Microsoft |Google |Online |\(Natural\)/g, '').replace(/\s+-.*$/, ''))}${i === 0 ? ' · recomendada' : ''}</option>`).join('');
}
// Sem voz neural no aparelho, explica como ter uma voz mais humana
function dicaVoz() {
  return temVozNatural() ? '<p class="peq suave" style="margin:4px 0 0">✨ = voz neural, mais natural.</p>'
    : '<p class="peq suave" style="margin:4px 0 0">Para uma voz mais humana, abra no <b>Microsoft Edge</b> (vozes Francisca e Thalita) ou use as <b>falas gravadas</b> no Estúdio de voz.</p>';
}
P.telas.meujeito = () => {
  const p = S.perfil;
  P.moldura(`${P.cabecalho('Meu jeito')}
    ${P.lumi('feliz', 'Aqui você escolhe como eu falo e como a tela fica.', 'Só você e sua família mudam isso.', 90)}
    <div class="cartao">
      <label class="campo" style="margin-top:0">🔊 Volume da minha voz: <span id="mjVolV">${Math.round((p.volume ?? .8) * 100)}%</span></label>
      <input type="range" id="mjVol" min="0" max="100" value="${Math.round((p.volume ?? .8) * 100)}">
      <label class="campo">🐢 Velocidade: <span id="mjVelV">${p.velocidade}</span></label>
      <input type="range" id="mjVel" min="0.6" max="1.2" step="0.05" value="${p.velocidade}">
      <label class="campo">🗣️ Voz do Lumi</label>
      <select class="campo-in" id="mjVoz">${opcoesVoz()}</select>${dicaVoz()}
      <button class="btn bloco" id="mjTestar" style="margin-top:8px">▶ Ouvir a voz</button>
      <label class="check"><input type="checkbox" id="mjEscura" ${p.telaEscura !== false ? 'checked' : ''}> Tela escura (menos brilho; desligue se preferir fundo claro)</label>
      <label class="check"><input type="checkbox" id="mjCalma" ${p.telaCalma ? 'checked' : ''}> Tela calma (sem animações, cores mais suaves)</label>
      <label class="check"><input type="checkbox" id="mjLetra" ${p.letraGrande ? 'checked' : ''}> Letra maior</label>
      <label class="check"><input type="checkbox" id="mjFala" ${p.voz ? 'checked' : ''}> O Lumi fala em voz alta</label>
    </div>
    <p class="peq suave">A voz recomendada é a mais natural disponível neste aparelho. No Microsoft Edge, as vozes "Natural" (como Francisca e Thalita) soam como uma pessoa.</p>`);
  const q = (s) => $(P.raiz, s);
  q('#mjVol').oninput = (e) => { S.perfil.volume = e.target.value / 100; q('#mjVolV').textContent = e.target.value + '%'; salvar(); };
  q('#mjVol').onchange = () => falar('Assim está bom?', true);
  q('#mjVel').oninput = (e) => { S.perfil.velocidade = +e.target.value; q('#mjVelV').textContent = e.target.value; salvar(); };
  q('#mjVoz').onchange = (e) => { S.perfil.vozNome = e.target.value; escolherVoz(); salvar(); falar(`Oi, ${S.perfil.nome}! Esta é a minha nova voz.`, true); };
  q('#mjTestar').onclick = () => falar(`Oi, ${S.perfil.nome}! Eu sou o Lumi. Vamos juntos, um passo de cada vez.`, true);
  q('#mjEscura').onchange = (e) => { S.perfil.telaEscura = e.target.checked; salvar(); if (typeof aplicarTema === 'function') aplicarTema(); };
  q('#mjCalma').onchange = (e) => { S.perfil.telaCalma = e.target.checked; salvar(); aplicarAparencia(); };
  q('#mjLetra').onchange = (e) => { S.perfil.letraGrande = e.target.checked; salvar(); aplicarAparencia(); };
  q('#mjFala').onchange = (e) => { S.perfil.voz = e.target.checked; salvar(); };
};

// ---------- Conversa com a IA sobre o tratamento (família e profissionais) ----------
// No MVP, a IA responde com os dados reais do app. No produto, um modelo de linguagem usaria os mesmos dados,
// sem dar diagnóstico e sem mudar remédios.
function responderIA(pergunta, papel) {
  const t = pergunta.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const sem = S.sessoes.filter((s) => s.data > Date.now() - 7 * 864e5);
  const pausas = S.eventos.filter((e) => e.tipo === 'calma' && e.data > Date.now() - 7 * 864e5).length;
  const crises7 = S.saude.crises.filter((c) => c.data > Date.now() - 7 * 864e5).length;
  const C = S.caa?.historico?.at(-1);
  if (/(aument|diminu|mud|par|tir|suspend|troc)\w* (a |o )?(dose|remedio|medica)|diagnost|devo dar|posso dar/.test(t))
    return `Não posso indicar diagnóstico nem mudar remédios ou doses: isso é decisão da <b>Dra. Helena</b>. Posso juntar os dados de sono, adesão e crises para você levar à consulta. ${papel === 'helena' ? '' : 'Use "Exportar resumo" para levar à consulta.'}`;
  if (/semana|como (foi|esta|anda)|resumo|geral/.test(t))
    return `Nos últimos 7 dias: <b>${sem.length} rotinas</b> com o Lumi, autonomia média de <b>${media(sem)}%</b>, ${pausas} pedido(s) de pausa, ${crises7} crise(s) registrada(s), sono médio de <b>${mediaSono(7)} h</b> e <b>${adesao(7)}%</b> das doses confirmadas.${C ? ` Na comunicação, ele está usando em média ${C.tamanho} figuras por frase.` : ''}`;
  if (/remedio|medica|dose|adesao|tomou|melatonina|estoque/.test(t))
    return S.saude.meds.map((m) => { const r = registroHoje(m.id); return `<b>${esc(m.nome)}</b> (${m.horario}): ${r ? `hoje ${r.status === 'perdido' ? 'não foi tomado' : 'tomado às ' + r.hora}` : 'ainda não registrado hoje'}; adesão de ${adesao(30, m.id)}% em 30 dias; restam ${m.estoque} comprimido(s)${m.estoque <= 7 ? ' (<b>hora de repor</b>)' : ''}.`; }).join('<br>') + '<br><span class="suave">Mudanças de dose só com a médica.</span>';
  if (/crise|calma|pausa|barulho|gatilho|desregul/.test(t)) return `Registrei ${S.saude.crises.length} crises nos últimos 30 dias e ${pausas} pedido(s) de pausa nesta semana.<br>${padroesIA().slice(0, 2).join('<br>')}`;
  if (/sono|dorm|noite/.test(t)) { const s = S.saude.sono.slice(-7); return `Sono médio nas últimas 7 noites: <b>${mediaSono(7)} h</b> (mínimo ${Math.min(...s.map((x) => x.horas))} h, máximo ${Math.max(...s.map((x) => x.horas))} h). ${padroesIA()[1] || ''}`; }
  if (/comunica|caa|fala|figura|frase|palavra/.test(t) && C) return `Ele está usando <b>${C.tamanho} figuras por frase</b> (eram ${S.caa.historico[0].tamanho}), <b>${C.vocab} palavras</b> diferentes (eram ${S.caa.historico[0].vocab}) e começa <b>${C.iniciadas}%</b> das conversas. Palavras novas: ${S.caa.novos.slice(-3).map((id) => P_(id)[1]).join(', ')}.`;
  if (/laudo|neuro|avaliac/.test(t)) { const s = sugestoesLaudo(); return s.length ? `O laudo de ${esc(conta(S.conhecimento.laudo.de)?.nome || 'você')} trouxe ${s.length} pontos. Pontos fortes: ${s.filter((x) => x.tipo === 'forte').map((x) => x.area).join(', ') || '—'}. Precisa de apoio: ${s.filter((x) => x.tipo !== 'forte').map((x) => x.area).join(', ')}. ${s.filter((x) => x.aplicado).length} ajuste(s) já aprovados.` : 'Ainda não há laudo no app. A família pode pedir ao Dr. Rafael na aba IA.'; }
  if (/fase|evolu|progress|autonomia|rotina|mochila|padaria/.test(t)) return S.rotinas.map((r) => { const sg = sugestao(r.id); return `<b>${esc(r.nome)}</b>: fase ${faseDe(r.id)}. ${esc(sg.texto)}`; }).join('<br>');
  if (/dica|ajudar|o que (posso|fazer|eu)|sugest|como apoiar/.test(t)) { const q = perguntaDosDados(); return `Três ideias com base nos dados:<br>1. ${q ? esc(q.texto.split('. O que')[0]) + '. Treine esse passo com o "Falar por mim" como ponte.' : 'Mantenha a rotina previsível.'}<br>2. Avise mudanças pelo Lumi com antecedência; mudança de rotina aparece entre os gatilhos.<br>3. Proteja o sono: noites curtas antecederam crises.`; }
  if (/meta|plano|objetivo/.test(t)) return S.saude.metas.map((g) => `<b>${esc(g.texto)}</b>: ${valorMeta(g)}${g.unidade} de ${g.alvo}${g.unidade} (prazo ${g.prazo})`).join('<br>');
  return 'Posso responder sobre a semana, os remédios, crises e pausas, sono, comunicação, laudo, fases e metas. Experimente uma das perguntas abaixo.';
}
const SUGESTOES_IA = ['Como foi a semana?', 'Ele está tomando os remédios?', 'O que tem causado as crises?', 'Como está o sono?', 'Como está a comunicação?', 'O que posso fazer para ajudar?', 'Devo aumentar a dose?'];
const chats = {};
function chatIA(chave, papel) {
  const h = chats[chave] || (chats[chave] = [{ de: 'ia', html: `Olá! Sou a IA do Passo a Passo. Respondo com os dados do ${S.perfil.nome}: rotinas, comunicação, remédios, sono e crises. Não dou diagnóstico nem mudo tratamento.` }]);
  return `<div class="cartao chat-ia">
    <div class="chat">${h.map((m) => `<div class="bolha ${m.de === 'eu' ? 'minha' : ''}">${m.de === 'ia' ? `<div class="peq suave">🧠 IA do Passo a Passo</div>` : ''}<div>${m.html}</div></div>`).join('')}</div>
    <div class="linha" style="gap:5px;margin-bottom:8px">${SUGESTOES_IA.map((s) => `<button class="btn" data-ia-sug="${chave}|${esc(s)}" style="font-size:11.5px;min-height:30px;padding:3px 9px">${esc(s)}</button>`).join('')}</div>
    <div class="linha" style="flex-wrap:nowrap"><input class="campo-in" data-ia-in="${chave}" placeholder="Pergunte sobre o tratamento do ${esc(S.perfil.nome)}…"><button class="btn primario" data-ia-env="${chave}|${papel}">Enviar</button></div>
    <p class="peq suave" style="margin:6px 0 0">No MVP, as respostas vêm dos dados do app. No produto, um modelo de linguagem faz a conversa com estes mesmos limites.</p></div>`;
}
function ligarChat(raiz, redesenhar) {
  const perguntar = (chave, papel, texto) => {
    if (!texto.trim()) return;
    const h = chats[chave];
    h.push({ de: 'eu', html: esc(texto) });
    h.push({ de: 'ia', html: responderIA(texto, papel) });
    redesenhar();
    const c = raiz.querySelector('.chat-ia .chat'); if (c) c.lastElementChild?.scrollIntoView({ block: 'nearest' });
  };
  raiz.querySelectorAll('[data-ia-sug]').forEach((b) => b.onclick = () => { const [chave, txt] = b.dataset.iaSug.split('|'); perguntar(chave, chave, txt); });
  raiz.querySelectorAll('[data-ia-env]').forEach((b) => b.onclick = () => { const [chave, papel] = b.dataset.iaEnv.split('|'); perguntar(chave, papel, raiz.querySelector(`[data-ia-in="${chave}"]`).value); });
  raiz.querySelectorAll('[data-ia-in]').forEach((i) => i.onkeydown = (e) => { if (e.key === 'Enter') raiz.querySelector(`[data-ia-env^="${i.dataset.iaIn}|"]`).click(); });
}

// ---------- Componentes de saúde (usados pela família e pelo profissional) ----------
function cartaoRemedios(modo) {
  return S.saude.meds.map((m) => {
    const r = registroHoje(m.id);
    const ult14 = Array.from({ length: 14 }, (_, i) => S.saude.registros.find((x) => x.med === m.id && x.dia === dataISO(Date.now() - (14 - i) * 864e5)));
    const editar = modo === 'medica';
    return `<div class="cartao">
      <div class="linha"><span style="font-size:26px">${m.emoji}</span><div style="flex:1"><b>${esc(m.nome)}</b><br><span class="peq suave">${esc(m.dose)} às ${m.horario} · para ${esc(m.motivo)}</span></div>
        <span class="selo ${r ? (r.status === 'perdido' ? 'perigo' : 'ok') : 'aviso'}">${r ? (r.status === 'perdido' ? 'não tomado' : `✓ ${r.hora}`) : 'hoje: pendente'}</span></div>
      <div class="dias-adesao" title="Últimos 14 dias">${ult14.map((x) => `<i class="${x ? x.status : 'vazio'}"></i>`).join('')}</div>
      <div class="linha peq" style="margin-top:6px"><span>Adesão 30 dias: <b>${adesao(30, m.id)}%</b></span><span class="espaco"></span>
        <span class="${m.estoque <= 7 ? 'selo aviso' : 'suave'}">${m.estoque <= 7 ? '⚠️ ' : ''}restam ${m.estoque} comprimidos</span></div>
      <div class="peq suave" style="margin-top:4px">Prescrito por ${esc(conta(m.prescritor)?.nome || '—')}</div>
      ${modo === 'familia' ? `<div class="grade-2" style="margin-top:8px"><button class="btn" data-sim-lembrete="${m.id}">⏰ Simular lembrete</button><button class="btn" data-dei="${m.id}" ${r ? 'disabled' : ''}>💊 Eu dei o remédio</button></div>` : ''}
      ${editar ? `<div class="linha" style="margin-top:8px;flex-wrap:nowrap"><input class="campo-in" data-ed-dose="${m.id}" value="${esc(m.dose)}" aria-label="Dose"><input class="campo-in" type="time" data-ed-hora="${m.id}" value="${m.horario}" style="width:110px" aria-label="Horário"></div>
        <button class="btn primario bloco" data-ed-salvar="${m.id}" style="margin-top:6px">Salvar ajuste e avisar a família</button>` : ''}
    </div>`;
  }).join('') + (modo !== 'medica' ? '<p class="peq suave">🔒 Só a médica altera dose e horário. Remédios e doses desta demonstração são fictícios.</p>' : '<p class="peq suave">A família recebe o ajuste na hora, e o Lumi passa a lembrar no novo horário.</p>');
}
function graficoSono() {
  const s = S.saude.sono.slice(-14);
  return `<div class="barras-sono">${s.map((x) => `<div title="${x.dia}: ${x.horas} h"><i style="height:${Math.round(x.horas / 10 * 100)}%" class="${x.horas < 7.5 ? 'curta' : ''}"></i><small>${x.dia.slice(8)}</small></div>`).join('')}</div>`;
}
function diarioHTML(podeRegistrar) {
  const H = S.saude;
  return `<div class="cartao"><div class="linha"><b>😴 Sono · 14 noites</b><span class="espaco"></span><span class="selo">média ${mediaSono(14)} h</span></div>${graficoSono()}
      ${podeRegistrar ? `<div class="linha" style="flex-wrap:nowrap;margin-top:8px"><input class="campo-in" id="sdHoras" type="number" min="3" max="14" step="0.5" placeholder="Horas de sono hoje"><button class="btn" id="sdSono">Registrar</button></div>` : ''}</div>
    <div class="cartao"><b>📓 Crises (30 dias)</b>
      <ul class="eventos">${H.crises.slice(0, 5).map((c) => `<li><span class="ic">🌩️</span><div>${esc(c.gatilho)} · ${c.duracao} min · ${esc(c.local || '')}<time>${haQuanto(c.data)}</time></div></li>`).join('')}</ul>
      ${podeRegistrar ? `<details><summary><b>+ Registrar crise</b></summary>
        <label class="campo">Possível gatilho</label><select class="campo-in" id="sdGat">${['barulho', 'mudança de rotina', 'fila / espera', 'fome ou cansaço', 'toque / roupa', 'não sei'].map((g) => `<option>${g}</option>`).join('')}</select>
        <label class="campo">Duração (min)</label><input class="campo-in" id="sdDur" type="number" min="1" value="10">
        <label class="campo">Onde</label><input class="campo-in" id="sdLocal" placeholder="Ex.: mercado">
        <button class="btn primario bloco" id="sdCrise" style="margin-top:8px">Salvar no diário</button></details>` : ''}</div>
    <div class="cartao" style="border-left:4px solid var(--ciano)"><span class="selo ia">Padrões que a IA percebeu</span>
      <ul style="margin:8px 0 0;padding-left:18px" class="peq">${padroesIA().map((p) => `<li style="margin-bottom:6px">${p}</li>`).join('')}</ul>
      <p class="peq suave" style="margin:6px 0 0">São observações para conversar com os profissionais, não diagnósticos.</p></div>
    <div class="cartao"><b>📝 Efeitos observados</b>
      <ul class="eventos">${H.efeitos.slice(0, 4).map((e) => `<li><span class="ic">•</span><div>${esc(e.texto)}<time>${esc(conta(e.por)?.nome || '')} · ${haQuanto(e.data)}</time></div></li>`).join('')}</ul>
      ${podeRegistrar ? `<div class="linha" style="gap:5px">${['Dormiu bem', 'Demorou a dormir', 'Mais agitado', 'Mais sonolento de dia', 'Apetite menor'].map((t) => `<button class="btn" data-efeito="${t}" style="font-size:12px;min-height:32px;padding:3px 9px">${t}</button>`).join('')}</div>` : ''}</div>`;
}
function ligarSaudeComum(raiz, de) {
  const q = (s) => $(raiz, s);
  raiz.querySelectorAll('[data-sim-lembrete]').forEach((b) => b.onclick = () => { emitir('med_lembrete', { med: b.dataset.simLembrete }, 'lumi'); toast('Lembrete disparado no celular do Lucas.'); });
  raiz.querySelectorAll('[data-dei]').forEach((b) => b.onclick = () => emitir('med_dado', { med: b.dataset.dei }, de));
  q('#sdSono') && (q('#sdSono').onclick = () => { const h = +q('#sdHoras').value; if (!h) return toast('Informe as horas.'); emitir('sono_registrado', { horas: h }, de); });
  q('#sdCrise') && (q('#sdCrise').onclick = () => emitir('crise_registrada', { gatilho: q('#sdGat').value, duracao: +q('#sdDur').value || 1, local: q('#sdLocal').value.trim() }, de));
  raiz.querySelectorAll('[data-efeito]').forEach((b) => b.onclick = () => { emitir('efeito', { texto: b.dataset.efeito }, de); toast('Registrado. A Dra. Helena também vê.'); });
}

// Resumo imprimível para levar à consulta
function exportarResumo() {
  const C = S.caa?.historico?.at(-1);
  const w = window.open('', '_blank');
  if (!w) return toast('Permita pop-ups para gerar o resumo.');
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Resumo · ${esc(S.perfil.nome)}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:760px;margin:30px auto;padding:0 20px;color:#111}h1{font-size:22px}h2{font-size:16px;margin-top:22px;border-bottom:1px solid #ccc;padding-bottom:4px}td,th{text-align:left;padding:4px 8px;border-bottom:1px solid #eee}small{color:#666}</style></head><body>
    <h1>Resumo para consulta · ${esc(S.perfil.nome)}, ${S.perfil.idade} anos</h1><small>Gerado pelo Passo a Passo em ${new Date().toLocaleString('pt-BR')} · dados de demonstração</small>
    <h2>Rotinas</h2><table>${S.rotinas.map((r) => `<tr><td>${esc(r.nome)}</td><td>fase ${faseDe(r.id)}</td><td>${esc(sugestao(r.id).texto)}</td></tr>`).join('')}</table>
    <h2>Medicação (30 dias)</h2><table>${S.saude.meds.map((m) => `<tr><td>${esc(m.nome)}</td><td>${esc(m.dose)} às ${m.horario}</td><td>adesão ${adesao(30, m.id)}%</td></tr>`).join('')}</table>
    <h2>Sono e crises</h2><p>Sono médio (14 noites): ${mediaSono(14)} h · Crises em 30 dias: ${S.saude.crises.length}</p><ul>${padroesIA().map((p) => `<li>${p}</li>`).join('')}</ul>
    <h2>Comunicação (CAA)</h2><p>${C ? `${C.tamanho} figuras por frase · ${C.vocab} palavras · ${C.iniciadas}% das conversas iniciadas por ele` : '—'}</p>
    <h2>Metas do plano</h2><ul>${S.saude.metas.map((g) => `<li>${esc(g.texto)}: ${valorMeta(g)}${g.unidade} / meta ${g.alvo}${g.unidade}</li>`).join('')}</ul>
    <p><small>Observações para apoiar a conversa com os profissionais. Não substitui avaliação clínica.</small></p>
    <script>window.print()<\/script></body></html>`);
  w.document.close();
}

// ---------- Família: aba Saúde ----------
R.abas.saude = () => `
  <div class="cab-resp"><span class="avatar">💊</span><div><b>Saúde do Lucas</b><br><span class="peq suave">Remédios, sono, crises e conversa com a IA. A Dra. Helena e a Dra. Júlia acompanham.</span></div></div>
  <div class="metricas">
    <div class="metrica"><b>${adesao(30)}%</b><span>doses confirmadas em 30 dias</span></div>
    <div class="metrica"><b>${mediaSono(7)} h</b><span>sono médio na semana</span></div>
    <div class="metrica"><b>${S.saude.crises.filter((c) => c.data > Date.now() - 30 * 864e5).length}</b><span>crises em 30 dias</span></div>
  </div>
  <div class="titulo-sec">Remédios</div>${cartaoRemedios('familia')}
  <div class="titulo-sec">Diário</div>${diarioHTML(true)}
  <div class="titulo-sec">Converse com a IA sobre o tratamento</div>${chatIA('ana', 'ana')}
  <button class="btn bloco" id="sdExportar">🖨️ Exportar resumo para a consulta</button>`;

// Aba "Mais": seção de voz e volume do Lumi (a família ajusta; o Lucas também, em "Meu jeito")
R.secoesMais.unshift(() => `<div class="cartao"><b>🗣️ Voz e volume do Lumi</b>
    <label class="campo">Voz</label><select class="campo-in" id="rVoz">${opcoesVoz()}</select>${dicaVoz()}
    <label class="campo">Volume: <span id="rVolV">${Math.round((S.perfil.volume ?? .8) * 100)}%</span></label><input type="range" id="rVol" min="0" max="100" value="${Math.round((S.perfil.volume ?? .8) * 100)}">
    <button class="btn bloco" id="rTestarVoz" style="margin-top:6px">▶ Ouvir</button>
    <p class="peq suave" style="margin:6px 0 0">O Lucas também ajusta volume, voz e tela calma em "Meu jeito".</p></div>`);

R.ligarSaude = () => {
  ligarSaudeComum(R.raiz, EU);
  ligarChat(R.raiz, () => R.render());
  const q = (s) => $(R.raiz, s);
  q('#sdExportar') && (q('#sdExportar').onclick = exportarResumo);
  q('#rVoz') && (q('#rVoz').onchange = (e) => { S.perfil.vozNome = e.target.value; escolherVoz(); salvar(); falar('Oi! Esta é a voz do Lumi.', true); });
  q('#rVol') && (q('#rVol').oninput = (e) => { S.perfil.volume = e.target.value / 100; q('#rVolV').textContent = e.target.value + '%'; salvar(); });
  q('#rTestarVoz') && (q('#rTestarVoz').onclick = () => falar(`Oi, ${S.perfil.nome}! Eu sou o Lumi. Vamos juntos, um passo de cada vez.`, true));
};

// Valor atual de uma meta do plano terapêutico, calculado com os dados do dia a dia
function valorMeta(g) {
  if (g.calc === 'caa') return S.caa?.historico?.at(-1)?.tamanho ?? g.inicio;
  if (g.calc === 'fase') return faseDe('mochila');
  if (g.calc === 'p4') {
    const regs = S.sessoes.filter((s) => s.rotina === 'padaria' && s.data > Date.now() - 60 * 864e5).flatMap((s) => s.passos.filter((p) => p.id === 'p4').map((p) => acerto(p, s.fase)));
    return regs.length ? Math.round(regs.filter(Boolean).length / regs.length * 100) : g.inicio;
  }
  return g.atual ?? g.inicio;
}

// ---------- Registro no núcleo ----------
MODULOS.push({ nome: 'saude', dados: saudePadrao, aplicar: aplicarSaude, receber: receberSaude, texto: textoSaude });
R.selos.saude = () => S.saude.meds.filter((m) => m.estoque <= 7).length;
R.ligadores.push(() => R.ligarSaude());
