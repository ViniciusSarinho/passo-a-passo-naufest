// Captura as imagens REAIS do app e da sala 3D para o vídeo (Chrome em modo headless).
// Uso: node video/ferramentas/capturar.mjs   (com o site em http://localhost:8765, ex.: python -m http.server 8765)
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const saida = resolve(aqui, '../assets/img');
mkdirSync(saida, { recursive: true });
const BASE = process.env.BASE || 'http://localhost:8765';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const navegador = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--force-color-profile=srgb'],
});

// ---------------------------------------------------------------- App (celulares, relógio, tablet)
{
  const p = await navegador.newPage();
  await p.setViewport({ width: 1900, height: 1200, deviceScaleFactor: 2 });
  await p.goto(`${BASE}/app.html`, { waitUntil: 'networkidle2' });
  await p.addStyleTag({ content: '*{animation:none!important;transition:none!important} .toast{display:none!important} body{background:#fff8ee} .fundo{display:none}' });
  await p.evaluate(() => {
    document.documentElement.style.setProperty('--escala', '1');
    window.encaixarAparelhos = () => document.documentElement.style.setProperty('--escala', '1');
    reiniciarDemonstracao();
    Object.assign(S.perfil, { camera: false, ruido: false, ouvir: false, voz: false }); salvar();
    falar = () => {}; // sem áudio durante as capturas
  });
  const tirar = async (seletor, nome) => {
    const el = await p.$(seletor);
    await el.screenshot({ path: `${saida}/${nome}.png`, omitBackground: true });
    console.log('ok', nome);
  };
  const rodar = (fn, ...a) => p.evaluate(fn, ...a);
  const paciente = '#dispPaciente .moldura', familia = '#dispResp .moldura', pro = '#dispPro .moldura', relogio = '.relogio-moldura';

  await espera(600);
  await tirar(paciente, 'lucas-inicio');
  await tirar(familia, 'ana-aovivo-parado');

  // Guia nas três fases
  for (const f of [1, 2, 3]) {
    await rodar((fase) => { P.pararGuia(); S.perfil.fase.mochila = fase; salvar(); P.ir('guia', 'mochila'); }, f);
    await espera(900);
    await tirar(paciente, `lucas-guia-fase${f}`);
    if (f === 2) { await rodar(() => { R.aba = 'inicio'; R.render(); }); await tirar(familia, 'ana-aovivo'); }
  }
  // História social (antes da tarefa)
  await rodar(() => { P.pararGuia(); P.ir('historia', 'mochila'); }); await espera(700);
  await rodar(() => { document.querySelector('#hProx')?.click(); document.querySelector('#hProx')?.click(); }); await espera(700);
  await tirar(paciente, 'lucas-historia');
  // Escolha de duas opções
  await rodar(() => { P.pararGuia(); S.perfil.fase.mochila = 2; P.ir('guia', 'mochila'); clearTimeout(P.g.timer); P.g.pausado = false; P.g.idx = 3; P.iniciarPasso(); });
  await espera(1000); await tirar(paciente, 'lucas-escolha');
  // Conclusão com estrela
  await rodar(() => { P.pararGuia(); P.ir('guia', 'mochila'); }); await espera(700);
  await rodar(() => { P.concluir('toque'); }); await espera(900); await tirar(paciente, 'lucas-conclusao');
  await rodar(() => { P.ir('inicio'); });

  // SOS
  await rodar(async () => { P.ir('guia', 'padaria'); }); await espera(700);
  await rodar(async () => { await P.sos(); }); await espera(1000);
  await tirar(paciente, 'lucas-sos');
  await rodar(() => { R.aba = 'inicio'; R.render(); }); await espera(500);
  await tirar(familia, 'ana-sos');
  await tirar(relogio, 'relogio-sos');
  await rodar(() => { emitir('a_caminho', { quem: 'Ana' }, 'ana'); }); await espera(800);
  await tirar(paciente, 'lucas-sos-caminho');
  await tirar(familia, 'ana-sos-caminho');
  await rodar(() => { emitir('a_caminho', { quem: 'Carlos' }, 'carlos'); }); await espera(500);
  await tirar(relogio, 'relogio-sos-indo');
  await rodar(() => { document.querySelector('#sBem')?.click(); emitir('sos_resolvido', { quem: 'Ana' }, 'ana'); });
  await rodar(() => { P.pararGuia(); P.ir('inicio'); });
  await espera(600);

  // CAA
  await rodar(() => { P.ir('conversar', 'falar'); P.caa.frase = []; P.telas.conversar('falar'); });
  await espera(500);
  await rodar(() => { for (const id of ['eu', 'quero', 'parque', 'sabado']) P.caa.frase.push(id); P.telas.conversar('falar'); });
  await espera(600); await tirar(paciente, 'lucas-caa');
  await rodar(() => document.querySelector('#caaEnviar')?.click()); await espera(800);
  await rodar(() => { R.aba = 'conversa'; R.render(); }); await espera(500);
  await tirar(familia, 'ana-conversa');
  await rodar(() => { P.ir('conversar', 'combinados'); }); await espera(600); await tirar(paciente, 'lucas-combinados');

  // Remédio
  await rodar(() => { P.ir('inicio'); emitir('med_lembrete', { med: 'med1' }, 'lumi'); }); await espera(1200);
  await tirar(paciente, 'lucas-remedio');
  await tirar(relogio, 'relogio-remedio-aviso');
  await rodar(() => document.querySelector('#remTomei')?.click()); await espera(1200);
  await rodar(() => { R.aba = 'saude'; R.render(); }); await espera(600);
  await tirar(familia, 'ana-saude');

  // IA: perguntas e laudo
  await rodar(() => { R.aba = 'ia'; R.render(); }); await espera(500);
  await tirar(familia, 'ana-ia-perguntas');
  await rodar(() => { emitir('pedido_laudo', { para: 'rafael' }, 'ana'); emitir('laudo_enviado', { texto: LAUDO_EXEMPLO, arquivo: 'Avaliacao_neuropsicologica_Lucas_2026.pdf' }, 'rafael'); R.aba = 'ia'; R.render(); });
  await espera(900);
  await rodar(() => { const alvo = [...document.querySelectorAll('#telaResp .titulo-sec')].find((e) => e.textContent.includes('Leitura')); alvo?.scrollIntoView({ block: 'start' }); });
  await espera(600); await tirar(familia, 'ana-ia-laudo');
  await rodar(() => document.querySelector('#rAplicarTodos')?.click()); await espera(900);

  // Evolução de 14 meses
  await rodar(() => { R.aba = 'relatorio'; R.rotinaRel = 'mochila'; R.render(); }); await espera(600);
  await tirar(familia, 'ana-evolucao');
  await rodar(() => { document.querySelector('#rConteudo, .conteudo')?.scrollTo?.(0, 520); }); await espera(400);
  await tirar(familia, 'ana-evolucao-2');

  // Meu jeito (cuidados)
  await rodar(() => { P.ir('meujeito'); }); await espera(600); await tirar(paciente, 'lucas-meujeito');
  await rodar(() => { P.ir('inicio'); S.perfil.telaEscura = false; salvar(); aplicarTema(); }); await espera(500);
  await tirar(paciente, 'lucas-claro');
  await rodar(() => { S.perfil.telaEscura = true; salvar(); aplicarTema(); P.ir('inicio'); }); await espera(400);

  // Profissional
  await rodar(() => { mostrarConta('responsavel'); ladoDireito('profissional'); Q.prof = 'julia'; Q.aba = 'resumo'; Q.render(); }); await espera(600);
  await p.evaluate(() => { document.getElementById('dispPro').classList.remove('escondido'); document.getElementById('dispPro').classList.remove('oculto'); });
  await tirar(pro, 'pro-resumo');
  await rodar(() => { Q.aba = 'plano'; Q.render(); }); await espera(500); await tirar(pro, 'pro-plano');
  await rodar(() => { Q.prof = 'rafael'; Q.aba = 'ia'; Q.render(); }); await espera(500); await tirar(pro, 'pro-laudo');
  await rodar(() => { Q.prof = 'helena'; Q.aba = 'saude'; Q.render(); }); await espera(500); await tirar(pro, 'pro-saude');
  await rodar(() => { Q.prof = 'julia'; Q.aba = 'plano'; Q.render(); });

  // Relógio: todas as telas
  await rodar(() => { S.alerta = null; W.aviso = null; desenharRelogio(); });
  const nomes = ['agora', 'hoje', 'remedios', 'conversa', 'avisos', 'resumo', 'ajustes'];
  for (let i = 0; i < nomes.length; i++) { await rodar((n) => irPaginaRelogio(n), i); await espera(300); await tirar(relogio, `relogio-${nomes[i]}`); }
  await rodar(() => { irPaginaRelogio(0); emitir('progresso', { rotina: 'Arrumar a mochila', rotinaId: 'mochila', passo: 4, total: 6, titulo: 'x', fase: 2, nivel: 1 }); }); await espera(500);
  await tirar(relogio, 'relogio-aovivo');
  await rodar(() => { emitir('conclusao', { rotina: 'Arrumar a mochila', rotinaId: 'mochila', taxa: 90, estrelas: 12, subiu: null }); }); await espera(500);
  await tirar(relogio, 'relogio-conquista');

  // Comparação de contas
  await rodar(() => { document.getElementById('comparar').click(); }); await espera(500);
  const caixa = await p.$('.caixa-modal');
  await caixa.screenshot({ path: `${saida}/comparar-contas.png`, omitBackground: true }); console.log('ok comparar-contas');
  await p.close();
}

