/* ============================================================================
   NÚCLEO · estado, eventos, voz e regras de linguagem
   ----------------------------------------------------------------------------
   Tudo roda no navegador. As contas (paciente, família, profissionais) trocam
   EVENTOS dentro da página e entre abas (BroadcastChannel). No produto final, a
   mesma troca passaria por um servidor com criptografia.

   Ordem de carregamento (app.html):
   lumi → dados → nucleo → paciente → responsavel → conhecimento → caa → saude
   → profissional → voz → roteiro → iniciar

   Como estender: um módulo novo se registra em MODULOS (veja docs/ARQUITETURA.md).
   ============================================================================ */

// ---------- Estado compartilhado ----------
// Cada módulo opcional (conhecimento, caa, saude, profissional) registra um objeto aqui:
//   { nome, dados(), ajustar(S), aplicar(ev), receber(ev), texto(ev) }
//   dados    → estado inicial do módulo, guardado em S[nome]
//   ajustar  → migração/ajuste do estado já salvo
//   aplicar  → muda o estado quando um evento acontece (roda em TODAS as abas)
//   receber  → reage na tela quando um evento chega (banners, redesenho)
//   texto    → frase da linha do tempo para os eventos do módulo
const MODULOS = [];
const VERSAO_ESTADO = 'pap4';
const CHAVE = VERSAO_ESTADO + ':estado';
function carregar() {
  try { const v = localStorage.getItem(CHAVE); if (v) return JSON.parse(v); } catch (e) {}
  return null;
}
let S = carregar() || dadosDemonstracao();
function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {} }

function garantirModulos() {
  MODULOS.forEach((m) => {
    if (m.dados && !S[m.nome]) S[m.nome] = m.dados();
    m.ajustar?.(S);
  });
  salvar();
}

const canal = 'BroadcastChannel' in window ? new BroadcastChannel(VERSAO_ESTADO) : null;
if (canal) canal.onmessage = (e) => { S = carregar() || S; aoEvento(e.data); };

// Estado do roteiro guiado (roteiro.js). "ativo" também diz ao app para não pedir permissão de localização.
const ROTEIRO = { ativo: false, i: 0, ocupado: false, automatico: false, minimizado: false, ritmo: 1, salvo: null };

// Toda ação relevante vira um evento: muda o estado, é salva e chega às outras contas.
const EVENTOS_FORA_DA_LINHA_DO_TEMPO = ['progresso', 'fala_caa'];
function emitir(tipo, dados = {}, de = 'lucas') {
  const ev = { id: Date.now() + Math.random(), tipo, de, data: Date.now(), dados };
  aplicar(ev);
  if (!EVENTOS_FORA_DA_LINHA_DO_TEMPO.includes(tipo)) { S.eventos.unshift(ev); S.eventos = S.eventos.slice(0, 60); }
  salvar();
  canal?.postMessage(ev);
  aoEvento(ev);
}
function aplicar(ev) {
  const d = ev.dados;
  if (ev.tipo === 'sos') S.alerta = { data: ev.data, local: d.local, contexto: d.contexto, aCaminho: null };
  if (ev.tipo === 'sos_resolvido') S.alerta = null;
  if (ev.tipo === 'a_caminho' && S.alerta) S.alerta.aCaminho = d.quem;
  if (ev.tipo === 'progresso') S.aoVivo = { ...d, data: ev.data };
  if (ev.tipo === 'conclusao' || ev.tipo === 'encerrou') S.aoVivo = null;
  if (ev.tipo === 'fase_aprovada') S.perfil.fase[d.rotina] = d.fase;
  MODULOS.forEach((m) => m.aplicar?.(ev));
}
// Eventos que não merecem o "pacote" animado no fio entre as contas (são internos da IA)
const EVENTOS_SEM_ANIMACAO = ['pergunta_prof', 'resposta_prof', 'pedido_laudo', 'laudo_enviado', 'ajuste_ia', 'resposta_ia', 'fala_caa'];

function aoEvento(ev) {
  animarPacote(ev);
  P.receber(ev);
  MODULOS.forEach((m) => m.receber?.(ev));
  R.receber(ev);
}

// ---------- Utilidades ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (raiz, sel) => raiz.querySelector(sel);
const rotinaPorId = (id) => S.rotinas.find((r) => r.id === id) || S.rotinas[0];
const faseDe = (id) => S.perfil.fase[id] || 1;
const conta = (id) => S.contas.find((c) => c.id === id);
const nivelInicial = (fase) => (fase === 1 ? 2 : fase === 2 ? 1 : 0);
const NOME_FASE = { 1: 'Instrução total', 2: 'Pergunta', 3: 'Silêncio atento' };
const NOME_AJUDA = ['Sozinho', 'Com pergunta', 'Com instrução'];

