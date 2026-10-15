# Como o projeto foi construído

Registro do processo, do desafio até a versão publicada no GitHub, para que dê para entender **o que foi feito, em que ordem e por quê**. O projeto foi feito em outubro de 2026, a poucos dias do prazo do NAUFest (16/10/2026), por uma pessoa com apoio de uma IA de programação (Claude Code, modelos Opus 5.5 e Sonnet 5.5): quem criou a ideia e decidiu cada rumo foi a autora ou o autor; a IA ajudou a criticar, pesquisar, programar, testar e documentar.

## 1. O desafio

O **NAUFest #AIforImpact2026** pede uma proposta que use IA para resolver um problema real observado no entorno da pessoa. O percurso tem etapas (observar o problema, defini-lo, comparar três soluções, definir o papel da IA, mapear o fluxo, criar um MVP e testá-lo com 1 ou 2 pessoas) e a entrega é um vídeo, áudio, texto ou design visual, em link do Drive.

Critérios de avaliação (pesos): definição do problema (20%), pertinência da solução (20%), pertinência e aplicação da IA (20%), viabilidade e impacto potencial (15%), originalidade e criatividade (15%), clareza e força da proposta (10%). Esses critérios guiaram as decisões: o site tem uma seção que liga cada critério ao que existe no protótipo.

## 2. A ideia inicial e a primeira crítica

A ideia: um "tutor" para pessoas autistas, preso a um colete ou um robô no ombro, com IA treinada para guiar situações do dia a dia (atravessar a rua, pagar no caixa) e, com o tempo, ajudar cada vez menos.

Na primeira revisão, ficaram estas decisões:

| Problema da ideia | Decisão |
|---|---|
| Começava pelo aparelho, não pelo problema | O problema (treino que não chega à vida real) vem primeiro |
| "Atravessar a rua" com IA é arriscado (um erro pode custar uma vida) | O MVP **não guia situações de risco**; começa por rotinas em que um erro custa um troco |
| Robô ou colete: caro, pesado, barulhento (gatilho sensorial) | Celular comum no bolso/cordão + fone de condução óssea; hardware vira roadmap |
| A IA decidia sozinha quando reduzir a ajuda | **Humano aprova** cada mudança de fase |
| Detectar crise pela respiração no microfone: pouco confiável | Botão de calma, botão SOS e "travou por X segundos" |
| Filmar o tempo todo: privacidade | Câmera só durante a rotina, análise no aparelho, nada gravado |
| "Corrigir" a criança | Linguagem de **apoio à autonomia** e co-criação com pessoas autistas |

A ideia central foi mantida e virou o diferencial: **a IA que se retira aos poucos** (desvanecimento de dicas, técnica real de terapia comportamental), "uma IA que ensina a não precisar dela".

## 3. Cronologia das versões

1. **MVP v1.** App web com câmera (reconhecimento de objetos no aparelho), voz, três fases de ajuda (instrução → pergunta → silêncio) e relatório com sugestão de fase aprovada por um humano.
2. **Site de apresentação.** Primeiro em tema claro e calmo; depois em tema escuro e azul, com fundo "de visão computacional". Correções de layout: cartões flutuantes cobrindo o celular passaram para as laterais; caixas de detecção ficaram dentro da moldura do celular.
3. **O Lumi e as duas contas.** Robô companheiro em SVG que muda de humor e evolui com a autonomia (cachecol, fones, capacete, visual do hiperfoco, capa). Duas contas conectadas (Lucas e Ana) lado a lado. Botão SOS (segurar 1,5 s) com localização e resposta "estou a caminho". Gráfico de **14 meses** com recuos reais (férias, mudança de escola), porque autonomia leva meses e anos, não semanas.
4. **Dados e fontes.** Pesquisa de números reais (IBGE, CDC, OMS, Mapa Autismo Brasil, reportagens e estudos) com links na página e lista de fontes no fim. Seção "por que a IA é indispensável". Roadmap com relógio, colar, fone e Lumi físico.
5. **A IA pergunta e lê o laudo.** Perguntas à família e aos profissionais; pedido do relatório ao neuropsicólogo; leitura do laudo (depois em **PDF e TXT**, no navegador) com sugestões de ajuste que só valem com aprovação humana.
6. **Comunicação (CAA).** Prancha de figuras que vira frase falada, mensagens da família com figuras, combinados "primeiro → depois", pedidos para marcar compromissos e painel do desenvolvimento da comunicação para a família e a terapeuta.
7. **Três tipos de conta e saúde.** Conta do profissional (terapeuta, neuropsicólogo, médica, com permissões diferentes), tela "Comparar contas", remédios com lembrete em figuras, adesão e estoque, diário de sono e crises com padrões percebidos pela IA, conversa com a IA sobre o tratamento (que recusa diagnóstico e mudança de dose), volume e voz ajustáveis, "Meu jeito" (tela calma, letra maior) e a seção de cuidados no site (idades, sensibilidades, privacidade).
8. **Voz humana.** Estúdio para gravar as falas do Lumi (218 falas, 62 essenciais); o app toca a gravação e usa a voz sintética só onde falta.
9. **Revisão final.** Auditoria, refatoração em módulos com pontos de extensão, roteiro guiado de 3 minutos, vitrine para os jurados (critérios, honestidade técnica, métricas de impacto), teste de fumaça com 51 verificações e esta documentação.
10. **Redesenho infantil e 3D (esta versão).** Pedido da autora/autor: a demonstração estava espremida, a voz do Google soava robótica, o site tinha informação demais e o visual azul de tecnologia não combinava com o público. Resultado: página inicial curta com uma **sala de estar em 3D** (three.js) e capítulos que movem a câmera (inspirada na narrativa por rolagem de seamoney.tech); o conteúdo detalhado foi para `saiba-mais.html`, com os **estudos do TCC**; tema pastel calmo em tudo; aparelhos em **tamanho real** escalados por inteiro, roteiro na lateral em telas largas e um **relógio do pai** que recebe SOS e responde "estou indo"; **trilha de estrelas** nas rotinas; vozes do Google fora da escolha automática; `firebase.json` para publicar no Firebase Hosting; teste de fumaça com 54 verificações.
11. **Vitrine dos equipamentos.** A autora/autor pediu que a parte informativa ficasse parecida com a página inicial e mostrasse os modelos 3D de cada equipamento, abandonando o visual anterior (escuro, com muitas seções em sequência). `saiba-mais.html` virou uma **vitrine 3D** (celular, relógio, colar, fone de condução óssea, painel e o Lumi físico com acessórios que acompanham os níveis), com a câmera passeando por capítulos curtos e os oito jeitos de o Lumi ajudar. O conteúdo detalhado (dados com fonte, IA, contas, cuidados, ética, real × simulado, roadmap, estudos do TCC e fontes) foi para abas, para ser fácil de achar.
12. **Ajustes de acabamento.** Feedback: o painel de texto cobria os modelos 3D; o colar parecia enterrado; o Lumi ficava confuso com todos os acessórios juntos; os dois celulares do app ficavam desalinhados; o relógio só mostrava o essencial; e o azul-escuro dos textos destoava. Respostas: a câmera mede o painel do capítulo e enquadra a vitrine só na parte livre (no computador, à direita; no celular, acima do painel); o colar flutua acima do pedestal; no 3D só um item da cabeça por nível (fones, capacete, crista) e a antena some quando atrapalha; o seletor "Ver como" flutua e os celulares alinham pelo topo; o relógio ganhou sete telas e ações (dar remédio, responder, avisar, ajustes); textos em verde-azulado escuro, ciano e ocre, só nas fontes.

