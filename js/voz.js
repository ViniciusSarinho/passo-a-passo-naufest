/* ============================================================================
   VOZ · falas gravadas com voz humana + estúdio de gravação
   O app toca a fala gravada e só usa a voz sintética quando ela ainda não existe.
   Os áudios vêm de dois lugares:
     1. gravados no "Estúdio de voz" deste navegador (IndexedDB, só neste aparelho);
     2. arquivos publicados em audio/lumi/, listados em audio/lumi/falas.json
        (o pacote .zip que o estúdio exporta).
   O inventário das falas (todasAsFalas) é gerado a partir do próprio conteúdo do app,
   então o roteiro de gravação nunca fica desatualizado.
   ============================================================================ */

const chaveFala = (t) => String(t).toLowerCase().replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const slug = (t) => chaveFala(t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').slice(0, 40);

// ---------- Inventário: todas as falas fixas que o Lumi diz ----------
function todasAsFalas() {
  const L = [], vistos = new Set();
  const add = (id, grupo, texto, essencial = false, dica = '') => {
    if (!texto) return;
    const k = chaveFala(texto);
    if (!k || vistos.has(k)) return;
    vistos.add(k); L.push({ id, grupo, texto, essencial, dica });
  };
  const n = S.perfil.nome, h = S.perfil.hiperfoco || 'aventuras';

  // Guia: cada passo em quatro formas (frase simples, pergunta, curta, explicada)
  S.rotinas.forEach((r) => {
    const escolhas = r.passos.find((p) => p.tipo === 'escolha')?.opcoes || [];
    r.passos.forEach((p) => {
      const temEscolha = /\{escolha\}/.test(p.normal + p.curta + p.explica + p.pergunta);
      const variantes = temEscolha && escolhas.length ? escolhas : [null];
      variantes.forEach((o) => {
        const suf = o ? '-' + slug(o.texto) : '', e = o?.frase;
        const g = `Guia · ${r.nome}`;
        add(`guia-${p.id}-normal${suf}`, g, preencher(p.normal, e), true, 'Instrução da fase 1, nível 2 de suporte.');
        add(`guia-${p.id}-pergunta${suf}`, g, preencher(p.pergunta, e), true, 'Pergunta da fase 2: tom curioso, sem cobrança.');
        add(`guia-${p.id}-curta${suf}`, g, preencher(p.curta, e), false, 'Nível 3 de suporte: bem curto e claro.');
        add(`guia-${p.id}-curta-pergunta${suf}`, g, preencher(p.curta, e).replace(/\.$/, '?'), false, 'Nível 3, em forma de pergunta.');
        add(`guia-${p.id}-explica${suf}`, g, preencher(p.explica, e), false, 'Nível 1 de suporte: explicativo, sem pressa.');
      });
      if (p.objeto && p.objeto !== '$escolha') ['à sua esquerda', 'à sua direita', 'bem na sua frente'].forEach((lado) =>
        add(`posicao-${slug(p.objeto)}-${slug(lado)}`, 'Guia · direções', frasePosicao(p.objeto, lado) + '.', false, 'Dita depois da instrução, quando a câmera vê o objeto.'));
    });
    escolhas.forEach((o) => {
      add(`escolha-${slug(o.texto)}`, `Guia · ${r.nome}`, o.texto + '.', false, 'Repete a opção escolhida.');
      if (o.objeto) ['à sua esquerda', 'à sua direita', 'bem na sua frente'].forEach((lado) =>
        add(`posicao-${slug(o.objeto)}-${slug(lado)}`, 'Guia · direções', frasePosicao(o.objeto, lado) + '.'));
    });
  });
  add('escolha-boa', 'Elogios e incentivo', 'Boa escolha!', true);
  add('calma-lembrete', 'Guia · direções', 'Se ficar difícil, aperte calma.', false);

  // Elogios
  frasesElogio(n, h).forEach((t, i) => add(`elogio-${i + 1}`, 'Elogios e incentivo', t, true, 'Alegre, mas sem gritar.'));
  add('elogio-proximo', 'Elogios e incentivo', 'Isso! Próximo passo.', true);
  add('elogio-curto', 'Elogios e incentivo', 'Isso.', true);
  add('fim-concluida', 'Elogios e incentivo', `Muito bem, ${n}! Tarefa concluída.`, true);
  add('fim-tentou', 'Elogios e incentivo', 'Você tentou, e isso conta. Amanhã a gente tenta de novo.', true, 'Acolhedor.');
  LUMI_NIVEIS.slice(1).forEach((l, i) => add(`fim-evoluiu-${i + 2}`, 'Elogios e incentivo', `Uau! O Lumi evoluiu e ${l.texto.toLowerCase()}!`));

  // Calma e segurança
  add('calma-respirar', 'Calma e segurança', 'Tudo bem. Vamos respirar juntos. Puxa o ar devagar... e solta.', true, 'Bem devagar, voz baixa.');
  add('calma-respirar-2', 'Calma e segurança', 'Vamos respirar juntos. Puxa o ar devagar... e solta.', true, 'Bem devagar, voz baixa.');
  add('calma-hiperfoco', 'Calma e segurança', `Tudo bem. Sabia que alguns ${h} eram calmos e lentos? Vamos respirar devagar, como eles.`);
  const avisados = S.contas.filter((c) => c.permissoes.includes('emergencia')).map((c) => c.nome);
  add('sos-pedi', 'Calma e segurança', `Pedi ajuda. Avisei ${avisados.join(' e ')}. Fique onde está. Você está seguro comigo.`, true, 'Firme e tranquilizador.');
  S.contas.filter((c) => c.papel === 'responsavel').forEach((c) => {
    add(`sos-caminho-${c.id}`, 'Calma e segurança', `${c.nome} está a caminho. Fique onde está. Você está seguro.`, true);
    add(`banner-caminho-${c.id}`, 'Calma e segurança', `${c.nome} está a caminho.`);
  });
  add('barulho', 'Calma e segurança', 'Está barulhento aqui. Quer colocar o abafador ou respirar comigo um pouco?', true);

  // Remédios
  S.saude?.meds.forEach((m) => add(`remedio-${m.id}`, 'Remédios', `${n}, hora do remédio. ${m.passos.map((p) => p[1]).join('. ')}.`, true));
  add('remedio-lembra', 'Remédios', 'Lembra do remédio? Estou aqui com você.', true);
  add('remedio-tomou', 'Remédios', 'Muito bem! Você cuidou de você.', true);
  add('remedio-ajuda', 'Remédios', 'Avisei a mamãe que você precisa de ajuda com o remédio.');

  // História social (igual à tela de história)
  S.rotinas.forEach((r) => {
    const con = ['Primeiro, eu', 'Depois, eu', 'Então, eu', 'Em seguida, eu', 'Agora, eu', 'Depois, eu'];
    const g = `História · ${r.nome}`;
    add(`hist-${r.id}-0`, g, `Hoje eu vou ${r.objetivo}${r.lugar ? ' ' + r.lugar : ''}.`);
    add(`hist-${r.id}-0c`, g, `Hoje: ${r.nome.toLowerCase()}.`);
    r.passos.forEach((p, i) => add(`hist-${r.id}-${i + 1}`, g, `${i === r.passos.length - 1 ? 'Por fim, eu' : con[Math.min(i, con.length - 1)]} ${p.historia}.`));
  });
  add('hist-calma', 'História social', 'Se ficar difícil, tudo bem. Posso apertar "calma" e respirar com o Lumi.');
  add('hist-estrelas', 'História social', 'Quando terminar, eu e o Lumi ganhamos estrelas!');
  add('hist-calma-c', 'História social', 'Difícil? Botão de calma.');
  add('hist-fim-c', 'História social', 'Pronto. Muito bem!');

  // Avisos, humor e conversas
  const ana = conta('ana')?.nome || 'Ana';
  AVISOS_RAPIDOS.forEach((t, i) => add(`aviso-${i + 1}`, 'Avisos e conversas', `${ana} mandou um aviso: ${t}`));
  [['😊', 'Que bom! Vamos ter um ótimo dia.'], ['😐', 'Tudo bem. Estou aqui com você.'], ['😣', 'Obrigado por me contar. Quer respirar comigo?'], ['😴', 'Entendi. Vamos com calma hoje.']]
    .forEach(([, t], i) => add(`humor-${i + 1}`, 'Avisos e conversas', t, true));
  S.rotinas.forEach((r) => [2, 3].forEach((f) => add(`fase-${r.id}-${f}`, 'Avisos e conversas', `${ana} aprovou: em "${r.nome}" agora você está na fase ${f}. Vou ajudar um pouco menos, porque você está aprendendo!`)));
  add('pedido-confirmado', 'Avisos e conversas', 'A mamãe confirmou o seu pedido! Já está na sua agenda.');
  add('combinado', 'Avisos e conversas', 'Combinado!');
  add('voz-teste', 'Avisos e conversas', `Oi, ${n}! Eu sou o Lumi. Vamos juntos, um passo de cada vez.`, true, 'Apresentação do Lumi: simpática e calma.');
  add('voz-nova', 'Avisos e conversas', `Oi, ${n}! Esta é a minha nova voz.`);
  add('voz-ok', 'Avisos e conversas', 'Assim está bom?');
  add('voz-familia', 'Avisos e conversas', 'Oi! Esta é a voz do Lumi.');

  // Comunicação (CAA): frases prontas, falas do guia e cartão de ajuda
  FRASES_CAA.forEach((f, i) => add(`caa-frase-${i + 1}`, 'Comunicação (CAA)', f.texto, true, 'Fala do Lucas para outras pessoas: clara, natural.'));
  S.rotinas.forEach((r) => {
    const escolhas = r.passos.find((p) => p.tipo === 'escolha')?.opcoes || [];
    r.passos.filter((p) => p.fala).forEach((p) => (/\{escolha\}/.test(p.fala) ? escolhas : [null]).forEach((o) =>
      add(`caa-${p.id}${o ? '-' + slug(o.texto) : ''}`, 'Comunicação (CAA)', preencher(p.fala, o?.frase), true)));
  });
  add('caa-pedir-paes', 'Comunicação (CAA)', 'Quero cinco pães, por favor.');
  add('cartao-ajuda', 'Comunicação (CAA)', `Meu nome é ${n}. Sou autista. Por favor, fale devagar e com calma.`, true);
  S.caa?.combinados.forEach((c) => add(`combinado-${c.id}`, 'Avisos e conversas', `Muito bem! Agora é hora de: ${c.depoisTxt}.`));

  // Figuras da CAA: uma palavra cada, ditas quando o Lucas toca na figura
  if (typeof PICTOS !== 'undefined') Object.entries(PICTOS).forEach(([id, [, t]]) => add(`figura-${id}`, 'Figuras da CAA', t, false, 'Uma palavra, tom neutro.'));

  // Falas que o app disse e ainda não estavam na lista (aprendidas durante o uso)
  (S.vozExtras || []).forEach((t, i) => add(`extra-${slug(t)}`, 'Outras falas usadas', t));
  return L;
}

// ---------- Armazenamento das gravações (IndexedDB) ----------
const BANCO = { db: null };
function abrirBanco() {
  if (BANCO.db) return Promise.resolve(BANCO.db);
  return new Promise((ok, erro) => {
    const r = indexedDB.open('pap-voz', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('falas');
    r.onsuccess = () => ok(BANCO.db = r.result);
    r.onerror = () => erro(r.error);
  });
}
async function bancoOp(modo, fn) {
  const db = await abrirBanco();
  return new Promise((ok, erro) => {
    const tx = db.transaction('falas', modo), st = tx.objectStore('falas');
    const req = fn(st);
    tx.oncomplete = () => ok(req?.result); tx.onerror = () => erro(tx.error);
  });
}
const gravacoes = new Map(); // chave da fala -> { blob, id, origem }
async function carregarGravacoes() {
  try {
    const todas = await bancoOp('readonly', (st) => st.getAll());
    const chaves = await bancoOp('readonly', (st) => st.getAllKeys());
    chaves.forEach((k, i) => gravacoes.set(k, { ...todas[i], origem: 'aparelho' }));
  } catch (e) {}
}
async function salvarGravacao(texto, id, blob) {
  const k = chaveFala(texto);
  await bancoOp('readwrite', (st) => st.put({ id, texto, blob, data: Date.now() }, k));
  gravacoes.set(k, { id, texto, blob, origem: 'aparelho' });
}
async function apagarGravacao(texto) {
  const k = chaveFala(texto);
  await bancoOp('readwrite', (st) => st.delete(k));
  gravacoes.delete(k);
}

// Arquivos publicados junto com o site (pacote exportado pelo estúdio)
const publicadas = new Map(); // chave -> url
async function carregarPublicadas() {
  try {
    const r = await fetch('audio/lumi/falas.json', { cache: 'no-cache' });
    if (!r.ok) return;
    const lista = await r.json();
    (lista.falas || []).forEach((f) => publicadas.set(chaveFala(f.texto), 'audio/lumi/' + f.arquivo));
  } catch (e) {}
}

// ---------- Reprodução ----------
const tocador = { audio: null, fila: [], token: 0, urls: [] };
function pararAudio() {
  tocador.token++;
  if (tocador.audio) { tocador.audio.pause(); tocador.audio = null; }
  tocador.urls.forEach((u) => URL.revokeObjectURL(u)); tocador.urls = [];
}
VOZ.aoParar.push(pararAudio); // pararFala() (nucleo.js) também interrompe os áudios gravados

function fonteDe(chave) {
  const g = gravacoes.get(chave);
  if (g) { const u = URL.createObjectURL(g.blob); tocador.urls.push(u); return u; }
  return publicadas.get(chave) || null;
}
// Procura a fala inteira; se não houver, tenta frase por frase. Só toca gravação se TODAS as partes existirem
// (misturar voz humana e sintética na mesma fala soa estranho).
function partesGravadas(texto) {
  const tem = (k) => gravacoes.has(k) || publicadas.has(k);
  const inteira = chaveFala(texto);
  if (tem(inteira)) return [inteira];
  const frases = (texto.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || []).map((f) => f.trim()).filter(Boolean);
  if (frases.length < 2) return null;
  // Junta o maior trecho gravado possível a cada passo (ex.: instrução gravada + "A mochila está à sua esquerda.")
  const partes = [];
  for (let i = 0; i < frases.length;) {
    let j = frases.length;
    while (j > i && !tem(chaveFala(frases.slice(i, j).join(' ')))) j--;
    if (j === i) return null;
    partes.push(chaveFala(frases.slice(i, j).join(' ')));
    i = j;
  }
  return partes;
}
// Motor de voz que o núcleo passa a usar: fala gravada quando existe; senão, a voz sintética do aparelho
function falarComGravacoes(texto, forcar) {
  if ((!S.perfil.voz && !forcar) || !texto) return;
  pararFala();
  const partes = partesGravadas(texto);
  if (!partes) {
    registrarFaltante(texto);
    return falarSintetico(texto, forcar);
  }
  const meu = ++tocador.token;
  const tocar = (i) => {
    if (meu !== tocador.token || i >= partes.length) return;
    const a = new Audio(fonteDe(partes[i]));
    a.volume = Math.max(0, Math.min(1, S.perfil.volume ?? 0.8));
    a.playbackRate = Math.max(0.8, Math.min(1.25, (S.perfil.velocidade || 0.9) / 0.9));
    a.preservesPitch = true;
    a.onended = () => setTimeout(() => tocar(i + 1), 120);
    a.onerror = () => { if (meu === tocador.token) falarSintetico(texto, forcar); };
    tocador.audio = a;
    a.play().catch(() => { if (meu === tocador.token) falarSintetico(texto, forcar); });
  };
  tocar(0);
}
VOZ.motor = falarComGravacoes;
function registrarFaltante(texto) {
  const k = chaveFala(texto);
  if (!k || k.length > 400) return;
  const conhecidas = new Set(todasAsFalas().map((f) => chaveFala(f.texto)));
  if (conhecidas.has(k)) return;
  // Fala composta de frases que já estão no roteiro (ex.: "Banana." + "Boa escolha!") não precisa de gravação própria
  const frases = (texto.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || []).map((f) => chaveFala(f)).filter(Boolean);
  if (frases.length > 1 && frases.every((f) => conhecidas.has(f))) return;
  S.vozExtras = S.vozExtras || [];
  if (!S.vozExtras.some((t) => chaveFala(t) === k)) { S.vozExtras.push(texto); S.vozExtras = S.vozExtras.slice(-80); salvar(); }
}

// ---------- Estúdio de voz ----------
const Est = { filtro: 'Essenciais', gravando: null, rec: null, partes: [], stream: null };
function grupos(lista) { return ['Essenciais', 'Todas', ...new Set(lista.map((f) => f.grupo))]; }
function statusFala(f) { const k = chaveFala(f.texto); return gravacoes.has(k) ? 'aparelho' : publicadas.has(k) ? 'publicada' : null; }

function abrirEstudio() {
  document.getElementById('estudio')?.remove();
  const ov = document.createElement('div');
  ov.className = 'modal-comparar'; ov.id = 'estudio';
  document.body.appendChild(ov);
  ov.onclick = (e) => { if (e.target === ov) fecharEstudio(); };
  desenharEstudio();
}
function fecharEstudio() {
  pararGravacao(true);
  document.getElementById('estudio')?.remove();
  if (Est.stream) { Est.stream.getTracks().forEach((t) => t.stop()); Est.stream = null; }
}

function desenharEstudio() {
  const ov = document.getElementById('estudio'); if (!ov) return;
  const lista = todasAsFalas();
  const ess = lista.filter((f) => f.essencial);
  const feitas = lista.filter(statusFala).length, feitasEss = ess.filter(statusFala).length;
  const vis = Est.filtro === 'Todas' ? lista : Est.filtro === 'Essenciais' ? ess : lista.filter((f) => f.grupo === Est.filtro);
  const rolagem = ov.querySelector('.lista-falas')?.scrollTop || 0;
  ov.innerHTML = `<div class="caixa-modal estudio" role="dialog" aria-label="Estúdio de voz do Lumi">
    <div class="linha"><h2 style="font-size:20px;flex:1">🎙️ Estúdio de voz do Lumi</h2><button class="btn" id="estFechar" aria-label="Fechar">✕</button></div>
    <p class="peq suave" style="margin:4px 0 10px">Grave cada fala com voz humana. Assim que uma fala é gravada, o Lumi passa a usá-la no lugar da voz sintética. As falas ainda não gravadas continuam com a voz do aparelho.</p>
    <div class="metricas" style="margin-bottom:10px">
      <div class="metrica"><b>${feitasEss}/${ess.length}</b><span>essenciais gravadas</span></div>
      <div class="metrica"><b>${feitas}/${lista.length}</b><span>falas gravadas no total</span></div>
      <div class="metrica"><b>${publicadas.size}</b><span>áudios publicados no site</span></div>
    </div>
    <div class="xp" style="margin-bottom:12px"><div style="width:${Math.round(feitasEss / Math.max(1, ess.length) * 100)}%"></div></div>
    <div class="linha" style="gap:6px;margin-bottom:10px">
      <label class="btn" style="cursor:pointer">⬆️ Importar áudios<input type="file" id="estImportar" accept="audio/*" multiple hidden></label>
      <button class="btn" id="estZip">📦 Baixar pacote (.zip)</button>
      <button class="btn" id="estRoteiro">📝 Baixar roteiro (.csv)</button>
    </div>
    <div class="cats">${grupos(lista).map((g) => `<button data-est-grupo="${esc(g)}" aria-pressed="${Est.filtro === g}">${esc(g)}</button>`).join('')}</div>
    <div class="lista-falas">${vis.map((f) => { const st = statusFala(f), grav = Est.gravando === f.id;
      return `<div class="fala ${st ? 'ok' : ''} ${grav ? 'gravando' : ''}">
        <div class="fala-txt"><b>${esc(f.texto)}</b><small>código: ${esc(f.id)} · ${esc(f.grupo)}${f.dica ? ' · ' + esc(f.dica) : ''}</small></div>
        <div class="fala-acoes">
          <button class="btn" data-est-ref="${esc(f.id)}" title="Ouvir a referência (voz do aparelho)">🔈</button>
          <button class="btn ${grav ? 'perigo' : 'primario'}" data-est-gravar="${esc(f.id)}">${grav ? '⏹ Parar' : '⏺ Gravar'}</button>
          ${st ? `<button class="btn" data-est-ouvir="${esc(f.id)}" title="Ouvir a gravação">▶</button>` : ''}
          ${st === 'aparelho' ? `<button class="btn" data-est-apagar="${esc(f.id)}" title="Apagar e regravar">🗑</button>` : ''}
          <span class="selo ${st ? 'ok' : ''}">${st === 'aparelho' ? '✓ gravada' : st === 'publicada' ? '✓ no site' : 'falta'}</span>
        </div></div>`; }).join('')}</div>
    <p class="peq suave" style="margin:10px 0 0">As gravações ficam neste navegador. Para que todos ouçam no site publicado, baixe o pacote .zip e coloque o conteúdo na pasta <b>audio/lumi/</b> do projeto. O roteiro completo, com orientações para quem grava, está em docs/FALAS-LUMI.md.</p>
  </div>`;
  ov.querySelector('.lista-falas').scrollTop = rolagem;
  const porId = (id) => lista.find((f) => f.id === id);
  $(ov, '#estFechar').onclick = fecharEstudio;
  ov.querySelectorAll('[data-est-grupo]').forEach((b) => b.onclick = () => { Est.filtro = b.dataset.estGrupo; desenharEstudio(); ov.querySelector('.lista-falas').scrollTop = 0; });
  ov.querySelectorAll('[data-est-ref]').forEach((b) => b.onclick = () => falarSintetico(porId(b.dataset.estRef).texto, true));
  ov.querySelectorAll('[data-est-ouvir]').forEach((b) => b.onclick = () => falar(porId(b.dataset.estOuvir).texto, true));
  ov.querySelectorAll('[data-est-apagar]').forEach((b) => b.onclick = async () => { await apagarGravacao(porId(b.dataset.estApagar).texto); desenharEstudio(); });
  ov.querySelectorAll('[data-est-gravar]').forEach((b) => b.onclick = () => {
    const f = porId(b.dataset.estGravar);
    if (Est.gravando === f.id) pararGravacao(false); else iniciarGravacao(f);
  });
  $(ov, '#estImportar').onchange = (e) => importarAudios([...e.target.files], lista);
  $(ov, '#estZip').onclick = () => exportarPacote(lista);
  $(ov, '#estRoteiro').onclick = () => baixarRoteiro(lista);
}

async function iniciarGravacao(f) {
  pararGravacao(true);
  pararFala();
  try {
    Est.stream = Est.stream || await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
  } catch (e) { return toast('Não consegui usar o microfone. Permita o acesso ou importe arquivos gravados em outro app.'); }
  const tipo = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || '';
  Est.partes = [];
  Est.rec = new MediaRecorder(Est.stream, tipo ? { mimeType: tipo } : undefined);
  Est.rec.ondataavailable = (e) => { if (e.data.size) Est.partes.push(e.data); };
  Est.rec.onstop = async () => {
    if (Est.descartar || !Est.partes.length) { Est.gravando = null; return desenharEstudio(); }
    const blob = new Blob(Est.partes, { type: Est.rec.mimeType || 'audio/webm' });
    await salvarGravacao(f.texto, f.id, blob);
    Est.gravando = null;
    desenharEstudio();
    falar(f.texto, true);
  };
  Est.descartar = false;
  Est.gravando = f.id;
  Est.rec.start();
  desenharEstudio();
}
function pararGravacao(descartar) {
  if (Est.rec && Est.rec.state === 'recording') { Est.descartar = descartar; Est.rec.stop(); }
}

// Importa arquivos gravados em outro app: o nome do arquivo deve ser o código da fala (ex.: elogio-1.mp3)
async function importarAudios(arquivos, lista) {
  let ok = 0; const sem = [];
  for (const a of arquivos) {
    const id = a.name.replace(/\.[a-z0-9]+$/i, '');
    const f = lista.find((x) => x.id === id);
    if (!f) { sem.push(a.name); continue; }
    await salvarGravacao(f.texto, f.id, a); ok++;
  }
  toast(`${ok} áudio(s) importados.${sem.length ? ` Sem fala correspondente: ${sem.slice(0, 3).join(', ')}${sem.length > 3 ? '…' : ''}` : ''}`);
  desenharEstudio();
}

const extensao = (tipo) => /mp4|m4a|aac/.test(tipo) ? 'm4a' : /mpeg|mp3/.test(tipo) ? 'mp3' : /ogg/.test(tipo) ? 'ogg' : /wav/.test(tipo) ? 'wav' : 'webm';
async function exportarPacote(lista) {
  const grav = lista.filter((f) => gravacoes.has(chaveFala(f.texto)));
  if (!grav.length) return toast('Ainda não há gravações neste navegador.');
  if (!window.JSZip) await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  const zip = new JSZip(), falasJson = [];
  grav.forEach((f) => {
    const g = gravacoes.get(chaveFala(f.texto));
    const arquivo = `${f.id}.${extensao(g.blob.type || '')}`;
    zip.file(arquivo, g.blob);
    falasJson.push({ id: f.id, arquivo, texto: f.texto, grupo: f.grupo });
  });
  // Mantém no pacote os áudios que já estavam publicados
  publicadas.forEach((url, k) => { if (!falasJson.some((x) => chaveFala(x.texto) === k)) { const f = lista.find((x) => chaveFala(x.texto) === k); if (f) falasJson.push({ id: f.id, arquivo: url.split('/').pop(), texto: f.texto, grupo: f.grupo }); } });
  zip.file('falas.json', JSON.stringify({ voz: 'Lumi', gerado: new Date().toISOString(), falas: falasJson }, null, 2));
  baixar(await zip.generateAsync({ type: 'blob' }), 'lumi-voz-audio.zip');
}
function baixarRoteiro(lista) {
  const linhas = [['codigo', 'grupo', 'essencial', 'texto', 'orientacao']].concat(lista.map((f) => [f.id, f.grupo, f.essencial ? 'sim' : 'não', f.texto, f.dica]));
  const csv = '﻿' + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  baixar(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'roteiro-falas-lumi.csv');
}
function baixar(blob, nome) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// Botões que abrem o estúdio: topo do app e seção "Voz humana" da aba Mais
document.getElementById('abrirEstudio').onclick = abrirEstudio;
R.secoesMais.unshift(() => {
  const lista = todasAsFalas(), ess = lista.filter((f) => f.essencial);
  return `<div class="cartao destaque"><b>🎙️ Voz humana do Lumi</b>
    <p class="peq" style="margin:6px 0">${ess.filter(statusFala).length} de ${ess.length} falas essenciais gravadas. O que ainda não foi gravado usa a voz do aparelho.</p>
    <button class="btn primario bloco" data-abrir-estudio>Abrir o estúdio de voz</button></div>`;
});
R.raiz.addEventListener('click', (e) => { if (e.target.closest('[data-abrir-estudio]')) abrirEstudio(); });

Promise.all([carregarGravacoes(), carregarPublicadas()]).then(() => { if (R.aba === 'ajustes') R.render(); });
