// Lumi, o robô companheiro. SVG desenhado em código para mudar de humor e ganhar acessórios.
// humor: feliz | atento | falando | calmo | observando | comemorando | preocupado

const LUMI_NIVEIS = [
  { estrelas: 0, nome: 'Lumi filhote', acessorio: null, texto: 'Começou a jornada' },
  { estrelas: 60, nome: 'Lumi aprendiz', acessorio: 'cachecol', texto: 'Ganhou um cachecol' },
  { estrelas: 160, nome: 'Lumi parceiro', acessorio: 'fone', texto: 'Ganhou fones de ouvido' },
  { estrelas: 300, nome: 'Lumi explorador', acessorio: 'capacete', texto: 'Ganhou um capacete de explorador' },
  { estrelas: 490, nome: 'Lumi do hiperfoco', acessorio: 'hiperfoco', texto: 'Ganhou o visual do seu tema favorito' },
  { estrelas: 750, nome: 'Lumi mestre', acessorio: 'capa', texto: 'Ganhou uma capa de herói' },
];

function lumiNivel(estrelas) {
  let n = 0;
  LUMI_NIVEIS.forEach((l, i) => { if (estrelas >= l.estrelas) n = i; });
  const prox = LUMI_NIVEIS[n + 1];
  return {
    indice: n, ...LUMI_NIVEIS[n],
    acessorios: LUMI_NIVEIS.slice(1, n + 1).map((l) => l.acessorio),
    proximo: prox || null,
    progresso: prox ? (estrelas - LUMI_NIVEIS[n].estrelas) / (prox.estrelas - LUMI_NIVEIS[n].estrelas) : 1,
  };
}

function lumiSVG({ humor = 'feliz', acessorios = [], tamanho = 160, hiperfoco = '' } = {}) {
  const tem = (a) => acessorios.includes(a);
  const olhos = {
    feliz: '<path d="M70 78 q10 -12 20 0" /><path d="M110 78 q10 -12 20 0" />',
    comemorando: '<path d="M80 66 l3 8 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1z" class="olho-cheio"/><path d="M120 66 l3 8 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1z" class="olho-cheio"/>',
    calmo: '<path d="M70 78 q10 6 20 0" /><path d="M110 78 q10 6 20 0" />',
    observando: '<rect x="72" y="70" width="14" height="16" rx="7" class="olho-cheio"/><rect x="112" y="70" width="14" height="16" rx="7" class="olho-cheio"/>',
    preocupado: '<rect x="73" y="70" width="14" height="18" rx="7" class="olho-cheio"/><rect x="113" y="70" width="14" height="18" rx="7" class="olho-cheio"/><path d="M70 64 l18 4" /><path d="M130 64 l-18 4" />',
  }[humor] || '<rect x="73" y="68" width="14" height="20" rx="7" class="olho-cheio pisca"/><rect x="113" y="68" width="14" height="20" rx="7" class="olho-cheio pisca"/>';
  const boca = {
    feliz: '<path d="M88 96 q12 10 24 0" />',
    comemorando: '<path d="M86 94 q14 16 28 0 z" class="boca-cheia"/>',
    falando: '<ellipse cx="100" cy="98" rx="9" ry="5" class="boca-cheia fala"/>',
    calmo: '<path d="M92 98 q8 4 16 0" />',
    observando: '<path d="M94 98 h12" />',
    preocupado: '<path d="M90 100 q10 -6 20 0" />',
    atento: '<path d="M92 97 q8 5 16 0" />',
  }[humor] || '<path d="M92 97 q8 5 16 0" />';

  const espinhos = tem('hiperfoco') ? `<g class="acc-hiperfoco">${/dino/i.test(hiperfoco) || !hiperfoco
    ? '<path d="M62 34 l10 -16 10 14z M84 28 l12 -20 12 18z M110 30 l12 -16 10 16z" fill="#4ade80" stroke="#166534" stroke-width="2"/>'
    : '<path d="M78 30 l22 -22 22 22z" fill="#facc15" stroke="#854d0e" stroke-width="2"/>'}</g>` : '';
  const capacete = tem('capacete') ? '<g><path d="M48 50 q52 -46 104 0 z" fill="#d6a35c" stroke="#7c5a2a" stroke-width="2"/><rect x="40" y="46" width="120" height="9" rx="4" fill="#b98a47"/><circle cx="100" cy="36" r="6" fill="#fde68a" class="farol"/></g>' : '';
  const fone = tem('fone') ? '<g><path d="M38 76 q0 -58 62 -58 q62 0 62 58" fill="none" stroke="#334155" stroke-width="6"/><rect x="28" y="66" width="16" height="30" rx="8" fill="#22d3ee"/><rect x="156" y="66" width="16" height="30" rx="8" fill="#22d3ee"/></g>' : '';
  const cachecol = tem('cachecol') ? '<g><rect x="60" y="120" width="80" height="14" rx="7" fill="#f87171"/><rect x="118" y="126" width="14" height="30" rx="6" fill="#ef4444"/></g>' : '';
  const capa = tem('capa') ? '<path d="M66 128 q-20 40 -8 56 h84 q12 -16 -8 -56z" fill="#6366f1" opacity=".9"/>' : '';

  return `<svg class="lumi humor-${humor}" width="${tamanho}" height="${tamanho}" viewBox="0 0 200 200" role="img" aria-label="Lumi, o robô companheiro">
    <ellipse cx="100" cy="190" rx="44" ry="6" class="sombra"/>
    <g class="corpo-todo">
      ${capa}
      <line x1="100" y1="30" x2="100" y2="14" class="antena"/>
      <circle cx="100" cy="11" r="7" class="antena-luz"/>
      <rect x="22" y="58" width="16" height="34" rx="8" class="orelha"/>
      <rect x="162" y="58" width="16" height="34" rx="8" class="orelha"/>
      <rect x="36" y="28" width="128" height="96" rx="36" class="cabeca"/>
      <rect x="50" y="42" width="100" height="68" rx="26" class="rosto"/>
      <g class="olhos">${olhos}</g>
      <g class="boca">${boca}</g>
      <circle cx="66" cy="96" r="6" class="bochecha"/><circle cx="134" cy="96" r="6" class="bochecha"/>
      ${espinhos}${capacete}${fone}
      <rect x="62" y="124" width="76" height="54" rx="24" class="tronco"/>
      <circle cx="100" cy="150" r="10" class="coracao"/>
      <rect x="40" y="134" width="20" height="34" rx="10" class="braco braco-e"/>
      <rect x="140" y="134" width="20" height="34" rx="10" class="braco braco-d"/>
      ${cachecol}
    </g>
  </svg>`;
}
