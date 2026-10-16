# Proposta · Passo a Passo

> **NAUFest #AIforImpact2026** · apoio à autonomia de pessoas autistas com IA assistiva.
> Esta proposta segue as etapas do desafio. Os números têm fonte em [`FONTES.md`](FONTES.md) (indicadas por [n]). Onde falta algo que só a autora ou o autor pode fornecer, está marcado com **[A PREENCHER]**.

## Etapa 1 · Observe o seu entorno

| Pergunta | Resposta |
|---|---|
| **O que você viu?** | **[A PREENCHER com um caso real observado: quem, o que aconteceu, o que a pessoa não conseguiu fazer sozinha.]** O padrão que motivou o projeto: pessoas autistas que sabem o que querem fazer, mas travam nos passos implícitos de uma tarefa comum (esperar a vez, pedir ao atendente, pagar no caixa) e dependem de um adulto para concluí-la. |
| **Onde?** | **[A PREENCHER: local, cidade.]** |
| **Quando?** | **[A PREENCHER: data ou período.]** |
| **Que evidência mostra que não foi um caso isolado?** | Dados nacionais e relatos de famílias: 2,4 milhões de pessoas com diagnóstico no Brasil [1]; 56,5% recebem até 2 horas de terapia por semana [5]; filas de terapia de cerca de 3 anos em Campo Grande (MS) [6]; 92,4% de quem cuida são mulheres e 30,5% estão sem renda própria [5]. **[A PREENCHER: uma ou duas conversas reais com uma mãe, um pai ou um terapeuta.]** |

## Etapa 2 · O problema, um passo além

- **Quem ou o que afeta.** Pessoas autistas de todas as idades (o MVP parte de crianças e adolescentes), suas famílias (sobretudo as mães) e os terapeutas, que não conseguem estar presentes nas situações reais.
- **Dimensão.** 2,4 milhões de pessoas com diagnóstico no Brasil, 1,2% da população, e 2,6% entre 5 e 9 anos (Censo 2022, dado declarado) [1]. Nos EUA, 1 em 31 crianças de 8 anos [3]; no mundo, cerca de 1 em 100 [4].
- **O que causa.** O mundo real é imprevisível e cheio de estímulos; as regras sociais são implícitas; o apoio terapêutico acontece em poucas horas por semana e fora do lugar onde a dificuldade aparece; e o treino do consultório não se generaliza para a vida diária.
- **Consequência concreta hoje.** Dependência de um adulto para tarefas simples, crises em lugares públicos, sobrecarga e perda de renda de quem cuida (30,5% sem renda própria [5]), riscos de segurança (49% das crianças autistas tentaram se afastar ao menos uma vez depois dos 4 anos [8]) e pouca informação objetiva sobre o que funciona no dia a dia.

## Etapa 3 · Três soluções comparadas

| # | Solução | O que mudaria | Como funcionaria | Recursos |
|---|---|---|---|---|
| A | Robô ou colete com câmera | Guia em tempo real | Hardware dedicado com IA | Caro; motores, bateria e ruído (gatilho sensorial) |
| B | Cartões e histórias sociais impressos | Mais previsibilidade antes da tarefa | O terapeuta monta à mão | Papel e tempo do terapeuta; não se adapta nem ajuda na hora |
| C | **App com IA no celular** (e, depois, relógio, fone e robô) | Previsibilidade antes, apoio durante e acompanhamento depois | Câmera e voz guiam; a ajuda diminui; a família e a terapia acompanham | Celular que a família já tem; navegador |

| Critério | A (robô) | B (cartões) | C (app com IA) |
|---|---|---|---|
| **Impacto** | Alto, mas cria dependência | Médio (só "antes") | **Alto, e vai retirando a ajuda** |
| **Viabilidade** | Baixa | Alta | **Alta (roda no navegador)** |
| **Acessibilidade** | Baixa (custo, ruído) | Alta | **Alta (celular comum, sem hardware extra)** |

**Escolhida: C.** A e B entram como complementos: o robô físico e os vestíveis estão no roadmap; as histórias sociais viram a primeira etapa do app (geradas e narradas pela IA).

## Etapa 4 · O papel da IA

| Pergunta | Resposta |
|---|---|
| **Que tarefa a IA realiza?** | (1) **Enxerga** a cena (objetos, direção) e confirma os passos; (2) **adapta a linguagem** ao nível de cada pessoa e ao hiperfoco; (3) **dosa a ajuda** (silêncio, pergunta ou instrução) e a reduz conforme a pessoa aprende; (4) **mede e resume** a evolução; (5) **pergunta** à família e aos profissionais e **lê laudos** para ajustar o app ao jeito de cada pessoa; (6) apoia a **comunicação por figuras** e organiza os dados de saúde (remédios, sono, crises) para a consulta. |
| **Que informação usa?** | Imagem e áudio (processados no aparelho, nada gravado), o perfil definido pela família, as respostas às perguntas da IA, o laudo, o histórico de sessões e os registros de saúde. |
| **Que resultado gera?** | Instruções e perguntas no momento certo, comunicação falada, relatórios de autonomia, sugestões de ajuste e resumos para a consulta. |
| **Quem revisa?** | **Uma pessoa**: a família ou o terapeuta aprovam cada mudança de fase e cada ajuste sugerido pelo laudo; só a médica altera dose e horário de remédios. A IA não dá diagnóstico. |
| **Por que a IA torna a solução mais eficaz, viável ou acessível?** | Sem IA, alguém precisaria estar ao lado o tempo todo para perceber a hora de ajudar ou de ficar quieto. A IA leva o método terapêutico (desvanecimento de dicas) para a vida real, adaptado a cada pessoa, e transforma laudos e rotinas em ajustes concretos. Sem ela, vira um app de lembretes. |