## 4. Decisões técnicas e por quê

- **Site estático, sem backend.** Funciona em qualquer hospedagem (GitHub Pages) e qualquer jurado abre com um link. O custo: as contas só conversam dentro do mesmo navegador; isso está dito com todas as letras no site.
- **Visão no navegador (COCO-SSD / TensorFlow.js).** Privacidade por padrão (nada sai do aparelho) e zero custo de servidor. O modelo reconhece 80 classes genéricas; por isso as rotinas usam objetos comuns (mochila, livro, garrafa, banana, maçã, celular).
- **Regras em vez de modelo de linguagem.** Deixa o MVP determinístico, gratuito e demonstrável sem chave de API. A linguagem adaptada e a leitura de laudos usam regras que um modelo de linguagem substituiria no produto.
- **Humano no controle.** A IA sugere; a família ou o terapeuta aprovam mudanças de fase, ajustes do laudo e qualquer coisa que altere a experiência. Doses só pela médica.
- **Dados fictícios e rotulados.** Paciente, família, profissionais, remédios, histórico e laudo são inventados e identificados como tal.
- **Módulos que se registram.** Em vez de empilhar funções, cada área (conhecimento, CAA, saúde, profissional, voz) se registra em pontos de extensão (veja `ARQUITETURA.md`).

## 5. Como foi verificado

- `tests/fumaca.html`: 51 verificações automáticas (telas, fluxos, permissões, PDF, roteiro completo).
- Verificação visual em computador e celular (375 × 812) das telas do site e do app, sem rolagem horizontal.
- Links das fontes conferidos; alguns sites bloqueiam consultas automáticas e devem ser abertos no navegador (veja `FONTES.md`).
- **Não testado aqui:** câmera, microfone e localização reais (o navegador de desenvolvimento os bloqueia); a gravação de voz pelo microfone; uso com pessoas autistas, famílias e profissionais.

## 6. Lições e problemas resolvidos pelo caminho

- **Ordem dos scripts importa.** Ao dividir o código em módulos, o registro (`MODULOS`) precisava existir antes do primeiro uso; o teste de fumaça pegou o erro na hora.
- **Cache do navegador.** Cada alteração de arquivo mudava o `?v=` nos `<script>` para evitar que jurados vejam versões antigas.
- **Telas baixas.** Notebooks com viewport de ~700 px de altura fariam o painel do roteiro cobrir os celulares; a dica "o que olhar" ficou recolhível e a altura dos celulares se ajusta ao painel.
- **Datas fixas quebram demonstrações.** O histórico de 14 meses é calculado a partir do dia em que o app é aberto, em vez de datas escritas no código.
- **Afirmar só o que dá para provar.** Números do site têm fonte; limites das pesquisas (autodeclaração, amostra voluntária, estudos pequenos) estão escritos junto.

## 7. O que falta

- **Validar com pessoas** (etapa 7 do NAUFest): mostrar o protótipo a 1 ou 2 pessoas, sem explicar demais, e anotar as respostas às quatro perguntas (que problema resolve, como funciona, o que a IA faz, o que ficou confuso). Há um modelo em `PROPOSTA.md`.
- Testar câmera, microfone, localização e voz gravada em celulares reais (Android e iPhone).
- Gravar as falas essenciais do Lumi com voz humana.
- Consultar pessoas autistas, famílias, terapeutas e um especialista em LGPD antes de qualquer piloto.
- Gravar o vídeo de apresentação e entregar o link do Drive no formato `NOME E SOBRENOME_PAÍS_CATEGORIA_#AIforImpact2026`.
