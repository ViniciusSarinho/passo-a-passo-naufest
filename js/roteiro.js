/* ============================================================================
   ROTEIRO · demonstração guiada de ~3 minutos
   Cada passo executa ações REAIS do app (as mesmas dos botões) e mostra o efeito
   na outra conta. Pode ser feito passo a passo ("Mostrar" → "Próximo") ou no modo
   automático, que também serve para gravar o vídeo de apresentação.
   O roteiro reinicia os dados fictícios e desliga câmera/microfone (para não pedir
   permissão), exceto no passo opcional da câmera.
   ============================================================================ */

const celular = () => window.matchMedia('(max-width: 960px)').matches;
// Mostra a conta certa. No computador as duas contas já aparecem lado a lado; no celular, troca a tela.
function ver(qual) {
  if (qual === 'paciente') { if (celular()) mostrarConta('paciente'); return; }
  mostrarConta(qual);
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
// Pausa de leitura: encurta quando o ritmo é acelerado (usado nos testes)
const pausa = (ms) => esperar(ms * ROTEIRO.ritmo);
const clicar = (seletor) => document.querySelector(seletor)?.click();
const aoVivoNaTela = () => { if (celular()) { ver('responsavel'); R.aba = 'inicio'; R.render(); } };

const PASSOS_ROTEIRO = [
  {
    titulo: 'Comece por aqui',
    texto: 'Este protótipo tem duas contas conectadas: o celular do Lucas (paciente) e o da Ana (mãe). O que acontece em um aparece no outro. O roteiro faz as ações por você.',
    olhe: 'Os dados são fictícios. O roteiro reinicia a demonstração e deixa câmera e microfone desligados, para não pedir permissões.',
    botao: '▶ Começar', leitura: 5000,
    async acao() {
      reiniciarDemonstracao();
      Object.assign(S.perfil, { camera: false, ruido: false, ouvir: false }); salvar();
      ver('paciente');
    },
  },
  {
    titulo: 'O Lumi guia, sem mandar',
    texto: 'O Lucas abre "Arrumar a mochila". Na fase 2, o Lumi não dá ordens: ele pergunta, e a resposta vem da pessoa.',
    olhe: 'No celular do Lucas, o Lumi faz uma pergunta. No da Ana, a aba "Ao vivo" já mostra o passo atual em tempo real.',
    async acao() {
      ver('paciente'); P.ir('guia', 'mochila'); await esperar(900);
      await pausa(2500); aoVivoNaTela();
    },
  },
  {
    titulo: 'Se travar, a ajuda sobe um degrau',
    texto: 'O Lucas demora. O Lumi passa de pergunta para instrução completa. Quando ele conclui, o Lumi comemora e ele ganha uma estrela.',
    olhe: 'A fala muda de pergunta para instrução; depois aparece "+1 ⭐". A Ana vê o nível de ajuda do Lumi em tempo real.',
    async acao() {
      ver('paciente');
      if (!P.g) { P.ir('guia', 'mochila'); await esperar(700); }
      await pausa(1200);
      P.g.nivel = 2; P.mostrarDica(true); emitir('progresso', { ...S.aoVivo, nivel: 2 });
      await pausa(3800); P.concluir('toque'); await esperar(2600);
    },
  },
  {
    titulo: 'Tomada de decisão com duas opções',
    texto: 'No passo do lanche, o Lumi reduz a escolha a duas figuras: banana ou maçã. É treino de decisão sem sobrecarga.',
    olhe: 'As duas opções grandes na tela do Lucas. A escolha vira o texto dos passos seguintes ("Guarde a banana").',
    async acao() {
      ver('paciente');
      if (!P.g || P.tela !== 'guia') { P.ir('guia', 'mochila'); await esperar(700); }
      clearTimeout(P.g.timer); P.g.pausado = false; P.g.idx = 3; P.iniciarPasso();
      await pausa(3000); clicar('#telaPaciente [data-escolha="0"]'); await esperar(2200);
    },
  },
  {
    titulo: 'Câmera: o Lumi enxerga (opcional)',
    texto: 'A visão computacional roda no próprio aparelho: nada é gravado nem enviado. O navegador vai pedir permissão da câmera. O modo automático pula este passo.',
    olhe: 'Mostre uma mochila, livro, garrafa, banana, maçã ou celular. A caixa verde aparece, o passo conclui sozinho e a etiqueta diz se o objeto está à esquerda ou à direita. Sem objeto, toque em "Fiz".',
    botao: '📷 Ligar a câmera', opcional: true,
    async acao() { Object.assign(S.perfil, { camera: true }); salvar(); ver('paciente'); P.ir('guia', 'mochila'); },
  },
  {
    titulo: 'Emergência: SOS com localização',
    texto: 'O Lucas segura o botão SOS. O Lumi o acalma, e todos os responsáveis são avisados na hora. A Ana responde "Estou a caminho".',
    olhe: 'Na tela da Ana: alerta com mapa, contexto ("passo 4 da rotina") e quem foi avisado. Depois, a resposta volta para o Lucas.',
    async acao() {
      S.perfil.camera = false; ver('paciente');
      if (P.tela !== 'guia') { P.ir('guia', 'mochila'); await esperar(700); }
      await P.sos(); await pausa(2400);
      ver('responsavel'); R.aba = 'inicio'; R.render(); await pausa(2800);
      emitir('a_caminho', { quem: 'Ana' }, 'ana'); await pausa(3000);
      ver('paciente'); clicar('#sBem'); await esperar(400);
    },
  },
  {
    titulo: 'Comunicação por figuras (CAA)',
    texto: 'O Lucas monta uma frase tocando figuras. A IA a transforma em linguagem natural, e a Ana recebe as figuras e o texto.',
    olhe: 'Frase montada: "Eu quero ir ao parque no sábado." O Lumi sugere a próxima figura com base no que ele mais usa.',
    async acao() {
      S.perfil.camera = false; ver('paciente');
      P.ir('conversar', 'falar'); P.caa.frase = []; P.telas.conversar('falar'); await esperar(800);
      for (const id of ['eu', 'quero', 'parque', 'sabado']) { P.caa.frase.push(id); P.telas.conversar('falar'); falar(P_(id)[1]); await esperar(700); }
      await pausa(1200); clicar('#caaEnviar'); await pausa(1800);
      ver('responsavel'); R.aba = 'conversa'; R.render();
    },
  },
  {
    titulo: 'Combinar, marcar e aceitar',
    texto: 'O Lucas pede para marcar um sorvete hoje. A Ana confirma, e o compromisso entra na agenda dele. Depois ele aceita um combinado "primeiro → depois".',
    olhe: 'O pedido chega à Ana com figuras; a confirmação volta ao Lucas. No combinado, ele toca "Combinado!".',
    async acao() {
      ver('paciente'); P.ir('conversar', 'marcar');
      P.caa.marcar = { atividade: 'sorvete', quando: 'hoje' }; P.telas.conversar('marcar'); await pausa(1800);
      clicar('#mkEnviar'); await pausa(1500);
      ver('responsavel'); R.aba = 'conversa'; R.render(); await pausa(2200);
      clicar('#telaResp [data-mk-conf]'); await pausa(1800);
      ver('paciente'); P.ir('conversar', 'combinados'); await pausa(2200);
      clicar('#telaPaciente [data-comb-aceitar]');
    },
  },
  {
    titulo: 'Remédio com lembrete em figuras',
    texto: 'Na hora do remédio, o Lumi mostra os passos com figuras. Quando o Lucas toca "Tomei", a Ana vê a confirmação, a adesão e o estoque.',
    olhe: 'Lembrete com 4 passos. Na aba Saúde da Ana: dose de hoje confirmada, adesão de 30 dias e aviso de reposição.',
    async acao() {
      ver('paciente'); P.ir('inicio'); emitir('med_lembrete', { med: 'med1' }, 'lumi');
      await pausa(4500); clicar('#remTomei'); await pausa(2400);
      ver('responsavel'); R.aba = 'saude'; R.render();
    },
  },
  {
    titulo: 'A IA pergunta e lê o laudo',
    texto: 'A Ana pede o relatório ao neuropsicólogo. Quando ele chega (PDF ou TXT), a IA lê, separa pontos fortes e dificuldades e sugere ajustes. Só entram com aprovação humana.',
    olhe: 'Cada área do laudo vira uma sugestão com o trecho original. Ao aprovar, o Lumi muda: história antes das tarefas, mais tempo de espera, pictogramas maiores.',
    async acao() {
      ver('responsavel'); R.aba = 'ia'; R.render(); await pausa(1500);
      emitir('pedido_laudo', { para: 'rafael' }, 'ana'); await pausa(1800);
      emitir('laudo_enviado', { texto: LAUDO_EXEMPLO, arquivo: 'Avaliacao_neuropsicologica_Lucas_2026.pdf' }, 'rafael'); await pausa(2200);
      [...document.querySelectorAll('#telaResp .titulo-sec')].find((e) => e.textContent.includes('Leitura'))?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      await pausa(3200); clicar('#rAplicarTodos');
    },
  },
  {
    titulo: 'Cada profissional, o seu papel',
    texto: 'A terapeuta monta o plano e as metas; o neuropsicólogo envia laudos; só a médica ajusta remédios. A tabela mostra o que cada conta vê e faz.',
    olhe: 'Plano com metas medidas pelos dados do dia a dia, e a tela de saúde da médica, com campos de dose e horário que só ela tem.',
    async acao() {
      ver('profissional'); Q.prof = 'julia'; Q.aba = 'resumo'; Q.render(); await pausa(2400);
      Q.aba = 'plano'; Q.render(); await pausa(2400);
      Q.prof = 'helena'; Q.aba = 'saude'; Q.render(); await pausa(2400);
      clicar('#comparar');
    },
  },
  {
    titulo: '14 meses de evolução, com recuos',
    texto: 'Autonomia leva meses e anos, com idas e vindas. O gráfico mostra fases, férias e a mudança de escola, e a IA sugere mudar de fase, mas só um humano aprova.',
    olhe: 'A curva sobe de ~50% para mais de 80%, com queda na mudança de escola. No fim do roteiro, câmera e microfone voltam ao que estavam.',
    botao: '📈 Ver evolução', leitura: 6000,
    async acao() {
      clicar('#fecharComp'); ver('responsavel'); R.aba = 'relatorio'; R.rotinaRel = 'mochila'; R.render();
      if (ROTEIRO.salvo) { Object.assign(S.perfil, ROTEIRO.salvo); salvar(); }
    },
  },
];

// ---------- Painel do roteiro ----------
const painel = document.createElement('section');
painel.id = 'roteiro'; painel.className = 'roteiro'; painel.hidden = true; painel.setAttribute('aria-label', 'Roteiro guiado');
document.body.appendChild(painel);

// Em telas baixas (notebooks), a dica "o que olhar" fica recolhida para o painel não cobrir os celulares
const telaBaixa = () => window.innerHeight < 800 && !celular();

function desenharRoteiro() {
  const p = PASSOS_ROTEIRO[ROTEIRO.i], ultimo = ROTEIRO.i === PASSOS_ROTEIRO.length - 1;
  const mostrarOlhe = !telaBaixa() || ROTEIRO.olhe;
  painel.classList.toggle('minimizado', ROTEIRO.minimizado);
  painel.innerHTML = ROTEIRO.minimizado
    ? `<button class="rt-pilula" id="rtAbrir">🧭 Roteiro · passo ${ROTEIRO.i + 1}/${PASSOS_ROTEIRO.length}</button>`
    : `<div class="rt-cab"><b>🧭 Roteiro guiado</b><span class="rt-passo">passo ${ROTEIRO.i + 1} de ${PASSOS_ROTEIRO.length}</span>
        <div class="rt-barra"><div style="width:${(ROTEIRO.i + 1) / PASSOS_ROTEIRO.length * 100}%"></div></div>
        <label class="rt-voz"><input type="checkbox" id="rtVoz" ${S.perfil.voz ? 'checked' : ''}> Lumi fala</label>
        ${telaBaixa() ? `<button class="rt-ic" id="rtOlhe" aria-label="Mostrar ou ocultar o que olhar" aria-pressed="${!!ROTEIRO.olhe}">👀</button>` : ''}
        <button class="rt-ic" id="rtMin" aria-label="Minimizar">–</button><button class="rt-ic" id="rtFechar" aria-label="Fechar o roteiro">✕</button></div>
      <div class="rt-corpo"><div class="rt-info"><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p>${mostrarOlhe ? `<p class="rt-olhe">👀 <b>O que olhar:</b> ${esc(p.olhe)}</p>` : ''}</div>
        <div class="rt-acoes">
          <button class="btn primario" id="rtMostrar" ${ROTEIRO.ocupado ? 'disabled' : ''}>${ROTEIRO.ocupado ? '⏳ Executando…' : (p.botao || '▶ Mostrar')}</button>
          <div class="rt-nav"><button class="btn" id="rtAnt" ${ROTEIRO.i === 0 ? 'disabled' : ''} aria-label="Passo anterior">←</button>
            ${ultimo ? '<button class="btn" id="rtReiniciar">↺ Recomeçar</button>' : '<button class="btn" id="rtProx">Próximo →</button>'}</div>
          <button class="btn rt-auto ${ROTEIRO.automatico ? 'ativo' : ''}" id="rtAuto">${ROTEIRO.automatico ? '⏸ Pausar' : '▶▶ Automático'}</button>
        </div></div>`;
  const q = (s) => painel.querySelector(s);
  q('#rtAbrir') && (q('#rtAbrir').onclick = () => { ROTEIRO.minimizado = false; ajustarAltura(); desenharRoteiro(); });
  q('#rtMin') && (q('#rtMin').onclick = () => { ROTEIRO.minimizado = true; desenharRoteiro(); ajustarAltura(); });
  q('#rtFechar') && (q('#rtFechar').onclick = fecharRoteiro);
  q('#rtOlhe') && (q('#rtOlhe').onclick = () => { ROTEIRO.olhe = !ROTEIRO.olhe; desenharRoteiro(); });
  q('#rtVoz') && (q('#rtVoz').onchange = (e) => { S.perfil.voz = e.target.checked; salvar(); if (!e.target.checked) pararFala(); });
  q('#rtMostrar') && (q('#rtMostrar').onclick = () => executarPasso());
  q('#rtProx') && (q('#rtProx').onclick = () => irPasso(ROTEIRO.i + 1));
  q('#rtAnt') && (q('#rtAnt').onclick = () => irPasso(ROTEIRO.i - 1));
  q('#rtReiniciar') && (q('#rtReiniciar').onclick = () => { pararAutomatico(); irPasso(0); });
  q('#rtAuto') && (q('#rtAuto').onclick = () => (ROTEIRO.automatico ? pararAutomatico() : iniciarAutomatico()));
  ajustarAltura();
}
// Reserva espaço para o painel, para ele não cobrir os celulares
function ajustarAltura() {
  document.documentElement.style.setProperty('--rt-h', ROTEIRO.ativo ? painel.offsetHeight + 'px' : '0px');
}
window.addEventListener('resize', () => { if (ROTEIRO.ativo) ajustarAltura(); });

async function executarPasso() {
  if (ROTEIRO.ocupado) return;
  const p = PASSOS_ROTEIRO[ROTEIRO.i];
  ROTEIRO.ocupado = true; desenharRoteiro();
  try { await p.acao(); } catch (e) { toast('O roteiro encontrou um problema neste passo. Pode seguir para o próximo.'); }
  ROTEIRO.ocupado = false; desenharRoteiro();
}
function irPasso(i) {
  ROTEIRO.i = Math.max(0, Math.min(PASSOS_ROTEIRO.length - 1, i));
  desenharRoteiro();
}
async function iniciarAutomatico() {
  ROTEIRO.automatico = true; desenharRoteiro();
  while (ROTEIRO.automatico) {
    if (PASSOS_ROTEIRO[ROTEIRO.i].opcional) { irPasso(ROTEIRO.i + 1); continue; } // não pede permissão sem ninguém para aceitar
    await executarPasso();
    if (!ROTEIRO.automatico) break;
    await pausa(PASSOS_ROTEIRO[ROTEIRO.i].leitura || 6500);
    if (!ROTEIRO.automatico) break;
    if (ROTEIRO.i >= PASSOS_ROTEIRO.length - 1) { ROTEIRO.automatico = false; desenharRoteiro(); break; }
    irPasso(ROTEIRO.i + 1);
  }
}
function pararAutomatico() { ROTEIRO.automatico = false; desenharRoteiro(); }

function abrirRoteiro() {
  ROTEIRO.ativo = true; ROTEIRO.minimizado = false; ROTEIRO.i = 0;
  ROTEIRO.salvo = ROTEIRO.salvo || { camera: S.perfil.camera, ruido: S.perfil.ruido, ouvir: S.perfil.ouvir };
  painel.hidden = false; document.body.classList.add('com-roteiro');
  desenharRoteiro();
}
function fecharRoteiro() {
  pararAutomatico();
  if (ROTEIRO.salvo) { Object.assign(S.perfil, ROTEIRO.salvo); salvar(); ROTEIRO.salvo = null; }
  ROTEIRO.ativo = false; painel.hidden = true; document.body.classList.remove('com-roteiro');
  document.documentElement.style.setProperty('--rt-h', '0px');
}

document.getElementById('abrirRoteiro').onclick = () => (ROTEIRO.ativo ? fecharRoteiro() : abrirRoteiro());
if (new URLSearchParams(location.search).get('roteiro')) abrirRoteiro();
