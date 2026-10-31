/* ================= Pixel art ================= */
const PAL = {
  k: '#2a1f2d', w: '#ffffff', W: '#fbf3e2', x: '#c7b595',
  r: '#ef4b3f', R: '#a8262a', q: '#ff9d86', g: '#6fbf73', G: '#2f8a45', t: '#b8d98a',
  y: '#f4c15d', Y: '#c98a2e', u: '#ffe7a3', b: '#44609f', B: '#44609f', v: '#c3d5ff',
  c: '#8a5420', C: '#6e3b26', o: '#d48a4f', O: '#a8623a', s: '#f2c4a0', S: '#d99a76',
  h: '#6e3b26', H: '#2a1f2d', n: '#2b2340', N: '#2a1f2d', e: '#9aa0ab', l: '#c7b595', L: '#8f7d63', d: '#626875', p: '#ff9d86',
};
const SPRITE_CACHE = new Map();
function spriteMaster(rows, pal) {
  const key = rows.join('|') + '#' + Object.entries(pal).map(([k, v]) => k + v).join('');
  let m = SPRITE_CACHE.get(key);
  if (!m) {
    m = document.createElement('canvas');
    m.width = Math.max(...rows.map(r => r.length)); m.height = rows.length;
    const x = m.getContext('2d');
    rows.forEach((row, j) => [...row].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); } }));
    SPRITE_CACHE.set(key, m);
  }
  return m;
}
// Escala inteira (regra do guia): cada pixel da arte ocupa um número inteiro de pixels físicos, em qualquer zoom
function pxScale(scale) { const dpr = window.devicePixelRatio || 1; return Math.max(1, Math.round(scale * dpr)) / dpr; }
function pxSize(c, scale) { const s = pxScale(scale); c.style.width = c.width * s + 'px'; c.style.height = c.height * s + 'px'; return c; }
// Maior escala inteira que cabe numa caixa (largura, altura em px CSS); refeita quando a janela muda de tamanho
const PX_FITS = new Set();
function pxRefit(c) {
  const [w, h] = c._box(), dpr = window.devicePixelRatio || 1;
  const n = Math.max(1, Math.floor(Math.min(w * dpr / c.width, h * dpr / c.height)));
  c.style.width = c.width * n / dpr + 'px'; c.style.height = c.height * n / dpr + 'px';
}
function pxFit(c, box) { c._box = box; PX_FITS.add(c); pxRefit(c); return c; }
addEventListener('resize', () => { for (const c of PX_FITS) { if (c.isConnected) { c._on = true; pxRefit(c); } else if (c._on) PX_FITS.delete(c); } });
function sprite(rows, scale = 3, pal = PAL) {
  if (SPR_V2.has(rows)) pal = WD_PAL;          // redesenhados na grade nova usam a paleta WORKDAY
  const m = spriteMaster(rows, pal), c = document.createElement('canvas');
  c.className = 'sp';
  c.width = m.width; c.height = m.height;
  c.getContext('2d').drawImage(m, 0, 0);
  return pxSize(c, scale);
}
const SPR = {
  phone: ['...kkkkkkkkkk...', '.kkrrrrrrrrrrkk.', 'krrqqrrrrrrrrRrk', 'kRRkkkkkkkkkkRRk', '.kk..kkkkkk..kk.', '....krrrrrrk....',
          '...krwrwrwrRk...', '..krrrrrrrrrRk..', '..krwrwrwrrrRk..', '..krrrrrrrrrRk..', '..krwrwrwrrrRk..', '..kRRRRRRRRRRk..', '..kkkkkkkkkkkk..'],
  coffee: ['....e...e.......', '.....e...e......', '....e...e.......', '.....e...e......', '................', '..kkkkkkkkkk....',
           '..kCccccccCk....', '..kwwwwwwwWkkk..', '..kwwwwwwwWk.k..', '..kwrrrrrwWk.k..', '..kwrqrrrwWkkk..', '..kwrrrrrwWk....',
           '..kwwwwwwwWk....', '...kWWWWWWk.....', 'kkkkkkkkkkkkkk..', '.kxxxxxxxxxxk...'],
  tea: ['....e...e.......', '.....e...e......', '....e...e.......', '................', '..kkkkkkkkkk....', '..koooooooOk....',
        '..kgggggggGkkk..', '..kgtggggGGk.k..', '..kgtgggggGk.k..', '..kggggggGGkkk..', '..kggggggGGk.ky.', '..kgggggggGk..k.',
        '...kGGGGGGk.....', 'kkkkkkkkkkkkkk..', '.kxxxxxxxxxxk...'],
  virus: ['...t..t..t...', '....g.g.g....', 't..kkkkkkk..t', '.gkgtggggGkg.', '..kgwkggwkGk.', 'ggkggggggGGkg',
          '..kggkkkkgGk.', '.gkGggggGGGkg', 't..kkkkkkk..t', '....g.g.g....', '...t..t..t...'],
  printer: ['....kkkkkkkk....', '....kwwwwwwk....', '....kwkkkkwk....', '.kkkkkkkkkkkkkk.', 'kllllllllllllllk', 'klllllllllltlrlk',
            'kLLLLLLLLLLLLLLk', 'kkkkkkkkkkkkkkkk', '.kdkwwwwwwwwkdk.', '.kdkwkkkkkkwkdk.', '.kdkwwwwwwwwkdk.', '.kdkwkkkkwwwkdk.', '.kkkkkkkkkkkkkk.'],
  camera: ['.kkkkkkkkk....', '.kbbbbbbbbk.kk', '.kbvvbbbbbkkbk', '.kbvkkkbbbkbbk', '.kbbkvkbbbkbbk', '.kbbkkkbbbkkbk', '.kBBBBBBBBk.kk', '.kkkkkkkkkk...'],
  hourglass: ['kkkkkkkkkkkk', 'kCCCCCCCCCCk', '.kwyyyyyywk.', '.kwyyyyyywk.', '..kwyyyywk..', '...kwyywk...', '....kwyk....',
              '....kwyk....', '...kw.ywk...', '..kw..y.wk..', '.kw..yyy.wk.', '.kwyyyyyywk.', 'kCCCCCCCCCCk', 'kkkkkkkkkkkk'],
  trash: ['....kkkk....', '....kLLk....', 'kkkkkkkkkkkk', 'kllllllllllk', 'kkkkkkkkkkkk', '.klLllLllLk.', '.klLllLllLk.',
          '.klLllLllLk.', '.klLllLllLk.', '.klLllLllLk.', '.kLLLLLLLLk.', '..kkkkkkkk..'],
  mail: ['kkkkkkkkkkkkkk', 'kWkwwwwwwwwkWk', 'kwWkwwwwwwkWwk', 'kwwWkwwwwkWwwk', 'kwwwWkrrkWwwwk', 'kwwwwWkkWwwwwk',
         'kwwwwwwwwwwwwk', 'kxxxxxxxxxxxxk', 'kkkkkkkkkkkkkk'],
  headphones: ['...kkkkkkkk...', '..kLLLLLLLLk..', '.kLk......kLk.', '.kLk......kLk.', 'kLk........kLk', 'kkkk......kkkk',
               'krrRk....kRrrk', 'krqRk....kRqrk', 'krrRk....kRrrk', 'kkkkk....kkkkk'],
  shield: ['kkkkkkkkkkkk', 'kvbbbbbbbbBk', 'kvbbbwwbbbBk', 'kvbbbwwbbbBk', 'kvbwwwwwwbBk', 'kvbwwwwwwbBk', 'kvbbbwwbbbBk',
           '.kvbbwwbbBk.', '.kvbbbbbbBk.', '..kvbbbbBk..', '...kvbbBk...', '....kBBk....', '.....kk.....'],
  postit: ['kkkkkkkkkkkk', 'kuuuuuuuuuuk', 'kyyyyyyyyyYk', 'kykkkkkkyyYk', 'kyyyyyyyyyYk', 'kykkkkkyyyYk', 'kyyyyyyyyyYk',
           'kykkkkkkkyYk', 'kyyyyyyyyYYk', 'kyyyyyyyYYk.', 'kYYYYYYYYk..', 'kkkkkkkkk...'],
  plant: ['......g.........', '....g.gg..g.....', '...ggtgGg.gg....', '..gtggGgggtg....', '.gtgGggtgGggg...', '..ggGgtggGgg....',
          '...gGggGgggG....', '....GgGGgG......', '......GG........', '..kkkkkkkkkk....', '..koooooooOk....', '..kOOOOOOOOk....',
          '...kooooooOk....', '...koooooOOk....', '....kooooOk.....', '....kkkkkkk.....'],
  frame: ['kkkkkkkkkkkkkk', 'kyyyyyyyyyyyyk', 'kyYkkkkkkkkYyk', 'kyYkvvvvuvkYyk', 'kyYkvhvvhvkYyk', 'kyYkvsvvsvkYyk',
          'kyYkbbgbbgkYyk', 'kyYkggggggkYyk', 'kyYkkkkkkkkYyk', 'kyYYYYYYYYYYyk', 'kkkkkkkkkkkkkk', '......kk......', '....kkkkkk....'],
  lamp: ['....kkkkk.....', '...kyyyuyk....', '..kyyyyyyuk...', '.kyyyyyyyyyk..', '.kYYYYYYYYYk..', '..kkkkkkkkk...', '....kLk.......',
         '.....kLk......', '......kLk.....', '.....kLk......', '....kLk.......', '...kLk........', '..kkkkkkk.....', '.kLLLLLLLk....', '.kkkkkkkkk....'],
  monitor: ['kkkkkkkkkkkkkkkk', 'kLLLLLLLLLLLLLLk', 'kLkkkkkkkkkkkkLk', 'kLkBbbbbbbbbbkLk', 'kLkbvvbbbbbbbkLk', 'kLkbvbtttbbbbkLk',
            'kLkbbbbbtttbbkLk', 'kLkbbtttbbbbbkLk', 'kLkbbbbbbbbbbkLk', 'kLkkkkkkkkkkkkLk', 'kLLLLLLLrLLLLLLk', 'kkkkkkkkkkkkkkkk',
            '......kLLk......', '....kkkkkkkk....'],
  cat: ['.k.......k....', '.kk.....kk....', '.kokkkkkok....', '.kooooooook...', '.koyooooyok...', '.kooopooooko..', '..kooooooook..',
        '..kOooooOook..', '.kooooooooook.', '.kooOoooOoook.k', '.kooooooooookk.', '.kooooooooook.k', '.kOkOkkOkOkkk..'],
  trophy: ['..kkkkkkkkkk..', 'kkkyuyyyyyYkkk', 'k.kyuyyyyyYk.k', 'k.kyuyyyyyYk.k', 'kk.kyyyyyYk.kk', '..kkyyyyyYkk..', '....kyyyYk....',
           '.....kyYk.....', '.....kyYk.....', '....kyyyYk....', '...kkkkkkkk...', '...kCcccccCk..', '...kCcyycCCk..', '...kkkkkkkkk..'],
  badge: ['..b....b..', '...b..b...', '....kk....', '.kkkkkkkk.', '.kwwwwwwk.', '.kwhhwWWk.', '.kwsswxxk.', '.kwnnwxxk.', '.kwwwwwwk.', '.kbbbbbbk.', '.kkkkkkkk.'],
  mug: ['.kkkkkkkk...', '.kCCCCCCk...', '.krrrrrrRkkk', '.krwrrrrRk.k', '.krrqrrrRk.k', '.krrrrrrRkkk', '.krrrrrrRk..', '..kRRRRRk...', '..kkkkkkk...'],
  nameplate: ['..kkkkkkkkkkkkkk..', '.kyuuuuuuuuuuuuyk.', 'kyykykkykkkykykyYk', 'kyyyyyyyyyyyyyyyYk', 'kYYYYYYYYYYYYYYYYk', 'kCCCCCCCCCCCCCCCCk', 'kkkkkkkkkkkkkkkkkk'],
  chair: ['..kkkkkkkk..', '.knnnnnnnnk.', '.knknnnnknk.', '.knnnnnnnnk.', '.knknnnnknk.', '.knnnnnnnnk.', '.kNnnnnnnNk.', 'kkkkkkkkkkkk',
          'knnnnnnnnnnk', 'kNNNNNNNNNNk', 'kkkkkkkkkkkk', '.....kk.....', '.....kk.....', '..kkkkkkkk..', '.kLk.kk.kLk.'],
  crown: ['k....k....k.', 'ky..kyk..yk.', 'kyk.kuk.kyk.', 'kyyyyuyyyyk.', 'kyyyyyyyyyk.', 'kyryyByygyk.', 'kYYYYYYYYYk.', 'kkkkkkkkkkk.'],
  finger: ['...kkkkkk...', '..k......k..', '.k..kkkk..k.', 'k..k....k..k', 'k.k..kk..k.k', 'k.k.k..k.k.k', 'k.k.k..k.k.k',
           'k.k.k.k..k.k', 'k.k..k..k..k', 'k..k...k..k.', '.k..kkk..k..', '..k.....k...', '...kkkkk....'],
  scanner: ['kkkkkkkkkkkkkkkk', 'kdLLLLLLLLLLLLdk', 'kdkkkkkkkkkkkkdk', 'kdkRrrrqrrrrRkdk', 'kdkkkkkkkkkkkkdk', 'kddddddddddddddk', 'kkkkkkkkkkkkkkkk'],
  bill: ['kkkkkkkkkkkkkkkk', 'kgggggggggggggGk', 'kgtggggkkggggtGk', 'kggggkgttgkggggk', 'kggggkttttkggggk', 'kggggkgttgkggggk', 'kgtggggkkggggtGk', 'kGGGGGGGGGGGGGGk', 'kkkkkkkkkkkkkkkk'],
  card: ['kkkkkkkkkkkkkkkk', 'kvvvvvvvvvvvvvBk', 'kkkkkkkkkkkkkkkk', 'kbbbbbbbbbbbbbBk', 'kbuyybbbbbbbbbBk', 'kbyYybbbbbbbbbBk', 'kbbbbbbbbwwwwbBk', 'kBBBBBBBBBBBBBBk', 'kkkkkkkkkkkkkkkk'],
  paycel: ['.kkkkkkk.', 'kdddddddk', 'kdvvvvvdk', 'kdvkkkvdk', 'kdvkwkvdk', 'kdvkkkvdk', 'kdvvvvvdk', 'kdvwwwvdk', 'kdvvvvvdk', 'kdddkdddk', '.kkkkkkk.'],
};
// Sombra de uma cor = o tom seguinte da mesma rampa da paleta (nunca uma cor calculada fora dela)
const darken = hex => { for (const m of Object.values(WD_PALETTE)) { const t = Object.values(m.tones), i = t.indexOf(hex.toLowerCase()); if (i >= 0) return t[Math.min(t.length - 1, i + 1)]; } return WD_PAL.k; };
// Sprite dentro de algo ampliado (zoom/transform): corrige o tamanho para o resultado final ficar em escala inteira
function pxSnap(c, scale, factor) { const dpr = window.devicePixelRatio || 1, s = Math.max(1, Math.round(scale * factor * dpr)) / (factor * dpr); c.style.width = c.width * s + 'px'; c.style.height = c.height * s + 'px'; }
function face(hair, shirt, open, scale) {
  const pal = { ...PAL, h: hair, H: darken(hair), n: shirt, N: darken(shirt) };
  return sprite(['.....kkkkkk.....', '...kkhhhhhhkk...', '..khhhhhhhhhhk..', '.khhHhhhhhhhhhk.', '.khHssssssssHhk.', '.kHsssssssssSHk.',
                 '.kssskwsskwssSk.', '.kpssssssssspSk.', '.kssssssSsssSk..', open ? '..ksssRRRsssSk..' : '..kssssssssSk...',
                 open ? '..kSssrqrssSSk..' : '..kSsssRRssSSk...', '...kSSssssSSk...', '....kkSSSSkk....', '...kNnnwwnnNk...',
                 '..kNnnnwrwnnnNk.', '.kNnnnnwrwnnnnNk', '.kNnnnnnrnnnnnNk', '.kkkkkkkkkkkkkkk'], scale, pal);
}


