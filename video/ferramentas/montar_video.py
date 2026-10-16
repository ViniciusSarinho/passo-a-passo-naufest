"""Monta video/index.html (composição HyperFrames) a partir de linha-do-tempo.json.

Uso: python video/ferramentas/montar_video.py
Cada cena é um bloco HTML com animações GSAP sincronizadas com as frases da locução (início e duração
reais dos áudios). Imagens: video/assets/img (capturadas do app real por capturar.mjs).
"""
import json, os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(RAIZ, 'linha-do-tempo.json'), encoding='utf-8'))
TOTAL = TL['duracao_total']
CENAS = {c['id']: c for c in TL['cenas']}
FADE = 0.45  # transição entre cenas (cruzamento)

JS = []
_cont = 0


def j(x):
    return json.dumps(x, ensure_ascii=False)


def fromto(sel, frm, to, at, d=0.6, ease='power3.out'):
    to = dict(to); to.update(duration=d, ease=ease)
    JS.append(f'tl.fromTo({j(sel)}, {j(frm)}, {j(to)}, {at:.3f});')


def to(sel, props, at, d=0.5, ease='power2.inOut'):
    p = dict(props); p.update(duration=d, ease=ease)
    JS.append(f'tl.to({j(sel)}, {j(p)}, {at:.3f});')


def setp(sel, props, at=0):
    JS.append(f'tl.set({j(sel)}, {j(props)}, {at:.3f});')


def pop(sel, at, d=0.6, y=40, scale=0.96, x=0):
    fromto(sel, {'opacity': 0, 'y': y, 'x': x, 'scale': scale}, {'opacity': 1, 'y': 0, 'x': 0, 'scale': 1}, at, d)


def out(sel, at, d=0.4):
    to(sel, {'opacity': 0}, at, d, 'power1.in')


def ph(cena, i):
    f = CENAS[cena]['frases'][i]
    return f['inicio'], f['duracao']


def img(nome, cls='', extra=''):
    return f'<img class="{cls}" src="assets/img/{nome}.png" alt="" {extra}>'


def contador(sel, ate, at, d, fmt):
    """Contagem animada (determinística: depende só do tempo da linha do tempo)."""
    global _cont
    _cont += 1
    nome = f'cont{_cont}'
    JS.append(f'const {nome} = {{ v: 0 }}; tl.to({nome}, {{ v: {ate}, duration: {d}, ease: "power2.out", onUpdate: () => {{ document.querySelector({j(sel)}).textContent = ({fmt})({nome}.v); }} }}, {at:.3f});')


scenes_html = []


def cena(id_, titulo_cap, corpo):
    c = CENAS[id_]
    ini, dur = c['inicio'], c['duracao']
    dur_vis = dur + (FADE if id_ != 'fecho' else 0)  # a última cena termina junto com o vídeo
    scenes_html.append(f'''
    <section id="{id_}" class="clip scene" data-start="{ini:.3f}" data-duration="{dur_vis:.3f}" data-track-index="1">
      {f'<div class="capitulo">{titulo_cap}</div>' if titulo_cap else ''}
      {corpo}
    </section>''')
    if id_ != 'abertura':
        fromto(f'#{id_}', {'opacity': 0}, {'opacity': 1}, ini, FADE, 'power1.out')
    else:
        setp('#abertura', {'opacity': 1}, 0)
    if id_ != 'fecho':
        to(f'#{id_}', {'opacity': 0}, ini + dur, FADE, 'power1.in')
    if titulo_cap:
        pop(f'#{id_} .capitulo', ini + 0.1, 0.5, y=-20)


# ======================================================================== 1 · ABERTURA
a0, ad = ph('abertura', 0); a1, _ = ph('abertura', 1)
cena('abertura', '', f'''
  <div class="fundo-foto">{img('sala-abertura')}</div>
  <div class="veu-esq"></div>
  <div class="bloco-titulo">
    <div class="selo-hack" id="ab-hack">NAUFest #AIforImpact2026 · protótipo funcional</div>
    <h1 id="ab-titulo">Passo a Passo</h1>
    <p class="sub" id="ab-sub">Um passo de cada vez, <em>com a Lumi do lado.</em></p>
    <div class="chips" id="ab-chips"><span>IA assistiva</span><span>Autismo</span><span>Autonomia</span></div>
  </div>
  {img('lumi-feliz', 'lumi-grande', 'id="ab-lumi"')}
''')
fromto('#abertura .fundo-foto img', {'scale': 1.0}, {'scale': 1.12}, 0, CENAS['abertura']['duracao'] + 0.4, 'none')
pop('#ab-hack', 0.3, 0.7, y=-20)
pop('#ab-titulo', 0.6, 0.9, y=60)
pop('#ab-sub', 1.2, 0.8, y=40)
fromto('#ab-lumi', {'opacity': 0, 'scale': 0.2, 'rotation': -14}, {'opacity': 1, 'scale': 1, 'rotation': 0}, a0, 0.8, 'back.out(2)')
for k in range(5):  # a Lumi flutua devagar (subidas e descidas sem sobreposição)
    to('#ab-lumi', {'y': -22}, a0 + 1.0 + k * 2.0, 1.0, 'sine.inOut')
    to('#ab-lumi', {'y': 0}, a0 + 2.0 + k * 2.0, 1.0, 'sine.inOut')
