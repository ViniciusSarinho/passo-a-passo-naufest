"""Gera o PDF de apoio da entrega do NAUFest (uma página A4, abaixo de 1 MB), com links clicáveis e QR codes.

Uso (na pasta do projeto):  python ferramentas/gerar_pdf_apoio.py
Precisa de:  pip install reportlab qrcode pillow
Grava docs/APOIO-NAUFest.pdf. Os endereços ficam no topo do arquivo: edite aqui se mudarem.
"""
import io, os
import qrcode
from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'docs', 'APOIO-NAUFest.pdf')

VIDEO = 'https://drive.google.com/drive/folders/1BYZkaJwKUxZQMMOvFIKdF4BY94Lzx-5L?usp=sharing'
SITE = 'https://viniciussarinho.github.io/passo-a-passo-naufest/'
GITHUB = 'https://github.com/ViniciusSarinho/passo-a-passo-naufest'

TEAL, INK, OCRE, CREME, MUTED = HexColor('#0e8587'), HexColor('#1d4f52'), HexColor('#946400'), HexColor('#fff8ee'), HexColor('#5b6b64')
W, H = 595.28, 841.89
M = 40  # margem


def qr(url):
    img = qrcode.make(url, box_size=8, border=1).convert('RGB')
    buf = io.BytesIO(); img.save(buf, 'PNG', optimize=True); buf.seek(0)
    return ImageReader(buf)


def foto(nome, largura):  # reduz a captura para manter o PDF leve
    im = Image.open(os.path.join(RAIZ, 'docs', 'img', nome + '.jpg')).convert('RGB')
    alt = round(im.height * largura / im.width)
    im = im.resize((largura, alt), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=80, optimize=True); buf.seek(0)
    return ImageReader(buf), im.width / im.height


def texto(c, x, y, linhas, fonte='Helvetica', tam=10, cor=INK, entre=13.5):
    c.setFont(fonte, tam); c.setFillColor(cor)
    for ln in linhas:
        c.drawString(x, y, ln); y -= entre
    return y


c = canvas.Canvas(SAIDA, pagesize=(W, H))
c.setTitle('Passo a Passo · material de apoio · NAUFest #AIforImpact2026')
c.setAuthor('Passo a Passo')

# fundo creme e faixa do título
c.setFillColor(CREME); c.rect(0, 0, W, H, stroke=0, fill=1)
c.setFillColor(TEAL); c.rect(0, H - 118, W, 118, stroke=0, fill=1)
c.setFillColor(white); c.setFont('Helvetica-Bold', 26); c.drawString(M, H - 58, 'Passo a Passo')
c.setFont('Helvetica', 12.5)
c.drawString(M, H - 80, 'Inteligência artificial para a autonomia e o desenvolvimento de pessoas autistas')
c.setFont('Helvetica-Bold', 10); c.setFillColor(HexColor('#fff3c4'))
c.drawString(M, H - 101, 'NAUFest #AIforImpact2026  ·  protótipo funcional  ·  dados fictícios')

# três links com QR code
y0 = H - 138
cartoes = [('Vídeo (2 min 54 s)', 'Assista à apresentação', VIDEO),
           ('Protótipo no navegador', 'Teste sem instalar nada', SITE),
           ('Código aberto no GitHub', 'README, arquitetura e fontes', GITHUB)]
largura_c = (W - 2 * M - 2 * 14) / 3
for i, (tit, sub, url) in enumerate(cartoes):
    x = M + i * (largura_c + 14)
    c.setFillColor(white); c.setStrokeColor(HexColor('#9edfc8')); c.setLineWidth(1.5)
    c.roundRect(x, y0 - 148, largura_c, 148, 12, stroke=1, fill=1)
    c.drawImage(qr(url), x + (largura_c - 84) / 2, y0 - 100, 84, 84)
    c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 10); c.drawCentredString(x + largura_c / 2, y0 - 116, tit)
    c.setFillColor(MUTED); c.setFont('Helvetica', 8.5); c.drawCentredString(x + largura_c / 2, y0 - 129, sub)
    c.setFillColor(INK); c.setFont('Helvetica-Oblique', 7); c.drawCentredString(x + largura_c / 2, y0 - 141, 'toque ou aponte a câmera')
    c.linkURL(url, (x, y0 - 148, x + largura_c, y0), relative=0)

