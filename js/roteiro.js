/* ============================================================================
   ROTEIRO · demonstração guiada
   Cada PASSO se divide em MOMENTOS curtos, cada um em um aparelho (celular do Lucas, relógio, celular da
   Ana, tablet do profissional). A pessoa decide quando virar a página: o botão principal diz o que vem
   a seguir ("Ver na tela da Ana →") e, depois do último momento, vira "Próximo passo →".
   O modo automático percorre tudo sozinho, com pausas de leitura, e serve para gravar vídeo.
   Cada momento executa ações REAIS do app (as mesmas dos botões).
   O roteiro reinicia os dados fictícios e desliga câmera/microfone (para não pedir permissão),
   exceto no passo opcional da câmera.

   Controle (o que evita "pular passos"):
   - ROTEIRO.m é o próximo momento do passo atual; só avança quando o momento termina de verdade.
   - Esperas são canceláveis: parar, fechar ou trocar de passo interrompe a ação em andamento
     (ROTEIRO.token), e o momento interrompido pode ser repetido.
   - Só pode haver um laço automático vivo (ROTEIRO.auto): retomar depois de pausar nunca duplica.
   - No passo opcional da câmera, o automático PARA e espera a pessoa decidir (ligar ou pular).
   ============================================================================ */

const celular = () => window.matchMedia('(max-width: 960px)').matches;
// Mostra o aparelho certo: no computador vira a página (modo foco); no celular troca a conta.
function ver(qual) {
  if (ROTEIRO.ativo && !celular() && typeof focarAparelho === 'function') focarAparelho(qual === 'responsavel' ? 'familia' : qual);
  if (qual === 'paciente') { if (celular()) mostrarConta('paciente'); return; }
  mostrarConta(qual);
}
const CANCELADO = { cancelado: true };
let tkAtual = 0; // "token" do momento em execução: se ROTEIRO.token mudar, a espera seguinte cancela a ação
const esperar = (ms) => new Promise((ok, no) => setTimeout(() => (tkAtual === ROTEIRO.token ? ok() : no(CANCELADO)), ms));
// Pausa de leitura: encurta quando o ritmo é acelerado (usado nos testes)
const pausa = (ms) => esperar(ms * ROTEIRO.ritmo);
const clicar = (seletor) => document.querySelector(seletor)?.click();
const garantirGuia = async (rotina = 'mochila') => { if (!P.g || P.tela !== 'guia') { P.ir('guia', rotina); await esperar(800); } };

