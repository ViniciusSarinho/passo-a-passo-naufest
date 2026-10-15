// Vitrine 3D da página "Saiba mais" (three.js): os equipamentos do ecossistema Lumi em pedestais, do celular ao
// robô de mesa. A câmera percorre a vitrine conforme o capítulo (js/saibamais.js avisa pelo evento "capitulo").
// Arraste para girar o equipamento em foco. Sem WebGL ou sem internet, a página continua legível.

const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fixo = calmo || new URLSearchParams(location.search).has('fixo'); // ?fixo: câmera sem transição (capturas de tela)

try {
  const THREE = await import('three');
  const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
  const { CSS2DRenderer, CSS2DObject } = await import('three/addons/renderers/CSS2DRenderer.js');
  montar(THREE, RoundedBoxGeometry, CSS2DRenderer, CSS2DObject);
} catch (erro) {
  console.warn('Vitrine 3D indisponível:', erro);
  document.body.classList.add('sem-3d');
  document.getElementById('carregando').textContent = '🤖';
}

function montar(THREE, RoundedBoxGeometry, CSS2DRenderer, CSS2DObject) {
  const caixa = document.getElementById('cena3d');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.touchAction = 'pan-y';
  caixa.appendChild(renderer.domElement);
  const rotulos = new CSS2DRenderer();
  rotulos.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  caixa.appendChild(rotulos.domElement);

  const cena = new THREE.Scene();
  cena.fog = new THREE.Fog(0xfdf0de, 24, 46);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  cena.add(new THREE.HemisphereLight(0xfff6ea, 0xd9c2a5, 1.7));
  const sol = new THREE.DirectionalLight(0xfff0dc, 1.8);
  sol.position.set(4, 9, 8);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 8, bottom: -6, near: 1, far: 30 });
  sol.shadow.radius = 4; sol.shadow.bias = -0.0008;
  cena.add(sol);

  // ---------- Ajudantes ----------
  const materiais = {};
  const mat = (cor, extra = {}) => materiais[cor + JSON.stringify(extra)] ||= new THREE.MeshStandardMaterial({ color: cor, roughness: 0.8, metalness: 0, ...extra });
  const sombra = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const add = (m, onde, pai) => { m.position.set(...onde); pai.add(m); return m; };
  const bloco = (l, a, p, cor, r = 0.06, onde = [0, 0, 0], pai = cena) => add(sombra(new THREE.Mesh(new RoundedBoxGeometry(l, a, p, 3, Math.min(r, l / 2, a / 2, p / 2)), mat(cor))), onde, pai);
  const bola = (r, cor, onde, pai = cena) => add(sombra(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat(cor))), onde, pai);
  const cil = (r1, r2, a, cor, onde, pai = cena, seg = 40) => add(sombra(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, a, seg), mat(cor))), onde, pai);
  const toro = (r, tubo, cor, onde, pai, arco = Math.PI * 2, extra) => add(sombra(new THREE.Mesh(new THREE.TorusGeometry(r, tubo, 12, 64, arco), mat(cor, extra))), onde, pai);
  const brilha = (cor, forca = 1.2) => new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: forca, roughness: 0.4 });
  const arred = (g, x, y, l, a, r) => { g.beginPath(); g.roundRect(x, y, l, a, r); };
  function telaCanvas(l, a, desenhar) {
    const c = document.createElement('canvas'); c.width = l; c.height = a;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const redesenhar = (...x) => { desenhar(c.getContext('2d'), l, a, ...x); tex.needsUpdate = true; };
    redesenhar();
    return { tex, redesenhar };
  }
  const planoTela = (tex, l, a, onde, pai) => add(new THREE.Mesh(new THREE.PlaneGeometry(l, a), new THREE.MeshBasicMaterial({ map: tex })), onde, pai);
  function rotulo(nome, fase, classe, onde, pai) {
    const d = document.createElement('div');
    d.className = 'rotulo3d'; d.innerHTML = `${nome} <span class="fase ${classe}">${fase}</span>`;
    add(new CSS2DObject(d), onde, pai); return d;
  }

  // ---------- Palco ----------
  bloco(46, 0.3, 14, 0xf0d9bd, 0.05, [0, -0.15, 0]).receiveShadow = true;
  bloco(46, 9, 0.3, 0xfde3cf, 0.05, [0, 4.5, -4.2]);
  [[-14, 4.6, 0xdcefe5, 2.2], [-8, 5.4, 0xcfe3ff, 1.6], [-2, 4.4, 0xe6dcff, 2.0], [4, 5.2, 0xfff0b8, 1.7], [10, 4.5, 0xffd9cb, 2.1], [15.5, 5.3, 0xdcefe5, 1.5]]
    .forEach(([x, y, c, r]) => { const d = cil(r, r, 0.06, c, [x, y, -4.0]); d.rotation.x = Math.PI / 2; d.castShadow = false; });
  bloco(46, 0.22, 0.12, 0xffffff, 0.02, [0, 0.11, -4.0]);
  // Blocos de brinquedo espalhados no chão
  [[-11.2, 0.2, 2.4, 0xff8fa3], [-10.8, 0.2, 2.8, 0xffd166], [-1.2, 0.2, 3.2, 0x7fc8a9], [3.6, 0.2, 3.0, 0x8ab4ff], [11.6, 0.2, 2.6, 0xc9b8ff], [12.0, 0.2, 3.0, 0xff8fa3]]
    .forEach(([x, y, z, c], i) => { const b = bloco(0.4, 0.4, 0.4, c, 0.07, [x, y, z]); b.rotation.y = i * 0.7; });

  const X = { celular: -9, relogio: -5.4, colar: -1.8, fone: 1.8, tablet: 5.4, robo: 9.4 };
  const CORES_PED = { celular: 0xcfe3ff, relogio: 0xdcefe5, colar: 0xe6dcff, fone: 0xfff0b8, tablet: 0xffd9cb, robo: 0xfde3cf };
  Object.entries(X).forEach(([nome, x]) => {
    const r = nome === 'robo' ? 1.5 : 1.1;
    cil(r, r * 1.05, 0.9, CORES_PED[nome], [x, 0.45, 0]);
    cil(r * 0.92, r * 0.92, 0.06, 0xffffff, [x, 0.93, 0]);
  });

  // ---------- Equipamentos ----------
  const itens = {};
  const novoItem = (nome, y) => { const g = new THREE.Group(); g.position.set(X[nome], y, 0); cena.add(g); const m = new THREE.Group(); g.add(m); itens[nome] = { g, m, base: y, giro: 0 }; return m; };

  // Celular: o "cérebro" do Lumi
  {
    const m = novoItem('celular', 2.1);
    bloco(1.05, 2.1, 0.13, 0x2e2a47, 0.18, [0, 0, 0], m);
    const t = telaCanvas(300, 620, (g, l, a) => {
      g.fillStyle = '#fffdf8'; g.fillRect(0, 0, l, a);
      g.fillStyle = '#4a6cf0'; arred(g, 14, 22, l - 28, 52, 16); g.fill();
      g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText('Oi, Lucas! 👋', 30, 56);
      g.fillStyle = '#16233f'; arred(g, 90, 96, 120, 96, 30); g.fill();
      g.fillStyle = '#5eead4'; arred(g, 120, 126, 14, 24, 7); g.fill(); arred(g, 166, 126, 14, 24, 7); g.fill();
      g.strokeStyle = '#5eead4'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(150, 152, 14, 0.2, Math.PI - 0.2); g.stroke();
      g.fillStyle = '#fff4d6'; arred(g, 18, 212, l - 36, 92, 20); g.fill();
      g.fillStyle = '#1d4f52'; g.font = 'bold 19px sans-serif'; g.fillText('Pegue o livro e coloque', 34, 250); g.fillText('na mochila.', 34, 276);
      for (let i = 0; i < 6; i++) { g.fillStyle = i < 3 ? '#ffd166' : '#ece6f5'; g.beginPath(); g.arc(42 + i * 43, 340, 15, 0, 7); g.fill(); }
      g.fillStyle = '#9edfc8'; arred(g, 18, 388, l - 36, 70, 22); g.fill();
      g.fillStyle = '#16403a'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.fillText('✓ Fiz', l / 2, 433);
      g.fillStyle = '#e5484d'; arred(g, 18, 478, 110, 54, 18); g.fill();
      g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText('SOS', 73, 514);
      g.fillStyle = '#ece6f5'; arred(g, 142, 478, 140, 54, 18); g.fill();
      g.fillStyle = '#5b6b64'; g.font = 'bold 20px sans-serif'; g.fillText('Calma', 212, 514);
    });
    planoTela(t.tex, 0.95, 1.96, [0, 0, 0.07], m);
    bloco(0.3, 0.05, 0.02, 0x15131f, 0.02, [0, 0.93, 0.07], m);
  }

  // Relógio: dica por vibração, SOS físico
  {
    const m = novoItem('relogio', 2.1);
    [1, -1].forEach((s) => { const c = bloco(0.62, 1.05, 0.12, 0x9edfc8, 0.12, [0, s * 0.95, -0.04], m); c.rotation.x = s * -0.12; });
    [0.5, 0.75, 1.0].forEach((y) => bola(0.025, 0x5fb89b, [0, -1.08 - (y - 0.5) * 0.4 + 0.2, 0.03], m));
    bloco(1.0, 1.2, 0.3, 0x2e2a47, 0.26, [0, 0, 0.04], m);
    bloco(0.08, 0.3, 0.1, 0x4b4566, 0.03, [0.54, 0.15, 0.04], m);
    const t = telaCanvas(220, 260, (g, l, a) => {
      g.fillStyle = '#1f1b33'; g.fillRect(0, 0, l, a);
      g.fillStyle = '#c9c3e6'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.fillText('14:54', l / 2, 36);
      g.strokeStyle = '#3a3555'; g.lineWidth = 16; g.beginPath(); g.arc(l / 2, 142, 68, 0, 7); g.stroke();
      g.strokeStyle = '#9edfc8'; g.lineCap = 'round'; g.beginPath(); g.arc(l / 2, 142, 68, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.66); g.stroke();
      g.fillStyle = '#fff'; g.font = 'bold 44px sans-serif'; g.fillText('4/6', l / 2, 158);
      g.fillStyle = '#d8d3ef'; g.font = '19px sans-serif'; g.fillText('Lumi perguntando', l / 2, 244);
    });
    planoTela(t.tex, 0.86, 1.02, [0, 0, 0.195], m);
  }

  // Colar / pingente com câmera pequena e LED
  {
    const m = novoItem('colar', 2.75);
    const cordao = toro(0.8, 0.028, 0xc9b8ff, [0, 0.2, 0], m); cordao.scale.y = 1.2;
    bola(0.06, 0xb9a6ff, [0, 1.16, 0], m);
    const p = new THREE.Group(); p.position.set(0, -1.08, 0); m.add(p);
    const corpo = bola(0.34, 0xeef3ff, [0, 0, 0], p); corpo.scale.set(1, 1, 0.68);
    cil(0.12, 0.12, 0.1, 0x1b1830, [0, 0, 0.23], p).rotation.x = Math.PI / 2;
    bola(0.05, 0x5b6cf0, [0, 0, 0.29], p).scale.z = 0.5;
    toro(0.17, 0.02, 0x5eead4, [0, 0, 0.23], p, Math.PI * 2, { emissive: 0x5eead4, emissiveIntensity: 1.1 });
    bola(0.045, 0xc9b8ff, [0, 0.36, 0], p);
  }

  // Fone de condução óssea
  {
    const m = novoItem('fone', 2.15);
    toro(0.92, 0.075, 0xffd166, [0, -0.2, 0], m, Math.PI);
    [-1, 1].forEach((s) => {
      bloco(0.3, 0.62, 0.34, 0xffd166, 0.12, [s * 0.92, -0.2, 0], m);
      bloco(0.1, 0.5, 0.3, 0xfff0b8, 0.04, [s * 0.76, -0.2, 0.0], m);
      bola(0.05, 0x5eead4, [s * 0.92, -0.2, 0.18], m);
    });
  }

  // Tablet: painel da família e dos profissionais
  {
    const m = novoItem('tablet', 2.0);
    bloco(0.9, 1.1, 0.07, 0xd8d0e8, 0.08, [0, -0.15, -0.2], m).rotation.x = -0.15;
    const q = new THREE.Group(); q.rotation.x = -0.12; m.add(q);
    bloco(2.3, 1.55, 0.1, 0x2e2a47, 0.14, [0, 0, 0], q);
    const t = telaCanvas(460, 310, (g, l, a) => {
      g.fillStyle = '#fffdf8'; g.fillRect(0, 0, l, a);
      g.fillStyle = '#1d4f52'; g.font = 'bold 22px sans-serif'; g.fillText('Evolução · 14 meses', 22, 40);
      g.fillStyle = '#9edfc8'; arred(g, l - 130, 18, 108, 30, 14); g.fill();
      g.fillStyle = '#16403a'; g.font = 'bold 15px sans-serif'; g.fillText('+ fase 2', l - 112, 39);
      g.strokeStyle = '#ece6f5'; g.lineWidth = 2;
      [90, 140, 190].forEach((y) => { g.beginPath(); g.moveTo(22, y); g.lineTo(l - 22, y); g.stroke(); });
      const pts = [20, 26, 34, 41, 38, 46, 55, 60, 52, 58, 68, 74, 80, 84];
      g.strokeStyle = '#4a6cf0'; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath();
      pts.forEach((v, i) => { const x = 28 + i * ((l - 56) / 13), y = 210 - v * 1.5; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      [['Passos sozinhos', '84%', '#2a9d7c'], ['Pausas de calma', '3/sem', '#c27c0e'], ['Remédio', '96%', '#4a6cf0']].forEach(([t1, v, c], i) => {
        const x = 22 + i * 142; g.fillStyle = '#f7f1e8'; arred(g, x, 226, 130, 66, 14); g.fill();
        g.fillStyle = c; g.font = 'bold 24px sans-serif'; g.fillText(v, x + 12, 258); g.fillStyle = '#5b6b64'; g.font = '14px sans-serif'; g.fillText(t1, x + 12, 280);
      });
    });
    planoTela(t.tex, 2.14, 1.44, [0, 0, 0.055], q);
  }

  // Lumi físico (robô de mesa) com acessórios que acompanham os níveis
  const robo = novoItem('robo', 1.05);
  const lumiCorpo = new THREE.Group(); lumiCorpo.scale.setScalar(1.55); lumiCorpo.position.y = -0.1; robo.add(lumiCorpo);
  const acessorios = {};
  {
    bloco(0.42, 0.34, 0.32, 0xdfe8fb, 0.14, [0, 0.27, 0], lumiCorpo);
    bloco(0.62, 0.48, 0.48, 0xeef3ff, 0.2, [0, 0.72, 0], lumiCorpo);
    const cara = telaCanvas(256, 180, (g, l, a, fechado = false) => {
      g.fillStyle = '#16233f'; arred(g, 0, 0, l, a, 60); g.fill();
      g.fillStyle = '#5eead4'; g.strokeStyle = '#5eead4'; g.lineWidth = 12; g.lineCap = 'round';
      if (fechado) [80, 176].forEach((x) => { g.beginPath(); g.moveTo(x - 18, 78); g.lineTo(x + 18, 78); g.stroke(); });
      else [80, 176].forEach((x) => { arred(g, x - 15, 52, 30, 46, 15); g.fill(); });
      g.beginPath(); g.arc(128, 112, 26, 0.2, Math.PI - 0.2); g.stroke();
      g.fillStyle = 'rgba(251,113,133,.45)'; [52, 204].forEach((x) => { g.beginPath(); g.arc(x, 122, 14, 0, 7); g.fill(); });
    });
    robo.cara = cara;
    add(new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.34), new THREE.MeshBasicMaterial({ map: cara.tex, transparent: true })), [0, 0.72, 0.245], lumiCorpo);
    [-0.34, 0.34].forEach((x) => bloco(0.08, 0.2, 0.16, 0x7dd3fc, 0.04, [x, 0.72, 0], lumiCorpo));
    robo.haste = cil(0.015, 0.015, 0.16, 0x9db4dd, [0, 1.04, 0], lumiCorpo, 10);
    const antena = add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), brilha(0x22d3ee)), [0, 1.13, 0], lumiCorpo); robo.antena = antena;
    add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), brilha(0x22d3ee, 1)), [0, 0.29, 0.165], lumiCorpo).scale.z = 0.4;
    robo.bracos = [-0.27, 0.27].map((x) => bloco(0.08, 0.2, 0.1, 0xc3d5f5, 0.04, [x, 0.27, 0], lumiCorpo));
    // Acessórios. Corpo: cachecol (a partir do nível 1) e capa (nível 5). Cabeça: um item por vez
    // (fones no nível 2, capacete no 3, crista de dinossauro nos níveis 4 e 5), para não ficar amontoado.
    const grupo = (nome) => { const g = new THREE.Group(); g.visible = false; lumiCorpo.add(g); acessorios[nome] = g; return g; };
    let g = grupo('cachecol');
    bloco(0.5, 0.09, 0.4, 0xf87171, 0.045, [0, 0.46, 0], g); bloco(0.09, 0.22, 0.04, 0xef4444, 0.03, [0.13, 0.36, 0.2], g);
    g = grupo('fone');
    toro(0.36, 0.035, 0x334155, [0, 0.72, 0], g, Math.PI).scale.y = 0.7;
    [-0.37, 0.37].forEach((x) => bloco(0.09, 0.22, 0.2, 0x22d3ee, 0.04, [x, 0.72, 0], g));
    g = grupo('capacete');
    const meia = add(sombra(new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd6a35c))), [0, 0.93, 0], g);
    meia.scale.set(1, 0.85, 0.82);
    bloco(0.72, 0.05, 0.54, 0xb98a47, 0.025, [0, 0.935, 0], g);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), brilha(0xfde68a, 0.9)), [0, 1.05, 0.25], g);
    g = grupo('hiperfoco');
    [[-0.16, 0.2], [-0.05, 0.3], [0.06, 0.27], [0.17, 0.18]].forEach(([z, h]) => add(sombra(new THREE.Mesh(new THREE.ConeGeometry(0.075, h, 4), mat(0x4ade80))), [0, 0.95 + h / 2, z], g));
    g = grupo('capa');
    const forma = new THREE.Shape();
    forma.moveTo(-0.24, 0.5); forma.lineTo(0.24, 0.5); forma.lineTo(0.34, -0.02); forma.lineTo(-0.34, -0.02); forma.closePath();
    const capaMesh = add(sombra(new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 0.03, bevelEnabled: false }), mat(0x6366f1))), [0, 0.02, -0.2], g);
    capaMesh.rotation.x = 0.1;
  }
  robo.nivel = 1;
  const ORDEM_ACC = ['cachecol', 'fone', 'capacete', 'hiperfoco', 'capa'];
  function nivelRobo(n) {
    robo.nivel = n;
    const ver = { cachecol: n >= 1, fone: n === 2, capacete: n === 3, hiperfoco: n >= 4, capa: n >= 5 };
    ORDEM_ACC.forEach((a) => { acessorios[a].visible = ver[a]; });
    robo.haste.visible = robo.antena.visible = n < 3; // a antena não atravessa o capacete nem a crista
    document.querySelectorAll('#niveis li').forEach((li, i) => li.classList.toggle('on', i === n));
    const nome = document.getElementById('nivelNome');
    if (nome && window.LUMI_NIVEIS) nome.textContent = LUMI_NIVEIS[n].nome;
  }
  nivelRobo(1);
  // Estrelinhas de conquista em volta do robô
  const estrelas = [];
  {
    const f = new THREE.Shape();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.05 : 0.12, a = i / 10 * Math.PI * 2 - Math.PI / 2; f[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
    const geo = new THREE.ExtrudeGeometry(f, { depth: 0.03, bevelEnabled: false });
    for (let i = 0; i < 6; i++) { const e = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffc23d, emissiveIntensity: 0.5 })); e.visible = false; cena.add(e); estrelas.push(e); }
  }
  const brilho = new THREE.PointLight(0x9de8ff, 2, 4); brilho.position.set(X.robo, 2.0, 1.5); cena.add(brilho);

  // Rótulos
  const FASES = { celular: ['Celular', 'Hoje', 'hoje'], relogio: ['Relógio', 'Hoje no app · 12–24 m', 'breve'], colar: ['Colar', '12–24 meses', 'breve'], fone: ['Fone', '12–24 meses', 'breve'], tablet: ['Painel', 'Hoje no app · 6–12 m', 'hoje'], robo: ['Lumi físico', '24–36 meses', 'futuro'] };
  const rot = {};
  Object.entries(FASES).forEach(([k, [n, f, c]]) => { rot[k] = rotulo(n, f, c, [0, k === 'robo' ? 1.9 : 1.7, 0], itens[k].g); });

  let piscar = 2, tNivel = 0, proximoNivel = 0, visivel = true;

  // ---------- Câmera por capítulo ----------
  const alvoItem = (k, dist = 5.4, altura = 2.0) => ({ pos: [X[k] - 0.2, altura + 0.35, dist], alvo: [X[k], altura, 0] });
  const POSES = {
    abertura: { pos: [0.4, 3.6, 21], alvo: [0.4, 1.8, 0] },
    ajuda: { pos: [-3, 6.5, 17], alvo: [0, 1.4, 0] },
    celular: alvoItem('celular'), relogio: alvoItem('relogio'), colar: alvoItem('colar', 6.4, 2.75), fone: alvoItem('fone'),
    tablet: alvoItem('tablet', 6), robo: alvoItem('robo', 6.6, 1.9), lumi: alvoItem('robo', 4.4, 1.9),
    fecho: { pos: [2, 3.6, 21], alvo: [0.4, 1.8, 0] },
  };
  const camPos = new THREE.Vector3(...POSES.abertura.pos), camAlvo = new THREE.Vector3(...POSES.abertura.alvo);
  const destPos = camPos.clone(), destAlvo = camAlvo.clone();
  let atual = window.capituloAtual || 'abertura';
  // O painel de texto cobre uma parte da tela (à esquerda no computador, embaixo no celular). A vitrine é enquadrada
  // só na parte livre: mede-se o painel do capítulo ativo e a câmera desloca e afasta o quadro para os modelos
  // nunca ficarem por baixo dele.
  let reservaX = 0, reservaY = 0, alvoX = 0, alvoY = 0;
  const tg = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  function medirPainel() {
    const l = caixa.clientWidth, a = caixa.clientHeight;
    const painel = document.querySelector('.capitulo.ativo .painel');
    if (!painel) { alvoX = 0; alvoY = 0; return; }
    const r = painel.getBoundingClientRect();
    if (l > 860) { alvoX = Math.max(0, Math.min(r.right + 28, l * 0.62)); alvoY = 0; }
    else { alvoX = 0; alvoY = Math.max(0, Math.min(a * 0.6, a - r.top + 8)); }
  }
  function enquadrar() {
    const l = caixa.clientWidth, a = caixa.clientHeight;
    camera.aspect = (l + reservaX) / a;
    if (reservaX > 0.5) camera.setViewOffset(l + reservaX, a, 0, 0, l, a);
    else if (reservaY > 0.5) camera.setViewOffset(l, a, 0, reservaY / 2, l, a);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function irPara(nome) {
    atual = nome;
    medirPainel();
    const l = caixa.clientWidth, a = caixa.clientHeight;
    const livreL = Math.max(240, l - alvoX), livreA = Math.max(240, a - alvoY);
    const p = POSES[nome] || POSES.abertura;
    destAlvo.set(...p.alvo);
    const dir = new THREE.Vector3(...p.pos).sub(destAlvo);
    const d0 = dir.length();
    const todos = ['abertura', 'ajuda', 'fecho'].includes(nome);
    // Distância para caber na parte livre: toda a vitrine (24 unidades) ou um equipamento (3,6 × 4,4)
    const porLargura = (todos ? 24 : 3.6) * a / (2 * tg * livreL);
    const porAltura = (todos ? 9 : 4.4) * a / (2 * tg * livreA);
    const d = todos ? Math.min(44, Math.max(14, porLargura, porAltura)) : Math.min(30, Math.max(d0, porLargura, porAltura));
    destPos.copy(dir.normalize().multiplyScalar(d)).add(destAlvo);
    cena.fog.near = d + 6; cena.fog.far = d + 30; // a névoa não apaga a vitrine quando a câmera está longe
    if (fixo) { camPos.copy(destPos); camAlvo.copy(destAlvo); reservaX = alvoX; reservaY = alvoY; enquadrar(); }
    caixa.classList.toggle('geral', todos); // na visão geral, os rótulos ficam só com o nome
    Object.entries(rot).forEach(([k, dv]) => dv.classList.toggle('apagado', !(todos || k === nome || (nome === 'lumi' && k === 'robo'))));
    estrelas.forEach((e) => { e.visible = nome === 'lumi'; });
    if (nome === 'lumi') { nivelRobo(0); proximoNivel = 0; } else if (nome === 'robo') nivelRobo(1);
    // O painel termina de subir (animação de entrada) um instante depois: mede de novo
    clearTimeout(irPara.t); irPara.t = setTimeout(() => { const x = alvoX, y = alvoY; medirPainel(); if (Math.abs(x - alvoX) + Math.abs(y - alvoY) > 6) irPara(atual); }, 750);
  }
  document.addEventListener('capitulo', (e) => irPara(e.detail));

  function ajustar() {
    const l = caixa.clientWidth, a = caixa.clientHeight;
    renderer.setSize(l, a, false); rotulos.setSize(l, a);
    irPara(atual);
    reservaX = alvoX; reservaY = alvoY; enquadrar();
  }
  addEventListener('resize', ajustar);
  ajustar();

  // Arrastar para girar o equipamento em foco
  let arrasto = null;
  const emFoco = () => (atual === 'lumi' ? 'robo' : itens[atual] ? atual : null);
  renderer.domElement.addEventListener('pointerdown', (e) => { if (emFoco()) arrasto = { x: e.clientX, g: itens[emFoco()] }; });
  addEventListener('pointermove', (e) => { if (!arrasto) return; arrasto.g.giro += (e.clientX - arrasto.x) * 0.012; arrasto.x = e.clientX; });
  addEventListener('pointerup', () => { arrasto = null; });

  // ---------- Animação ----------
  const relogio = new THREE.Clock();
  function quadro() {
    const t = relogio.getElapsedTime();
    const k = fixo ? 1 : 0.05;
    camPos.lerp(destPos, k); camAlvo.lerp(destAlvo, k);
    if (Math.abs(reservaX - alvoX) + Math.abs(reservaY - alvoY) > 0.5) { reservaX += (alvoX - reservaX) * k; reservaY += (alvoY - reservaY) * k; enquadrar(); }
    camera.position.copy(camPos); camera.lookAt(camAlvo);
    Object.entries(itens).forEach(([nome, it], i) => {
      const foco = nome === emFoco();
      if (!calmo) {
        it.g.position.y = it.base + Math.sin(t * 1.3 + i) * 0.06;
        const alvoGiro = foco ? it.giro : it.giro * 0.9;
        it.m.rotation.y += ((Math.sin(t * 0.5 + i) * 0.5 + alvoGiro) - it.m.rotation.y) * 0.08;
      }
    });
    if (!calmo) {
      robo.antena.material.emissiveIntensity = 0.9 + Math.sin(t * 2.6) * 0.5;
      robo.bracos[0].rotation.z = Math.sin(t * 2) * 0.3; robo.bracos[1].rotation.z = -Math.sin(t * 2 + 1) * 0.3;
      if (t > piscar) { robo.cara.redesenhar(true); setTimeout(() => robo.cara.redesenhar(false), 140); piscar = t + 2.5 + Math.random() * 3; }
      if (atual === 'lumi' && t > tNivel) { proximoNivel = (proximoNivel + 1) % LUMI_NIVEIS.length; nivelRobo(proximoNivel); tNivel = t + 1.7; }
    }
    estrelas.forEach((e, i) => {
      const a = (calmo ? 0 : t * 0.7) + i * (Math.PI * 2 / estrelas.length);
      e.position.set(X.robo + Math.cos(a) * 1.6, 2.5 + Math.sin(t * 1.4 + i) * 0.1, Math.sin(a) * 1.6); e.rotation.y = t * 1.5 + i;
    });
    renderer.render(cena, camera); rotulos.render(cena, camera);
  }
  const rodar = () => renderer.setAnimationLoop(visivel && !document.hidden ? quadro : null);
  rodar();
  document.addEventListener('visibilitychange', rodar);
  // A seção "Aprofunde" cobre a vitrine: pausa o desenho para poupar bateria
  new IntersectionObserver(([e]) => { visivel = !(e.isIntersecting && e.intersectionRatio > 0.6); rodar(); }, { threshold: [0, 0.6, 1] }).observe(document.getElementById('aprofunde'));
  if (fixo) window.vitrineDiag = () => { camera.updateMatrixWorld(); const painel = document.querySelector('.capitulo.ativo .painel')?.getBoundingClientRect();
    return { painelDireita: painel ? Math.round(painel.right) : 0, painelTopo: painel ? Math.round(painel.top) : 0, tela: [caixa.clientWidth, caixa.clientHeight],
      itens: Object.entries(itens).map(([k, it]) => { const v = it.g.position.clone().project(camera); return `${k}:${Math.round((v.x * 0.5 + 0.5) * caixa.clientWidth)},${Math.round((-v.y * 0.5 + 0.5) * caixa.clientHeight)}`; }) }; };
  if (fixo) window.vitrineIr = (n) => { document.dispatchEvent(new CustomEvent('capitulo', { detail: n })); quadro(); };
  document.getElementById('carregando')?.remove();
}
