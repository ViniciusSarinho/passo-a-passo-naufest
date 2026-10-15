/* ============================================================================
   DADOS · tudo o que é fixo ou fictício na demonstração
   Objetos que a câmera reconhece, rotinas, contas e permissões, perguntas da IA,
   regras de leitura do laudo e o gerador do histórico de 14 meses.
   Paciente (Lucas), família, profissionais, remédios e laudo são FICTÍCIOS.
   ============================================================================ */

// Classes do modelo COCO-SSD usadas nas rotinas, com o nome em português.
const OBJETOS = {
  'person': 'pessoa', 'cell phone': 'celular', 'bottle': 'garrafa', 'cup': 'copo', 'book': 'livro',
  'backpack': 'mochila', 'handbag': 'bolsa', 'umbrella': 'guarda-chuva', 'banana': 'banana', 'apple': 'maçã',
  'orange': 'laranja', 'sandwich': 'sanduíche', 'donut': 'rosquinha', 'cake': 'bolo', 'chair': 'cadeira',
  'dining table': 'mesa', 'laptop': 'notebook', 'keyboard': 'teclado', 'mouse': 'mouse', 'scissors': 'tesoura',
  'toothbrush': 'escova de dentes', 'clock': 'relógio', 'remote': 'controle remoto', 'teddy bear': 'ursinho',
};

