"""Gera a trilha suave do vídeo por síntese (original, sem direitos autorais): pad calmo + arpejo de sinos/piano + reverb.

Uso: python video/ferramentas/gerar_musica.py [duracao_em_segundos]
Grava video/assets/musica.wav (estéreo, 44,1 kHz). A duração padrão vem de video/linha-do-tempo.json.
"""
import json, os, sys, wave
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
rng = np.random.default_rng(7)  # semente fixa: a mesma música sempre

if len(sys.argv) > 1:
    dur = float(sys.argv[1])
else:
    dur = json.load(open(os.path.join(RAIZ, 'linha-do-tempo.json'), encoding='utf-8'))['duracao_total'] + 1.5
N = int(dur * SR)
t = np.arange(N) / SR

def hz(n):  # n = semitons a partir de A4 (440 Hz)
    return 440.0 * 2 ** (n / 12)

# Progressão calma em Ré maior (D): Dmaj7 · Bm7 · Gmaj7 · A  (cada acorde dura 2 compassos de 4/4 a 66 bpm)
BPM = 66
beat = 60 / BPM
compasso = 4 * beat
acordes = [
    [-7, -3, 0, 4],      # D maj7  (D4 F#4 A4 C#5, em semitons a partir de A4)
    [-10, -7, -3, 0],    # B m7    (B3 D4 F#4 A4)
    [-14, -10, -7, -3],  # G maj7  (G3 B3 D4 F#4)
    [-12, -8, -5, 2],    # A add9  (A3 C#4 E4 B4)
]
raizes = [-31, -34, -26, -36]  # baixos (D2 B1 G2 A1)

audio = np.zeros(N)

def envelope(n, a, r, curva=1.0):
    e = np.ones(n)
    na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** curva
    e[-nr:] *= np.linspace(1, 0, nr) ** curva
    return e

def pad(freqs, ini, dur_n, ganho=0.05):
    x = np.zeros(dur_n); tt = np.arange(dur_n) / SR
    for f in freqs:
        for det in (-0.6, 0, 0.7):  # leve desafinação: som largo e quente
            f2 = f * 2 ** (det / 1200)
            x += np.sin(2 * np.pi * f2 * tt + rng.uniform(0, 6.28)) + 0.25 * np.sin(2 * np.pi * 2 * f2 * tt)
    x *= envelope(dur_n, 1.6, 2.2, 1.5) * ganho / (len(freqs) * 3)
    return x

def sino(f, dur_n, ganho=0.07):
    tt = np.arange(dur_n) / SR
    x = (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 2.6)
         + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 4.2)
         + 0.12 * np.sin(2 * np.pi * 3.01 * f * tt) * np.exp(-tt * 6.5))
    ataque = np.minimum(1, tt / 0.006)
    return x * ataque * ganho

def baixo(f, dur_n, ganho=0.09):
    tt = np.arange(dur_n) / SR
    return np.sin(2 * np.pi * f * tt) * envelope(dur_n, 0.08, 1.4, 1.2) * ganho * np.exp(-tt * 0.35)

pos = 0.0; i = 0
while pos < dur:
    ac = acordes[i % 4]; rz = raizes[i % 4]
    ini = int(pos * SR)
    dn = int(min(2 * compasso + 1.2, dur - pos + 1.2) * SR)
    seg = np.zeros(dn)
    seg += pad([hz(n) for n in ac], 0, dn)
    seg += baixo(hz(rz), dn)
    # arpejo suave em colcheias, com variação por compasso (alguns tempos ficam em silêncio: respira)
    padrao = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 3, 1, 2]
    for k, idx in enumerate(padrao):
        if (k + i) % 5 == 4:
            continue
        inicio_nota = int(k * beat / 2 * SR)
        if inicio_nota >= dn:
            break
        nota = hz(ac[idx] + 12)
        nn = min(int(2.6 * SR), dn - inicio_nota)
        seg[inicio_nota:inicio_nota + nn] += sino(nota, nn, 0.05 + 0.012 * ((k % 4) == 0))
    fim = min(N, ini + dn)
    audio[ini:fim] += seg[:fim - ini]
    pos += 2 * compasso; i += 1

# Melodia esparsa por cima, só a partir dos 8 s (deixa a abertura limpa para a voz)
melodia = [(0, 7), (6, 4), (8, 2), (12, 7), (16, 9), (20, 7), (24, 4), (28, 2)]  # (compassos meio, grau)
escala = [-7, -5, -3, -2, 0, 2, 4, 7, 9]  # pentatônica-ish de Ré
for k in range(int(dur // (compasso * 2)) + 1):
    for meio, idx in melodia[(k % 2) * 4:(k % 2) * 4 + 4][:3]:
        ini_s = k * 2 * compasso + (meio % 8) * beat
        if ini_s < 8 or ini_s > dur - 4:
            continue
        i0 = int(ini_s * SR); nn = int(2.8 * SR)
        if i0 + nn > N:
            continue
        audio[i0:i0 + nn] += sino(hz(escala[idx % len(escala)] + 12), nn, 0.035)

# Reverb simples (resposta ao impulso de ruído com decaimento) para um som suave e espaçoso
ir_n = int(2.4 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.3)
ir[:int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
def conv_fft(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[:len(x)]
molhado_e = conv_fft(audio, ir); ir2 = np.roll(ir, 137) * 0.97
molhado_d = conv_fft(audio, ir2)
molhado_e /= np.max(np.abs(molhado_e)) + 1e-9; molhado_d /= np.max(np.abs(molhado_d)) + 1e-9
seco = audio / (np.max(np.abs(audio)) + 1e-9)
esq = 0.72 * seco + 0.38 * molhado_e
dir_ = 0.72 * seco + 0.38 * molhado_d
estereo = np.stack([esq, dir_], axis=1)

# Entrada e saída suaves, e normalização conservadora (a mixagem final baixa a música sob a voz)
fade_in = np.minimum(1, t / 3.0) ** 1.5
fade_out = np.minimum(1, (dur - t) / 4.0) ** 1.5
estereo *= (fade_in * fade_out)[:, None]
estereo *= 0.8 / (np.max(np.abs(estereo)) + 1e-9)

pcm = (estereo * 32767).astype('<i2')
caminho = os.path.join(RAIZ, 'assets', 'musica.wav')
with wave.open(caminho, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f'Música pronta: {dur:.1f}s -> {caminho}')