/* ================= Sprites da v1 redesenhados na grade nova ================= */
// Mesmos nomes (SPR.x) para não mexer em quem usa; sprite() reconhece estes e desenha com a paleta WORKDAY.
const SPR_V2 = new Set();
function sprV2(name, rows) { SPR[name] = rows; SPR_V2.add(rows); }
sprV2('mail', SPR2.envelope); sprV2('virus', SPR2.virus); sprV2('coffee', SPR2.mug); sprV2('postit', SPR2.postit); sprV2('plant', SPR2.plant); sprV2('cat', SPR2.cat);
sprV2('tea', SPR2.mug.map(r => r.replace(/t/g, 'v').replace(/T/g, 'V').replace(/u/g, 'x').replace(/4/g, 'X')));
sprV2('phone', ['..kkkkkkkkkkkk..', '.krrrrrrrrrrrrk.', 'krRRkkkkkkkkRRqk', 'kRqk........kqqk', '.kk..kkkkkk..kk.', '....kRRRRRRk....', '...krRWWWWRqk...', '..krRWkWkWWRqk..',
  '..kRRWWWWWWRqk..', '.krRRWkWkWWRRqk.', '.kRRRRWWWWRRRqk.', 'kRRRRRRRRRRRRqqk', 'kqqqqqqqqqqqqqqk', '.kkkkkkkkkkkkkk.']);