for i in range(3):
    pop(f'#ab-chips span:nth-child({i + 1})', a1 + 0.8 + i * 0.5, 0.6, y=24)

# ======================================================================== 2 · PROBLEMA
p0, d0 = ph('problema', 0); p1, d1 = ph('problema', 1); p2, d2 = ph('problema', 2)
celulas = ''.join(f'<i class="c" id="pc{n}"></i>' for n in range(168))
cena('problema', '01 · O problema', f'''
  <div class="col-stats">
    <div class="stat" id="pr-s1"><b id="pr-n1">0</b><span>pessoas com diagnóstico de autismo no Brasil<small>IBGE · Censo 2022</small></span></div>
    <div class="stat" id="pr-s2"><b id="pr-n2">0%</b><span>têm no máximo <u>2 horas</u> de terapia por semana<small>Mapa Autismo Brasil · 2026 · pesquisa voluntária</small></span></div>
    <div class="stat" id="pr-s3"><b id="pr-n3">0%</b><span>de quem cuida são mulheres, muitas sem renda própria<small>Mapa Autismo Brasil · 2026</small></span></div>
  </div>
  <div class="col-semana">
    <h3 id="pr-h">Uma semana = <b>168 horas</b></h3>
    <div class="grade-semana" id="pr-grade">{celulas}</div>
    <div class="leg-semana"><span class="dot teal"></span><b id="pr-t1">2 h de terapia</b><span class="dot pessego"></span><b id="pr-t2">166 h em que a ajuda não chega</b></div>
  </div>
''')
pop('#pr-s1', p0 + 0.3, 0.7, x=-60, y=0)
contador('#pr-n1', 2.4, p0 + 0.4, 1.8, 'v => v.toFixed(1).replace(".", ",") + " mi"')
pop('#pr-h', p0 + 0.5, 0.7)
fromto('#pr-grade', {'opacity': 0, 'scale': 0.96}, {'opacity': 1, 'scale': 1}, p0 + 0.7, 0.7)
pop('#pr-s2', p1 + 0.1, 0.7, x=-60, y=0)
contador('#pr-n2', 56.5, p1 + 0.2, 1.6, 'v => v.toFixed(1).replace(".", ",") + "%"')
setp('#pc0, #pc1', {'backgroundColor': '#0e8587'}, p1 + 0.9)
fromto('#pr-t1', {'opacity': 0}, {'opacity': 1}, p1 + 0.9, 0.5)
fromto('.leg-semana .dot.teal', {'opacity': 0}, {'opacity': 1}, p1 + 0.9, 0.5)
for n in range(2, 168):
    to(f'#pc{n}', {'backgroundColor': '#f4b9a1'}, p2 + 0.1 + (n - 2) * 0.012, 0.3, 'none')
fromto('#pr-t2', {'opacity': 0}, {'opacity': 1}, p2 + 0.2, 0.5)
fromto('.leg-semana .dot.pessego', {'opacity': 0}, {'opacity': 1}, p2 + 0.2, 0.5)
pop('#pr-s3', p2 + d2 * 0.55, 0.7, x=-60, y=0)
contador('#pr-n3', 92.4, p2 + d2 * 0.55 + 0.1, 1.4, 'v => v.toFixed(1).replace(".", ",") + "%"')

