# Roteiro de gravação · voz humana do Lumi

O app toca as falas gravadas no lugar da voz sintética. A troca é por fala: o que ainda não foi gravado continua com a voz do aparelho. Não é preciso gravar tudo de uma vez.

## Voz neural já publicada

As 218 falas já estão em `audio/lumi/` com uma **voz neural feminina** (Microsoft *Thalita*, gerada com `edge-tts`, um pouco mais devagar que o normal). Por isso o app não usa mais a voz robótica do navegador nessas falas. É uma voz **sintética**, não humana: se uma pessoa gravar as falas (abaixo), as gravações a substituem.

Para gerar de novo (depois de mudar textos do app), veja as instruções no topo de [`ferramentas/gerar_voz_lumi.py`](../ferramentas/gerar_voz_lumi.py). Para usar a Francisca: `--voz pt-BR-FranciscaNeural`. O texto de cada fala é enviado ao serviço de voz da Microsoft; as falas são fixas e fictícias. Num produto, o certo é usar uma conta própria do Azure Speech (com contrato) ou a voz gravada por uma pessoa.

São **218 falas**. As **62 marcadas com ⭐ são essenciais**: começando por elas, a demonstração com os jurados já fica quase toda com voz humana.

## Como gravar (dois jeitos)

**1. Direto no app (mais rápido)**
1. Abra `app.html` e clique em **🎙️ Voz do Lumi**, no topo (ou em "Mais → Abrir o estúdio de voz").
2. Escolha o filtro **Essenciais**. Em cada fala, toque em **🔈** para ouvir a referência, depois em **⏺ Gravar**, leia a frase e toque em **⏹ Parar**. O app toca a gravação na hora.
3. Errou? Use **🗑** e grave de novo.
4. Ao terminar, clique em **📦 Baixar pacote (.zip)**.

**2. Em outro app (celular, Audacity, estúdio)**
1. Grave cada fala num arquivo **com o nome igual ao código**, por exemplo `elogio-1.mp3` ou `guia-m1-normal.m4a`. Formatos aceitos: mp3, m4a, webm, ogg e wav.
2. No estúdio, use **⬆️ Importar áudios** e selecione todos os arquivos de uma vez.
3. Baixe o pacote .zip.

**Para publicar:** descompacte o .zip dentro da pasta `audio/lumi/` do projeto, substituindo o `falas.json`. Depois de publicado, todo mundo que abrir o site ouve a voz gravada.

O botão **📝 Baixar roteiro (.csv)** gera esta mesma lista em planilha, para enviar a quem vai gravar.

## Orientações para quem grava

- **Tom:** voz feminina, calma, acolhedora e próxima, como uma amiga mais velha. Nada de "voz de criança" nem animação exagerada.
- **Ritmo:** devagar, com pausas curtas entre as frases. Pessoas autistas costumam precisar de mais tempo para processar.
- **Literal:** leia exatamente o texto, sem trocar palavras. O app reconhece a fala pelo texto.
- **Instruções (fase 1):** claras e firmes, sem pressa.
- **Perguntas (fase 2):** tom curioso, sem cobrança, como quem confia que a pessoa sabe.
- **Calma e SOS:** mais baixo e mais lento; transmitir segurança.
- **Elogios:** alegres, mas sem gritar nem subir muito o tom (sons altos e bruscos incomodam).
- **Figuras da CAA:** uma palavra só, tom neutro. É a "voz" do Lucas quando ele toca nas figuras.
- **Técnica:** ambiente silencioso, celular ou microfone a uns 20 cm da boca, meio segundo de silêncio antes e depois. Mantenha o mesmo volume e a mesma distância em todas as gravações. Se usar editor, normalize o volume (por volta de −16 LUFS) e corte silêncios longos.

## Falas com nome e tema

Algumas falas citam **Lucas**, **Ana**, **Carlos** e **dinossauros** porque a demonstração usa esse perfil. Se o nome ou o hiperfoco mudar no app, essas falas voltam para a voz sintética até serem gravadas de novo. O estúdio sempre mostra a lista atualizada. Falas novas que o app usar e ainda não estiverem aqui aparecem no grupo "Outras falas usadas".

## Lista completa

⭐ = essencial

### Guia · Arrumar a mochila