function toast(texto) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = texto;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}
function haQuanto(t) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  return new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function hora() { return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }

let fioOcupado = 0;
function animarPacote(ev) {
  const fio = document.getElementById('fio');
  if (!fio || ev.tipo === 'progresso' && fioOcupado > 2 || EVENTOS_SEM_ANIMACAO.includes(ev.tipo)) return;
  const p = document.createElement('i');
  p.className = 'pacote ' + (ev.de === 'lucas' ? 'ida' : 'volta') + (ev.tipo === 'sos' ? ' sos' : '');
  fio.appendChild(p); fioOcupado++;
  setTimeout(() => { p.remove(); fioOcupado--; }, 1000);
}

// ---------- Voz ----------
// A voz do Lumi: prefere vozes neurais femininas em português (soam humanas), e a escolha fica salva no perfil.
let vozPt = null, vozesPt = [];
const VOZES_FEMININAS = /francisca|thalita|leila|let[ií]cia|manuela|yara|elza|giovanna|brenda|luciana|vit[óo]ria|fernanda|maria|helo[ií]sa|joana|camila|google portugu[eê]s/i;
const VOZES_MASCULINAS = /antonio|ant[ôo]nio|daniel|fabio|f[áa]bio|humberto|julio|j[úu]lio|nicolau|valerio|donato|felipe|ricardo|duarte/i;
function notaVoz(v) {
  let n = 0;
  if (v.lang === 'pt-BR') n += 30; else if (v.lang.startsWith('pt')) n += 10;
  if (/natural|neural|online|enhanced|premium|aprimorad/i.test(v.name)) n += 40;
  if (VOZES_FEMININAS.test(v.name)) n += 25;
  if (VOZES_MASCULINAS.test(v.name)) n -= 30;
  return n;
}
function escolherVoz() {
  vozesPt = speechSynthesis.getVoices().filter((x) => x.lang.toLowerCase().startsWith('pt')).sort((a, b) => notaVoz(b) - notaVoz(a));
  vozPt = vozesPt.find((x) => x.name === S.perfil.vozNome) || vozesPt[0] || null;
}
if ('speechSynthesis' in window) { escolherVoz(); speechSynthesis.onvoiceschanged = escolherVoz; }
// Motor de voz atual. voz.js troca VOZ.motor por um que toca as falas gravadas e, quando não há
// gravação, volta para falarSintetico. VOZ.aoParar guarda funções que interrompem áudios em andamento.
const VOZ = { motor: null, aoParar: [] };
function falar(texto, forcar) { return (VOZ.motor || falarSintetico)(texto, forcar); }
function pararFala() { VOZ.aoParar.forEach((f) => f()); window.speechSynthesis?.cancel(); }
function falarSintetico(texto, forcar) {
  if ((!S.perfil.voz && !forcar) || !('speechSynthesis' in window) || !texto) return;
  pararFala();
  const u = new SpeechSynthesisUtterance(texto.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ''));
  u.lang = 'pt-BR'; u.rate = S.perfil.velocidade;
  u.volume = S.perfil.volume ?? 0.8;
  // Vozes neurais já soam naturais; nas outras, um tom um pouco mais agudo e suave aproxima de uma voz feminina calma
  u.pitch = vozPt && /natural|neural|online/i.test(vozPt.name) ? 1 : 1.12;
  if (vozPt) u.voice = vozPt;
  speechSynthesis.speak(u);
}
function bipe() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, .35].forEach((t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; g.gain.value = .08;
      o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + .2);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch (e) {}
  navigator.vibrate?.([200, 100, 200]);
}

// ---------- Linguagem adaptada (no produto final: modelo de linguagem com estas mesmas regras) ----------
function preencher(txt, escolha) { return (txt || '').replace(/\{escolha\}/g, escolha || 'o que você escolheu'); }
function instrucao(p, escolha) {
  const n = S.perfil.nivel;
  const txt = preencher(n >= 3 ? p.curta : n <= 1 ? p.explica : p.normal, escolha);
  return S.perfil.lembreteFoco ? `${S.perfil.nome}, ${txt.charAt(0).toLowerCase()}${txt.slice(1)}` : txt;
}
function pergunta(p, escolha) {
  if (S.perfil.nivel >= 3) return preencher(p.curta, escolha).replace(/\.$/, '?');
  return preencher(p.pergunta, escolha);
}
function frasesElogio(n, h) {
  return [`Muito bem, ${n}! Você fez sozinho. Coisa de especialista em ${h}!`,
    `Isso, ${n}! Sem ajuda. Até quem ama ${h} ficaria impressionado.`,
    'Perfeito! Você lembrou sozinho. Ganhou uma estrela!'];
}
const OBJ_MASCULINOS = ['book', 'cell phone', 'cup', 'teddy bear', 'clock', 'remote', 'mouse', 'keyboard', 'laptop', 'sandwich', 'cake', 'umbrella'];
function frasePosicao(objeto, lado) {
  return `${OBJ_MASCULINOS.includes(objeto) ? 'O' : 'A'} ${OBJETOS[objeto] || objeto} está ${lado}`;
}
function elogio(sucesso, fase) {
  if (!sucesso || fase === 1) return S.perfil.nivel >= 3 ? 'Isso.' : 'Isso! Próximo passo.';
  const h = S.perfil.hiperfoco || 'aventuras', n = S.perfil.nome;
  const op = frasesElogio(n, h);
  return op[Math.floor(Math.random() * op.length)];
}