# ======================================================================== 3 · SOLUÇÃO
s0, sd0 = ph('solucao', 0); s1, sd1 = ph('solucao', 1)
cena('solucao', '02 · A solução', f'''
  <h2 class="titulo-cena" id="so-t">A ajuda <em>onde ela falta</em></h2>
  <div class="foto-larga" id="so-wide">{img('sala-sala')}</div>
  <div class="tres-cartoes">
    <figure class="cartao-foto" id="so-c1">{img('sala-lumi')}<figcaption><b>Lucas</b><span>celular · conversa com a Lumi</span></figcaption></figure>
    <figure class="cartao-foto" id="so-c2">{img('sala-ana')}<figcaption><b>Ana</b><span>celular · acompanha ao vivo</span></figcaption></figure>
    <figure class="cartao-foto" id="so-c3">{img('sala-carlos')}<figcaption><b>Carlos</b><span>relógio · recebe o essencial</span></figcaption></figure>
  </div>
''')
pop('#so-t', s0 + 0.2, 0.8, y=-30)
fromto('#so-wide', {'opacity': 0, 'scale': 0.94}, {'opacity': 1, 'scale': 1}, s0 + 0.3, 0.9)
fromto('#so-wide img', {'scale': 1.0}, {'scale': 1.08}, s0, sd0 + 1.5, 'none')
out('#so-wide', s1 - 0.2, 0.5)
third = sd1 / 3
for i in range(3):
    pop(f'#so-c{i + 1}', s1 + i * third * 0.92, 0.7, y=50, scale=0.94)

# ======================================================================== 4 · CICLO (antes, durante, depois)
c0, _ = ph('ciclo', 0); c1, _ = ph('ciclo', 1); c2, _ = ph('ciclo', 2)
cena('ciclo', '03 · Como funciona', f'''
  <div class="ciclo">
    <div class="passo" id="ci-1"><div class="rot"><i>1</i> Antes</div><div class="sub-rot">história social</div>{img('lucas-historia', 'tel')}</div>
    <div class="seta" id="ci-a1">→</div>
    <div class="passo" id="ci-2"><div class="rot"><i>2</i> Durante</div><div class="sub-rot">guia por voz e câmera</div>{img('lucas-guia-fase2', 'tel')}</div>
    <div class="seta" id="ci-a2">→</div>
    <div class="passo" id="ci-3"><div class="rot"><i>3</i> Depois</div><div class="sub-rot">relatório para a família</div>{img('ana-evolucao', 'tel')}</div>
  </div>
''')
pop('#ci-1', c0 + 0.1, 0.8, y=60)
pop('#ci-a1', c1 - 0.2, 0.5, y=0, x=-20)
pop('#ci-2', c1 + 0.05, 0.8, y=60)
pop('#ci-a2', c2 - 0.2, 0.5, y=0, x=-20)
pop('#ci-3', c2 + 0.05, 0.8, y=60)

