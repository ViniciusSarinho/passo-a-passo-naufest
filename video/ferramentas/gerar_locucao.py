"""Gera a locução da Lumi (edge-tts, voz neural) frase por frase e calcula a linha do tempo do vídeo.

Uso (na pasta do projeto):  python video/ferramentas/gerar_locucao.py
Lê video/roteiro.json, grava video/assets/voz/<cena>-<n>.mp3 e video/linha-do-tempo.json
(início e duração de cada cena e de cada frase), que o montador do vídeo usa.
Para medir a duração dos áudios usa o FFmpeg (imageio-ffmpeg ou o que estiver no PATH).
"""
import asyncio, json, os, re, shutil, subprocess, sys

import edge_tts

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOZ_DIR = os.path.join(RAIZ, 'assets', 'voz')
os.makedirs(VOZ_DIR, exist_ok=True)


def ffmpeg():
    achado = shutil.which('ffmpeg')
    if achado:
        return achado
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def duracao(caminho):
    r = subprocess.run([ffmpeg(), '-i', caminho], capture_output=True, text=True)
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', r.stderr)
    h, mi, s = int(m.group(1)), int(m.group(2)), float(m.group(3))
    return h * 3600 + mi * 60 + s


async def principal():
    roteiro = json.load(open(os.path.join(RAIZ, 'roteiro.json'), encoding='utf-8'))
    refazer = '--refazer' in sys.argv
    tarefas = []
    for c in roteiro['cenas']:
        for i, f in enumerate(c['frases']):
            f['arquivo'] = f"{c['id']}-{i + 1}.mp3"
            caminho = os.path.join(VOZ_DIR, f['arquivo'])
            if refazer or not os.path.exists(caminho) or os.path.getsize(caminho) == 0:
                tarefas.append((f['fala'], caminho))
    sem = asyncio.Semaphore(4)

    async def gerar(texto, caminho):
        async with sem:
            for t in range(3):
                try:
                    await edge_tts.Communicate(texto, roteiro['voz'], rate=roteiro['ritmo']).save(caminho)
                    return
                except Exception as e:
                    if t == 2:
                        raise
                    await asyncio.sleep(1.5)

    await asyncio.gather(*(gerar(t, c) for t, c in tarefas))

    # Linha do tempo: frases em sequência, com pausas curtas; cada cena dura até o fim da última frase
    t = 0.6  # respiro inicial
    tl = {'voz': roteiro['voz'], 'cenas': []}
    for c in roteiro['cenas']:
        ini = t
        frases = []
        for f in c['frases']:
            d = duracao(os.path.join(VOZ_DIR, f['arquivo']))
            frases.append({'texto': f['texto'], 'arquivo': f['arquivo'], 'inicio': round(t, 3), 'duracao': round(d, 3)})
            t += d + roteiro['pausa_entre_frases']
        t = t - roteiro['pausa_entre_frases'] + roteiro['pausa_entre_cenas']
        tl['cenas'].append({'id': c['id'], 'inicio': round(ini, 3), 'duracao': round(t - ini, 3), 'frases': frases})
    tl['duracao_total'] = round(t - roteiro['pausa_entre_cenas'] + roteiro['cauda_final'], 3)
    tl['cenas'][-1]['duracao'] = round(tl['duracao_total'] - tl['cenas'][-1]['inicio'], 3)
    json.dump(tl, open(os.path.join(RAIZ, 'linha-do-tempo.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    m, s = divmod(tl['duracao_total'], 60)
    print(f"Locução pronta: {int(m)}:{s:04.1f} no total")
    for c in tl['cenas']:
        print(f"  {c['id']:<10} {c['inicio']:6.1f}s  +{c['duracao']:5.1f}s")


asyncio.run(principal())
