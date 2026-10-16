# Arquitetura

O Passo a Passo é um site estático: **HTML + CSS + JavaScript puro, sem build, sem servidor e sem dependência instalada** (bibliotecas como three.js, TensorFlow.js e pdf.js vêm de CDN quando a página precisa delas). Abra `index.html` por um servidor estático (ou GitHub Pages) e tudo funciona. Esta página explica como o código está organizado e por quê.

## Visão geral

```
┌────────────────────────────── navegador ──────────────────────────────┐
│  Conta do paciente (P)   Relógio do pai (W)   Conta da família (R)   Conta profissional (Q)
│  celular do Lucas        relógio do Carlos    celular da Ana         tablet / computador
│        │                          │                          │
│        └────────── eventos (emitir → aplicar → salvar → aoEvento) ──────┘
│                         │
│            estado S em localStorage  +  BroadcastChannel (entre abas)
│
│  Módulos que se registram em MODULOS:  conhecimento · caa · saude · profissional · relogio
│  Serviços no aparelho:  câmera + TensorFlow.js · microfone · voz · IndexedDB · pdf.js
└─────────────────────────────────────────────────────────────────────────┘
```

Nada sai do aparelho. As "contas" conversam por **eventos** dentro da página e entre abas do mesmo navegador. No produto, essa troca passaria por um servidor seguro (veja "Do protótipo ao produto").

## Estrutura de pastas

```
index.html            página inicial curta, com a sala 3D (capítulos que movem a câmera)
saiba-mais.html       vitrine 3D dos equipamentos (capítulos) + abas: critérios, dados, IA, como funciona, cuidados, ética, roadmap e fontes
app.html              o app: celular do Lucas, relógio do Carlos e celular da Ana (ou tablet do profissional)
firebase.json         configuração do Firebase Hosting (veja docs/FIREBASE.md)
css/
  inicio.css          página inicial (tema infantil e calmo)
  saibamais.css       página "Saiba mais": vitrine 3D e abas
  app.css             telas do app, aparelhos em tamanho real, relógio, roteiro guiado, estúdio de voz
js/                   ordem de carregamento (app.html)
  lumi.js             robô Lumi em SVG (humores, acessórios, níveis)
  dados.js            dados fixos e fictícios: rotinas, contas, perguntas da IA, regras do laudo, histórico
  nucleo.js           estado, eventos, MODULOS, voz (motor), linguagem adaptada, métricas
  paciente.js         conta do paciente: início, guia, câmera, ruído, SOS, calma, conquistas
  responsavel.js      conta da família: ao vivo, evolução, rotinas, contas, ajustes
  conhecimento.js     a IA pergunta, lê laudos (PDF/TXT) e sugere ajustes
  caa.js              comunicação por figuras, conversa, combinados, marcar compromissos
  saude.js            remédios, diário de sono e crises, conversa com a IA sobre o tratamento
  profissional.js     conta do profissional (3 perfis com permissões diferentes)
  voz.js              falas gravadas, inventário de falas e estúdio de voz
  relogio.js          relógio do Carlos: sete telas (agora, hoje, remédios, conversa, avisos, resumo, ajustes) e alertas de SOS, remédio e conquista
  roteiro.js          demonstração guiada: 13 passos divididos em momentos (um por aparelho); a pessoa decide quando virar a página
  sala3d.js           (só no index.html) sala de estar em three.js; ?fixo tira a transição da câmera
  vitrine3d.js        (só no saiba-mais.html) vitrine com os equipamentos em 3D; arraste para girar; ouve o evento "capitulo"
  saibamais.js        capítulos (avisam a câmera 3D), índice dos equipamentos e abas (links #f5, #roadmap abrem a aba certa)
  iniciar.js          moldura (três contas, comparar contas, reiniciar) e partida
audio/lumi/           falas publicadas: 218 mp3 em voz neural + falas.json
ferramentas/          gerar_voz_lumi.py (edge-tts), atualizar_imagens_docs.py (capturas dos documentos) e gerar_pdf_apoio.py (PDF de uma página com QR codes, para a entrega)
video/                vídeo do pitch (HyperFrames): roteiro.json, ferramentas/ (capturas, locução, música, efeitos, montagem) e README próprio
exemplos/             laudo de exemplo FICTÍCIO em PDF
tests/                teste de fumaça (fumaca.html)
docs/                 documentação
```

