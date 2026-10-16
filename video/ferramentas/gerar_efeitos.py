"""Gera os efeitos sonoros suaves das transições do vídeo, por síntese (originais, sem direitos autorais).

Uso: python video/ferramentas/gerar_efeitos.py
Grava em video/assets/sfx/: transicao.wav (respiro de ar suave, sem batida), brilho.wav (duas notas de sininho
bem leves, para os destaques da IA) e final.wav (acorde macio para o fecho).
Todos saem com volume baixo e ataque lento: nunca competem com a voz da Lumi.
"""
import os, wave
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RAIZ, 'assets', 'sfx')
os.makedirs(DEST, exist_ok=True)
SR = 44100
rng = np.random.default_rng(5)


def gravar(nome, x, pico):
    x = x / (np.max(np.abs(x)) + 1e-9) * pico
    pcm = (np.stack([x, x], axis=1) * 32767).astype('<i2')
    with wave.open(os.path.join(DEST, nome), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('ok', nome, f'{len(x) / SR:.2f}s')


def passa_baixa(x, k):  # média móvel repetida: corte suave, sem chiado
    for _ in range(3):
        x = np.convolve(x, np.ones(k) / k, mode='same')
    return x


# Transição: um respiro de ar bem abafado que sobe devagar e some (sem "tum", sem chiado agudo)
n = int(1.0 * SR); tt = np.arange(n) / SR
r = rng.standard_normal(n)
ar = passa_baixa(r, 40) * 0.6 + passa_baixa(r, 18) * 0.4
ar = ar * np.sin(np.pi * np.clip(tt / 1.0, 0, 1)) ** 2.2
# uma nota grave e macia por baixo dá corpo, também com entrada e saída lentas
ton = np.sin(2 * np.pi * 196.0 * tt) * np.sin(np.pi * np.clip(tt / 1.0, 0, 1)) ** 2.5 * 0.5
gravar('transicao.wav', ar / (np.max(np.abs(ar)) + 1e-9) + ton, 0.5)


def sino(f, dur, ganho=1.0):
    m = int(dur * SR); x = np.arange(m) / SR
    y = (np.sin(2 * np.pi * f * x) + 0.2 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x * 4)) * np.exp(-x * 3.2)
    return y * np.minimum(1, x / 0.03) * ganho  # ataque de 30 ms: sem "clique"


# Brilho: duas notas calmas (Sol e Ré agudos), bem espaçadas
total = np.zeros(int(1.8 * SR))
for k, f in enumerate((587.3, 880.0)):
    s = sino(f, 1.4, 1.0 - 0.3 * k); i0 = int(k * 0.22 * SR)
    total[i0:i0 + len(s)] += s[:len(total) - i0]
gravar('brilho.wav', total, 0.45)

# Final: acorde macio de Sol maior, entrando devagar
total = np.zeros(int(2.8 * SR))
for f in (196.0, 392.0, 493.9, 587.3, 783.99):
    m = int(2.6 * SR); x = np.arange(m) / SR
    s = np.sin(2 * np.pi * f * x) * np.minimum(1, x / 0.25) * np.exp(-x * 1.1)
    total[:m] += s
gravar('final.wav', total, 0.45)