| Código | Fala | ⭐ | Orientação |
|---|---|---|---|
| `guia-m1-normal` | Pegue a sua mochila e mostre para a câmera. | ⭐ | Instrução da fase 1, nível 2 de suporte. |
| `guia-m1-pergunta` | Para arrumar as coisas da escola, o que você precisa pegar primeiro? | ⭐ | Pergunta da fase 2: tom curioso, sem cobrança. |
| `guia-m1-curta` | Pegue a mochila. |  | Nível 3 de suporte: bem curto e claro. |
| `guia-m1-explica` | Primeiro, vamos pegar a mochila. É nela que ficam as coisas da escola. Pegue e mostre para a câmera. |  | Nível 1 de suporte: explicativo, sem pressa. |
| `guia-m2-normal` | Pegue o livro da aula de hoje e coloque na mochila. | ⭐ | Instrução da fase 1. |
| `guia-m2-pergunta` | Qual material de leitura vai para a escola hoje? | ⭐ | Pergunta da fase 2. |
| `guia-m2-curta` | Coloque o livro. |  | Nível 3. |
| `guia-m2-explica` | Agora o livro. Hoje tem aula e você vai precisar dele. Mostre o livro para a câmera e coloque na mochila. |  | Nível 1. |
| `guia-m3-normal` | Pegue a sua garrafa de água e coloque na mochila. | ⭐ | Instrução da fase 1. |
| `guia-m3-pergunta` | E se der sede na escola, o que você leva? | ⭐ | Pergunta da fase 2. |
| `guia-m3-curta` | Pegue a garrafa. |  | Nível 3. |
| `guia-m3-explica` | Na escola dá sede. Pegue a garrafa de água, mostre para a câmera e coloque na mochila. |  | Nível 1. |
| `guia-m4-normal` | Hora de escolher o lanche. Banana ou maçã? | ⭐ | Instrução da fase 1. |
| `guia-m4-pergunta` | Qual lanche você quer levar hoje? | ⭐ | Pergunta da fase 2. |
| `guia-m4-curta` | Escolha o lanche. |  | Nível 3. |
| `guia-m4-explica` | Você pode escolher o lanche de hoje. São só duas opções: banana ou maçã. Qualquer uma está certa. |  | Nível 1. |
| `guia-m5-normal-banana` | Mostre a banana para a câmera e coloque na mochila. | ⭐ | Instrução da fase 1. |
| `guia-m5-pergunta-banana` | Você escolheu o lanche. Onde ele vai agora? | ⭐ | Pergunta da fase 2 (vale para banana e maçã). |
| `guia-m5-curta-banana` | Guarde a banana. |  | Nível 3. |
| `guia-m5-explica-banana` | Você escolheu banana. Agora mostre para a câmera e guarde na mochila, junto com o resto. |  | Nível 1. |
| `guia-m5-normal-maca` | Mostre a maçã para a câmera e coloque na mochila. | ⭐ | Instrução da fase 1. |
| `guia-m5-curta-maca` | Guarde a maçã. |  | Nível 3. |
| `guia-m5-explica-maca` | Você escolheu maçã. Agora mostre para a câmera e guarde na mochila, junto com o resto. |  | Nível 1. |
| `guia-m6-normal` | Feche o zíper da mochila. | ⭐ | Instrução da fase 1. |
| `guia-m6-pergunta` | Tudo está dentro. O que falta fazer com a mochila? | ⭐ | Pergunta da fase 2. |
| `guia-m6-curta` | Feche a mochila. |  | Nível 3. |
| `guia-m6-explica` | Tudo está dentro. Agora feche o zíper para nada cair. Quando terminar, aperte "Fiz". |  | Nível 1. |
| `escolha-banana` | Banana. |  | Repete a opção escolhida. |
| `escolha-maca` | Maçã. |  | Repete a opção escolhida. |

### Guia · Comprar pão na padaria