const PASSOS_ROTEIRO = [
  {
    titulo: 'Comece por aqui',
    texto: 'Os aparelhos do Lucas, da Ana e do Carlos estão conectados. Você decide quando virar a página.',
    olhe: 'Os dados são fictícios. O roteiro reinicia a demonstração e deixa câmera e microfone desligados, para não pedir permissões.',
    momentos: [
      { foco: 'paciente', botao: '▶ Começar', async acao() {
        reiniciarDemonstracao();
        Object.assign(S.perfil, { camera: false, ruido: false, ouvir: false }); salvar();
      } },
    ],
  },
  {
    titulo: 'O Lumi guia, sem mandar',
    texto: 'Na fase 2, o Lumi só pergunta. A resposta vem do Lucas.',
    olhe: 'No celular do Lucas, o Lumi faz uma pergunta. No da Ana, a aba "Ao vivo" mostra o passo atual em tempo real.',
    momentos: [
      { foco: 'paciente', botao: '▶ Abrir "Arrumar a mochila"', async acao() { P.ir('guia', 'mochila'); await esperar(900); } },
      { foco: 'responsavel', botao: '👩 Ver o que a Ana vê ao vivo →', async acao() { R.aba = 'inicio'; R.render(); await pausa(800); } },
    ],
  },
  {
    titulo: 'Se travar, a ajuda sobe',
    texto: 'O Lucas demora e o Lumi explica melhor. Ao concluir, ele ganha uma estrela.',
    olhe: 'A fala muda de pergunta para instrução; depois aparece "+1 ⭐". A Ana vê o nível de ajuda do Lumi em tempo real.',
    momentos: [
      { foco: 'paciente', botao: '▶ Mostrar a ajuda subindo', async acao() {
        await garantirGuia(); await pausa(1000);
        P.g.nivel = 2; P.mostrarDica(true); emitir('progresso', { ...S.aoVivo, nivel: 2 }); await pausa(1800);
      } },
      { foco: 'paciente', botao: '⭐ Concluir o passo', leitura: 3500, async acao() { await garantirGuia(); P.concluir('toque'); await esperar(2400); } },
    ],
  },
  {
    titulo: 'Duas opções, sem sobrecarga',
    texto: 'Banana ou maçã? Treino de decisão com poucas escolhas.',
    olhe: 'As duas opções grandes na tela do Lucas. A escolha vira o texto dos passos seguintes ("Guarde a banana").',
    momentos: [
      { foco: 'paciente', botao: '▶ Mostrar a escolha', async acao() {
        await garantirGuia(); clearTimeout(P.g.timer); P.g.pausado = false; P.g.idx = 3; P.iniciarPasso(); await pausa(1200);
      } },
      { foco: 'paciente', botao: '🍌 Escolher a banana', async acao() { clicar('#telaPaciente [data-escolha="0"]'); await esperar(2200); } },
    ],
  },
  {
    titulo: 'Câmera: o Lumi enxerga (opcional)',
    texto: 'A visão roda no aparelho e nada é gravado. O navegador pede permissão da câmera. Se preferir, toque em "Pular".',
    olhe: 'Mostre uma mochila, livro, garrafa, banana, maçã ou celular. A caixa verde aparece, o passo conclui sozinho e a etiqueta diz se o objeto está à esquerda ou à direita. Sem objeto, toque em "Fiz".',
    opcional: true,
    momentos: [
      { foco: 'paciente', botao: '📷 Ligar a câmera', async acao() { Object.assign(S.perfil, { camera: true }); salvar(); P.ir('guia', 'mochila'); } },
    ],
  },
  {
    titulo: 'SOS com localização',
    texto: 'O Lucas pede ajuda. A Ana e o Carlos são avisados, e a resposta volta para ele.',
    olhe: 'Na tela da Ana: alerta com mapa, contexto ("passo 4 da rotina") e quem foi avisado. Depois, a resposta volta para o Lucas.',
    momentos: [
      { foco: 'paciente', botao: '🆘 O Lucas pede ajuda', async acao() { S.perfil.camera = false; await garantirGuia(); await P.sos(); await pausa(1500); } },
      { foco: 'responsavel', botao: '👩 Ver o alerta na tela da Ana →', async acao() { R.aba = 'inicio'; R.render(); await pausa(1200); } },
      { foco: 'relogio', botao: '⌚ Ver o alerta no relógio do Carlos →', leitura: 5000, async acao() { await pausa(1200); } },
      { foco: 'paciente', botao: '🚗 A Ana responde "Estou a caminho" →', leitura: 5000, async acao() {
        emitir('a_caminho', { quem: 'Ana' }, 'ana'); await pausa(2600); clicar('#sBem'); await esperar(400);
      } },
    ],
  },
  {
    titulo: 'Relógio do Carlos',
    texto: 'O essencial no pulso: hoje, remédios, conversa, avisos, resumo e ajustes.',
    olhe: 'Use os botões ‹ › ao lado do relógio para passar as telas. Quando há um SOS, ele toma a tela e o Carlos responde "Estou indo" ali mesmo.',
    momentos: [
      { foco: 'relogio', botao: '⌚ Ver o relógio', async acao() { W.aviso = null; desenharRelogio(); irPaginaRelogio(0); await pausa(1200); } },
      { foco: 'relogio', botao: '↦ Passar as telas do relógio', leitura: 3000, async acao() {
        for (const i of [1, 2, 3, 4, 5, 6]) { irPaginaRelogio(i); await pausa(1800); }
        irPaginaRelogio(0);
      } },
    ],
  },
  {
    titulo: 'Comunicação por figuras',
    texto: 'O Lucas monta a frase com figuras, e a Ana recebe figuras e texto.',
    olhe: 'Frase montada: "Eu quero ir ao parque no sábado." O Lumi sugere a próxima figura com base no que ele mais usa.',
    momentos: [
      { foco: 'paciente', botao: '🗣️ O Lucas monta e envia a frase', async acao() {
        S.perfil.camera = false;
        P.ir('conversar', 'falar'); P.caa.frase = []; P.telas.conversar('falar'); await esperar(700);
        for (const id of ['eu', 'quero', 'parque', 'sabado']) { P.caa.frase.push(id); P.telas.conversar('falar'); falar(P_(id)[1]); await esperar(600); }
        await pausa(900); clicar('#caaEnviar'); await pausa(900);
      } },
      { foco: 'responsavel', botao: '👩 Ver a conversa na tela da Ana →', async acao() { R.aba = 'conversa'; R.render(); await pausa(1200); } },
    ],
  },
  {
    titulo: 'Combinar e marcar',
    texto: 'Ele pede um sorvete hoje; a Ana confirma e entra na agenda. Depois ele aceita um combinado.',
    olhe: 'O pedido chega à Ana com figuras; a confirmação volta ao Lucas. No combinado, ele toca "Combinado!".',
    momentos: [
      { foco: 'paciente', botao: '🍦 O Lucas pede para marcar um sorvete', async acao() {
        P.ir('conversar', 'marcar'); P.caa.marcar = { atividade: 'sorvete', quando: 'hoje' }; P.telas.conversar('marcar'); await pausa(1600);
        clicar('#mkEnviar'); await pausa(1200);
      } },
      { foco: 'responsavel', botao: '👩 A Ana confirma →', async acao() {
        R.aba = 'conversa'; R.render(); await pausa(1800); clicar('#telaResp [data-mk-conf]'); await pausa(1200);
      } },
      { foco: 'paciente', botao: '🤝 O Lucas aceita um combinado →', async acao() {
        P.ir('conversar', 'combinados'); await pausa(1800); clicar('#telaPaciente [data-comb-aceitar]'); await pausa(800);
      } },
    ],
  },
  {
    titulo: 'Remédio com lembrete em figuras',
    texto: 'Ao tocar "Tomei", a Ana vê a confirmação, a adesão e o estoque.',
    olhe: 'Lembrete com 4 passos. Na aba Saúde da Ana: dose de hoje confirmada, adesão de 30 dias e aviso de reposição.',
    momentos: [
      { foco: 'paciente', botao: '💊 Lembrete do remédio e "Tomei"', async acao() {
        P.ir('inicio'); emitir('med_lembrete', { med: 'med1' }, 'lumi'); await pausa(3500); clicar('#remTomei'); await pausa(1800);
      } },
      { foco: 'responsavel', botao: '👩 Ver a saúde na tela da Ana →', async acao() { R.aba = 'saude'; R.render(); await pausa(1200); } },
    ],
  },
  {
    titulo: 'A IA lê o laudo',
    texto: 'Em PDF ou TXT: a IA separa pontos fortes e dificuldades e sugere ajustes. Só valem com aprovação humana.',
    olhe: 'Cada área do laudo vira uma sugestão com o trecho original. Ao aprovar, o Lumi muda: história antes das tarefas, mais tempo de espera, pictogramas maiores.',
    momentos: [
      { foco: 'responsavel', botao: '📄 A Ana pede o laudo ao neuropsicólogo', async acao() {
        R.aba = 'ia'; R.render(); await pausa(800); emitir('pedido_laudo', { para: 'rafael' }, 'ana'); await pausa(1200);
      } },
      { foco: 'responsavel', botao: '🧠 O laudo chega e a IA lê →', leitura: 5500, async acao() {
        emitir('laudo_enviado', { texto: LAUDO_EXEMPLO, arquivo: 'Avaliacao_neuropsicologica_Lucas_2026.pdf' }, 'rafael'); await pausa(1800);
        [...document.querySelectorAll('#telaResp .titulo-sec')].find((e) => e.textContent.includes('Leitura'))?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        await pausa(1500);
      } },
      { foco: 'responsavel', botao: '✅ A Ana aprova os ajustes →', async acao() { clicar('#rAplicarTodos'); await pausa(800); } },
    ],
  },
  {
    titulo: 'Cada profissional, um papel',
    texto: 'Plano, laudos e remédios, cada um com a sua permissão.',
    olhe: 'Plano com metas medidas pelos dados do dia a dia, e a tela de saúde da médica, com campos de dose e horário que só ela tem.',
    momentos: [
      { foco: 'profissional', botao: '🧑‍⚕️ Dra. Júlia: o plano terapêutico', async acao() { Q.prof = 'julia'; Q.aba = 'plano'; Q.render(); await pausa(1200); } },
      { foco: 'profissional', botao: '👩‍⚕️ Dra. Helena: os remédios →', async acao() { Q.prof = 'helena'; Q.aba = 'saude'; Q.render(); await pausa(1200); } },
      { foco: 'profissional', botao: '👁️ Comparar o que cada conta vê →', leitura: 6000, async acao() { clicar('#comparar'); await pausa(600); } },
    ],
  },
  {
    titulo: '14 meses de evolução',
    texto: 'Autonomia leva meses, com idas e vindas. A IA sugere a fase; a família aprova.',
    olhe: 'A curva sobe de ~50% para mais de 80%, com queda na mudança de escola. No fim do roteiro, câmera e microfone voltam ao que estavam.',
    momentos: [
      { foco: 'responsavel', botao: '📈 Ver a evolução', leitura: 6000, async acao() {
        clicar('#fecharComp'); R.aba = 'relatorio'; R.rotinaRel = 'mochila'; R.render();
        const rolagem = $(R.raiz, '#rConteudo'); if (rolagem) rolagem.scrollTop = 0;
        if (ROTEIRO.salvo) { Object.assign(S.perfil, ROTEIRO.salvo); salvar(); }
      } },
    ],
  },
];