# problema e solução
y = y0 - 178
c.setFillColor(OCRE); c.setFont('Helvetica-Bold', 11); c.drawString(M, y, 'O PROBLEMA'); y -= 15
y = texto(c, M, y, [
    'No Brasil, cerca de 2,4 milhões de pessoas têm diagnóstico de autismo. Mais da metade recebe, no máximo,',
    '2 horas de terapia por semana, mas a semana tem 168 horas. A dificuldade e o risco estão nas outras, e quem',
    'cobre essa lacuna quase sempre é uma mãe sem apoio.'])
y -= 8
c.setFillColor(OCRE); c.setFont('Helvetica-Bold', 11); c.drawString(M, y, 'A SOLUÇÃO'); y -= 15
y = texto(c, M, y, [
    'O Passo a Passo leva a ajuda para onde ela falta: em casa, na padaria, na escola. A Lumi, uma robô companheira',
    'com IA, guia a pessoa autista nas rotinas do dia a dia, no jeito e no ritmo dela. A família e os profissionais',
    'acompanham por contas conectadas, no celular e no relógio.'])
y -= 8

# IA
c.setFillColor(OCRE); c.setFont('Helvetica-Bold', 11); c.drawString(M, y, 'ONDE ESTÁ A INTELIGÊNCIA ARTIFICIAL'); y -= 16
itens = [
    ('1  Enxerga', 'A câmera do celular reconhece objetos e diz onde estão ("a mochila está à sua esquerda"). Tudo roda',
     'no próprio aparelho: nenhuma imagem é gravada ou enviada.'),
    ('2  Decide quanto ajudar', 'A Lumi explica, depois só pergunta, depois apenas observa. Se a pessoa trava, a ajuda volta; se acerta,',
     'ela diminui (desvanecimento de dicas, técnica real de terapia comportamental).'),
    ('3  Adapta e lê o laudo', 'Ajusta a linguagem ao nível de cada pessoa e lê o laudo do neuropsicólogo (PDF ou texto) para sugerir',
     'ajustes. A IA sugere e um humano sempre aprova.'),
]
for tit, l1, l2 in itens:
    c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 10); c.drawString(M, y, tit); y -= 13.5
    y = texto(c, M + 12, y, [l1, l2], tam=9.5, entre=12.5); y -= 4
y -= 4

# telas reais do app
c.setFillColor(OCRE); c.setFont('Helvetica-Bold', 11); c.drawString(M, y, 'O PROTÓTIPO (TELAS REAIS)'); y -= 8
telas = [('paciente-guia', 'Lucas: guia da Lumi'), ('familia-sos', 'Ana: alerta de SOS'), ('relogio-sos', 'Carlos: relógio'),
         ('profissional-plano', 'Profissional: plano'), ('familia-laudo', 'IA lê o laudo')]
altura_t = 106; x = M
espaco = (W - 2 * M)
larguras = []
imgs = []
for nome, leg in telas:
    img, prop = foto(nome, 360)
    imgs.append((img, prop, leg)); larguras.append(altura_t * prop)
folga = (espaco - sum(larguras)) / (len(telas) - 1)
for (img, prop, leg), lg in zip(imgs, larguras):
    c.drawImage(img, x, y - altura_t - 4, lg, altura_t, mask=None)
    c.setFillColor(MUTED); c.setFont('Helvetica', 7.5); c.drawCentredString(x + lg / 2, y - altura_t - 14, leg)
    x += lg + folga
y -= altura_t + 32

# honestidade e rodapé (se o conteúdo crescer demais, o conteúdo encosta no rodapé: avisamos)
assert y - 52 > 46, f'conteúdo grande demais para uma página (sobram {y - 52:.0f} pt)'
c.setFillColor(white); c.setStrokeColor(HexColor('#f0c94a')); c.setLineWidth(1.2)
c.roundRect(M, y - 52, W - 2 * M, 52, 10, stroke=1, fill=1)
c.setFillColor(OCRE); c.setFont('Helvetica-Bold', 9.5); c.drawString(M + 12, y - 16, 'Honestidade sobre o estágio')
texto(c, M + 12, y - 29, [
    'É um protótipo funcional com dados fictícios. O plano segue do celular ao relógio, ao colar, ao fone e à Lumi física.',
    'Antes de qualquer promessa terapêutica, vêm o piloto com famílias e o estudo clínico.'], tam=8.8, entre=11.5)
c.setFillColor(MUTED); c.setFont('Helvetica-Oblique', 9)
c.drawCentredString(W / 2, 28, 'Passo a Passo: um passo de cada vez, com a Lumi do lado.')
c.showPage(); c.save()
print(f'PDF gerado: {SAIDA}  ({os.path.getsize(SAIDA) / 1024:.0f} KB)')
