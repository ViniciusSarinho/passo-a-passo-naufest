# Ética, segurança e privacidade

Um app que acompanha pessoas autistas, muitas vezes crianças, trabalha com dados de saúde, câmera e localização. Por isso, estas decisões foram tomadas **antes** de acrescentar funções. Este documento diz o que o protótipo já faz, o que é só intenção para o produto e o que ainda precisa de especialista.

## Princípios

1. **Autonomia, não "correção".** O objetivo é dar previsibilidade e independência, no ritmo de cada pessoa. O projeto não tenta "normalizar" ninguém. O vocabulário é de **apoio**; pessoas autistas, famílias e profissionais devem co-criar rotinas e textos.
2. **Humano no controle.** A IA sugere; uma pessoa decide. Mudança de fase, ajustes vindos do laudo e qualquer coisa que altere a experiência da pessoa precisam de aprovação da família ou do terapeuta. **Dose e horário de remédios só a médica altera.** A IA não dá diagnóstico.
3. **Privacidade por padrão.** Imagem e áudio são analisados no aparelho; nada é gravado nem enviado. Câmera e microfone só ligam durante uma rotina.
4. **Cada conta vê só o necessário.** O paciente não vê laudo, doses nem o diário de crises; cada profissional tem permissões diferentes. Quando o paciente é adulto, ele decide quem o acompanha.
5. **Honestidade sobre o que é simulado.** O site e a documentação dizem o que funciona e o que é fictício. Números têm fonte e limite (`FONTES.md`).
6. **Sem situações de risco no MVP.** O app não guia a travessia de rua nem outras tarefas em que um erro da IA possa causar dano grave.

## Riscos e como são tratados

| Risco | O que o protótipo faz | O que o produto precisa |
|---|---|---|
| **Dados de saúde são sensíveis** (LGPD, art. 5º, II e art. 11) [14] | Dados ficam no aparelho; contas fictícias; sem coleta | Base legal e **consentimento** claros, minimização, criptografia, exportar e apagar tudo, encarregado de dados, **parecer jurídico** |
| **Crianças e adolescentes** | A família configura; a criança vê só o necessário | Consentimento dos responsáveis; atenção ao ECA; mais privacidade à medida que cresce |
| **Câmera e microfone** | Só ligam em rotina; análise no aparelho; luz/aviso na tela | Indicador físico (LED, tampa) nos vestíveis e no robô; sem gravação |
| **Localização no SOS** | Pede permissão do navegador só ao acionar; durante o roteiro usa endereço fictício | Compartilhamento só durante a emergência, com registro de quem viu |
| **SOS por engano ou falso alarme** | Precisa **segurar 1,5 s**; é possível encerrar ("estou bem") | Medir falsos alarmes no piloto; ajustar o tempo e a confirmação |
| **IA erra** (objeto não reconhecido, frase estranha) | Sempre há "Fiz" e voz como alternativa; o erro custa pouco nas rotinas escolhidas | Revisão profissional dos textos; testes com pessoas autistas; limites claros da IA |
| **Dependência do aparelho** | Desenho para a ajuda **diminuir**; a fase 3 é o objetivo | Medir autonomia por passo ao longo de meses |
| **Sobrecarga sensorial** | Volume, velocidade e voz ajustáveis; "tela calma"; **tela escura (padrão) ou clara**, em cinza-esverdeado sem preto nem branco puros; sem sons bruscos; pausa em barulho | Opções de vibração; modo "silêncio total"; revisão com terapeutas ocupacionais |
| **Aviso de remédio e instruções de saúde** | Lembrete e registro; a IA **recusa** mudar dose ou dar diagnóstico | Fluxo com a médica; alertas de interação só com fonte clínica validada |
| **Viés de idioma, sotaque e cultura** | Português do Brasil; voz humana gravável | Mais vozes e sotaques; Libras; revisão cultural |
| **Acesso desigual** | Funciona em celular comum, sem hardware extra | Funcionar sem internet; custo baixo; parcerias com SUS e escolas |
| **Uso clínico sem validação** | Não há promessa terapêutica; estudos citados são pequenos e dizem isso | Estudo clínico controlado antes de qualquer alegação |

## Observação regulatória

Funções que apoiem decisões de saúde (por exemplo, sugerir mudar o plano ou organizar dados de remédios) podem ser enquadradas como **software com finalidade médica** e exigir avaliação regulatória (por exemplo, da ANVISA). Isso precisa de **análise de especialista** antes de qualquer piloto com pacientes. O protótipo é uma demonstração com dados fictícios e não deve ser usado como tratamento.

## O que esperar de um piloto responsável

- Aprovação de um comitê de ética em pesquisa, quando houver pesquisa com pessoas.
- Termo de consentimento e de assentimento (para crianças), em linguagem simples.
- Acompanhamento de um profissional de saúde.
- Canal para a pessoa autista, a família e os terapeutas **desligarem, corrigirem e apagarem** tudo, a qualquer momento.
- Relatório público do que funcionou e do que não funcionou.