// ---------- Painel do roteiro ----------
const painel = document.createElement('section');
painel.id = 'roteiro'; painel.className = 'roteiro'; painel.hidden = true; painel.setAttribute('aria-label', 'Roteiro guiado');
document.body.appendChild(painel);

// Em telas largas o painel fica numa coluna à direita (não cobre nada e mostra tudo)
const roteiroLateral = () => window.innerWidth >= 1200;

function desenharRoteiro() {
  const p = PASSOS_ROTEIRO[ROTEIRO.i], ultimo = ROTEIRO.i === PASSOS_ROTEIRO.length - 1;
  const n = p.momentos.length, k = Math.min(ROTEIRO.m || 0, n), ocupado = ROTEIRO.ocupado;
  const concluido = k >= n && !ocupado;                      // todos os momentos do passo já foram mostrados
  const proximo = p.momentos[Math.min(k, n - 1)];            // o que o botão principal vai mostrar
  const mostrarOlhe = !!ROTEIRO.olhe;                        // recolhido por padrão: menos texto na tela
  painel.classList.toggle('minimizado', ROTEIRO.minimizado);
  painel.innerHTML = ROTEIRO.minimizado
    ? `<button class="rt-pilula" id="rtAbrir">🧭 Roteiro · passo ${ROTEIRO.i + 1}/${PASSOS_ROTEIRO.length}</button>`
    : `<div class="rt-cab"><b>🧭 Roteiro guiado</b><span class="rt-passo">passo ${ROTEIRO.i + 1} de ${PASSOS_ROTEIRO.length}${n > 1 ? ` · parte ${Math.min(k + 1, n)} de ${n}` : ''}</span>
        <div class="rt-barra"><div style="width:${(ROTEIRO.i + k / n) / PASSOS_ROTEIRO.length * 100}%"></div></div>
        <label class="rt-voz"><input type="checkbox" id="rtVoz" ${S.perfil.voz ? 'checked' : ''}> Lumi fala</label>
        <button class="rt-ic" id="rtOlhe" title="O que olhar neste passo" aria-label="Mostrar ou ocultar o que olhar" aria-pressed="${!!ROTEIRO.olhe}">👀</button>
        <button class="rt-ic" id="rtMin" aria-label="Minimizar">–</button><button class="rt-ic" id="rtFechar" aria-label="Fechar o roteiro">✕</button></div>
      <div class="rt-corpo"><div class="rt-info"><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p><p class="rt-onde" id="rtOnde"></p>${mostrarOlhe ? `<p class="rt-olhe">👀 <b>O que olhar:</b> ${esc(p.olhe)}</p>` : ''}</div>
        <div class="rt-acoes">
          ${concluido && !ultimo ? '<button class="btn primario" id="rtProx">Próximo passo →</button>'
            : concluido ? '<button class="btn primario" id="rtReiniciar">↺ Recomeçar o roteiro</button>'
            : `<button class="btn primario" id="rtMostrar" ${ocupado ? 'disabled' : ''}>${ocupado ? '⏳ Mostrando…' : esc(proximo.botao || '▶ Mostrar este passo')}</button>`}
          <div class="rt-nav"><button class="btn" id="rtAnt" ${ROTEIRO.i === 0 || ocupado ? 'disabled' : ''} aria-label="Passo anterior">←</button>
            ${concluido ? '<button class="btn" id="rtRepetir">↻ Ver de novo</button>' : (ultimo ? '<span></span>' : `<button class="btn" id="rtPular" ${ocupado ? 'disabled' : ''}>Pular →</button>`)}</div>
          <button class="btn rt-auto ${ROTEIRO.automatico ? 'ativo' : ''}" id="rtAuto">${ROTEIRO.automatico ? '⏸ Pausar' : '▶▶ Automático'}</button>
        </div></div>`;
  const q = (s) => painel.querySelector(s);
  q('#rtAbrir') && (q('#rtAbrir').onclick = () => { ROTEIRO.minimizado = false; ajustarAltura(); desenharRoteiro(); });
  q('#rtMin') && (q('#rtMin').onclick = () => { ROTEIRO.minimizado = true; desenharRoteiro(); ajustarAltura(); });
  q('#rtFechar') && (q('#rtFechar').onclick = fecharRoteiro);
  q('#rtOlhe') && (q('#rtOlhe').onclick = () => { ROTEIRO.olhe = !ROTEIRO.olhe; desenharRoteiro(); });
  q('#rtVoz') && (q('#rtVoz').onchange = (e) => { S.perfil.voz = e.target.checked; salvar(); if (!e.target.checked) pararFala(); });
  q('#rtMostrar') && (q('#rtMostrar').onclick = () => executarMomento());
  q('#rtProx') && (q('#rtProx').onclick = () => irPasso(ROTEIRO.i + 1));
  q('#rtPular') && (q('#rtPular').onclick = () => irPasso(ROTEIRO.i + 1));
  q('#rtAnt') && (q('#rtAnt').onclick = () => irPasso(ROTEIRO.i - 1));
  q('#rtRepetir') && (q('#rtRepetir').onclick = () => { ROTEIRO.m = 0; desenharRoteiro(); });
  q('#rtReiniciar') && (q('#rtReiniciar').onclick = () => { pararAutomatico(); irPasso(0); });
  q('#rtAuto') && (q('#rtAuto').onclick = () => (ROTEIRO.automatico ? pararAutomatico() : iniciarAutomatico()));
  atualizarOnde();
  ajustarAltura();
}

