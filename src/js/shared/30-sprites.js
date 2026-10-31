/* ================= Sprites v2 ================= */
// Grade: ícones 9×9 a 16×16, objetos 12×12 a 16×20, plantas e animais até 18×20. Luz vem de cima à esquerda.
// Contorno de 1 px em tinta (k); o lado iluminado usa o tom de brilho, o lado oposto o de sombra.
const SPR2 = {
  // Documento: cabeçalho F/f/9 recolorido por setor; orelha dobrada no canto
  doc: ['kkkkkkkkkkk...', 'kWFFFFFFFFkk..', 'kWFffFFFFFkpk.', 'kWFFFFFFFFkkkk', 'kW99999999wwPk', 'kWWWWWWWWWWwPk',
        'kWpppppppWWwPk', 'kWWWWWWWWWWwPk', 'kWpppppWpppwPk', 'kWWWWWWWWWWwPk', 'kWppppppppWwPk', 'kWWWWWWWWWWwPk',
        'kWpppppWWWWwPk', 'kWWWWWWWWWWwPk', 'kwwwwwwwwwwwPk', 'kPPPPPPPPPPPPk', 'kkkkkkkkkkkkkk'],
  // Símbolos brancos das bandejas e documentos (sem contorno: ficam sobre a cor do setor)
  glyphFin: ['..W..', '.WWWW', 'W.W..', '.WWW.', '..W.W', 'WWWW.', '..W..'],
  glyphHr:  ['.WWW.', '.WWW.', '..W..', 'WWWWW', '.WWW.', '.W.W.', '.W.W.'],
  glyphJur: ['.WWW.', 'W....', '.WWW.', 'W...W', '.WWW.', '....W', '.WWW.'],
  glyphTi:  ['WWWWWWW', 'W.....W', 'W.WW..W', 'W.....W', 'WWWWWWW', '...W...', '.WWWWW.'],
  mug: ['kkkkkkkkkkkkk...', 'kt4444444444tk..', 'ktTTTTTTTTTTuk..', 'ktTTTTTTTTTTukkk', 'ktTWWTTTTTTTuk.k', 'ktTWWTTTTTTTuk.k',
        'ktTTTTTTTTTTuk.k', 'ktTTTTTTTTTTukkk', 'ktTTTTTTTTTTuk..', 'ktTTTTTTTTTTuk..', 'kTTTTTTTTTTTuk..', '.kuuuuuuuuuuk...', '..kkkkkkkkkk....'],
  envelope: ['kkkkkkkkkkkkkk', 'kpWWWWWWWWWWpk', 'kWpWWWWWWWWpWk', 'kWWpWWWWWWpWWk', 'kWWWpWWWWpWWWk', 'kWWWWpRRpWWWWk',
             'kWWWWWqqWWWWWk', 'kwwwwwwwwwwwwk', 'kppppppppppppk', 'kkkkkkkkkkkkkk'],
  virus: ['..G...G...G..', '...k..k..k...', 'G..kkkkkkk..G', '.kkGGgGGGhkk.', '..kGgGGGGhhk.', 'GkGWkGGWkhkkG', '..kGGGGGGhhk.',
          '.kkGkRRRkhhkk', 'G.kGGhhhhhhk.', '..kkhhhhhhkk.', 'G..kkkkkkk..G', '...k..k..k...', '..G...G...G..'],
  postit: ['kkkkkkkkkk', 'kyyyyyyyyk', 'kYYYYYYYYk', 'kYZZZZYYYk', 'kYYYYYYYYk', 'kYZZZYYYYk', 'kYYYYYYYzk', 'kYYYYYYzzk', 'kzzzzzzzk.', 'kkkkkkkk..'],
  plant: ['......G.........', '.....GgG...G....', '....GgGhG.GgG...', '...GgGhhGGgGhG..', '..GgGhH.GgGhhG..', '..GGhH..GGhhH...',
          '.G..hGG.hH.G....', 'GgG..GgGhH.GgG..', 'GgGh.GgGh..GghG.', '.GhH..hGhhGGhH..', '..H...hHhGghH...', '.......hhhH.....',
          '..kkkkkkkkkkkk..', '..ktTTTTTTTTuk..', '..kuuuuuuuuuuk..', '...ktTTTTTTuk...', '...ktTTTTTTuk...', '...ktTTTTTuuk...',
          '....ktTTTTuk....', '....kkkkkkkk....'],
  cat: ['.kk.......kk..', '.k2k.....k2k..', '.k22kkkkk22k..', 'k22222222222k.', 'k22k22222k22k.', 'k222222s22222k',
        '.k2211112222k.', '..kk22222kk...', '.k2222222222k.', 'k221122222222k', 'k211112222233k', 'k211112222233k',
        'k221122222333k', 'k2k2k22223333k', '.kkkkkkkkkkkk.'],
  catTail: [['...k.', '..k3k', '..k3k', '.k3k.', '.k3k.', 'k3k..', 'k3k..', '.k...'],
            ['.k...', 'k3k..', '.k3k.', '.k3k.', '..k3k', '.k3k.', 'k3k..', '.k...'],
            ['..k..', '.k3k.', '.k3k.', '..k3k', '..k3k', '.k3k.', 'k3k..', '.k...']],
  // Caixa de papelão com os pertences (fim de carreira)
  box: ['..k.k.................', '.kGkGk.......kkkk.....', 'kGgGgGk......kWWk.....', 'kGgGhGk......kWwk.kkkk', '.kGhHk...kkk.kWwk.kTTk', '..khk...kRRRkkWwk.kTTk',
        'kkkkkkkkkkkkkkkkkkkkkk', 'k11111111111111111112k', 'k22222222222222222233k', 'kkkkkkkkkkkkkkkkkkkkkk', 'k22222222222222222233k', 'k22222WWWWWWWW2222233k',
        'k22222WppppppW2222233k', 'k22222WWWWWWWW2222233k', 'k22222222222222222233k', 'k33333333333333333333k', 'kkkkkkkkkkkkkkkkkkkkkk'],
  // Controle de videogame (botão secreto do arcade)
  pad: ['..kkkkkkkkkkkkk..', '.kCCCCCCCCCCCCCk.', 'kCCkkCCCCCCCRRCCk', 'kCkJJkCCCCCCRRCCk', 'kCCkkCCkkCCLLCYYk', 'kCCCCCCCCCCLLCYYk', 'kCCCCCCCCCCCCCCCk', 'keCCCCkkkkkCCCCek', '.keeeek...keeeek.', '..kkkk.....kkkk..'],
  steam: [['..w.....', '.w..w...', '..w..w..', '.w..w...', '..w.....', '...w....'], ['...w....', '..w..w..', '.w..w...', '..w..w..', '...w....', '..w.....'],
          ['..w..w..', '...w..w.', '..w..w..', '.w......', '..w.....', '.w......']],
};

