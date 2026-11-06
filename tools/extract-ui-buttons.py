"""Recorta assets/ui/buttons.png (original, nunca alterado) de forma correta.

A folha original NÃO está numa grade de 44x36: cada botão tem 40x32 px e eles ficam a ~43 px de distância,
com deriva em x/y. O recorte por grade antiga errava a posição de cada botão. Aqui:
  1. acha cada botão por componente conexo (alfa > 40);
  2. gera assets/ui/buttons-grid.png: os 24 botões inteiros em grade exata 40x32 (6x4);
  Cada botão é usado INTEIRO (a arte já traz moldura e bisel); não se coloca botão dentro de botão.
Ordem (linha a linha): atender, recusar, ok, não, curtir, não curtir / alerta, info, ajuda, voltar, avançar, início /
salvar, pasta, lixeira, ajustes, estrela, e-mail / tocar, pausar, parar, volume, mudo, atualizar.
"""
from pathlib import Path
from PIL import Image
import numpy as np, re, json
ROOT = Path(__file__).resolve().parents[1]
NAMES = ['accept', 'decline', 'ok', 'no', 'like', 'dislike', 'alert', 'info', 'help', 'back', 'forward', 'home',
         'save', 'folder', 'trash', 'settings', 'star', 'mail', 'play', 'pause', 'stop', 'volume', 'mute', 'refresh']
src = Image.open(ROOT / 'assets/ui/buttons.png').convert('RGBA'); arr = np.array(src); H, W = arr.shape[:2]
opaque = arr[:, :, 3] > 40
seen = np.zeros_like(opaque); comps = []
for y in range(H):
    for x in range(W):
        if opaque[y, x] and not seen[y, x]:
            st = [(y, x)]; seen[y, x] = 1; xs = []; ys = []
            while st:
                cy, cx = st.pop(); xs.append(cx); ys.append(cy)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < H and 0 <= nx < W and opaque[ny, nx] and not seen[ny, nx]: seen[ny, nx] = 1; st.append((ny, nx))
            comps.append((min(xs), min(ys), max(xs) + 1, max(ys) + 1))
comps.sort(key=lambda c: (round(c[1] / 36), c[0])); assert len(comps) == 24, len(comps)
# paleta fechada
pal_js = (ROOT / 'src/js/shared/10-palette.js').read_text(encoding='utf-8')
pal = [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in re.findall(r"'(#[0-9a-fA-F]{6})'", pal_js.split('const WD_PAL =')[0])]
P = np.array(pal)
def near(c): return tuple(P[np.argmin(((P - np.array(c[:3])) ** 2).sum(1))])
CW, CH, GW, GH = 40, 32, 30, 26
grid = Image.new('RGBA', (CW * 6, CH * 4)); gl = Image.new('RGBA', (GW * 6, GH * 4)); man = []
for i, (x0, y0, x1, y1) in enumerate(comps):
    cell = src.crop((x0, y0, x1, y1)); w, h = cell.size
    grid.paste(cell, ((i % 6) * CW + (CW - w) // 2, (i // 6) * CH + (CH - h) // 2))
    gi = cell
    man.append(dict(name=NAMES[i], source=[x0, y0, x1, y1], size=[w, h], cell=[(i % 6) * CW, (i // 6) * CH]))
grid.save(ROOT / 'assets/ui/buttons-grid.png')
(ROOT / 'assets/ui/buttons-grid.json').write_text(json.dumps(man, ensure_ascii=False, indent=1) + '\n')
print('ok', grid.size)