# ======================================================================== 5 · IA ENXERGA
v0, vd0 = ph('ia-ve', 0); v1, vd1 = ph('ia-ve', 1); v2, vd2 = ph('ia-ve', 2)
cena('ia-ve', '', f'''
  <div class="faixa-ia" id="iv-faixa"><span class="selo-ia">IA</span><b>Inteligência artificial</b><em>nº 1 · enxerga</em></div>
  <div class="visor" id="iv-visor">
    <svg viewBox="0 0 1000 640" width="1000" height="640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dcc8"/><stop offset="1" stop-color="#f0cdb2"/></linearGradient></defs>
      <rect width="1000" height="640" fill="url(#parede)"/>
      <rect y="470" width="1000" height="170" fill="#d9a877"/><rect y="462" width="1000" height="12" fill="#c8935f"/>
      <rect x="700" y="60" width="220" height="190" rx="10" fill="#bfe1ff"/><path d="M810 60V250M700 155H920" stroke="#fff" stroke-width="8"/>
      <g id="iv-mochila"><rect x="170" y="260" width="200" height="230" rx="48" fill="#ff8fa3"/><rect x="205" y="335" width="130" height="90" rx="24" fill="#ff6f8a"/><path d="M215 262q55-70 110 0" fill="none" stroke="#ff6f8a" stroke-width="16"/><rect x="238" y="372" width="64" height="12" rx="6" fill="#fff4"/></g>
      <g id="iv-livro"><rect x="490" y="372" width="170" height="110" rx="10" fill="#4a6cf0"/><rect x="500" y="382" width="150" height="90" rx="6" fill="#6f8bf5"/><rect x="520" y="404" width="100" height="10" rx="5" fill="#fff"/><rect x="520" y="426" width="70" height="10" rx="5" fill="#fff9"/></g>
      <g id="iv-garrafa"><rect x="810" y="316" width="78" height="170" rx="30" fill="#7fc8e8"/><rect x="832" y="288" width="34" height="38" rx="8" fill="#4a9fc4"/></g>
      <path d="M333 0V640M666 0V640" stroke="#fff" stroke-width="3" stroke-dasharray="14 12" opacity=".55"/>
      <g class="caixa" id="iv-b1"><rect x="150" y="236" width="240" height="270" rx="12" fill="none" stroke="#2ecf8f" stroke-width="8"/><rect x="150" y="190" width="214" height="46" rx="10" fill="#2ecf8f"/><text x="166" y="223" font-family="Nunito, sans-serif" font-weight="900" font-size="28" fill="#08352a">mochila 94%</text></g>
      <g class="caixa" id="iv-b2"><rect x="476" y="356" width="200" height="140" rx="12" fill="none" stroke="#6fd3d0" stroke-width="6"/><rect x="476" y="316" width="168" height="40" rx="10" fill="#6fd3d0"/><text x="490" y="345" font-family="Nunito, sans-serif" font-weight="900" font-size="25" fill="#0b3a3b">livro 88%</text></g>
      <g class="caixa" id="iv-b3"><rect x="798" y="276" width="104" height="224" rx="12" fill="none" stroke="#6fd3d0" stroke-width="6"/><rect x="772" y="236" width="170" height="40" rx="10" fill="#6fd3d0"/><text x="786" y="265" font-family="Nunito, sans-serif" font-weight="900" font-size="25" fill="#0b3a3b">garrafa 81%</text></g>
    </svg>
    <div class="selo-visor"><i class="rec"></i> câmera do celular · no aparelho</div>
    <div class="aviso-ilustr">Ilustração do reconhecimento. No app, é a câmera do celular, em tempo real.</div>
  </div>
  <div class="resultado" id="iv-res">
    <div class="dir"><span>←</span> à sua <b>esquerda</b></div>
    <p class="frase-lumi" id="iv-frase">“A mochila está à sua esquerda.”</p>
    <div class="tec">Visão computacional · roda no navegador</div>
  </div>
  <div class="selo-priv" id="iv-priv"><i>🔒</i><div><b>100% no aparelho</b><span>nenhuma imagem é gravada ou enviada</span></div></div>
''')
fromto('#iv-faixa', {'opacity': 0, 'scale': 0.7, 'y': -20}, {'opacity': 1, 'scale': 1, 'y': 0}, v0 + 0.1, 0.8, 'back.out(1.8)')
to('#iv-faixa', {'scale': 1.06}, v0 + 1.4, 0.8, 'sine.inOut')
to('#iv-faixa', {'scale': 1.0}, v0 + 2.2, 0.8, 'sine.inOut')
pop('#iv-visor', v0 + 1.0, 0.9, y=50)
setp('#iv-b1, #iv-b2, #iv-b3', {'opacity': 0}, 0)
for k, b in enumerate(['#iv-b1', '#iv-b2', '#iv-b3']):
    fromto(b, {'opacity': 0, 'scale': 1.15, 'transformOrigin': '50% 50%'}, {'opacity': 1, 'scale': 1}, v1 + 0.5 + k * 0.7, 0.5, 'back.out(1.6)')
pop('#iv-res', v1 + 2.4, 0.8, x=60, y=0)
fromto('#iv-frase', {'opacity': 0}, {'opacity': 1}, v1 + 3.4, 0.6)
pop('#iv-priv', v2 + 0.3, 0.8, y=40, scale=0.9)

# ======================================================================== 6 · IA DECIDE
d0_, dd0 = ph('ia-decide', 0); d1_, dd1 = ph('ia-decide', 1); d2_, dd2 = ph('ia-decide', 2)
barras_ajuda = ''.join(f'<i style="height:{h}px" id="ib{n}"></i>' for n, h in enumerate([210, 178, 140, 100, 62, 30]))
barras_auto = ''.join(f'<i style="height:{h}px" id="ia{n}"></i>' for n, h in enumerate([40, 78, 112, 152, 188, 214]))
cena('ia-decide', '', f'''
  <div class="faixa-ia pequena" id="id-faixa"><span class="selo-ia">IA</span><b>Inteligência artificial</b><em>nº 2 · decide quanto ajudar</em></div>
  <div class="fases">
    <div class="fase" id="id-f1">{img('lucas-guia-fase1', 'tel')}<div class="fase-rot"><i>1</i><b>Explica</b></div></div>
    <div class="fase" id="id-f2">{img('lucas-guia-fase2', 'tel')}<div class="fase-rot"><i>2</i><b>Pergunta</b></div></div>
    <div class="fase" id="id-f3">{img('lucas-guia-fase3', 'tel')}<div class="fase-rot"><i>3</i><b>Observa em silêncio</b></div></div>
  </div>
  <div class="grafico-ajuda" id="id-graf">
    <h4>Ao longo dos meses</h4>
    <div class="barras"><div class="serie ajuda">{barras_ajuda}</div><div class="serie auto">{barras_auto}</div></div>
    <div class="leg"><span class="dot pessego"></span>ajuda da IA<span class="dot teal"></span>autonomia da pessoa</div>
    <div class="trava" id="id-trava">↻ Travou? <b>A ajuda volta.</b></div>
    <div class="tecnica" id="id-tec">Desvanecimento de dicas<small>técnica de terapia comportamental</small></div>
  </div>
''')
pop('#id-faixa', d0_ + 0.05, 0.7, y=-20)
for k in range(3):
    pop(f'#id-f{k + 1}', d0_ + 1.5 + k * 1.9, 0.8, y=60)
