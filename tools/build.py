"""Monta o WORKDAY a partir de src/.

Saídas:
  dist/web/index.html + dist/web/audio/   versão para hospedar (áudio em arquivos separados)
  dist/workday.html                       arquivo único offline (áudio embutido em base64)
  dist/style-guide.html                   guia visual (etapa 2), se design/style-guide.html existir

A fonte VT323 (SIL OFL 1.1, ver fonts/VT323-OFL.txt) vai embutida em todas as saídas: nada depende de internet.

Uso: python3 tools/build.py   (só biblioteca padrão; nenhuma dependência)
"""
import base64, pathlib, re, shutil
root = pathlib.Path(__file__).resolve().parent.parent
src, dist = root / 'src', root / 'dist'

def read_js(folder):
    return ''.join(p.read_text(encoding='utf-8') for p in sorted(folder.glob('*.js')))

def assemble(template, css, js):
    return template.replace('/* @inject:css */\n', css).replace('/* @inject:js */\n', js)

def font_css():
    # @font-face com a fonte em data URI (latin e latin-ext), no lugar do Google Fonts
    faces = []
    for name, rng in (('latin', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'),
                      ('latin-ext', 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF')):
        data = base64.b64encode((root / 'fonts' / f'vt323-{name}.woff2').read_bytes()).decode()
        faces.append(f"@font-face {{ font-family: 'VT323'; font-style: normal; font-weight: 400; font-display: block; src: url(data:font/woff2;base64,{data}) format('woff2'); unicode-range: {rng}; }}")
    return '<style>\n' + '\n'.join(faces) + '\n</style>'

def inline_audio(html, audio_dir):
    # Troca 'audio/x.mp3' por data URI para o arquivo único funcionar offline e sem servidor
    def sub(m):
        f = audio_dir / m.group(1)
        return "'data:audio/mpeg;base64," + base64.b64encode(f.read_bytes()).decode() + "'"
    return re.sub(r"'audio/([\w.-]+\.mp3)'", sub, html)

def inline_wallpapers(html):
    """No arquivo offline, cada src de wallpaper vira um data URI PNG."""
    directory = root / 'assets' / 'workos'
    def sub(m):
        filename = m.group(1)
        data = base64.b64encode((directory / filename).read_bytes()).decode('ascii')
        return "'data:image/png;base64," + data + "'"
    return re.sub(r"'wallpapers/([\w-]+\.png)'", sub, html)

def inline_npc_portraits(html):
    """Embutir retratos PNG na versao offline para não depender do servidor."""
    directory = root / 'assets' / 'npc' / 'portraits'
    def sub(m):
        data = base64.b64encode((directory / m.group(1)).read_bytes()).decode('ascii')
        return "'data:image/png;base64," + data + "'"
    return re.sub(r"'npc-portraits/([a-z0-9-]+\.png)'", sub, html)

def main():
    css = ''.join(p.read_text(encoding='utf-8') for p in sorted((src / 'css').glob('*.css')))
    # Módulos compartilhados (paleta, pixel, sprites, animação, cena) vêm antes do jogo
    page = assemble((src / 'index.html').read_text(encoding='utf-8'), css, read_js(src / 'js' / 'shared') + read_js(src / 'js'))
    page = page.replace('<!-- @inject:fonts -->', font_css())
    web = dist / 'web'
    if dist.exists(): shutil.rmtree(dist)
    (web / 'audio').mkdir(parents=True)
    (web / 'index.html').write_text(page, encoding='utf-8')
    for f in (root / 'audio').glob('*.mp3'): shutil.copy(f, web / 'audio' / f.name)
    wallpapers = root / 'assets' / 'workos'
    if wallpapers.is_dir():
        (web / 'wallpapers').mkdir()
        for f in wallpapers.glob('*.png'):
            shutil.copy(f, web / 'wallpapers' / f.name)
    # Catalogo de NPCs: PNGs em separado na web, prontos para uso futuro.
    npc_dir = root / 'assets' / 'npc' / 'portraits'
    if npc_dir.is_dir():
        (web / 'npc-portraits').mkdir()
        for f in npc_dir.glob('*.png'):
            shutil.copy(f, web / 'npc-portraits' / f.name)
    (web / '.nojekyll').write_text('')   # GitHub Pages: servir os arquivos como estão
    (dist / 'workday.html').write_text(inline_npc_portraits(inline_wallpapers(inline_audio(page, root / 'audio'))), encoding='utf-8')
    guide = root / 'design' / 'style-guide.html'
    if guide.exists():
        g = guide.read_text(encoding='utf-8')
        g = g.replace('<!-- @inject:fonts -->', font_css())
        g = g.replace('/* @inject:shared-js */\n', read_js(src / 'js' / 'shared') if (src / 'js' / 'shared').exists() else '')
        (dist / 'style-guide.html').write_text(g, encoding='utf-8')
    for p in sorted(dist.rglob('*')):
        if p.is_file(): print(f'{p.relative_to(root)}  {p.stat().st_size / 1024:,.0f} KB')

if __name__ == '__main__':
    main()
