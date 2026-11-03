/* Parede fisica do escritorio — recursos embutidos para Pages e HTML unico offline.
   Tile 128x128, cores WD_PALETTE.wall, pixels de borda conectados. */
const ROOM_WALL_SAGE_PNG = 'data:image/png;base64,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';
const ROOM_WALL_IDS = ['classic', 'sage', ...Object.keys(ROOM_WALL_EXTRA_ASSETS)];
const ROOM_WALL_IMAGES = { sage: ROOM_WALL_SAGE_PNG, ...ROOM_WALL_EXTRA_ASSETS };
const ROOM_WALL_NAMES = {
  pt: { title: 'Parede do escritório', classic: 'Listrada clássica', sage: 'Verde retrô', losangos: 'Losangos vintage', floral: 'Floral clássico', jardim: 'Jardim verde', memphis: 'Memphis retrô', outono: 'Floral outono', ceu: 'Céu estrelado', gatinhos: 'Gatinhos', escritorio: 'Escritório retrô', lavanda: 'Jardim lavanda', deco: 'Art Déco', trim: 'Rodameio', original: 'Verde original', wood: 'Madeira', light: 'Claro' },
  en: { title: 'Office wall', classic: 'Classic stripes', sage: 'Retro green', losangos: 'Vintage diamonds', floral: 'Classic floral', jardim: 'Green garden', memphis: 'Retro Memphis', outono: 'Autumn floral', ceu: 'Starry sky', gatinhos: 'Cats', escritorio: 'Retro office', lavanda: 'Lavender garden', deco: 'Art Deco', trim: 'Wall trim', original: 'Original green', wood: 'Wood', light: 'Light' },
  es: { title: 'Pared de la oficina', classic: 'Rayas clásicas', sage: 'Verde retro', losangos: 'Rombos vintage', floral: 'Floral clásico', jardim: 'Jardín verde', memphis: 'Memphis retro', outono: 'Floral de otoño', ceu: 'Cielo estrellado', gatinhos: 'Gatitos', escritorio: 'Oficina retro', lavanda: 'Jardín lavanda', deco: 'Art Déco', trim: 'Zócalo', original: 'Verde original', wood: 'Madera', light: 'Claro' }
};
const RoomWall = {
  image: null, // Compatibilidade com a parede verde e os testes antigos.
  images: {},
  ready: false,
  ids: ROOM_WALL_IDS,
  names() { return ROOM_WALL_NAMES[CFG.lang] || ROOM_WALL_NAMES.pt; },
  loaded(id) {
    const image = this.images[id];
    return !!(image && image.complete && image.naturalWidth && image.naturalHeight);
  },
  refreshPreviews() {
    document.querySelectorAll('.room-wall-opt canvas').forEach(c => {
      this.preview(c, c.dataset.roomWall, (typeof hw === 'function' ? hw().roomTrim : 'original'));
    });
  },
  init() {
    for (const [id, src] of Object.entries(ROOM_WALL_IMAGES)) {
      const img = new Image();
      this.images[id] = img;
      img.onload = () => {
        if (id === 'sage') { this.image = img; this.ready = true; }
        if (typeof OFFICE !== 'undefined') { OFFICE.key = ''; OFFICE.last = 0; }
        this.refreshPreviews();
      };
      img.onerror = () => { if (id === 'sage') this.ready = false; };
      img.src = src;
    }
  },
  paint(x, w, h, style) {
    const P = WD_PAL;
    if (style !== 'classic' && this.loaded(style)) {
      x.save();
      x.imageSmoothingEnabled = false;
      const pat = x.createPattern(this.images[style], 'repeat');
      if (pat) { x.fillStyle = pat; x.fillRect(0, 0, w, h); x.restore(); return; }
      x.restore();
    }
    // Original preservado em saves antigos e fallback caso um PNG ainda carregue.
    x.fillStyle = P.A; x.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 12) {
      x.fillStyle = P.a; x.fillRect(i, 0, 1, h);
      Pixel.dither(x, i + 1, 0, 1, h, P.a, 1);
    }
  },
  trim(x, w, back, trim) {
    const P = WD_PAL;
    const colors = trim === 'wood' ? [P[3], P[4], P[3]] : trim === 'light' ? [P.e, P.C, P.e] : [P.b, P.B, P.b];
    x.fillStyle = colors[0]; x.fillRect(0, back - 22, w, 1);
    x.fillStyle = colors[1]; x.fillRect(0, back - 21, w, 21);
    x.fillStyle = colors[2]; x.fillRect(0, back - 20, w, 1);
  },
  preview(c, style = 'classic', trim = 'original') {
    if (!c) return;
    const x = c.getContext('2d'), w = c.width, h = c.height;
    x.clearRect(0, 0, w, h);
    x.imageSmoothingEnabled = false;
    if (this.loaded(style)) {
      const img = this.images[style];
      // Miniatura mostra o padrão inteiro, em vez de cortar os primeiros 64 pixels do tile.
      const previewH = Math.max(h, Math.round(w * img.naturalHeight / img.naturalWidth));
      x.drawImage(img, 0, 0, w, previewH);
    } else this.paint(x, w, h, style);
    this.trim(x, w, h + 16, trim);
  }
};
RoomWall.init();