fromto('#id-graf', {'opacity': 0, 'x': 80}, {'opacity': 1, 'x': 0}, d0_ + 3.8, 0.8)
for n in range(6):
    fromto(f'#ib{n}', {'scaleY': 0, 'transformOrigin': '50% 100%'}, {'scaleY': 1}, d1_ + 0.2 + n * 0.5, 0.6)
    fromto(f'#ia{n}', {'scaleY': 0, 'transformOrigin': '50% 100%'}, {'scaleY': 1}, d1_ + 0.4 + n * 0.5, 0.6)
pop('#id-trava', d1_ + 1.0, 0.7, y=20)
pop('#id-tec', d2_ + 0.2, 0.8, y=30)

# ======================================================================== 7 · IA ADAPTA, PERGUNTA E LÊ O LAUDO
e0, ed0 = ph('ia-adapta', 0); e1, ed1 = ph('ia-adapta', 1); e2, ed2 = ph('ia-adapta', 2); e3, ed3 = ph('ia-adapta', 3)
cena('ia-adapta', '', f'''
  <div class="faixa-ia pequena" id="ad-faixa"><span class="selo-ia">IA</span><b>Inteligência artificial</b><em>nº 3 · adapta, pergunta e lê o laudo</em></div>
  <div class="cartao-ling" id="ad-ling">
    <h4>A mesma tarefa, no nível de cada pessoa</h4>
    <p class="nv" id="ad-n1"><i>1</i>“Coloque o livro.”</p>
    <p class="nv" id="ad-n2"><i>2</i>“Pegue o livro da aula de hoje e coloque na mochila.”</p>
    <p class="nv" id="ad-n3"><i>3</i>“Agora o livro. Hoje tem aula e você vai precisar dele.”</p>
    <p class="nv din" id="ad-n4"><i>🦖</i>“Isso, Lucas! Coisa de especialista em dinossauros!”</p>
  </div>
  <div class="par-tel" id="ad-tels">
    {img('ana-ia-perguntas', 'tel')}{img('ana-ia-laudo', 'tel')}
  </div>
  <div class="cadeia" id="ad-cad">
    <span id="ad-k1">📄 Laudo<small>PDF ou TXT</small></span><b>→</b><span id="ad-k2">🧠 IA lê<small>no navegador</small></span><b>→</b><span id="ad-k3">💡 Sugere<small>com o trecho original</small></span><b>→</b><span id="ad-k4" class="humano">✅ Humano aprova<small>sempre</small></span>
  </div>
  <div class="selo-humano" id="ad-hum">A IA sugere. <b>Um humano sempre aprova.</b></div>
  <div class="selo-sem-ia" id="ad-sem"><s>Sem IA: só lembretes</s><br>→ <b>Com IA: apoio que aprende junto</b></div>
''')
pop('#ad-faixa', e0 + 0.05, 0.7, y=-20)
pop('#ad-ling', e0 + 0.3, 0.7, y=40)
for k in range(4):
    pop(f'#ad-n{k + 1}', e0 + 0.9 + k * 1.15, 0.6, y=20, x=-30)
pop('#ad-tels', e1 + 0.3, 0.9, x=90, y=0)
for k in range(4):
    pop(f'#ad-k{k + 1}', e1 + 0.8 + k * (ed1 / 5.0), 0.6, y=24, scale=0.9)
pop('#ad-cad', e1 + 0.5, 0.5, y=24, scale=1)
fromto('#ad-hum', {'opacity': 0, 'scale': 0.8, 'y': 30}, {'opacity': 1, 'scale': 1, 'y': 0}, e2 + 0.2, 0.8, 'back.out(1.6)')
to('#ad-ling', {'opacity': 0.35}, e2 + 0.1, 0.6)
out('#ad-hum', e3 - 0.1, 0.4)
fromto('#ad-sem', {'opacity': 0, 'scale': 0.85, 'y': 30}, {'opacity': 1, 'scale': 1, 'y': 0}, e3 + 0.1, 0.8, 'back.out(1.6)')

