"""Gera as imagens da documentação (docs/img) a partir das capturas reais do app (video/assets/img).

Uso (na pasta do projeto):
  1. python -m http.server 8765               (em outro terminal)
  2. cd video && npm install && node ferramentas/capturar.mjs
  3. python ferramentas/atualizar_imagens_docs.py

Os aparelhos (PNG transparente) viram JPG sobre o creme do site; as cenas 3D e a visão geral entram como estão.
Apaga de docs/img qualquer imagem que não esteja na lista abaixo, para não sobrarem capturas de versões antigas.
"""
import os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEM = os.path.join(RAIZ, 'video', 'assets', 'img')
DESTINO = os.path.join(RAIZ, 'docs', 'img')
CREME = (255, 248, 238)

# (arquivo em docs/img, captura de origem, largura final em px)
APARELHOS = [
    ('paciente-inicio', 'lucas-inicio', 420),
    ('paciente-guia', 'lucas-guia-fase2', 420),
    ('paciente-caa', 'lucas-caa', 420),
    ('paciente-remedio', 'lucas-remedio', 420),
    ('familia-sos', 'ana-sos', 420),
    ('familia-evolucao', 'ana-evolucao', 420),
    ('familia-laudo', 'ana-ia-laudo', 420),
    ('profissional-plano', 'pro-plano', 420),
    ('profissional-saude', 'pro-saude', 420),
    ('relogio-hoje', 'relogio-hoje', 300),
    ('relogio-sos', 'relogio-sos', 300),
]
CENAS = [
    ('app-visao-geral', 'app-visao-geral', 1400),
    ('app-modo-foco', 'app-modo-foco', 1400),
    ('site-sala-3d', 'sala-abertura', 1200),
    ('site-vitrine-3d', 'vitrine-abertura', 1200),
    ('site-lumi-fisico', 'vitrine-robo', 1200),
]

os.makedirs(DESTINO, exist_ok=True)
manter = set()


def salvar(nome, origem, largura, sobre_creme):
    im = Image.open(os.path.join(ORIGEM, origem + '.png')).convert('RGBA')
    if sobre_creme:
        fundo = Image.new('RGBA', im.size, CREME + (255,))
        fundo.alpha_composite(im)
        im = fundo
    im = im.convert('RGB')
    alt = round(im.height * largura / im.width)
    im = im.resize((largura, alt), Image.LANCZOS)
    im.save(os.path.join(DESTINO, nome + '.jpg'), quality=86, optimize=True, progressive=True)
    manter.add(nome + '.jpg')


for nome, origem, largura in APARELHOS:
    salvar(nome, origem, largura, True)
for nome, origem, largura in CENAS:
    salvar(nome, origem, largura, False)

removidas = [f for f in os.listdir(DESTINO) if f not in manter]
for f in removidas:
    os.remove(os.path.join(DESTINO, f))
print(f'{len(manter)} imagens geradas em docs/img; removidas as antigas: {", ".join(removidas) or "nenhuma"}')