// Cada passo tem o texto em três níveis de literalidade, a pergunta (fase 2), a frase da história social,
// o objeto que a câmera confirma e, quando houver, uma escolha (tomada de decisão) ou uma frase pronta (CAA).
// "{escolha}" é trocado pela opção escolhida no passo de decisão anterior.
const ROTINAS_PADRAO = [
  {
    id: 'mochila', nome: 'Arrumar a mochila', emoji: '🎒', objetivo: 'arrumar a mochila para a escola', lugar: '', hora: '07:00',
    passos: [
      { id: 'm1', emoji: '🎒', objeto: 'backpack',
        curta: 'Pegue a mochila.', normal: 'Pegue a sua mochila e mostre para a câmera.',
        explica: 'Primeiro, vamos pegar a mochila. É nela que ficam as coisas da escola. Pegue e mostre para a câmera.',
        pergunta: 'Para arrumar as coisas da escola, o que você precisa pegar primeiro?', historia: 'pego a minha mochila' },
      { id: 'm2', emoji: '📘', objeto: 'book',
        curta: 'Coloque o livro.', normal: 'Pegue o livro da aula de hoje e coloque na mochila.',
        explica: 'Agora o livro. Hoje tem aula e você vai precisar dele. Mostre o livro para a câmera e coloque na mochila.',
        pergunta: 'Qual material de leitura vai para a escola hoje?', historia: 'coloco o livro da aula' },
      { id: 'm3', emoji: '💧', objeto: 'bottle',
        curta: 'Pegue a garrafa.', normal: 'Pegue a sua garrafa de água e coloque na mochila.',
        explica: 'Na escola dá sede. Pegue a garrafa de água, mostre para a câmera e coloque na mochila.',
        pergunta: 'E se der sede na escola, o que você leva?', historia: 'coloco a garrafa de água' },
      { id: 'm4', emoji: '🤔', tipo: 'escolha',
        curta: 'Escolha o lanche.', normal: 'Hora de escolher o lanche. Banana ou maçã?',
        explica: 'Você pode escolher o lanche de hoje. São só duas opções: banana ou maçã. Qualquer uma está certa.',
        pergunta: 'Qual lanche você quer levar hoje?', historia: 'escolho o meu lanche',
        opcoes: [{ emoji: '🍌', texto: 'Banana', frase: 'banana', objeto: 'banana' }, { emoji: '🍎', texto: 'Maçã', frase: 'maçã', objeto: 'apple' }] },
      { id: 'm5', emoji: '🥪', objeto: '$escolha',
        curta: 'Guarde a {escolha}.', normal: 'Mostre a {escolha} para a câmera e coloque na mochila.',
        explica: 'Você escolheu {escolha}. Agora mostre para a câmera e guarde na mochila, junto com o resto.',
        pergunta: 'Você escolheu o lanche. Onde ele vai agora?', historia: 'guardo o lanche' },
      { id: 'm6', emoji: '✅', objeto: null,
        curta: 'Feche a mochila.', normal: 'Feche o zíper da mochila.',
        explica: 'Tudo está dentro. Agora feche o zíper para nada cair. Quando terminar, aperte "Fiz".',
        pergunta: 'Tudo está dentro. O que falta fazer com a mochila?', historia: 'fecho o zíper e pronto' },
    ],
  },
  {
    id: 'padaria', nome: 'Comprar pão na padaria', emoji: '🥖', objetivo: 'comprar pão', lugar: 'na padaria', hora: '17:30',
    passos: [
      { id: 'p1', emoji: '👀', objeto: 'person',
        curta: 'Procure a fila.', normal: 'Procure a fila do balcão de pão.',
        explica: 'Na padaria, as pessoas esperam numa fila perto do balcão. Procure onde as pessoas estão em fila.',
        pergunta: 'Onde as pessoas esperam para pedir o pão?', historia: 'entro e procuro a fila do balcão' },
      { id: 'p2', emoji: '⏳', objeto: null,
        curta: 'Espere sua vez.', normal: 'Fique no fim da fila e espere a sua vez.',
        explica: 'Cada pessoa é atendida de uma vez. Fique atrás da última pessoa e espere. Está tudo bem demorar.',
        pergunta: 'Tem gente na sua frente. O que a gente faz agora?', historia: 'espero a minha vez com calma' },
      { id: 'p3', emoji: '🤔', tipo: 'escolha',
        curta: 'Escolha o pão.', normal: 'Qual pão você quer hoje: francês ou de queijo?',
        explica: 'Antes de chegar sua vez, vamos decidir. São duas opções: pão francês ou pão de queijo.',
        pergunta: 'Qual pão você vai pedir?', historia: 'escolho o pão',
        opcoes: [{ emoji: '🥖', texto: 'Pão francês', frase: 'pães franceses' }, { emoji: '🧀', texto: 'Pão de queijo', frase: 'pães de queijo' }] },
      { id: 'p4', emoji: '🗣️', objeto: null, fala: 'Quero cinco {escolha}, por favor.',
        curta: 'Peça os pães.', normal: 'Olhe para o atendente e diga: "Quero cinco {escolha}, por favor."',
        explica: 'Chegou a sua vez. O atendente precisa saber o que você quer. Diga: "Quero cinco {escolha}, por favor." Se preferir, aperte o botão e eu falo por você.',
        pergunta: 'Chegou a sua vez. O que você vai dizer ao atendente?', historia: 'peço os pães ao atendente' },
      { id: 'p5', emoji: '🛍️', objeto: null,
        curta: 'Pegue o saco.', normal: 'Pegue o saco de pão que o atendente entregar.',
        explica: 'O atendente vai colocar os pães num saco e entregar para você. Segure com cuidado.',
        pergunta: 'O atendente está te entregando algo. O que você faz?', historia: 'pego o saco de pão' },
      { id: 'p6', emoji: '📱', objeto: 'cell phone',
        curta: 'Pague no celular.', normal: 'Vá ao caixa e mostre o celular para pagar.',
        explica: 'Para levar o pão, a gente paga no caixa. Vá até o caixa e mostre o celular para pagar.',
        pergunta: 'Você já tem o pão. Onde a gente vai agora, e como paga?', historia: 'vou ao caixa e pago com o celular' },
      { id: 'p7', emoji: '🙏', objeto: null, fala: 'Obrigado!',
        curta: 'Diga obrigado.', normal: 'Diga "obrigado" e saia pela porta.',
        explica: 'A compra terminou. Para ser gentil, diga "obrigado" para quem te atendeu e saia pela porta.',
        pergunta: 'A compra terminou. O que a gente diz para quem atendeu?', historia: 'digo "obrigado" e volto para casa' },
    ],
  },
];

// Comunicação alternativa (CAA): frases que o app fala pela pessoa.
const FRASES_CAA = [
  { emoji: '🙋', texto: 'Pode me ajudar, por favor?' },
  { emoji: '🔁', texto: 'Pode repetir mais devagar?' },
  { emoji: '⏸️', texto: 'Preciso de um tempo.' },
  { emoji: '🔇', texto: 'Está muito barulhento para mim.' },
  { emoji: '🚻', texto: 'Onde fica o banheiro?' },
  { emoji: '💧', texto: 'Estou com sede.' },
  { emoji: '🙏', texto: 'Obrigado!' },
  { emoji: '👋', texto: 'Oi, tudo bem?' },
];