As variáveis do app (`S`, `P`, `R`, `Q`…) são `const`/`let` globais de scripts clássicos. Por isso os testes as acessam com `window.eval`.

## Aparelhos em tamanho real

Cada aparelho tem tamanho fixo de verdade (celular 390 × 784, tela 366 × 760; relógio com tela 186 × 226) e é escalado **inteiro** pela variável CSS `--escala` (`zoom`), calculada em `encaixarAparelhos()` (`iniciar.js`) a partir do espaço livre. Assim a tela nunca fica achatada. A partir de 1200 px de largura o roteiro guiado vira uma coluna à direita; abaixo disso fica embaixo e a escala desconta a altura dele. Em telas de até 960 px o app mostra uma conta por vez, em tela cheia (o botão ⌚ mostra o relógio).

## Modo foco

`focarAparelho(qual)` (`iniciar.js`) grava `document.body.dataset.foco` (`paciente`, `relogio`, `familia`, `profissional` ou `todos`) e o CSS (`app.css`, só em telas > 960 px) esconde os aparelhos que não estão em foco. O app abre em `paciente`; `virarPagina(±1)` percorre `ORDEM_FOCO` (as setas laterais, o teclado e o seletor numerado do topo usam isso), e a animação de entrada vem de `--dx`. `encaixarAparelhos()` conta com isso: um aparelho só pode passar do tamanho real (até 1,25×; relógio até 1,6×), e com todos nunca passa de 1×. O roteiro chama `ver(qual)`, que vira a página sozinho. O painel do roteiro (veja "Roteiro guiado") diz "Olhe para: …" (`atualizarOnde()`) e mantém "o que olhar" recolhido atrás do botão 👀. O menu **⋯** agrupa estúdio de voz, comparar contas e reiniciar (no celular eles continuam soltos na barra).

## Tema escuro dos aparelhos

`body.escuro .tela` redefine as variáveis de cor das telas (`--tela`, `--cartao`, `--texto`…) e `--veu` (fundo translúcido dos botões e selos). É o padrão; `S.perfil.telaEscura === false` volta ao claro (botão no topo de `app.html` ou "Meu jeito"). Os gráficos em SVG usam `currentColor` para acompanhar o tema. Cuidado de acessibilidade: cinza-esverdeado e bege em vez de preto e branco puros, para reduzir ofuscamento.

## Vitrine e sala 3D: enquadramento e nomes

`sala3d.js` e `vitrine3d.js` medem o painel de texto do capítulo ativo e enquadram a cena só na parte livre da tela (à direita no computador, acima do painel no celular, abaixo da barra do topo). Os nomes sobre os modelos (`.rotulo3d`) só ficam visíveis com a câmera parada e dentro dessa parte livre. Parâmetros de depuração: `?fixo` (câmera sem transição, expõe `salaIr`/`vitrineIr`/`vitrineDiag`) e `?sempainel` (enquadra sem reservar o painel).

## Design calmo e gamificado

Regras tiradas de estudos de acessibilidade para autismo (lista em [`FONTES.md`](FONTES.md)): uma coisa por tela, figura + texto curto + voz, cores pastel sem nada piscando, navegação sempre no mesmo lugar e progresso por **trilha de estrelas** (`P.trilha` em `paciente.js`): cada passo feito vira ⭐, o atual mostra a figura, o fim é 🏁. Não há placar, tempo-limite nem perda de estrelas.

## Celular (responsivo)