// ---------------------------------------------------------------- Visão geral do app (para o README)
{
  const p = await navegador.newPage();
  await p.setViewport({ width: 1700, height: 960, deviceScaleFactor: 1 });
  await p.goto(`${BASE}/app.html`, { waitUntil: 'networkidle2' });
  await p.addStyleTag({ content: '.toast{display:none!important}' });
  await p.evaluate(() => { reiniciarDemonstracao(); Object.assign(S.perfil, { camera: false, ruido: false, ouvir: false, voz: false }); salvar(); falar = () => {}; });
  await p.evaluate(() => { P.ir('guia', 'mochila'); });
  await espera(900);
  await p.evaluate(() => { P.concluir?.call(P, 'toque'); });
  await espera(300);
  await p.evaluate(() => { P.pararGuia(); P.ir('guia', 'mochila'); });
  await espera(1200);
  await p.screenshot({ path: `${saida}/app-visao-geral.png` });
  console.log('ok app-visao-geral');
  // Modo foco com o roteiro guiado: um aparelho por vez, painel curto
  await p.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  await p.evaluate(() => { ROTEIRO.ritmo = 0.25; abrirRoteiro(); ROTEIRO.i = 1; desenharRoteiro(); });
  await espera(500);
  await p.click('#rtMostrar'); await espera(2800);
  await p.screenshot({ path: `${saida}/app-modo-foco.png` });
  console.log('ok app-modo-foco');
  await p.close();
}