// Diz para onde olhar: o aparelho que está em foco agora (no celular só há uma tela, então não precisa)
function atualizarOnde() {
  const el = document.getElementById('rtOnde'); if (!el) return;
  const nomes = { paciente: '🧒 Celular do Lucas', relogio: '⌚ Relógio do Carlos', familia: '👩 Celular da Ana', profissional: '🧑‍⚕️ Tablet do profissional', todos: 'os aparelhos juntos' };
  el.innerHTML = celular() ? '' : `👀 Olhe para: <b>${nomes[document.body.dataset.foco] || ''}</b>`;
}

// Reserva espaço para o painel, para ele não cobrir os celulares
function ajustarAltura() {
  const lateral = ROTEIRO.ativo && roteiroLateral();
  document.body.classList.toggle('rt-lateral', lateral);
  document.documentElement.style.setProperty('--rt-h', ROTEIRO.ativo && !lateral ? painel.offsetHeight + 'px' : '0px');
  window.encaixarAparelhos?.();
}
window.addEventListener('resize', () => { if (ROTEIRO.ativo) ajustarAltura(); });

// ---------- Execução ----------
// Roda o PRÓXIMO momento do passo atual. Devolve true se terminou; se foi interrompido (pausar, fechar),
// devolve false e o mesmo momento poderá ser repetido: nada é pulado.
async function executarMomento() {
  if (ROTEIRO.ocupado) return false;
  const p = PASSOS_ROTEIRO[ROTEIRO.i], k = ROTEIRO.m || 0, momento = p.momentos[k];
  if (!momento) return true;
  ROTEIRO.ocupado = true; tkAtual = ROTEIRO.token; desenharRoteiro();
  let terminou = true;
  try {
    if (momento.foco) ver(momento.foco);
    await momento.acao();
  } catch (e) {
    terminou = false;
    if (e !== CANCELADO) { console.error(e); toast('O roteiro encontrou um problema nesta parte. Você pode tentar de novo ou seguir para o próximo passo.'); }
  }
  ROTEIRO.ocupado = false;
  if (terminou) ROTEIRO.m = k + 1;
  desenharRoteiro();
  return terminou;
}
function irPasso(i) {
  if (ROTEIRO.ocupado) return; // não troca de passo no meio de uma ação
  ROTEIRO.i = Math.max(0, Math.min(PASSOS_ROTEIRO.length - 1, i));
  ROTEIRO.m = 0;
  desenharRoteiro();
}
// Automático: percorre momentos e passos com pausas de leitura. Retomar nunca duplica o laço (ROTEIRO.auto).
async function iniciarAutomatico() {
  const id = ++ROTEIRO.auto;
  ROTEIRO.automatico = true; desenharRoteiro();
  const vivo = () => ROTEIRO.automatico && ROTEIRO.auto === id;
  try {
    while (vivo()) {
      const p = PASSOS_ROTEIRO[ROTEIRO.i];
      if (p.opcional && (ROTEIRO.m || 0) === 0) {
        if (ROTEIRO.pularOpcionais) { irPasso(ROTEIRO.i + 1); continue; } // usado nos testes
        // Passo opcional (pede permissão da câmera): o automático PAUSA e deixa a pessoa decidir.
        pararAutomatico();
        toast('Passo opcional: toque em "Ligar a câmera" ou em "Pular" e depois retome o automático.');
        return;
      }
      while (vivo() && (ROTEIRO.m || 0) < p.momentos.length) {
        const k = ROTEIRO.m || 0;
        if (!(await executarMomento()) || !vivo()) return;
        await pausa(p.momentos[k].leitura ?? 4500);
      }
      if (!vivo()) return;
      if (ROTEIRO.i >= PASSOS_ROTEIRO.length - 1) { ROTEIRO.automatico = false; desenharRoteiro(); return; }
      irPasso(ROTEIRO.i + 1);
    }
  } catch (e) { if (e !== CANCELADO) throw e; }
}
function pararAutomatico() {
  ROTEIRO.auto++;            // o laço antigo deixa de ser "vivo"
  ROTEIRO.automatico = false;
  ROTEIRO.token++;           // e a ação em andamento é interrompida na próxima espera
  desenharRoteiro();
}

