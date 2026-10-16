"""Gera a trilha animada do vídeo por síntese (original, sem direitos autorais): batida leve, baixo saltitante,
acordes curtos e uma melodia alegre, no estilo de vídeos de apresentação de produto.

Uso: python video/ferramentas/gerar_musica.py [duracao_em_segundos]
Grava video/assets/musica.wav (estéreo, 44,1 kHz). A duração padrão vem de video/linha-do-tempo.json.
A música entra suave nos primeiros segundos e vai ganhando camadas; a mixagem final a deixa baixa sob a voz.
"""
import json, os, sys, wave
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
rng = np.random.default_rng(11)  # semente fixa: a mesma música sempre

if len(sys.argv) > 1:
    dur = float(sys.argv[1])
else:
    dur = json.load(open(os.path.join(RAIZ, 'linha-do-tempo.json'), encoding='utf-8'))['duracao_total'] + 1.5
N = int(dur * SR)
t = np.arange(N) / SR

BPM = 112
beat = 60 / BPM
compasso = 4 * beat


def hz(n):  # n = semitons a partir de A4 (440 Hz)
    return 440.0 * 2 ** (n / 12)


# Progressão alegre em Sol maior: G · D · Em · C (um compasso cada); notas em semitons a partir de A4
acordes = [
    [-2, 2, 5, 10],     # G  (G4 B4 D5 G5)
    [-7, -3, 0, 5],     # D  (D4 F#4 A4 D5)
    [-5, -2, 2, 7],     # Em (E4 G4 B4 E5)
    [-9, -5, -2, 3],    # C  (C4 E4 G4 C5)
]
raizes = [-26, -19, -17, -21]  # baixos: G2 D3 E3 C3
escala = [-2, 0, 2, 5, 7, 10, 12, 14]  # pentatônica de Sol: G A B D E G' A' B'

audio = np.zeros(N)
ducking = np.ones(N)


def somar(sinal, ini_s, ganho=1.0):
    i0 = int(ini_s * SR)
    if i0 >= N or i0 < 0:
        return
    fim = min(N, i0 + len(sinal))
    audio[i0:fim] += sinal[:fim - i0] * ganho


def pluck(f, dur_s, brilho=1.0):
    n = int(dur_s * SR); tt = np.arange(n) / SR
    x = np.zeros(n)
    for h, a in ((1, 1.0), (2, 0.5), (3, 0.33), (4, 0.2)):
        x += a * np.sin(2 * np.pi * h * f * tt) * np.exp(-tt * (7 + h * 4 / brilho))
    x += 0.4 * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3)
    return x * np.minimum(1, tt / 0.004)


def baixo(f, dur_s):
    n = int(dur_s * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt)
    return x * np.exp(-tt * 5.5) * np.minimum(1, tt / 0.005)


def bumbo():
    n = int(0.28 * SR); tt = np.arange(n) / SR
    fase = 2 * np.pi * (45 * tt + 75 * (1 - np.exp(-tt * 22)) / 22)
    return np.sin(fase) * np.exp(-tt * 14)


def chimbau(aberto=False):
    n = int((0.22 if aberto else 0.07) * SR); tt = np.arange(n) / SR
    r = np.diff(rng.standard_normal(n + 1))  # passa-alta simples
    return r * np.exp(-tt * (14 if aberto else 55))


def palma():
    n = int(0.16 * SR); tt = np.arange(n) / SR
    r = np.diff(rng.standard_normal(n + 1))
    # três estalos rápidos juntos dão o "claque" da palma
    env = (np.exp(-tt * 38) + 0.7 * np.exp(-np.maximum(tt - 0.012, 0) * 38) * (tt > 0.012)
           + 0.5 * np.exp(-np.maximum(tt - 0.024, 0) * 38) * (tt > 0.024))
    return r * env