// ---------------------------------------------------------------- Sala 3D e vitrine
async function cena3d(url, nomes, prefixo) {
  const p = await navegador.newPage();
  await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await p.goto(url, { waitUntil: 'networkidle2' });
  await p.addStyleTag({ content: '.topo,.painel,.rotulo3d,.rolar,body::before,.carregando{display:none!important} .capitulo{pointer-events:none}' });
  await espera(2500);
  for (const [fn, arg, nome] of nomes) {
    await p.evaluate((f, a) => { window[f](a); }, fn, arg);
    await espera(900);
    await p.evaluate((f, a) => { window[f](a); }, fn, arg);
    await espera(500);
    const el = await p.$('#cena3d canvas');
    await el.screenshot({ path: `${saida}/${prefixo}-${nome}.png` });
    console.log('ok', `${prefixo}-${nome}`);
  }
  await p.close();
}
await cena3d(`${BASE}/index.html?fixo&sempainel`, ['abertura', 'sala', 'lumi', 'ana', 'carlos', 'ia', 'calmo'].map((n) => ['salaIr', n, n]), 'sala');
await cena3d(`${BASE}/saiba-mais.html?fixo&sempainel`, ['abertura', 'celular', 'relogio', 'colar', 'fone', 'tablet', 'robo', 'lumi'].map((n) => ['vitrineIr', n, n]), 'vitrine');

// ---------------------------------------------------------------- Lumi (PNG transparente) por nível e humor
{
  const p = await navegador.newPage();
  await p.setViewport({ width: 900, height: 700, deviceScaleFactor: 3 });
  await p.goto(`${BASE}/app.html`, { waitUntil: 'networkidle2' });
  await p.addStyleTag({ content: '*{animation:none!important} body{background:transparent!important} .fundo{display:none}' });
  const humores = ['feliz', 'falando', 'atento', 'observando', 'calmo', 'comemorando', 'preocupado'];
  for (let nivel = 0; nivel < 6; nivel++) {
    await p.evaluate((n) => {
      document.body.innerHTML = `<div id="lm" style="width:300px;height:300px;display:grid;place-items:center">${lumiSVG({ humor: n === 5 ? 'comemorando' : 'feliz', acessorios: LUMI_NIVEIS.slice(1, n + 1).map((l) => l.acessorio), tamanho: 280, hiperfoco: 'dinossauros' })}</div>`;
    }, nivel);
    await (await p.$('#lm')).screenshot({ path: `${saida}/lumi-nivel${nivel}.png`, omitBackground: true });
  }
  for (const h of humores) {
    await p.evaluate((hum) => { document.body.innerHTML = `<div id="lm" style="width:300px;height:300px;display:grid;place-items:center">${lumiSVG({ humor: hum, acessorios: ['cachecol'], tamanho: 280 })}</div>`; }, h);
    await (await p.$('#lm')).screenshot({ path: `${saida}/lumi-${h}.png`, omitBackground: true });
  }
  console.log('ok lumi');
  await p.close();
}
await navegador.close();
console.log('Capturas concluídas em', saida);