| Código | Fala | ⭐ | Orientação |
|---|---|---|---|
| `guia-p1-normal` | Procure a fila do balcão de pão. | ⭐ | Instrução da fase 1. |
| `guia-p1-pergunta` | Onde as pessoas esperam para pedir o pão? | ⭐ | Pergunta da fase 2. |
| `guia-p1-curta` | Procure a fila. |  | Nível 3. |
| `guia-p1-explica` | Na padaria, as pessoas esperam numa fila perto do balcão. Procure onde as pessoas estão em fila. |  | Nível 1. |
| `guia-p2-normal` | Fique no fim da fila e espere a sua vez. | ⭐ | Instrução da fase 1. |
| `guia-p2-pergunta` | Tem gente na sua frente. O que a gente faz agora? | ⭐ | Pergunta da fase 2. |
| `guia-p2-curta` | Espere sua vez. |  | Nível 3. |
| `guia-p2-explica` | Cada pessoa é atendida de uma vez. Fique atrás da última pessoa e espere. Está tudo bem demorar. |  | Nível 1. |
| `guia-p3-normal` | Qual pão você quer hoje: francês ou de queijo? | ⭐ | Instrução da fase 1. |
| `guia-p3-pergunta` | Qual pão você vai pedir? | ⭐ | Pergunta da fase 2. |
| `guia-p3-curta` | Escolha o pão. |  | Nível 3. |
| `guia-p3-explica` | Antes de chegar sua vez, vamos decidir. São duas opções: pão francês ou pão de queijo. |  | Nível 1. |
| `guia-p4-normal-pao-frances` | Olhe para o atendente e diga: "Quero cinco pães franceses, por favor." | ⭐ | Instrução da fase 1. |
| `guia-p4-pergunta-pao-frances` | Chegou a sua vez. O que você vai dizer ao atendente? | ⭐ | Pergunta da fase 2 (vale para os dois pães). |
| `guia-p4-curta-pao-frances` | Peça os pães. |  | Nível 3. |
| `guia-p4-explica-pao-frances` | Chegou a sua vez. O atendente precisa saber o que você quer. Diga: "Quero cinco pães franceses, por favor." Se preferir, aperte o botão e eu falo por você. |  | Nível 1. |
| `guia-p4-normal-pao-de-queijo` | Olhe para o atendente e diga: "Quero cinco pães de queijo, por favor." | ⭐ | Instrução da fase 1. |
| `guia-p4-explica-pao-de-queijo` | Chegou a sua vez. O atendente precisa saber o que você quer. Diga: "Quero cinco pães de queijo, por favor." Se preferir, aperte o botão e eu falo por você. |  | Nível 1. |
| `guia-p5-normal` | Pegue o saco de pão que o atendente entregar. | ⭐ | Instrução da fase 1. |
| `guia-p5-pergunta` | O atendente está te entregando algo. O que você faz? | ⭐ | Pergunta da fase 2. |
| `guia-p5-curta` | Pegue o saco. |  | Nível 3. |
| `guia-p5-explica` | O atendente vai colocar os pães num saco e entregar para você. Segure com cuidado. |  | Nível 1. |
| `guia-p6-normal` | Vá ao caixa e mostre o celular para pagar. | ⭐ | Instrução da fase 1. |
| `guia-p6-pergunta` | Você já tem o pão. Onde a gente vai agora, e como paga? | ⭐ | Pergunta da fase 2. |
| `guia-p6-curta` | Pague no celular. |  | Nível 3. |
| `guia-p6-explica` | Para levar o pão, a gente paga no caixa. Vá até o caixa e mostre o celular para pagar. |  | Nível 1. |
| `guia-p7-normal` | Diga "obrigado" e saia pela porta. | ⭐ | Instrução da fase 1. |
| `guia-p7-pergunta` | A compra terminou. O que a gente diz para quem atendeu? | ⭐ | Pergunta da fase 2. |
| `guia-p7-curta` | Diga obrigado. |  | Nível 3. |
| `guia-p7-explica` | A compra terminou. Para ser gentil, diga "obrigado" para quem te atendeu e saia pela porta. |  | Nível 1. |
| `escolha-pao-frances` | Pão francês. |  | Repete a opção escolhida. |
| `escolha-pao-de-queijo` | Pão de queijo. |  | Repete a opção escolhida. |

### Guia · direções (ditas quando a câmera vê o objeto)

