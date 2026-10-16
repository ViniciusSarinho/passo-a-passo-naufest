/* ============================================================================
   INICIAR · moldura do app (três contas, comparação, reiniciar) e partida
   Último arquivo carregado: depois de todos os módulos terem se registrado.
   ============================================================================ */

// ---------- Moldura: três contas ----------
let contaDireita = 'responsavel';
// No celular só uma conta aparece por vez: devolve "paciente" ou "outra" (qual está visível).
function telaMovel() {
  return ['dispPaciente', 'dispResp', 'dispPro', 'dispRelogio'].find((id) => !document.getElementById(id).classList.contains('oculto')) === 'dispPaciente' ? 'paciente' : 'outra';
}
// Mostra uma conta (paciente, família, profissional ou relógio). Usado no celular e pelo roteiro.
function mostrarConta(qual) {
  document.querySelectorAll('[data-conta]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.conta === qual)));
  document.getElementById('dispPaciente').classList.toggle('oculto', qual !== 'paciente');
  document.getElementById('dispResp').classList.toggle('oculto', qual !== 'responsavel');
  document.getElementById('dispPro').classList.toggle('oculto', qual !== 'profissional');
  document.getElementById('dispRelogio').classList.toggle('oculto', qual !== 'relogio');
  if (qual === 'responsavel' || qual === 'profissional') ladoDireito(qual);
  if (qual === 'responsavel') document.getElementById('pontoAlerta').hidden = true;
}
// Escolhe se a coluna da direita mostra a família ou o profissional.
function ladoDireito(qual) {
  contaDireita = qual;
  document.querySelectorAll('[data-direita]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.direita === qual)));
  document.getElementById('dispResp').classList.toggle('escondido', qual !== 'responsavel');
  document.getElementById('dispPro').classList.toggle('escondido', qual !== 'profissional');
}

// ---------- Páginas: um aparelho por vez (paciente → relógio → família → profissional; ou todos juntos) ----------
// Começa no celular do Lucas e a pessoa "vira a página" pelas setas, pelo teclado ou pelo seletor do topo.
// O roteiro guiado também troca de página sozinho a cada passo.
const ORDEM_FOCO = ['paciente', 'relogio', 'familia', 'profissional'];
const NOME_FOCO = { paciente: 'Lucas', relogio: 'Relógio', familia: 'Família', profissional: 'Profissional' };
// Modo foco: mostra um aparelho só (ou "todos") com animação de virar a página; atualiza as setas e o seletor.
function focarAparelho(qual) {
  const antes = ORDEM_FOCO.indexOf(document.body.dataset.foco), depois = ORDEM_FOCO.indexOf(qual);
  document.documentElement.style.setProperty('--dx', depois >= antes ? '56px' : '-56px');
  document.body.dataset.foco = qual;
  if (qual === 'familia') ladoDireito('responsavel');
  if (qual === 'profissional') ladoDireito('profissional');
  document.querySelectorAll('button[data-foco]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.foco === qual)));
  const i = ORDEM_FOCO.indexOf(qual);
  document.getElementById('virarAntNome').textContent = NOME_FOCO[ORDEM_FOCO[((i < 0 ? 0 : i) + 3) % 4]];
  document.getElementById('virarProxNome').textContent = NOME_FOCO[ORDEM_FOCO[((i < 0 ? -1 : i) + 1 + 4) % 4]];
  if (typeof atualizarOnde === 'function') atualizarOnde();
  encaixarAparelhos();
}
// Vai para o aparelho anterior (-1) ou seguinte (+1), de forma circular.
function virarPagina(d) {
  const i = ORDEM_FOCO.indexOf(document.body.dataset.foco);
  focarAparelho(ORDEM_FOCO[(((i < 0 ? (d > 0 ? -1 : 0) : i) + d) % 4 + 4) % 4]);
}
document.getElementById('virarAnt').onclick = () => virarPagina(-1);
document.getElementById('virarProx').onclick = () => virarPagina(1);
document.addEventListener('keydown', (e) => {
  if (window.innerWidth <= 960 || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (document.querySelector('.modal-comparar')) return;
  if (e.key === 'ArrowRight') virarPagina(1); else if (e.key === 'ArrowLeft') virarPagina(-1);
});
document.querySelectorAll('button[data-foco]').forEach((b) => b.onclick = () => focarAparelho(b.dataset.foco));

// Menu "⋯" do topo (estúdio de voz, comparar contas, reiniciar)
const menuMais = document.getElementById('menuMais'), menuLista = document.getElementById('menuLista');
function menu(abrir) { menuLista.hidden = !abrir; menuMais.setAttribute('aria-expanded', String(abrir)); }
menuMais.onclick = (e) => { e.stopPropagation(); menu(menuLista.hidden); };
menuLista.addEventListener('click', () => menu(false));
document.addEventListener('click', (e) => { if (!menuLista.hidden && !e.target.closest('.menu-mais')) menu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') menu(false); });
document.querySelectorAll('[data-direita]').forEach((b) => b.onclick = () => ladoDireito(b.dataset.direita));
document.querySelectorAll('[data-conta]').forEach((b) => b.onclick = () => mostrarConta(b.dataset.conta));

// ---------- Encaixe: os aparelhos têm tamanho real e são escalados por inteiro ----------
// Celular: 390 × 784. Relógio: 214 × 430 (com a pulseira). A escala é a maior que cabe na janela,
// descontando o topo, as legendas e o painel do roteiro (embaixo ou na coluna da direita).
function encaixarAparelhos() {
  const raiz = document.documentElement;
  if (window.innerWidth <= 960) { raiz.style.setProperty('--escala', 1); return; }
  const lateral = document.body.classList.contains('rt-lateral');
  const topo = document.querySelector('.barra-topo').offsetHeight;
  const embaixo = ROTEIRO.ativo && !lateral ? document.getElementById('roteiro').offsetHeight + 16 : 0;
  // Com um aparelho só, ele pode ficar maior que o tamanho real; com todos, nunca passa de 1
  const foco = document.body.dataset.foco || 'todos';
  const larguraNecessaria = { todos: 1120, paciente: 470, familia: 470, profissional: 470, relogio: 420 }[foco] || 1120;
  const alturaNecessaria = foco === 'relogio' ? 620 : 784;
  const escalaMaxima = { todos: 1, paciente: 1.25, familia: 1.25, profissional: 1.25, relogio: 1.6 }[foco] || 1;
  const porAltura = (window.innerHeight - topo - 150 - embaixo) / alturaNecessaria;
  const porLargura = (window.innerWidth - 96 - (lateral ? 372 : 0)) / larguraNecessaria;
  const k = Math.max(0.45, Math.min(escalaMaxima, porAltura, porLargura));
  raiz.style.setProperty('--escala', k.toFixed(3));
}
window.addEventListener('resize', encaixarAparelhos);

// Comparação: o que cada conta vê e faz
const COMPARA = [
  ['Usar o Lumi nas rotinas', ['✓', '', '', '', '']],
  ['Pedir SOS', ['✓', '', '', '', '']],
  ['Receber SOS com localização', ['', '✓', '', '', '']],
  ['Conversar por figuras (CAA)', ['✓', '✓', '👁', '', '']],
  ['Combinados e pedidos para marcar', ['✓', '✓', '👁', '', '']],
  ['Lembrete do remédio com figuras', ['✓', '', '', '', '']],
  ['Confirmar remédio e registrar efeitos', ['✓', '✓', '', '', '👁']],
  ['Prescrever e ajustar remédios', ['', '', '', '', '✓']],
  ['Diário de sono e crises', ['', '✓', '👁', '👁', '👁']],
  ['Rotina ao vivo', ['', '✓', '', '', '']],
  ['Evolução de longo prazo', ['⭐', '✓', '✓', '✓', '✓']],
  ['Plano terapêutico e metas', ['', '👁', '✓', '👁', '👁']],
  ['Notas de sessão', ['', '👁', '✓', '', '']],
  ['Enviar laudo', ['', '✓', '', '✓', '']],
  ['Responder às perguntas da IA', ['', '✓', '✓', '', '']],
  ['Conversar com a IA sobre o tratamento', ['', '✓', '✓', '✓', '✓']],
  ['Aprovar mudança de fase', ['', '✓', '✓', '', '']],
  ['Volume, voz e tela calma', ['✓', '✓', '', '', '']],
];
document.getElementById('comparar').onclick = () => {
  const ov = document.createElement('div');
  ov.className = 'modal-comparar';
  ov.innerHTML = `<div class="caixa-modal" role="dialog" aria-label="O que cada conta vê">
    <div class="linha"><h2 style="font-size:20px;flex:1">O que cada conta vê e faz</h2><button class="btn" id="fecharComp">✕</button></div>
    <p class="peq suave">✓ usa ou edita · 👁 só vê · ⭐ vê do jeito dele (estrelas e o Lumi evoluindo). O Lucas não vê laudo, doses nem o diário de crises.</p>
    <div style="overflow-x:auto"><table class="comparar"><tr><th></th><th>🧒 Lucas<br><small>paciente</small></th><th>👩 Ana<br><small>família</small></th><th>🧑‍⚕️ Júlia<br><small>terapeuta</small></th><th>🧠 Rafael<br><small>neuropsicólogo</small></th><th>👩‍⚕️ Helena<br><small>médica</small></th></tr>
      ${COMPARA.map(([f, v]) => `<tr><td>${f}</td>${v.map((x) => `<td class="${x === '✓' ? 'sim' : x ? 've' : ''}">${x || '—'}</td>`).join('')}</tr>`).join('')}</table></div>
    <p class="peq suave">Quando o paciente é adulto, ele mesmo decide quem acompanha e o que cada pessoa vê.</p></div>`;
  document.body.appendChild(ov);
  const fechar = () => ov.remove();
  ov.onclick = (e) => { if (e.target === ov) fechar(); };
  $(ov, '#fecharComp').onclick = fechar;
};

R.raiz.addEventListener('click', (e) => { if (e.target.closest('[data-abrir-comparar]')) document.getElementById('comparar').click(); });

// Reiniciar a demonstração (dados fictícios voltam ao início)
document.getElementById('reiniciar').onclick = () => {
  if (!confirm('Recomeçar a demonstração? O histórico volta ao início.')) return;
  reiniciarDemonstracao();
  toast('Demonstração reiniciada.');
};
// Volta tudo aos dados fictícios iniciais e redesenha as telas.
function reiniciarDemonstracao() {
  P.pararGuia(); S = dadosDemonstracao(); salvar(); aplicarTema(); P.ir('inicio'); R.aba = 'inicio'; R.render(); Q.render(); W.aviso = null; desenharRelogio();
}

// ---------- Partida ----------
// Tema das telas dos aparelhos: escuro por padrão (mais calmo à vista); "Meu jeito" e o botão do topo voltam ao claro
function aplicarTema() {
  const escuro = S.perfil.telaEscura !== false;
  document.body.classList.toggle('escuro', escuro);
  const b = document.getElementById('tema');
  b.setAttribute('aria-pressed', String(escuro));
  b.innerHTML = escuro ? '<span class="ic">🌙</span><span class="tx"> Tela escura</span>' : '<span class="ic">☀️</span><span class="tx"> Tela clara</span>';
  b.setAttribute('aria-label', escuro ? 'Tela escura (tocar para clara)' : 'Tela clara (tocar para escura)');
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', '#fff8ee');
}
document.getElementById('tema').onclick = () => { S.perfil.telaEscura = S.perfil.telaEscura === false; salvar(); aplicarTema(); const m = document.getElementById('mjEscura'); if (m) m.checked = S.perfil.telaEscura !== false; };
garantirModulos();
aplicarTema();
focarAparelho('paciente');
// Parâmetros da URL: ?conta=responsavel|profissional|relogio abre direto nessa conta; ?roteiro=1 abre o roteiro guiado.
const params = new URLSearchParams(location.search);
const contaInicial = params.get('conta');
mostrarConta(['responsavel', 'profissional'].includes(contaInicial) ? contaInicial : 'paciente');
if (contaInicial === 'profissional') ladoDireito('profissional');
if (contaInicial === 'responsavel') focarAparelho('familia');
if (contaInicial === 'profissional') focarAparelho('profissional');
if (contaInicial === 'relogio') focarAparelho('relogio');
P.ir('inicio');
R.render();
Q.render();
desenharRelogio();
encaixarAparelhos();
if (location.protocol === 'file:') toast('Para usar câmera, microfone e voz gravada, abra pelo link https do site ou por localhost.');
setTimeout(() => S.perfil.camera && carregarModelo().catch(() => {}), 2500);
setInterval(() => { document.querySelectorAll('.status span:first-child').forEach((s) => s.textContent = hora()); }, 30000);