const AVISOS_RAPIDOS = [
  'Hoje a aula começa mais tarde, às 8h.',
  'Vou buscar você 10 minutos depois do normal.',
  'Hoje quem vai te buscar é o papai.',
  'A padaria está fechada hoje. Vamos amanhã.',
];

// Contas conectadas: quem acompanha o paciente e o que cada um pode fazer.
const PERMISSOES = [
  { id: 'emergencia', nome: 'Recebe emergências' },
  { id: 'aovivo', nome: 'Vê a rotina ao vivo' },
  { id: 'relatorio', nome: 'Vê relatórios' },
  { id: 'rotinas', nome: 'Edita rotinas' },
  { id: 'fases', nome: 'Aprova mudança de fase' },
  { id: 'local', nome: 'Vê localização (só na emergência)' },
  { id: 'laudos', nome: 'Envia laudos e relatórios clínicos' },
  { id: 'remedios', nome: 'Acompanha remédios e diário' },
  { id: 'medicacao', nome: 'Prescreve e ajusta medicação' },
];

const CONTAS_PADRAO = [
  { id: 'lucas', nome: 'Lucas', papel: 'paciente', rotulo: 'Paciente · 11 anos', avatar: '🧒', status: 'conectado', permissoes: [] },
  { id: 'ana', nome: 'Ana', papel: 'responsavel', rotulo: 'Mãe · responsável principal', avatar: '👩', status: 'conectado',
    permissoes: ['emergencia', 'aovivo', 'relatorio', 'rotinas', 'fases', 'local', 'remedios'] },
  { id: 'carlos', nome: 'Carlos', papel: 'responsavel', rotulo: 'Pai · responsável', avatar: '👨', status: 'conectado',
    permissoes: ['emergencia', 'aovivo', 'relatorio', 'local', 'remedios'] },
  { id: 'julia', nome: 'Dra. Júlia', papel: 'terapeuta', rotulo: 'Terapeuta ocupacional', avatar: '🧑‍⚕️', status: 'conectado',
    permissoes: ['relatorio', 'rotinas', 'fases', 'laudos', 'remedios'] },
  { id: 'rafael', nome: 'Dr. Rafael', papel: 'terapeuta', rotulo: 'Neuropsicólogo', avatar: '🧠', status: 'conectado',
    permissoes: ['relatorio', 'laudos'] },
  { id: 'helena', nome: 'Dra. Helena', papel: 'medico', rotulo: 'Neuropediatra', avatar: '👩‍⚕️', status: 'conectado',
    permissoes: ['relatorio', 'medicacao', 'remedios'] },
];

const PERFIL_PADRAO = {
  nome: 'Lucas', idade: 11, nivel: 2, hiperfoco: 'dinossauros', velocidade: 0.9,
  voz: true, ouvir: true, camera: true, ruido: true, espera: 8,
  fase: { mochila: 2, padaria: 1 },
};

// A história de demonstração tem 14 meses e termina hoje, em qualquer data em que o app for aberto.
const MESES_DE_HISTORIA = 14;
function inicioDaHistoria() { const d = new Date(); d.setHours(8, 0, 0, 0); d.setMonth(d.getMonth() - MESES_DE_HISTORIA); return d.getTime(); }
// Marcos da vida real que explicam recuos no gráfico. A mudança de escola acontece no 6º mês.
function marcosDaHistoria() {
  const ini = inicioDaHistoria(), dia = 864e5;
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const marcos = [{ data: iso(ini + 6.2 * 30.4 * dia), texto: 'Mudança de escola' }];
  for (let a = new Date(ini).getFullYear(); a <= new Date().getFullYear(); a++) {
    [[`${a}-12-15`, 'Férias escolares'], [`${a}-07-06`, 'Férias de julho']].forEach(([data, texto]) => {
      if (new Date(data + 'T12:00:00').getTime() > ini && new Date(data + 'T12:00:00').getTime() < Date.now()) marcos.push({ data, texto });
    });
  }
  return marcos.sort((x, y) => x.data.localeCompare(y.data));
}

