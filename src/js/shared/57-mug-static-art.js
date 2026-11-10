/* Caneca Workday: usa a imagem enviada pelo criador, adaptada a sprite 40x40.
   Padrão original: cerâmica creme, faixa azul. Nenhuma arte é gerada em tempo de execução.
   Recoloração opcional altera apenas as cores do mesmo sprite, para futura personalização.
   Sprite em data URI para GitHub Pages e versão HTML única offline. */
const MUG_STATIC_PNG = '@asset-uri:caneca/caneca.png';
const MUG_COLOR_THEMES = Object.freeze({
  original: null,
  azul:    { ceramic: [190, 211, 235], stripe: [[66, 110, 184], [44, 73, 129], [103, 137, 195]] },
  verde:   { ceramic: [198, 225, 193], stripe: [[71, 136, 98], [48, 94, 70], [111, 167, 124]] },
  rosa:    { ceramic: [239, 202, 213], stripe: [[182, 93, 126], [129, 65, 94], [207, 137, 156]] },
  lilas:   { ceramic: [222, 207, 233], stripe: [[137, 95, 164], [94, 65, 127], [171, 135, 187]] },
  amarelo: { ceramic: [244, 226, 181], stripe: [[194, 132, 54], [139, 86, 39], [219, 166, 89]] },
  grafite: { ceramic: [184, 191, 201], stripe: [[85, 98, 116], [50, 59, 74], [125, 139, 153]] }
});
const MUG_ORIGINAL_STRIPE = [[81, 110, 149], [64, 82, 109], [111, 125, 148]];
const MugStatic = {
  size: 40, image: null, tintedImage: null, ready: false, color: 'original',
  colors: Object.keys(MUG_COLOR_THEMES),
  draw(ctx, x, baseline) {
    if (!this.ready) return false;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.tintedImage || this.image, Math.round(x), Math.round(baseline - this.size));
    ctx.restore();
    return true;
  },
  // Preparado para uma futura opção na tela Personalizar:
  // MugStatic.setColor('verde') / MugStatic.setColor('original').
  setColor(key) {
    if (!Object.prototype.hasOwnProperty.call(MUG_COLOR_THEMES, key)) return false;
    this.color = key;
    if (!this.ready) return true;
    const theme = MUG_COLOR_THEMES[key];
    if (!theme) {
      this.tintedImage = null; // a versão original permanece pixel a pixel idêntica à enviada
    } else {
      const cv = document.createElement('canvas');
      cv.width = cv.height = this.size;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.image, 0, 0);
      const img = ctx.getImageData(0, 0, this.size, this.size), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const swatch = MUG_ORIGINAL_STRIPE.findIndex(c => r === c[0] && g === c[1] && b === c[2]);
        if (swatch !== -1) {
          for (let c = 0; c < 3; c++) d[i + c] = theme.stripe[swatch][c];
        } else if (r >= 160 && g >= 120 && b >= 90 && r >= g && g >= b &&
                   r - g <= 40 && g - b <= 40) {
          const origin = [233, 212, 190];
          for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, theme.ceramic[c] + d[i + c] - origin[c]));
        }
      }
      ctx.putImageData(img, 0, 0);
      this.tintedImage = cv;
    }
    if (typeof OFFICE !== 'undefined') { OFFICE.last = 0; OFFICE.key = ''; }
    return true;
  },
  init() {
    const im = new Image();
    this.image = im;
    im.onload = () => {
      if (im.naturalWidth !== this.size || im.naturalHeight !== this.size) return;
      this.ready = true;
      this.setColor(this.color);
    };
    im.onerror = () => console.warn('Falha ao carregar a caneca; mantendo o desenho original.');
    im.src = MUG_STATIC_PNG;
  }
};
MugStatic.init();
