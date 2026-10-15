"""Gera a voz neural do Lumi para todas as falas fixas do app (edge-tts, vozes neurais da Microsoft).

Uso:
  1. No app (app.html), abra o console do navegador e rode:
       copy(JSON.stringify(todasAsFalas().map(f => ({ id: f.id, grupo: f.grupo, texto: f.texto, essencial: f.essencial }))))
     e cole o resultado num arquivo, por exemplo falas-lista.json.
  2. pip install edge-tts
  3. python ferramentas/gerar_voz_lumi.py falas-lista.json            (voz Thalita)
     python ferramentas/gerar_voz_lumi.py falas-lista.json --voz pt-BR-FranciscaNeural

Grava audio/lumi/<id>.mp3 e audio/lumi/falas.json, o mesmo formato que o Estúdio de voz exporta.
O app passa a tocar esses áudios no lugar da voz sintética do navegador. Gravações humanas feitas no
Estúdio continuam tendo prioridade no aparelho em que foram gravadas.

Observação: o texto de cada fala é enviado ao serviço de voz da Microsoft para gerar o áudio.
As falas são fixas e fictícias (não há dado pessoal real).
"""
import argparse, asyncio, json, os, sys
from datetime import datetime, timezone

import edge_tts

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(RAIZ, 'audio', 'lumi')


async def gerar(fala, voz, ritmo, tom, refazer):
    arquivo = f"{fala['id']}.mp3"
    caminho = os.path.join(PASTA, arquivo)
    if refazer or not os.path.exists(caminho) or os.path.getsize(caminho) == 0:
        for tentativa in range(3):
            try:
                await edge_tts.Communicate(fala['texto'], voz, rate=ritmo, pitch=tom).save(caminho)
                break
            except Exception as erro:  # rede instável: tenta de novo
                if tentativa == 2:
                    print(f"  falhou: {fala['id']}: {erro}", file=sys.stderr)
                    return None
                await asyncio.sleep(1.5)
    return {'id': fala['id'], 'arquivo': arquivo, 'texto': fala['texto'], 'grupo': fala['grupo']}


async def principal():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('lista', help='JSON com as falas (id, grupo, texto)')
    p.add_argument('--voz', default='pt-BR-ThalitaMultilingualNeural')
    p.add_argument('--ritmo', default='-6%', help='velocidade, ex.: -6%% (um pouco mais devagar)')
    p.add_argument('--tom', default='+0Hz')
    p.add_argument('--refazer', action='store_true', help='gera de novo mesmo os áudios que já existem')
    a = p.parse_args()

    falas = json.load(open(a.lista, encoding='utf-8'))
    os.makedirs(PASTA, exist_ok=True)
    sem = asyncio.Semaphore(4)

    async def com_limite(f):
        async with sem:
            return await gerar(f, a.voz, a.ritmo, a.tom, a.refazer)

    feitas = [r for r in await asyncio.gather(*(com_limite(f) for f in falas)) if r]
    saida = {'voz': f'Lumi · {a.voz} (voz neural, edge-tts)', 'gerado': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'falas': feitas}
    json.dump(saida, open(os.path.join(PASTA, 'falas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f'{len(feitas)} de {len(falas)} falas geradas em {PASTA}')


asyncio.run(principal())