// ---------- Histórico fictício de 14 meses (gerador determinístico) ----------
function gerarHistorico() {
  let semente = 42;
  const rand = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
  const dia = 864e5;
  const inicio = inicioDaHistoria();
  const hoje = new Date().setHours(8, 0, 0, 0);
  const meses = (t) => (t - inicio) / (30.4 * dia);
  const entre = (t, a, b) => t >= a && t < b;
  const ferias = (t) => { const d = new Date(t); const m = d.getMonth(), dd = d.getDate();
    return (m === 11 && dd >= 15) || m === 0 || (m === 6 && dd < 25); };

  // Linha do tempo realista: idas e vindas, platôs e recuos após mudanças.
  const plano = {
    mochila: (m) => m < 5.2 ? { fase: 1, taxa: 28 + m * 10 }
      : m < 6.2 ? { fase: 1, taxa: 55 }
      : m < 7.4 ? { fase: 1, taxa: 48 + (m - 6.2) * 15 }
      : { fase: 2, taxa: Math.min(88, 42 + (m - 7.4) * 7.5) },
    padaria: (m) => m < 3 ? null
      : m < 10.2 ? { fase: 1, taxa: 18 + (m - 3) * 7 }
      : { fase: 1, taxa: Math.min(74, 60 + (m - 10.2) * 3.5) },
  };
  const sessoes = [];
  for (let t = inicio; t <= hoje; t += dia) {
    const dow = new Date(t).getDay();
    const m = meses(t);
    ['mochila', 'padaria'].forEach((rid) => {
      const p = plano[rid](m);
      if (!p) return;
      const quer = rid === 'mochila' ? (dow === 1 || dow === 3 || dow === 5) : dow === 6;
      if (!quer || rand() < (ferias(t) ? 0.85 : 0.2)) return;
      let taxa = p.taxa + (rand() - 0.5) * 22;
      if (ferias(t)) taxa -= 12;
      if (entre(m, 6.2, 6.9)) taxa -= 10; // primeiras semanas na escola nova
      taxa = Math.max(5, Math.min(100, taxa));
      const r = ROTINAS_PADRAO.find((x) => x.id === rid);
      const ini = p.fase === 1 ? 2 : p.fase === 2 ? 1 : 0;
      sessoes.push({
        data: t + Math.round(rand() * 3) * 36e5, rotina: rid, fase: p.fase, demo: true,
        passos: r.passos.map((ps) => {
          const ok = rand() * 100 < taxa;
          return { id: ps.id, emoji: ps.emoji, titulo: ps.curta.replace('{escolha}', 'lanche'),
            nivel: ok ? ini : Math.min(2, ini + 1), tempo: ok ? 5 + Math.round(rand() * 12) : 18 + Math.round(rand() * 20),
            metodo: ps.objeto ? 'câmera' : ps.tipo === 'escolha' ? 'escolha' : 'toque', ajuda: !ok && rand() < 0.2 };
        }),
      });
    });
  }
  return sessoes;
}

function dadosDemonstracao() {
  const d = {
    perfil: JSON.parse(JSON.stringify(PERFIL_PADRAO)),
    rotinas: JSON.parse(JSON.stringify(ROTINAS_PADRAO)),
    contas: JSON.parse(JSON.stringify(CONTAS_PADRAO)),
    sessoes: gerarHistorico(),
    pet: { estrelas: 486 },
    eventos: [
      { id: 1, tipo: 'humor', de: 'lucas', data: Date.now() - 3 * 36e5, dados: { emoji: '😊', texto: 'Estou bem' } },
      { id: 2, tipo: 'conclusao', de: 'lucas', data: Date.now() - 26 * 36e5, dados: { rotina: 'Arrumar a mochila', taxa: 83 } },
    ],
    alerta: null,
    aoVivo: null,
  };
  // Cada módulo acrescenta o seu pedaço do estado (conhecimento, caa, saude)
  if (typeof MODULOS !== 'undefined') MODULOS.forEach((m) => { if (m.dados) d[m.nome] = m.dados(); m.ajustar?.(d); });
  return d;
}