| Código | Fala | ⭐ |
|---|---|---|
| `posicao-backpack-a-sua-esquerda` | A mochila está à sua esquerda. |  |
| `posicao-backpack-a-sua-direita` | A mochila está à sua direita. |  |
| `posicao-backpack-bem-na-sua-frente` | A mochila está bem na sua frente. |  |
| `posicao-book-a-sua-esquerda` | O livro está à sua esquerda. |  |
| `posicao-book-a-sua-direita` | O livro está à sua direita. |  |
| `posicao-book-bem-na-sua-frente` | O livro está bem na sua frente. |  |
| `posicao-bottle-a-sua-esquerda` | A garrafa está à sua esquerda. |  |
| `posicao-bottle-a-sua-direita` | A garrafa está à sua direita. |  |
| `posicao-bottle-bem-na-sua-frente` | A garrafa está bem na sua frente. |  |
| `posicao-banana-a-sua-esquerda` | A banana está à sua esquerda. |  |
| `posicao-banana-a-sua-direita` | A banana está à sua direita. |  |
| `posicao-banana-bem-na-sua-frente` | A banana está bem na sua frente. |  |
| `posicao-apple-a-sua-esquerda` | A maçã está à sua esquerda. |  |
| `posicao-apple-a-sua-direita` | A maçã está à sua direita. |  |
| `posicao-apple-bem-na-sua-frente` | A maçã está bem na sua frente. |  |
| `posicao-person-a-sua-esquerda` | A pessoa está à sua esquerda. |  |
| `posicao-person-a-sua-direita` | A pessoa está à sua direita. |  |
| `posicao-person-bem-na-sua-frente` | A pessoa está bem na sua frente. |  |
| `posicao-cell-phone-a-sua-esquerda` | O celular está à sua esquerda. |  |
| `posicao-cell-phone-a-sua-direita` | O celular está à sua direita. |  |
| `posicao-cell-phone-bem-na-sua-frente` | O celular está bem na sua frente. |  |
| `calma-lembrete` | Se ficar difícil, aperte calma. |  |

### Elogios e incentivo

| Código | Fala | ⭐ | Orientação |
|---|---|---|---|
| `escolha-boa` | Boa escolha! | ⭐ |  |
| `elogio-1` | Muito bem, Lucas! Você fez sozinho. Coisa de especialista em dinossauros! | ⭐ | Alegre, mas sem gritar. |
| `elogio-2` | Isso, Lucas! Sem ajuda. Até quem ama dinossauros ficaria impressionado. | ⭐ | Alegre, mas sem gritar. |
| `elogio-3` | Perfeito! Você lembrou sozinho. Ganhou uma estrela! | ⭐ | Alegre, mas sem gritar. |
| `elogio-proximo` | Isso! Próximo passo. | ⭐ |  |
| `elogio-curto` | Isso. | ⭐ |  |
| `fim-concluida` | Muito bem, Lucas! Tarefa concluída. | ⭐ |  |
| `fim-tentou` | Você tentou, e isso conta. Amanhã a gente tenta de novo. | ⭐ | Acolhedor. |
| `fim-evoluiu-2` | Uau! O Lumi evoluiu e ganhou um cachecol! |  |  |
| `fim-evoluiu-3` | Uau! O Lumi evoluiu e ganhou fones de ouvido! |  |  |
| `fim-evoluiu-4` | Uau! O Lumi evoluiu e ganhou um capacete de explorador! |  |  |
| `fim-evoluiu-5` | Uau! O Lumi evoluiu e ganhou o visual do seu tema favorito! |  |  |
| `fim-evoluiu-6` | Uau! O Lumi evoluiu e ganhou uma capa de herói! |  |  |

### Calma e segurança

| Código | Fala | ⭐ | Orientação |
|---|---|---|---|
| `calma-respirar` | Tudo bem. Vamos respirar juntos. Puxa o ar devagar... e solta. | ⭐ | Bem devagar, voz baixa. |
| `calma-respirar-2` | Vamos respirar juntos. Puxa o ar devagar... e solta. | ⭐ | Bem devagar, voz baixa. |
| `calma-hiperfoco` | Tudo bem. Sabia que alguns dinossauros eram calmos e lentos? Vamos respirar devagar, como eles. |  |  |
| `sos-pedi` | Pedi ajuda. Avisei Ana e Carlos. Fique onde está. Você está seguro comigo. | ⭐ | Firme e tranquilizador. |
| `sos-caminho-ana` | Ana está a caminho. Fique onde está. Você está seguro. | ⭐ |  |
| `banner-caminho-ana` | Ana está a caminho. |  |  |
| `sos-caminho-carlos` | Carlos está a caminho. Fique onde está. Você está seguro. | ⭐ |  |
| `banner-caminho-carlos` | Carlos está a caminho. |  |  |
| `barulho` | Está barulhento aqui. Quer colocar o abafador ou respirar comigo um pouco? | ⭐ |  |

