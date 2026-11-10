/* Parede fisica do escritorio — recursos embutidos para Pages e HTML unico offline.
   Tile 128x128, cores WD_PALETTE.wall, pixels de borda conectados. */
const ROOM_WALL_SAGE_PNG = '@asset-uri:parede/sage.png';
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
