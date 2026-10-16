// Teste de fumaça: percorre telas e fluxos do app dentro de um iframe e confere o resultado.
// As variáveis do app (S, P, R, Q...) são "const/let" globais; por isso o acesso é por win.eval.

const lista = document.getElementById('lista'), resumo = document.getElementById('resumo');
const iframe = document.getElementById('app');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = 0, falhou = 0;

// Roda um teste: marca a linha como ok/falhou na lista da página. Um erro dentro de fn é uma falha.
async function teste(nome, fn) {
  const li = document.createElement('li');
  try { await fn(); li.className = 'ok'; ok++; } catch (e) { li.className = 'falhou'; li.textContent = `${nome} — ${e.message}`; falhou++; lista.appendChild(li); return; }
  li.textContent = nome; lista.appendChild(li);
}
// Verificações: igual(a, b) compara valores; verdade(condição) exige que seja verdadeira.
const igual = (a, b, msg) => { if (a !== b) throw new Error(`${msg || 'esperado'}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };
const verdade = (c, msg) => { if (!c) throw new Error(msg || 'condição falsa'); };

// O app é carregado num iframe (tests/fumaca.html). Os testes só começam quando ele termina de carregar.
iframe.addEventListener('load', async () => {
  const win = iframe.contentWindow, doc = win.document;
  const ev = (codigo) => win.eval(codigo);
  const erros = [];
  win.addEventListener('error', (e) => erros.push(e.message));
  win.addEventListener('unhandledrejection', (e) => erros.push(String(e.reason)));
  await esperar(800);

  // Estado de demonstração limpo, sem voz, câmera nem microfone
  ev(`S = dadosDemonstracao(); garantirModulos(); S.perfil.voz = false; S.perfil.camera = false; S.perfil.ruido = false; S.perfil.ouvir = false; salvar(); P.ir('inicio'); R.render(); Q.render();`);

  // Estado e módulos
  await teste('Módulos registrados no núcleo', () => igual(ev('MODULOS.map((m) => m.nome).join()'), 'conhecimento,caa,saude,profissional,relogio'));
  await teste('Estado tem os dados de todos os módulos', () => verdade(['caa', 'saude', 'conhecimento'].every((k) => ev(`!!S.${k}`))));
  await teste('Seis contas conectadas, com um paciente', () => { igual(ev('S.contas.length'), 6); igual(ev("S.contas.filter((c) => c.papel === 'paciente').length"), 1); });
  await teste('Histórico de demonstração termina hoje', () => verdade(ev('Math.max(...S.sessoes.map((s) => s.data))') > Date.now() - 3 * 864e5));

  // Telas
  for (const t of ['inicio', 'respirar', 'cartao', 'acompanham', 'meujeito']) await teste(`Paciente · tela ${t}`, () => { ev(`P.ir('${t}')`); verdade(doc.querySelector('#telaPaciente .conteudo')); });
  await teste('Paciente · rotina e história', () => { ev("P.ir('rotina', 'padaria')"); ev("P.ir('historia', 'padaria')"); verdade(doc.querySelector('.historia-quadro')); });
  for (const a of ['falar', 'mensagens', 'combinados', 'marcar']) await teste(`Paciente · conversar (${a})`, () => { ev(`P.ir('conversar', '${a}')`); verdade(doc.querySelector('#caaCorpo')); });
  for (const a of ['inicio', 'relatorio', 'conversa', 'saude', 'ia', 'ajustes']) await teste(`Família · aba ${a}`, () => { ev(`R.aba = '${a}'; R.render()`); verdade(doc.querySelector('#rConteudo').innerText.length > 50); });
  for (const p of ['julia', 'rafael', 'helena']) for (const a of ['pacientes', 'resumo', 'plano', 'saude', 'ia'])
    await teste(`Profissional ${p} · aba ${a}`, () => { ev(`Q.prof = '${p}'; Q.aba = '${a}'; Q.render()`); verdade(doc.querySelector('#qConteudo').innerText.length > 30); });
  await teste('Comparar contas abre e fecha', () => { doc.getElementById('comparar').click(); verdade(doc.querySelector('.modal-comparar')); doc.getElementById('fecharComp').click(); });
  await teste('Estúdio de voz abre e lista as falas', () => { ev('abrirEstudio()'); verdade(doc.querySelectorAll('.fala').length > 10); ev('fecharEstudio()'); });

  // Fluxos
  await teste('Modo guia: rotina inteira, estrelas e relatório', async () => {
    const antes = ev('S.pet.estrelas'), sessoes = ev('S.sessoes.length');
    ev("P.ir('guia', 'mochila')"); await esperar(200);
    for (let i = 0; i < 6; i++) { const e = doc.querySelector('#telaPaciente [data-escolha]'); if (e) e.click(); else doc.querySelector('#gFiz').click(); await esperar(3000); }
    igual(ev('S.sessoes.length'), sessoes + 1, 'sessão registrada');
    verdade(ev('S.pet.estrelas') > antes, 'estrelas aumentaram');
  });
  await teste('SOS chega à família e a resposta volta ao paciente', async () => {
    await ev('P.sos()'); await esperar(200);
    verdade(ev('!!S.alerta'), 'alerta criado'); verdade(doc.querySelector('#telaResp .alerta-sos'), 'alerta na tela da família');
    doc.querySelector('#rCaminho').click(); await esperar(200);
    verdade(doc.querySelector('#pSos h2').innerText.includes('a caminho'), 'paciente vê "a caminho"');
    doc.querySelector('#sBem').click(); await esperar(100); verdade(ev('!S.alerta'), 'alerta resolvido');
  });
  await teste('Relógio do Carlos: SOS, "estou indo" e rotina ao vivo', async () => {
    const tela = () => doc.querySelector('#telaRelogio').innerText;
    await ev('P.sos()'); await esperar(200);
    verdade(tela().includes('pediu ajuda'), 'SOS no relógio');
    doc.querySelector('[data-rl-indo]').click(); await esperar(150);
    igual(ev('S.alerta.aCaminho'), 'Carlos', 'Carlos respondeu pelo relógio');
    verdade(tela().includes('Carlos está indo'), 'relógio confirma');
    ev("emitir('sos_resolvido', { quem: 'Carlos' }, 'carlos')"); await esperar(100);
    ev("P.ir('guia', 'mochila')"); await esperar(200);
    verdade(/1\/6/.test(tela()), 'passo ao vivo no relógio');
    verdade(doc.querySelectorAll('#gTrilha span').length === 7, 'trilha de estrelas no guia');
    ev("P.ir('inicio')"); await esperar(100);
  });
  await teste('Relógio: telas, remédio, resposta e avisos', async () => {
    const tela = () => doc.querySelector('#telaRelogio').innerText;
    const pagina = async (i) => { doc.querySelectorAll('[data-rl-ir]')[i].click(); await esperar(80); };
    await pagina(1); verdade(tela().includes('Arrumar a mochila'), 'tela Hoje');
    await pagina(2); verdade(tela().includes('Dei'), 'tela Remédios com botão Dei');
    const antes = ev('S.saude.registros.length'); doc.querySelector('[data-rl-dei]').click(); await esperar(150);
    verdade(ev('S.saude.registros.length') > antes, 'Dei registra o remédio');
    await pagina(3); const msgs = ev('S.caa.mensagens.length'); doc.querySelector('[data-rl-resp="0"]').click(); await esperar(150);
    igual(ev('S.caa.mensagens.length'), msgs + 1, 'resposta rápida vira mensagem');
    await pagina(4); const ev0 = ev('S.eventos.length'); doc.querySelector('[data-rl-aviso="0"]').click(); await esperar(150);
    verdade(ev('S.eventos.length') > ev0, 'aviso rápido enviado');
    await pagina(0);
  });
  await teste('Modo foco: botões e roteiro trocam o aparelho em foco', async () => {
    doc.querySelector('button[data-foco="relogio"]').click(); await esperar(60);
    igual(ev('document.body.dataset.foco'), 'relogio', 'foco no relógio');
    verdade(doc.querySelector('button[data-foco="relogio"]').getAttribute('aria-pressed') === 'true', 'botão marcado');
    ev("ROTEIRO.ativo = true; ver('responsavel')");
    igual(ev('document.body.dataset.foco'), ev('celular()') ? 'relogio' : 'familia', 'o roteiro foca a conta da família');
    ev('virarPagina(1)'); igual(ev('document.body.dataset.foco'), 'profissional', 'virar a página leva ao próximo aparelho');
    ev('virarPagina(1)'); igual(ev('document.body.dataset.foco'), 'paciente', 'depois do último, volta ao primeiro');
    ev("ROTEIRO.ativo = false; focarAparelho('todos')");
    igual(ev('document.body.dataset.foco'), 'todos', 'volta a mostrar todos');
  });
  await teste('Voz: vozes do Google ficam de fora quando há outra', () => {
    const r = ev(`(() => { const v = [{ name: 'Google português do Brasil', lang: 'pt-BR' }, { name: 'Microsoft Francisca Online (Natural) - Portuguese (Brazil)', lang: 'pt-BR' }, { name: 'Microsoft Maria', lang: 'pt-BR' }];
      return v.sort((a, b) => notaVoz(b) - notaVoz(a)).map((x) => x.name.split(' ')[1]).join(); })()`);
    igual(r, 'Francisca,Maria,português', 'ordem das vozes');
  });
  await teste('Aparelhos em tamanho real (escala inteira, sem achatar)', () => {
    const t = doc.querySelector('#telaPaciente');
    igual(t.offsetWidth + 'x' + t.offsetHeight, ev('window.innerWidth') <= 960 ? t.offsetWidth + 'x' + t.offsetHeight : '366x760', 'tela do celular');
  });
  await teste('Encerrar o guia por outro caminho avisa a família', async () => {
    ev("P.ir('guia', 'padaria')"); await esperar(200); verdade(ev('!!S.aoVivo'), 'ao vivo ativo');
    ev("P.ir('inicio')"); await esperar(100); verdade(ev('!S.aoVivo'), 'ao vivo limpo');
  });
  await teste('CAA: figuras viram frase e chegam à família', async () => {
    ev("P.ir('conversar', 'falar'); P.caa.frase = ['eu', 'quero', 'parque', 'sabado']; P.telas.conversar('falar')");
    verdade(doc.querySelector('.frase-ia').innerText.includes('Eu quero ir ao parque no sábado'), 'frase traduzida');
    doc.querySelector('#caaEnviar').click(); await esperar(200);
    verdade(ev("S.caa.mensagens.at(-1).texto").includes('parque'), 'mensagem registrada');
  });
  await teste('Marcar compromisso: pedido, confirmação e agenda', async () => {
    ev("P.ir('conversar', 'marcar')"); doc.querySelector('[data-mk-at="sorvete"]').click(); doc.querySelector('[data-mk-q="hoje"]').click(); doc.querySelector('#mkEnviar').click(); await esperar(200);
    ev("R.aba = 'conversa'; R.render()"); doc.querySelector('[data-mk-conf]').click(); await esperar(200);
    verdade(ev("S.caa.marcados.some((m) => m.atividade === 'sorvete' && m.status === 'confirmado')"));
  });
  await teste('Remédio: lembrete, confirmação e adesão', async () => {
    ev("emitir('med_lembrete', { med: 'med1' }, 'lumi')"); await esperar(200); verdade(doc.querySelector('#pRemedio'), 'lembrete na tela');
    doc.querySelector('#remTomei').click(); await esperar(200);
    igual(ev("registroHoje('med1').status"), 'tomado');
  });
  await teste('Só a médica ajusta o horário do remédio', async () => {
    ev("ladoDireito('profissional'); Q.prof = 'helena'; Q.aba = 'saude'; Q.render()");
    verdade(doc.querySelector('[data-ed-salvar]'), 'médica vê o botão de salvar');
    ev("Q.prof = 'julia'; Q.render()"); verdade(!doc.querySelector('[data-ed-salvar]'), 'terapeuta não edita remédio');
  });
  await teste('IA recusa mudar dose e responde sobre a semana', () => {
    verdade(ev("responderIA('Devo aumentar a dose?', 'ana')").includes('Não posso'), 'recusa');
    verdade(ev("responderIA('Como foi a semana?', 'ana')").includes('últimos 7 dias'), 'resumo da semana');
  });
  await teste('Laudo em texto gera sugestões e o ajuste muda o perfil', async () => {
    ev("emitir('laudo_enviado', { texto: LAUDO_EXEMPLO, arquivo: 'teste.txt' }, 'rafael')"); await esperar(100);
    verdade(ev('sugestoesLaudo().length') >= 6, 'sugestões');
    ev("sugestoesLaudo().filter((a) => !a.aplicado).forEach(aplicarSugestao)");
    verdade(ev('S.perfil.historiaAntes === true && S.perfil.espera === 15'), 'ajustes aplicados');
  });
  await teste('Perguntas da IA: resposta aprende e muda o perfil', () => {
    const q = ev('PERGUNTAS_IA[0].id'); ev(`R.aba = 'ia'; R.render()`); doc.querySelector(`[data-resp^="${q}|0"]`).click();
    igual(ev('S.perfil.ruidoLimite'), 50);
  });
  await teste('Inventário de falas e reprodução com gravação de teste', async () => {
    verdade(ev('todasAsFalas().length') > 200, 'mais de 200 falas');
    const r = ev(`partesGravadas('Texto que não existe.')`); igual(r, null);
  });
  await teste('Leitura do PDF de exemplo (precisa de internet para carregar o pdf.js)', async () => {
    const blob = await (await fetch('../exemplos/exemplo-laudo-ficticio.pdf')).blob();
    const arquivo = new win.File([blob], 'exemplo.pdf', { type: 'application/pdf' });
    const texto = await Promise.race([win.lerPdf(arquivo), esperar(20000).then(() => { throw new Error('pdf.js não carregou (sem internet?)'); })]);
    verdade(texto.includes('RELATÓRIO'), 'texto extraído do PDF');
    verdade(win.analisarLaudo(texto).length >= 7, 'áreas encontradas no PDF');
  });
  await teste('Roteiro guiado completo, no modo automático acelerado', async () => {
    ev('ROTEIRO.ritmo = 0.12; ROTEIRO.pularOpcionais = true; abrirRoteiro()');
    igual(ev('document.body.dataset.foco'), ev('celular()') ? ev('document.body.dataset.foco') : 'paciente', 'o roteiro começa no celular do Lucas');
    await win.iniciarAutomatico();
    igual(ev('ROTEIRO.i'), ev('PASSOS_ROTEIRO.length - 1'), 'chegou ao último passo');
    verdade(ev('!!S.conhecimento.laudo'), 'laudo recebido no roteiro');
    verdade(ev("S.eventos.some((e) => e.tipo === 'sos')"), 'SOS no roteiro');
    ev('fecharRoteiro()');
  });
  await teste('Roteiro: passo opcional pausa o automático e nenhum momento é pulado', async () => {
    ev('ROTEIRO.ritmo = 0.12; ROTEIRO.pularOpcionais = false; abrirRoteiro()');
    await win.iniciarAutomatico();
    verdade(!ev('ROTEIRO.automatico'), 'automático parou no passo opcional');
    igual(ev("PASSOS_ROTEIRO[ROTEIRO.i].opcional"), true, 'parou na câmera');
    igual(ev('ROTEIRO.m'), 0, 'o passo da câmera não foi executado');
    ev('fecharRoteiro()');
  });
  await teste('Lumi: repete a instrução no máximo 6 vezes e espera cada vez mais', async () => {
    ev("P.ir('guia', 'mochila')"); await esperar(500);
    const g = ev('P.g');
    g.repeticoes = 0;
    const antes = ev('P.espera(P.g)');
    g.repeticoes = 3; const depois = ev('P.espera(P.g)');
    g.repeticoes = 5; const mais = ev('P.espera(P.g)');
    verdade(depois > antes && mais > depois, 'a espera cresce depois de 3 repetições');
    verdade(mais <= 120000, 'a espera tem teto de 2 minutos');
    igual(ev('P.REPETICOES_MAX'), 6, 'limite de repetições');
    ev("P.ir('inicio')");
  });
  await teste('Nenhum erro de JavaScript durante o teste', () => igual(erros.join(' | '), ''));

  resumo.className = 'resumo ' + (falhou ? 'falhou' : 'ok');
  resumo.textContent = falhou ? `${falhou} teste(s) falharam, ${ok} passaram.` : `Tudo certo: ${ok} testes passaram.`;
  document.title = (falhou ? '✗ ' : '✓ ') + document.title;
  window.__resultado = { ok, falhou };
});
