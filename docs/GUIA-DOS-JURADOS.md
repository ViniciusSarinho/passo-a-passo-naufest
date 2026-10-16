# Guia dos jurados

Tudo que o projeto afirma pode ser conferido em poucos minutos. Este guia diz **o que abrir**, **o que olhar** e **o que é real ou simulado**.

## Em 3 minutos

1. Abra o site e clique em **▶ Ver a demo em 3 minutos** (ou abra `app.html?roteiro=1`). Antes, vale rolar a página inicial: a sala 3D mostra o Lucas com a Lumi, a Ana no celular e o Carlos no relógio. Em **Saiba mais** há a vitrine 3D dos equipamentos e, em abas, dados, ética e fontes.
2. O roteiro **começa no celular do Lucas** e quem decide a hora de virar a página é você: o botão principal diz o que vem a seguir (por exemplo, "👩 Ver o que a Ana vê ao vivo →") e, no fim de cada passo, vira "Próximo passo →". Se preferir ver tudo sozinho (cerca de 3 minutos), toque em **▶▶ Automático**; ele pausa no passo opcional da câmera.
3. Cada passo mostra **um aparelho de cada vez** (celular do Lucas, **relógio do Carlos**, celular da Ana, tablet do profissional) e o painel diz "👀 Olhe para: …". O botão 👀 abre "o que olhar" em cada passo. Pelo teclado, as setas ← → também viram a página.

| Passo | O que acontece | O que olhar |
|---|---|---|
| 2 e 3 | O Lumi **pergunta** em vez de mandar; se o Lucas trava, **a ajuda sobe**; ao concluir, ele ganha estrela | O desvanecimento de dicas, a ideia central |
| 4 | Decisão com **duas opções** (banana ou maçã) | Treino de decisão sem sobrecarga |
| 5 | **Câmera** (opcional): mostre uma mochila, livro, garrafa, banana, maçã ou celular | A caixa verde e a direção ("à sua esquerda") |
| 6 | **SOS**: o Lumi acalma; a Ana recebe alerta com mapa; o relógio do Carlos também; a resposta volta ao Lucas | Comunicação entre as contas e segurança |
| 7 | **Relógio do Carlos**: hoje, remédios, conversa, avisos, resumo e ajustes | O essencial no pulso |
| 8 e 9 | **Comunicação por figuras**, combinados e pedido para marcar | Figuras → frase falada; agenda |
| 10 | **Remédio** com lembrete em figuras | Adesão e estoque na conta da Ana |
| 11 | A IA **lê o laudo** (PDF ou TXT) e sugere ajustes que só entram com aprovação | IA com humano no controle |
| 12 | **Três profissionais**, três permissões; tabela "Comparar contas" | Cada um só vê e faz o que deve |
| 13 | **14 meses de evolução**, com recuos | Autonomia leva meses, não semanas |

## Para explorar sozinho

- **Laudo em PDF:** na conta da Ana, aba **IA**, baixe o [laudo fictício de exemplo](../exemplos/exemplo-laudo-ficticio.pdf) e envie. Funciona com qualquer PDF com texto ou TXT.
- **Conversa com a IA:** na conta da Ana, aba **Saúde**, role até "Converse com a IA" e pergunte "Devo aumentar a dose?" (ela recusa) ou "Como foi a semana?".
- **Ver como profissional:** no computador, alterne "Ver como: Profissional"; no celular, toque em **Pro**. Troque entre Dra. Júlia, Dr. Rafael e Dra. Helena.
- **Relógio do Carlos:** passe as telas (pontinhos, botões ‹ › ao lado do relógio ou arrastando): hoje, remédios (botão "Dei"), conversa, avisos para o Lucas, resumo e ajustes. Peça um SOS no celular do Lucas e responda "Estou indo" no relógio.
- **Tela escura ou clara:** botão **🌙** no topo (e em "Meu jeito"). A tela escura é o padrão, mais calma para a vista; sensibilidade à luz varia de pessoa para pessoa.
- **Meu jeito:** no celular do Lucas, atalho **Meu jeito** (volume, velocidade, voz, tela calma, letra maior).
- **Voz humana:** menu **⋯ → Voz do Lumi** (no celular, aba **Mais**) abre o estúdio de gravação. As 218 falas fixas já vêm em voz neural.
- **Reiniciar:** o botão **↺** volta tudo ao início.

## O que é real e o que é simulado

| Real | Simulado |
|---|---|
| Visão computacional no aparelho, voz, comandos de voz, medidor de ruído | Pessoas, remédios, histórico de 14 meses e laudo de exemplo (**fictícios**) |
| Desvanecimento de dicas, sugestão de fase com aprovação humana | Conversa entre **aparelhos diferentes** (aqui, as contas se falam no mesmo navegador) |
| Leitura de laudos em PDF/TXT, perguntas da IA, ajustes aprovados | Linguagem e respostas da IA por **regras** (no produto, um modelo de linguagem) |
| CAA, combinados, agenda, SOS, lembrete de remédio | Respostas da terapeuta e do neuropsicólogo nas demonstrações |
| Contas com permissões diferentes, estúdio de voz, tela do relógio no app | PDF escaneado (sem OCR); relógio, colar, fone e robô **físicos** (conceito) |

## Perguntas frequentes

**É IA de verdade?** Sim, em três pontos: reconhecimento de objetos por visão computacional (TensorFlow.js, rodando no navegador), adaptação da linguagem ao nível e ao hiperfoco, e leitura de laudos para ajustar a experiência. A "decisão" de quanto ajudar é um algoritmo de desvanecimento de dicas. Falta um modelo de linguagem: veja a tabela acima e `ARQUITETURA.md`.

**Por que não usar um modelo de linguagem já no MVP?** Para ser determinístico, gratuito e abrir em qualquer lugar sem chave de API. Ele entra no piloto, com dados mínimos e revisão profissional.

**Funciona sem internet?** O app em si não precisa de servidor, mas baixa as bibliotecas (TensorFlow.js e pdf.js) na primeira vez. Offline completo é requisito do app móvel.

**Quais dados saem do aparelho?** Nenhum dado do paciente. Imagem e áudio são analisados no aparelho; o estado fica no `localStorage`; só as bibliotecas e os modelos são baixados da internet.

**A câmera não abre.** Use `https` (GitHub Pages) ou `localhost`, permita a câmera, ou toque em **Fiz**. O roteiro automático **pausa** nesse passo e espera você ligar a câmera ou tocar em "Pular".

**Onde está o código?** Neste repositório. Comece por `docs/ARQUITETURA.md`.

**Como rodar os testes?** `python -m http.server` na raiz e abra `/tests/fumaca.html` (58 verificações).

**Tem vídeo?** Sim, de 2:54, feito com o HyperFrames. As fontes e o passo a passo para gerar de novo estão em [`video/README.md`](../video/README.md).

**Funciona no celular?** Sim: o app mostra uma conta por vez, em tela cheia, e o site reorganiza cena 3D e texto. Câmera e microfone pedem `https` ou `localhost`.

## Honestidade

O protótipo **não é um produto clínico** e não foi testado com pessoas autistas. A validação com famílias e profissionais é o primeiro passo do roadmap. Veja `ETICA-E-PRIVACIDADE.md`.