### Remédios

| Código | Fala | ⭐ |
|---|---|---|
| `remedio-med1` | Lucas, hora do remédio. Escove os dentes. Pegue um copo de água. Tome 1 comprimido. Hora de deitar. | ⭐ |
| `remedio-med2` | Lucas, hora do remédio. Tome o café da manhã. Pegue um copo de água. Tome 1 comprimido. | ⭐ |
| `remedio-lembra` | Lembra do remédio? Estou aqui com você. | ⭐ |
| `remedio-tomou` | Muito bem! Você cuidou de você. | ⭐ |
| `remedio-ajuda` | Avisei a mamãe que você precisa de ajuda com o remédio. |  |

### História social

| Código | Fala |
|---|---|
| `hist-mochila-0` | Hoje eu vou arrumar a mochila para a escola. |
| `hist-mochila-0c` | Hoje: arrumar a mochila. |
| `hist-mochila-1` | Primeiro, eu pego a minha mochila. |
| `hist-mochila-2` | Depois, eu coloco o livro da aula. |
| `hist-mochila-3` | Então, eu coloco a garrafa de água. |
| `hist-mochila-4` | Em seguida, eu escolho o meu lanche. |
| `hist-mochila-5` | Agora, eu guardo o lanche. |
| `hist-mochila-6` | Por fim, eu fecho o zíper e pronto. |
| `hist-padaria-0` | Hoje eu vou comprar pão na padaria. |
| `hist-padaria-0c` | Hoje: comprar pão na padaria. |
| `hist-padaria-1` | Primeiro, eu entro e procuro a fila do balcão. |
| `hist-padaria-2` | Depois, eu espero a minha vez com calma. |
| `hist-padaria-3` | Então, eu escolho o pão. |
| `hist-padaria-4` | Em seguida, eu peço os pães ao atendente. |
| `hist-padaria-5` | Agora, eu pego o saco de pão. |
| `hist-padaria-6` | Depois, eu vou ao caixa e pago com o celular. |
| `hist-padaria-7` | Por fim, eu digo "obrigado" e volto para casa. |
| `hist-calma` | Se ficar difícil, tudo bem. Posso apertar "calma" e respirar com o Lumi. |
| `hist-estrelas` | Quando terminar, eu e o Lumi ganhamos estrelas! |
| `hist-calma-c` | Difícil? Botão de calma. |
| `hist-fim-c` | Pronto. Muito bem! |

### Avisos e conversas

| Código | Fala | ⭐ | Orientação |
|---|---|---|---|
| `aviso-1` | Ana mandou um aviso: Hoje a aula começa mais tarde, às 8h. |  |  |
| `aviso-2` | Ana mandou um aviso: Vou buscar você 10 minutos depois do normal. |  |  |
| `aviso-3` | Ana mandou um aviso: Hoje quem vai te buscar é o papai. |  |  |
| `aviso-4` | Ana mandou um aviso: A padaria está fechada hoje. Vamos amanhã. |  |  |
| `humor-1` | Que bom! Vamos ter um ótimo dia. | ⭐ |  |
| `humor-2` | Tudo bem. Estou aqui com você. | ⭐ |  |
| `humor-3` | Obrigado por me contar. Quer respirar comigo? | ⭐ |  |
| `humor-4` | Entendi. Vamos com calma hoje. | ⭐ |  |
| `fase-mochila-2` | Ana aprovou: em "Arrumar a mochila" agora você está na fase 2. Vou ajudar um pouco menos, porque você está aprendendo! |  |  |
| `fase-mochila-3` | Ana aprovou: em "Arrumar a mochila" agora você está na fase 3. Vou ajudar um pouco menos, porque você está aprendendo! |  |  |
| `fase-padaria-2` | Ana aprovou: em "Comprar pão na padaria" agora você está na fase 2. Vou ajudar um pouco menos, porque você está aprendendo! |  |  |
| `fase-padaria-3` | Ana aprovou: em "Comprar pão na padaria" agora você está na fase 3. Vou ajudar um pouco menos, porque você está aprendendo! |  |  |
| `pedido-confirmado` | A mamãe confirmou o seu pedido! Já está na sua agenda. |  |  |
| `combinado` | Combinado! |  |  |
| `voz-teste` | Oi, Lucas! Eu sou o Lumi. Vamos juntos, um passo de cada vez. | ⭐ | Apresentação do Lumi: simpática e calma. |
| `voz-nova` | Oi, Lucas! Esta é a minha nova voz. |  |  |
| `voz-ok` | Assim está bom? |  |  |
| `voz-familia` | Oi! Esta é a voz do Lumi. |  |  |
| `combinado-c1` | Muito bem! Agora é hora de: 20 minutos de tablet. |  |  |
| `combinado-c2` | Muito bem! Agora é hora de: Ver o documentário de dinossauros. |  |  |