# ======================================================================== 8 · COTIDIANO (CAA, remédio, SOS)
k0, kd0 = ph('cotidiano', 0); k1, kd1 = ph('cotidiano', 1); k2, kd2 = ph('cotidiano', 2)
cena('cotidiano', '04 · No dia a dia', f'''
  <div class="beat" id="co-a">
    <h2 class="titulo-cena">Conversar <em>por figuras</em></h2>
    <p class="leg-cena">A frase de figuras vira fala, e a família responde.</p>
    <div class="par-dev">{img('lucas-caa', 'tel')}{img('ana-conversa', 'tel')}</div>
  </div>
  <div class="beat" id="co-b">
    <h2 class="titulo-cena">Remédio <em>com lembrete em figuras</em></h2>
    <p class="leg-cena">Só a médica altera doses. A família vê adesão e estoque.</p>
    <div class="par-dev">{img('lucas-remedio', 'tel')}{img('ana-saude', 'tel')}</div>
  </div>
  <div class="beat" id="co-c">
    <h2 class="titulo-cena">SOS <em>no celular e no relógio</em></h2>
    <p class="leg-cena">Alerta com mapa e localização. Um toque responde “estou indo”.</p>
    <div class="par-dev tres">{img('lucas-sos', 'tel')}{img('relogio-sos', 'rel')}{img('ana-sos', 'tel')}</div>
  </div>
''')
for sel in ['#co-a', '#co-b', '#co-c']:
    setp(sel, {'opacity': 0}, 0)
fromto('#co-a', {'opacity': 0, 'y': 40}, {'opacity': 1, 'y': 0}, k0 + 0.1, 0.7)
out('#co-a', k1 - 0.1, 0.5)
fromto('#co-b', {'opacity': 0, 'y': 40}, {'opacity': 1, 'y': 0}, k1 + 0.1, 0.7)
out('#co-b', k2 - 0.1, 0.5)
fromto('#co-c', {'opacity': 0, 'y': 40}, {'opacity': 1, 'y': 0}, k2 + 0.1, 0.7)

# ======================================================================== 9 · EVOLUÇÃO
ev0, evd = ph('evolucao', 0)
cena('evolucao', '05 · Evolução', f'''
  <div class="evo-tel" id="evo-tel">{img('ana-evolucao', 'tel')}</div>
  <div class="evo-txt" id="evo-txt">
    <h2 class="titulo-cena">14 meses de jornada, <em>com recuos</em></h2>
    <div class="evo-num"><span id="evo-a">0%</span><b>→</b><span id="evo-b" class="grande">0%</span></div>
    <p class="evo-leg">autonomia nos passos: início → últimos 30 dias<small>dados fictícios de demonstração</small></p>
    <ul class="evo-lista">
      <li id="evo-l1">Férias e mudança de escola: <b>os recuos aparecem</b></li>
      <li id="evo-l2">A IA sugere mudar de fase · <b>a família aprova</b></li>
    </ul>
  </div>
''')
pop('#evo-tel', ev0 + 0.1, 0.9, x=-80, y=0)
pop('#evo-txt', ev0 + 0.3, 0.8, x=60, y=0)
contador('#evo-a', 55, ev0 + 0.8, 1.2, 'v => Math.round(v) + "%"')
contador('#evo-b', 89, ev0 + 1.6, 2.0, 'v => Math.round(v) + "%"')
pop('#evo-l1', ev0 + 4.2, 0.7, x=40, y=0)
pop('#evo-l2', ev0 + 5.8, 0.7, x=40, y=0)
fromto('#evo-tel img', {'scale': 1.0}, {'scale': 1.02}, ev0, evd + 1, 'none')