## Etapa 5 · Mapa passo a passo

```
Família/terapeuta      Pessoa autista                               Família/terapeuta
1. Configura       →   2. Antes: história social           →   5. Revisa e decide
   perfil, rotinas,       3. Durante: guia por voz e câmera,         (fases, ajustes do laudo,
   permissões             SOS, calma, CAA, remédio                    remédios pela médica)
                          4. Depois: IA registra e sugere     ←──────┘
```

| Etapa | Quem ativa | Informação | O que acontece | Ferramentas | Tarefa da IA | Responsável |
|---|---|---|---|---|---|---|
| Configurar | Família / terapeuta | Nível de suporte, hiperfoco, rotinas, permissões | Perfil e contas conectadas | App | Pergunta, lê laudo, sugere ajustes | Família / terapeuta |
| Antes | Pessoa ou família | Rotina + perfil | História social narrada | App, voz | Adapta a linguagem | Pessoa |
| Durante | Pessoa | Câmera, microfone, toques | Silêncio, pergunta ou instrução; SOS; calma; figuras; lembrete de remédio | Câmera, fone, IA no aparelho | Reconhece, dosa, traduz | IA + pessoa |
| Depois | Automático | Registro de passos | Relatório de longo prazo e sugestão de fase | App | Mede e resume | IA sugere |
| Revisar | Família / terapeuta | Relatório e laudo | Aprova ou ajusta | App | — | **Humano** |

## Etapa 6 · MVP

Protótipo funcional, aberto no navegador (veja o [`README`](../README.md) e o [`GUIA-DOS-JURADOS.md`](GUIA-DOS-JURADOS.md)). **O que funciona de verdade:** visão computacional no aparelho; voz, comandos de voz, medidor de ruído; desvanecimento de dicas; leitura de laudos em PDF e TXT; CAA; lembrete de remédio; SOS; três tipos de conta com permissões diferentes; estúdio para gravar a voz humana do Lumi. **O que é simulado:** pacientes, histórico, remédios e laudo (fictícios); conversa entre aparelhos diferentes (aqui, dentro do mesmo navegador); linguagem e respostas da IA por regras (no produto, um modelo de linguagem).

## Etapa 7 · Teste com 1 ou 2 pessoas

Mostre o protótipo sem explicar demais e anote as respostas. **[A PREENCHER depois dos testes.]**

| Pergunta | Pessoa 1 | Pessoa 2 |
|---|---|---|
| Que problema ela resolve? | | |
| Como ela funciona? | | |
| O que a IA faz? | | |
| Que parte não ficou clara? | | |

Sugestão: peça a uma mãe, pai ou terapeuta para abrir o roteiro guiado e comentar em voz alta; se possível, ouça também uma pessoa autista.

## Etapa 8 · Apresentação

Roteiro de vídeo de 3 minutos em [`ROTEIRO-VIDEO.md`](ROTEIRO-VIDEO.md). Estrutura pedida: **o problema** (qual, onde, quem afeta, por que importa) e **a solução com IA** (qual, papel concreto da IA, como funciona, por que é mais eficaz, viável ou acessível).

## Como a proposta responde aos critérios de avaliação

| Critério | Peso | Onde está |
|---|---|---|
| Definição do problema | 20% | Etapas 1 e 2; site: "Os desafios, com dados" |
| Pertinência da solução | 20% | Etapas 3 e 5; ética e segurança ([`ETICA-E-PRIVACIDADE.md`](ETICA-E-PRIVACIDADE.md)) |
| Pertinência e aplicação da IA | 20% | Etapa 4; site: "Por que a IA é indispensável" |
| Viabilidade e impacto potencial | 15% | Roteiro de testes, [`ROADMAP.md`](ROADMAP.md) e métricas de impacto |
| Originalidade e criatividade | 15% | Lumi, IA que ajusta o apoio a cada conquista, contas conectadas, CAA, laudo e voz humana |
| Clareza e força da proposta | 10% | Site, roteiro guiado de 3 minutos, documentação e honestidade técnica |

## Entrega

Link do **Google Drive ou Dropbox** configurado como "Qualquer pessoa com o link pode **visualizar**". Nome do arquivo: `NOME E SOBRENOME_PAÍS_CATEGORIA DE ENTREGA_#AIforImpact2026` (categoria: Vídeo, Áudio, Texto ou Design visual). Prazo: **16 de outubro de 2026**.