// ---------- Conhecimento: o que a IA pergunta e como lê relatórios clínicos ----------
// Perguntas de anamnese que a IA faz à família. Cada resposta vira um aprendizado e, às vezes, um ajuste.
const PERGUNTAS_IA = [
  { id: 'som', texto: 'Como o Lucas reage a sons altos, como liquidificador, festa ou sirene?',
    porque: 'O sensor de ruído precisa saber quando oferecer uma pausa. Diferenças sensoriais são muito comuns no autismo.',
    opcoes: [
      { t: 'Fica muito incomodado ou tampa os ouvidos', ef: { ruidoLimite: 50 }, ap: 'É muito sensível a sons: o Lumi oferece pausa mais cedo em lugares barulhentos.' },
      { t: 'Incomoda um pouco', ef: { ruidoLimite: 65 }, ap: 'Sons altos incomodam um pouco: o alerta de ruído fica no nível médio.' },
      { t: 'Não costuma se incomodar', ef: { ruidoLimite: 82 }, ap: 'Sons altos não costumam incomodar: o alerta de ruído só aparece em barulho intenso.' }] },
  { id: 'mudanca', texto: 'Quando a rotina muda de última hora, o que costuma acontecer?',
    porque: 'Isso decide se o Lumi deve contar a história da tarefa antes de cada saída e avisar mudanças com antecedência.',
    opcoes: [
      { t: 'Entra em crise', ef: { historiaAntes: true, anteciparMudancas: true }, ap: 'Mudanças inesperadas geram crise: a história social aparece antes de toda tarefa, e mudanças são avisadas antes.' },
      { t: 'Fica ansioso, mas se adapta', ef: { anteciparMudancas: true }, ap: 'Mudanças geram ansiedade: o Lumi avisa mudanças com antecedência.' },
      { t: 'Lida bem com mudanças', ef: {}, ap: 'Lida bem com mudanças de rotina.' }] },
  { id: 'instrucao', texto: 'Ele entende melhor instruções de que jeito?',
    porque: 'A IA escolhe entre falar mais, mostrar mais imagens ou dar o exemplo antes.',
    opcoes: [
      { t: 'Faladas', ef: {}, ap: 'Entende bem instruções faladas.' },
      { t: 'Com imagens e pictogramas', ef: { pictogramas: true }, ap: 'Aprende melhor com imagens: os pictogramas do guia ficam maiores.' },
      { t: 'Vendo alguém fazer primeiro', ef: { historiaAntes: true }, ap: 'Aprende vendo antes: a história social é mostrada antes de começar.' }] },
  { id: 'tempo', texto: 'Depois de um pedido, quanto tempo ele costuma levar para começar a responder?',
    porque: 'Ajudar cedo demais tira a chance de ele fazer sozinho; tarde demais gera frustração.',
    opcoes: [
      { t: 'Responde logo', ef: { espera: 6 }, ap: 'Responde rápido: o Lumi espera 6 s antes de aumentar a ajuda.' },
      { t: 'Uns 10 segundos', ef: { espera: 10 }, ap: 'Leva uns 10 s para responder: o Lumi espera 10 s antes de ajudar mais.' },
      { t: 'Precisa de bastante tempo', ef: { espera: 15 }, ap: 'Precisa de mais tempo: o Lumi espera 15 s antes de ajudar mais.' }] },
  { id: 'calma', texto: 'O que mais ajuda o Lucas a se acalmar?',
    porque: 'A tela de calma e o SOS devem seguir o que já funciona com ele.',
    opcoes: [
      { t: 'Respirar junto com alguém', ef: {}, ap: 'Respirar junto ajuda a acalmar: o Lumi guia a respiração.' },
      { t: 'Silêncio, sem falar com ele', ef: { calmaSilenciosa: true }, ap: 'Prefere silêncio para se acalmar: na pausa, o Lumi não fala.' },
      { t: 'Falar do tema favorito', ef: { calmaHiperfoco: true }, ap: 'Falar do hiperfoco acalma: o Lumi puxa assunto sobre o tema favorito na pausa.' }] },
];

// Resposta simulada da terapeuta quando a família encaminha uma pergunta.
const RESPOSTAS_PROF = {
  dados: 'Na terapia estamos treinando pedir em voz alta. Mantenha esse passo com mais apoio e use o "Falar por mim" como ponte, retirando aos poucos.',
  som: 'No consultório ele tampa os ouvidos com secador e campainha. Eu deixaria o alerta de ruído mais sensível.',
  mudanca: 'Ele se desorganiza com mudanças. Antecipar com imagens funciona bem com ele.',
  instrucao: 'Ele tem ótima memória visual. Apoios visuais rendem mais do que explicações longas.',
  tempo: 'Ele precisa de uns 10 a 15 segundos para organizar a resposta. Vale esperar mais.',
  calma: 'Com ele, silêncio e respiração funcionam melhor do que conversa durante a crise.',
};