sprV2('printer', ['...kkkkkkkkkk...', '...kWWWWWWWWk...', '...kWppppppWk...', '.kkkkkkkkkkkkkk.', 'kccccccccccccCek', 'kcCCCCCCCCCCCCek', 'kcCCCCCCCCCFCRek', 'kcCCCCCCCCCCCCek',
  'keeeeeeeeeeeeeEk', 'kEkkkkkkkkkkkkEk', '.kkWWWWWWWWWWkk.', '..kWppppppppWk..', '..kWWWWWWWWWWk..', '..kkkkkkkkkkkk..']);
sprV2('camera', ['..kkkkkkkkkkk...', '.kmmmmmmmmmmMk..', 'kmMkkkkkMMMMMjk.', 'kmkllLLkMMMMMjk.', 'kmklWLLkMRrMMjk.', 'kmkLLL7kMMMMMjk.', 'kmMkkkkkMMMMMjk.', '.kjjjjjjjjjjjk..',
  '..kkkkkkkkkkk...', '......kjk.......', '....kkjjjkk.....', '...kjjjjjjjk....', '....kkkkkkk.....']);
sprV2('hourglass', ['kkkkkkkkkkkk', 'k1111111112k', 'kkkkkkkkkkkk', '.kWyyyyyyWk.', '.kWYYYYYYlk.', '..kWYYYYlk..', '...kWYYlk...', '....kWlk....', '....klYk....', '...klWYYk...',
  '..klWYYYYk..', '.klWYYYYYYk.', '.klYYYYYYYk.', 'kkkkkkkkkkkk', 'k1111111112k', 'kkkkkkkkkkkk']);