- **App** (`css/app.css`): até 960 px o palco deixa de mostrar vários aparelhos; mostra **uma conta por vez** em tela cheia (`.dispositivo.oculto`), sem moldura. O seletor Lucas / Ana / Pro / ⌚ fica na barra do topo, e os botões do topo viram só ícones (`.tx` escondido); estúdio de voz e "Comparar contas" ficam na aba **Mais**. O roteiro guiado reserva a própria altura (`--rt-h`).
- **Site** (`css/inicio.css`, `css/saibamais.css`): até 860 px o painel de cada capítulo vai para baixo e a câmera 3D enquadra só a parte livre acima dele (`alvoY`); em telas baixas (≤ 700 px) há um modo compacto. Painéis só rolam por dentro quando o conteúdo não cabe. As abas viram uma faixa de rolagem lateral.
- Verificado por medição em 390 × 844, 360 × 740 e na horizontal (844 × 390): `scrollWidth` igual à largura, painéis dentro da tela.

## Estado e eventos

- **Estado `S`**: um único objeto (perfil, rotinas, contas, sessões, pet, eventos, alerta, aoVivo + um pedaço por módulo: `S.conhecimento`, `S.caa`, `S.saude`). É salvo em `localStorage` na chave `pap4:estado` (`VERSAO_ESTADO` em `nucleo.js`; mudar a versão descarta estados antigos).
- **Evento**: `{ id, tipo, de, data, dados }`. Toda ação relevante chama `emitir(tipo, dados, de)`, que faz, em ordem:
  1. `aplicar(ev)`: muda o estado (núcleo e `MODULOS[].aplicar`);
  2. guarda o evento na linha do tempo (exceto `progresso` e `fala_caa`) e salva;
  3. envia o evento às outras abas (`BroadcastChannel`);
  4. `aoEvento(ev)`: anima o "pacote" no fio entre as contas, `P.receber`, `MODULOS[].receber` e `R.receber`.
- Uma aba que recebe um evento de outra **não** reaplica: ela recarrega o estado já salvo pelo remetente (`S = carregar()`) e só reage na tela.

### Eventos principais

| Evento | Quem emite | Efeito |
|---|---|---|
| `inicio`, `progresso`, `conclusao`, `encerrou` | paciente | "ao vivo" e linha do tempo da família |
| `calma`, `barulho`, `humor` | paciente | avisos à família |
| `sos`, `a_caminho`, `sos_resolvido` | paciente / família | alerta com localização e resposta de volta |
| `fase_aprovada` | família | muda a fase e avisa o Lumi |
| `msg`, `marcar_pedido`, `marcar_resposta`, `combinado_*`, `fala_caa` | CAA | conversa, agenda e aprendizado de uso |
| `med_lembrete`, `med_tomado`, `med_dado`, `med_atrasado`, `med_ajustada` | Lumi / paciente / médica | adesão, estoque, mudança de horário |
| `crise_registrada`, `sono_registrado`, `efeito`, `nota_sessao`, `meta_nova` | família / profissionais | diário, plano e notas |
| `pedido_laudo`, `laudo_enviado`, `pergunta_prof`, `resposta_prof`, `resposta_ia`, `ajuste_ia` | IA / família / profissionais | conhecimento sobre o paciente |

## Módulos e pontos de extensão

Um módulo opcional se registra no núcleo, em vez de "costurar" funções por cima das de outros arquivos:

```js
MODULOS.push({
  nome: 'saude',                 // chave do pedaço do estado: S.saude
  dados: saudePadrao,            // estado inicial do módulo
  ajustar(S) { /* migra estado já salvo */ },
  aplicar(ev) { /* muda o estado quando um evento acontece (em todas as abas) */ },
  receber(ev) { /* reage na tela (banners, redesenho) */ },
  texto(ev)   { /* frase da linha do tempo para os eventos do módulo */ },
});
```

Pontos de extensão disponíveis:

| Ponto | Para quê |
|---|---|
| `MODULOS` | estado, eventos e textos da linha do tempo |
| `P.ganchosInicio` | funções que acrescentam itens à tela inicial do paciente |
| `P.telas` | novas telas do paciente (`P.telas.conversar`, `P.telas.meujeito`…) |
| `R.nav`, `R.abas`, `R.selos`, `R.ligadores` | abas da família, selos numéricos nos ícones e ligação dos cliques |
| `R.secoesMais` | seções da aba "Mais" (voz, ajustes, rotinas, contas) |
| `Q.abas` | abas da conta profissional |
| `VOZ.motor`, `VOZ.aoParar` | motor de voz e interrupção de áudios |
| `ICONE_EV` | ícones da linha do tempo |

Para criar um módulo novo: escreva `js/meumodulo.js`, registre em `MODULOS`, acrescente a tag em `app.html` antes de `iniciar.js` e, se tiver tela, use os pontos acima.

## Como a IA funciona no protótipo

### Desvanecimento de dicas (`paciente.js`, `nucleo.js`)
Três fases por rotina. O nível de ajuda inicial é `nivelInicial(fase)`: fase 1 → instrução (nível 2); fase 2 → pergunta (nível 1); fase 3 → silêncio (nível 0). Se a pessoa não conclui em `S.perfil.espera` segundos, o nível sobe um degrau (silêncio → pergunta → instrução). Um passo conta como "acerto" (`acerto()`) quando a pessoa não precisou de mais ajuda do que a fase oferece e não pediu pausa. A sugestão de mudar de fase (`sugestao()`) exige pelo menos 4 sessões na fase; usa as últimas 6; **≥ 80%** sugere avançar, **< 35%** sugere voltar. Quem muda a fase é sempre um humano.

### Repetição da instrução (`paciente.js`)
No nível 2 (instrução) o Lumi pode repetir a fala se a pessoa não responde, mas sem pressionar: `P.espera()` mantém o intervalo (`S.perfil.espera`, padrão 8 s) nas 3 primeiras repetições e depois **dobra a cada repetição** (até 8×, no máximo 2 minutos). Depois de `P.REPETICOES_MAX` (6) repetições o Lumi **para de falar** e deixa um recado calmo na tela ("Sem pressa. Quando quiser, toque em Fiz ou em Calma"). O contador (`g.repeticoes`) zera ao mudar de passo e ao voltar da Calma ou do SOS.

### Visão computacional (`paciente.js`)
`COCO-SSD` (`lite_mobilenet_v2`, TensorFlow.js) roda no navegador a cada 300 ms. Um passo com objeto é confirmado após **3 leituras seguidas** com confiança > 0,55 (depois de 1,5 s no passo). A **noção espacial** usa o centro da caixa: terços da imagem (< 36% esquerda, > 64% direita, senão "bem na frente"; invertido na câmera frontal) e a área da caixa para "pertinho"/"mais longe".

### Ruído (`paciente.js`)
`AnalyserNode` (WebAudio); o nível é a raiz da média dos quadrados × 400. Acima de `S.perfil.ruidoLimite` (padrão 70, aprendido pelas respostas da família ou pelo laudo) por 12 leituras de 200 ms, o Lumi oferece uma pausa e a família é avisada.

### Linguagem adaptada (`nucleo.js`)
Cada passo tem o texto em três níveis de literalidade (`curta`, `normal`, `explica`), a pergunta da fase 2 e a frase da história social. O hiperfoco entra nos elogios. **No MVP são modelos de frase; no produto, um modelo de linguagem aplicaria as mesmas regras.**