// Laudo fictício, usado quando o neuropsicólogo "responde" ao pedido na demonstração.
const LAUDO_EXEMPLO = 'RELATÓRIO DE AVALIAÇÃO NEUROPSICOLÓGICA — EXEMPLO FICTÍCIO PARA DEMONSTRAÇÃO\n' +
  'Paciente: Lucas, 11 anos. Responsável: Ana. Profissional: Dr. Rafael (neuropsicólogo).\n' +
  'Foram observadas dificuldades em funções executivas, principalmente planejamento e organização de sequências de ações.\n' +
  'Flexibilidade cognitiva reduzida, com desconforto importante diante de mudanças inesperadas na rotina.\n' +
  'Há relato de hipersensibilidade auditiva a sons intensos.\n' +
  'Memória visual preservada, acima da média para a idade, o que indica bom aproveitamento de apoios visuais e pictogramas.\n' +
  'Linguagem expressiva com dificuldade para iniciar a fala espontânea com pessoas desconhecidas.\n' +
  'Velocidade de processamento abaixo da média esperada.\n' +
  'Sinais de ansiedade em situações sociais novas.\n' +
  'Recomenda-se: apoios visuais, antecipação de mudanças, tempo adicional para resposta e treino gradual de comunicação em contextos reais.';

// Regras de leitura do laudo no MVP. No produto, um modelo de linguagem faz a leitura e um profissional revisa.
const REGRAS_LAUDO = [
  { padrao: /fun[çc][õo]es executivas|planejamento|organiza[çc][ãa]o de sequ/i, area: 'Funções executivas', tipo: 'apoio',
    impacto: 'Planejar a sequência de uma tarefa é difícil.', ajuste: { historiaAntes: true }, acao: 'Mostrar a história social antes de cada tarefa' },
  { padrao: /flexibilidade cognitiva|rigidez|mudan[çc]as inesperadas/i, area: 'Flexibilidade cognitiva', tipo: 'apoio',
    impacto: 'Mudanças inesperadas desorganizam.', ajuste: { anteciparMudancas: true }, acao: 'Avisar mudanças com antecedência pelo Lumi' },
  { padrao: /hipersensibilidade auditiva|sons? intensos|ru[ií]do/i, area: 'Processamento sensorial auditivo', tipo: 'apoio',
    impacto: 'Barulho pode levar à sobrecarga.', ajuste: { ruidoLimite: 50 }, acao: 'Deixar o alerta de ruído mais sensível' },
  { padrao: /mem[óo]ria visual (preservada|acima)|apoios visuais/i, area: 'Memória visual', tipo: 'forte',
    impacto: 'Ponto forte: aprende bem com imagens.', ajuste: { pictogramas: true }, acao: 'Usar pictogramas maiores no guia' },
  { padrao: /linguagem expressiva|fala espont[âa]nea/i, area: 'Linguagem expressiva', tipo: 'apoio',
    impacto: 'Começar a falar com desconhecidos é difícil.', ajuste: { caaCedo: true }, acao: 'Mostrar "Falar por mim" em destaque nos passos de fala' },
  { padrao: /velocidade de processamento/i, area: 'Velocidade de processamento', tipo: 'apoio',
    impacto: 'Precisa de mais tempo para responder.', ajuste: { espera: 15 }, acao: 'Esperar 15 s antes de aumentar a ajuda' },
  { padrao: /ansiedade/i, area: 'Ansiedade', tipo: 'apoio',
    impacto: 'Situações sociais novas geram ansiedade.', ajuste: { calmaCedo: true }, acao: 'Lembrar do botão de calma quando ele travar' },
  { padrao: /aten[çc][ãa]o (sustentada|seletiva)|TDAH|desaten/i, area: 'Atenção', tipo: 'apoio',
    impacto: 'A atenção se dispersa com facilidade.', ajuste: { lembreteFoco: true }, acao: 'Chamar pelo nome antes de cada instrução' },
];

function conhecimentoPadrao() {
  return {
    respostas: {}, encaminhadas: {}, laudo: null, pedidoLaudo: null, aplicados: [],
    aprendizados: [
      { texto: 'Hiperfoco: dinossauros. Usado nos elogios e no visual do Lumi.', fonte: 'família', data: Date.now() - 400 * 864e5 },
      { texto: 'Arrumar a mochila: a autonomia subiu de cerca de 50% para mais de 80% em 14 meses, com recuo na mudança de escola.', fonte: 'dados', data: Date.now() - 864e5 },
    ],
  };
}