sprV2('trash', ['....kkkk....', '....kmmk....', 'kkkkkkkkkkkk', 'kmmmmmmmmmjk', 'kkkkkkkkkkkk', '.kmMjMMjMjk.', '.kmMjMMjMjk.', '.kmMjMMjMjk.', '.kmMjMMjMjk.', '.kmMjMMjMjk.',
  '.kmMjMMjMjk.', '.kMMjMMjMjk.', '.kjjjjjjjjk.', '..kkkkkkkk..']);
sprV2('headphones', ['....kkkkkkkk....', '..kkjjjjjjjjkk..', '.kjkk......kkjk.', 'kjk..........kjk', 'kjk..........kjk', 'kjk..........kjk', 'kkkk........kkkk', 'kLlLk......kLlLk',
  'kLLLk......kLLLk', 'kLLLk......kLLLk', 'k777k......k777k', '.kkk........kkk.']);
sprV2('shield', ['kkkkkkkkkkkk', 'klllllllllLk', 'klLLLWWLLL7k', 'klLLLWWLLL7k', 'klLWWWWWWL7k', 'klLWWWWWWL7k', 'klLLLWWLLL7k', '.klLLWWLL7k.', '.klLLLLLL7k.', '..klLLLL7k..',
  '...klLL7k...', '....kL7k....', '.....kk.....']);
