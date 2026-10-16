"""Gera os efeitos sonoros simples das transições do vídeo, por síntese (originais, sem direitos autorais).

Uso: python video/ferramentas/gerar_efeitos.py
Grava em video/assets/sfx/: transicao.wav (sopro curto que sobe), brilho.wav (chime de três notas, para os
destaques da IA) e final.wav (acorde brilhante para o fecho).
"""
import os, wave
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RAIZ, 'assets', 'sfx')
os.makedirs(DEST, exist_ok=True)
SR = 44100
rng = np.random.default_rng(5)


def gravar(nome, x, pico=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * pico
    pcm = (np.stack([x, x], axis=1) * 32767).astype('<i2')
    with wave.open(os.path.join(DEST, nome), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('ok', nome, f'{len(x) / SR:.2f}s')


def suavizar(r, k):  # média móvel: passa-baixa simples
    return np.convolve(r, np.ones(k) / k, mode='same')


# Transição: sopro de ruído que "abre" (passa-baixa com corte subindo) e some
n = int(0.75 * SR); tt = np.arange(n) / SR
r = rng.standard_normal(n)
sopro = np.zeros(n)
for k, fatia in ((60, (0, 0.25)), (28, (0.2, 0.45)), (12, (0.4, 0.65)), (5, (0.6, 1.0))):
    i0, i1 = int(fatia[0] * n), int(fatia[1] * n)
    sopro[i0:i1] += suavizar(r, k)[i0:i1]
env = np.sin(np.pi * np.clip(tt / 0.75, 0, 1)) ** 1.6
sopro *= env
# um "tum" macio no fim marca a chegada da próxima cena
tum_n = int(0.3 * SR); ttt = np.arange(tum_n) / SR
tum = np.sin(2 * np.pi * (70 + 60 * np.exp(-ttt * 30)) * ttt) * np.exp(-ttt * 12)
i_tum = int(0.5 * SR); seg = min(tum_n, n - i_tum)
sopro[i_tum:i_tum + seg] += tum[:seg] * 2.2
gravar('transicao.wav', sopro / (np.max(np.abs(sopro)) + 1e-9) * 1.0, 0.7)


def sino(f, dur, ganho=1.0):
    m = int(dur * SR); x = np.arange(m) / SR
    y = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x * 3)
         + 0.15 * np.sin(2 * np.pi * 3.01 * f * x) * np.exp(-x * 6)) * np.exp(-x * 4.2)
    return y * np.minimum(1, x / 0.004) * ganho


# Brilho: três notas ascendentes rápidas (Sol, Si, Ré), como um "ding" de descoberta
total = np.zeros(int(1.4 * SR))
for k, f in enumerate((784.0, 987.8, 1174.7)):
    s = sino(f, 1.0, 1.0 - 0.15 * k); i0 = int(k * 0.09 * SR)
    total[i0:i0 + len(s)] += s[:len(total) - i0]
gravar('brilho.wav', total, 0.7)

# Final: acorde de Sol maior com sete (brilhante) e uma cintilância de notas agudas
total = np.zeros(int(2.4 * SR))
for f in (392.0, 493.9, 587.3, 783.99, 1174.7):
    s = sino(f, 2.2, 0.8); total[:len(s)] += s
for k, f in enumerate((1568.0, 1975.5, 2349.3, 3135.9)):
    s = sino(f, 0.8, 0.35); i0 = int((0.25 + k * 0.07) * SR); total[i0:i0 + len(s)] += s[:len(total) - i0]
gravar('final.wav', total, 0.7)
