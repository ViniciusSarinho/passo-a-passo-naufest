/* ============================================================================
   INICIAR · moldura do app (três contas, comparação, reiniciar) e partida
   Último arquivo carregado: depois de todos os módulos terem se registrado.
   ============================================================================ */

// ---------- Moldura: três contas ----------
let contaDireita = 'responsavel';
function telaMovel() {
  return ['dispPaciente', 'dispResp', 'dispPro', 'dispRelogio'].find((id) => !document.getElementById(id).classList.contains('oculto')) === 'dispPaciente' ? 'paciente' : 'outra';
}
function mostrarConta(qual) {
  document.querySelectorAll('[data-conta]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.conta === qual)));
  document.getElementById('dispPaciente').classList.toggle('oculto', qual !== 'paciente');
  document.getElementById('dispResp').classList.toggle('oculto', qual !== 'responsavel');
  document.getElementById('dispPro').classList.toggle('oculto', qual !== 'profissional');
  document.getElementById('dispRelogio').classList.toggle('oculto', qual !== 'relogio');
  if (qual === 'responsavel' || qual === 'profissional') ladoDireito(qual);
  if (qual === 'responsavel') document.getElementById('pontoAlerta').hidden = true;
}
function ladoDireito(qual) {
  contaDireita = qual;
  document.querySelectorAll('[data-direita]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.direita === qual)));
  document.getElementById('dispResp').classList.toggle('escondido', qual !== 'responsavel');
  document.getElementById('dispPro').classList.toggle('escondido', qual !== 'profissional');
}
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
  const porAltura = (window.innerHeight - topo - 104 - embaixo) / 784;
  const porLargura = (window.innerWidth - 96 - (lateral ? 372 : 0)) / 994;
  const k = Math.max(0.45, Math.min(1, porAltura, porLargura));
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
function reiniciarDemonstracao() {
  P.pararGuia(); S = dadosDemonstracao(); salvar(); P.ir('inicio'); R.aba = 'inicio'; R.render(); Q.render(); W.aviso = null; desenharRelogio();
}

// ---------- Partida ----------
garantirModulos();
const params = new URLSearchParams(location.search);
const contaInicial = params.get('conta');
mostrarConta(['responsavel', 'profissional'].includes(contaInicial) ? contaInicial : 'paciente');
if (contaInicial === 'profissional') ladoDireito('profissional');
P.ir('inicio');
R.render();
Q.render();
desenharRelogio();
encaixarAparelhos();
if (location.protocol === 'file:') toast('Para usar câmera, microfone e voz gravada, abra pelo link https do site ou por localhost.');
setTimeout(() => S.perfil.camera && carregarModelo().catch(() => {}), 2500);
setInterval(() => { document.querySelectorAll('.status span:first-child').forEach((s) => s.textContent = hora()); }, 30000);