function abrirRoteiro() {
  ROTEIRO.token++; ROTEIRO.auto++; ROTEIRO.ocupado = false; ROTEIRO.automatico = false;
  ROTEIRO.ativo = true; ROTEIRO.minimizado = false; ROTEIRO.i = 0; ROTEIRO.m = 0;
  ROTEIRO.salvo = ROTEIRO.salvo || { camera: S.perfil.camera, ruido: S.perfil.ruido, ouvir: S.perfil.ouvir };
  painel.hidden = false; document.body.classList.add('com-roteiro');
  if (typeof focarAparelho === 'function') focarAparelho('paciente'); // começa no celular do Lucas
  desenharRoteiro();
}
function fecharRoteiro() {
  pararAutomatico();
  ROTEIRO.ocupado = false;
  if (ROTEIRO.salvo) { Object.assign(S.perfil, ROTEIRO.salvo); salvar(); ROTEIRO.salvo = null; }
  ROTEIRO.ativo = false; painel.hidden = true; document.body.classList.remove('com-roteiro');
  ajustarAltura();
  if (typeof focarAparelho === 'function') focarAparelho('paciente');
}

document.getElementById('abrirRoteiro').onclick = () => (ROTEIRO.ativo ? fecharRoteiro() : abrirRoteiro());
if (new URLSearchParams(location.search).get('roteiro')) abrirRoteiro();
