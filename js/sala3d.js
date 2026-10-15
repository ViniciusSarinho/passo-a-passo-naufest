// Sala 3D da página inicial (three.js). Uma sala de estar cheia de brinquedos: a Ana no sofá com o celular,
// o Carlos olhando o relógio e o Lucas brincando no tapete com o Lumi. Cada capítulo da página leva a câmera
// para uma parte da sala. Sem WebGL ou sem internet, a página continua legível com uma ilustração simples.

const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
// ?fixo: câmera sem transição (usado para tirar capturas de tela de cada capítulo)
const fixo = calmo || new URLSearchParams(location.search).has('fixo');

// Capítulos: marca o ativo (o painel aparece) e diz para onde a câmera vai
const capitulos = [...document.querySelectorAll('.capitulo')];
let capituloAtivo = 'abertura';
const aoMudarCapitulo = [];
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  capitulos.forEach((c) => c.classList.toggle('ativo', c === e.target));
  capituloAtivo = e.target.dataset.camera;
  aoMudarCapitulo.forEach((f) => f(capituloAtivo));
}), { rootMargin: '-45% 0px -45% 0px' });
capitulos.forEach((c) => io.observe(c));
capitulos[0].classList.add('ativo');

try {
  const THREE = await import('three');
  const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
  const { CSS2DRenderer, CSS2DObject } = await import('three/addons/renderers/CSS2DRenderer.js');
  montar(THREE, RoundedBoxGeometry, CSS2DRenderer, CSS2DObject);
} catch (erro) {
  console.warn('Sala 3D indisponível:', erro);
  document.body.classList.add('sem-3d');
  document.getElementById('carregando').textContent = '🤖';
}

