# Vídeo do pitch (HyperFrames)

Vídeo comercial de **2:55** (limite do NAUFest: 3 minutos), em **1920×1080, 30 fps, MP4**, com a voz da Lumi, música suave e legendas. Feito com o [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML + GSAP renderizados com Chrome e FFmpeg).

> O MP4 final fica em `video/saida/passo-a-passo-pitch.mp4` (não vai para o Git: a pasta `saida/` está no `.gitignore`).

## O que o vídeo mostra (12 cenas)

| # | Cena | Conteúdo |
|---|---|---|
| 1 | Abertura | Título, sala 3D e a Lumi se apresentando |
| 2 | O problema | 2,4 mi de pessoas, 56,5% com até 2 h de terapia/semana, 168 h da semana, 92,4% de cuidadoras (fontes na tela) |
| 3 | A solução | A sala de casa: Lucas (celular com a Lumi), Ana (celular) e Carlos (relógio) |
| 4 | Antes, durante, depois | História social → guia por voz → relatório (telas reais do app) |
| 5 | **IA nº 1 · enxerga** | Reconhecimento de objetos e direção ("à sua esquerda"), no aparelho, sem gravar nem enviar imagem |
| 6 | **IA nº 2 · decide quanto ajudar** | Explica → pergunta → observa; ajuda que diminui e autonomia que cresce (desvanecimento de dicas) |
| 7 | **IA nº 3 · adapta, pergunta e lê o laudo** | Linguagem por nível e interesse, perguntas à família, laudo em PDF/TXT, "a IA sugere, um humano aprova", "sem IA seria só lembretes" |
| 8 | No dia a dia | CAA por figuras, remédio com lembrete, SOS no celular e no relógio |
| 9 | Evolução | 14 meses de jornada, com recuos (dados fictícios) |
| 10 | Calmo por design | Tela escura/clara, uma coisa por vez, trilha de estrelas sem punição, ajustes para todas as idades |
| 11 | O plano | Celular → relógio → colar → fone → Lumi físico; piloto e estudo clínico antes de qualquer promessa |
| 12 | Fecho | "Inteligência artificial para a autonomia e o desenvolvimento de pessoas autistas", protótipo funcional, dados fictícios, código aberto, link |

As imagens são **capturas reais** do app e da sala 3D do site (não são mockups). A única cena ilustrada é a da câmera (cena 5), e isso aparece escrito na tela.

## Regras do NAUFest atendidas

- Duração: **≤ 3 minutos** (2:55). Formato **16:9, 1920×1080, MP4**, com áudio.
- Estrutura pedida: **o problema** e **a solução com IA**, com ênfase na IA (três cenas e uma faixa "Inteligência artificial" em cada).
- Avisa que os dados do protótipo são fictícios.
- Legendas embutidas (acessibilidade e para quem assiste sem som).

## Como gerar de novo

Pré-requisitos: Node.js 22+, FFmpeg, Python 3.11 com `edge-tts`, `numpy` e `pillow`, e o Chrome instalado.

```bash
python -m http.server 8765                       # na raiz do projeto, em outro terminal
cd video && npm install                          # instala o puppeteer-core
node ferramentas/capturar.mjs                    # 1. captura as telas do app e da sala 3D (assets/img)
python ferramentas/gerar_locucao.py              # 2. voz da Lumi + linha do tempo (roteiro.json)
python ferramentas/gerar_musica.py               # 3. trilha animada original e efeitos sonoros nas transições (gerar_efeitos.py) (assets/musica.wav)
python ferramentas/montar_video.py               # 4. gera o index.html (cenas, legendas, áudio)
npx hyperframes check                            # 5. confere a composição
npx hyperframes render --fps 30 --quality high -o saida/passo-a-passo-pitch.mp4   # 6. MP4
```

Para mudar o texto, edite `roteiro.json` e rode do passo 2 em diante (a duração de cada cena acompanha o áudio). Para pré-visualizar: `npx hyperframes preview`.

## Peças

- `roteiro.json`: a fala da Lumi, frase por frase (texto da legenda e texto falado, que às vezes difere para a pronúncia).
- `ferramentas/video.css`: o visual (mesma paleta do site).
- `ferramentas/montar_video.py`: as cenas e as animações, sincronizadas com o início de cada frase.
- `assets/voz/`: um MP3 por frase (voz neural feminina **Thalita**, edge-tts, em ritmo natural, sem aceleração; para trocar de voz, mude `voz` em `roteiro.json`, por exemplo `pt-BR-FranciscaNeural`). `assets/musica.wav`: trilha gerada por síntese (acordes D maj7 · Bm7 · Gmaj7 · A, a 66 bpm), sem direitos autorais.

## Antes de enviar

- [ ] Assistir ao vídeo inteiro com som e conferir o volume da voz sobre a música.
- [ ] Renomear: `NOME E SOBRENOME_PAÍS_Vídeo_#AIforImpact2026.mp4`.
- [ ] Enviar ao Drive/Dropbox com "Qualquer pessoa com o link pode visualizar".
- [ ] Se quiser a **sua própria voz** ou uma voz humana gravada, substitua os MP3 de `assets/voz/` mantendo os nomes e rode os passos 4 e 6 (a linha do tempo precisa ser recalculada pelo passo 2 se as durações mudarem).
