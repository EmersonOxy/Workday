/* ================= Pixel art ================= */
const PAL = {
  k: '#1d1d1b', w: '#ffffff', W: '#e8e4d8', x: '#c9c4b5',
  r: '#d94a3a', R: '#9e2e24', q: '#f58a78', g: '#4fb35c', G: '#2d7a3a', t: '#a6e88f',
  y: '#f2c14e', Y: '#c48a1c', u: '#fff1a8', b: '#4a72c4', B: '#2c4a8a', v: '#9ec0ff',
  c: '#7a4a28', C: '#4e2e16', o: '#e8873a', O: '#b85e1c', s: '#f0c09a', S: '#d1916a',
  h: '#4a3426', H: '#2e1f16', n: '#2a2f45', N: '#181b29', e: '#b8b8b8', l: '#c4c0b5', L: '#85827a', d: '#5c5a55', p: '#ec93a6',
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
function sprite(rows, scale = 3, pal = PAL) {
  const m = spriteMaster(rows, pal), c = document.createElement('canvas');
  c.className = 'sp';
  c.width = m.width; c.height = m.height;
  c.getContext('2d').drawImage(m, 0, 0);
  c.style.width = c.width * scale + 'px'; c.style.height = c.height * scale + 'px';
  return c;
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
const darken = (hex, f = 0.62) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, '0')).join('');
function face(hair, shirt, open, scale) {
  const pal = { ...PAL, h: hair, H: darken(hair), n: shirt, N: darken(shirt) };
  return sprite(['.....kkkkkk.....', '...kkhhhhhhkk...', '..khhhhhhhhhhk..', '.khhHhhhhhhhhhk.', '.khHssssssssHhk.', '.kHsssssssssSHk.',
                 '.kssskwsskwssSk.', '.kpssssssssspSk.', '.kssssssSsssSk..', open ? '..ksssRRRsssSk..' : '..kssssssssSk...',
                 open ? '..kSssrqrssSSk..' : '..kSsssRRssSSk...', '...kSSssssSSk...', '....kkSSSSkk....', '...kNnnwwnnNk...',
                 '..kNnnnwrwnnnNk.', '.kNnnnnwrwnnnnNk', '.kNnnnnnrnnnnnNk', '.kkkkkkkkkkkkkkk'], scale, pal);
}