sprV2('frame', ['kkkkkkkkkkkkkk', 'kyYYYYYYYYYYzk', 'kYkkkkkkkkkkzk', 'kYkvvvvvvyvkzk', 'kYkvvvvvvvvkzk', 'kYkvvvvvvvvkzk', 'kYkGGvvvGGGkzk', 'kYkGGGGGGGhkzk', 'kYkhhhhhhhhkzk',
  'kYkkkkkkkkkkzk', 'kzzzzzzzzzzzZk', 'kkkkkkkkkkkkkk']);
sprV2('lamp', ['.....kkkkk....', '....kyYYYzk...', '...kyYYYYYzk..', '..kyYYYYYYYzk.', '..kkkkkkkkkkk.', '.....kWWk.....', '......kk......', '......kzk.....', '.....kzk......',
  '....kzk.......', '....kzk.......', '.....kzk......', '......kzk.....', '...kkkkkkkk...', '..kyYYYYYYzk..', '..kkkkkkkkkk..']);
sprV2('monitor', ['kkkkkkkkkkkkkkkk', 'kcCCCCCCCCCCCCek', 'kCkkkkkkkkkkkkek', 'kCkXXXXXXXXXXkek', 'kCkXVVVVXXXXXkek', 'kCkXXXXXXXXXXkek', 'kCkXFQvXXXXXXkek', 'kCkXFQvVXXXXXkek',
  'kCkkkkkkkkkkkkek', 'keeeeeeeeeeeFeEk', 'kkkkkkkkkkkkkkkk', '......kCek......', '....kkkkkkkk....', '....kCCCCCek....', '....kkkkkkkk....']);