function montar(THREE, RoundedBoxGeometry, CSS2DRenderer, CSS2DObject) {
  const caixa = document.getElementById('cena3d');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  caixa.appendChild(renderer.domElement);
  const rotulos = new CSS2DRenderer();
  rotulos.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  caixa.appendChild(rotulos.domElement);

  const cena = new THREE.Scene();
  cena.fog = new THREE.Fog(0xfdf0de, 14, 26);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);

  // Luz suave de fim de tarde, sem contrastes fortes
  cena.add(new THREE.HemisphereLight(0xfff6ea, 0xd9c2a5, 1.6));
  const sol = new THREE.DirectionalLight(0xfff0dc, 1.7);
  sol.position.set(3.5, 7, 4.5);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  Object.assign(sol.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 20 });
  sol.shadow.radius = 4;
  sol.shadow.bias = -0.0008;
  cena.add(sol);

  // ---------- Ajudantes ----------
  const materiais = {};
  const mat = (cor, extra = {}) => {
    const chave = cor + JSON.stringify(extra);
    return materiais[chave] ||= new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: 0, ...extra });
  };
  const sombra = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  function bloco(l, a, p, cor, r = 0.06, onde = [0, 0, 0], pai = cena) {
    const m = sombra(new THREE.Mesh(new RoundedBoxGeometry(l, a, p, 3, Math.min(r, l / 2, a / 2, p / 2)), mat(cor)));
    m.position.set(...onde); pai.add(m); return m;
  }
  function bola(r, cor, onde, pai = cena, seg = 24) {
    const m = sombra(new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg / 1.5), mat(cor)));
    m.position.set(...onde); pai.add(m); return m;
  }
  function cilindro(r1, r2, a, cor, onde, pai = cena, seg = 28) {
    const m = sombra(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, a, seg), mat(cor)));
    m.position.set(...onde); pai.add(m); return m;
  }
  function capsula(r, comp, cor, pai) {
    const m = sombra(new THREE.Mesh(new THREE.CapsuleGeometry(r, comp, 6, 14), mat(cor)));
    m.position.y = -(comp / 2 + r * 0.6); pai.add(m); return m;
  }
  function rotulo(texto, onde, pai) {
    const d = document.createElement('div');
    d.className = 'rotulo3d'; d.textContent = texto;
    const o = new CSS2DObject(d); o.position.set(...onde); pai.add(o); return d;
  }
  // Tela que brilha (celular, relógio, rosto do Lumi), desenhada num canvas
  function telaCanvas(l, a, desenhar) {
    const c = document.createElement('canvas'); c.width = l; c.height = a;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const redesenhar = (...x) => { desenhar(c.getContext('2d'), l, a, ...x); tex.needsUpdate = true; };
    redesenhar();
    return { tex, redesenhar };
  }
  const arred = (g, x, y, l, a, r) => { g.beginPath(); g.roundRect(x, y, l, a, r); };

  // ---------- A sala ----------
  bloco(9, 0.2, 7, 0xe8c79c, 0.04, [0, -0.1, 0]).receiveShadow = true;           // piso de madeira
  for (let i = -4; i <= 4; i++) bloco(0.015, 0.005, 7, 0xd9b483, 0, [i, 0.002, 0]); // frestas das tábuas
  bloco(9, 3.4, 0.2, 0xfde3cf, 0.02, [0, 1.7, -3.5]);                              // parede do fundo (pêssego)
  bloco(0.2, 3.4, 7, 0xdcefe5, 0.02, [-4.5, 1.7, 0]);                              // parede da esquerda (menta)
  bloco(9, 0.16, 0.06, 0xffffff, 0.02, [0, 0.08, -3.38]);                           // rodapés
  bloco(0.06, 0.16, 7, 0xffffff, 0.02, [-4.38, 0.08, 0]);
  // Janela com céu
  bloco(1.9, 1.5, 0.08, 0xffffff, 0.04, [2.1, 1.85, -3.38]);
  const ceu = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.3), new THREE.MeshBasicMaterial({ color: 0xbfe1ff }));
  ceu.position.set(2.1, 1.85, -3.33); cena.add(ceu);
  bloco(0.05, 1.3, 0.04, 0xffffff, 0.01, [2.1, 1.85, -3.3]); bloco(1.7, 0.05, 0.04, 0xffffff, 0.01, [2.1, 1.85, -3.3]);
  [[1.55, 2.2], [2.5, 1.55]].forEach(([x, y]) => { bola(0.12, 0xffffff, [x, y, -3.31]).scale.z = 0.2; bola(0.09, 0xffffff, [x + 0.14, y + 0.02, -3.31]).scale.z = 0.2; });
  // Quadros de desenhos da criança
  [[-2.6, 2.3, 0xffe38a], [-1.6, 2.45, 0xc9b8ff], [-0.7, 2.25, 0xa9d2ff]].forEach(([x, y, c], i) => {
    bloco(0.62, 0.5, 0.04, 0xffffff, 0.03, [x, y, -3.38]);
    bloco(0.5, 0.38, 0.02, c, 0.02, [x, y, -3.35]);
    if (i === 1) bola(0.09, 0xff8fa3, [x, y, -3.33]).scale.z = 0.3;
  });
  // Tapete redondo listrado
  cilindro(1.85, 1.85, 0.03, 0xbfdcff, [0.4, 0.015, 0.9], cena, 64).receiveShadow = true;
  cilindro(1.45, 1.45, 0.034, 0xfff2c4, [0.4, 0.017, 0.9], cena, 64).receiveShadow = true;
  cilindro(1.05, 1.05, 0.038, 0xffd3c4, [0.4, 0.019, 0.9], cena, 64).receiveShadow = true;

  // Sofá lilás
  const sofa = new THREE.Group(); sofa.position.set(-2.3, 0, -2.5); cena.add(sofa);
  bloco(2.8, 0.42, 1.0, 0xa9b4f2, 0.12, [0, 0.31, 0], sofa);
  bloco(2.8, 0.8, 0.28, 0x98a4ea, 0.12, [0, 0.72, -0.38], sofa);
  bloco(0.3, 0.62, 1.0, 0x98a4ea, 0.12, [-1.4, 0.45, 0], sofa); bloco(0.3, 0.62, 1.0, 0x98a4ea, 0.12, [1.4, 0.45, 0], sofa);
  bloco(1.2, 0.16, 0.8, 0xb8c1f6, 0.08, [-0.62, 0.58, 0.04], sofa); bloco(1.2, 0.16, 0.8, 0xb8c1f6, 0.08, [0.62, 0.58, 0.04], sofa);
  bloco(0.45, 0.42, 0.14, 0xffe38a, 0.1, [-0.9, 0.86, -0.18], sofa).rotation.z = 0.2;
  [-1.25, 1.25].forEach((x) => [-0.4, 0.4].forEach((z) => cilindro(0.05, 0.04, 0.1, 0x8a6a4a, [x, 0.05, z], sofa)));

  // Estante na parede da esquerda, com livros e brinquedos
  const estante = new THREE.Group(); estante.position.set(-4.1, 0, 0.3); cena.add(estante);
  [0.02, 0.62, 1.22].forEach((y) => bloco(0.55, 0.06, 2.2, 0xffffff, 0.02, [0, y + 0.03, 0], estante));
  bloco(0.55, 1.3, 0.06, 0xffffff, 0.02, [0, 0.65, -1.1], estante); bloco(0.55, 1.3, 0.06, 0xffffff, 0.02, [0, 0.65, 1.1], estante);
  const coresLivro = [0xff8fa3, 0x7fc8a9, 0xffd166, 0x8ab4ff, 0xc9b8ff, 0xffb59a];
  for (let i = 0; i < 9; i++) bloco(0.34, 0.36 + (i % 3) * 0.05, 0.08, coresLivro[i % 6], 0.02, [0.02, 0.86 + (i % 3) * 0.025, -0.9 + i * 0.11], estante);
  [[0.25, 0x7fc8a9], [0.65, 0xff8fa3]].forEach(([z, c]) => bloco(0.3, 0.3, 0.3, c, 0.05, [0, 1.42, z], estante));
  bola(0.16, 0xffd166, [0, 1.42, -0.5], estante);
  for (let i = 0; i < 4; i++) bloco(0.2, 0.2, 0.2, coresLivro[(i + 2) % 6], 0.04, [0, 0.16, -0.6 + i * 0.32], estante);
  // Baú de brinquedos aberto
  const bau = new THREE.Group(); bau.position.set(-3.3, 0, 2.2); bau.rotation.y = 0.5; cena.add(bau);
  bloco(0.9, 0.5, 0.6, 0xffb59a, 0.06, [0, 0.25, 0], bau);
  bloco(0.9, 0.06, 0.6, 0xff9f80, 0.04, [0, 0.62, -0.38], bau).rotation.x = -1.2;
  bola(0.14, 0x8ab4ff, [-0.2, 0.55, 0.05], bau); bloco(0.2, 0.2, 0.2, 0xffd166, 0.04, [0.15, 0.55, 0], bau).rotation.y = 0.6;
  // Planta e luminária
  cilindro(0.22, 0.17, 0.4, 0xffffff, [3.9, 0.2, -3.0]);
  [[0, 0.62, 0, 0.3], [0.16, 0.85, 0.05, 0.22], [-0.15, 0.8, -0.05, 0.2]].forEach(([x, y, z, r]) => bola(r, 0x7fc8a9, [3.9 + x, y, -3.0 + z]));
  cilindro(0.2, 0.25, 0.04, 0xd8d0e8, [-3.8, 0.02, -2.9]); cilindro(0.025, 0.025, 1.6, 0xd8d0e8, [-3.8, 0.82, -2.9]);
  cilindro(0.18, 0.3, 0.32, 0xfff4c7, [-3.8, 1.72, -2.9]);
  const luzAbajur = new THREE.PointLight(0xffe2b0, 3, 4); luzAbajur.position.set(-3.8, 1.6, -2.9); cena.add(luzAbajur);

  // Brinquedos no tapete
  const cores = [0xff8fa3, 0xffd166, 0x7fc8a9, 0x8ab4ff, 0xc9b8ff];
  [[0, 0, 0], [0.24, 0, 0.04], [0.12, 0.22, 0.02], [0.12, 0.44, 0]].forEach(([x, y, z], i) =>
    bloco(0.22, 0.22, 0.22, cores[i], 0.04, [-0.75 + x, 0.13 + y, 1.75 + z]).rotation.y = i * 0.3);
  // Torre de argolas
  cilindro(0.17, 0.2, 0.05, 0xffffff, [1.7, 0.045, 1.95]); cilindro(0.025, 0.025, 0.5, 0xffffff, [1.7, 0.3, 1.95]);
  [0.17, 0.145, 0.12, 0.095].forEach((r, i) => {
    const t = sombra(new THREE.Mesh(new THREE.TorusGeometry(r, 0.045, 12, 28), mat(cores[i])));
    t.rotation.x = Math.PI / 2; t.position.set(1.7, 0.1 + i * 0.09, 1.95); cena.add(t);
  });
  const bolaRosa = bola(0.22, 0xff8fa3, [2.6, 0.22, 0.4]);
  // Trenzinho
  const trem = new THREE.Group(); trem.position.set(-1.6, 0, 0.3); trem.rotation.y = 0.9; cena.add(trem);
  bloco(0.42, 0.26, 0.26, 0x8ab4ff, 0.05, [0, 0.21, 0], trem); bloco(0.2, 0.22, 0.24, 0xffd166, 0.04, [-0.1, 0.43, 0], trem);
  cilindro(0.05, 0.06, 0.16, 0xff8fa3, [0.13, 0.42, 0], trem);
  bloco(0.36, 0.2, 0.24, 0x7fc8a9, 0.05, [-0.5, 0.18, 0], trem);
  [[0.13, 0.13], [-0.13, 0.13], [0.13, -0.13], [-0.13, -0.13], [-0.4, 0.13], [-0.6, 0.13], [-0.4, -0.13], [-0.6, -0.13]].forEach(([x, z]) => {
    const r = cilindro(0.07, 0.07, 0.04, 0x2e2a47, [x, 0.08, z], trem, 16); r.rotation.x = Math.PI / 2;
  });
  // Ursinho
  const urso = new THREE.Group(); urso.position.set(-0.3, 0, -0.6); urso.rotation.y = 0.4; cena.add(urso);
  bola(0.2, 0xd9a273, [0, 0.2, 0], urso); bola(0.15, 0xd9a273, [0, 0.5, 0], urso);
  bola(0.055, 0xd9a273, [-0.11, 0.62, 0], urso); bola(0.055, 0xd9a273, [0.11, 0.62, 0], urso);
  bola(0.06, 0xf3d2b2, [0, 0.47, 0.13], urso);
  [[-0.17, 0.27], [0.17, 0.27]].forEach(([x, y]) => bola(0.07, 0xd9a273, [x, y, 0.08], urso));
  [[-0.1, 0.05], [0.1, 0.05]].forEach(([x, y]) => bola(0.08, 0xd9a273, [x, y, 0.15], urso));
  bloco(0.18, 0.05, 0.05, 0xff8fa3, 0.02, [0, 0.38, 0.1], urso);

  // ---------- Pessoas (bonecos estilizados) ----------
  // Cada membro é um grupo com articulação, para montar as poses (sentado, segurando o celular, olhando o relógio).
  function pessoa({ pele, roupa, calca, cabelo, escala = 1, cabeloLongo = false }) {
    const g = new THREE.Group(); g.scale.setScalar(escala);
    const quadril = new THREE.Group(); quadril.position.y = 0.86; g.add(quadril);
    const tronco = new THREE.Group(); quadril.add(tronco);
    const corpo = sombra(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.36, 6, 16), mat(roupa)));
    corpo.position.y = 0.32; corpo.scale.set(1, 1, 0.78); tronco.add(corpo);
    const pescoco = new THREE.Group(); pescoco.position.y = 0.66; tronco.add(pescoco);
    bola(0.17, pele, [0, 0.14, 0], pescoco);
    const topo = sombra(new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(cabelo)));
    topo.position.set(0, 0.17, -0.02); topo.rotation.x = -0.5; pescoco.add(topo);
    if (cabeloLongo) bloco(0.34, 0.3, 0.12, cabelo, 0.06, [0, 0.04, -0.12], pescoco);
    [-0.06, 0.06].forEach((x) => bola(0.024, 0x2e2a47, [x, 0.13, 0.152], pescoco, 10));
    const boca = bola(0.03, 0xc0566b, [0, 0.07, 0.158], pescoco, 10); boca.scale.set(1.3, 0.5, 0.5);
    const membro = (x, y, pai, r, c1, c2, cor1, cor2) => {
      const a = new THREE.Group(); a.position.set(x, y, 0); pai.add(a);
      capsula(r, c1, cor1, a);
      const b = new THREE.Group(); b.position.y = -(c1 + r * 1.2); a.add(b);
      capsula(r * 0.92, c2, cor2, b);
      const ponta = new THREE.Group(); ponta.position.y = -(c2 + r * 1.3); b.add(ponta);
      return { a, b, ponta };
    };
    const bE = membro(-0.27, 0.55, tronco, 0.065, 0.22, 0.2, roupa, pele);
    const bD = membro(0.27, 0.55, tronco, 0.065, 0.22, 0.2, roupa, pele);
    bola(0.06, pele, [0, 0, 0], bE.ponta); bola(0.06, pele, [0, 0, 0], bD.ponta);
    const pE = membro(-0.11, 0, quadril, 0.085, 0.3, 0.3, calca, calca);
    const pD = membro(0.11, 0, quadril, 0.085, 0.3, 0.3, calca, calca);
    [pE, pD].forEach((p) => bloco(0.13, 0.08, 0.22, 0xffffff, 0.04, [0, 0, 0.05], p.ponta));
    return { g, quadril, tronco, pescoco, bE, bD, pE, pD };
  }
  const sentar = (p, alturaQuadril) => {
    p.quadril.position.y = alturaQuadril;
    [p.pE, p.pD].forEach((x) => { x.a.rotation.x = -Math.PI / 2; x.b.rotation.x = Math.PI / 2; });
  };

  // Ana, sentada no sofá, segurando o celular com as duas mãos
  const ana = pessoa({ pele: 0xe0a77f, roupa: 0xff9f80, calca: 0x5a6fb8, cabelo: 0x4a2f25, cabeloLongo: true });
  ana.g.position.set(-1.75, 0, -2.38); ana.g.rotation.y = 0.35; cena.add(ana.g);
  sentar(ana, 0.62);
  ana.tronco.rotation.x = -0.12; ana.pescoco.rotation.x = 0.42;
  [ana.bE, ana.bD].forEach((b, i) => { b.a.rotation.x = -0.25; b.a.rotation.z = i ? 0.12 : -0.12; b.b.rotation.x = -1.15; b.b.rotation.z = i ? -0.55 : 0.55; });
  // O celular fica na frente do peito, com a tela virada para o rosto (e um pouco para quem olha a cena)
  const celular = new THREE.Group(); ana.g.add(celular);
  celular.position.set(0, 0.98, 0.36); celular.rotation.set(-1.2, 0, 0);
  bloco(0.16, 0.3, 0.025, 0x2e2a47, 0.03, [0, 0, 0], celular);
  const telaCel = telaCanvas(160, 300, (g, l, a, passo = 3) => {
    g.fillStyle = '#fffaf2'; g.fillRect(0, 0, l, a);
    g.fillStyle = '#4a6cf0'; arred(g, 12, 18, l - 24, 34, 12); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 15px sans-serif'; g.fillText('Lucas · ao vivo', 22, 41);
    g.fillStyle = '#e9f7f1'; arred(g, 12, 64, l - 24, 92, 14); g.fill();
    g.fillStyle = '#1d4f52'; g.font = 'bold 14px sans-serif'; g.fillText('Mochila', 24, 88);
    g.fillStyle = '#5b6b64'; g.font = '13px sans-serif'; g.fillText(`Passo ${passo} de 6`, 24, 108);
    g.fillStyle = '#d8d0e8'; arred(g, 24, 124, l - 48, 10, 5); g.fill();
    g.fillStyle = '#5fc3a3'; arred(g, 24, 124, (l - 48) * passo / 6, 10, 5); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = i < passo ? '#ffd166' : '#ece6f5'; g.beginPath(); g.arc(28 + i * 21, 186, 8, 0, 7); g.fill(); }
    g.fillStyle = '#fff4d6'; arred(g, 12, 214, l - 24, 66, 14); g.fill();
    g.fillStyle = '#1d4f52'; g.font = 'bold 13px sans-serif'; g.fillText('💬 "Já vou!"', 24, 252);
  });
  const telaAna = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.27), new THREE.MeshBasicMaterial({ map: telaCel.tex }));
  telaAna.position.z = 0.014; celular.add(telaAna);

  // Carlos, em pé perto da janela, olhando o relógio no pulso
  const carlos = pessoa({ pele: 0xc98c66, roupa: 0x7fc8a9, calca: 0x3f4a6b, cabelo: 0x2e2a47 });
  carlos.g.position.set(2.75, 0, -1.6); carlos.g.rotation.y = 0.15; cena.add(carlos.g);
  carlos.pescoco.rotation.x = 0.35; carlos.pescoco.rotation.y = 0.35;
  carlos.bE.a.rotation.set(-0.9, 0, -0.35); carlos.bE.b.rotation.set(-1.5, 0, 0.9);
  carlos.bD.a.rotation.z = 0.08;
  const relogio = new THREE.Group(); carlos.bE.b.add(relogio);
  relogio.position.set(0, -0.16, 0.07); relogio.rotation.set(-Math.PI / 2, 0, 0);
  bloco(0.09, 0.1, 0.03, 0x2e2a47, 0.025, [0, 0, 0], relogio);
  const telaRel = telaCanvas(120, 130, (g, l, a, modo = 'passo') => {
    g.fillStyle = '#1f1b33'; g.fillRect(0, 0, l, a);
    if (modo === 'sos') { g.fillStyle = '#ff6b6b'; g.beginPath(); g.arc(l / 2, a / 2, 46, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 28px sans-serif'; g.textAlign = 'center'; g.fillText('SOS', l / 2, a / 2 + 10); return; }
    g.strokeStyle = '#3a3555'; g.lineWidth = 10; g.beginPath(); g.arc(l / 2, a / 2, 44, 0, 7); g.stroke();
    g.strokeStyle = '#9edfc8'; g.beginPath(); g.arc(l / 2, a / 2, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.66); g.stroke();
    g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.fillText('4/6', l / 2, a / 2 + 9);
  });
  const telaRelogio = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.082), new THREE.MeshBasicMaterial({ map: telaRel.tex }));
  telaRelogio.position.z = 0.017; relogio.add(telaRelogio);

  // Lucas, sentado no tapete, de frente para o Lumi
  const lucas = pessoa({ pele: 0xe8b48d, roupa: 0xffd166, calca: 0x8ab4ff, cabelo: 0x6b4a2f, escala: 0.62 });
  lucas.g.position.set(-0.2, 0, 0.75); lucas.g.rotation.y = 1.15; cena.add(lucas.g);
  sentar(lucas, 0.16); lucas.pE.b.rotation.x = 0; lucas.pD.b.rotation.x = 0;
  lucas.pE.a.rotation.z = 0.25; lucas.pD.a.rotation.z = -0.25;
  lucas.bD.a.rotation.set(-1.1, 0, 0.1); lucas.bD.b.rotation.x = -0.3;
  lucas.bE.a.rotation.set(-0.3, 0, -0.2); lucas.bE.b.rotation.x = -0.6;
  lucas.pescoco.rotation.x = 0.2;

  // Lumi: robozinho de cabeça clara, rosto-tela escuro, olhos verde-água e cachecol vermelho
  const lumi = new THREE.Group(); lumi.position.set(0.75, 0, 1.05); lumi.rotation.y = -0.55; cena.add(lumi);
  const lumiCorpo = new THREE.Group(); lumi.add(lumiCorpo);
  bloco(0.42, 0.34, 0.32, 0xdfe8fb, 0.14, [0, 0.27, 0], lumiCorpo);
  bloco(0.62, 0.48, 0.48, 0xeef3ff, 0.2, [0, 0.72, 0], lumiCorpo);
  const rostoLumi = telaCanvas(256, 180, (g, l, a, olhosFechados = false) => {
    g.fillStyle = '#16233f'; arred(g, 0, 0, l, a, 60); g.fill();
    g.fillStyle = '#5eead4'; g.strokeStyle = '#5eead4'; g.lineWidth = 12; g.lineCap = 'round';
    if (olhosFechados) { [80, 176].forEach((x) => { g.beginPath(); g.moveTo(x - 18, 78); g.lineTo(x + 18, 78); g.stroke(); }); }
    else { [80, 176].forEach((x) => { arred(g, x - 15, 52, 30, 46, 15); g.fill(); }); }
    g.beginPath(); g.arc(128, 112, 26, 0.2, Math.PI - 0.2); g.stroke();
    g.fillStyle = 'rgba(251,113,133,.45)'; [52, 204].forEach((x) => { g.beginPath(); g.arc(x, 122, 14, 0, 7); g.fill(); });
  });
  const rosto = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.34), new THREE.MeshBasicMaterial({ map: rostoLumi.tex, transparent: true }));
  rosto.position.set(0, 0.72, 0.245); lumiCorpo.add(rosto);
  [-0.34, 0.34].forEach((x) => bloco(0.08, 0.2, 0.16, 0x7dd3fc, 0.04, [x, 0.72, 0], lumiCorpo));
  cilindro(0.015, 0.015, 0.16, 0x9db4dd, [0, 1.04, 0], lumiCorpo, 10);
  const antena = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.2 }));
  antena.position.y = 1.13; lumiCorpo.add(antena);
  const coracao = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1 }));
  coracao.position.set(0, 0.29, 0.165); coracao.scale.z = 0.4; lumiCorpo.add(coracao);
  bloco(0.46, 0.08, 0.36, 0xf87171, 0.04, [0, 0.46, 0], lumiCorpo);
  bloco(0.08, 0.2, 0.04, 0xef4444, 0.03, [0.13, 0.37, 0.18], lumiCorpo);
  const bracos = [-0.27, 0.27].map((x) => { const b = bloco(0.08, 0.2, 0.1, 0xc3d5f5, 0.04, [x, 0.27, 0], lumiCorpo); return b; });
  const brilho = new THREE.PointLight(0x9de8ff, 1.2, 1.6); brilho.position.set(0, 0.8, 0.5); lumi.add(brilho);
  // Estrelinhas de conquista em volta do Lumi
  const estrelas = [];
  const formaEstrela = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.035 : 0.08, ang = i / 10 * Math.PI * 2 - Math.PI / 2; formaEstrela[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * r, Math.sin(ang) * r); }
  const geoEstrela = new THREE.ExtrudeGeometry(formaEstrela, { depth: 0.02, bevelEnabled: false });
  for (let i = 0; i < 5; i++) {
    const e = new THREE.Mesh(geoEstrela, new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffc23d, emissiveIntensity: 0.5 }));
    lumi.add(e); estrelas.push(e);
  }

  // Rótulos que aparecem por capítulo
  const rotulosPor = {
    ana: rotulo('📱 Ana · celular', [0, 1.6, 0], ana.g),
    carlos: rotulo('⌚ Carlos · relógio', [0, 1.95, 0], carlos.g),
    lucas: rotulo('🧒 Lucas', [0, 1.35, 0], lucas.g),
    lumi: rotulo('🤖 Lumi', [0, 1.35, 0], lumi),
  };
  const mostrarRotulos = { abertura: ['ana', 'carlos', 'lucas', 'lumi'], sala: ['ana', 'carlos', 'lucas', 'lumi'], lumi: ['lumi', 'lucas'], ana: ['ana'], carlos: ['carlos'], ia: ['lumi'], calmo: ['lumi', 'lucas'], fecho: [] };

  // ---------- Câmera por capítulo ----------
  const POSES = {
    abertura: { pos: [6.6, 4.6, 7.4], alvo: [-0.3, 0.7, -0.4] },
    sala:     { pos: [-5.2, 4.4, 7.2], alvo: [0.2, 0.7, -0.6] },
    lumi:     { pos: [2.0, 1.5, 3.9], alvo: [0.25, 0.5, 0.85] },
    ana:      { pos: [-0.9, 2.1, -0.3], alvo: [-1.85, 1.0, -2.35] },
    carlos:   { pos: [3.7, 1.8, 0.5], alvo: [2.6, 1.35, -1.6] },
    ia:       { pos: [0.6, 8.2, 4.6], alvo: [0.2, 0, -0.2] },
    calmo:    { pos: [-1.4, 2.6, 4.8], alvo: [0.4, 0.5, 0.8] },
    fecho:    { pos: [7.6, 5.2, 8.4], alvo: [-0.4, 0.6, -0.6] },
  };
  const camPos = new THREE.Vector3(...POSES.abertura.pos), camAlvo = new THREE.Vector3(...POSES.abertura.alvo);
  const destinoPos = camPos.clone(), destinoAlvo = camAlvo.clone();
  let deslocamento = 0; // fração da largura para empurrar a cena para a direita (o texto fica à esquerda)
  function irPara(nome) {
    const p = POSES[nome] || POSES.abertura;
    destinoAlvo.set(...p.alvo);
    // Em telas estreitas, recua a câmera para caber a cena
    const recuo = camera.aspect < 1 ? 1.45 : camera.aspect < 1.4 ? 1.15 : 1;
    destinoPos.set(...p.pos).sub(destinoAlvo).multiplyScalar(recuo).add(destinoAlvo);
    if (fixo) { camPos.copy(destinoPos); camAlvo.copy(destinoAlvo); }
    const ver = mostrarRotulos[nome] || [];
    Object.entries(rotulosPor).forEach(([k, d]) => d.classList.toggle('apagado', !ver.includes(k)));
    telaRel.redesenhar(nome === 'carlos' ? 'sos' : 'passo');
  }
  aoMudarCapitulo.push(irPara);

  function ajustar() {
    const l = caixa.clientWidth, a = caixa.clientHeight;
    renderer.setSize(l, a, false); rotulos.setSize(l, a);
    deslocamento = l > 860 ? 0.36 : 0;
    camera.aspect = l * (1 + deslocamento) / a; // com o quadro deslocado, a proporção é a do quadro inteiro
    // Quadro mais largo, mostrando só a parte esquerda: o centro da cena vai para a direita do texto
    if (deslocamento) camera.setViewOffset(l * (1 + deslocamento), a, 0, 0, l, a); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    irPara(capituloAtivo);
  }
  addEventListener('resize', ajustar);
  ajustar();

  // Leve movimento com o mouse, para a sala parecer viva
  const mouse = { x: 0, y: 0 };
  if (!calmo) addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

  // ---------- Animação ----------
  const relogioAnim = new THREE.Clock();
  let piscarEm = 2, passoCel = 3, trocaCel = 0;
  function quadro() {
    const t = relogioAnim.getElapsedTime();
    const k = fixo ? 1 : 0.045;
    camPos.lerp(destinoPos, k); camAlvo.lerp(destinoAlvo, k);
    camera.position.copy(camPos);
    if (!calmo) camera.position.add(new THREE.Vector3(mouse.x * 0.35, -mouse.y * 0.2, 0));
    camera.lookAt(camAlvo);
    if (!calmo) {
      lumiCorpo.position.y = Math.sin(t * 1.6) * 0.04;
      lumiCorpo.rotation.z = Math.sin(t * 0.8) * 0.04;
      bracos[0].rotation.z = Math.sin(t * 2) * 0.25; bracos[1].rotation.z = -Math.sin(t * 2 + 1) * 0.25;
      antena.material.emissiveIntensity = 0.8 + Math.sin(t * 2.6) * 0.5;
      lucas.bD.a.rotation.x = -1.1 + Math.sin(t * 1.2) * 0.12;
      lucas.pescoco.rotation.z = Math.sin(t * 0.7) * 0.08;
      ana.pescoco.rotation.y = Math.sin(t * 0.4) * 0.06;
      bolaRosa.rotation.z = t * 0.2;
      const mostrarEstrelas = capituloAtivo === 'calmo' || capituloAtivo === 'lumi';
      estrelas.forEach((e, i) => {
        const ang = t * 0.7 + i * (Math.PI * 2 / estrelas.length);
        e.visible = mostrarEstrelas;
        e.position.set(Math.cos(ang) * 0.55, 1.15 + Math.sin(t * 1.4 + i) * 0.08, Math.sin(ang) * 0.55);
        e.rotation.y = t * 1.5 + i;
      });
      if (t > piscarEm) { rostoLumi.redesenhar(true); setTimeout(() => rostoLumi.redesenhar(false), 140); piscarEm = t + 2.5 + Math.random() * 3; }
      if (t > trocaCel) { passoCel = passoCel % 6 + 1; telaCel.redesenhar(passoCel); trocaCel = t + 2.2; }
    } else estrelas.forEach((e, i) => { e.position.set(Math.cos(i * 1.25) * 0.55, 1.15, Math.sin(i * 1.25) * 0.55); });
    renderer.render(cena, camera);
    rotulos.render(cena, camera);
  }
  renderer.setAnimationLoop(quadro);
  if (fixo) window.salaIr = (nome) => { capituloAtivo = nome; irPara(nome); quadro(); };
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : quadro));
  document.getElementById('carregando').remove();
}