# ======================================================================== 10 · CUIDADOS
cu0, cud0 = ph('cuidados', 0)
tiles = [('☝️', 'Uma coisa por vez'), ('🎨', 'Cores calmas'), ('🌙', 'Tela escura opcional'), ('🔊', 'Volume e voz ajustáveis'), ('⭐', 'Trilha de estrelas, sem punição'), ('🧭', 'Sempre previsível')]
tiles_html = ''.join(f'<div class="tile" id="cu-t{n}"><i>{e}</i><b>{t}</b></div>' for n, (e, t) in enumerate(tiles))
cena('cuidados', '06 · Calmo por design', f'''
  <div class="cu-tels" id="cu-tels">{img('lucas-inicio', 'tel')}{img('lucas-claro', 'tel')}<div class="troca">escura ⇄ clara</div></div>
  <div class="cu-dir">
    <h2 class="titulo-cena">Feito <em>para os sentidos</em></h2>
    <div class="tiles">{tiles_html}</div>
    <div class="base-nota" id="cu-base"><b>Para todas as idades</b>Crianças, adolescentes, adultos e pessoas mais velhas, com ajustes de som, luz e velocidade para cada um.</div>
  </div>
''')
pop('#cu-tels', cu0 + 0.1, 0.9, x=-80, y=0)
for n in range(6):
    pop(f'#cu-t{n}', cu0 + 0.6 + n * (cud0 / 6.8), 0.6, y=30, scale=0.92)
pop('#cu-base', cu0 + cud0 * 0.72, 0.8, y=30)

# ======================================================================== 11 · ROADMAP
r0, rd0 = ph('roadmap', 0); r1, rd1 = ph('roadmap', 1)
etapas = [('vitrine-celular', 'Hoje', 'Celular + Lumi no navegador'), ('vitrine-relogio', '12–24 meses', 'Relógio'), ('vitrine-colar', '12–24 meses', 'Colar com câmera'), ('vitrine-fone', '12–24 meses', 'Fone de condução óssea'), ('vitrine-robo', '24–36 meses', 'Lumi físico: robô de mesa')]
et_html = ''.join(f'<div class="etapa" id="ro-e{n}"><div class="foto">{img(i)}</div><b>{t}</b><span>{d}</span></div>' for n, (i, t, d) in enumerate(etapas))
cena('roadmap', '07 · O plano', f'''
  <h2 class="titulo-cena">Do celular ao <em>robô de mesa</em></h2>
  <div class="linha-etapas"><div class="trilho" id="ro-trilho"></div>{et_html}</div>
  <div class="pilotos" id="ro-pil"><b>Antes de tudo:</b> piloto com famílias · estudo clínico · sem promessa terapêutica antes da evidência</div>
''')
fromto('#ro-trilho', {'scaleX': 0, 'transformOrigin': '0% 50%'}, {'scaleX': 1}, r0 + 0.3, rd0 * 0.9, 'none')
for n in range(5):
    pop(f'#ro-e{n}', r0 + 0.4 + n * (rd0 * 0.8 / 5), 0.7, y=50, scale=0.94)
pop('#ro-pil', r1 + 0.1, 0.8, y=30)

# ======================================================================== 12 · FECHO
f0, fd0 = ph('fecho', 0); f1, fd1 = ph('fecho', 1)
cena('fecho', '', f'''
  <div class="fundo-foto desfoque">{img('sala-abertura')}</div>
  <div class="veu-total"></div>
  <div class="fecho-centro">
    {img('lumi-comemorando', 'lumi-medio', 'id="fe-lumi"')}
    <h1 id="fe-t">Passo a Passo</h1>
    <p class="sub" id="fe-s">Inteligência artificial para a <em>autonomia e o desenvolvimento</em> de pessoas autistas.</p>
    <div class="chips" id="fe-c"><span>Protótipo funcional</span><span>Dados fictícios</span><span>Código aberto</span></div>
    <div class="link" id="fe-l">viniciussarinho.github.io/passo-a-passo-naufest</div>
    <div class="selo-hack grande" id="fe-h">NAUFest #AIforImpact2026</div>
  </div>
''')
fromto('#fe-lumi', {'opacity': 0, 'scale': 0.3, 'rotation': 12}, {'opacity': 1, 'scale': 1, 'rotation': 0}, f0 + 0.1, 0.8, 'back.out(2)')
pop('#fe-c', f0 + 1.6, 0.8, y=30)
pop('#fe-t', f1 + 0.1, 0.9, y=50)
pop('#fe-s', f1 + 0.8, 0.9, y=40)
pop('#fe-l', f1 + 2.2, 0.8, y=30)
pop('#fe-h', f1 + 2.6, 0.8, y=30)
to('#fe-lumi', {'y': -18}, f1 + 1.0, 0.9, 'sine.inOut'); to('#fe-lumi', {'y': 0}, f1 + 1.9, 0.9, 'sine.inOut')
to('#fe-lumi', {'y': -18}, f1 + 2.9, 0.9, 'sine.inOut'); to('#fe-lumi', {'y': 0}, f1 + 3.8, 0.9, 'sine.inOut')