sprV2('trophy', ['..kkkkkkkkkk..', 'kkkyYYYYYYzkkk', 'kYkyYYYYYYzkzk', 'kYkyYYYYYYzkzk', '.kkyYYYYYYzkk.', '...kyYYYYzk...', '....kyYYzk....', '.....kYzk.....', '.....kYzk.....',
  '....kyYYzk....', '...kkkkkkkk...', '...k333333k...', '...k444444k...', '...kkkkkkkk...']);
sprV2('bill', ['kkkkkkkkkkkkkkkk', 'kfffffffffffff9k', 'kfFFFFFFFFFFFF9k', 'kfFkFFFffFFFkF9k', 'kfFFFFfFFfFFFF9k', 'kfFFFFfFFfFFFF9k', 'kfFkFFFffFFFkF9k', 'kfFFFFFFFFFFFF9k',
  'k99999999999999k', 'kkkkkkkkkkkkkkkk']);
sprV2('card', ['kkkkkkkkkkkkkkkk', 'klllllllllllll7k', 'klLLLLLLLLLLLL7k', 'kkkkkkkkkkkkkkkk', 'klLLLLLLLLLLLL7k', 'klYYkLLLLLLLLL7k', 'klYzkLLLLLLLLL7k', 'klLLLWWWWLWWWL7k',
  'k77777777777777k', 'kkkkkkkkkkkkkkkk']);
sprV2('paycel', ['.kkkkkkk.', 'kJjjjjjJk', 'kjXXXXXjk', 'kjXvvvXjk', 'kjXvXvXjk', 'kjXvvvXjk', 'kjXXXXXjk', 'kjXFFFXjk', 'kjXXXXXjk', 'kjXXXXXjk', 'kjjjjjjjk', 'kjjjmjjjk', 'kJjjjjjJk', '.kkkkkkk.']);
sprV2('finger', ['...llllll...', '..l......l..', '.l..llll..l.', 'l..l....l..l', 'l.l..ll..l.l', 'l.l.l..l.l.l', 'l.l.l..l.l.l', 'l.l.l.l..l.l', 'l.l..l..l..l', 'l..l...l..l.',
  '.l..lll..l..', '..l.....l...', '...lllll....']);
Object.entries(DECOR_EXTRA).forEach(([id, d]) => sprV2(id, d.rows));
sprV2('cacto', SPR2.cacto); sprV2('radio', SPR2.radio); sprV2('aquario', SPR2.aquario);
