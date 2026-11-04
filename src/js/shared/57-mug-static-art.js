/* Caneca Workday: usa a imagem enviada pelo criador, adaptada a sprite 40x40.
   Padrão original: cerâmica creme, faixa azul. Nenhuma arte é gerada em tempo de execução.
   Recoloração opcional altera apenas as cores do mesmo sprite, para futura personalização.
   Sprite em data URI para GitHub Pages e versão HTML única offline. */
const MUG_STATIC_PNG = 'data:image/png;base64,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';
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