# ======================================================================== Legendas, Lumi falando e áudio
caps, audios = [], []
n_audio = 3
for c in TL['cenas']:
    for i, f in enumerate(c['frases']):
        idc = f"cap-{c['id']}-{i}"
        caps.append(f'<div id="{idc}" class="clip cap" data-start="{f["inicio"]:.3f}" data-duration="{f["duracao"] + 0.15:.3f}" data-track-index="9"><div class="pilula"><p>{f["texto"]}</p></div></div>')
        fromto(f'#{idc} .pilula', {'opacity': 0, 'y': 16}, {'opacity': 1, 'y': 0}, f['inicio'], 0.3)
        audios.append(f'<audio id="au{n_audio}" src="assets/voz/{f["arquivo"]}" data-start="{f["inicio"]:.3f}" data-duration="{f["duracao"]:.3f}" data-track-index="{n_audio}" data-volume="1"></audio>')
        n_audio += 1
        # a Lumi do canto "fala": pulsa enquanto a frase dura
        passos = max(2, int(f['duracao'] / 0.5))
        for p in range(passos):
            to('#lumi-canto', {'scale': 1.1 if p % 2 == 0 else 1.0}, f['inicio'] + p * 0.5, 0.25, 'sine.inOut')
        to('#anel-voz', {'opacity': 0.9, 'scale': 1.0}, f['inicio'], 0.2)
        to('#anel-voz', {'opacity': 0, 'scale': 1.25}, f['inicio'] + f['duracao'], 0.35)

# Efeitos sonoros: um sopro em cada troca de cena (começa um pouco antes, para cobrir a transição visual),
# um "ding" de destaque nas cenas de IA e um acorde brilhante no fecho
for c in TL['cenas'][1:]:
    audios.append(f'<audio id="au{n_audio}" src="assets/sfx/transicao.wav" data-start="{max(0, c["inicio"] - 0.45):.3f}" data-duration="0.75" data-track-index="{n_audio}" data-volume="0.45"></audio>')
    n_audio += 1
    if c['id'] in ('ia-ve', 'ia-decide', 'ia-adapta'):
        audios.append(f'<audio id="au{n_audio}" src="assets/sfx/brilho.wav" data-start="{c["inicio"] + 0.25:.3f}" data-duration="1.4" data-track-index="{n_audio}" data-volume="0.3"></audio>')
        n_audio += 1
fecho = next(c for c in TL['cenas'] if c['id'] == 'fecho')
audios.append(f'<audio id="au{n_audio}" src="assets/sfx/final.wav" data-start="{fecho["inicio"] + 0.3:.3f}" data-duration="2.4" data-track-index="{n_audio}" data-volume="0.3"></audio>')
n_audio += 1

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'video.css'), encoding='utf-8').read()

html = f'''<!doctype html>
<html lang="pt-BR" data-resolution="landscape">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080" />
  <title>Passo a Passo · pitch</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,600&family=Nunito:wght@700;800;900&family=Atkinson+Hyperlegible:wght@400;700&display=swap" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>
{CSS}
  </style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.3f}" data-width="1920" data-height="1080">
    <div class="fundo-geral" id="fundo"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div>
    {''.join(scenes_html)}
    <div class="lumi-canto-caixa"><i id="anel-voz"></i><img id="lumi-canto" src="assets/img/lumi-falando.png" alt="" /></div>
    {''.join(caps)}
    <audio id="au1" src="assets/musica.wav" data-start="0" data-duration="{TOTAL:.3f}" data-track-index="2" data-volume="0.1" data-fade-in="2"  data-fade-out="3.5"></audio>
    {''.join(audios)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    // fundo vivo: três manchas suaves se movem devagar
    tl.to('#fundo .b1', {{ x: 160, y: 90, duration: {TOTAL:.2f}, ease: 'none' }}, 0);
    tl.to('#fundo .b2', {{ x: -140, y: -70, duration: {TOTAL:.2f}, ease: 'none' }}, 0);
    tl.to('#fundo .b3', {{ x: 90, y: -120, duration: {TOTAL:.2f}, ease: 'none' }}, 0);
    {chr(10).join('    ' + l for l in JS)}
    window.__timelines["main"] = tl;
    tl.seek(0);
  </script>
</body>
</html>
'''
open(os.path.join(RAIZ, 'index.html'), 'w', encoding='utf-8', newline='\n').write(html)
print(f'index.html montado: {TOTAL:.1f}s, {len(JS)} animações, {len(CENAS)} cenas')