// Itens novos da loja (ficam em cima do monitor)
SPR2.cacto = ['....kkk....', '...kgGhk...', '.k.kgWhk.k.', 'kgkkGGhkkhk', 'kGGkGWhkhhk', '.kGGGGhhhk.', '..kkGGhkk..', '...kGWhk...', '..kkkkkkk..', '..ktTTTuk..', '...ktTuk...', '...kkkkk...'];
SPR2.radio = ['.............k..', '............k...', '...........k....', 'kkkkkkkkkkkkkkkk', 'k11111111111112k', 'k1kkkkkk1kkkk13k', 'k1kpkpkk1kYYk13k', 'k1kkpkpk1kRYk13k', 'k1kkkkkk1kkkk13k', 'k33333333333333k', 'kkkkkkkkkkkkkkkk', '.kk..........kk.'];
SPR2.aquario = ['...kkkkkkkk...', '..kmmmmmmmmk..', '.kWllllllllLk.', 'kWlllllllllLLk', 'kllllOOOOllLLk', 'klllOOOOkOlLLk', 'kllllOOOOllLLk', 'kllllllllllLLk', 'klvlllllllvLLk', '.kGGgGllGGgLk.', '.kGhGGhhGGh7k.', '..k77777777k..', '...kkkkkkkk...'];
// Pelagens do gato: o desenho é o mesmo; a cor de cada pixel vem do padrão (listras, manchas, máscara)
const CAT_COATS = ['tricolor', 'cinza-tigrado', 'laranja-tigrado', 'laranja', 'preto', 'branco', 'frajola', 'siames', 'cinza', 'creme', 'tigrado-marrom', 'escaminha', 'bicolor', 'vaquinha'];
function catCoat(rows, coat, tail) {
  const key = 'cat:' + coat + ':' + rows.join('|');
  if (Pixel.cache.has(key)) return Pixel.cache.get(key);
  const P = WD_PAL, H = rows.length, W = Math.max(...rows.map(r => r.length)), c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const R = { laranja: [P[1], P[2], P[3]], cinza: [P.m, P.M, P.j], preto: [P.j, P.J, P[0]], branco: [P.W, P.W, P.p], creme: [P.W, P.w, P.p], escuro: [P[3], P[4], P.k] };
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (!WD_PAL[ch]) return;
    let col = WD_PAL[ch];
    const tone = ch === '1' ? 0 : ch === '2' ? 1 : ch === '3' ? 2 : -1;
    if (tone >= 0) {
      const stripe = !tail && (j + (i >> 2)) % 3 === 0 && j > 2, tstripe = tail && j % 2 === 0, white = !tail && (j > 9 || (j > 6 && i > 2 && i < 6));
      switch (coat) {
        case 'laranja-tigrado': col = stripe || tstripe ? R.laranja[2] : R.laranja[tone]; break;
        case 'cinza-tigrado': col = stripe || tstripe ? R.cinza[2] : R.cinza[tone]; break;
        case 'tricolor': col = white ? R.branco[tone] : (!tail && i > 7 && j < 7) || (tail && j > 4) ? R.preto[tone] : stripe || tstripe ? R.laranja[2] : R.laranja[tone]; break;
        case 'preto': col = R.preto[tone]; break;
        case 'branco': col = R.branco[tone]; break;
        case 'frajola': col = white ? R.branco[tone] : R.preto[tone]; break;
        case 'siames': col = tail || j < 2 || (j > 3 && j < 7 && i > 3 && i < 10) || j > 12 ? R.escuro[tone] : R.creme[tone]; break;
        default: col = R.laranja[tone];
      }
    }
    x.fillStyle = col; x.fillRect(i, j, 1, 1);
  }));
  Pixel.cache.set(key, c); return c;
}
SPR2.gear = ['..k.k.k..', '.kkmmmkk.', '.kmMMMmk.', 'kkMkkkMkk', '.kMk.kMk.', 'kkMkkkMkk', '.kmMMMjk.', '.kkjjjkk.', '..k.k.k..'];
SPR2.note = ['...kkkk', '...kYYk', '...kk.k', '...k..k', '...k..k', '.kkk.kk', 'kYYk.kk', 'kYYk...', '.kk....'];