// ---------- Métricas ----------
function acerto(p, fase) {
  if (p.ajuda) return false;
  if (fase === 1) return p.tempo <= S.perfil.espera * 3;
  return p.nivel <= nivelInicial(fase);
}
function taxa(s) { return s.passos.length ? Math.round(s.passos.filter((p) => acerto(p, s.fase)).length / s.passos.length * 100) : 0; }
function media(lista) { return lista.length ? Math.round(lista.reduce((a, s) => a + taxa(s), 0) / lista.length) : 0; }
function sugestao(rid) {
  const fase = faseDe(rid);
  const naFase = S.sessoes.filter((s) => s.rotina === rid && s.fase === fase);
  if (naFase.length < 4) return { tipo: 'manter', texto: `Ainda poucas sessões na fase ${fase}. Continue praticando no ritmo do ${S.perfil.nome}.` };
  const ult = naFase.slice(-6), m = media(ult);
  if (m < 35 && fase > 1) return { tipo: 'voltar', nova: fase - 1, media: m, texto: `Média de ${m}% nas últimas ${ult.length} sessões. Sugiro voltar para a fase ${fase - 1} por um tempo, sem cobrança. Recuos fazem parte.` };
  if (m >= 80 && fase < 3) return { tipo: 'avancar', nova: fase + 1, media: m, texto: `Média de ${m}% nas últimas ${ult.length} sessões da fase ${fase}. Sugiro avançar para a fase ${fase + 1} (${NOME_FASE[fase + 1].toLowerCase()}).` };
  if (m >= 80) return { tipo: 'manter', media: m, texto: `Média de ${m}% sem ajuda. Rotina dominada! Que tal criar uma nova?` };
  return { tipo: 'manter', media: m, texto: `Média de ${m}% nas últimas ${ult.length} sessões da fase ${fase}. Manter a fase (meta: 80% de forma constante).` };
}

// Ícones da linha do tempo. Os módulos acrescentam os dos seus eventos com Object.assign(ICONE_EV, {...}).
const ICONE_EV = { inicio: '▶️', conclusao: '✅', encerrou: '⏹️', calma: '🫧', sos: '🆘', sos_resolvido: '💚', humor: '💭', barulho: '🔊', aviso: '📩', a_caminho: '🚗', fase_aprovada: '🎚️' };
function textoEvento(ev) {
  const d = ev.dados, quem = conta(ev.de)?.nome || '';
  const base = {
    inicio: () => `Lucas começou "${d.rotina}" (fase ${d.fase})`,
    conclusao: () => `Lucas concluiu "${d.rotina}": ${d.taxa}% sem ajuda extra${d.subiu ? ' · o Lumi evoluiu!' : ''}`,
    encerrou: () => `Lucas encerrou "${d.rotina}" antes do fim`,
    calma: () => `Lucas pediu uma pausa para se acalmar${d.rotina ? ` em "${d.rotina}"` : ''}`,
    sos: () => 'EMERGÊNCIA: Lucas pediu ajuda urgente',
    sos_resolvido: () => `${d.quem || quem} marcou a emergência como resolvida`,
    humor: () => `Lucas disse como está: ${d.emoji} ${d.texto}`,
    barulho: () => `Ambiente barulhento detectado em "${d.rotina}". O Lumi ofereceu uma pausa.`,
    aviso: () => `${quem} enviou um aviso: "${d.texto}"`,
    a_caminho: () => `${quem} avisou que está a caminho`,
    fase_aprovada: () => `${quem} aprovou a fase ${d.fase} em "${rotinaPorId(d.rotina).nome}"`,
  };
  return base[ev.tipo]?.() ?? MODULOS.map((m) => m.texto?.(ev)).find(Boolean) ?? ev.tipo;
}