def camadas(s):  # quais instrumentos tocam em cada momento (a música vai crescendo)
    return {
        'chimbau': s >= 2, 'bumbo': s >= 4, 'baixo': s >= 4, 'acorde': s >= 2,
        'palma': s >= 8, 'arpejo': s >= 6,
    }


nc = int(dur // compasso) + 2
for c in range(nc):
    ini = c * compasso
    ac = acordes[c % 4]; rz = raizes[c % 4]
    cam = camadas(ini)
    for b in range(8):                      # colcheias
        s = ini + b * beat / 2
        if s >= dur:
            break
        if cam['chimbau']:
            somar(chimbau(aberto=(b % 4 == 3)), s, 0.10 if b % 2 else 0.06)
        if cam['bumbo'] and b % 2 == 0:
            somar(bumbo(), s, 0.75)
            i0 = int(s * SR)
            if i0 < N:
                curva = 1 - 0.45 * np.exp(-np.arange(min(int(0.18 * SR), N - i0)) / SR * 14)
                ducking[i0:i0 + len(curva)] = np.minimum(ducking[i0:i0 + len(curva)], curva)
        if cam['palma'] and b in (2, 6):
            somar(palma(), s, 0.22)
        if cam['baixo'] and b in (0, 3, 4, 7):
            somar(baixo(hz(rz if b not in (3, 7) else rz + 12), 0.3), s, 0.30)
    if cam['acorde']:                        # acordes curtos no contratempo
        for b in (1.5, 2.5, 3.5):
            for n in ac:
                somar(pluck(hz(n), 0.5, 0.7), ini + b * beat, 0.045)
    if cam['arpejo']:                        # arpejo brilhante em semicolcheias, bem baixinho
        for k in range(16):
            if (k + c) % 4 == 3:
                continue
            somar(pluck(hz(ac[k % 4] + 12), 0.3, 1.2), ini + k * beat / 4, 0.022)

# Melodia alegre a partir dos 12 s (deixa a abertura leve para a voz)
frases = [
    [(0, 4), (1, 5), (1.5, 4), (2, 3), (3, 4)],
    [(0, 5), (1, 6), (1.5, 5), (2, 4), (3, 3)],
    [(0, 3), (0.5, 4), (1, 5), (2, 6), (3, 5)],
    [(0, 4), (1, 3), (1.5, 2), (2, 1), (3, 2)],
]
for c in range(nc):
    ini = c * compasso
    if ini < 12 or ini > dur - 6:
        continue
    for pos, idx in frases[c % 4]:
        somar(pluck(hz(escala[idx % len(escala)] + 12), 0.55, 1.0), ini + pos * beat, 0.055)

audio *= ducking  # o "bombeamento" do bumbo abre espaço e dá energia

# Reverb curto (sala pequena e clara)
ir_n = int(0.7 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 7)


def conv_fft(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[:len(x)]


molhado_e = conv_fft(audio, ir); molhado_d = conv_fft(audio, np.roll(ir, 97))
molhado_e /= np.max(np.abs(molhado_e)) + 1e-9; molhado_d /= np.max(np.abs(molhado_d)) + 1e-9
seco = audio / (np.max(np.abs(audio)) + 1e-9)
estereo = np.stack([0.85 * seco + 0.22 * molhado_e, 0.85 * seco + 0.22 * molhado_d], axis=1)

# Entrada e saída suaves; normalização conservadora (a mixagem final baixa a música sob a voz)
fade_in = np.minimum(1, t / 2.0) ** 1.5
fade_out = np.minimum(1, (dur - t) / 4.0) ** 1.5
estereo *= (fade_in * fade_out)[:, None]
estereo *= 0.8 / (np.max(np.abs(estereo)) + 1e-9)

pcm = (estereo * 32767).astype('<i2')
caminho = os.path.join(RAIZ, 'assets', 'musica.wav')
with wave.open(caminho, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f'Música pronta: {dur:.1f}s -> {caminho}')