### Comunicação (CAA)

| Código | Fala | ⭐ | Orientação |
|---|---|---|---|
| `caa-frase-1` | Pode me ajudar, por favor? | ⭐ | Fala do Lucas para outras pessoas: clara, natural. |
| `caa-frase-2` | Pode repetir mais devagar? | ⭐ | Idem. |
| `caa-frase-3` | Preciso de um tempo. | ⭐ | Idem. |
| `caa-frase-4` | Está muito barulhento para mim. | ⭐ | Idem. |
| `caa-frase-5` | Onde fica o banheiro? | ⭐ | Idem. |
| `caa-frase-6` | Estou com sede. | ⭐ | Idem. |
| `caa-frase-7` | Obrigado! | ⭐ | Idem. |
| `caa-frase-8` | Oi, tudo bem? | ⭐ | Idem. |
| `caa-p4-pao-frances` | Quero cinco pães franceses, por favor. | ⭐ |  |
| `caa-p4-pao-de-queijo` | Quero cinco pães de queijo, por favor. | ⭐ |  |
| `caa-pedir-paes` | Quero cinco pães, por favor. |  |  |
| `cartao-ajuda` | Meu nome é Lucas. Sou autista. Por favor, fale devagar e com calma. | ⭐ |  |

### Figuras da CAA (uma palavra cada, tom neutro)

| Código | Fala | Código | Fala | Código | Fala |
|---|---|---|---|---|---|
| `figura-eu` | eu | `figura-mamae` | mamãe | `figura-papai` | papai |
| `figura-voce` | você | `figura-julia` | Dra. Júlia | `figura-amigo` | amigo |
| `figura-vovo` | vovó | `figura-quero` | quero | `figura-naoquero` | não quero |
| `figura-preciso` | preciso | `figura-estou` | estou | `figura-gosto` | gosto de |
| `figura-vamos` | vamos | `figura-brincar` | brincar | `figura-comer` | comer |
| `figura-dormir` | dormir | `figura-ir` | ir | `figura-agua` | água |
| `figura-lanche` | lanche | `figura-banheiro` | banheiro | `figura-parque` | parque |
| `figura-tablet` | tablet | `figura-dino` | dinossauro | `figura-livro` | livro |
| `figura-musica` | música | `figura-casa` | casa | `figura-escola` | escola |
| `figura-sorvete` | sorvete | `figura-piscina` | piscina | `figura-licao` | lição |
| `figura-banho` | banho | `figura-cinema` | cinema | `figura-jogo` | videogame |
| `figura-feliz` | feliz | `figura-triste` | triste | `figura-cansado` | cansado |
| `figura-nervoso` | nervoso | `figura-medo` | com medo | `figura-bravo` | bravo |
| `figura-dor` | com dor | `figura-barulho` | muito barulho | `figura-agora` | agora |
| `figura-depois` | depois | `figura-hoje` | hoje | `figura-amanha` | amanhã |
| `figura-sabado` | sábado | `figura-domingo` | domingo | `figura-chuva` | chuva |
| `figura-sim` | sim | `figura-nao` | não | `figura-naosei` | não sei |
| `figura-ajuda` | ajuda | `figura-tchau` | tchau | `figura-amor` | te amo |
| `figura-legal` | legal |  |  |  |  |

## O que continua com voz sintética

Algumas falas mudam a cada uso e não dá para gravar de antemão: mensagens que a família escreve, frases que o Lucas monta livremente com as figuras e respostas com horários ou números que mudam. Nesses casos o app usa a voz feminina mais natural do aparelho.