### Conhecimento sobre o paciente (`conhecimento.js`)
- **Perguntas**: 5 perguntas fixas (`PERGUNTAS_IA`) e 1 gerada pelos dados (o passo com menor autonomia nos últimos 60 dias). Cada resposta altera o perfil (tempo de espera, ruído, pictogramas, história antes) e vira um "aprendizado". A família pode encaminhar a pergunta à terapeuta.
- **Laudo**: PDF (extraído com `pdf.js`) ou TXT; as frases são comparadas com `REGRAS_LAUDO` (expressões regulares por área: funções executivas, flexibilidade, sensorial, memória visual, linguagem, velocidade, ansiedade, atenção). Cada achado mostra o trecho original, o impacto e um ajuste. **O ajuste só é aplicado quando a família aprova.** PDF escaneado (imagem) não é lido; no produto entraria OCR.

### CAA (`caa.js`)
`PICTOS` (figuras por categoria); `traduzirPictos()` transforma a sequência em frase ("eu + quero + parque + sábado" → "Eu quero ir ao parque no sábado."); `textoParaPictos()` faz o caminho inverso para as mensagens da família; as sugestões de próxima figura vêm de bigramas contados nas frases já montadas; o histórico mensal (tamanho da frase, vocabulário, iniciativa) alimenta o painel da família.

### Saúde (`saude.js`)
Lembrete de remédio com figuras (agendador confere o relógio a cada 20 s), adesão, estoque, diário de sono e crises, e `padroesIA()` (gatilhos mais frequentes, noites curtas antes de crises, doses atrasadas). `responderIA()` responde com os dados e **recusa** pedidos de diagnóstico ou mudança de dose.

## Voz (`voz.js`)
`falar(texto)` chama `VOZ.motor`. O motor de `voz.js` procura a gravação da fala inteira (ou, se a fala tem várias frases, o maior trecho gravado de cada vez). Se **todas** as partes existirem, toca os áudios; senão, usa a voz sintética (`falarSintetico`), para não misturar vozes na mesma frase. As chaves são o texto normalizado (`chaveFala`). Gravações ficam em **IndexedDB** (`pap-voz`); as publicadas ficam em `audio/lumi/falas.json`. `todasAsFalas()` gera o inventário a partir do conteúdo do próprio app, então o roteiro de gravação nunca fica desatualizado.

A voz sintética é escolhida por `notaVoz()` (`nucleo.js`): vozes neurais (Microsoft *Online (Natural)* no Edge, Apple *Premium/Aprimorada*) e femininas vêm primeiro; **as vozes do Google ficam de fora** por soarem robóticas e só entram se o aparelho não tiver nenhuma outra em português. Sem voz neural, a tela de voz sugere o Edge ou as falas gravadas.

## Roteiro guiado (`roteiro.js`)
A demonstração tem **13 passos** (`PASSOS_ROTEIRO`) e cada passo se divide em **momentos** curtos, um por aparelho (celular do Lucas, relógio, celular da Ana, tablet do profissional). Um momento tem `{ foco, botao, leitura?, acao() }`: `foco` é o aparelho que aparece, `botao` é o texto do botão principal ("Ver na tela da Ana →") e `acao()` executa ações **reais** do app (as mesmas dos botões).

- **Quem decide a hora de virar a página é a pessoa:** o roteiro começa no celular do Lucas e só troca de aparelho quando o botão principal é tocado. Depois do último momento, o botão vira "Próximo passo →". "Pular →" e "↻ Ver de novo" completam os controles.
- **Modo automático (▶▶):** percorre todos os momentos com pausas de leitura (`leitura`, padrão 4,5 s; `ROTEIRO.ritmo` encurta nos testes). Serve para gravar vídeo.
- **Nada é pulado:** `ROTEIRO.m` (próximo momento) só avança quando o momento termina de verdade. As esperas são canceláveis (`ROTEIRO.token`): pausar, fechar ou trocar de passo interrompe a ação em andamento, e o momento interrompido pode ser repetido. Só um laço automático pode estar vivo (`ROTEIRO.auto`), então retomar depois de pausar nunca duplica a execução.
- **Passo opcional (câmera):** o automático **pausa** nele e espera a pessoa ligar a câmera ou pular (`ROTEIRO.pularOpcionais = true` o ignora; é o que os testes usam).
- **Cuidados:** o roteiro reinicia os dados fictícios, deixa câmera e microfone desligados (para não pedir permissão) e restaura o perfil ao fechar (`ROTEIRO.salvo`). Enquanto está ativo, o SOS não pede localização (usa o endereço fictício).
- **Painel:** mostra "passo i de N · parte k de n" e "👀 Olhe para: …" (o aparelho em foco). Em telas ≥ 1200 px fica numa coluna à direita; nas menores, embaixo (`ajustarAltura()` reserva o espaço).

