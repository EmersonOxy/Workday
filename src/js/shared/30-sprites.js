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
  steam: [['..w.....', '.w..w...', '..w..w..', '.w..w...', '..w.....', '...w....'], ['...w....', '..w..w..', '.w..w...', '..w..w..', '...w....', '..w.....'],
          ['..w..w..', '...w..w.', '..w..w..', '.w......', '..w.....', '.w......']],
};
