"""Verifica (e, com --fix, corrige) cores fora da paleta WORKDAY em src/.

Regra do guia visual: paleta fechada, contorno em tinta #2a1f2d e nunca preto puro.
- Cores hex e rgb()/rgba() fora da paleta viram a cor mais próxima da paleta (distância perceptual CIE Lab).
- Preto translúcido (sombras) vira tinta translúcida, mantendo a opacidade.
- Cores translúcidas que não são preto (luz, brilho, véus de hora do dia) ficam como estão.
- Exceções documentadas: luz do céu calculada por hora (Office.light / amanhecer do quarto), que são luz e não material.

Uso: python3 tools/palette.py          (relatório; termina com erro se houver cor fora da paleta)
     python3 tools/palette.py --fix    (corrige no lugar)
"""
import pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
PALETTE = {c.lower() for c in re.findall(r"'(#[0-9a-fA-F]{6})'", (src / 'js' / 'shared' / '10-palette.js').read_text(encoding='utf-8'))}
INK = (42, 31, 45)
# Luz do céu ao longo do dia: cores de iluminação, fora da regra de material
EXEMPT = {'#c9ecf7', '#8fcbe8', '#ffe0a8', '#f6a96c', '#e48a6a', '#6d4f8c', '#f6c7b8'}

def rgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def lab(c):
    def lin(v):
        v /= 255
        return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4
    r, g, b = map(lin, c)
    x, y, z = (r * .4124 + g * .3576 + b * .1805) / .95047, r * .2126 + g * .7152 + b * .0722, (r * .0193 + g * .1192 + b * .9505) / 1.08883
    f = lambda t: t ** (1 / 3) if t > .008856 else 7.787 * t + 16 / 116
    return 116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))

PAL_LAB = [(p, lab(rgb(p))) for p in sorted(PALETTE)]
def de94(a, b):
    # CIE94: pesa menos as diferenças de croma e matiz em cores saturadas (evita trocar azul por roxo)
    (l1, a1, b1), (l2, a2, b2) = a, b
    c1, c2 = (a1 * a1 + b1 * b1) ** .5, (a2 * a2 + b2 * b2) ** .5
    dl, dc = l1 - l2, c1 - c2
    dh2 = max(0, (a1 - a2) ** 2 + (b1 - b2) ** 2 - dc * dc)
    return dl * dl + (dc / (1 + .045 * c1)) ** 2 + dh2 / (1 + .015 * c1) ** 2
def nearest(c):
    l = lab(c)
    return min(PAL_LAB, key=lambda e: de94(l, e[1]))[0]

HEX = re.compile(r'#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
RGBA = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)')

def files():
    for p in sorted(list((src / 'css').glob('*.css')) + list((src / 'js').rglob('*.js'))):
        if p.name != '10-palette.js': yield p

def fix_text(s, found):
    def hx(m):
        h = m.group(0).lower()
        full = '#' + ''.join(c * 2 for c in h[1:]) if len(h) == 4 else h
        if full in PALETTE or full in EXEMPT: return m.group(0)
        n = nearest(rgb(full)); found.append((h, n)); return n
    def ra(m):
        c = tuple(int(m.group(i)) for i in (1, 2, 3)); a = m.group(4)
        if c in ((0, 0, 0), (29, 29, 27)): t = INK
        elif a is not None and float(a) < 1: return m.group(0)        # luz, brilho e tintas translúcidas não são material
        elif '#%02x%02x%02x' % c in PALETTE or c == (255, 255, 255): return m.group(0)
        else: t = rgb(nearest(c))
        found.append(('rgb%s' % (c,), '#%02x%02x%02x' % t))
        return f'rgba({t[0]},{t[1]},{t[2]},{a})' if a is not None else 'rgb(%d,%d,%d)' % t
    return RGBA.sub(ra, HEX.sub(hx, s))

def main():
    fix, total = '--fix' in sys.argv, 0
    for p in files():
        s = p.read_text(encoding='utf-8'); found = []
        t = fix_text(s, found)
        if found:
            total += len(found)
            print(f'{p.relative_to(root)}: {len(found)} cor(es) fora da paleta' + (' — corrigido' if fix else ''))
            for a, b in sorted(set(found))[:8 if not fix else 0]: print(f'    {a} -> {b}')
            if fix: p.write_text(t, encoding='utf-8')
    print('paleta: ok' if not total else f'paleta: {total} ocorrência(s)' + ('' if fix else ' (rode com --fix)'))
    sys.exit(1 if total and not fix else 0)

if __name__ == '__main__':
    main()