## Privacidade e segurança no código
- Imagem e áudio são processados no aparelho; nada é gravado nem enviado. A câmera e o microfone só ligam durante uma rotina (ou na gravação de voz).
- Todo texto vindo de entradas passa por `esc()` antes de entrar no HTML.
- Dependências externas (CDN): TensorFlow.js 4.22.0 e COCO-SSD 2.2.3 (jsDelivr), pdf.js 3.11.174 e JSZip 3.10.1 (cdnjs), Google Fonts. Os **modelos** e bibliotecas são baixados; **nenhum dado do paciente** é enviado.
- O SOS usa `navigator.geolocation` só quando acionado e com permissão do navegador.

## Testes
`tests/fumaca.html` abre o app num iframe e executa **58 verificações** (telas das três contas, fluxos de SOS, CAA, remédio, laudo em texto e PDF, permissões, inventário de falas, o roteiro guiado completo em modo acelerado, a pausa no passo opcional e o limite de repetições da voz do Lumi). Veja o `README` para rodar. Não há testes unitários: o foco é garantir que a demonstração nunca quebre.

## Convenções do código (para quem for ler ou editar)
- **Todo arquivo começa com um bloco que diz o que ele faz** e como se encaixa (veja o topo de cada `js/*.js`). Cada função ou objeto importante tem um comentário curto dizendo o que faz, onde é usado e o que devolve.
- **Nomes em português** (`emitir`, `aplicar`, `rotinaPorId`, `faseDe`), porque o projeto é para o público brasileiro e para facilitar a leitura por quem não programa em inglês.
- **Um módulo por assunto.** O estado de cada módulo opcional fica em `S.<nome>` e só ele o altera (em `aplicar`). As telas só leem o estado e chamam `emitir()` para mudá-lo.
- **Tudo vira evento.** Para um botão novo: `emitir('tipo', { dados }, quemFez)`; a regra que muda o estado vai em `aplicar(ev)` do módulo; a reação na tela vai em `receber(ev)`; a frase da linha do tempo vai em `texto(ev)`.
- **Textos que o Lumi fala** passam por `falar()`. Se forem fixos, entram no inventário de `voz.js` (`todasAsFalas`) para poderem ser gravados; mudou um texto, rode `ferramentas/gerar_voz_lumi.py --refazer`.
- **Depois de mexer:** rode o teste de fumaça (`tests/fumaca.html`) e, se mudou um arquivo de `css/` ou `js/`, aumente o `?v=` em `app.html` para o navegador não usar a versão antiga.

## Do protótipo ao produto

| Hoje (MVP) | Produto |
|---|---|
| Eventos entre abas (`BroadcastChannel`) | Servidor com WebSocket/push, criptografia e trilha de auditoria |
| `localStorage` | Banco de dados no servidor + cache local; consentimento por conta e exportar/apagar dados |
| Contas simuladas | Autenticação real, vínculo por código/QR, permissões por conta |
| Linguagem e laudos por regras | Modelo de linguagem com minimização de dados pessoais e revisão do profissional |
| Visão no navegador (COCO-SSD) | Modelos no aparelho (app nativo) e modelos específicos para as rotinas |
| Site/app web | App Android/iOS, relógio, colar e Lumi físico (veja `docs/ROADMAP.md`) |
