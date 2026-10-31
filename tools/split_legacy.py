"""Divide o index.html monolítico em src/ (usado uma vez, na migração para módulos)."""
import re, pathlib, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
css_a = html.index('<style>\n') + len('<style>\n'); css_b = html.index('</style>')
js_a = html.index('<script>\n') + len('<script>\n'); js_b = html.rindex('</script>')
src = root / 'src'; (src / 'css').mkdir(parents=True, exist_ok=True); (src / 'js').mkdir(parents=True, exist_ok=True)
(src / 'css' / 'game.css').write_text(html[css_a:css_b], encoding='utf-8')
(src / 'index.html').write_text(html[:css_a] + '/* @inject:css */\n' + html[css_b:js_a] + '/* @inject:js */\n' + html[js_b:], encoding='utf-8')
js = html[js_a:js_b]
marks = [m.start() for m in re.finditer(r'^/\* =+ .+? =+ \*/$', js, re.M)]
cuts = [0] + marks + [len(js)]
def slug(chunk):
    m = re.match(r'/\* =+ (.+?) =+ \*/', chunk)
    name = m.group(1) if m else 'cabecalho'
    name = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', name).strip('-')
for f in (src / 'js').glob('*.js'): f.unlink()
for i, (a, b) in enumerate(zip(cuts, cuts[1:])):
    if a == b: continue
    chunk = js[a:b]
    (src / 'js' / f'{i:02d}-{slug(chunk)}.js').write_text(chunk, encoding='utf-8')
print('\n'.join(sorted(p.name for p in (src / 'js').glob('*.js'))))
